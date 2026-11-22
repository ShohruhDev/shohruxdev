import { localizePost, localePath } from '#shared/locale.mjs';
import { authorFor, brandName } from '#shared/brand.mjs';
export default defineEventHandler(event => {
  const c = useRuntimeConfig();
  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8');
  setHeader(event, 'X-Robots-Tag', 'noindex');
  const lang = getQuery(event).lang === 'uz' ? 'uz' : 'ru';
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const posts = c.public.indexable
    ? storage()
        .publicPosts()
        .map(p => localizePost(p, lang))
        .filter(Boolean)
        .slice(0, 50)
    : [];
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${brandName} — ${lang === 'uz' ? 'blog' : 'журнал'}</title><link>${esc(c.public.siteUrl)}${localePath('/journal', lang)}</link><description>${lang === 'uz' ? 'Dasturlash biznes tilida.' : 'Разработка на языке бизнеса.'} ${authorFor(lang)}.</description><language>${lang}</language>${posts
    .map((p: any) => {
      const url = esc(new URL(localePath('/journal/' + p.slug, lang), c.public.siteUrl).href);
      return `<item><title>${esc(p.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`;
    })
    .join('')}</channel></rss>`;
});
