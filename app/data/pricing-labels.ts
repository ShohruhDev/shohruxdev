// Подписи к ценам из shared/pricing.mjs. Ключи — русский текст, перевод в shared/uz.json.
export const typeLabels: Record<string, [string, string]> = {
  landing: ['Лендинг', 'Одна страница под услугу или акцию'],
  corporate: ['Корпоративный сайт', 'Услуги, о компании, контакты. RU + UZ в цене'],
  catalog: ['Сайт-каталог', 'Товары или услуги с фильтрами. RU + UZ в цене'],
  shop: ['Интернет-магазин', 'Корзина, заказ, оплата. RU + UZ в цене'],
  webapp: ['Веб-сервис / CRM', 'Личный кабинет, внутренняя система'],
  telegram: ['Telegram-бот', 'Запись, заявки или ответы на вопросы в Telegram'],
  miniapp: ['Telegram Mini App', 'Каталог, заказ и оплата внутри Telegram'],
  mobile: ['Мобильное приложение', 'iOS и Android']
};
export const typeLabel = (id: string): [string, string] =>
  typeLabels[id] ?? ['Лендинг', 'Одна страница под услугу или акцию'];
export const optionLabels: Record<string, string> = {
  payments: 'Онлайн-оплата (Payme, Click, Uzum)',
  booking: 'Онлайн-запись',
  crm: 'Интеграция с CRM (amoCRM, Bitrix24)',
  onec: 'Интеграция с 1С',
  cabinet: 'Личный кабинет клиента',
  seo: 'Расширенное SEO',
  copy: 'Написать тексты'
};
export const designLabels: Record<string, string> = {
  template: 'На готовой основе',
  custom: 'Индивидуальный',
  premium: 'Премиум с анимацией'
};
/** Одинаковый десятичный разделитель на сервере и в браузере. */
export const formatMln = (v: number | undefined, locale: string) =>
  String(Math.round((v ?? 0) * 100) / 100).replace('.', locale === 'uz' ? '.' : ',');
/** Срок «a – b нед.» или, для длинных проектов, «a – b мес.». */
export const termText = (weeks: number[], locale: string, t: (s: string) => string) => {
  const [a = 0, b = 0] = weeks;
  return b > 8
    ? `${formatMln(Math.round((a / 4.33) * 2) / 2, locale)} – ${formatMln(Math.round((b / 4.33) * 2) / 2, locale)} ${t('мес.')}`
    : `${a} – ${b} ${t('нед.')}`;
};
/** «от 3 млн сум» / «3 mln so‘mdan»: в узбекском «от» — суффикс. */
export const fromMln = (v: number | undefined, locale: string) =>
  locale === 'uz' ? `${formatMln(v, locale)} mln so‘mdan` : `от ${formatMln(v, locale)} млн сум`;
