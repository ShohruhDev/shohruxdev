<script setup lang="ts">
import { company } from '#shared/brand.mjs';
// Ссылка tel: с целью «phone_click» в Метрике и GA4.
const props = defineProps<{ place: string }>();
const { goal } = useAnalytics();
</script>
<template>
  <a
    :href="`tel:${company.phone}`"
    v-bind="$attrs"
    @click="goal('phone_click', 'contact_phone', { place: props.place })"
    ><slot>{{ company.phoneDisplay }}</slot></a
  >
</template>
