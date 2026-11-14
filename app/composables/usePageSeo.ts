import { localePath } from '#shared/locale.mjs';
import { brandName } from '#shared/brand.mjs';
export function usePageSeo(
  title: string | (() => string),
  description: string | (() => string),
  noindex: boolean | (() => boolean) = false,
  availableLocales: string[] | (() => string[]) = ['ru', 'uz']
) {
  const config = useRuntimeConfig();
  const route = useRoute();
  const { t, locale, localPath } = useLanguage();
  const url = () => new URL(route.path, config.public.siteUrl).href;
  const titleText = () => t(toValue(title)),
    descriptionText = () => t(toValue(description));
  useSeoMeta({
    title: () => (titleText().length > 40 ? titleText() : `${titleText()} — ${brandName}`),
    description: descriptionText,
    ogTitle: titleText,
    ogDescription: descriptionText,
    ogType: 'website',
    ogUrl: url,
    ogLocale: () => (locale.value === 'uz' ? 'uz_UZ' : 'ru_RU'),
    ogImage: new URL('/images/og-default.jpg', config.public.siteUrl).href,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: () => t('Интерфейс веб-сервиса и мобильного приложения'),
    ogSiteName: brandName,
    twitterCard: 'summary_large_image',
    robots: () =>
      !config.public.indexable || toValue(noindex) ? 'noindex, nofollow' : 'index, follow'
  });
  useHead(() => {
    const available = toValue(availableLocales);
    const home = new URL(localPath('/'), config.public.siteUrl).href;
    const breadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t('Главная'), item: home },
        ...(route.path === localPath('/')
          ? []
          : [{ '@type': 'ListItem', position: 2, name: titleText(), item: url() }])
      ]
    };
    return {
      htmlAttrs: { lang: locale.value },
      link: [
        { rel: 'canonical', href: url() },
        ...(route.path === '/admin'
          ? []
          : available.map(lang => ({
              rel: 'alternate' as const,
              hreflang: lang,
              href: new URL(localePath(route.path, lang), config.public.siteUrl).href
            }))),
        ...(available.includes('ru') && route.path !== '/admin'
          ? [
              {
                rel: 'alternate' as const,
                hreflang: 'x-default',
                href: new URL(localePath(route.path, 'ru'), config.public.siteUrl).href
              }
            ]
          : [])
      ],
      script: [
        {
          key: 'breadcrumbs',
          type: 'application/ld+json',
          innerHTML: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c')
        }
      ]
    };
  });
}
