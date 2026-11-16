<script setup lang="ts">
const { t, localPath, locale } = useLanguage();
useHead(() => ({ htmlAttrs: { lang: locale.value } }));
defineProps<{ error: any }>();
</script>
<template>
  <NuxtLayout>
    <!-- Страница ошибки заменяет app.vue целиком, поэтому тема и логотип подключаются здесь. -->
    <div class="app-public">
      <header class="header wrap"><BrandLogo /></header>
      <main id="main" class="error-page">
        <span class="label-text">{{ error?.statusCode || 500 }}</span>
        <h1>
          {{
            error?.statusCode === 404
              ? t('Страница не найдена')
              : t('Не получилось открыть страницу')
          }}
        </h1>
        <p>{{ t('Вернитесь на главную и попробуйте ещё раз.') }}</p>
        <button class="button" @click="clearError({ redirect: localPath('/') })">
          {{ t('На главную') }}
        </button>
      </main>
    </div>
  </NuxtLayout>
</template>
