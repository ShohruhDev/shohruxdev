<script setup lang="ts">
import { localePath } from '#shared/locale.mjs';
const route = useRoute();
const { locale } = useLanguage();
const available = useState<string[]>('page-languages', () => ['ru', 'uz']);
function target(lang: string) {
  const path = available.value.includes(lang)
    ? localePath(route.path, lang)
    : localePath('/journal', lang);
  return { path, query: route.query };
}
</script>
<template>
  <nav v-if="route.path !== '/admin'" class="language-switch" aria-label="Til / Язык">
    <NuxtLink
      v-for="lang in ['ru', 'uz']"
      :key="lang"
      :to="target(lang)"
      :lang="lang"
      :aria-current="locale === lang ? 'page' : undefined"
      :class="{ selected: locale === lang }"
      >{{ lang.toUpperCase() }}</NuxtLink
    >
  </nav>
</template>
