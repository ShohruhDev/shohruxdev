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
    <img
      class="brand-logo-mark"
      src="/brand/rt-mark.webp"
      alt=""
      width="52"
      height="52"
      decoding="async"
    />
    <span class="brand-logo-type" aria-hidden="true"
      ><strong>RAZRABOTKA<br />TASHKENT</strong></span
    >
  </NuxtLink>
</template>
