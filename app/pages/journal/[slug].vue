<script setup lang="ts">
import { publicationDate } from '#shared/locale.mjs';
import { authorFor, brandName } from '#shared/brand.mjs';
import { PhArrowLeft, PhArrowUpRight, PhClock } from '@phosphor-icons/vue';
import { services as servicesRu } from '~/data/services';
import { servicesUz } from '~/data/services.uz';
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
const service = computed(() =>
  (locale.value === 'uz' ? servicesUz : servicesRu).find(s => s.slug === p.value?.service)
);
const readTime = computed(
  () =>
    p.value?.readTime ||
    `${Math.max(1, Math.ceil((p.value?.content || []).reduce((n: number, s: any) => n + s.body.length, 0) / 1100))} ${locale.value === 'uz' ? 'daqiqa' : 'мин'}`
);
const updated = computed(
  () => !!(p.value?.updatedAt && p.value?.publishedAt && p.value.updatedAt > p.value.publishedAt)
);
const ogImage = computed(() => {
  const post = p.value;
  if (!post) return undefined;
  const url = new URL(`/og/journal/${post.slug}.png`, config.public.siteUrl);
  if (locale.value === 'uz') url.searchParams.set('lang', 'uz');
  url.searchParams.set('v', post.ogVersion);
  return url.href;
});
// Та же обложка, что и для соцсетей, но относительным адресом: картинка грузится с текущего хоста.
const heroSrc = computed(() => {
  const url = ogImage.value ? new URL(ogImage.value) : undefined;
  return url ? url.pathname + url.search : undefined;
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
      post.author && post.author !== authorFor(locale.value)
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
  <article class="post wrap" v-if="p">
    <NuxtLink :to="localPath('/journal')" class="post-back"
      ><PhArrowLeft :size="18" aria-hidden="true" /> {{ t('Все материалы') }}</NuxtLink
    >
    <header class="post-head">
      <ul class="post-tags" :aria-label="t('Темы статьи')">
        <li v-if="p.category">
          <span>#{{ p.category }}</span>
        </li>
        <li v-if="service">
          <NuxtLink :to="localPath(`/services/${service.slug}`)">#{{ service.title }}</NuxtLink>
        </li>
      </ul>
      <h1>{{ p.title }}</h1>
      <p class="post-lede">{{ p.description }}</p>
      <div class="post-byline">
        <BrandMark :size="44" />
        <div>
          <p class="post-byline-name">
            {{ brandName }} <span>· {{ t('Редакция') }}</span>
          </p>
          <p class="post-byline-meta">
            <span v-if="p.author">{{ p.author }}</span>
            <span v-if="p.publishedAt"
              >{{ t('Опубликовано') }}
              <time :datetime="p.publishedAt">{{ date(p.publishedAt) }}</time></span
            >
            <span v-if="updated"
              >{{ t('Обновлено') }}
              <time :datetime="p.updatedAt">{{ date(p.updatedAt) }}</time></span
            >
            <span class="post-read"><PhClock :size="16" aria-hidden="true" /> {{ readTime }}</span>
          </p>
        </div>
      </div>
      <p v-if="p.generation?.assisted" class="post-note">
        {{ t('Подготовлено с помощью ИИ; проверено автором перед публикацией.') }}
      </p>
      <p v-if="p.demo" class="post-note">
        {{
          t(
            'Редакционный пример для предпросмотра. Перед публичным запуском материал проверит и подпишет автор.'
          )
        }}
      </p>
    </header>
    <figure v-if="heroSrc" class="post-hero">
      <img
        :src="heroSrc"
        width="1200"
        height="630"
        :alt="p.title"
        fetchpriority="high"
        decoding="async"
      />
    </figure>
    <div class="post-grid">
      <div class="post-main">
        <div v-if="p.answer" class="post-answer">
          <span class="post-label">{{ t('КОРОТКИЙ ОТВЕТ') }}</span>
          <p>{{ p.answer }}</p>
        </div>
        <nav v-if="p.content.length > 1" class="post-toc" :aria-label="t('В ЭТОЙ СТАТЬЕ')">
          <span class="post-label">{{ t('В ЭТОЙ СТАТЬЕ') }}</span>
          <ul>
            <li v-for="(s, i) in p.content" :key="i">
              <a :href="`#section-${i}`">{{ s.heading }}</a>
            </li>
            <li v-if="p.faq?.length">
              <a href="#questions">{{ t('Вопросы заказчиков') }}</a>
            </li>
            <li v-if="p.sources?.length">
              <a href="#sources">{{ t('Источники') }}</a>
            </li>
          </ul>
        </nav>
        <div class="post-body">
          <section v-for="(s, i) in p.content" :key="i" :id="`section-${i}`">
            <h2>{{ s.heading }}</h2>
            <JournalArticleBlocks :body="s.body" />
          </section>
          <section v-if="p.faq?.length" id="questions" class="post-faq">
            <h2>{{ t('Вопросы заказчиков') }}</h2>
            <div v-for="q in p.faq" :key="q.question" class="post-faq-item">
              <h3>{{ q.question }}</h3>
              <p>{{ q.answer }}</p>
            </div>
          </section>
          <section v-if="p.sources?.length" id="sources" class="post-sources">
            <h2>{{ t('Источники') }}</h2>
            <ul>
              <li v-for="s in p.sources" :key="s.url">
                <a :href="s.url" target="_blank" rel="noopener noreferrer"
                  >{{ s.title }} <PhArrowUpRight :size="16" aria-hidden="true"
                /></a>
              </li>
            </ul>
          </section>
          <NuxtLink :to="localPath(`/services/${p.service || 'websites'}`)" class="post-service"
            >{{ t('Подробнее об услуге') }} <PhArrowUpRight :size="20" aria-hidden="true"
          /></NuxtLink>
        </div>
      </div>
      <aside class="post-aside" :aria-label="t('Полезное по теме')">
        <JournalArticleAside />
      </aside>
    </div>
    <section v-if="related.length" class="post-related">
      <h2>{{ t('Продолжить чтение') }}</h2>
      <JournalCards :posts="related" />
    </section>
  </article>
  <ProjectCta />
</template>
<style scoped>
.post {
  padding-block: 40px 96px;
}
.post-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}
.post-back:hover {
  color: var(--accent);
}
.post-head {
  max-width: 1040px;
  margin-top: 32px;
}
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 24px;
  padding: 0;
  list-style: none;
}
.post-tags span,
.post-tags a {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}
.post-tags a:hover {
  background: var(--accent-soft);
  color: var(--accent);
}
.post-head h1 {
  margin: 0;
  font-size: clamp(36px, 3.7vw, 54px);
  line-height: 1.12;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text);
  overflow-wrap: break-word;
}
.post-lede {
  max-width: 860px;
  margin: 20px 0 0;
  font-size: 22px;
  line-height: 1.5;
  color: var(--muted);
}
.post-byline {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 32px;
}
.post-byline :deep(.brand-mark) {
  flex: none;
  border-radius: 50%;
}
.post-byline p {
  margin: 0;
}
.post-byline-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
.post-byline-name span {
  font-weight: 500;
  color: var(--muted);
}
.post-byline-meta {
  display: flex;
  flex-wrap: wrap;
  column-gap: 8px;
  margin-top: 2px;
  font-size: 14px;
  color: var(--muted);
}
.post-byline-meta > span + span::before {
  content: '·';
  margin-right: 8px;
}
.post-read {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.post-note {
  max-width: 860px;
  margin: 20px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
}
.post-hero {
  margin: 40px 0 0;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
}
.post-hero img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1200 / 630;
}
.post-grid {
  display: grid;
  grid-template-columns: minmax(0, 720px) 320px;
  justify-content: space-between;
  gap: 64px;
  margin-top: 56px;
}
.post-main {
  min-width: 0;
}
.post-aside {
  position: relative;
}
.post-aside > :deep(*) {
  position: sticky;
  top: 112px;
}
.post-label {
  display: block;
  margin-bottom: 12px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
}
.post-answer {
  margin-bottom: 32px;
  padding: 28px 32px;
  border-radius: var(--radius);
  background: var(--accent-soft);
}
.post-answer p {
  margin: 0;
  font-size: 18px;
  line-height: 1.65;
  color: var(--text);
}
.post-toc {
  margin-bottom: 48px;
  padding: 24px 28px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
}
.post-toc ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}
.post-toc a {
  color: var(--text);
  font-size: 15px;
  line-height: 1.45;
  text-decoration: none;
}
.post-toc a:hover {
  color: var(--accent);
}
.post-body section {
  scroll-margin-top: 112px;
}
.post-body section + section {
  margin-top: 48px;
}
.post-body h2 {
  margin: 0 0 20px;
  font-size: 32px;
  line-height: 1.25;
  font-weight: 600;
  color: var(--text);
}
.post-faq-item {
  padding: 24px 28px;
  border-radius: var(--radius);
  background: var(--surface);
}
.post-faq-item + .post-faq-item {
  margin-top: 12px;
}
.post-faq-item h3 {
  margin: 0 0 8px;
  font-size: 19px;
  line-height: 1.4;
  color: var(--text);
}
.post-faq-item p {
  margin: 0;
  font-size: 16px;
  line-height: 1.65;
}
.post-sources ul {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--line);
}
.post-sources li {
  border-bottom: 1px solid var(--line);
}
.post-sources a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  color: var(--text);
  font-size: 16px;
  line-height: 1.45;
  text-decoration: none;
}
.post-sources a:hover {
  color: var(--accent);
}
.post-sources a svg {
  flex: none;
}
.post-service {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 48px;
  color: var(--accent);
  font-size: 17px;
  font-weight: 600;
  text-decoration: none;
}
.post-service:hover {
  color: var(--accent-hover);
}
.post-related {
  margin-top: 96px;
}
.post-related h2 {
  margin: 0 0 32px;
  font-size: clamp(26px, 2.4vw, 34px);
  line-height: 1.2;
}
.post a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}
@media (max-width: 1100px) {
  .post-grid {
    grid-template-columns: minmax(0, 1fr) 280px;
    gap: 40px;
  }
}
@media (max-width: 900px) {
  .post.wrap {
    width: calc(100% - 32px);
  }
  .post {
    padding-block: 24px 64px;
  }
  .post-head {
    margin-top: 24px;
  }
  .post-tags {
    margin-bottom: 18px;
  }
  .post-tags span,
  .post-tags a {
    min-height: 30px;
    padding: 0 12px;
    font-size: 13px;
  }
  .post-head h1 {
    font-size: 32px;
    line-height: 1.18;
    overflow-wrap: anywhere;
  }
  .post-lede {
    margin-top: 14px;
    font-size: 18px;
  }
  .post-byline {
    margin-top: 24px;
  }
  .post-hero {
    margin-top: 28px;
    border-radius: 16px;
  }
  .post-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 48px;
    margin-top: 32px;
  }
  .post-aside > :deep(*) {
    position: static;
  }
  .post-answer,
  .post-toc,
  .post-faq-item {
    padding: 20px;
  }
  .post-answer p {
    font-size: 16px;
  }
  .post-toc {
    margin-bottom: 36px;
  }
  .post-body h2 {
    font-size: 24px;
    margin-bottom: 16px;
  }
  .post-body section + section {
    margin-top: 36px;
  }
  .post-faq-item h3 {
    font-size: 17px;
  }
  .post-related {
    margin-top: 64px;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .post-tags a,
  .post-back,
  .post-toc a,
  .post-sources a {
    transition:
      color 0.2s,
      background 0.2s;
  }
}
</style>
