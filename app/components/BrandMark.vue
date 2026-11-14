<script setup lang="ts">
// Знак: стрельчатая арка (архитектура Ташкента) + курсор в проёме + «клик» оранжевой точкой.
// id градиента уникален для каждого экземпляра, иначе шапка и подвал конфликтуют.
const props = withDefaults(defineProps<{ size?: number }>(), { size: 40 });
const id = `rt-g-${useId()}`;
</script>
<template>
  <svg
    class="brand-mark"
    :width="props.size"
    :height="props.size"
    viewBox="0 0 64 64"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient :id="id" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3A6BFF" />
        <stop offset="1" stop-color="#1C44D6" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="18" :fill="`url(#${id})`" />
    <path
      class="brand-mark-arch"
      d="M16 50.5V31C16 21 24 14.5 32 10 40 14.5 48 21 48 31V50.5"
      fill="none"
      stroke="#fff"
      stroke-width="5.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      class="brand-mark-cursor"
      d="M25.5 23.5V45.6L30.6 40.9L34.4 48.7L38.2 47L34.6 39.4H41.4Z"
      fill="#fff"
    />
    <circle class="brand-mark-dot" cx="48" cy="50.5" r="4.4" fill="#FF6B3D" />
  </svg>
</template>
