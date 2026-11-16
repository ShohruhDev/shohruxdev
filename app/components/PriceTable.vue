<script setup lang="ts">
import { projectTypes } from '#shared/pricing.mjs';
import { formatMln, fromMln, termText, typeLabel } from '~/data/pricing-labels';
// Базовые цены из утверждённого прайса. service — показать только одно направление.
const props = defineProps<{ service?: string }>();
const { t, locale } = useLanguage();
const rows = computed(() =>
  projectTypes.filter(p => !props.service || p.service === props.service)
);
const mln = (v?: number) => formatMln(v, locale.value);
</script>
<template>
  <div class="price-table" role="table" :aria-label="t('Цены')">
    <div class="price-row price-head" role="row">
      <span role="columnheader">{{ t('Проект') }}</span><span role="columnheader">{{
        t('Стоимость')
      }}</span
      ><span role="columnheader">{{ t('Срок') }}</span>
    </div>
    <div v-for="p in rows" :key="p.id" class="price-row" role="row">
      <span role="cell" class="price-name"
        ><strong>{{ t(typeLabel(p.id)[0]) }}</strong
        ><small>{{ t(typeLabel(p.id)[1]) }}</small></span
      ><span role="cell" class="price-value"
        >{{ fromMln(p.price[0], locale)
        }}<small>{{ mln(p.price[0]) }} – {{ mln(p.price[1]) }} {{ t('млн сум') }}</small></span
      ><span role="cell" class="price-term">{{ termText(p.weeks, locale, t) }}</span>
    </div>
  </div>
</template>
<style scoped>
.price-table {
  margin-top: 32px;
  border-top: 1px solid var(--line);
}
.price-row {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 0.7fr);
  gap: 24px;
  align-items: baseline;
  padding: 20px 0;
  border-bottom: 1px solid var(--line);
}
.price-head {
  padding: 12px 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.price-name,
.price-value {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.price-name strong {
  font-size: 17px;
}
.price-name small,
.price-value small {
  color: var(--muted);
  font-size: 13px;
  font-weight: 500;
}
.price-value {
  font-weight: 700;
  font-size: 17px;
}
.price-term {
  color: var(--muted);
  font-size: 15px;
}
@media (max-width: 640px) {
  .price-head {
    display: none;
  }
  .price-row {
    grid-template-columns: 1fr auto;
    gap: 8px 16px;
  }
  .price-name {
    grid-column: 1 / -1;
  }
}
</style>
