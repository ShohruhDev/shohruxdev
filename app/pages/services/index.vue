<script setup lang="ts">
const { t, localPath, locale } = useLanguage();
usePageSeo(
  'Услуги по разработке сайтов и приложений',
  'Разработка сайтов, веб-сервисов и мобильных приложений для бизнеса в Ташкенте и Узбекистане. Состав работ и факторы стоимости.'
);
</script>
<template>
  <section class="page-intro wrap">
    <span class="eyebrow">{{ t('УСЛУГИ') }}</span>
    <h1>{{ t('Одна задача.') }}<br />{{ t('Подходящее решение.') }}</h1>
    <p class="lede">
      {{
        t(
          'От сайта компании до продукта с личным кабинетом. Начинаем с того, что нужно вашим пользователям.'
        )
      }}
    </p>
  </section>
  <section class="wrap"><ServiceRows /></section>
  <ProjectCta />
</template>
