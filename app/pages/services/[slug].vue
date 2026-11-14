<script setup lang="ts">
const { t, localPath, locale } = useLanguage();

import { services as servicesRu } from '~/data/services';
import { servicesUz } from '~/data/services.uz';
const services = computed(() => (locale.value === 'uz' ? servicesUz : servicesRu));

const route = useRoute();
const s = computed(() => services.value.find(s => s.slug === route.params.slug));
if (!s.value) throw createError({ statusCode: 404, statusMessage: 'Услуга не найдена' });
usePageSeo(
  () => s.value?.seoTitle || s.value?.title || '',
  () => s.value?.seoDescription || s.value?.intro || '',
  undefined,
  undefined,
  { parent: { name: 'Услуги', path: '/services' } }
);
const config = useRuntimeConfig();
useHead(() => {
  const svc = s.value;
  if (!svc) return {};
  const site = config.public.siteUrl;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': new URL(route.path, site).href + '#service',
    name: svc.seoTitle || svc.title,
    serviceType: svc.title,
    description: svc.seoDescription || svc.intro,
    url: new URL(route.path, site).href,
    inLanguage: locale.value,
    provider: { '@id': site + '/#org' },
    areaServed: { '@type': 'Country', name: 'Uzbekistan' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t('Что входит в проект'),
      itemListElement: svc.deliver.map((name: string) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name }
      }))
    }
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: svc.faq.map((q: string[]) => ({
      '@type': 'Question',
      name: q[0],
      acceptedAnswer: { '@type': 'Answer', text: q[1] }
    }))
  };
  return {
    script: [
      { type: 'application/ld+json', innerHTML: JSON.stringify(schema).replace(/</g, '\\u003c') },
      { type: 'application/ld+json', innerHTML: JSON.stringify(faq).replace(/</g, '\\u003c') }
    ]
  };
});
</script>
<template>
  <div v-if="s">
    <section class="page-intro wrap">
      <NuxtLink class="back-link" :to="localPath('/services')"
        ><AppIcon name="left" :size="18" /> {{ t('Все услуги') }}</NuxtLink
      ><span class="eyebrow">{{ s.eyebrow }}</span>
      <h1>{{ s.headline }}</h1>
      <p class="lede">{{ s.intro }}</p>
      <NuxtLink :to="{ path: localPath('/contact'), query: { service: s.code } }" class="button"
        >{{ t('Обсудить задачу') }} <AppIcon
      /></NuxtLink>
    </section>
    <section class="detail-grid wrap">
      <div>
        <span class="eyebrow">{{ t('КОГДА НУЖНО') }}</span>
        <h2>{{ t('Узнаёте свою задачу?') }}</h2>
        <ul class="clean-list">
          <li v-for="item in s.for" :key="item"><AppIcon name="check" :size="20" />{{ item }}</li>
        </ul>
      </div>
      <div>
        <span class="eyebrow">{{ t('РЕЗУЛЬТАТ РАБОТЫ') }}</span>
        <h2>{{ t('Что входит в проект') }}</h2>
        <ul class="clean-list">
          <li v-for="item in s.deliver" :key="item">
            <AppIcon name="check" :size="20" />{{ item }}
          </li>
        </ul>
      </div>
    </section>
    <section class="estimate-block wrap">
      <span class="eyebrow">{{ t('СТОИМОСТЬ И СРОКИ') }}</span>
      <h2>{{ t('Оценка начинается') }}<br />{{ t('с состава работ.') }}</h2>
      <p>
        {{ s.factors }}
        {{
          t(
            'Сначала уточняем задачу, затем согласуем объём, стоимость и этапы. Работы за пределами согласованного объёма оцениваются отдельно.'
          )
        }}
      </p>
      <NuxtLink :to="localPath('/calculator')" class="text-link"
        >{{ t('Рассчитать стоимость в калькуляторе') }} <AppIcon
      /></NuxtLink>
    </section>
    <section class="faq wrap">
      <h2>{{ t('Частые вопросы') }}</h2>
      <details v-for="item in s.faq" :key="item[0]">
        <summary>{{ item[0] }}<AppIcon name="plus" /></summary>
        <p>{{ item[1] }}</p>
      </details>
    </section>
    <ProjectCta />
  </div>
</template>
