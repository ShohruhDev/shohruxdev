// Цены утверждены владельцем 16.11.2026 по обзору рынка Ташкента (docs/calculator-pricing.md).
// Суммы — млн сум, сроки — недели. includedLangs — сколько языковых версий (RU + UZ) входит в базу.
export const projectTypes = [
  { id: 'landing', service: 'web', price: [2.5, 5], weeks: [1, 2] },
  {
    id: 'corporate',
    service: 'web',
    price: [6, 12],
    weeks: [3, 5],
    includedPages: 7,
    includedLangs: 2
  },
  { id: 'catalog', service: 'web', price: [7, 14], weeks: [4, 6], includedLangs: 2 },
  { id: 'shop', service: 'web', price: [12, 25], weeks: [6, 10], includedLangs: 2 },
  { id: 'webapp', service: 'apps', price: [20, 50], weeks: [8, 17] },
  { id: 'telegram', service: 'apps', price: [3, 8], weeks: [1, 3] },
  { id: 'miniapp', service: 'apps', price: [8, 20], weeks: [3, 6] },
  { id: 'mobile', service: 'mobile', price: [30, 80], weeks: [8, 17] }
];
export const extraPage = { price: [0.4, 0.7], days: [1, 2] };
export const designs = {
  template: { price: 0.8, time: 0.8 },
  custom: { price: 1, time: 1 },
  premium: { price: 1.3, time: 1.3 }
};
export const languages = {
  1: { price: 1, weeks: 0 },
  2: { price: 1.2, weeks: 1 },
  3: { price: 1.35, weeks: 1.5 }
};
// Третий язык (EN), когда RU + UZ уже входят в базу.
export const thirdLanguage = { price: 1.15, weeks: 0.5 };
export const options = [
  {
    id: 'payments',
    price: [1.5, 3],
    weeks: [1, 1],
    types: ['landing', 'catalog', 'shop', 'webapp', 'telegram', 'miniapp', 'mobile']
  },
  {
    id: 'booking',
    price: [3, 6],
    weeks: [1, 2],
    types: ['landing', 'corporate', 'webapp', 'telegram', 'miniapp', 'mobile']
  },
  {
    id: 'crm',
    price: [2, 5],
    weeks: [1, 1],
    types: ['landing', 'corporate', 'catalog', 'shop', 'webapp', 'telegram', 'miniapp', 'mobile']
  },
  { id: 'onec', price: [3.5, 8], weeks: [2, 3], types: ['catalog', 'shop', 'webapp'] },
  { id: 'cabinet', price: [6, 15], weeks: [2, 3], types: ['corporate', 'catalog', 'shop'] },
  { id: 'seo', price: [2, 4], weeks: [1, 1], types: ['landing', 'corporate', 'catalog', 'shop'] },
  {
    id: 'copy',
    price: [0.15, 0.3],
    days: [2, 3],
    perPage: true,
    types: ['landing', 'corporate', 'catalog', 'shop']
  }
];
export const urgency = { price: 1.3, time: 0.7 };
const copyPages = { landing: 3, catalog: 7, shop: 7 };
const half = v => Math.round(v * 2) / 2;
const noExtra = { price: 1, weeks: 0 };
/** Множитель языков: версии, входящие в базу, бесплатны; третий язык сверх RU + UZ — thirdLanguage. */
export function langFactor(type, langs) {
  const n = languages[langs] ? Number(langs) : 1;
  if (!type.includedLangs) return languages[n];
  return n <= type.includedLangs ? noExtra : thirdLanguage;
}

/**
 * @param {{type?: string, pages?: number, design?: string, langs?: number, extras?: string[], urgent?: boolean}} [input]
 * @returns {{type: string, service: string, extraPages: number, options: string[], price: [number, number], weeks: [number, number]}}
 */
export function estimate({
  type = 'corporate',
  pages = 7,
  design = 'custom',
  langs = 1,
  extras = [],
  urgent = false
} = {}) {
  const t = projectTypes.find(p => p.id === type) || projectTypes[1];
  const d = designs[design] || designs.custom;
  const l = langFactor(t, langs);
  const extraPages = t.includedPages
    ? Math.max(0, Math.min(50, Math.round(pages) || 0) - t.includedPages)
    : 0;
  let [pMin, pMax] = t.price,
    [wMin, wMax] = t.weeks;
  pMin += extraPages * extraPage.price[0];
  pMax += extraPages * extraPage.price[1];
  wMin += (extraPages * extraPage.days[0]) / 5;
  wMax += (extraPages * extraPage.days[1]) / 5;
  const chosen = options.filter(o => extras.includes(o.id) && o.types.includes(t.id));
  for (const o of chosen) {
    const n = o.perPage
      ? t.includedPages
        ? Math.max(t.includedPages, Math.round(pages) || 0)
        : copyPages[t.id] || 1
      : 1;
    pMin += o.price[0] * n;
    pMax += o.price[1] * n;
    if (o.days) {
      wMin += o.days[0] / 5;
      wMax += o.days[1] / 5;
    } else {
      wMin += o.weeks[0];
      wMax += o.weeks[1];
    }
  }
  const priceK = d.price * l.price * (urgent ? urgency.price : 1),
    timeK = d.time * (urgent ? urgency.time : 1);
  return {
    type: t.id,
    service: t.service,
    extraPages,
    options: chosen.map(o => o.id),
    price: [half(pMin * priceK), half(pMax * priceK)],
    weeks: [Math.max(1, Math.floor(wMin * timeK + l.weeks)), Math.ceil(wMax * timeK + l.weeks)]
  };
}
