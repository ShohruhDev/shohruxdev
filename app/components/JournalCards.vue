<script setup lang="ts">
const {t,localPath}=useLanguage()
defineProps<{posts:any[]}>()
</script>
<template><div class="journal-grid"><NuxtLink class="journal-card" v-for="p in posts" :key="p.slug" :to="localPath(`/journal/${p.slug}`)"><div class="article-meta"><span>{{p.category}}</span><span>{{p.readTime || t("5 мин")}}</span></div><h3>{{p.title}}</h3><p>{{p.description}}</p><span class="journal-card-link">{{t('Читать статью')}} <AppIcon :size="20" /></span></NuxtLink></div></template>
