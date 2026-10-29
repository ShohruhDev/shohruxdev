<script setup lang="ts">
import {estimate,projectTypes,options as allOptions} from '#shared/pricing.mjs'
const {t,localPath,locale}=useLanguage();const {goal}=useAnalytics()
const typeLabels:Record<string,[string,string]>={landing:['Лендинг','Одна страница под услугу или акцию'],corporate:['Корпоративный сайт','Услуги, о компании, контакты'],catalog:['Сайт-каталог','Товары или услуги с фильтрами'],shop:['Интернет-магазин','Корзина, заказ, оплата'],webapp:['Веб-сервис / CRM','Личный кабинет, внутренняя система'],telegram:['Telegram-бот или Mini App','Запись, заказ или каталог в Telegram'],mobile:['Мобильное приложение','iOS и Android']}
const optionLabels:Record<string,string>={payments:'Онлайн-оплата (Payme, Click, Uzum)',booking:'Онлайн-запись',crm:'Интеграция с CRM (amoCRM, Bitrix24)',onec:'Интеграция с 1С',cabinet:'Личный кабинет клиента',seo:'Расширенное SEO',copy:'Написать тексты'}
const designLabels:Record<string,string>={template:'На готовой основе',custom:'Индивидуальный',premium:'Премиум с анимацией'}
const root=ref<HTMLElement>(),inView=ref(false)
// Мобильная плашка с ценой видна, только пока калькулятор на экране.
let io:IntersectionObserver|undefined
onMounted(()=>{io=new IntersectionObserver(([e])=>{inView.value=!!e?.isIntersecting});if(root.value)io.observe(root.value)})
onBeforeUnmount(()=>io?.disconnect())
const state=reactive({type:'corporate',pages:7,design:'custom',langs:2,extras:[] as string[],urgent:false})
const result=computed(()=>estimate(state))
const available=computed(()=>allOptions.filter(o=>o.types.includes(state.type)))
const included=computed(()=>projectTypes.find(p=>p.id===state.type)?.includedPages)
const num=(v:number)=>v.toLocaleString(locale.value==='uz'?'uz-UZ':'ru-RU',{maximumFractionDigits:1})
const price=computed(()=>`${num(result.value.price[0])} – ${num(result.value.price[1])} ${t('млн сум')}`)
const term=computed(()=>{const [a,b]=result.value.weeks;return b>8?`${num(Math.round(a/4.33*2)/2)} – ${num(Math.round(b/4.33*2)/2)} ${t('мес.')}`:`${a} – ${b} ${t('нед.')}`})
const summary=computed(()=>[`${t('Расчёт калькулятора')}: ${t(typeLabels[state.type][0])}`,...(included.value?[`${t('Страниц')}: ${state.pages}`]:[]),`${t('Дизайн')}: ${t(designLabels[state.design])}`,`${t('Языков')}: ${state.langs}`,...result.value.options.map(o=>t(optionLabels[o])),...(state.urgent?[t('Срочно')]:[]),`${t('Оценка')}: ${price.value}, ${term.value}`].join('; '))
const contactLink=computed(()=>({path:localPath('/contact'),query:{service:result.value.service,estimate:summary.value}}))
watch(()=>state.type,()=>{state.extras=state.extras.filter(id=>available.value.some(o=>o.id===id))})
</script>
<template><div>
<section ref="root" class="calc wrap">
 <div class="calc-form">
  <fieldset><legend>{{t("1. Что нужно разработать")}}</legend><div class="calc-types"><label v-for="p in projectTypes" :key="p.id" class="calc-card" :class="{active:state.type===p.id}"><input v-model="state.type" type="radio" name="type" :value="p.id"><strong>{{t(typeLabels[p.id][0])}}</strong><small>{{t(typeLabels[p.id][1])}}</small></label></div></fieldset>
  <fieldset v-if="included"><legend>{{t("2. Количество страниц")}}</legend><div class="calc-range"><input v-model.number="state.pages" type="range" min="3" max="30" :aria-label="t('Количество страниц')"><output>{{state.pages}}</output></div><small class="calc-note">{{t("В базовую цену входит страниц:")}} {{included}}</small></fieldset>
  <fieldset><legend>{{included?'3':'2'}}. {{t("Дизайн")}}</legend><div class="calc-pills"><label v-for="(label,id) in designLabels" :key="id" :class="{active:state.design===id}"><input v-model="state.design" type="radio" name="design" :value="id">{{t(label)}}</label></div></fieldset>
  <fieldset><legend>{{included?'4':'3'}}. {{t("Языки сайта")}}</legend><div class="calc-pills"><label v-for="n in [1,2,3]" :key="n" :class="{active:state.langs===n}"><input v-model="state.langs" type="radio" name="langs" :value="n">{{n===1?t('Один'):n===2?t('Два (RU + UZ)'):t('Три (+ EN)')}}</label></div></fieldset>
  <fieldset><legend>{{included?'5':'4'}}. {{t("Дополнительно")}}</legend><div class="calc-checks"><label v-for="o in available" :key="o.id"><input v-model="state.extras" type="checkbox" :value="o.id"><span>{{t(optionLabels[o.id])}}</span></label><label><input v-model="state.urgent" type="checkbox"><span>{{t("Срочно — срок на 30% короче")}}</span></label></div></fieldset>
 </div>
 <aside id="calc-result" class="calc-result" aria-live="polite">
  <span class="eyebrow">{{t("ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА")}}</span>
  <p class="calc-price">{{price}}</p><p class="calc-term">{{t("Срок")}}: {{term}}</p>
  <p class="calc-disclaimer">{{t("Это предварительная оценка. Точную стоимость и срок назову после короткого обсуждения задачи — бесплатно. Цена фиксируется в договоре до начала работ.")}}</p>
  <NuxtLink class="button" :to="contactLink" @click="goal('calculator_cta','calculator_cta',{type:state.type})">{{t("Получить точную оценку")}} <AppIcon /></NuxtLink>
  <TelegramLink place="calculator" class="text-link" />
  <div class="calc-extra"><span class="eyebrow">{{t("ОТДЕЛЬНО ОТ РАЗРАБОТКИ")}}</span><p>{{t("Домен .uz — около 80–100 тыс. сум в год. Хостинг — 50–300 тыс. сум в месяц. Поддержка и доработки — от 0,5–1,5 млн сум в месяц.")}}</p></div>
 </aside>
</section>
<a v-show="inView" href="#calc-result" class="calc-bar"><span>{{price}}</span><small>{{term}}</small></a>
</div></template>
<style scoped>
.calc{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(280px,1fr);gap:50px;align-items:start;padding-bottom:80px}
fieldset{border:0;border-top:1px solid var(--line);padding:26px 0 30px;margin:0}
legend{font-weight:700;font-size:17px;padding:0 0 16px;float:left;width:100%}
input[type=radio]{position:absolute;opacity:0;pointer-events:none}
.calc-types{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;clear:both}
.calc-card{position:relative;display:flex;flex-direction:column;gap:6px;padding:16px;border:1px solid var(--line);border-radius:12px;cursor:pointer;transition:border-color .2s,background .2s}
.calc-card small{color:var(--muted);font-size:12px;line-height:1.4}
.calc-card.active,.calc-pills label.active{border-color:var(--text);background:#e5ecd9}
.calc-card:has(:focus-visible),.calc-pills label:has(:focus-visible){outline:2px solid var(--text);outline-offset:2px}
.calc-pills{display:flex;flex-wrap:wrap;gap:8px;clear:both}
.calc-pills label{position:relative;padding:10px 16px;border:1px solid var(--line);border-radius:40px;cursor:pointer;font-size:14px}
.calc-range{display:flex;align-items:center;gap:18px;clear:both}.calc-range input{flex:1;accent-color:var(--text)}.calc-range output{font-weight:700;font-size:20px;min-width:2ch}
.calc-note{display:block;margin-top:8px;color:var(--muted);font-size:12px}
.calc-checks{display:grid;gap:12px;clear:both}.calc-checks label{display:flex;gap:12px;align-items:center;font-size:15px;cursor:pointer}.calc-checks input{width:18px;height:18px;accent-color:var(--text)}
.calc-result{position:sticky;top:110px;display:flex;flex-direction:column;align-items:flex-start;gap:16px;padding:28px;border-radius:16px;background:var(--mint,#b6e9b0);color:#172315}
.calc-price{font-family:var(--display,inherit);font-size:clamp(26px,2.6vw,36px);font-weight:800;letter-spacing:-.04em;line-height:1.15}
.calc-term{font-size:16px;font-weight:600}
.calc-disclaimer,.calc-extra p{font-size:13px;line-height:1.6;color:#34472a}
.calc-extra{border-top:1px solid #6d956466;padding-top:16px;margin-top:6px}
.calc-bar{display:none}
@media(max-width:860px){.calc{grid-template-columns:1fr;gap:10px}.calc-result{position:static;scroll-margin-top:90px}.calc-bar{display:flex;position:fixed;left:12px;right:68px;bottom:12px;z-index:20;justify-content:space-between;align-items:center;gap:12px;padding:14px 18px;border-radius:14px;background:#171b15;color:#f0f5e8;font-weight:700;font-size:15px;box-shadow:0 8px 24px #0003}.calc-bar small{font-weight:500;opacity:.8}}
</style>
