import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore } from '../server/lib/store.mjs';
import { TEAM_PEOPLE } from '../shared/team-people.mjs';
import { TEAM_ROLES } from '../shared/team-roles.mjs';
import { teamConfig } from '../server/lib/team-chat.mjs';
import {
  ROUTINES,
  fireRoutine,
  askPerson,
  assignTask,
  githubOverview,
  nextRun,
  officeOverview,
  usageCost
} from '../server/lib/team-panel.mjs';

const dir = mkdtempSync(join(tmpdir(), 'office-'));
const store = openStore(join(dir, 'db.sqlite'));
test.after(() => {
  store.close();
  rmSync(dir, { recursive: true, force: true });
});
const cfg = teamConfig({
  OPENROUTER_API_KEY: 'sk-or-test-0123456789abcdef',
  TEAM_CHAT_ID: '-100',
  TEAM_OWNER_ID: '7',
  TEAM_WEBHOOK_SECRET: 's',
  TEAM_BOT_PM: 'tok-pm-0123456789abcdef',
  GITHUB_TOKEN: 'g',
  GITHUB_REPO: 'o/r'
});
const json = (data, status = 200) => ({ ok: status < 300, status, json: async () => data });

test('каждый агент из .claude/agents и каждая роль чата — персонаж офиса', () => {
  const ids = TEAM_PEOPLE.map(p => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const f of readdirSync('.claude/agents')) assert.ok(ids.includes(f.replace('.md', '')), f);
  for (const r of TEAM_ROLES) assert.ok(ids.includes(r.id), r.id);
  for (const p of TEAM_PEOPLE) {
    assert.ok(p.persona && p.title && p.duties && p.prompt.length > 40, p.id);
    assert.match(p.color, /^#[0-9a-f]{6}$/i);
  }
});

test('расписание: следующий запуск циклов', () => {
  const daily = ROUTINES.find(r => r.id === 'daily');
  // Пятница 10:00 UTC → понедельник 04:00 UTC.
  assert.equal(nextRun(daily, new Date('2026-11-20T10:00:00Z')), '2026-11-23T04:00:00.000Z');
  assert.equal(nextRun(daily, new Date('2026-11-16T03:00:00Z')), '2026-11-16T04:00:00.000Z');
});

test('стоимость: кэш дешевле обычного входа', () => {
  assert.equal(usageCost({ input: 1e6, cached: 0, output: 0 }), 4);
  assert.equal(usageCost({ input: 1e6, cached: 1e6, output: 1e6 }), 20.4);
});

test('GitHub: задачи по ролям, PR с CI и меткой ревью', async () => {
  const calls = [];
  const gh = await githubOverview(cfg, async url => {
    calls.push(url);
    if (url.includes('/issues?'))
      return json([
        {
          number: 5,
          title: 'Посты',
          html_url: 'u5',
          created_at: 't',
          labels: [{ name: 'team-task' }, { name: 'role:smm' }]
        },
        { number: 6, title: 'PR', pull_request: {}, labels: [] }
      ]);
    if (url.includes('state=open'))
      return json([
        {
          number: 9,
          title: 'Фича',
          html_url: 'u9',
          draft: false,
          created_at: 't',
          head: { sha: 'abc', ref: 'b' },
          body: 'Нужно ревью владельца'
        }
      ]);
    if (url.includes('state=closed'))
      return json([
        { number: 8, title: 'Старое', html_url: 'u8', merged_at: '2026-11-15T00:00:00Z' },
        { number: 7, merged_at: null }
      ]);
    if (url.includes('/actions/runs'))
      return json({ workflow_runs: [{ status: 'completed', conclusion: 'success' }] });
    return json({}, 404);
  });
  assert.deepEqual(gh.tasks, [
    {
      number: 5,
      title: 'Посты',
      url: 'u5',
      createdAt: 't',
      role: 'smm',
      urgent: false,
      inProgress: false
    }
  ]);
  assert.equal(gh.prs[0].ci, 'success');
  assert.equal(gh.prs[0].needsReview, true);
  assert.deepEqual(
    gh.merged.map(p => p.number),
    [8]
  );
  assert.equal(gh.error, '');
  assert.ok(calls.every(u => u.startsWith('https://api.github.com/repos/o/r/')));
});

test('сводка: статусы персонажей, заявки, лента', () => {
  store.teamAdd('ceo', 'Сообщение владельца');
  store.teamAdd('smm', 'Готовлю контент-план');
  store.saveLead({ name: 'Иван', direction: 'site', contact: '+998' });
  const o = officeOverview({
    store,
    cfg,
    gh: {
      tasks: [{ number: 5, title: 'Посты', url: 'u', createdAt: 't', role: 'smm' }],
      prs: [],
      merged: [],
      error: ''
    }
  });
  const smm = o.people.find(p => p.id === 'smm');
  assert.equal(smm.status, 'busy');
  assert.equal(smm.lastSaid.text, 'Готовлю контент-план');
  assert.equal(o.people.find(p => p.id === 'legal').status, 'free');
  assert.equal(o.people.find(p => p.id === 'pm').hasBot, true);
  assert.equal(o.leads.week, 1);
  assert.equal(o.leads.latest[0].name, 'Иван');
  assert.equal(o.feed[0].who, 'smm');
  assert.equal(o.feed[1].who, 'owner');
  assert.equal(o.people.find(p => p.id === 'ceo').lastSaid, null);
  assert.equal(o.routines.length, 2);
  assert.ok(!JSON.stringify(o).includes('sk-or-test'), 'ключи не уходят в браузер');
});

test('поручить задачу: Issue с меткой роли и заметка в чат', async () => {
  const sent = [];
  const r = await assignTask(
    { personId: 'copywriter', title: '  Текст для лендинга  ', details: 'RU и UZ' },
    {
      store,
      cfg,
      fetcher: async (url, init) => {
        if (url.includes('/issues?')) return json([]);
        sent.push({ url, body: JSON.parse(init.body) });
        return url.includes('api.github.com')
          ? json({ number: 12, html_url: 'u12' }, 201)
          : json({ ok: true });
      }
    }
  );
  assert.deepEqual(r, { number: 12, url: 'u12', urgent: false, fired: '', fireError: '' });
  assert.deepEqual(sent[0].body.labels, ['team-task', 'role:copywriter']);
  assert.equal(sent[0].body.title, 'Текст для лендинга');
  assert.match(sent[1].url, /api\.telegram\.org\/bottok-pm/);
  assert.match(sent[1].body.text, /Нигора/);
  await assert.rejects(
    assignTask({ personId: 'nobody', title: 'xxx' }, { store, cfg }),
    /Нет такого/
  );
  await assert.rejects(
    assignTask({ personId: 'qa', title: 'a' }, { store, cfg }),
    /несколько слов/
  );
});

test('спросить специалиста: история, персона, лимит', async () => {
  const prompts = [];
  const llm = {
    chat: async (system, user) => {
      prompts.push({ system, user });
      return { text: 'Сделаю к пятнице.', usage: { input: 100, output: 10, cached: 50 } };
    }
  };
  const now = new Date('2026-11-16T10:00:00Z');
  const r = await askPerson(
    { personId: 'legal', text: 'Нужен NDA?' },
    { store, cfg, llm, now, dailyLimit: 2 }
  );
  assert.equal(r.answer, 'Сделаю к пятнице.');
  assert.match(prompts[0].system, /Тебя зовут Гульнора/);
  assert.match(prompts[0].system, /База знаний команды/);
  assert.deepEqual(
    store.dmHistory('legal').map(m => m.author),
    ['owner', 'legal']
  );
  await askPerson({ personId: 'legal', text: 'А сроки?' }, { store, cfg, llm, now, dailyLimit: 2 });
  assert.match(
    prompts[1].user,
    /\[CEO \(владелец\)\]: Нужен NDA\?\n\[Гульнора\]: Сделаю к пятнице\.\n\[CEO \(владелец\)\]: А сроки\?/
  );
  await assert.rejects(
    askPerson({ personId: 'legal', text: 'Ещё' }, { store, cfg, llm, now, dailyLimit: 2 }),
    /Лимит/
  );
  assert.ok(store.usageSince('2026-11-16').calls >= 2);
});

test('Азиз (id ceo) и владелец в личном чате не путаются', async () => {
  const llm = {
    chat: async () => ({ text: 'План готов.', usage: { input: 1, output: 1, cached: 0 } })
  };
  await askPerson({ personId: 'ceo', text: 'Дай план' }, { store, cfg, llm, dailyLimit: 100 });
  assert.deepEqual(
    store.dmHistory('ceo').map(m => m.author),
    ['owner', 'ceo']
  );
});

test('миграция: старые реплики владельца (author ceo) переписываются в owner', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const file = join(dir, 'old.sqlite');
  const db = new DatabaseSync(file);
  db.exec(`CREATE TABLE team_dm(id INTEGER PRIMARY KEY, at TEXT NOT NULL, person TEXT NOT NULL,
    author TEXT NOT NULL, text TEXT NOT NULL)`);
  const add = db.prepare('INSERT INTO team_dm(at,person,author,text) VALUES(?,?,?,?)');
  add.run('t1', 'ceo', 'ceo', 'вопрос владельца');
  add.run('t2', 'ceo', 'ceo', 'ответ Азиза');
  add.run('t3', 'qa', 'ceo', 'вопрос Саиду');
  add.run('t4', 'qa', 'qa', 'ответ Саида');
  db.close();
  const old = openStore(file);
  assert.deepEqual(
    old.dmHistory('ceo').map(m => m.author),
    ['owner', 'ceo']
  );
  assert.deepEqual(
    old.dmHistory('qa').map(m => m.author),
    ['owner', 'qa']
  );
  old.close();
});

test('срочная задача: метка priority:high и запуск облачного цикла с номером задачи', async () => {
  const calls = [];
  const fetcher = async (url, init) => {
    if (url.includes('/issues?')) return json([]);
    calls.push({ url, init });
    if (url.includes('/issues')) return json({ number: 50, html_url: 'u50' }, 201);
    if (url.includes('/fire'))
      return json({ type: 'routine_fire', claude_code_session_url: 'https://claude.ai/code/s1' });
    return json({ ok: true });
  };
  const fire = { token: 'sk-ant-oat01-test-0123456789', routineId: 'trig_01ABC' };
  const r = await assignTask(
    { personId: 'seo', title: 'Срочно Bing', urgent: true },
    { store, cfg, fire, fetcher }
  );
  assert.equal(r.fired, 'https://claude.ai/code/s1');
  assert.deepEqual(JSON.parse(calls[0].init.body).labels, [
    'team-task',
    'role:seo',
    'priority:high'
  ]);
  const f = calls.find(c => c.url.includes('/fire'));
  assert.equal(f.url, 'https://api.anthropic.com/v1/claude_code/routines/trig_01ABC/fire');
  assert.equal(f.init.headers.Authorization, 'Bearer sk-ant-oat01-test-0123456789');
  assert.match(JSON.parse(f.init.body).text, /issue #50/);

  // Без токена задача создаётся, а запуск честно сообщает причину.
  const r2 = await assignTask(
    { personId: 'seo', title: 'Ещё срочно', urgent: true },
    { store, cfg, fire: { token: '', routineId: 'trig_01ABC' }, fetcher }
  );
  assert.equal(r2.number, 50);
  assert.match(r2.fireError, /ROUTINE_FIRE_TOKEN/);
});

test('запуск цикла: 429 — понятное сообщение', async () => {
  await assert.rejects(
    fireRoutine({ token: 'sk-ant-oat01-test-0123456789', routineId: 'trig_01ABC' }, 'x', async () =>
      json({}, 429)
    ),
    /Лимит запусков/
  );
});

function ghFetcher(sent, existing = []) {
  return async (url, init = {}) => {
    if (url.includes('/issues?')) return json(existing);
    sent.push({ url, body: init.body ? JSON.parse(init.body) : null });
    return url.includes('api.github.com')
      ? json({ number: 31, html_url: 'https://github.com/o/r/issues/31' }, 201)
      : json({ ok: true });
  };
}

test('личный чат: «задача: …» заводит Issue с role: и отвечает ссылкой', async () => {
  const sent = [];
  const prompts = [];
  const llm = {
    chat: async (system, user) => {
      prompts.push(user);
      return { text: 'Не должен вызываться', usage: { input: 1, output: 1, cached: 0 } };
    }
  };
  const r = await askPerson(
    { personId: 'seo', text: 'задача: Проверить sitemap\nСверить UZ-страницы с hreflang' },
    { store, cfg, llm, fetcher: ghFetcher(sent), dailyLimit: 100 }
  );
  const issue = sent.find(s => s.url.endsWith('/issues'));
  assert.equal(issue.body.title, 'Проверить sitemap');
  assert.deepEqual(issue.body.labels, ['team-task', 'role:seo']);
  assert.match(issue.body.body, /hreflang/);
  assert.match(r.answer, /#31/);
  assert.match(r.answer, /https:\/\/github\.com\/o\/r\/issues\/31/);
  assert.doesNotMatch(r.answer, /принял/i);
  assert.equal(r.task.number, 31);
  assert.equal(prompts.length, 0);
  assert.equal(store.dmHistory('seo').at(-1).text, r.answer);
});

test('личный чат: «делаем» берёт заголовок и детали из обсуждения', async () => {
  const sent = [];
  const llm = {
    chat: async (system, user) =>
      user.includes('JSON')
        ? {
            text: '{"title":"Посты про калькулятор","details":"3 поста, RU и UZ. Готово: черновики в бэклоге."}',
            usage: { input: 1, output: 1, cached: 0 }
          }
        : {
            text: 'Предлагаю три поста про калькулятор.',
            usage: { input: 1, output: 1, cached: 0 }
          }
  };
  const deps = { store, cfg, llm, fetcher: ghFetcher(sent), dailyLimit: 100 };
  await askPerson({ personId: 'smm', text: 'Что с постами?' }, deps);
  const r = await askPerson({ personId: 'smm', text: 'Давайте, делаем' }, deps);
  const issue = sent.find(s => s.url.endsWith('/issues'));
  assert.equal(issue.body.title, 'Посты про калькулятор');
  assert.deepEqual(issue.body.labels, ['team-task', 'role:smm']);
  assert.match(issue.body.body, /черновики/);
  assert.match(r.answer, /#31/);
});

test('личный чат: вопрос со словом «делаем» без задачи не создаёт Issue', async () => {
  const sent = [];
  const llm = {
    chat: async () => ({ text: 'Сегодня сайт.', usage: { input: 1, output: 1, cached: 0 } })
  };
  const r = await askPerson(
    { personId: 'qa', text: 'Что мы сегодня делаем?' },
    { store, cfg, llm, fetcher: ghFetcher(sent), dailyLimit: 100 }
  );
  assert.equal(r.answer, 'Сегодня сайт.');
  assert.equal(sent.length, 0);
});

test('личный чат: дубль открытой задачи дописывается, а не создаётся заново', async () => {
  const sent = [];
  const open = [
    {
      number: 9,
      title: 'Проверить sitemap',
      html_url: 'u9',
      body: '',
      labels: [{ name: 'role:seo' }]
    }
  ];
  const llm = { chat: async () => ({ text: 'x', usage: { input: 1, output: 1, cached: 0 } }) };
  const r = await askPerson(
    { personId: 'seo', text: 'задача: Проверить sitemap' },
    { store, cfg, llm, fetcher: ghFetcher(sent, open), dailyLimit: 100 }
  );
  assert.ok(!sent.some(s => s.url.endsWith('/issues') && s.body?.labels));
  assert.match(r.answer, /#9/);
  assert.match(r.answer, /уже/i);
});

test('личный чат: без GITHUB_TOKEN бот честно говорит, что задачу не завести', async () => {
  const llm = { chat: async () => ({ text: 'x', usage: { input: 1, output: 1, cached: 0 } }) };
  const r = await askPerson(
    { personId: 'seo', text: 'задача: Проверить sitemap' },
    { store, cfg: { ...cfg, githubToken: '' }, llm, fetcher: ghFetcher([]), dailyLimit: 100 }
  );
  assert.match(r.answer, /не удалось/i);
  assert.match(r.answer, /GITHUB_TOKEN/);
  assert.equal(r.task, undefined);
});
