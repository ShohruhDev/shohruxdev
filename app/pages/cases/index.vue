<script setup lang="ts">
const { t } = useLanguage();
const { list } = useCases();
// Пустой раздел не публикуется: без реальных кейсов страница отдаёт 404.
if (!list.value.length)
  throw createError({ statusCode: 404, statusMessage: 'Страница не найдена' });
usePageSeo(
  'Кейсы: сайты и приложения, которые я разработал',
  'Реальные проекты: задача клиента, решение, технологии и результат. Сайты, веб-сервисы и мобильные приложения для бизнеса в Узбекистане.'
);
</script>
<template>
  <div>
    <section class="page-intro wrap">
      <span class="eyebrow">{{ t('КЕЙСЫ') }}</span>
      <h1>{{ t('Проекты') }}<br />{{ t('и результаты') }}</h1>
      <p class="lede">
        {{ t('Задача клиента, что сделано, на чём и что изменилось после запуска.') }}
      </p>
    </section>
    <section class="wrap cases-list">
      <CaseCards :items="list" />
    </section>
    <ProjectCta />
  </div>
</template>
<style scoped>
.cases-list {
  padding-bottom: 80px;
}
</style>
