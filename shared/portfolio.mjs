// Проекты для показа на главной (как блок кейсов у friflex.com).
// Описания — только то, что видно на самих сайтах; результаты и стек добавляются,
// когда владелец их подтвердит (тогда проект можно перенести в shared/cases.mjs).
export const portfolio = [
  {
    slug: 'leadvex',
    name: 'Leadvex',
    url: 'https://www.leadvexai.com/',
    colors: { bg: '#2f55e4', fg: '#ffffff' },
    ru: {
      kind: 'SaaS · CRM',
      summary:
        'CRM для автодилеров ОАЭ: заявки из WhatsApp, Messenger и Instagram, лиды, склад автомобилей и тест-драйвы. Английский и арабский.'
    },
    uz: {
      kind: 'SaaS · CRM',
      summary:
        'BAA avtodilerlari uchun CRM: WhatsApp, Messenger va Instagram murojaatlari, lidlar, avtomobillar ombori va test-drayvlar. Ingliz va arab tillarida.'
    }
  },
  {
    slug: 'total-asset',
    name: 'Total Asset Silk Road',
    url: 'https://total-asset.uz/',
    colors: { bg: '#1c3366', fg: '#e3c27a' },
    ru: {
      kind: 'Корпоративный сайт',
      summary:
        'Сайт консалтинговой компании: сопровождение международных инвесторов и корпоративных клиентов в Узбекистане.'
    },
    uz: {
      kind: 'Korporativ sayt',
      summary:
        'Konsalting kompaniyasi sayti: O‘zbekistonda xalqaro investorlar va korporativ mijozlarni qo‘llab-quvvatlash.'
    }
  },
  {
    slug: 'm19',
    name: 'M19 Barbershop',
    url: 'https://www.m19.uz/',
    colors: { bg: '#141414', fg: '#ffffff' },
    ru: {
      kind: 'Сайт с онлайн-записью',
      summary: 'Сайт барбершопа в центре Ташкента: услуги с ценами и онлайн-запись к барберу.'
    },
    uz: {
      kind: 'Onlayn yozilishli sayt',
      summary:
        'Toshkent markazidagi barbershop sayti: narxlari bilan xizmatlar va barberga onlayn yozilish.'
    }
  },
  {
    slug: 'bolalar-tashkiloti',
    name: 'O‘zbekiston Bolalar Tashkiloti',
    url: 'https://bolalartashkiloti.uz/',
    colors: { bg: '#e8f2fc', fg: '#1d5fa8' },
    ru: {
      kind: 'Портал организации',
      summary:
        'Портал детской организации: проекты, новости, работа во всех регионах и вход для участников.'
    },
    uz: {
      kind: 'Tashkilot portali',
      summary:
        'Bolalar tashkiloti portali: loyihalar, yangiliklar, barcha hududlardagi faoliyat va a’zolar uchun kirish.'
    }
  },
  {
    slug: 'legat',
    name: 'Legat',
    url: 'https://legat.uz/',
    colors: { bg: '#f1efea', fg: '#1f1f1f' },
    ru: {
      kind: 'CRM-система',
      summary: 'CRM для автоматизации судебной работы по кредитам.'
    },
    uz: {
      kind: 'CRM tizimi',
      summary: 'Kreditlar bo‘yicha sud ishlarini avtomatlashtirish uchun CRM.'
    }
  }
];

export const localizeProject = (p, locale) => ({
  ...p,
  ...(locale === 'uz' ? p.uz : p.ru)
});
