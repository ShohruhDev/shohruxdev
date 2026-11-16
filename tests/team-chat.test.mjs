import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore } from '../server/lib/store.mjs';
import {
  teamConfig,
  handleTeamUpdate,
  mentionedRoles,
  transcript,
  createClaude
} from '../server/lib/team-chat.mjs';
import { TEAM_ROLES } from '../shared/team-roles.mjs';

const env = {
  ANTHROPIC_API_KEY: 'k',
  TEAM_CHAT_ID: '-100',
  TEAM_OWNER_ID: '7',
  TEAM_WEBHOOK_SECRET: 's',
  GITHUB_TOKEN: 'g',
  GITHUB_REPO: 'o/r',
  TEAM_DAILY_MESSAGES: '3',
  ...Object.fromEntries(TEAM_ROLES.map(r => [r.env, `tok-${r.id}`]))
};
let n = 0;
const update = (text, extra = {}) => ({
  update_id: ++n,
  message: { text, chat: { id: -100 }, from: { id: 7 }, ...extra }
});

function setup({ plan = { responders: ['marketer'], has_task: false }, replies = {} } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'team-'));
  const store = openStore(join(dir, 'db.sqlite'));
  const cfg = teamConfig(env);
  const calls = [];
  const sent = [];
  const llm = {
    async route(history) {
      calls.push(['route', history.length]);
      return { plan, usage: { input: 10, output: 5 } };
    },
    async reply(roleId) {
      calls.push(['reply', roleId]);
      return { text: replies[roleId] ?? `ответ ${roleId}`, usage: { input: 20, output: 7 } };
    }
  };
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    sent.push({ url, body });
    if (url.includes('api.github.com'))
      return {
        ok: true,
        status: 201,
        json: async () => ({ number: 42, html_url: 'https://gh/42' })
      };
    return { ok: true, json: async () => ({ ok: true }) };
  };
  const done = () => {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  };
  return { store, cfg, llm, fetcher, calls, sent, done };
}

test('config is enabled only with key, chat, owner, secret and pm bot', () => {
  assert.equal(teamConfig(env).enabled, true);
  assert.equal(teamConfig({ ...env, ANTHROPIC_API_KEY: '' }).enabled, false);
  assert.equal(teamConfig({ ...env, TEAM_BOT_PM: '' }).enabled, false);
  assert.equal(teamConfig(env).model, 'claude-opus-5-5');
});

test('mentions and transcript', () => {
  assert.deepEqual(mentionedRoles('@seo и @developer, @seo, @nobody'), ['seo', 'developer']);
  assert.equal(
    transcript([
      { author: 'ceo', text: 'привет' },
      { author: 'seo', text: 'ок' }
    ]),
    '[CEO]: привет\n[SEO-специалист @seo]: ок'
  );
});

test('ignores other chats, other people, bots and duplicates', async () => {
  const t = setup();
  const deps = { store: t.store, cfg: t.cfg, llm: t.llm, fetcher: t.fetcher };
  assert.equal((await handleTeamUpdate(update('x', { chat: { id: 1 } }), deps)).status, 'ignored');
  assert.equal((await handleTeamUpdate(update('x', { from: { id: 8 } }), deps)).status, 'ignored');
  assert.equal(
    (await handleTeamUpdate(update('x', { from: { id: 7, is_bot: true } }), deps)).status,
    'ignored'
  );
  const u = update('привет');
  assert.equal((await handleTeamUpdate(u, deps)).status, 'answered');
  assert.equal((await handleTeamUpdate(u, deps)).status, 'duplicate');
  t.done();
});

test('router picks roles, CEO mentions go first, replies are sent by the role bot', async () => {
  const t = setup({ plan: { responders: ['marketer', 'finance'], has_task: false } });
  const r = await handleTeamUpdate(update('@seo что по трафику?'), {
    store: t.store,
    cfg: t.cfg,
    llm: t.llm,
    fetcher: t.fetcher
  });
  assert.deepEqual(r.spoke, ['seo', 'marketer', 'finance']);
  assert.deepEqual(
    t.sent.map(s => s.url),
    ['seo', 'marketer', 'finance'].map(id => `https://api.telegram.org/bottok-${id}/sendMessage`)
  );
  assert.equal(t.sent[0].body.chat_id, '-100');
  assert.deepEqual(
    t.store.teamHistory().map(m => m.author),
    ['ceo', 'seo', 'marketer', 'finance']
  );
  t.done();
});

test('roles pull in colleagues by @id, skip with ПРОПУСК, and stop at the turn limit', async () => {
  const t = setup({
    plan: { responders: ['pm'], has_task: false },
    replies: {
      pm: 'Нужна оценка @developer и @finance',
      developer: 'Два дня, @seo проверит теги',
      finance: 'ПРОПУСК',
      seo: '@marketer подключись'
    }
  });
  const r = await handleTeamUpdate(update('делаем лендинг?'), {
    store: t.store,
    cfg: t.cfg,
    llm: t.llm,
    fetcher: t.fetcher
  });
  // pm → developer → finance (пропуск) → seo; marketer уже за лимитом 4 ходов
  assert.deepEqual(
    t.calls.filter(c => c[0] === 'reply').map(c => c[1]),
    ['pm', 'developer', 'finance', 'seo']
  );
  assert.deepEqual(r.spoke, ['pm', 'developer', 'seo']);
  t.done();
});

test('task becomes a GitHub issue and pm confirms it', async () => {
  const t = setup({
    plan: {
      responders: ['pm'],
      has_task: true,
      task_title: 'Лендинг для акции',
      task_role: 'developer',
      task_details: 'Сделать лендинг, готово когда опубликован в PR'
    }
  });
  const r = await handleTeamUpdate(update('Задача: лендинг для акции'), {
    store: t.store,
    cfg: t.cfg,
    llm: t.llm,
    fetcher: t.fetcher
  });
  assert.equal(r.task.number, 42);
  const gh = t.sent.find(s => s.url.includes('api.github.com'));
  assert.equal(gh.url, 'https://api.github.com/repos/o/r/issues');
  assert.deepEqual(gh.body.labels, ['team-task', 'role:developer']);
  assert.match(t.sent.at(-1).body.text, /#42/);
  t.done();
});

test('daily limit and /status', async () => {
  const t = setup();
  const deps = { store: t.store, cfg: t.cfg, llm: t.llm, fetcher: t.fetcher };
  for (let i = 0; i < 3; i++) await handleTeamUpdate(update(`вопрос ${i}`), deps);
  const before = t.calls.length;
  assert.equal((await handleTeamUpdate(update('ещё'), deps)).status, 'limit');
  assert.equal(t.calls.length, before, 'no Claude calls over the limit');
  assert.match(t.sent.at(-1).body.text, /лимит/);
  assert.equal((await handleTeamUpdate(update('/status'), deps)).status, 'status');
  assert.match(t.sent.at(-1).body.text, /3 из 3/);
  t.done();
});

test('createClaude: structured routing, refusal and request shape', async () => {
  const requests = [];
  const respond = content => ({
    content: [{ type: 'text', text: content }],
    stop_reason: 'end_turn',
    usage: { input_tokens: 100, output_tokens: 10 }
  });
  const fake = {
    beta: {
      messages: {
        create: async req => {
          requests.push(req);
          if (req.output_config.format)
            return respond(JSON.stringify({ responders: ['seo'], has_task: false }));
          return req.messages[0].content.includes('отказ')
            ? { content: [], stop_reason: 'refusal', usage: { input_tokens: 1, output_tokens: 0 } }
            : respond('Готово');
        }
      }
    }
  };
  const llm = createClaude(teamConfig(env), fake);
  const route = await llm.route([{ author: 'ceo', text: 'вопрос' }]);
  assert.deepEqual(route.plan.responders, ['seo']);
  assert.equal(requests[0].model, 'claude-opus-5-5');
  assert.equal(requests[0].output_config.effort, 'low');
  assert.equal(requests[0].output_config.format.type, 'json_schema');
  assert.equal(requests[0].fallbacks, 'default');
  assert.equal(requests[0].system[0].cache_control.type, 'ephemeral');
  assert.equal((await llm.reply('seo', [{ author: 'ceo', text: 'вопрос' }])).text, 'Готово');
  assert.equal((await llm.reply('seo', [{ author: 'ceo', text: 'отказ' }])).text, '');
});
