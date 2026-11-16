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
  createClaude,
  createOpenRouter
} from '../server/lib/team-chat.mjs';
import { TEAM_ROLES } from '../shared/team-roles.mjs';

const env = {
  ANTHROPIC_API_KEY: 'sk-ant-test-key-0123456789',
  TEAM_CHAT_ID: '-100',
  TEAM_OWNER_ID: '7',
  TEAM_WEBHOOK_SECRET: 's',
  GITHUB_TOKEN: 'g',
  GITHUB_REPO: 'o/r',
  TEAM_DAILY_MESSAGES: '3',
  ...Object.fromEntries(TEAM_ROLES.map(r => [r.env, `tok-${r.id}-0123456789abcdef`]))
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
  // заглушки вроде «…» не считаются токенами
  assert.equal(teamConfig({ ...env, TEAM_BOT_FINANCE: '…' }).bots.finance, '');
  assert.equal(teamConfig({ ...env, ANTHROPIC_API_KEY: '…' }).enabled, false);
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
    ['seo', 'marketer', 'finance'].map(
      id => `https://api.telegram.org/bottok-${id}-0123456789abcdef/sendMessage`
    )
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

test('OpenRouter: chosen by key, request shape, JSON route and refusal', async () => {
  const cfg = teamConfig({
    ...env,
    ANTHROPIC_API_KEY: '',
    OPENROUTER_API_KEY: 'sk-or-test-key-0123456789',
    SITE_URL: 'https://x.uz'
  });
  assert.equal(cfg.provider, 'openrouter');
  assert.equal(cfg.model, 'anthropic/claude-opus-5.5');
  assert.equal(cfg.enabled, true);
  const reqs = [];
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    reqs.push({ url, headers: init.headers, body });
    const content = body.response_format
      ? '```json\n{"responders":["finance"],"has_task":false,"task_title":"","task_role":"pm","task_details":""}\n```'
      : body.messages[1].content.includes('отказ')
        ? null
        : 'Посчитаю';
    return {
      ok: true,
      json: async () => ({
        choices: [
          { message: { content }, finish_reason: content === null ? 'content_filter' : 'stop' }
        ],
        usage: { prompt_tokens: 50, completion_tokens: 5 }
      })
    };
  };
  const llm = createOpenRouter(cfg, fetcher);
  const route = await llm.route([{ author: 'ceo', text: 'сколько стоит?' }]);
  assert.deepEqual(route.plan.responders, ['finance']);
  assert.deepEqual(route.usage, { input: 50, output: 5 });
  assert.equal(reqs[0].url, 'https://openrouter.ai/api/v1/chat/completions');
  assert.equal(reqs[0].headers.Authorization, 'Bearer sk-or-test-key-0123456789');
  assert.equal(reqs[0].body.model, 'anthropic/claude-opus-5.5');
  assert.equal(reqs[0].body.reasoning.effort, 'low');
  assert.equal(reqs[0].body.response_format.json_schema.strict, true);
  assert.match(reqs[0].body.messages[0].content, /Razrabotka Tashkent/);
  assert.equal((await llm.reply('finance', [{ author: 'ceo', text: 'вопрос' }])).text, 'Посчитаю');
  assert.equal((await llm.reply('finance', [{ author: 'ceo', text: 'отказ' }])).text, '');
  const bad = createOpenRouter(cfg, async () => ({
    ok: false,
    status: 402,
    json: async () => ({ error: { message: 'Insufficient credits' } })
  }));
  await assert.rejects(bad.reply('pm', []), /402: Insufficient credits/);
  const plain = createOpenRouter({ ...cfg, model: 'openai/gpt-4o', effort: 'none' }, fetcher);
  await plain.reply('pm', [{ author: 'ceo', text: 'вопрос' }]);
  assert.equal(reqs.at(-1).body.model, 'openai/gpt-4o');
  assert.equal(reqs.at(-1).body.reasoning, undefined);
});

test('roles without their own bot speak through pm with a label', async () => {
  const t = setup({ plan: { responders: ['developer', 'pm'], has_task: false } });
  t.cfg.bots.developer = '';
  await handleTeamUpdate(update('оценка?'), {
    store: t.store,
    cfg: t.cfg,
    llm: t.llm,
    fetcher: t.fetcher
  });
  assert.equal(t.sent[0].url, 'https://api.telegram.org/bottok-pm-0123456789abcdef/sendMessage');
  assert.equal(t.sent[0].body.text, 'Разработчик: ответ developer');
  assert.equal(t.sent[1].body.text, 'ответ pm');
  t.done();
});
