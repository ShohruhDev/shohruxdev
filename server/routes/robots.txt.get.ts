export default defineEventHandler(event => {
  const c = useRuntimeConfig();
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  if (!c.public.indexable) return 'User-agent: *\nDisallow: /\n';
  const rules = 'Allow: /\nDisallow: /api/\nDisallow: /admin\n';
  return `User-agent: *\n${rules}\nUser-agent: OAI-SearchBot\n${rules}\nSitemap: ${c.public.siteUrl}/sitemap.xml\n`;
});
