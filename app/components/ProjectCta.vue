<script setup lang="ts">
const {t,localPath,locale}=useLanguage()
</script>
<template><section class="cta-section wrap"><div><span class="eyebrow">{{t("ЕСТЬ ЗАДАЧА?")}}</span><h2>{{t("Давайте начнём")}}<br>{{t("с разговора.")}}</h2><p>{{t("Расскажите, что хотите создать или улучшить.")}}<br>{{t("Помогу определить следующий шаг.")}}</p></div><NuxtLink class="button" :to="localPath('/contact')">{{t("Обсудить проект")}} <AppIcon /></NuxtLink></section></template>
