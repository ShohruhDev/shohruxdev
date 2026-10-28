<script setup lang="ts">
const {t,localPath,locale}=useLanguage()
defineProps<{posts:any[]}>()</script>
<template><div class="journal-grid"><NuxtLink class="journal-card" v-for="(p,i) in posts" :key="p.slug" :to="localPath(`/journal/${p.slug}`)"><div class="article-art" :class="`art-${i%3}`"><span>{{['A / B',t("ОБЪЁМ → ОЦЕНКА"),t("СНАЧАЛА ГЛАВНОЕ")][i%3]}}</span><AppIcon :size="36" /></div><div class="article-meta">{{p.category}} <span>{{p.readTime || t("5 мин")}}</span></div><h3>{{p.title}}</h3><p>{{p.description}}</p></NuxtLink></div></template>
