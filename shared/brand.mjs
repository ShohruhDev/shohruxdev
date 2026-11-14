// Название бренда и основной домен. Адрес сайта в ссылках берётся из SITE_URL.
export const brandName = 'Razrabotka Tashkent';
export const brandAlternateName = 'Разработка Ташкент';
export const brandDomain = 'razrabotkatashkent.uz';
export const authorName = 'Burxonov Shohrux';
// Юрлицо по свидетельству о госрегистрации от 02.09.2026.
export const company = {
  legalName: { ru: 'ООО «LEADVEX AI»', uz: '«LEADVEX AI» MChJ', en: '"LEADVEX AI" LLC' },
  inn: '313300268',
  address: {
    ru: 'г. Ташкент, Алмазарский район, МФЙ «Тараккиёт», ул. Корасарой, 335',
    uz: 'Toshkent shahri, Olmazor tumani, Taraqqiyot MFY, Qorasaroy ko‘chasi, 335-uy'
  },
  street: 'Qorasaroy ko‘chasi, 335-uy',
  district: 'Olmazor tumani'
};
/** ИНН с пробелами для чтения: 313 300 268. */
export const innFormatted = company.inn.replace(/(\d{3})(?=\d)/g, '$1 ');
