<script setup lang="ts">
const { t, localPath, locale } = useLanguage();

import { services as servicesRu } from '~/data/services';
import { servicesUz } from '~/data/services.uz';
import { projectTypes } from '#shared/pricing.mjs';
import { fromMln } from '~/data/pricing-labels';
const services = computed(() => (locale.value === 'uz' ? servicesUz : servicesRu));

const route = useRoute();
const s = computed(() => services.value.find(s => s.slug === route.params.slug));
if (!s.value) throw createError({ statusCode: 404, statusMessage: 'Услуга не найдена' });
const config = useRuntimeConfig();
const priceRange = computed(() => {
  const types = projectTypes.filter(p => p.service === s.value?.code);
  return [
    Math.min(...types.map(p => p.price[0] ?? 0)),
    Math.max(...types.map(p => p.price[1] ?? 0))
  ];
});
const { list: related } = useCases(() => s.value?.code);
const fromPrice = computed(() => fromMln(priceRange.value[0], locale.value));
usePageSeo(
  () => `${s.value?.seoTitle || s.value?.title || ''} — ${fromPrice.value}`,
  () => s.value?.seoDescription || s.value?.intro || '',
  undefined,
  undefined,
  { parent: { name: 'Услуги', path: '/services' } }
);
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
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'UZS',
      lowPrice: (priceRange.value[0] ?? 0) * 1_000_000,
      highPrice: (priceRange.value[1] ?? 0) * 1_000_000,
      url: new URL(localPath('/prices'), site).href
    },
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
      >
      <h1>{{ s.headline }}</h1>
      <p class="lede">
        <strong>{{ s.tagline }}</strong> {{ s.intro }}
      </p>
      <NuxtLink
        :to="{ path: localPath('/contact'), query: { service: s.code } }"
        class="button"
        rel="nofollow"
        >{{ t('Обсудить задачу') }} <AppIcon
      /></NuxtLink>
    </section>
    <section class="detail-grid wrap">
      <div>
        <h2>{{ s.forTitle }}</h2>
        <ul class="clean-list">
          <li v-for="item in s.for" :key="item"><AppIcon name="check" :size="20" />{{ item }}</li>
        </ul>
      </div>
      <div>
        <h2>{{ s.deliverTitle }}</h2>
        <ul class="clean-list">
          <li v-for="item in s.deliver" :key="item">
            <AppIcon name="check" :size="20" />{{ item }}
          </li>
        </ul>
      </div>
    </section>
    <section class="estimate-block wrap">
      <h2>{{ t('Стоимость') }} — {{ fromPrice }}</h2>
      <PriceTable :service="s.code" />
      <p class="estimate-note">
        {{ s.factors }}
        {{
          t(
            'Сначала уточняем задачу, затем согласуем объём, стоимость и этапы. Работы за пределами согласованного объёма оцениваются отдельно.'
          )
        }}
      </p>
      <div class="estimate-links">
        <NuxtLink :to="localPath('/calculator')" class="text-link"
          >{{ t('Рассчитать стоимость в калькуляторе') }} <AppIcon /></NuxtLink
        ><NuxtLink :to="localPath('/prices')" class="text-link"
          >{{ t('Все цены') }} <AppIcon
        /></NuxtLink>
      </div>
    </section>
    <section v-if="related.length" class="related-cases wrap">
      <h2>{{ t('Проекты по направлению') }}</h2>
      <CaseCards :items="related" />
    </section>
    <section class="faq wrap">
      <h2>{{ s.faqTitle }}</h2>
      <details v-for="item in s.faq" :key="item[0]">
        <summary>{{ item[0] }}<AppIcon name="plus" /></summary>
        <p>{{ item[1] }}</p>
      </details>
    </section>
    <ProjectCta />
  </div>
</template>
<style scoped>
.estimate-note {
  margin-top: 28px;
}
.related-cases {
  padding-block: 65px;
  border-bottom: 1px solid var(--line);
}
.estimate-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 32px;
  margin-top: 8px;
}
</style>
