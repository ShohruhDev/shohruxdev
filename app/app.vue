<script setup lang="ts">
import { authorName, brandAlternateName, brandName } from '#shared/brand.mjs';
import { cases } from '#shared/cases.mjs';
const hasCases = cases.length > 0;
const { t, localPath, locale } = useLanguage();

const config = useRuntimeConfig();
const menuOpen = ref(false);
const route = useRoute();
useHead(() => {
  const site = config.public.siteUrl,
    home = new URL(localPath('/'), site).href;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': site + '/#org',
        name: brandName,
        alternateName: brandAlternateName,
        url: site + '/',
        logo: site + '/brand/rt-logo-512.jpg',
        image: site + '/images/og-default.jpg',
        description: t(
          'Разработка сайтов, веб-сервисов и мобильных приложений для бизнеса в Узбекистане и СНГ.'
        ),
        founder: { '@id': site + '/#person' },
        address: { '@type': 'PostalAddress', addressLocality: 'Tashkent', addressCountry: 'UZ' },
        areaServed: [
          { '@type': 'Country', name: 'Uzbekistan' },
          { '@type': 'Place', name: 'CIS' }
        ],
        knowsLanguage: ['ru', 'uz'],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          url: new URL(localPath('/contact'), site).href,
          availableLanguage: ['ru', 'uz']
        }
      },
      {
        '@type': 'Person',
        '@id': site + '/#person',
        name: authorName,
        jobTitle: t('Разработчик сайтов и мобильных приложений'),
        url: site + '/',
        worksFor: { '@id': site + '/#org' }
      },
      {
        '@type': 'WebSite',
        '@id': site + '/#website',
        name: brandName,
        alternateName: brandAlternateName,
        url: home,
        inLanguage: locale.value,
        publisher: { '@id': site + '/#org' }
      }
    ]
  };
  return {
    htmlAttrs: { lang: locale.value },
    script: [
      {
        key: 'site-schema',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema).replace(/</g, '\\u003c')
      }
    ]
  };
});
watch(
  () => route.fullPath,
  () => (menuOpen.value = false)
);
</script>
<template>
  <div :class="route.path === '/admin' ? 'app-admin' : 'app-public'">
    <a class="skip" href="#main">{{ t('К содержанию') }}</a>
    <header class="header wrap">
      <BrandLogo />
      <LanguageSwitch />
      <nav class="desktop-nav" :aria-label="t('Основная навигация')">
        <NuxtLink :to="localPath('/services')">{{ t('Услуги') }}</NuxtLink><NuxtLink
          :to="localPath('/process')"
          >{{ t('Подход') }}</NuxtLink
        ><NuxtLink :to="localPath('/calculator')">{{ t('Калькулятор') }}</NuxtLink
        ><NuxtLink :to="localPath('/prices')">{{ t('Цены') }}</NuxtLink
        ><NuxtLink v-if="hasCases" :to="localPath('/cases')">{{ t('Кейсы') }}</NuxtLink
        ><NuxtLink :to="localPath('/journal')">{{ t('Журнал') }}</NuxtLink>
      </nav>
      <NuxtLink :to="localPath('/contact')" class="button button-small header-cta">{{
        t('Обсудить проект')
      }}</NuxtLink>
      <button
        class="menu-toggle"
        :aria-expanded="menuOpen"
        aria-controls="mobile-nav"
        :aria-label="menuOpen ? t('Закрыть меню') : t('Открыть меню')"
        @click="menuOpen = !menuOpen"
      >
        <AppIcon :name="menuOpen ? 'close' : 'menu'" />
      </button>
      <nav
        v-if="menuOpen"
        id="mobile-nav"
        class="mobile-nav"
        :aria-label="t('Мобильная навигация')"
        @keydown.esc="menuOpen = false"
      >
        <NuxtLink :to="localPath('/services')">{{ t('Услуги') }}</NuxtLink><NuxtLink
          :to="localPath('/process')"
          >{{ t('Подход') }}</NuxtLink
        ><NuxtLink :to="localPath('/calculator')">{{ t('Калькулятор') }}</NuxtLink
        ><NuxtLink :to="localPath('/prices')">{{ t('Цены') }}</NuxtLink
        ><NuxtLink v-if="hasCases" :to="localPath('/cases')">{{ t('Кейсы') }}</NuxtLink
        ><NuxtLink :to="localPath('/journal')">{{ t('Журнал') }}</NuxtLink
        ><NuxtLink :to="localPath('/contact')">{{ t('Обсудить проект') }}</NuxtLink>
      </nav>
    </header>
    <MotionControl v-if="route.path !== '/admin'" />
    <main id="main"><NuxtPage :page-key="pageRoute => pageRoute.path" /></main>
    <footer class="footer wrap">
      <div>
        <BrandLogo />
        <p>{{ t('Независимая разработка.') }}<br />{{ t('Узбекистан и СНГ.') }}</p>
      </div>
      <div class="footer-links">
        <NuxtLink :to="localPath('/services')">{{ t('Услуги') }}</NuxtLink><NuxtLink
          :to="localPath('/calculator')"
          >{{ t('Калькулятор') }}</NuxtLink
        ><NuxtLink :to="localPath('/prices')">{{ t('Цены') }}</NuxtLink
        ><NuxtLink v-if="hasCases" :to="localPath('/cases')">{{ t('Кейсы') }}</NuxtLink
        ><NuxtLink :to="localPath('/journal')">{{ t('Журнал') }}</NuxtLink
        ><NuxtLink :to="localPath('/contact')">{{ t('Обсудить проект') }}</NuxtLink
        ><TelegramLink place="footer" label="Telegram" /><NuxtLink :to="localPath('/privacy')">{{
          t('Обработка данных')
        }}</NuxtLink
        ><NuxtLink v-if="!config.public.indexable" :to="localPath('/admin')">{{
          t('Редакция')
        }}</NuxtLink>
      </div>
      <div class="footer-note">
        {{ t('Веб. Мобильные приложения.') }}<br />{{ t('Внимание к деталям.') }}
      </div>
    </footer>
  </div>
</template>
