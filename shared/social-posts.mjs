// Очереди постов для Instagram и Facebook-страницы. Тексты взяты из docs/social-kit-2026-11.md
// без изменений (разделы 4 и 6), расписание из раздела 7 (Instagram и Facebook в 12:00 по Ташкенту).
// Публикуются только посты с approved: true, когда наступит publishAt (см. deploy/railway.md, раздел Meta).
// Порядок Instagram важен для сетки профиля: ig-01 → ig-09, посты уходят строго по очереди.
// Хэштеги Instagram: оставлены первые пять из каждого списка (docs/social-kit-2026-11.md, разделы 4 и 8:
// с конца 2025 года Instagram ограничивает пост пятью хэштегами).
// Не меняйте id и текст поста, который уже начал публиковаться: учёт ведётся по сети и id.

/** @type {{ id: string, publishAt: string, approved: boolean, image: string, ru: string, uz: string, hashtags: string[] }[]} */
export const instagramPosts = [
  {
    id: 'ig-01',
    publishAt: '2026-11-16T00:45:00+05:00',
    approved: true,
    image: '/social/brand/ig-01.jpg',
    hashtags: ['#ташкент', '#разработкасайтов', '#saytyaratish', '#созданиесайтов', '#телеграмбот'],
    ru: `Razrabotka Tashkent: сайты, веб-сервисы, Telegram-боты и мобильные приложения для бизнеса в Ташкенте и по всему Узбекистану.

Коротко о нас:
• работаем по договору, юрлицо ООО «LEADVEX AI»;
• цену фиксируем до начала разработки;
• вы общаетесь напрямую с разработчиком, без менеджеров-посредников;
• делаем сайты на русском и узбекском.

Здесь будут цены и сроки, разборы типовых задач и проекты, которые мы сделали.

Связаться: +998 90 515 55 65, Telegram @shohrux_0626, ежедневно 9:00–20:00. Ссылка на сайт в профиле.`,
    uz: `Razrabotka Tashkent: Toshkent va butun O‘zbekiston bizneslari uchun saytlar, veb-xizmatlar, Telegram-botlar va mobil ilovalar.

Qisqacha biz haqimizda:
• shartnoma asosida ishlaymiz, yuridik shaxs: «LEADVEX AI» MChJ;
• narxni dasturlash boshlanishidan oldin belgilaymiz;
• siz vositachi menejerlarsiz dasturchi bilan bevosita muloqot qilasiz;
• rus va o‘zbek tillarida saytlar yaratamiz.

Aloqa: +998 90 515 55 65, Telegram @shohrux_0626, har kuni 9:00–20:00. Sayt havolasi profilda.`
  },
  {
    id: 'ig-02',
    publishAt: '2026-11-16T00:45:00+05:00',
    approved: true,
    image: '/social/brand/ig-02.jpg',
    hashtags: ['#разработкасайтов', '#ташкент', '#saytyaratish', '#сайтподключ', '#онлайнзапись'],
    ru: `Кейс: сайт барбершопа M19 с онлайн-записью и магазином

M19 Barbershop в центре Ташкента ведёт запись клиентов в Altegio. Нужен был свой сайт: услуги с ценами и длительностью, мастера, онлайн-запись без ухода с сайта. И магазин, потому что барбершоп продаёт косметику.

Что сделали:
• встроили виджет Altegio: свободное время и мастера берутся из системы, где барбершоп уже работает;
• магазин косметики: каталог, корзина, заказ по имени и телефону;
• галерея работ с фото и видео;
• админ-панель для товаров, галереи и заказов.

Товары, цены и заказы барбершоп ведёт сам, без разработчика. Разработка заняла два месяца. Сайт: m19.uz`,
    uz: `Keys: onlayn yozilish va do‘konli M19 barbershop sayti

Toshkent markazidagi M19 Barbershop mijozlar yozuvini Altegio’da yuritadi. Narxli xizmatlar, ustalar, saytdan chiqmasdan onlayn yozilish va kosmetika do‘koni kerak edi.

Nima qildik: Altegio vidjeti, toifali katalog va savatli do‘kon, foto va video galereya, mahsulotlar va buyurtmalar uchun admin panel. Ishlab chiqish ikki oy davom etdi. Sayt: m19.uz

Batafsil: profildagi havola.`
  },
  {
    id: 'ig-03',
    publishAt: '2026-11-16T00:45:00+05:00',
    approved: true,
    image: '/social/brand/ig-03.jpg',
    hashtags: [
      '#сколькостоитсайт',
      '#разработкасайтов',
      '#ташкент',
      '#saytyaratish',
      '#созданиесайтов'
    ],
    ru: `Сколько стоит разработка в Ташкенте: наши цены на 2026 год

Лендинг: от 3 млн сум, 1–2 недели.
Корпоративный сайт до 7 страниц: от 7 млн сум, 3–5 недель.
Сайт-каталог: от 10 млн сум, 4–6 недель.
Интернет-магазин: от 15 млн сум, 6–10 недель.
Telegram-бот или Mini App: от 8 млн сум, 2–5 недель.
Мобильное приложение iOS и Android: от 40 млн сум, 2–4 месяца.

Что меняет цену: вторая языковая версия +20%, онлайн-оплата Payme, Click или Uzum +2–4 млн сум, срочность +30%.

Это ориентир. Точную сумму называем после короткого обсуждения задачи, бесплатно, и фиксируем её в договоре. Полный прайс и калькулятор на сайте, ссылка в профиле.`,
    uz: `Toshkentda dasturlash qancha turadi: 2026-yilgi narxlarimiz

Lending: 3 mln so‘mdan, 1–2 hafta.
7 sahifagacha korporativ sayt: 7 mln so‘mdan, 3–5 hafta.
Katalog-sayt: 10 mln so‘mdan, 4–6 hafta.
Internet-do‘kon: 15 mln so‘mdan, 6–10 hafta.
Telegram-bot yoki Mini App: 8 mln so‘mdan, 2–5 hafta.
iOS va Android mobil ilova: 40 mln so‘mdan, 2–4 oy.

Aniq narxni vazifani muhokama qilgandan so‘ng bepul aytamiz va shartnomada qayd etamiz. To‘liq narxlar va kalkulyator saytda.`
  },
  {
    id: 'ig-04',
    publishAt: '2026-11-18T12:00:00+05:00',
    approved: true,
    image: '/social/brand/ig-04.jpg',
    hashtags: [
      '#корпоративныйсайт',
      '#разработкасайтов',
      '#ташкент',
      '#saytyaratish',
      '#вебразработка'
    ],
    ru: `Кейс: корпоративный сайт для консалтинговой компании

Total Asset Silk Road сопровождает международных инвесторов в Узбекистане. Нужен был сайт на английском и русском: пять направлений работы, команда, проекты и заявки. Тексты компания писала сама и правила по ходу проекта, поэтому главное требование: любой текст меняется без программиста.

Что сделали:
• сайт на Nuxt 3: услуги, команда с личными страницами, проекты, аналитика;
• Directus как CMS: тексты, услуги, сотрудники и проекты правятся в админ-панели;
• роли редактора и проверяющего;
• заявки сохраняются в CMS со статусом.

Работа заняла около двух месяцев вместе с раундами правок. Сайт: total-asset.uz`,
    uz: `Keys: konsalting kompaniyasi uchun korporativ sayt

Total Asset Silk Road O‘zbekistonda xalqaro investorlarni qo‘llab-quvvatlaydi. Ingliz va rus tillarida sayt kerak edi, har qanday matn dasturchisiz o‘zgarishi kerak edi.

Nima qildik: Nuxt 3 sayti, CMS sifatida Directus, muharrir va tekshiruvchi rollari, murojaatlar CMS ichida holati bilan. Ish tahrirlar bilan birga taxminan ikki oy davom etdi. Sayt: total-asset.uz`
  },
  {
    id: 'ig-05',
    publishAt: '2026-11-20T12:00:00+05:00',
    approved: true,
    image: '/social/brand/ig-05.jpg',
    hashtags: [
      '#телеграмбот',
      '#telegrambot',
      '#мобильноеприложение',
      '#разработкаприложений',
      '#ташкент'
    ],
    ru: `Telegram-бот или мобильное приложение: что выбрать

Частая фраза на первой встрече: «Нам нужно приложение». Иногда так и есть, но нередко задачу решает бот или Mini App внутри Telegram, и клиенту не нужно ничего устанавливать.

Telegram-бот: от 3 млн сум, 1–3 недели, один основной сценарий: запись, заявки или ответы на вопросы.
Mini App с каталогом и оплатой внутри Telegram: от 8 млн сум, 3–6 недель.
Приложение для iOS и Android: от 30 млн сум, 2–4 месяца.

Приложение стоит рассматривать, когда клиенты регулярно возвращаются, нужны уведомления и функции телефона или сотрудникам нужен рабочий инструмент на каждый день.

Не уверены? Начните с одного законченного сценария, проверьте его на клиентах и потом решайте про следующий шаг. Сравнить варианты можно в калькуляторе на сайте.`,
    uz: `Telegram-bot yoki mobil ilova: qaysi birini tanlash kerak

Ko‘pincha vazifani bot yoki Telegram ichidagi Mini App hal qiladi, mijoz hech narsa o‘rnatmaydi.

Telegram-bot: 3 mln so‘mdan, 1–3 hafta, bitta asosiy ssenariy.
Katalog va to‘lovli Mini App: 8 mln so‘mdan, 3–6 hafta.
iOS va Android ilova: 30 mln so‘mdan, 2–4 oy.

Mijozlar muntazam qaytsa, bildirishnomalar va telefon imkoniyatlari kerak bo‘lsa, ilova o‘zini oqlaydi. Ikkilansangiz, bitta ssenariydan boshlang.`
  },
  {
    id: 'ig-06',
    publishAt: '2026-11-23T12:00:00+05:00',
    approved: true,
    image: '/social/brand/ig-06.jpg',
    hashtags: ['#crm', '#автоматизация', '#разработкаcrm', '#ташкент', '#вебразработка'],
    ru: `Кейс: CRM для судебной работы по просроченным кредитам

Клиент: компания из Ташкента, которая продаёт товары в рассрочку. Название не раскрываем.

Чтобы подать в суд по просроченному договору, юристу нужно собрать данные, отправить претензию почтой, выждать срок, определить суд, оплатить госпошлину и подготовить пакет документов. Клиенту нужна была система, которая проводит каждое дело по этим этапам.

Что сделали:
• импорт кредитов из Excel и пересчёт дней просрочки;
• претензии каждую ночь уходят через API UzPost с подписью E-IMZO;
• суд определяется по адресу регистрации заёмщика;
• квитанции о госпошлине через Billing Sud;
• шесть документов для суда собираются автоматически.

Разработка идёт с июля 2026 года. На ноябрь в проекте 332 автотеста бэкенда и 77 тестов фронтенда.`,
    uz: `Keys: muddati o‘tgan kreditlar bo‘yicha sud ishlari uchun CRM

Mijoz: Toshkentdagi muddatli to‘lovga tovar sotuvchi kompaniya. Nomini oshkor qilmaymiz.

Nima qildik: kreditlarni Excel’dan import qilish, E-IMZO bilan UzPost API orqali talabnomalar, sudni manzil bo‘yicha aniqlash, Billing Sud orqali davlat boji kvitansiyalari, sud uchun oltita hujjat avtomatik. Noyabrda backendda 332 ta, frontendda 77 ta avtotest bor.`
  },
  {
    id: 'ig-07',
    publishAt: '2026-11-25T12:00:00+05:00',
    approved: true,
    image: '/social/brand/ig-07.jpg',
    hashtags: ['#разработкасайтов', '#сроки', '#ташкент', '#saytyaratish', '#созданиесайтов'],
    ru: `За сколько делают сайт: наши базовые сроки

Лендинг: 1–2 недели.
Корпоративный сайт до 7 страниц: 3–5 недель.
Сайт-каталог: 4–6 недель.
Интернет-магазин: 6–10 недель.
Telegram-бот: 1–3 недели.
Telegram Mini App: 3–6 недель.
Веб-сервис, CRM или мобильное приложение: 2–4 месяца.

Что добавляет время: вторая языковая версия около недели, онлайн-оплата или интеграция с CRM около недели. Срочный режим: на 30% быстрее и на 30% дороже.

Срок зависит и от того, как быстро готовы тексты, фото и решения с вашей стороны. Из практики: сайт барбершопа M19 с записью и магазином занял два месяца.

Прикинуть срок под свой проект: калькулятор на сайте, ссылка в профиле.`,
    uz: `Sayt qancha vaqtda tayyor bo‘ladi: asosiy muddatlarimiz

Lending: 1–2 hafta.
7 sahifagacha korporativ sayt: 3–5 hafta.
Katalog-sayt: 4–6 hafta.
Internet-do‘kon: 6–10 hafta.
Telegram-bot: 1–3 hafta.
Telegram Mini App: 3–6 hafta.
Veb-xizmat, CRM yoki mobil ilova: 2–4 oy.

Ikkinchi til taxminan bir hafta qo‘shadi. Shoshilinch rejim 30% tezroq va 30% qimmatroq.`
  },
  {
    id: 'ig-08',
    publishAt: '2026-11-27T12:00:00+05:00',
    approved: true,
    image: '/social/brand/ig-08.jpg',
    hashtags: ['#saas', '#crm', '#разработкаприложений', '#вебсервис', '#ташкент'],
    ru: `Кейс: Leadvex, наш собственный SaaS для автосалонов ОАЭ

Leadvex не заказ клиента, а продукт ООО «LEADVEX AI», юрлица, которое стоит за Razrabotka Tashkent.

Автосалоны в ОАЭ получают заявки в WhatsApp, Messenger и Instagram, а данные о клиенте, машине и тест-драйве хранятся в разных местах. Нужен был облачный сервис, где продавец ведёт заявку от первого сообщения до визита в салон.

Что сделано:
• общий входящий для переписки из трёх каналов;
• CRM лидов и склад автомобилей по салонам;
• запись на тест-драйв прямо из диалога;
• интерфейс на английском и арабском, с письмом справа налево.

С июля 2026 года сделаны бэкенд, два фронтенд-приложения и сайт. Продукт запущен на leadvexai.com. ИИ-ассистент пока в разработке.`,
    uz: `Keys: Leadvex, BAA avtosalonlari uchun o‘zimizning SaaS

Leadvex mijoz buyurtmasi emas, «LEADVEX AI» MChJning o‘z mahsuloti.

Nima qilindi: uchala kanal yozishmalari bitta ro‘yxatda, lidlar CRM’i, avtomobillar ombori, dialogdan test-drayvga yozish, ingliz va arab tilidagi interfeys. Mahsulot leadvexai.com manzilida ishlaydi.`
  },
  {
    id: 'ig-09',
    publishAt: '2026-11-30T12:00:00+05:00',
    approved: true,
    image: '/social/brand/ig-09.jpg',
    hashtags: ['#разработкасайтов', '#ташкент', '#saytyaratish', '#вебстудия', '#телеграмбот'],
    ru: `Как мы работаем: от первого сообщения до запуска

Техническое задание не обязательно. Для первого разговора достаточно рассказать о бизнесе, задаче и результате, который вы хотите получить.

1. Разбираемся в задаче: что должно измениться для бизнеса и кто будет пользоваться продуктом.
2. Определяем первую версию: сценарии, структура, состав работ. Называем стоимость и срок, цену фиксируем в договоре до начала разработки.
3. Проектируем и разрабатываем: сначала интерфейс и ключевой сценарий, промежуточный результат показываем по ходу.
4. Запускаем: проверяем работу, передаём доступы и документацию.

Предварительная оценка бесплатная. Напишите в Telegram @shohrux_0626 или позвоните: +998 90 515 55 65.`,
    uz: `Qanday ishlaymiz: birinchi xabardan ishga tushirishgacha

Texnik topshiriq shart emas. Birinchi suhbat uchun biznes, vazifa va kutilgan natija haqida aytib berish kifoya.

1. Vazifani tushunib olamiz.
2. Birinchi versiyani belgilaymiz, narxni dasturlashdan oldin shartnomada qayd etamiz.
3. Loyihalaymiz va yaratamiz, oraliq natijani ko‘rsatamiz.
4. Ishga tushiramiz, kirish huquqlari va hujjatlarni topshiramiz.

Dastlabki baholash bepul. Telegram: @shohrux_0626, telefon: +998 90 515 55 65.`
  }
];

/** @type {{ id: string, publishAt: string, approved: boolean, image?: string, link?: string, message: string }[]} */
export const facebookPosts = [
  {
    id: 'fb-1',
    publishAt: '2026-11-16T00:45:00+05:00',
    approved: true,
    image: '/social/brand/ig-01.jpg',
    message: `Razrabotka Tashkent: сайты, веб-сервисы, Telegram-боты и мобильные приложения для бизнеса в Ташкенте и по всему Узбекистану.

Коротко о нас:
• работаем по договору, юрлицо ООО «LEADVEX AI»;
• цену фиксируем до начала разработки;
• вы общаетесь напрямую с разработчиком, без менеджеров-посредников;
• делаем сайты на русском и узбекском.

На этой странице будут цены и сроки, разборы типовых задач и проекты, которые мы сделали.

Связаться: +998 90 515 55 65, Telegram @shohrux_0626, ежедневно 9:00–20:00.

https://razrabotkatashkent.uz/?utm_source=facebook&utm_medium=social&utm_campaign=posts

#ташкент #разработкасайтов`
  },
  {
    id: 'fb-2',
    publishAt: '2026-11-19T12:00:00+05:00',
    approved: true,
    image: '/social/brand/prices-2026-v2.jpg',
    message: `Сколько стоит разработка в Ташкенте: наши цены на 2026 год

Публикуем базовые цены, чтобы бюджет можно было прикинуть до первого звонка.

Лендинг: от 2,5 млн сум (2,5–5 млн), 1–2 недели.
Корпоративный сайт до 7 страниц, RU + UZ: от 6 млн сум (6–12 млн), 3–5 недель.
Сайт-каталог, RU + UZ: от 7 млн сум (7–14 млн), 4–6 недель.
Интернет-магазин, RU + UZ: от 12 млн сум (12–25 млн), 6–10 недель.
Telegram-бот: от 3 млн сум (3–8 млн), 1–3 недели.
Telegram Mini App: от 8 млн сум (8–20 млн), 3–6 недель.
Мобильное приложение iOS и Android: от 30 млн сум (30–80 млн), 2–4 месяца.

Что меняет цену:
• вторая языковая версия для лендинга или бота: +20% (в корпоративном сайте, каталоге и магазине RU + UZ уже в цене);
• дизайн на готовой основе: −20%, премиум с анимацией: +30%;
• онлайн-оплата Payme, Click или Uzum: +1,5–3 млн сум;
• срочно, на 30% быстрее: +30%.

Отдельно от разработки: домен .uz около 80–100 тыс. сум в год, хостинг 50–300 тыс. сум в месяц.

Точную сумму называем после короткого обсуждения задачи, бесплатно, и фиксируем в договоре до начала работ.

Полный прайс и калькулятор: https://razrabotkatashkent.uz/prices?utm_source=facebook&utm_medium=social&utm_campaign=posts`
  },
  {
    id: 'fb-3',
    publishAt: '2026-11-23T12:00:00+05:00',
    approved: true,
    image: '/social/brand/ig-02.jpg',
    message: `Кейс: сайт барбершопа M19 с онлайн-записью и магазином

M19 Barbershop в центре Ташкента ведёт запись клиентов в Altegio. Нужен был свой сайт: услуги с ценами и длительностью, мастера, онлайн-запись без ухода с сайта. И магазин, потому что кроме услуг барбершоп продаёт косметику.

Что сделали:
• встроили виджет Altegio: свободное время и мастера берутся из системы, где барбершоп уже работает, вести запись в двух местах не нужно;
• магазин косметики: каталог с категориями, корзина, заказ по имени и телефону;
• галерея работ с фото и видео;
• админ-панель: товары, галерея и заказы со статусами;
• адаптивная вёрстка, анимации на GSAP, Яндекс Метрика.

Товары, цены, галерею и заказы барбершоп ведёт сам, без разработчика. Разработка заняла два месяца, с января по март 2026 года. Сайт работает на m19.uz.

Подробнее: https://razrabotkatashkent.uz/cases/m19?utm_source=facebook&utm_medium=social&utm_campaign=posts`
  },
  {
    id: 'fb-4',
    publishAt: '2026-11-26T12:00:00+05:00',
    approved: true,
    image: '/social/brand/ig-05.jpg',
    message: `Telegram-бот или мобильное приложение: что выбрать

Частая фраза на первой встрече: «Нам нужно приложение». Иногда так и есть, но нередко задачу решает бот или Mini App внутри Telegram, и клиенту не нужно ничего устанавливать.

Telegram-бот: от 3 млн сум, 1–3 недели. Под один основной сценарий: запись, заявки или ответы на вопросы.

Telegram Mini App: от 8 млн сум, 3–6 недель. Каталог, заказ и оплата внутри Telegram.

Мобильное приложение для iOS и Android: от 30 млн сум, 2–4 месяца.

Приложение стоит рассматривать, когда:
• клиенты регулярно возвращаются в ваш сервис;
• нужны уведомления и функции устройства;
• сотрудникам нужен удобный рабочий инструмент на каждый день.

Если не уверены, начните с одного законченного сценария, проверьте его на клиентах и потом решайте про следующий шаг. Перед мобильной разработкой мы сравниваем три варианта: одна платформа, кроссплатформенное приложение или адаптивный веб-сервис.

Сравнить стоимость: https://razrabotkatashkent.uz/?utm_source=facebook&utm_medium=social&utm_campaign=posts#calculator`
  },
  {
    id: 'fb-5',
    publishAt: '2026-11-30T12:00:00+05:00',
    approved: true,
    image: '/social/brand/ig-04.jpg',
    message: `Кейс: корпоративный сайт для Total Asset Silk Road

Консалтинговая компания из Ташкента сопровождает международных инвесторов в Узбекистане. Ей нужен был сайт на английском и русском: пять направлений работы, команда, проекты и заявки.

Тексты компания писала сама и правила по ходу проекта, поэтому главное требование: любой текст меняется без программиста.

Что сделали:
• сайт на Nuxt 3: услуги, команда с личными страницами, проекты, аналитика;
• Directus как CMS: тексты, услуги, сотрудники и проекты правятся в админ-панели;
• роли редактора и проверяющего, публикует только проверяющий;
• заявки сохраняются в CMS со статусом;
• SEO-основа: мета-теги, hreflang, sitemap, JSON-LD.

Работа заняла около двух месяцев, с 13 мая по 15 июля 2026 года, вместе с раундами правок. Сайт работает на total-asset.uz.

Подробнее: https://razrabotkatashkent.uz/cases/total-asset?utm_source=facebook&utm_medium=social&utm_campaign=posts`
  },
  {
    id: 'fb-6',
    publishAt: '2026-12-03T12:00:00+05:00',
    approved: true,
    image: '/social/brand/ig-09.jpg',
    message: `Как мы работаем: от первого сообщения до запуска

Техническое задание не обязательно. Для первого разговора достаточно рассказать о бизнесе, задаче и результате, который вы хотите получить. Если есть примеры, текущий сайт или жёсткий срок, напишите и об этом.

1. Разбираемся в задаче. Что должно измениться для бизнеса и кто будет пользоваться продуктом.
2. Определяем первую версию. Сценарии, структура, состав работ и границы проекта. Называем стоимость и срок, затем фиксируем цену в договоре, до начала разработки.
3. Проектируем и разрабатываем. Сначала интерфейс и ключевой сценарий, потом реализация. Промежуточный результат показываем по ходу.
4. Запускаем. Проверяем работу, передаём доступы и документацию. Поддержку и доработки обсуждаем отдельным этапом.

С вами напрямую общается разработчик, без менеджеров-посредников. Предварительная оценка бесплатная.

Опишите задачу: https://razrabotkatashkent.uz/contact?utm_source=facebook&utm_medium=social&utm_campaign=posts`
  }
];

// Истории Instagram (stories): только картинка, без подписи. Публикуются тем же автопостингом
// (media_type=STORIES), строго по publishAt, только с approved: true; учёт под сетью instagram_story.
// Картинка: /social/stories/<имя>.jpg из public/social/stories/, JPEG 1080×1920 (9:16), до 8 МБ.
// История видна 24 часа; «Актуальное» (highlights) и стикеры-ссылки добавляются вручную в приложении.
// Пример: { id: 'st-01', publishAt: '2026-11-23T18:00:00+05:00', approved: true, image: '/social/stories/st-01.jpg' }
// Не меняйте id истории, которая уже начала публиковаться.

/** @type {{ id: string, publishAt: string, approved: boolean, image: string }[]} */
export const instagramStories = [
  {
    id: 'st-prices-1',
    publishAt: '2026-11-16T01:30:00+05:00',
    approved: true,
    image: '/social/stories/prices-1.jpg'
  },
  {
    id: 'st-prices-2',
    publishAt: '2026-11-16T01:32:00+05:00',
    approved: true,
    image: '/social/stories/prices-2.jpg'
  },
  {
    id: 'st-prices-3',
    publishAt: '2026-11-16T01:34:00+05:00',
    approved: true,
    image: '/social/stories/prices-3.jpg'
  },
  {
    id: 'st-prices-1-uz',
    publishAt: '2026-11-16T01:36:00+05:00',
    approved: true,
    image: '/social/stories/prices-1-uz.jpg'
  },
  {
    id: 'st-prices-2-uz',
    publishAt: '2026-11-16T01:38:00+05:00',
    approved: true,
    image: '/social/stories/prices-2-uz.jpg'
  },
  {
    id: 'st-prices-3-uz',
    publishAt: '2026-11-16T01:40:00+05:00',
    approved: true,
    image: '/social/stories/prices-3-uz.jpg'
  },
  {
    id: 'st-cases-1',
    publishAt: '2026-11-16T01:42:00+05:00',
    approved: true,
    image: '/social/stories/cases-1.jpg'
  },
  {
    id: 'st-cases-2',
    publishAt: '2026-11-16T01:44:00+05:00',
    approved: true,
    image: '/social/stories/cases-2.jpg'
  },
  {
    id: 'st-cases-3',
    publishAt: '2026-11-16T01:46:00+05:00',
    approved: true,
    image: '/social/stories/cases-3.jpg'
  },
  {
    id: 'st-cases-4',
    publishAt: '2026-11-16T01:48:00+05:00',
    approved: true,
    image: '/social/stories/cases-4.jpg'
  },
  {
    id: 'st-cases-5',
    publishAt: '2026-11-16T01:50:00+05:00',
    approved: true,
    image: '/social/stories/cases-5.jpg'
  },
  {
    id: 'st-process-1',
    publishAt: '2026-11-16T01:52:00+05:00',
    approved: true,
    image: '/social/stories/process-1.jpg'
  },
  {
    id: 'st-process-2',
    publishAt: '2026-11-16T01:54:00+05:00',
    approved: true,
    image: '/social/stories/process-2.jpg'
  },
  {
    id: 'st-process-3',
    publishAt: '2026-11-16T01:56:00+05:00',
    approved: true,
    image: '/social/stories/process-3.jpg'
  },
  {
    id: 'st-process-4',
    publishAt: '2026-11-16T01:58:00+05:00',
    approved: true,
    image: '/social/stories/process-4.jpg'
  },
  {
    id: 'st-faq-1',
    publishAt: '2026-11-16T02:00:00+05:00',
    approved: true,
    image: '/social/stories/faq-1.jpg'
  },
  {
    id: 'st-faq-2',
    publishAt: '2026-11-16T02:02:00+05:00',
    approved: true,
    image: '/social/stories/faq-2.jpg'
  },
  {
    id: 'st-faq-3',
    publishAt: '2026-11-16T02:04:00+05:00',
    approved: true,
    image: '/social/stories/faq-3.jpg'
  },
  {
    id: 'st-faq-4',
    publishAt: '2026-11-16T02:06:00+05:00',
    approved: true,
    image: '/social/stories/faq-4.jpg'
  },
  {
    id: 'st-contacts-1',
    publishAt: '2026-11-16T02:08:00+05:00',
    approved: true,
    image: '/social/stories/contacts-1.jpg'
  },
  {
    id: 'st-contacts-1-uz',
    publishAt: '2026-11-16T02:10:00+05:00',
    approved: true,
    image: '/social/stories/contacts-1-uz.jpg'
  },
  // Новые цены от 16.11.2026: заменяют st-prices-* в «Актуальном» (старые удалить вручную).
  {
    id: 'st-prices-v2-1',
    publishAt: '2026-11-16T12:00:00+05:00',
    approved: false,
    image: '/social/stories/prices-v2-1.jpg'
  },
  {
    id: 'st-prices-v2-2',
    publishAt: '2026-11-16T12:02:00+05:00',
    approved: false,
    image: '/social/stories/prices-v2-2.jpg'
  },
  {
    id: 'st-prices-v2-3',
    publishAt: '2026-11-16T12:04:00+05:00',
    approved: false,
    image: '/social/stories/prices-v2-3.jpg'
  },
  {
    id: 'st-prices-v2-1-uz',
    publishAt: '2026-11-16T12:06:00+05:00',
    approved: false,
    image: '/social/stories/prices-v2-1-uz.jpg'
  },
  {
    id: 'st-prices-v2-2-uz',
    publishAt: '2026-11-16T12:08:00+05:00',
    approved: false,
    image: '/social/stories/prices-v2-2-uz.jpg'
  },
  {
    id: 'st-prices-v2-3-uz',
    publishAt: '2026-11-16T12:10:00+05:00',
    approved: false,
    image: '/social/stories/prices-v2-3-uz.jpg'
  }
];
