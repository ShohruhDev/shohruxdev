<script setup lang="ts">
import {
  PhArrowUpRight,
  PhArrowDown,
  PhArrowRight,
  PhArrowLeft,
  PhList,
  PhX,
  PhCheck,
  PhPlus,
  PhPhone,
  PhTelegramLogo,
  PhInstagramLogo,
  PhFacebookLogo
} from '@phosphor-icons/vue';
const props = withDefaults(defineProps<{ name?: string; size?: number }>(), {
  name: 'arrow',
  size: 24
});
const icons: Record<string, any> = {
  arrow: PhArrowUpRight,
  down: PhArrowDown,
  right: PhArrowRight,
  left: PhArrowLeft,
  menu: PhList,
  close: PhX,
  check: PhCheck,
  plus: PhPlus,
  phone: PhPhone,
  telegram: PhTelegramLogo,
  instagram: PhInstagramLogo,
  facebook: PhFacebookLogo
};
</script>
<template>
  <component
    :is="icons[props.name] || PhArrowUpRight"
    :size="size"
    :weight="'light'"
    aria-hidden="true"
  />
</template>
