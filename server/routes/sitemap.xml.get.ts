import { cases } from '#shared/cases.mjs';
export default defineEventHandler(event => {
  const c = useRuntimeConfig();
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  const paths = [
    '/',
    '/services',
    '/services/websites',
    '/services/web-apps',
    '/services/mobile-apps',
    '/process',
    '/calculator',
    '/prices',
    '/journal',
    '/contact',
    ...(cases.length ? ['/cases', ...cases.map((c: any) => `/cases/${c.slug}`)] : [])
  ].map(path => ({ path, modified: '' }));
  paths.push(
    ...storage()
      .publicPosts()
      .map((p: any) => ({
        path: `/journal/${p.slug}`,
        modified: p.updatedAt > p.publishedAt ? p.updatedAt : p.publishedAt
      }))
  );
  const uzPath = (path: string) => '/uz' + (path === '/' ? '' : path);
  const hasUz = (path: string) =>
    !path.startsWith('/journal/') || !!storage().post(path.split('/').pop())?.translations?.uz;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const abs = (path: string) => esc(new URL(path, c.public.siteUrl).href);
  const entries = paths.flatMap(p => {
    if (!hasUz(p.path)) return [{ ...p, alternates: '' }];
    const alternates =
      `<xhtml:link rel="alternate" hreflang="ru" href="${abs(p.path)}"/>` +
      `<xhtml:link rel="alternate" hreflang="uz" href="${abs(uzPath(p.path))}"/>` +
      `<xhtml:link rel="alternate" hreflang="x-default" href="${abs(p.path)}"/>`;
    return [
      { ...p, alternates },
      { ...p, path: uzPath(p.path), alternates }
    ];
  });
  return (
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    (c.public.indexable
      ? entries
          .map(
            p =>
              `<url><loc>${abs(p.path)}</loc>${p.modified ? `<lastmod>${esc(p.modified)}</lastmod>` : ''}${p.alternates}</url>`
          )
          .join('')
      : '') +
    '</urlset>'
  );
});
