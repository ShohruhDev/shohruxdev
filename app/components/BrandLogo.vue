<script setup lang="ts">
import { brandName } from '#shared/brand.mjs';
const { locale, localPath } = useLanguage();
</script>

<template>
  <NuxtLink
    :to="localPath('/')"
    class="brand-logo"
    :aria-label="`${brandName} — ${locale === 'uz' ? 'bosh sahifa' : 'главная'}`"
  >
    <BrandMark class="brand-logo-mark" :size="40" />
    <span class="brand-logo-type" aria-hidden="true"
      ><strong>Razrabotka</strong><span>Tashkent</span></span
    >
  </NuxtLink>
</template>
