<script setup lang="ts">
const { t, localPath, locale } = useLanguage();
</script>
<template>
  <section class="cta-section wrap">
    <div>
      <h2>{{ t('Давайте начнём') }}<br />{{ t('с разговора.') }}</h2>
      <p>
        {{ t('Расскажите, что хотите создать или улучшить.') }}<br />{{
          t('Поможем определить следующий шаг.')
        }}
      </p>
    </div>
    <div class="cta-actions">
      <NuxtLink class="button" :to="localPath('/contact')"
        >{{ t('Обсудить проект') }} <AppIcon /></NuxtLink
      ><TelegramLink place="cta" class="text-link" />
    </div>
  </section>
</template>
