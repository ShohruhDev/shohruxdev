import { displayAuthor } from './brand.mjs';
export function localeOf(path) {
  return /^\/uz(?:\/|$)/.test(path) ? 'uz' : 'ru';
}
export function localePath(path, locale) {
  const clean = path.replace(/^\/uz(?=\/|[?#]|$)/, '') || '/';
  if (clean === '/admin' || clean.startsWith('/admin/')) return clean;
  if (clean.startsWith('/feed.xml')) return locale === 'uz' ? '/feed.xml?lang=uz' : '/feed.xml';
  return locale === 'uz' ? '/uz' + (clean === '/' ? '' : clean) : clean;
}
export function localizePost(post, locale) {
  const { translations, ...base } = post;
  if (locale === 'uz' && !translations?.uz) return null;
  const { title, description, category, content, answer, faq, readTime, sources, ...metadata } =
    base;
  const localized = locale === 'uz' ? { ...metadata, ...translations.uz } : base;
  return {
    ...localized,
    ...(localized.author ? { author: displayAuthor(localized.author, locale) } : {}),
    locale,
    availableLocales: translations?.uz ? ['ru', 'uz'] : ['ru']
  };
}

// Explicit month names avoid missing Uzbek ICU data in some browsers.
export function publicationDate(value, locale) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).formatToParts(new Date(value));
  const part = type => parts.find(p => p.type === type)?.value;
  const year = part('year'),
    day = Number(part('day')),
    month = Number(part('month')) - 1;
  const ru = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря'
  ];
  const uz = [
    'yanvar',
    'fevral',
    'mart',
    'aprel',
    'may',
    'iyun',
    'iyul',
    'avgust',
    'sentabr',
    'oktabr',
    'noyabr',
    'dekabr'
  ];
  return locale === 'uz' ? `${year}-yil ${day}-${uz[month]}` : `${day} ${ru[month]} ${year} г.`;
}
