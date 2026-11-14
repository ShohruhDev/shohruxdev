// IndexNow: сообщает Яндексу, Bing и другим участникам протокола о новых адресах.
// Google протокол не поддерживает; для него достаточно sitemap.
const KEY_RE = /^[a-zA-Z0-9-]{8,128}$/;
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export function indexNowConfig(env = process.env) {
  const key = String(env.INDEXNOW_KEY || '').trim();
  const siteUrl = String(env.SITE_URL || '').replace(/\/+$/, '');
  const enabled =
    env.SITE_INDEXABLE === 'true' && KEY_RE.test(key) && siteUrl.startsWith('https://');
  return { enabled, key, siteUrl };
}

/** Адреса, которые меняются при выпуске статей: сами статьи и списки журнала. */
export function publishedUrls(siteUrl, posts) {
  if (!posts.length) return [];
  const paths = ['/journal'];
  if (posts.some(p => p.translations?.uz)) paths.push('/uz/journal');
  for (const p of posts) {
    paths.push(`/journal/${p.slug}`);
    if (p.translations?.uz) paths.push(`/uz/journal/${p.slug}`);
  }
  return paths.map(path => new URL(path, siteUrl + '/').href);
}

export async function submitIndexNow(cfg, urls, fetchImpl = fetch) {
  if (!cfg.enabled || !urls.length) return { skipped: true };
  const host = new URL(cfg.siteUrl).host;
  const res = await fetchImpl(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: cfg.key,
      keyLocation: `${cfg.siteUrl}/${cfg.key}.txt`,
      urlList: urls
    }),
    signal: AbortSignal.timeout(10000)
  });
  // 200 — принято, 202 — принято, ключ ещё проверяется.
  if (res.status !== 200 && res.status !== 202) throw new Error(`IndexNow HTTP ${res.status}`);
  return { submitted: urls.length, status: res.status };
}

/** Обработчик для openStore({ onPublish }). Ошибки не мешают публикации. */
export function indexNowOnPublish(cfg = indexNowConfig(), fetchImpl = fetch) {
  return posts => {
    if (!cfg.enabled) return Promise.resolve({ skipped: true });
    return submitIndexNow(cfg, publishedUrls(cfg.siteUrl, posts), fetchImpl).catch(e => {
      console.error(`IndexNow submission failed: ${e.message}`);
      return { error: e.message };
    });
  };
}
