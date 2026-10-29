<script setup lang="ts">
const props=withDefaults(defineProps<{place:string,label?:string}>(),{label:''})
const config=useRuntimeConfig();const {goal}=useAnalytics();const {t}=useLanguage()
const user=computed(()=>config.public.telegram)
</script>
<template><a v-if="user" :href="`https://t.me/${user}`" target="_blank" rel="noopener" v-bind="$attrs" @click="goal('telegram_click','contact_telegram',{place:props.place})">{{props.label||t('Написать в Telegram')}}</a></template>
