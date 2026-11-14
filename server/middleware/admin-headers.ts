export default defineEventHandler(event => {
  if (event.path.startsWith('/admin') || event.path.startsWith('/api/admin')) {
    setHeaders(event, {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer',
      'X-Frame-Options': 'DENY'
    });
  }
});
