<script setup lang="ts">
import { portfolio, localizeProject } from '#shared/portfolio.mjs';
const { locale } = useLanguage();
const items = computed(() => portfolio.map((p: any) => localizeProject(p, locale.value)));
const host = (url: string) => new URL(url).host.replace(/^www\./, '');
</script>
<template>
  <div class="project-tiles">
    <a
      v-for="(p, i) in items"
      :key="p.slug"
      :href="p.url"
      target="_blank"
      rel="noopener"
      class="project-tile"
      :class="{ 'project-tile-wide': i === 0 }"
      data-reveal
    >
      <span
        class="project-tile-art"
        :style="{ background: p.colors.bg, color: p.colors.fg }"
        aria-hidden="true"
        ><span class="project-tile-kind">{{ p.kind }}</span
        ><span class="project-tile-name">{{ p.name }}</span
        ><span class="project-tile-host">{{ host(p.url) }} ↗</span></span
      >
      <span class="project-tile-caption">
        <strong>{{ p.name }}</strong>
        <span>{{ p.summary }}</span>
      </span>
    </a>
  </div>
</template>
<style scoped>
.project-tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px 20px;
}
.project-tile {
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: inherit;
}
.project-tile-wide {
  grid-column: 1 / -1;
}
.project-tile-art {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  aspect-ratio: 16 / 9;
  padding: 32px;
  border-radius: var(--radius, 24px);
  overflow: hidden;
  text-align: center;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.project-tile-wide .project-tile-art {
  aspect-ratio: 21 / 8;
}
.project-tile:hover .project-tile-art {
  transform: scale(0.99);
}
.project-tile-name {
  font-size: clamp(30px, 4vw, 60px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.02em;
}
.project-tile-kind {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.75;
}
.project-tile-host {
  position: absolute;
  right: 24px;
  bottom: 20px;
  font-size: 13px;
  font-weight: 600;
  opacity: 0.7;
}
.project-tile-caption {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.project-tile-caption strong {
  font-size: 22px;
  font-weight: 600;
}
.project-tile-caption span {
  color: var(--body, #3c3c3c);
  line-height: 1.6;
  max-width: 640px;
}
.project-tile:hover .project-tile-caption strong {
  color: var(--accent);
}
@media (max-width: 760px) {
  .project-tiles {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .project-tile-art,
  .project-tile-wide .project-tile-art {
    aspect-ratio: 4 / 3;
  }
  .project-tile-name {
    font-size: 34px;
  }
}
</style>
