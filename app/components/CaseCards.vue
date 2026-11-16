<script setup lang="ts">
defineProps<{ items: any[] }>();
const { t, localPath } = useLanguage();
const { serviceTitle } = useCases();
</script>
<template>
  <div class="case-cards">
    <NuxtLink
      v-for="c in items"
      :key="c.slug"
      :to="localPath('/cases/' + c.slug)"
      class="case-card"
    >
      <img
        v-if="c.cover"
        :src="c.cover.src"
        :width="c.cover.width"
        :height="c.cover.height"
        :alt="c.title"
        loading="lazy"
        decoding="async"
      />
      <span class="case-meta">{{ serviceTitle(c.service) }} · {{ c.year }}</span>
      <strong>{{ c.title }}</strong>
      <span class="case-summary">{{ c.summary }}</span>
      <span class="text-link">{{ t('Читать кейс') }} <AppIcon /></span>
    </NuxtLink>
  </div>
</template>
<style scoped>
.case-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 32px;
}
.case-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: inherit;
}
.case-card:hover {
  border-color: var(--accent);
}
.case-card img {
  width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
}
.case-card strong {
  font-size: 20px;
  line-height: 1.3;
}
.case-meta {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.case-summary {
  color: var(--muted);
  line-height: 1.6;
}
</style>
