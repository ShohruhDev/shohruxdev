<script setup lang="ts">
const {t,localPath,locale}=useLanguage()

usePageSeo('Журнал о разработке для бизнеса','Как выбирать между сайтом и приложением, планировать бюджет и запускать первую версию продукта.')
const {data:posts}=await useFetch<any[]>('/api/posts',{query:{lang:locale}});const active=ref(t('Все материалы'))
const categories=computed(()=>[t('Все материалы'),...new Set((posts.value||[]).map(p=>p.category))])
watch(locale,()=>active.value=t('Все материалы'))
const filtered=computed(()=>(posts.value||[]).filter(p=>active.value===t('Все материалы')||p.category===active.value))
</script>
<template><section class="page-intro wrap"><h1>{{t("Разработка.")}}<br>{{t("На языке бизнеса.")}}</h1><p class="lede">{{t("Решения, бюджет и запуск продукта. Материалы, которые помогают задать правильные вопросы.")}}</p><a :href="localPath('/feed.xml')" class="journal-rss">{{t("RSS — новые статьи ↗")}}</a></section><section class="wrap journal-list"><div class="filters" :aria-label="t('Темы журнала')"><button v-for="c in categories" :key="c" :class="{active:active===c}" :aria-pressed="active===c" @click="active=c">{{c}}</button></div><p class="result-count" aria-live="polite">{{t("Материалов:")}} {{filtered.length}}</p><JournalCards :posts="filtered" /><p class="preview-note" v-if="posts?.some(p=>p.demo)">{{t("В предпросмотре показаны стартовые редакционные материалы. Перед публикацией они требуют проверки автором.")}}</p></section><ProjectCta /></template>
