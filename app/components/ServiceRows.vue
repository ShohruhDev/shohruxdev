<script setup lang="ts">
const { t, localPath, locale } = useLanguage();
import { services as servicesRu } from '~/data/services';
import { servicesUz } from '~/data/services.uz';
const services = computed(() => (locale.value === 'uz' ? servicesUz : servicesRu));
</script>
<template>
  <div class="service-rows">
    <NuxtLink
      v-for="s in services"
      :key="s.slug"
      :to="localPath(`/services/${s.slug}`)"
      class="service-row"
      ><span class="mono muted">{{ s.number }}</span>
      <h3>{{ s.title }}</h3>
      <p>{{ s.short }}</p>
      <AppIcon name="right" :size="34"
    /></NuxtLink>
  </div>
</template>
