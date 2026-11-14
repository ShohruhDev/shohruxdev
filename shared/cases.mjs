// Кейсы — только реальные проекты с разрешения клиента. Пока список пуст, раздел скрыт:
// страницы /cases отдают 404, ссылок в меню и sitemap нет.
//
// Как добавить кейс: допишите объект в массив `caseList` по образцу ниже и выполните `npm test`.
// Тест проверит, что заполнены обе версии (RU и UZ) и ссылки корректны.
//
// {
//   slug: 'salon-booking',                 // адрес: /cases/salon-booking
//   service: 'apps',                       // web | apps | mobile — связь со страницей услуги
//   year: 2026,
//   stack: ['Nuxt', 'Node.js', 'PostgreSQL'],
//   links: [{ url: 'https://example.uz' }], // сайт, App Store, Google Play (необязательно)
//   cover: { src: '/cases/salon-booking.webp', width: 1600, height: 1000 }, // public/cases/…
//   ru: {
//     title: 'Онлайн-запись для сети салонов',
//     client: 'Сеть салонов красоты, Ташкент',     // можно без названия, если NDA
//     summary: 'Одно предложение о результате.',
//     task: 'Что было до проекта и какую задачу ставил клиент.',
//     solution: ['Что сделано', 'Ещё одно решение'],
//     results: ['Проверяемый результат: цифра и период'],
//     testimonial: { text: 'Отзыв клиента', author: 'Имя, должность' } // необязательно
//   },
//   uz: { ...те же поля на узбекском (латиница)... }
// }
export const caseList = [];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SERVICES = ['web', 'apps', 'mobile'];
const text = v => typeof v === 'string' && v.trim().length > 0;
const list = v => Array.isArray(v) && v.length > 0 && v.every(text);

export function validateCase(c) {
  const errors = [];
  if (!SLUG.test(c?.slug || '')) errors.push('slug');
  if (!SERVICES.includes(c?.service)) errors.push('service');
  if (!Number.isInteger(c?.year) || c.year < 2000 || c.year > 2100) errors.push('year');
  if (!list(c?.stack)) errors.push('stack');
  for (const l of c?.links || [])
    if (!/^https:\/\/[^\s]+$/.test(l?.url || '')) errors.push('links');
  if (
    c?.cover &&
    !(text(c.cover.src) && c.cover.src.startsWith('/') && c.cover.width > 0 && c.cover.height > 0)
  )
    errors.push('cover');
  for (const lang of ['ru', 'uz']) {
    const v = c?.[lang];
    for (const f of ['title', 'client', 'summary', 'task'])
      if (!text(v?.[f])) errors.push(`${lang}.${f}`);
    for (const f of ['solution', 'results']) if (!list(v?.[f])) errors.push(`${lang}.${f}`);
    if (v?.testimonial && !(text(v.testimonial.text) && text(v.testimonial.author)))
      errors.push(`${lang}.testimonial`);
  }
  return errors;
}

export function checkCases(items) {
  const seen = new Set();
  for (const c of items) {
    const errors = validateCase(c);
    if (seen.has(c?.slug)) errors.push('duplicate slug');
    seen.add(c?.slug);
    if (errors.length) throw new Error(`Case "${c?.slug}": ${errors.join(', ')}`);
  }
  return items;
}

/** Проверенные кейсы, новые сверху. */
export const cases = checkCases([...caseList]).sort((a, b) => b.year - a.year);

/** Кейс на нужном языке: общие поля + переведённые. */
export function localizeCase(c, locale) {
  const { ru, uz, ...base } = c;
  return { ...base, ...(locale === 'uz' ? uz : ru) };
}
