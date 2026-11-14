// Счётчики и Telegram задаются при запуске: NUXT_PUBLIC_METRIKA_ID, NUXT_PUBLIC_GA_ID, NUXT_PUBLIC_TELEGRAM.
const siteUrl = process.env.SITE_URL || 'http://127.0.0.1:3000';
const indexable = process.env.SITE_INDEXABLE === 'true';
if (
  indexable &&
  (!siteUrl.startsWith('https://') || /localhost|127\.0\.0\.1|example\./.test(siteUrl))
)
  throw new Error('Indexable site requires a real HTTPS SITE_URL');
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  hooks: {
    'pages:extend'(pages) {
      const clone = (p: any): any => ({
        ...p,
        name: p.name ? String(p.name) + '-uz' : undefined,
        children: p.children?.map(clone)
      });
      pages.push(
        ...pages
          .filter(p => p.path !== '/admin')
          .map(p => ({ ...clone(p), path: '/uz' + (p.path === '/' ? '' : p.path) }))
      );
    }
  },
  devtools: { enabled: false },
  // Файлы по насыщенности содержат unicode-range: браузер грузит только нужные наборы символов.
  css: [
    '@fontsource/montserrat/400.css',
    '@fontsource/montserrat/500.css',
    '@fontsource/montserrat/600.css',
    '@fontsource/montserrat/700.css',
    '~/assets/main.css',
    '~/assets/studio.css',
    '~/assets/art-direction.css',
    '~/assets/corporate.css'
  ],
  runtimeConfig: {
    public: {
      siteUrl,
      indexable,
      metrikaId: process.env.YANDEX_METRIKA_ID || '',
      gaId: process.env.GA_MEASUREMENT_ID || '',
      telegram: (process.env.PUBLIC_TELEGRAM || '').trim().replace(/^@/, '')
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [{ name: 'theme-color', content: '#ffffff' }],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/brand/mark.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  },
  nitro: { preset: 'node-server', externals: { external: ['node:sqlite'] } },
  routeRules: {
    '/images/**': {
      headers: { 'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400' }
    },
    '/brand/**': {
      headers: { 'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400' }
    },
    '/favicon-32.png': { headers: { 'Cache-Control': 'public, max-age=2592000' } },
    '/apple-touch-icon.png': { headers: { 'Cache-Control': 'public, max-age=2592000' } },
    '/api/**': { headers: { 'Cache-Control': 'no-store' } },
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        ...(indexable ? {} : { 'X-Robots-Tag': 'noindex, nofollow' })
      }
    }
  }
});
