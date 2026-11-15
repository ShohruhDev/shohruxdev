// Автопубликация одобренных постов в Telegram-канал (очередь: shared/telegram-posts.mjs).
// Включается только при валидных настройках; ошибки не выходят за пределы тика и не ломают сайт.
// Учёт отправки ведётся по каждому сообщению (пост × язык × номер части), поэтому
// перезапуск между RU и UZ не публикует RU повторно.
const TOKEN_RE = /^\d{5,}:[A-Za-z0-9_-]{30,}$/;
const CHANNEL_RE = /^(?:@[A-Za-z][A-Za-z0-9_]{4,31}|-100\d{5,})$/;
const ID_RE = /^[a-z0-9][a-z0-9-]{1,60}$/;
const TIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;
const IMAGE_RE = /^\/social\/telegram\/[a-z0-9-]+\.(?:jpg|jpeg|png)$/;
// Ошибки, при которых запрос гарантированно не дошёл до Telegram: такую отправку можно повторить.
const PRE_CONNECT = new Set([
  'ENOTFOUND',
  'EAI_AGAIN',
  'ECONNREFUSED',
  'ENETUNREACH',
  'EHOSTUNREACH',
  'UND_ERR_CONNECT_TIMEOUT'
]);

export const TELEGRAM_API = 'https://api.telegram.org';
export const LANGS = ['ru', 'uz'];
export const CAPTION_LIMIT = 1024;
export const TEXT_LIMIT = 4096;
export const RETRY_MS = 30 * 60000;
export const MAX_ATTEMPTS = 5;
export const LANG_GAP_MS = 2 * 60000;
export const STALE_MS = 5 * 60000;
const TIMEOUT_MS = 15000;

/**
 * Правило включения: токен и канал валидны, SITE_URL на HTTPS (картинки берутся с сайта) и
 * TELEGRAM_AUTOPOST=true, либо боевой режим (NODE_ENV=production и SITE_INDEXABLE=true)
 * без TELEGRAM_AUTOPOST=false. Токен: TELEGRAM_CHANNEL_BOT_TOKEN, иначе TELEGRAM_BOT_TOKEN.
 */
export function telegramConfig(env = process.env) {
  const token = String(env.TELEGRAM_CHANNEL_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN || '').trim();
  const channel = String(env.TELEGRAM_CHANNEL_ID || '').trim();
  const siteUrl = String(env.SITE_URL || '')
    .trim()
    .replace(/\/+$/, '');
  const flag = String(env.TELEGRAM_AUTOPOST || '')
    .trim()
    .toLowerCase();
  const live = env.NODE_ENV === 'production' && env.SITE_INDEXABLE === 'true';
  let reason = '';
  if (!channel) reason = 'TELEGRAM_CHANNEL_ID is not set';
  else if (!CHANNEL_RE.test(channel)) reason = 'TELEGRAM_CHANNEL_ID must be @username or -100…';
  else if (!TOKEN_RE.test(token)) reason = 'bot token is missing or malformed';
  else if (!siteUrl.startsWith('https://')) reason = 'SITE_URL must be https://';
  else if (flag === 'false') reason = 'TELEGRAM_AUTOPOST=false';
  else if (flag !== 'true' && !live)
    reason = 'not production+indexable and TELEGRAM_AUTOPOST is not true';
  const cfg = { enabled: !reason, reason, channel, siteUrl };
  // Токен не перечисляется: JSON.stringify(cfg) и console.log(cfg) его не покажут.
  Object.defineProperty(cfg, 'token', { value: token, enumerable: false });
  return /** @type {typeof cfg & { token: string }} */ (cfg);
}

export const escapeHtml = s =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Список проблем очереди; пустой массив, если всё в порядке. */
export function validatePosts(posts) {
  if (!Array.isArray(posts)) return ['queue must be an array'];
  const issues = [];
  const seen = new Set();
  for (const [i, p] of posts.entries()) {
    const at = `#${i + 1}${p?.id ? ` (${p.id})` : ''}`;
    if (!p || typeof p !== 'object') {
      issues.push(`${at}: not an object`);
      continue;
    }
    if (!ID_RE.test(String(p.id))) issues.push(`${at}: bad id`);
    else if (seen.has(p.id)) issues.push(`${at}: duplicate id`);
    seen.add(p.id);
    if (!TIME_RE.test(String(p.publishAt)) || !Number.isFinite(Date.parse(p.publishAt)))
      issues.push(`${at}: publishAt must be ISO with timezone`);
    if (typeof p.approved !== 'boolean') issues.push(`${at}: approved must be true/false`);
    if (typeof p.ru !== 'string' || !p.ru.trim()) issues.push(`${at}: ru text is required`);
    if (p.uz !== undefined && (typeof p.uz !== 'string' || !p.uz.trim()))
      issues.push(`${at}: uz must be a non-empty string`);
    if (p.image !== undefined && !IMAGE_RE.test(String(p.image)))
      issues.push(`${at}: image must be /social/telegram/<name>.jpg`);
  }
  return issues;
}

/** Одобренные посты, время которых наступило, в порядке публикации. */
export function selectDue(posts, now = Date.now()) {
  return posts
    .filter(p => p.approved === true && Date.parse(p.publishAt) <= now)
    .sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt) || (a.id < b.id ? -1 : 1));
}

function cutPoint(text, limit) {
  const window = text.slice(0, limit + 1);
  for (const sep of ['\n\n', '\n', ' ']) {
    const i = window.lastIndexOf(sep);
    if (i > 0) return i;
  }
  // Не разрываем суррогатную пару.
  const code = text.charCodeAt(limit - 1);
  return code >= 0xd800 && code <= 0xdbff ? limit - 1 : limit;
}

/**
 * Делит обычный текст на части: первая не длиннее firstLimit, остальные не длиннее limit.
 * Режет по абзацам, затем по строкам и пробелам. Длина в UTF-16, как считает Telegram.
 */
export function splitText(text, firstLimit, limit = firstLimit) {
  const parts = [];
  let rest = String(text).trim();
  let max = firstLimit;
  while (rest.length > max) {
    const cut = cutPoint(rest, max);
    parts.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
    max = limit;
  }
  if (rest) parts.push(rest);
  return parts;
}

/** Сообщения Bot API для одного языка поста. */
export function buildMessages(post, lang, siteUrl) {
  const text = post[lang];
  if (typeof text !== 'string' || !text.trim()) return [];
  const message = (chunk, preview) => ({
    method: 'sendMessage',
    body: {
      text: escapeHtml(chunk),
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: !preview }
    }
  });
  if (!post.image) {
    return splitText(text, TEXT_LIMIT).map((c, i) => message(c, i === 0 && !!post.linkPreview));
  }
  const [caption, ...rest] = splitText(text, CAPTION_LIMIT, TEXT_LIMIT);
  return [
    {
      method: 'sendPhoto',
      body: {
        photo: new URL(post.image, siteUrl + '/').href,
        caption: escapeHtml(caption),
        parse_mode: 'HTML'
      }
    },
    ...rest.map(c => message(c, false))
  ];
}

export const sendKey = (postId, lang, seq) => `${postId}:${lang}:${seq}`;

/**
 * Следующее сообщение к отправке или null. Посты идут строго по порядку: RU, затем UZ
 * не раньше чем через LANG_GAP_MS. Пост в ожидании повтора задерживает следующие;
 * пост с итоговой ошибкой (gave_up, uncertain) их не задерживает.
 */
export function nextSend(posts, records, siteUrl, now = Date.now()) {
  posts: for (const post of selectDue(posts, now)) {
    let lastSentAt = 0;
    for (const lang of LANGS) {
      const messages = buildMessages(post, lang, siteUrl);
      for (const [seq, message] of messages.entries()) {
        const rec = records.get(sendKey(post.id, lang, seq));
        if (rec?.status === 'sent') {
          lastSentAt = Date.parse(rec.sent_at) || lastSentAt;
          continue;
        }
        if (rec && rec.status !== 'failed') continue posts;
        if (rec && Date.parse(rec.next_attempt_at) > now) return null;
        if (seq === 0 && lang !== LANGS[0] && lastSentAt && lastSentAt + LANG_GAP_MS > now)
          return null;
        return { postId: post.id, lang, seq, message };
      }
    }
  }
  return null;
}

export class TelegramSendError extends Error {
  constructor(message, { definite = false, retryAfter = 0 } = {}) {
    super(message);
    this.definite = definite;
    this.retryAfter = retryAfter;
  }
}

const redact = (s, token) => (token ? String(s).split(token).join('<token>') : String(s));

/** Отправляет одно сообщение. Возвращает message_id или бросает TelegramSendError. */
export async function sendTelegram(cfg, message, fetchImpl = fetch) {
  let res;
  try {
    res = await fetchImpl(`${TELEGRAM_API}/bot${cfg.token}/${message.method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: cfg.channel, ...message.body }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
  } catch (e) {
    const code = e?.code || e?.cause?.code;
    throw new TelegramSendError(
      redact(`Network error: ${e?.message || e}${code ? ` (${code})` : ''}`, cfg.token),
      {
        definite: PRE_CONNECT.has(code)
      }
    );
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    // Ответ не JSON: доставка неизвестна.
  }
  if (data?.ok === true && data.result?.message_id) return data.result.message_id;
  if (data?.ok === false)
    throw new TelegramSendError(
      redact(
        `Telegram ${data.error_code || res.status}: ${data.description || 'error'}`,
        cfg.token
      ),
      { definite: true, retryAfter: Number(data.parameters?.retry_after) || 0 }
    );
  throw new TelegramSendError(`Telegram HTTP ${res.status}: unexpected response`);
}

/**
 * Один шаг публикации: не более одного сообщения за вызов.
 * Возвращает { status: 'disabled' | 'idle' | 'busy' | 'sent' | 'failed' | 'gave_up' | 'uncertain' }.
 */
export async function telegramTick(
  store,
  posts,
  cfg,
  { now = Date.now(), fetchImpl = fetch } = {}
) {
  if (!cfg.enabled) return { status: 'disabled' };
  store.recoverTelegramSends(new Date(now - STALE_MS).toISOString());
  const records = new Map(store.telegramSends().map(r => [sendKey(r.post_id, r.lang, r.seq), r]));
  const next = nextSend(posts, records, cfg.siteUrl, now);
  if (!next) return { status: 'idle' };
  const at = new Date(now).toISOString();
  const attempts = store.claimTelegramSend(next, at);
  if (!attempts) return { status: 'busy' };
  const ref = { postId: next.postId, lang: next.lang, seq: next.seq };
  try {
    const messageId = await sendTelegram(cfg, next.message, fetchImpl);
    store.finishTelegramSend(next, { status: 'sent', messageId }, at);
    return { status: 'sent', ...ref, messageId };
  } catch (e) {
    const error = redact(e instanceof Error ? e.message : String(e), cfg.token).slice(0, 500);
    let status = 'uncertain';
    let nextAttemptAt = null;
    if (e instanceof TelegramSendError && e.definite) {
      status = attempts >= MAX_ATTEMPTS ? 'gave_up' : 'failed';
      if (status === 'failed')
        nextAttemptAt = new Date(now + Math.max(RETRY_MS, e.retryAfter * 1000)).toISOString();
    }
    store.finishTelegramSend(next, { status, error, nextAttemptAt }, at);
    return { status, ...ref, error };
  }
}

/** Таблица учёта отправки; подключается в openStore так же, как editorialStore. */
export function telegramStore(db, log = () => {}) {
  db.exec(
    `CREATE TABLE IF NOT EXISTS telegram_sends(post_id TEXT NOT NULL,lang TEXT NOT NULL,seq INTEGER NOT NULL,status TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,message_id INTEGER,next_attempt_at TEXT,sent_at TEXT,error TEXT,updated_at TEXT NOT NULL,PRIMARY KEY(post_id,lang,seq));`
  );
  return {
    telegramSends() {
      return db.prepare('SELECT * FROM telegram_sends ORDER BY post_id,lang,seq').all();
    },
    /** Атомарно занимает сообщение. Возвращает номер попытки или 0, если оно уже занято/отправлено. */
    claimTelegramSend({ postId, lang, seq }, at) {
      const r = db
        .prepare(
          `INSERT INTO telegram_sends(post_id,lang,seq,status,attempts,updated_at) VALUES(?,?,?,'sending',1,?)
           ON CONFLICT(post_id,lang,seq) DO UPDATE SET status='sending',attempts=attempts+1,updated_at=excluded.updated_at
           WHERE status='failed' AND (next_attempt_at IS NULL OR next_attempt_at<=excluded.updated_at)`
        )
        .run(postId, lang, seq, at);
      if (!r.changes) return 0;
      return db
        .prepare('SELECT attempts FROM telegram_sends WHERE post_id=? AND lang=? AND seq=?')
        .get(postId, lang, seq).attempts;
    },
    finishTelegramSend(
      { postId, lang, seq },
      { status, messageId = null, error = null, nextAttemptAt = null },
      at
    ) {
      db.prepare(
        `UPDATE telegram_sends SET status=?,message_id=?,error=?,next_attempt_at=?,sent_at=?,updated_at=?
         WHERE post_id=? AND lang=? AND seq=? AND status='sending'`
      ).run(
        status,
        messageId,
        error,
        nextAttemptAt,
        status === 'sent' ? at : null,
        at,
        postId,
        lang,
        seq
      );
      log(`telegram-${status}`, sendKey(postId, lang, seq));
    },
    /** Зависшие 'sending' (процесс упал во время запроса) переводятся в 'uncertain' без повтора. */
    recoverTelegramSends(olderThan) {
      return db
        .prepare(
          "UPDATE telegram_sends SET status='uncertain',error='Interrupted during send; check the channel' WHERE status='sending' AND updated_at<?"
        )
        .run(olderThan).changes;
    },
    /** После ручной проверки: 'uncertain'-сообщение уже есть в канале, повторять не нужно. */
    confirmTelegramPost(postId, lang) {
      const r = db
        .prepare(
          "UPDATE telegram_sends SET status='sent',sent_at=updated_at,error=NULL WHERE post_id=? AND lang=? AND status='uncertain'"
        )
        .run(postId, lang);
      if (r.changes) log('telegram-confirmed', `${postId}:${lang}`);
      return r.changes;
    },
    /** Разрешает повторную отправку после ручной проверки канала. Отправленное не трогает. */
    retryTelegramPost(postId, lang) {
      const sql =
        "DELETE FROM telegram_sends WHERE post_id=? AND status IN ('failed','gave_up','uncertain')";
      const r = lang
        ? db.prepare(sql + ' AND lang=?').run(postId, lang)
        : db.prepare(sql).run(postId);
      if (r.changes) log('telegram-retry', lang ? `${postId}:${lang}` : postId);
      return r.changes;
    }
  };
}
