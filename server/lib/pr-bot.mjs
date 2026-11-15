// PR-бот: уведомления о pull request в Telegram-бот заявок и мёрж по ответу владельца.
// GitHub → POST /api/github/webhook (подпись GITHUB_WEBHOOK_SECRET).
// Telegram → POST /api/telegram/webhook (заголовок-секрет TELEGRAM_WEBHOOK_SECRET),
// принимаются только сообщения из TELEGRAM_CHAT_ID. Мёрж — через GITHUB_TOKEN
// (fine-grained: Contents RW, Pull requests RW, Checks/Commit statuses read).
import { createHmac, timingSafeEqual } from 'node:crypto';

const esc = s =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
const APPROVE = /^\s*(давай|да|мёржи|мержи|смёржи|смержи|merge|ok|ок|го|ha|xa)(?=$|[\s,.!?])/iu;

export function prBotConfig(env = process.env) {
  return {
    botToken: env.TELEGRAM_BOT_TOKEN || '',
    chatId: String(env.TELEGRAM_CHAT_ID || ''),
    telegramSecret: env.TELEGRAM_WEBHOOK_SECRET || '',
    githubSecret: env.GITHUB_WEBHOOK_SECRET || '',
    githubToken: env.GITHUB_TOKEN || '',
    repo: env.GITHUB_REPO || 'ShohruhDev/shohruxdev'
  };
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a)),
    y = Buffer.from(String(b));
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

export function verifyGithubSignature(raw, header, secret) {
  if (!secret || !header) return false;
  const expected = 'sha256=' + createHmac('sha256', secret).update(raw).digest('hex');
  return safeEqual(expected, header);
}

/** Текст уведомления о новом PR и кнопки. */
export function prMessage(pr) {
  const body = String(pr.body || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
  const needsReview = /нужно ревью владельца/i.test(body);
  const summary = body.length > 700 ? body.slice(0, 700) + '…' : body;
  const text = [
    `<b>PR #${pr.number}</b>: ${esc(pr.title)}`,
    `Ветка: <code>${esc(pr.head?.ref)}</code> · автор: ${esc(pr.user?.login)}`,
    `Изменения: +${pr.additions ?? '?'} / −${pr.deletions ?? '?'}, файлов: ${pr.changed_files ?? '?'}`,
    needsReview ? '⚠️ Команда просит ваше ревью.' : '',
    '',
    esc(summary),
    '',
    `<a href="${esc(pr.html_url)}">Открыть на GitHub</a>`,
    'Ответьте «давай» на это сообщение или нажмите кнопку.'
  ]
    .filter((l, i, a) => l !== '' || a[i - 1] !== '')
    .join('\n');
  return {
    text,
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Смёржить', callback_data: `merge:${pr.number}` },
          { text: '⏸ Не сейчас', callback_data: `skip:${pr.number}` }
        ]
      ]
    }
  };
}

function telegram(cfg, fetcher) {
  return async (method, payload) => {
    const r = await fetcher(`https://api.telegram.org/bot${cfg.botToken}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });
    if (!r.ok) throw Error(`Telegram ${method}: HTTP ${r.status}`);
    return r.json();
  };
}

function github(cfg, fetcher) {
  return async (path, init = {}) => {
    const r = await fetcher(`https://api.github.com/repos/${cfg.repo}${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${cfg.githubToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'razrabotkatashkent-pr-bot',
        ...(init.body ? { 'Content-Type': 'application/json' } : {})
      },
      signal: AbortSignal.timeout(15000)
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data };
  };
}

/** Событие GitHub → сообщение владельцу. */
export async function handleGithubEvent(
  event,
  payload,
  { env = process.env, fetcher = fetch } = {}
) {
  const cfg = prBotConfig(env);
  if (!cfg.botToken || !cfg.chatId) return { status: 'unconfigured' };
  if (event !== 'pull_request' || !payload?.pull_request) return { status: 'ignored' };
  const pr = payload.pull_request;
  if (pr.base?.repo?.full_name && pr.base.repo.full_name !== cfg.repo) return { status: 'ignored' };
  const tg = telegram(cfg, fetcher);
  const action = payload.action;
  if (['opened', 'reopened', 'ready_for_review'].includes(action) && !pr.draft) {
    const m = prMessage(pr);
    await tg('sendMessage', {
      chat_id: cfg.chatId,
      text: m.text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: m.reply_markup
    });
    return { status: 'sent' };
  }
  if (action === 'closed' && pr.merged) {
    await tg('sendMessage', {
      chat_id: cfg.chatId,
      text: `✅ PR #${pr.number} смёржен${pr.merged_by?.login ? ` (${esc(pr.merged_by.login)})` : ''}: ${esc(pr.title)}`,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    return { status: 'sent' };
  }
  return { status: 'ignored' };
}

/** Проверки CI коммита: 'success' | 'pending' | 'failure'. */
export function checksState(runs) {
  if (!runs.length) return 'pending';
  if (runs.some(r => r.status !== 'completed')) return 'pending';
  return runs.every(r => ['success', 'skipped', 'neutral'].includes(r.conclusion))
    ? 'success'
    : 'failure';
}

/** Мёрж PR, если он открыт, без конфликтов и CI зелёный. Возвращает текст ответа владельцу. */
export async function mergePr(number, { env = process.env, fetcher = fetch } = {}) {
  const cfg = prBotConfig(env);
  if (!cfg.githubToken) return 'Не задан GITHUB_TOKEN — смёржить не могу.';
  const gh = github(cfg, fetcher);
  const pr = await gh(`/pulls/${number}`);
  if (!pr.ok) return `PR #${number}: не удалось получить (HTTP ${pr.status}).`;
  if (pr.data.merged) return `PR #${number} уже смёржен.`;
  if (pr.data.state !== 'open') return `PR #${number} закрыт.`;
  if (pr.data.draft) return `PR #${number} — черновик, не мёржу.`;
  if (pr.data.mergeable === false) return `PR #${number}: конфликт с master, нужно решить вручную.`;
  const runs = await gh(`/commits/${pr.data.head.sha}/check-runs?per_page=100`);
  if (!runs.ok) return `PR #${number}: не удалось получить статус CI (HTTP ${runs.status}).`;
  const state = checksState(runs.data.check_runs || []);
  if (state === 'pending')
    return `PR #${number}: CI ещё идёт. Ответьте «давай» ещё раз через пару минут.`;
  if (state === 'failure')
    return `PR #${number}: CI упал — не мёржу. Посмотрите проверки на GitHub.`;
  const res = await gh(`/pulls/${number}/merge`, {
    method: 'PUT',
    body: JSON.stringify({ merge_method: 'merge', sha: pr.data.head.sha })
  });
  if (!res.ok) return `PR #${number}: GitHub отказал (${esc(res.data.message || res.status)}).`;
  return `✅ PR #${number} смёржен: ${esc(pr.data.title)}`;
}

/** Обновление Telegram → действие. Только из чата владельца. */
export async function handleTelegramUpdate(update, { env = process.env, fetcher = fetch } = {}) {
  const cfg = prBotConfig(env);
  if (!cfg.botToken || !cfg.chatId) return { status: 'unconfigured' };
  const tg = telegram(cfg, fetcher);
  const cb = update?.callback_query;
  if (cb) {
    if (String(cb.message?.chat?.id) !== cfg.chatId) return { status: 'ignored' };
    const [, action, n] = String(cb.data || '').match(/^(merge|skip):(\d+)$/) || [];
    if (!action) return { status: 'ignored' };
    const reply =
      action === 'merge'
        ? await mergePr(Number(n), { env, fetcher })
        : `PR #${n} оставлен открытым.`;
    await tg('answerCallbackQuery', { callback_query_id: cb.id, text: reply.slice(0, 190) });
    await tg('sendMessage', {
      chat_id: cfg.chatId,
      text: reply,
      parse_mode: 'HTML',
      reply_to_message_id: cb.message?.message_id
    });
    return { status: action };
  }
  const msg = update?.message;
  if (!msg || String(msg.chat?.id) !== cfg.chatId) return { status: 'ignored' };
  if (!APPROVE.test(msg.text || '')) return { status: 'ignored' };
  const n = String(msg.reply_to_message?.text || '').match(/PR #(\d+)/)?.[1];
  const reply = n
    ? await mergePr(Number(n), { env, fetcher })
    : 'Ответьте «давай» именно на сообщение с PR — так я пойму, какой мёржить.';
  await tg('sendMessage', {
    chat_id: cfg.chatId,
    text: reply,
    parse_mode: 'HTML',
    reply_to_message_id: msg.message_id
  });
  return { status: n ? 'merge' : 'hint' };
}
