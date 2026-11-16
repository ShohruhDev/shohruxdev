// Панель «Офис» (/office): вся команда агентов на одном экране.
// Источники: GitHub (задачи team-task, PR), командный чат (team_messages), заявки сайта,
// расход модели (team_usage). Действия: поручить задачу, спросить специалиста, смёржить PR.
import { TEAM_PEOPLE, personById } from '../../shared/team-people.mjs';
import { TEAM_KNOWLEDGE } from '../../shared/team-knowledge.mjs';
import { TEAM_CONTEXT as RULES } from '../../shared/team-roles.mjs';
import { checksState, mergePr } from './pr-bot.mjs';
import { tgSend } from './team-chat.mjs';

const DM_HISTORY = 20;
const MAX_TEXT = 4000;
// Цена Claude Opus 5.5 через OpenRouter, $ за 1M токенов (вход / вход из кэша / выход).
const PRICE = { input: 4, cached: 0.4, output: 20 };

// Облачные циклы команды (claude.ai, RemoteTrigger). Время — UTC, как в cron.
export const ROUTINES = [
  {
    id: 'weekly',
    title: 'Планёрка недели',
    who: 'ceo',
    days: [1],
    hour: 3,
    minute: 30,
    what: 'роли предлагают задачи, CEO-стратег пишет бэклог и отчёт недели'
  },
  {
    id: 'daily',
    title: 'Рабочий день',
    who: 'pm',
    days: [1, 2, 3, 4, 5],
    hour: 4,
    minute: 0,
    what: '1–2 задачи из бэклога и Issues, тесты, PR'
  }
];

export function nextRun(r, now = new Date()) {
  for (let i = 0; i < 8; i++) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i, r.hour, r.minute)
    );
    if (d > now && r.days.includes(d.getUTCDay())) return d.toISOString();
  }
  return null;
}

export function panelStore(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS team_dm(id INTEGER PRIMARY KEY, at TEXT NOT NULL, person TEXT NOT NULL,
    author TEXT NOT NULL, text TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS team_dm_person ON team_dm(person, id);`);
  return {
    dmAdd(person, author, text) {
      db.prepare('INSERT INTO team_dm(at,person,author,text) VALUES(?,?,?,?)').run(
        new Date().toISOString(),
        person,
        author,
        text
      );
    },
    dmHistory(person, limit = DM_HISTORY) {
      return db
        .prepare('SELECT at, author, text FROM team_dm WHERE person=? ORDER BY id DESC LIMIT ?')
        .all(person, limit)
        .reverse();
    },
    dmCountSince(iso) {
      return db.prepare("SELECT COUNT(*) n FROM team_dm WHERE author='ceo' AND at>=?").get(iso).n;
    },
    teamRecent(limit = 30) {
      return db
        .prepare('SELECT at, author, text FROM team_messages ORDER BY id DESC LIMIT ?')
        .all(limit);
    },
    teamLastBy() {
      return db
        .prepare(
          'SELECT author, text, MAX(at) at FROM team_messages GROUP BY author ORDER BY at DESC'
        )
        .all();
    },
    usageSince(day) {
      return db
        .prepare(
          `SELECT COALESCE(SUM(llm_calls),0) calls, COALESCE(SUM(input_tokens),0) input,
            COALESCE(SUM(cached_tokens),0) cached, COALESCE(SUM(output_tokens),0) output
           FROM team_usage WHERE day>=?`
        )
        .get(day);
    }
  };
}

export const usageCost = u =>
  Math.round(
    (((u.input - u.cached) * PRICE.input + u.cached * PRICE.cached + u.output * PRICE.output) /
      1e6) *
      100
  ) / 100;

function github(cfg, fetcher) {
  return async (path, init = {}) => {
    const r = await fetcher(`https://api.github.com/repos/${cfg.repo}${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${cfg.githubToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'razrabotkatashkent-office',
        ...(init.body ? { 'Content-Type': 'application/json' } : {})
      },
      signal: AbortSignal.timeout(15000)
    });
    return { ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) };
  };
}

const roleOf = issue =>
  (issue.labels || [])
    .map(l => (typeof l === 'string' ? l : l.name))
    .find(n => n?.startsWith('role:'))
    ?.slice(5);

/** Данные GitHub для панели. Ошибки не роняют панель — возвращаются в поле error. */
export async function githubOverview(cfg, fetcher = fetch) {
  if (!cfg.githubToken) return { tasks: [], prs: [], merged: [], error: 'Не задан GITHUB_TOKEN' };
  const gh = github(cfg, fetcher);
  const [issues, open, closed] = await Promise.all([
    gh('/issues?labels=team-task&state=open&per_page=100'),
    gh('/pulls?state=open&per_page=20'),
    gh('/pulls?state=closed&sort=updated&direction=desc&per_page=15')
  ]);
  const error = [issues, open, closed].find(r => !r.ok);
  const prs = await Promise.all(
    (open.ok ? open.data : []).slice(0, 10).map(async pr => {
      const runs = await gh(`/actions/runs?head_sha=${pr.head.sha}&per_page=100`);
      return {
        number: pr.number,
        title: pr.title,
        url: pr.html_url,
        draft: pr.draft,
        createdAt: pr.created_at,
        branch: pr.head.ref,
        needsReview: /Нужно ревью владельца/i.test(pr.body || ''),
        ci: runs.ok ? checksState(runs.data.workflow_runs || []) : 'unknown'
      };
    })
  );
  return {
    tasks: (issues.ok ? issues.data : [])
      .filter(i => !i.pull_request)
      .map(i => ({
        number: i.number,
        title: i.title,
        url: i.html_url,
        createdAt: i.created_at,
        role: roleOf(i) || 'pm'
      })),
    prs,
    merged: (closed.ok ? closed.data : [])
      .filter(p => p.merged_at)
      .slice(0, 8)
      .map(p => ({ number: p.number, title: p.title, url: p.html_url, at: p.merged_at })),
    error: error ? `GitHub HTTP ${error.status}` : ''
  };
}

const monthStart = now => now.toISOString().slice(0, 8) + '01';
const dayStart = now => now.toISOString().slice(0, 10);

/** Сводка для панели. gh — результат githubOverview (кэшируется в обработчике). */
export function officeOverview({ store, gh, cfg, now = new Date() }) {
  // В Telegram-чате author 'ceo' — это владелец, а не агент «CEO-стратег»: в панели он — «Вы».
  const last = Object.fromEntries(
    store
      .teamLastBy()
      .filter(m => m.author !== 'ceo')
      .map(m => [m.author, m])
  );
  const people = TEAM_PEOPLE.map(p => {
    const tasks = gh.tasks.filter(t => t.role === p.id);
    const said = last[p.id];
    return {
      id: p.id,
      persona: p.persona,
      title: p.title,
      color: p.color,
      look: p.look,
      duties: p.duties,
      inChat: p.inChat,
      hasBot: Boolean(cfg.bots?.[p.id]),
      status: tasks.length ? 'busy' : 'free',
      tasks,
      lastSaid: said ? { text: said.text.slice(0, 280), at: said.at } : null
    };
  });
  const leads = store.leads();
  const week = new Date(now.getTime() - 7 * 864e5).toISOString();
  const today = store.usageSince(dayStart(now));
  const month = store.usageSince(monthStart(now));
  const feed = [
    ...store.teamRecent(25).map(m => ({
      kind: 'chat',
      at: m.at,
      who: m.author === 'ceo' ? 'owner' : m.author,
      text: m.text
    })),
    ...gh.merged.map(p => ({
      kind: 'merged',
      at: p.at,
      who: 'developer',
      text: `PR #${p.number} смёржен: ${p.title}`,
      url: p.url
    }))
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 30);
  return {
    people,
    prs: gh.prs,
    leads: {
      total: leads.length,
      week: leads.filter(l => l.createdAt >= week).length,
      latest: leads.slice(0, 5).map(l => ({
        id: l.id,
        createdAt: l.createdAt,
        name: String(l.name || '').slice(0, 80),
        direction: String(l.direction || l.service || '').slice(0, 60)
      }))
    },
    usage: {
      today: { ...today, cost: usageCost(today) },
      month: { ...month, cost: usageCost(month) },
      model: cfg.model
    },
    routines: ROUTINES.map(r => ({ ...r, next: nextRun(r, now) })),
    chat: { enabled: cfg.enabled, model: cfg.model },
    feed,
    githubError: gh.error
  };
}

const clean = (v, max) =>
  String(v ?? '')
    .replace(/\s+\n/g, '\n')
    .trim()
    .slice(0, max);

/** Поручить задачу: Issue с метками team-task и role:<id>; ежедневный цикл берёт их первыми. */
export async function assignTask({ personId, title, details }, { store, cfg, fetcher = fetch }) {
  const p = personById(personId);
  if (!p) throw Error('Нет такого специалиста.');
  const t = clean(title, 200);
  if (t.length < 3) throw Error('Напишите задачу хотя бы в несколько слов.');
  if (!cfg.githubToken) throw Error('Не задан GITHUB_TOKEN — задачу не создать.');
  const r = await github(cfg, fetcher)('/issues', {
    method: 'POST',
    body: JSON.stringify({
      title: t,
      body: `${clean(details, 3000) || t}\n\nОтветственный: @${p.id} (${p.persona}, ${p.title}).\nЗадача поставлена CEO в панели «Офис».`,
      labels: ['team-task', `role:${p.id}`]
    })
  });
  if (!r.ok) throw Error(`GitHub не создал задачу (HTTP ${r.status}).`);
  const note = `📌 CEO поручил: ${p.persona} (${p.title}) — «${t}». Задача #${r.data.number}: ${r.data.html_url}`;
  if (cfg.enabled) {
    await tgSend(cfg.bots.pm, cfg.chatId, note, fetcher).catch(() => {});
    store.teamAdd('pm', note);
  }
  return { number: r.data.number, url: r.data.html_url };
}

export async function closeTask(number, { cfg, fetcher = fetch }) {
  if (!Number.isInteger(number) || number < 1) throw Error('Неверный номер задачи.');
  const r = await github(cfg, fetcher)(`/issues/${number}`, {
    method: 'PATCH',
    body: JSON.stringify({ state: 'closed', state_reason: 'completed' })
  });
  if (!r.ok) throw Error(`GitHub не закрыл задачу (HTTP ${r.status}).`);
  return { ok: true };
}

const personSystem = p =>
  `${RULES}\n\n# База знаний команды (источник истины)\n\n${TEAM_KNOWLEDGE}\n\n# Твоя роль\n\nТебя зовут ${p.persona}, ты — ${p.title} в команде Razrabotka Tashkent. ${p.prompt}\nСейчас ты в личном чате с CEO в панели «Офис» (не в общем Telegram-чате): отвечай ему напрямую, по-русски, коротко и по делу. Если вопрос не твой — скажи, кого из коллег спросить.`;

/** Личный вопрос специалисту. Ответ — от модели командного чата. */
export async function askPerson(
  { personId, text },
  { store, cfg, llm, now = new Date(), dailyLimit = 60 }
) {
  const p = personById(personId);
  if (!p) throw Error('Нет такого специалиста.');
  const q = clean(text, MAX_TEXT);
  if (!q) throw Error('Напишите вопрос.');
  if (!cfg.apiKey) throw Error('Модель не подключена: нет ключа OpenRouter.');
  if (store.dmCountSince(dayStart(now)) >= dailyLimit)
    throw Error(`Лимит на сегодня — ${dailyLimit} вопросов в панели. Продолжим завтра.`);
  const history = store.dmHistory(p.id);
  store.dmAdd(p.id, 'ceo', q);
  const transcript = [...history, { author: 'ceo', text: q }]
    .map(m => `[${m.author === 'ceo' ? 'CEO' : p.persona}]: ${m.text}`)
    .join('\n');
  const r = await llm.chat(personSystem(p), `${transcript}\n\nОтветь CEO от имени ${p.persona}.`);
  store.teamCount(dayStart(now), {
    calls: 1,
    input: r.usage.input,
    output: r.usage.output,
    cached: r.usage.cached
  });
  const answer = r.text || 'Не могу ответить на это. Переформулируйте, пожалуйста.';
  store.dmAdd(p.id, p.id, answer);
  return { answer };
}

export const mergeFromPanel = (number, deps) => mergePr(number, deps);
