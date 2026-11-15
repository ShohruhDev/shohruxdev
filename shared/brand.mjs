// Название бренда и основной домен. Адрес сайта в ссылках берётся из SITE_URL.
export const brandName = 'Razrabotka Tashkent';
export const brandAlternateName = 'Разработка Ташкент';
export const brandDomain = 'razrabotkatashkent.uz';
// Имя автора: на русских страницах кириллицей, на узбекских латиницей
// (узбекская версия сайта пишется латиницей, кириллицы в ней быть не должно).
export const authorName = { ru: 'Шохрух Бурхонов', uz: 'Shohrux Burxonov' };
// Прежние и альтернативные написания того же имени (в т. ч. в уже сохранённых статьях).
const authorSpelling =
  /^(?:(?:burxonov|burhonov|бурхонов)\s+(?:shohru[xh]|sh|шохрух|ш)\.?|(?:shohru[xh]|шохрух)\s+(?:burxonov|burhonov|бурхонов))$/i;
/** Имя автора сайта на языке страницы. */
export const authorFor = locale => (locale === 'uz' ? authorName.uz : authorName.ru);
/** Подпись статьи на языке страницы: любое написание имени автора сайта → authorFor(locale). */
export function displayAuthor(author, locale) {
  const name = String(author || '').trim();
  return authorSpelling.test(name.replace(/\s+/g, ' ')) ? authorFor(locale) : name;
}
// Юрлицо по свидетельству о госрегистрации от 02.09.2026.
export const company = {
  legalName: { ru: 'ООО «LEADVEX AI»', uz: '«LEADVEX AI» MChJ', en: '"LEADVEX AI" LLC' },
  inn: '313300268',
  // Совпадает с карточками Google, Яндекс Бизнеса и 2GIS (NAP).
  phone: '+998905155565',
  phoneDisplay: '+998 90 515 55 65',
  // Для запросов по персональным данным (политика обработки данных).
  email: 'team@leadvexai.com',
  address: {
    ru: 'г. Ташкент, Алмазарский район, МФЙ «Тараккиёт», ул. Корасарой, 335',
    uz: 'Toshkent shahri, Olmazor tumani, Taraqqiyot MFY, Qorasaroy ko‘chasi, 335-uy'
  },
  street: 'Qorasaroy ko‘chasi, 335-uy',
  district: 'Olmazor tumani'
};
// Публичные страницы бренда в соцсетях (подвал и schema.org sameAs).
export const socialProfiles = [
  { id: 'telegram', label: 'Telegram-канал', url: 'https://t.me/razrabotkatashkent' },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/razrabotkatashkent/' },
  {
    id: 'facebook',
    label: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61596688616863'
  }
];
/** ИНН с пробелами для чтения: 313 300 268. */
export const innFormatted = company.inn.replace(/(\d{3})(?=\d)/g, '$1 ');
