<script setup lang="ts">
import { PhArrowUpRight, PhCalculator, PhTelegramLogo } from '@phosphor-icons/vue';
import { socialProfiles } from '#shared/brand.mjs';
const { t, localPath } = useLanguage();
const { goal } = useAnalytics();
const channel = socialProfiles.find(s => s.id === 'telegram')!.url;
</script>
<template>
  <div class="post-promo">
    <section class="promo-card promo-telegram" aria-labelledby="promo-telegram-title">
      <span class="promo-icon" aria-hidden="true"><PhTelegramLogo :size="26" weight="fill" /></span>
      <h2 id="promo-telegram-title">{{ t('Telegram-канал') }}</h2>
      <p>{{ t('Цены, сроки и разборы задач') }}</p>
      <a
        class="promo-button"
        :href="channel"
        target="_blank"
        rel="noopener"
        @click="goal('channel_subscribe', 'channel_subscribe', { place: 'article' })"
        >{{ t('Подписаться') }} <PhArrowUpRight :size="18" aria-hidden="true"
      /></a>
    </section>
    <section class="promo-card promo-calc" aria-labelledby="promo-calc-title">
      <span class="promo-icon" aria-hidden="true"><PhCalculator :size="26" /></span>
      <h2 id="promo-calc-title">{{ t('Калькулятор стоимости проекта') }}</h2>
      <p>{{ t('Ориентировочная цена и срок проекта за пару минут') }}</p>
      <NuxtLink
        class="promo-link"
        :to="localPath('/calculator')"
        @click="goal('calculator_open', 'calculator_open', { place: 'article' })"
        >{{ t('Рассчитать стоимость') }} <PhArrowUpRight :size="18" aria-hidden="true"
      /></NuxtLink>
    </section>
  </div>
</template>
<style scoped>
.post-promo {
  display: grid;
  gap: 16px;
}
.promo-card {
  border-radius: var(--radius);
  padding: 28px;
}
.promo-card h2 {
  margin: 18px 0 8px;
  font-size: 22px;
  line-height: 1.25;
  font-weight: 600;
}
.promo-card p {
  margin: 0 0 22px;
  font-size: 15px;
  line-height: 1.5;
}
.promo-icon {
  display: inline-grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
.promo-telegram {
  background: var(--accent);
  color: #fff;
}
.promo-telegram h2,
.promo-telegram p {
  color: #fff;
}
.promo-telegram p {
  opacity: 0.86;
}
.promo-telegram .promo-icon {
  background: rgb(255 255 255 / 0.16);
}
.promo-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 48px;
  padding: 0 20px;
  border-radius: 999px;
  background: #fff;
  color: var(--accent);
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: background 0.2s;
}
.promo-button:hover {
  background: var(--accent-soft);
}
.promo-calc {
  background: var(--surface);
}
.promo-calc .promo-icon {
  background: var(--accent-soft);
  color: var(--accent);
}
.promo-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent);
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
}
.promo-link:hover {
  color: var(--accent-hover);
}
.promo-button:focus-visible,
.promo-link:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .promo-button {
    transition: none;
  }
}
</style>
