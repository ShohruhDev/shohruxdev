<script setup lang="ts">
const { enabled, reduced, toggle } = useMotion();
const { locale } = useLanguage();
const label = computed(() =>
  reduced.value
    ? locale.value === 'uz'
      ? 'Tizimda harakat kamaytirilgan'
      : 'Движение уменьшено в системе'
    : locale.value === 'uz'
      ? 'Animatsiyani to‘xtatish'
      : 'Отключить анимацию'
);
</script>
<template>
  <button
    class="motion-control"
    type="button"
    :disabled="reduced"
    :title="label"
    :aria-pressed="!enabled"
    :aria-label="label"
    @click="toggle"
  >
    <span aria-hidden="true">{{ enabled ? 'Ⅱ' : '▷' }}</span><span>{{
      locale === 'uz'
        ? enabled
          ? 'Harakat yoqilgan'
          : 'Harakat o‘chirilgan'
        : enabled
          ? 'Анимация включена'
          : 'Анимация выключена'
    }}</span>
  </button>
</template>
