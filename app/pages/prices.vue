<script setup lang="ts">
import {
  designs,
  extraPage,
  languages,
  options,
  projectTypes,
  thirdLanguage,
  urgency
} from '#shared/pricing.mjs';
import { formatMln, optionLabels, typeLabel } from '~/data/pricing-labels';
const { t, localPath, locale } = useLanguage();
const route = useRoute();
const config = useRuntimeConfig();
usePageSeo(
  'Цены на разработку сайтов и приложений в Ташкенте',
  'Стоимость и сроки разработки лендинга, корпоративного сайта, интернет-магазина, веб-сервиса, Telegram-бота и мобильного приложения в Ташкенте. Цены в сумах.'
);
const mln = (v?: number) => formatMln(v, locale.value);
const pct = (k: number) => `${k > 1 ? '+' : '−'}${Math.round(Math.abs(k - 1) * 100)}%`;
const factors = computed(() => [
  [t('Дизайн на готовой основе'), pct(designs.template.price)],
  [t('Премиум-дизайн с анимацией'), pct(designs.premium.price)],
  [t('RU + UZ для лендинга, веб-сервиса, бота и приложения'), pct(languages[2].price)],
  [t('RU + UZ + EN для лендинга, веб-сервиса, бота и приложения'), pct(languages[3].price)],
  [
    t('Английская версия к корпоративному сайту, каталогу или магазину (RU + UZ уже в цене)'),
    pct(thirdLanguage.price)
  ],
  [t('Срочно — срок на 30% короче'), pct(urgency.price)],
  [
    t('Каждая страница сверх включённых'),
    `+${mln(extraPage.price[0])} – ${mln(extraPage.price[1])} ${t('млн сум')}`
  ]
]);
useHead(() => {
  const site = config.public.siteUrl;
  const url = new URL(route.path, site).href;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    '@id': url + '#prices',
    name: t('Цены на разработку сайтов и приложений в Ташкенте'),
    url,
    inLanguage: locale.value,
    itemListElement: projectTypes.map(p => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: t(typeLabel(p.id)[0]) },
      seller: { '@id': site + '/#org' },
      areaServed: { '@type': 'Country', name: 'Uzbekistan' },
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'UZS',
        minPrice: (p.price[0] ?? 0) * 1_000_000,
        maxPrice: (p.price[1] ?? 0) * 1_000_000
      }
    }))
  };
  return {
    script: [
      {
        key: 'prices-schema',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema).replace(/</g, '\\u003c')
      }
    ]
  };
});
</script>
<template>
  <div>
    <section class="page-intro wrap">
      <h1>{{ t('Цены на разработку') }}<br />{{ t('сайтов и приложений') }}</h1>
      <p class="lede">
        {{
          t(
            'Базовая стоимость и срок по типам проектов. Итог зависит от состава работ: дизайна, языков, интеграций. Цены в сумах.'
          )
        }}
      </p>
      <NuxtLink :to="localPath('/calculator')" class="button"
        >{{ t('Рассчитать свой проект') }} <AppIcon
      /></NuxtLink>
    </section>
    <section class="prices-block wrap">
      <h2>{{ t('Что сколько стоит') }}</h2>
      <PriceTable />
    </section>
    <section class="detail-grid wrap">
      <div>
        <h2>{{ t('Функции и интеграции') }}</h2>
        <ul class="clean-list">
          <li v-for="o in options" :key="o.id" class="price-line">
            <span>{{ t(optionLabels[o.id] || o.id) }}</span><strong
              >+{{ mln(o.price[0]) }} – {{ mln(o.price[1]) }} {{ t('млн сум')
              }}{{ o.perPage ? ' ' + t('за страницу') : '' }}</strong
            >
          </li>
        </ul>
      </div>
      <div>
        <h2>{{ t('Множители и надбавки') }}</h2>
        <ul class="clean-list">
          <li v-for="f in factors" :key="f[0]" class="price-line">
            <span>{{ f[0] }}</span><strong>{{ f[1] }}</strong>
          </li>
        </ul>
      </div>
    </section>
    <section class="estimate-block wrap">
      <h2>{{ t('Дополнительные расходы') }}</h2>
      <p>
        {{
          t(
            'Домен .uz — около 80–100 тыс. сум в год. Хостинг — 50–300 тыс. сум в месяц. Поддержка и доработки — от 0,5–1,5 млн сум в месяц.'
          )
        }}
      </p>
      <p class="prices-note">
        {{
          t(
            'Это предварительная оценка. Точную стоимость и срок назову после короткого обсуждения задачи — бесплатно. Цена фиксируется в договоре до начала работ.'
          )
        }}
      </p>
      <NuxtLink :to="localPath('/calculator')" class="text-link"
        >{{ t('Рассчитать стоимость в калькуляторе') }} <AppIcon
      /></NuxtLink>
    </section>
    <ProjectCta />
  </div>
</template>
<style scoped>
.prices-block {
  border-top: 1px solid var(--line);
  padding-block: 65px;
}
.prices-block h2 {
  margin-top: 20px;
}
.price-line {
  justify-content: space-between;
}
.price-line strong {
  white-space: nowrap;
  text-align: right;
}
.prices-note {
  margin-top: 16px;
  color: var(--muted);
}
@media (max-width: 640px) {
  .price-line {
    flex-direction: column;
    gap: 4px;
  }
  .price-line strong {
    text-align: left;
    white-space: normal;
  }
}
</style>
