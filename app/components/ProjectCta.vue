<script setup lang="ts">
const {t,localPath,locale}=useLanguage()
</script>
<template><section class="cta-section wrap"><div><span class="eyebrow">{{t("ЕСТЬ ЗАДАЧА?")}}</span><h2>{{t("Давайте начнём")}}<br>{{t("с разговора.")}}</h2><p>{{t("Расскажите, что хотите создать или улучшить.")}}<br>{{t("Помогу определить следующий шаг.")}}</p></div><div class="cta-actions"><NuxtLink class="button" :to="localPath('/contact')">{{t("Обсудить проект")}} <AppIcon /></NuxtLink><TelegramLink place="cta" class="text-link" /></div></section></template>
