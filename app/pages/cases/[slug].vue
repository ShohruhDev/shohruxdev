<script setup lang="ts">
const { t, localPath, locale } = useLanguage();
const route = useRoute();
const config = useRuntimeConfig();
const { list, serviceTitle } = useCases();
const c = computed(() => list.value.find((x: any) => x.slug === route.params.slug));
if (!c.value) throw createError({ statusCode: 404, statusMessage: 'Кейс не найден' });
const hostOf = (url: string) => new URL(url).host;
const serviceSlug: Record<string, string> = {
  web: 'websites',
  apps: 'web-apps',
  mobile: 'mobile-apps'
};
usePageSeo(
  () => c.value?.title || '',
  () => c.value?.summary || '',
  undefined,
  undefined,
  { parent: { name: 'Кейсы', path: '/cases' } }
);
useHead(() => {
  const item = c.value;
  if (!item) return {};
  const site = config.public.siteUrl;
  const url = new URL(route.path, site).href;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': url + '#case',
    name: item.title,
    description: item.summary,
    url,
    inLanguage: locale.value,
    dateCreated: String(item.year),
    creator: { '@id': site + '/#person' },
    publisher: { '@id': site + '/#org' },
    keywords: item.stack.join(', '),
    ...(item.cover ? { image: new URL(item.cover.src, site).href } : {}),
    ...(item.links?.length ? { sameAs: item.links.map((l: any) => l.url) } : {})
  };
  return {
    script: [
      {
        key: 'case-schema',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema).replace(/</g, '\\u003c')
      }
    ]
  };
});
</script>
<template>
  <article v-if="c">
    <section class="page-intro wrap">
      <NuxtLink class="back-link" :to="localPath('/cases')"
        ><AppIcon name="left" :size="18" /> {{ t('Все кейсы') }}</NuxtLink
      ><span class="eyebrow">{{ serviceTitle(c.service) }} · {{ c.year }}</span>
      <h1>{{ c.title }}</h1>
      <p class="lede">{{ c.summary }}</p>
      <p class="case-client">{{ t('Клиент') }}: {{ c.client }}</p>
    </section>
    <section v-if="c.cover" class="wrap case-cover">
      <img
        :src="c.cover.src"
        :width="c.cover.width"
        :height="c.cover.height"
        :alt="c.title"
        fetchpriority="high"
      />
    </section>
    <section class="detail-grid wrap">
      <div>
        <span class="eyebrow">{{ t('ЗАДАЧА') }}</span>
        <h2>{{ t('С чего начинали') }}</h2>
        <p class="case-text">{{ c.task }}</p>
      </div>
      <div>
        <span class="eyebrow">{{ t('РЕШЕНИЕ') }}</span>
        <h2>{{ t('Что сделано') }}</h2>
        <ul class="clean-list">
          <li v-for="item in c.solution" :key="item">
            <AppIcon name="check" :size="20" />{{ item }}
          </li>
        </ul>
      </div>
    </section>
    <section class="estimate-block wrap">
      <span class="eyebrow">{{ t('РЕЗУЛЬТАТ') }}</span>
      <h2>{{ t('Что изменилось') }}</h2>
      <ul class="clean-list">
        <li v-for="item in c.results" :key="item"><AppIcon name="check" :size="20" />{{ item }}</li>
      </ul>
      <p class="case-stack">
        <strong>{{ t('Технологии') }}:</strong> {{ c.stack.join(', ') }}
      </p>
      <p v-if="c.links?.length" class="case-links">
        <a
          v-for="l in c.links"
          :key="l.url"
          :href="l.url"
          class="text-link"
          target="_blank"
          rel="noopener"
          >{{ l.label || hostOf(l.url) }} <AppIcon
        /></a>
      </p>
    </section>
    <section v-if="c.testimonial" class="wrap case-quote">
      <blockquote>
        <p>«{{ c.testimonial.text }}»</p>
        <footer>{{ c.testimonial.author }}</footer>
      </blockquote>
    </section>
    <section class="wrap case-next">
      <NuxtLink :to="localPath('/services/' + serviceSlug[c.service])" class="text-link"
        >{{ serviceTitle(c.service) }} <AppIcon
      /></NuxtLink>
    </section>
    <ProjectCta />
  </article>
</template>
<style scoped>
.case-client {
  margin-top: 16px;
  color: var(--muted);
}
.case-cover img {
  width: 100%;
  height: auto;
  border-radius: 24px;
}
.case-text {
  margin-top: 30px;
  font-size: 17px;
  line-height: 1.7;
}
.case-stack,
.case-links {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
}
.case-quote {
  padding-block: 65px;
}
.case-quote blockquote {
  margin: 0;
  max-width: 860px;
}
.case-quote p {
  font-size: 24px;
  line-height: 1.5;
}
.case-quote footer {
  margin-top: 16px;
  color: var(--muted);
}
.case-next {
  padding-bottom: 40px;
}
</style>
