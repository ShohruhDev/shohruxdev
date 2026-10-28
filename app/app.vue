<script setup lang="ts">
const {t,localPath,locale}=useLanguage()

const config=useRuntimeConfig();const menuOpen=ref(false);const route=useRoute()
useHead(()=>({htmlAttrs:{lang:locale.value}}))
watch(()=>route.fullPath,()=>menuOpen.value=false)
</script>
<template>
 <div :class="route.path==='/admin'?'app-admin':'app-public'">
  <a class="skip" href="#main">{{t("К содержанию")}}</a>
  <header class="header wrap">
    <BrandLogo />
    <LanguageSwitch />
    <nav class="desktop-nav" :aria-label="t('Основная навигация')"><NuxtLink :to="localPath('/services')">{{t("Услуги")}}</NuxtLink><NuxtLink :to="localPath('/process')">{{t("Подход")}}</NuxtLink><NuxtLink :to="localPath('/journal')">{{t("Журнал")}}</NuxtLink></nav>
    <NuxtLink :to="localPath('/contact')" class="button button-small header-cta">{{t("Обсудить проект")}}</NuxtLink>
    <button class="menu-toggle" :aria-expanded="menuOpen" aria-controls="mobile-nav" :aria-label="menuOpen?t('Закрыть меню'):t('Открыть меню')" @click="menuOpen=!menuOpen"><AppIcon :name="menuOpen?'close':'menu'" /></button>
    <nav v-if="menuOpen" id="mobile-nav" class="mobile-nav" :aria-label="t('Мобильная навигация')" @keydown.esc="menuOpen=false"><NuxtLink :to="localPath('/services')">{{t("Услуги")}}</NuxtLink><NuxtLink :to="localPath('/process')">{{t("Подход")}}</NuxtLink><NuxtLink :to="localPath('/journal')">{{t("Журнал")}}</NuxtLink><NuxtLink :to="localPath('/contact')">{{t("Обсудить проект")}}</NuxtLink></nav>
  </header>
  <MotionControl v-if="route.path!=='/admin'" />
  <main id="main"><NuxtPage :page-key="pageRoute => pageRoute.path" /></main>
  <footer class="footer wrap"><div><BrandLogo /><p>{{t("Независимая разработка.")}}<br>{{t("Узбекистан и СНГ.")}}</p></div><div class="footer-links"><NuxtLink :to="localPath('/services')">{{t("Услуги")}}</NuxtLink><NuxtLink :to="localPath('/journal')">{{t("Журнал")}}</NuxtLink><NuxtLink :to="localPath('/contact')">{{t("Обсудить проект")}}</NuxtLink><NuxtLink :to="localPath('/privacy')">{{t("Обработка данных")}}</NuxtLink><NuxtLink v-if="!config.public.indexable" :to="localPath('/admin')">{{t("Редакция")}}</NuxtLink></div><div class="footer-note">{{t("Веб. Мобильные приложения.")}}<br>{{t("Внимание к деталям.")}}</div></footer>
 </div>
</template>
