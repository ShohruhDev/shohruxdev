<script setup lang="ts">
import { publicationDate } from '#shared/locale.mjs';
import { authorName, brandName } from '#shared/brand.mjs';
const { t, localPath, locale } = useLanguage();

const route = useRoute();
const config = useRuntimeConfig();
const { data: posts } = await useFetch<any[]>('/api/posts', { query: { lang: locale } });
const p = computed(() => posts.value?.find(p => p.slug === route.params.slug));
if (!p.value) throw createError({ statusCode: 404, statusMessage: 'Материал не найден' });
const related = computed(() =>
  (posts.value || [])
    .filter(x => x.slug !== p.value?.slug && x.service === p.value?.service)
    .slice(0, 3)
);
const date = (v: string) => publicationDate(v, locale.value);
const ogImage = computed(() => {
  const post = p.value;
  if (!post) return undefined;
  const url = new URL(`/og/journal/${post.slug}.png`, config.public.siteUrl);
  if (locale.value === 'uz') url.searchParams.set('lang', 'uz');
  url.searchParams.set('v', post.ogVersion);
  return url.href;
});
usePageSeo(
  () => p.value?.title || '',
  () => p.value?.description || '',
  () => !!p.value?.demo,
  () => p.value?.availableLocales || ['ru'],
  { parent: { name: 'Журнал', path: '/journal' }, image: () => ogImage.value }
);
useSeoMeta({ ogType: 'article' });
useHead(() => {
  const post = p.value;
  if (!post) return {};
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    inLanguage: locale.value,
    image: ogImage.value,
    author:
      post.author && post.author !== authorName
        ? { '@type': 'Person', name: post.author }
        : { '@id': config.public.siteUrl + '/#person' },
    publisher: { '@id': config.public.siteUrl + '/#org' },
    ...(post.publishedAt
      ? {
          datePublished: post.publishedAt,
          dateModified: post.updatedAt > post.publishedAt ? post.updatedAt : post.publishedAt
        }
      : {}),
    mainEntityOfPage: new URL(route.path, config.public.siteUrl).href,
    ...(post.sources?.length ? { citation: post.sources.map((s: any) => s.url) } : {})
  };
  return {
    script: [
      { type: 'application/ld+json', innerHTML: JSON.stringify(schema).replace(/</g, '\\u003c') }
    ],
    link: [
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: `${brandName} — ${t('журнал')}`,
        href: localPath('/feed.xml')
      }
    ]
  };
});
</script>
<template>
  <article class="article wrap" v-if="p">
    <NuxtLink :to="localPath('/journal')" class="back-link"
      ><AppIcon name="left" :size="18" /> {{ t('Все материалы') }}</NuxtLink
    >
    <div class="article-meta">
      {{ p.category
      }}<span>{{
        p.readTime ||
        `${Math.max(1, Math.ceil(p.content.reduce((n: number, s: any) => n + s.body.length, 0) / 1100))} ${locale === 'uz' ? 'daqiqa' : 'мин'}`
      }}</span>
    </div>
    <h1>{{ p.title }}</h1>
    <p class="lede">{{ p.description }}</p>
    <p v-if="p.author" class="author-line">
      {{ p.author }}
      <span v-if="p.publishedAt">{{ t('· Опубликовано') }} {{ date(p.publishedAt) }}</span
      ><span v-if="p.updatedAt && p.publishedAt && p.updatedAt > p.publishedAt">
        {{ t('· Обновлено') }} {{ date(p.updatedAt) }}</span
      >
    </p>
    <p v-if="p.generation?.assisted" class="author-line">
      {{ t('Подготовлено с помощью ИИ; проверено автором перед публикацией.') }}
    </p>
    <p v-if="p.demo" class="preview-note">
      {{
        t(
          'Редакционный пример для предпросмотра. Перед публичным запуском материал проверит и подпишет автор.'
        )
      }}
    </p>
    <div v-if="p.answer" class="article-answer">
      <span class="label-text">{{ t('КОРОТКИЙ ОТВЕТ') }}</span>
      <p>{{ p.answer }}</p>
    </div>
    <div class="article-layout">
      <aside>
        <span class="label-text">{{ t('В ЭТОЙ СТАТЬЕ') }}</span><a
          v-for="(s, i) in p.content"
          :key="i"
          :href="`#section-${i}`"
          >{{ s.heading }}</a
        ><a v-if="p.faq?.length" href="#questions">{{ t('Вопросы заказчиков') }}</a
        ><a v-if="p.sources?.length" href="#sources">{{ t('Источники') }}</a>
      </aside>
      <div class="article-body">
        <section v-for="(s, i) in p.content" :key="i" :id="`section-${i}`">
          <h2>{{ s.heading }}</h2>
          <p>{{ s.body }}</p>
        </section>
        <section v-if="p.faq?.length" id="questions" class="article-faq">
          <h2>{{ t('Вопросы заказчиков') }}</h2>
          <div v-for="q in p.faq" :key="q.question">
            <h3>{{ q.question }}</h3>
            <p>{{ q.answer }}</p>
          </div>
        </section>
        <div v-if="p.sources?.length" id="sources" class="sources">
          <h3>{{ t('Источники') }}</h3>
          <a
            v-for="s in p.sources"
            :key="s.url"
            :href="s.url"
            target="_blank"
            rel="noopener noreferrer"
            >{{ s.title }} <AppIcon :size="16"
          /></a>
        </div>
        <NuxtLink :to="localPath(`/services/${p.service || 'websites'}`)" class="text-link"
          >{{ t('Подробнее об услуге') }} <AppIcon :size="20"
        /></NuxtLink>
        <div v-if="related.length" class="article-related">
          <h3>{{ t('Продолжить чтение') }}</h3>
          <NuxtLink v-for="r in related" :key="r.slug" :to="localPath(`/journal/${r.slug}`)"
            >{{ r.title }} →</NuxtLink
          >
        </div>
      </div>
    </div>
  </article>
  <ProjectCta />
</template>
