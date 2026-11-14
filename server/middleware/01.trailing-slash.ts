// Единый вид адресов без слэша на конце: /services/ → /services (301).
export default defineEventHandler(event => {
  if (event.method !== 'GET' && event.method !== 'HEAD') return;
  const [path, query] = event.path.split(/\?(.*)/s, 2);
  if (path.length < 2 || !path.endsWith('/') || path.startsWith('/api/')) return;
  const clean = path.replace(/\/+$/, '') || '/';
  if (clean.startsWith('//')) return;
  return sendRedirect(event, clean + (query ? '?' + query : ''), 301);
});
