// Командный чат в Telegram: CEO (владелец) пишет в группу, роли-боты отвечают и обсуждают.
// Telegram не пересылает ботам сообщения других ботов, поэтому разговор ведёт сервер:
// координатор (Claude) решает, кто отвечает, сервер пишет от имени бота роли.
// Входящие сообщения принимает бот pm (webhook /api/team/webhook, privacy mode выключен).
// Модель: через OpenRouter (OPENROUTER_API_KEY) или напрямую через Anthropic API (ANTHROPIC_API_KEY).
import Anthropic from '@anthropic-ai/sdk';
import { TEAM_CONTEXT, TEAM_ROLES, roleById } from '../../shared/team-roles.mjs';

const HISTORY = 30;
const TG_LIMIT = 4000;
const SKIP = /^\s*ПРОПУСК\.?\s*$/i;

export function teamConfig(env = process.env) {
  // Значения короче 20 символов — заглушки вроде «…», а не токены: такие роли пишут через бота pm.
  const real = v => (String(v || '').trim().length >= 20 ? String(v).trim() : '');
  const bots = Object.fromEntries(TEAM_ROLES.map(r => [r.id, real(env[r.env])]));
  const provider = env.TEAM_PROVIDER || (env.OPENROUTER_API_KEY ? 'openrouter' : 'anthropic');
  return {
    provider,
    apiKey: real(provider === 'openrouter' ? env.OPENROUTER_API_KEY : env.ANTHROPIC_API_KEY),
    model:
      env.TEAM_MODEL ||
      (provider === 'openrouter' ? 'anthropic/claude-opus-5.5' : 'claude-opus-5-5'),
    siteUrl: env.SITE_URL || '',
    effort: env.TEAM_EFFORT || 'low',
    chatId: String(env.TEAM_CHAT_ID || ''),
    ownerId: String(env.TEAM_OWNER_ID || ''),
    secret: env.TEAM_WEBHOOK_SECRET || '',
    bots,
    dailyLimit: Number(env.TEAM_DAILY_MESSAGES || 50),
    maxBotTurns: Number(env.TEAM_MAX_BOT_TURNS || 4),
    githubToken: env.GITHUB_TOKEN || '',
    repo: env.GITHUB_REPO || 'ShohruhDev/shohruxdev',
    get enabled() {
      return Boolean(this.apiKey && this.chatId && this.ownerId && this.secret && bots.pm);
    }
  };
}

export function teamStore(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS team_messages(id INTEGER PRIMARY KEY, at TEXT NOT NULL, author TEXT NOT NULL, text TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS team_updates(update_id INTEGER PRIMARY KEY, at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS team_usage(day TEXT PRIMARY KEY, owner_messages INTEGER NOT NULL DEFAULT 0,
      llm_calls INTEGER NOT NULL DEFAULT 0, input_tokens INTEGER NOT NULL DEFAULT 0, output_tokens INTEGER NOT NULL DEFAULT 0);`);
  return {
    /** true, если обновление новое (Telegram может прислать его повторно). */
    teamFirstSeen(updateId) {
      return (
        db
          .prepare('INSERT OR IGNORE INTO team_updates VALUES(?,?)')
          .run(updateId, new Date().toISOString()).changes === 1
      );
    },
    teamAdd(author, text) {
      db.prepare('INSERT INTO team_messages(at,author,text) VALUES(?,?,?)').run(
        new Date().toISOString(),
        author,
        text
      );
    },
    teamHistory(limit = HISTORY) {
      return db
        .prepare('SELECT author, text FROM team_messages ORDER BY id DESC LIMIT ?')
        .all(limit)
        .reverse();
    },
    teamUsage(day) {
      return (
        db.prepare('SELECT * FROM team_usage WHERE day=?').get(day) || {
          day,
          owner_messages: 0,
          llm_calls: 0,
          input_tokens: 0,
          output_tokens: 0
        }
      );
    },
    teamCount(day, { owner = 0, calls = 0, input = 0, output = 0 }) {
      db.prepare(
        `INSERT INTO team_usage VALUES(?,?,?,?,?) ON CONFLICT(day) DO UPDATE SET
          owner_messages=owner_messages+excluded.owner_messages, llm_calls=llm_calls+excluded.llm_calls,
          input_tokens=input_tokens+excluded.input_tokens, output_tokens=output_tokens+excluded.output_tokens`
      ).run(day, owner, calls, input, output);
    }
  };
}

const authorName = a => (a === 'ceo' ? 'CEO' : roleById(a)?.name || a);
export const transcript = history =>
  history
    .map(m => `[${authorName(m.author)}${m.author === 'ceo' ? '' : ` @${m.author}`}]: ${m.text}`)
    .join('\n');

/** Роли, к которым обратились через @id (в порядке упоминания, без повторов). */
export function mentionedRoles(text) {
  const ids = [...String(text).matchAll(/@([a-z]+)/g)].map(m => m[1]);
  return [...new Set(ids)].filter(id => roleById(id));
}

const ROUTER_SCHEMA = {
  type: 'object',
  properties: {
    responders: {
      type: 'array',
      items: { type: 'string', enum: TEAM_ROLES.map(r => r.id) },
      description: 'Кто отвечает, по порядку, 1–3 роли'
    },
    has_task: { type: 'boolean' },
    task_title: { type: 'string' },
    task_role: { type: 'string', enum: TEAM_ROLES.map(r => r.id) },
    task_details: { type: 'string' }
  },
  required: ['responders', 'has_task', 'task_title', 'task_role', 'task_details'],
  additionalProperties: false
};

const ROUTER_PROMPT = `Ты — координатор командного чата. По последнему сообщению CEO реши, какие роли должны ответить (1–3, самые полезные для этого вопроса, по порядку; на простой вопрос — одна роль). Роли: ${TEAM_ROLES.map(r => `${r.id} — ${r.name}`).join('; ')}.
has_task = true, только если CEO явно ставит задачу или одобряет конкретную работу («сделайте», «задача:», «давайте, делаем»). Тогда task_title — короткий заголовок задачи, task_role — ответственная роль, task_details — что сделать и критерий готовности на основе всего обсуждения. Иначе has_task = false, а task_* — пустые строки и task_role = "pm".`;

function parsePlan(text) {
  try {
    const json = String(text).match(/\{[\s\S]*\}/)?.[0];
    const plan = JSON.parse(json || text);
    if (Array.isArray(plan.responders)) return plan;
  } catch {}
  return { responders: ['pm'], has_task: false };
}
const roleSystem = role => `${role.prompt}\nТвой id в чате: @${role.id}.`;
const replyPrompt = (role, history) =>
  `${transcript(history)}\n\nНапиши следующую реплику в чат от имени роли «${role.name}».`;

/** Модель через OpenRouter (OpenAI-совместимый Chat Completions). */
export function createOpenRouter(cfg, fetcher = fetch) {
  async function call(system, user, extra = {}) {
    const r = await fetcher('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
        ...(cfg.siteUrl ? { 'HTTP-Referer': cfg.siteUrl } : {}),
        'X-Title': 'Razrabotka Tashkent team chat'
      },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: 16000,
        // Для моделей без reasoning (например openai/gpt-4o) задайте TEAM_EFFORT=none.
        ...(cfg.effort && cfg.effort !== 'none' ? { reasoning: { effort: cfg.effort } } : {}),
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        ...(extra.schema
          ? {
              response_format: {
                type: 'json_schema',
                json_schema: { name: 'route', strict: true, schema: extra.schema }
              }
            }
          : {})
      }),
      signal: AbortSignal.timeout(120000)
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw Error(`OpenRouter HTTP ${r.status}: ${data?.error?.message || ''}`.trim());
    const choice = data.choices?.[0];
    const text =
      choice?.finish_reason === 'content_filter'
        ? ''
        : String(choice?.message?.content || '').trim();
    return {
      text,
      usage: { input: data.usage?.prompt_tokens || 0, output: data.usage?.completion_tokens || 0 }
    };
  }
  return {
    async route(history) {
      const r = await call(`${TEAM_CONTEXT}\n\n${ROUTER_PROMPT}`, transcript(history), {
        schema: ROUTER_SCHEMA
      });
      return { plan: parsePlan(r.text), usage: r.usage };
    },
    async reply(roleId, history) {
      const role = roleById(roleId);
      return call(`${TEAM_CONTEXT}\n\n${roleSystem(role)}`, replyPrompt(role, history));
    }
  };
}

/** Модель для чата по настройкам: OpenRouter или Anthropic API. */
export const createTeamLlm = cfg =>
  cfg.provider === 'openrouter' ? createOpenRouter(cfg) : createClaude(cfg);

/** Клиент Claude для чата. В тестах подменяется заглушкой с теми же методами. */
export function createClaude(cfg, client = new Anthropic({ apiKey: cfg.apiKey })) {
  async function call(system, content, extra = {}) {
    const r = await client.beta.messages.create({
      model: cfg.model,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: cfg.effort, ...(extra.format ? { format: extra.format } : {}) },
      system,
      messages: [{ role: 'user', content }]
    });
    const text = r.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();
    return {
      text: r.stop_reason === 'refusal' ? '' : text,
      usage: { input: r.usage.input_tokens || 0, output: r.usage.output_tokens || 0 }
    };
  }
  const shared = { type: 'text', text: TEAM_CONTEXT, cache_control: { type: 'ephemeral' } };
  return {
    async route(history) {
      const r = await call([shared, { type: 'text', text: ROUTER_PROMPT }], transcript(history), {
        format: { type: 'json_schema', schema: ROUTER_SCHEMA }
      });
      return { plan: parsePlan(r.text), usage: r.usage };
    },
    async reply(roleId, history) {
      const role = roleById(roleId);
      return call([shared, { type: 'text', text: roleSystem(role) }], replyPrompt(role, history));
    }
  };
}

async function tgSend(token, chatId, text, fetcher) {
  for (let i = 0; i < text.length; i += TG_LIMIT) {
    const r = await fetcher(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(i, i + TG_LIMIT),
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(15000)
    });
    if (!r.ok) throw Error(`Telegram sendMessage: HTTP ${r.status}`);
  }
}

async function createIssue(cfg, plan, fetcher) {
  if (!cfg.githubToken) return { ok: false, reason: 'нет GITHUB_TOKEN' };
  const role = roleById(plan.task_role) || roleById('pm');
  const r = await fetcher(`https://api.github.com/repos/${cfg.repo}/issues`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${cfg.githubToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'razrabotkatashkent-team-chat',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: plan.task_title.slice(0, 200),
      body: `${plan.task_details}\n\nОтветственный: @${role.id} (${role.name}).\nЗадача поставлена CEO в командном чате Telegram.`,
      labels: ['team-task', `role:${role.id}`]
    }),
    signal: AbortSignal.timeout(15000)
  });
  const data = await r.json().catch(() => ({}));
  return r.ok
    ? { ok: true, number: data.number, url: data.html_url }
    : { ok: false, reason: `GitHub HTTP ${r.status}` };
}

const today = (now = new Date()) => now.toISOString().slice(0, 10);

/**
 * Обрабатывает одно обновление Telegram. Возвращает {status} для логов и тестов.
 * deps: { store, cfg, llm, fetcher, now }
 */
export async function handleTeamUpdate(
  update,
  { store, cfg, llm, fetcher = fetch, now = new Date() }
) {
  const msg = update?.message;
  if (!msg?.text || msg.from?.is_bot) return { status: 'ignored' };
  if (String(msg.chat?.id) !== cfg.chatId || String(msg.from?.id) !== cfg.ownerId)
    return { status: 'ignored' };
  if (update.update_id != null && !store.teamFirstSeen(update.update_id))
    return { status: 'duplicate' };

  const day = today(now);
  const say = async (roleId, text) => {
    // У роли пока нет своего бота — пишет бот pm с подписью роли.
    const own = cfg.bots[roleId];
    const label = own || roleId === 'pm' ? '' : `${roleById(roleId)?.name || roleId}: `;
    await tgSend(own || cfg.bots.pm, cfg.chatId, label + text, fetcher);
    store.teamAdd(roleId, text);
  };

  if (/^\/status\b/.test(msg.text)) {
    const u = store.teamUsage(day);
    await tgSend(
      cfg.bots.pm,
      cfg.chatId,
      `Сегодня: ${u.owner_messages} из ${cfg.dailyLimit} сообщений CEO, ${u.llm_calls} запросов к Claude, токенов: ${u.input_tokens} на входе, ${u.output_tokens} на выходе. Модель: ${cfg.model}, effort: ${cfg.effort}.`,
      fetcher
    );
    return { status: 'status' };
  }

  if (store.teamUsage(day).owner_messages >= cfg.dailyLimit) {
    await tgSend(
      cfg.bots.pm,
      cfg.chatId,
      `Дневной лимит команды исчерпан (${cfg.dailyLimit} сообщений). Продолжим завтра, лимит меняется переменной TEAM_DAILY_MESSAGES.`,
      fetcher
    );
    return { status: 'limit' };
  }
  store.teamAdd('ceo', msg.text);
  store.teamCount(day, { owner: 1 });

  const count = usage => store.teamCount(day, { calls: 1, ...usage });
  const { plan, usage } = await llm.route(store.teamHistory());
  count(usage);

  // Явные обращения CEO (@seo) важнее выбора координатора.
  const queue = [...new Set([...mentionedRoles(msg.text), ...(plan.responders || [])])]
    .filter(id => roleById(id))
    .slice(0, 3);
  if (!queue.length) queue.push('pm');
  const spoke = [];
  let botTurns = 0;
  while (queue.length && botTurns < cfg.maxBotTurns) {
    const roleId = queue.shift();
    const r = await llm.reply(roleId, store.teamHistory());
    count(r.usage);
    botTurns++;
    if (!r.text || SKIP.test(r.text)) continue;
    await say(roleId, r.text);
    spoke.push(roleId);
    for (const id of mentionedRoles(r.text))
      if (id !== roleId && !queue.includes(id) && !spoke.includes(id)) queue.push(id);
  }

  let task = null;
  if (plan.has_task && plan.task_title) {
    task = await createIssue(cfg, plan, fetcher);
    await say(
      'pm',
      task.ok
        ? `Задача заведена: #${task.number} «${plan.task_title}». Ответственный: @${plan.task_role}. Команда возьмёт её в ежедневный цикл. ${task.url}`
        : `Задачу «${plan.task_title}» не удалось завести в GitHub (${task.reason}). Зафиксировал её в чате.`
    );
  }
  return { status: 'answered', spoke, task };
}
