<script setup lang="ts">
const { locale, localPath } = useLanguage();
</script>

<template>
  <NuxtLink
    :to="localPath('/')"
    class="brand-logo"
    :aria-label="locale === 'uz' ? 'Burxonov Shohrux — bosh sahifa' : 'Burxonov Shohrux — главная'"
  >
    <img
      class="brand-logo-mark"
      src="/brand/bs-mark.webp"
      alt=""
      width="52"
      height="52"
      decoding="async"
    />
    <span class="brand-logo-type" aria-hidden="true"
      ><strong>BURXONOV<br />SHOHRUX</strong><span>WEB / MOBILE</span></span
    >
  </NuxtLink>
</template>
