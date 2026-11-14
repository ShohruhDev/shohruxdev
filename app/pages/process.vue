<script setup lang="ts">
const { t, localPath, locale } = useLanguage();
import { steps as stepsRu } from '~/data/services';
import { stepsUz } from '~/data/services.uz';
const steps = computed(() => (locale.value === 'uz' ? stepsUz : stepsRu));
usePageSeo(
  'Этапы разработки сайта и приложения',
  'От первого обсуждения до запуска: сценарии, оценка, дизайн, разработка, проверка и передача проекта.'
);
</script>
<template>
  <section class="page-intro wrap">
    <h1>{{ t('Как проходит разработка:') }}<br />{{ t('этапы, сроки, результат') }}</h1>
    <p class="lede">
      {{
        t(
          'Работа строится вокруг вашей задачи. Решения, объём и изменения обсуждаем до того, как они превращаются в код.'
        )
      }}
    </p>
  </section>
  <section class="process-list wrap">
    <div v-for="s in steps" :key="s.n">
      <span class="mono accent">{{ s.n }}</span>
      <h2>{{ s.title }}</h2>
      <p>{{ s.body }}</p>
    </div>
  </section>
  <section class="estimate-block wrap">
    <h2>{{ t('Техническое задание') }}<br />{{ t('не обязательно.') }}</h2>
    <p>
      {{
        t(
          'Для первого разговора достаточно описать бизнес, задачу и желаемый результат. Если есть примеры, текущий сайт или ограничения по срокам — расскажите о них в заявке.'
        )
      }}
    </p>
  </section>
  <ProjectCta />
</template>
