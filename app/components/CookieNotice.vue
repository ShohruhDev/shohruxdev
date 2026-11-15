<script setup lang="ts">
// Уведомление о cookie: Яндекс Метрика и Google Analytics ставят cookie.
// Показывается один раз; выбор хранится в localStorage (при недоступном хранилище
// плашка просто показывается снова при следующем визите).
const KEY = 'cookie-notice-v1';
const { t, localPath } = useLanguage();
const config = useRuntimeConfig();
const visible = ref(false);

onMounted(() => {
  if (!config.public.metrikaId && !config.public.gaId) return;
  try {
    visible.value = localStorage.getItem(KEY) !== 'accepted';
  } catch {
    visible.value = true;
  }
});

function accept() {
  visible.value = false;
  try {
    localStorage.setItem(KEY, 'accepted');
  } catch {
    /* хранилище недоступно: скрываем до перезагрузки */
  }
}
</script>
<template>
  <div v-if="visible" class="cookie-notice" role="region" :aria-label="t('Файлы cookie')">
    <p>
      {{
        t(
          'Мы используем файлы cookie для статистики посещений. Продолжая пользоваться сайтом, вы соглашаетесь с их использованием.'
        )
      }}
      <NuxtLink :to="localPath('/privacy')">{{ t('Подробнее') }}</NuxtLink>
    </p>
    <button type="button" class="button" @click="accept">{{ t('Принять') }}</button>
  </div>
</template>
<style scoped>
.cookie-notice {
  position: fixed;
  z-index: 60;
  left: max(16px, calc((100vw - 1240px) / 2));
  right: max(16px, calc((100vw - 1240px) / 2));
  bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 960px;
  padding: 20px 24px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm, 8px);
  background: var(--surface, #f8f7f5);
  box-shadow: 0 12px 40px rgb(0 0 0 / 0.12);
}
.cookie-notice p {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--body, #3c3c3c);
}
.cookie-notice a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.cookie-notice .button {
  flex: none;
}
@media (max-width: 640px) {
  .cookie-notice {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    padding: 16px;
  }
  .cookie-notice .button {
    width: 100%;
  }
}
</style>
