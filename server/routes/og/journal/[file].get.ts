import { localizePost } from '#shared/locale.mjs';
import { authorName, brandDomain, brandName } from '#shared/brand.mjs';
const brand = { name: brandName, domain: brandDomain, author: authorName };
import { ogFonts, ogVersion, renderArticleImage } from '../../../lib/og-image.mjs';
// /og/journal/<slug>.png?lang=uz — картинка для соцсетей, создаётся при первом запросе.
let fonts: Promise<any[]> | undefined;
function loadFonts() {
  return (fonts ||= (async () => {
    const store = useStorage('assets:server');
    const keys = (await store.getKeys('og-fonts')).filter(k => k.endsWith('.woff'));
    const files = await Promise.all(
      keys.map(async k => ({
        name: k.split(':').pop()!,
        data: Buffer.from((await store.getItemRaw(k)) as ArrayBuffer)
      }))
    );
    if (!files.length) throw new Error('OG fonts are missing');
    return ogFonts(files);
  })().catch(e => {
    fonts = undefined;
    throw e;
  }));
}
const cache = new Map<string, Promise<Buffer>>();
export default defineEventHandler(async event => {
  const file = getRouterParam(event, 'file') || '';
  const slug = file.endsWith('.png') ? file.slice(0, -4) : '';
  const lang = getQuery(event).lang === 'uz' ? 'uz' : 'ru';
  const raw = slug && publicPostList().find(p => p.slug === slug);
  const post = raw && localizePost(raw, lang);
  if (!post) throw createError({ statusCode: 404, statusMessage: 'Not found' });
  const key = `${slug}|${lang}|${ogVersion(post)}`;
  let png = cache.get(key);
  if (!png) {
    png = loadFonts().then(f => renderArticleImage(post, f, brand));
    png.catch(() => cache.delete(key));
    cache.set(key, png);
    if (cache.size > 200) cache.delete(cache.keys().next().value!);
  }
  const body = await png;
  setHeader(event, 'Content-Type', 'image/png');
  setHeader(event, 'Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  return body;
});
