<script setup lang="ts">
import { estimate, projectTypes, options as allOptions } from '#shared/pricing.mjs';
import { designLabels, formatMln, optionLabels, termText, typeLabel } from '~/data/pricing-labels';
const { t, localPath, locale } = useLanguage();
const { goal } = useAnalytics();
const state = reactive({
  type: 'corporate',
  pages: 7,
  design: 'custom',
  langs: 2,
  extras: [] as string[],
  urgent: false
});
const result = computed(() => estimate(state));
const available = computed(() => allOptions.filter(o => o.types.includes(state.type)));
const included = computed(() => projectTypes.find(p => p.id === state.type)?.includedPages);
// Keep decimal separators identical in server and browser ICU versions.
const num = (v: number) => formatMln(v, locale.value);
const price = computed(
  () => `${num(result.value.price[0])} – ${num(result.value.price[1])} ${t('млн сум')}`
);
const term = computed(() => termText(result.value.weeks, locale.value, t));
const summary = computed(() =>
  [
    `${t('Расчёт калькулятора')}: ${t(typeLabel(state.type)[0])}`,
    ...(included.value ? [`${t('Страниц')}: ${state.pages}`] : []),
    `${t('Дизайн')}: ${t(designLabels[state.design] || state.design)}`,
    `${t('Языков')}: ${state.langs}`,
    ...result.value.options.map(o => t(optionLabels[o] || o)),
    ...(state.urgent ? [t('Срочно')] : []),
    `${t('Оценка')}: ${price.value}, ${term.value}`
  ].join('; ')
);
const contactLink = computed(() => ({
  path: localPath('/contact'),
  query: { service: result.value.service, estimate: summary.value }
}));
watch(
  () => state.type,
  () => {
    state.extras = state.extras.filter(id => available.value.some(o => o.id === id));
  }
);
</script>
<template>
  <div class="calc-shell">
    <a href="#calc-result" class="calc-bar"
      ><span
        ><strong>{{ price }}</strong
        ><small>{{ term }}</small></span
      ><AppIcon name="down" :size="20"
    /></a>
    <section class="calc wrap">
      <div class="calc-form">
        <fieldset>
          <legend>{{ t('1. Что нужно разработать') }}</legend>
          <div class="calc-types">
            <label
              v-for="p in projectTypes"
              :key="p.id"
              class="calc-card"
              :class="{ active: state.type === p.id }"
              ><input v-model="state.type" type="radio" name="type" :value="p.id" /><span
                class="calc-card-copy"
                ><strong>{{ t(typeLabel(p.id)[0]) }}</strong
                ><small>{{ t(typeLabel(p.id)[1]) }}</small></span
              ></label
            >
          </div>
        </fieldset>
        <fieldset v-if="included">
          <legend>{{ t('2. Количество страниц') }}</legend>
          <div class="calc-range">
            <input
              v-model.number="state.pages"
              type="range"
              min="3"
              max="30"
              :aria-label="t('Количество страниц')"
            /><output>{{ state.pages }}</output>
          </div>
          <small class="calc-note">{{ t('В базовую цену входит страниц:') }} {{ included }}</small>
        </fieldset>
        <fieldset>
          <legend>{{ included ? '3' : '2' }}. {{ t('Дизайн') }}</legend>
          <div class="calc-pills">
            <label
              v-for="(label, id) in designLabels"
              :key="id"
              :class="{ active: state.design === id }"
              ><input v-model="state.design" type="radio" name="design" :value="id" />{{
                t(label)
              }}</label
            >
          </div>
        </fieldset>
        <fieldset>
          <legend>
            {{ included ? '4' : '3' }}.
            {{ locale === 'uz' ? 'Interfeys tillari' : 'Языки интерфейса' }}
          </legend>
          <div class="calc-pills">
            <label v-for="n in [1, 2, 3]" :key="n" :class="{ active: state.langs === n }"
              ><input v-model="state.langs" type="radio" name="langs" :value="n" />{{
                n === 1 ? t('Один') : n === 2 ? t('Два (RU + UZ)') : t('Три (+ EN)')
              }}</label
            >
          </div>
        </fieldset>
        <fieldset>
          <legend>{{ included ? '5' : '4' }}. {{ t('Дополнительно') }}</legend>
          <div class="calc-checks">
            <label v-for="o in available" :key="o.id"
              ><input v-model="state.extras" type="checkbox" :value="o.id" /><span>{{
                t(optionLabels[o.id] || o.id)
              }}</span></label
            ><label
              ><input v-model="state.urgent" type="checkbox" /><span>{{
                t('Срочно — срок на 30% короче')
              }}</span></label
            >
          </div>
        </fieldset>
      </div>
      <aside id="calc-result" class="calc-result" aria-live="polite">
        <h2 class="calc-result-title">
          {{ locale === 'uz' ? 'Taxminiy baho' : 'Предварительная оценка' }}
        </h2>
        <p class="calc-price">{{ price }}</p>
        <p class="calc-term">{{ t('Срок') }}: {{ term }}</p>
        <p class="calc-disclaimer">
          {{
            t(
              'Это предварительная оценка. Точную стоимость и срок назовём после короткого обсуждения задачи — бесплатно. Цена фиксируется в договоре до начала работ.'
            )
          }}
        </p>
        <NuxtLink
          class="button"
          :to="contactLink"
          @click="goal('calculator_cta', 'calculator_cta', { type: state.type })"
          >{{ t('Получить точную оценку') }} <AppIcon
        /></NuxtLink>
        <TelegramLink place="calculator" class="text-link" />
        <div class="calc-extra">
          <h3>{{ locale === 'uz' ? 'Qo‘shimcha xarajatlar' : 'Дополнительные расходы' }}</h3>
          <p>
            {{
              t(
                'Домен .uz — около 80–100 тыс. сум в год. Хостинг — 50–300 тыс. сум в месяц. Поддержка и доработки — от 0,5–1,5 млн сум в месяц.'
              )
            }}
          </p>
        </div>
      </aside>
    </section>
  </div>
</template>
<style scoped>
.calc {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(300px, 1fr);
  gap: 64px;
  align-items: start;
  padding-bottom: 80px;
}
.calc-form {
  min-width: 0;
}
fieldset {
  border: 0;
  border-top: 1px solid var(--line);
  padding: 26px 0 32px;
  margin: 0;
  min-width: 0;
}
legend {
  font-weight: 700;
  font-size: 17px;
  padding: 0 0 20px;
  float: left;
  width: 100%;
  line-height: 1.5;
}
.calc-types {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  clear: both;
}
.calc-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 16px;
  border: 1px solid var(--line);
  border-radius: 4px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  min-width: 0;
}
.calc-card-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.calc-card strong {
  font-size: 15px;
  line-height: 1.4;
  font-weight: 600;
}
.calc-card small {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}
input[type='radio'] {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  margin: 2px 0 0;
  accent-color: var(--accent, var(--text));
}
.calc-card.active,
.calc-pills label.active {
  border-color: var(--accent);
  background: var(--accent-soft, #e5ecd9);
}
.calc-card:hover,
.calc-pills label:hover {
  border-color: var(--accent, #63765a);
}
.calc-card:has(:focus-visible),
.calc-pills label:has(:focus-visible) {
  outline: 2px solid var(--text);
  outline-offset: 3px;
}
.calc-pills {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  clear: both;
}
.calc-pills label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 12px;
  border: 1px solid var(--line);
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1.5;
}
.calc-range {
  display: flex;
  align-items: center;
  gap: 18px;
  clear: both;
}
.calc-range input {
  flex: 1;
  min-width: 0;
  accent-color: var(--accent, var(--text));
  min-height: 32px;
}
.calc-range output {
  font-weight: 700;
  font-size: 20px;
  min-width: 2ch;
}
.calc-note {
  display: block;
  margin-top: 8px;
  color: var(--muted);
  font-size: 12px;
}
.calc-checks {
  display: grid;
  gap: 2px;
  clear: both;
}
.calc-checks label {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 15px;
  line-height: 1.5;
  cursor: pointer;
  min-height: 44px;
  padding: 8px 0;
}
.calc-checks input {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin: 0;
  accent-color: var(--accent, var(--text));
}
.calc-result {
  position: sticky;
  top: 110px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 20px;
  padding: 32px;
  border-radius: var(--radius, 4px);
  background: var(--mint, #b6e9b0);
  color: var(--text, #172315);
  scroll-margin-top: 150px;
}
.calc-result-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.5;
}
.calc-price {
  font-family: var(--font);
  font-size: clamp(28px, 3vw, 44px);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 1.2;
  color: var(--text, #172315);
  font-variant-numeric: tabular-nums;
  text-wrap: balance;
}
.calc-term {
  font-size: 15px;
  font-weight: 600;
  color: var(--muted, #34472a);
  margin-top: -8px;
}
.calc-disclaimer,
.calc-extra p {
  font-size: 14px;
  line-height: 1.7;
  color: var(--muted, #34472a);
}
.calc-result .button {
  white-space: normal;
  gap: 14px;
  line-height: 1.5;
  text-align: center;
}
.calc-result .button svg {
  flex-shrink: 0;
}
.calc-result .text-link {
  align-self: center;
}
.calc-extra {
  border-top: 1px solid var(--line, #6d956466);
  padding-top: 20px;
  margin-top: 4px;
}
.calc-extra h3 {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0;
  margin-bottom: 10px;
}
.calc-bar {
  display: none;
}
@media (max-width: 1100px) {
  .calc {
    gap: 28px;
  }
  .calc-result {
    padding: 24px;
  }
  .calc-pills {
    grid-template-columns: 1fr;
  }
  .calc-pills label {
    min-height: 48px;
    align-items: center;
  }
}
@media (max-width: 860px) {
  .calc {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .calc-result {
    position: static;
  }
  .calc-bar {
    display: flex;
    position: sticky;
    top: 86px;
    z-index: 8;
    width: calc(100% - 64px);
    margin: 0 auto 24px;
    padding: 14px 0;
    background: var(--bg);
    color: var(--text);
    border-block: 1px solid var(--line);
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .calc-bar > span {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px 16px;
  }
  .calc-bar strong {
    font-size: 16px;
    line-height: 1.5;
  }
  .calc-bar small {
    font-size: 12px;
    color: var(--muted);
  }
  .calc-pills {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .calc-bar {
    top: 75px;
    width: calc(100% - 40px);
  }
  .calc {
    padding-bottom: 48px;
  }
  .calc-types {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .calc-card {
    padding: 14px 16px;
  }
  .calc-card-copy {
    gap: 4px;
  }
  .calc-pills {
    grid-template-columns: 1fr;
  }
  .calc-result {
    padding: 24px;
  }
  .calc-price {
    font-size: 32px;
  }
  .calc-result .text-link {
    min-height: 44px;
  }
  .calc-checks label {
    font-size: 14px;
  }
}
</style>
