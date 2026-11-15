<script setup lang="ts">
import { portfolio, localizeProject } from '#shared/portfolio.mjs';

// Сетка как у friflex.com: ряды «узкая + широкая», следующий ряд зеркальный,
// нечётный остаток — во всю ширину.
const { locale, localPath } = useLanguage();
const { list: cases } = useCases();

const caseSlugs = computed(() => new Set(cases.value.map((c: any) => c.slug)));
const items = computed(() =>
  portfolio.map((p: any) => {
    const lp = localizeProject(p, locale.value);
    const internal = caseSlugs.value.has(p.slug);
    return { ...lp, internal, to: internal ? localPath('/cases/' + p.slug) : p.url };
  })
);
const rows = computed(() => {
  const out: { flip: boolean; full: boolean; items: any[] }[] = [];
  for (let i = 0; i < items.value.length; i += 2) {
    const chunk = items.value.slice(i, i + 2);
    out.push({ flip: (i / 2) % 2 === 1, full: chunk.length === 1, items: chunk });
  }
  return out;
});

// Пока картинки нет, остаётся фон бренда с названием проекта.
const broken = ref(new Set<string>());
const hide = (slug: string) => {
  broken.value = new Set(broken.value).add(slug);
};
// Ошибка загрузки могла случиться до гидрации — проверяем вручную.
const imgs = ref<HTMLImageElement[]>([]);
onMounted(() => {
  for (const img of imgs.value)
    if (img.complete && img.naturalWidth === 0 && img.dataset.slug) hide(img.dataset.slug);
});
</script>
<template>
  <div class="project-grid">
    <div
      v-for="(row, r) in rows"
      :key="r"
      class="project-row"
      :class="{ 'project-row-flip': row.flip, 'project-row-full': row.full }"
    >
      <NuxtLink
        v-for="p in row.items"
        :key="p.slug"
        :to="p.to"
        :external="!p.internal"
        :target="p.internal ? undefined : '_blank'"
        :rel="p.internal ? undefined : 'noopener'"
        class="project-card"
        data-reveal
      >
        <span class="project-media" :style="{ backgroundColor: p.colors.bg, color: p.colors.fg }">
          <span class="project-fallback" aria-hidden="true">{{ p.name }}</span>
          <img
            v-if="!broken.has(p.slug)"
            ref="imgs"
            :src="`/cases/${p.slug}.webp`"
            :alt="p.name"
            :data-slug="p.slug"
            width="1600"
            height="1100"
            loading="lazy"
            decoding="async"
            @error="hide(p.slug)"
          />
        </span>
        <span class="project-name">{{ p.name }}</span>
        <span class="project-summary">{{ p.summary }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
<style scoped>
.project-grid {
  display: flex;
  flex-direction: column;
  gap: 80px;
}
/* Узкая : широкая = 3 : 4 от общей ширины без зазора, поэтому при
   aspect-ratio 1.1625 и 1.55 высота карточек в ряду совпадает точно. */
.project-row {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 4fr);
  gap: 24px;
}
.project-row-flip {
  grid-template-columns: minmax(0, 4fr) minmax(0, 3fr);
}
.project-row-full {
  grid-template-columns: minmax(0, 1fr);
}
.project-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}
.project-media {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1.1625;
  border-radius: var(--radius, 24px);
  overflow: hidden;
  isolation: isolate;
}
.project-row:not(.project-row-flip) .project-card:nth-child(2) .project-media,
.project-row-flip .project-card:nth-child(1) .project-media {
  aspect-ratio: 1.55;
}
.project-row-full .project-media {
  aspect-ratio: 2;
}
.project-fallback {
  padding: 24px;
  font-size: clamp(26px, 3.2vw, 48px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.02em;
  text-align: center;
  opacity: 0.9;
}
.project-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.project-card:hover .project-media img,
.project-card:focus-visible .project-media img {
  transform: scale(1.03);
}
.project-name {
  margin-top: 28px;
  color: var(--text, #1f1f1f);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.03em;
  transition: color 0.2s ease;
}
.project-card:hover .project-name {
  color: var(--accent);
}
.project-summary {
  margin-top: 12px;
  max-width: 720px;
  color: var(--body, #3c3c3c);
  font-size: 18px;
  line-height: 1.55;
}
@media (prefers-reduced-motion: reduce) {
  .project-media img,
  .project-name {
    transition: none;
  }
  .project-card:hover .project-media img,
  .project-card:focus-visible .project-media img {
    transform: none;
  }
}
@media (max-width: 1100px) {
  .project-name {
    font-size: 32px;
  }
}
@media (max-width: 900px) {
  .project-grid {
    gap: 48px;
  }
  .project-row,
  .project-row-flip {
    grid-template-columns: minmax(0, 1fr);
    gap: 48px;
  }
  .project-media,
  .project-row:not(.project-row-flip) .project-card:nth-child(2) .project-media,
  .project-row-flip .project-card:nth-child(1) .project-media,
  .project-row-full .project-media {
    aspect-ratio: 1.3;
  }
  .project-name {
    margin-top: 20px;
    font-size: 28px;
  }
  .project-summary {
    margin-top: 8px;
    font-size: 16px;
  }
}
</style>
