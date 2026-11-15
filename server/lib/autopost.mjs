// Общие помощники автопостинга (Telegram, Meta): формат времени очереди, правило включения,
// классификация сетевых ошибок и вычистка секретов из текста ошибок.

/** ISO-время со смещением: 2026-11-23T12:00:00+05:00 или …Z. */
export const TIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;

export const isZonedIso = s => TIME_RE.test(String(s)) && Number.isFinite(Date.parse(s));

// Ошибки, при которых запрос гарантированно не дошёл до сервера: такую отправку можно повторить.
export const PRE_CONNECT = new Set([
  'ENOTFOUND',
  'EAI_AGAIN',
  'ECONNREFUSED',
  'ENETUNREACH',
  'EHOSTUNREACH',
  'UND_ERR_CONNECT_TIMEOUT'
]);

/** Код системной ошибки fetch (undici кладёт его в cause). */
export const networkCode = e => e?.code || e?.cause?.code || '';

/**
 * Боевой режим или явный флаг. Возвращает причину, по которой постинг выключен, или ''.
 * Флаг `false` выключает всегда; `true` включает и вне боевого режима
 * (боевой режим: NODE_ENV=production и SITE_INDEXABLE=true).
 */
export function liveGateReason(env, flagName) {
  const flag = String(env[flagName] || '')
    .trim()
    .toLowerCase();
  const live = env.NODE_ENV === 'production' && env.SITE_INDEXABLE === 'true';
  if (flag === 'false') return `${flagName}=false`;
  if (flag !== 'true' && !live) return `not production+indexable and ${flagName} is not true`;
  return '';
}

/** Адрес сайта без завершающего слэша. */
export const siteUrlFrom = env =>
  String(env.SITE_URL || '')
    .trim()
    .replace(/\/+$/, '');

/** Заменяет каждый секрет на <token>. Пустые секреты пропускаются. */
export function redact(s, ...secrets) {
  let out = String(s);
  for (const secret of secrets) if (secret) out = out.split(secret).join('<token>');
  return out;
}
