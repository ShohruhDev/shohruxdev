// Очередь постов для Telegram-канала. Тексты взяты из docs/telegram-launch-2026-11.md без изменений.
// Публикуются только посты с approved: true, когда наступит publishAt (см. deploy/railway.md, раздел Telegram).
// Тексты обычные, без разметки: при отправке экранируются для parse_mode HTML.
// Не меняйте id и текст поста, который уже начал публиковаться: учёт отправки ведётся по id.

/** @type {{ id: string, publishAt: string, approved: boolean, image?: string, linkPreview?: boolean, ru: string, uz?: string }[]} */
export const telegramPosts = [
  {
    id: 'prices-2026',
    publishAt: '2026-11-16T10:00:00+05:00',
    approved: true,
    ru: `Сколько стоит сайт в Ташкенте: наши цены на 2026 год

Публикуем базовые цены, чтобы бюджет можно было прикинуть до первого звонка.

Лендинг: от 2,5 млн сум (2,5 – 5 млн), 1 – 2 недели.
Корпоративный сайт до 7 страниц, RU + UZ: от 6 млн сум (6 – 12 млн), 3 – 5 недель.
Сайт-каталог, RU + UZ: от 7 млн сум (7 – 14 млн), 4 – 6 недель.
Интернет-магазин, RU + UZ: от 12 млн сум (12 – 25 млн), 1,5 – 2,5 месяца.
Telegram-бот: от 3 млн сум (3 – 8 млн), 1 – 3 недели.
Telegram Mini App: от 8 млн сум (8 – 20 млн), 3 – 6 недель.

Что меняет цену:
• вторая языковая версия для лендинга или бота: +20% (в корпоративном сайте, каталоге и магазине RU + UZ уже в цене);
• дизайн на готовой основе: −20%, премиум с анимацией: +30%;
• онлайн-оплата Payme, Click или Uzum: +1,5 – 3 млн сум;
• срочно, на 30% быстрее: +30%.

Отдельно от разработки: домен .uz около 80–100 тыс. сум в год, хостинг 50–300 тыс. сум в месяц.

Это ориентир. Точную сумму называем после короткого обсуждения задачи, бесплатно, и фиксируем её в договоре до начала работ.

Полный прайс с функциями и интеграциями:
https://razrabotkatashkent.uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel`,
    uz: `Toshkentda sayt qancha turadi: 2026-yilgi narxlarimiz

Birinchi qo‘ng‘iroqdan oldin budjetni chamalab olishingiz uchun asosiy narxlarni e’lon qilamiz.

Lending: 2.5 mln so‘mdan (2.5 – 5 mln), 1 – 2 hafta.
7 sahifagacha korporativ sayt, RU + UZ: 6 mln so‘mdan (6 – 12 mln), 3 – 5 hafta.
Katalog-sayt, RU + UZ: 7 mln so‘mdan (7 – 14 mln), 4 – 6 hafta.
Internet-do‘kon, RU + UZ: 12 mln so‘mdan (12 – 25 mln), 1.5 – 2.5 oy.
Telegram-bot: 3 mln so‘mdan (3 – 8 mln), 1 – 3 hafta.
Telegram Mini App: 8 mln so‘mdan (8 – 20 mln), 3 – 6 hafta.

Narxga nima ta’sir qiladi:
• lending yoki bot uchun ikkinchi til: +20% (korporativ sayt, katalog va do‘konda RU + UZ narxga kiritilgan);
• tayyor asosdagi dizayn: −20%, animatsiyali premium dizayn: +30%;
• Payme, Click yoki Uzum orqali onlayn to‘lov: +1.5 – 3 mln so‘m;
• shoshilinch, 30% tezroq: +30%.

Dasturlashdan tashqari: .uz domeni yiliga taxminan 80–100 ming so‘m, xosting oyiga 50–300 ming so‘m.

Bu taxminiy mo‘ljal. Aniq narxni vazifani qisqa muhokama qilgandan so‘ng bepul aytamiz va uni ish boshlanishidan oldin shartnomada qayd etamiz.

Funksiyalar va integratsiyalar bilan to‘liq narxlar:
https://razrabotkatashkent.uz/uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel`
  },
  {
    id: 'case-total-asset',
    publishAt: '2026-11-18T10:00:00+05:00',
    approved: true,
    image: '/social/telegram/total-asset.jpg',
    ru: `Кейс: корпоративный сайт для Total Asset Silk Road

Консалтинговая компания из Ташкента сопровождает международных инвесторов в Узбекистане. Ей нужен был сайт на английском и русском: пять направлений работы, команда, проекты и заявки.

Тексты компания писала сама и правила по ходу проекта, поэтому главное требование: любой текст меняется без программиста.

Что сделали:
• сайт на Nuxt 3: услуги, команда с личными страницами, проекты, аналитика;
• Directus как CMS: тексты, услуги, сотрудники и проекты правятся в админ-панели;
• роли редактора и проверяющего, публикует только проверяющий;
• заявки сохраняются в CMS со статусом;
• SEO-основа: мета-теги, hreflang, sitemap, JSON-LD.

Работа заняла около двух месяцев, с 13 мая по 15 июля 2026 года, вместе с раундами правок. Сайт работает на total-asset.uz.

Подробно о задаче и решениях:
https://razrabotkatashkent.uz/cases/total-asset?utm_source=telegram&utm_medium=social&utm_campaign=channel`,
    uz: `Keys: Total Asset Silk Road uchun korporativ sayt

Toshkentdagi konsalting kompaniyasi O‘zbekistonda xalqaro investorlarni qo‘llab-quvvatlaydi. Unga ingliz va rus tillarida sayt kerak edi: besh ish yo‘nalishi, jamoa, loyihalar va murojaatlar.

Matnlarni kompaniya o‘zi yozdi va loyiha davomida tahrir qildi. Asosiy talab: har qanday matn dasturchisiz o‘zgaradi.

Nima qildik:
• Nuxt 3 sayti: xizmatlar, shaxsiy sahifali jamoa, loyihalar, tahlil;
• CMS sifatida Directus: matnlar, xizmatlar, xodimlar va loyihalar admin panelda tahrirlanadi;
• muharrir va tekshiruvchi rollari, nashrni faqat tekshiruvchi tasdiqlaydi;
• murojaatlar CMS ichida holati bilan saqlanadi;
• SEO asosi: meta-teglar, hreflang, sitemap, JSON-LD.

Ish tahrirlar bilan birga taxminan ikki oy davom etdi: 2026-yil 13-maydan 15-iyulgacha. Sayt total-asset.uz manzilida ishlaydi.

Batafsil:
https://razrabotkatashkent.uz/uz/cases/total-asset?utm_source=telegram&utm_medium=social&utm_campaign=channel`
  },
  {
    id: 'timelines',
    publishAt: '2026-11-20T10:00:00+05:00',
    approved: true,
    ru: `За сколько делают сайт: сроки по типам проектов

Срок зависит не только от разработчика, но и от того, как быстро готовы тексты, фото и решения с вашей стороны. Наши базовые сроки:

Лендинг: 1 – 2 недели.
Корпоративный сайт до 7 страниц: 3 – 5 недель.
Сайт-каталог: 4 – 6 недель.
Интернет-магазин: 1,5 – 2,5 месяца.
Telegram-бот: 1 – 3 недели.
Telegram Mini App: 3 – 6 недель.
Веб-сервис, CRM или мобильное приложение: 2 – 4 месяца.

Что добавляет время:
• вторая языковая версия: +1 неделя, три языка: +1,5 недели;
• каждая страница сверх включённых: +1–2 дня;
• онлайн-оплата или интеграция с CRM: около +1 недели.

Ускорить можно двумя способами: дизайн на готовой основе или срочный режим. Срочно значит на 30% быстрее и на 30% дороже.

Из нашей практики: сайт барбершопа M19 с онлайн-записью и магазином занял два месяца, корпоративный сайт Total Asset Silk Road около двух месяцев вместе с раундами правок.

Прикинуть срок под свой проект можно в калькуляторе:
https://razrabotkatashkent.uz/?utm_source=telegram&utm_medium=social&utm_campaign=channel#calculator`,
    uz: `Sayt qancha vaqtda tayyor bo‘ladi: loyiha turlari bo‘yicha muddatlar

Muddat faqat dasturchiga emas, matnlar, rasmlar va qarorlar sizning tomoningizdan qanchalik tez tayyor bo‘lishiga ham bog‘liq. Bizning asosiy muddatlarimiz:

Lending: 1 – 2 hafta.
7 sahifagacha korporativ sayt: 3 – 5 hafta.
Katalog-sayt: 4 – 6 hafta.
Internet-do‘kon: 1.5 – 2.5 oy.
Telegram-bot: 1 – 3 hafta.
Telegram Mini App: 3 – 6 hafta.
Veb-xizmat, CRM yoki mobil ilova: 2 – 4 oy.

Muddatni nima uzaytiradi:
• ikkinchi til: +1 hafta, uchta til: +1.5 hafta;
• kiritilganidan ortiq har bir sahifa: +1–2 kun;
• onlayn to‘lov yoki CRM bilan integratsiya: taxminan +1 hafta.

Tezlashtirishning ikki yo‘li bor: tayyor asosdagi dizayn yoki shoshilinch rejim. Shoshilinch rejim 30% tezroq va 30% qimmatroq.

Amaliyotimizdan: onlayn yozilish va do‘konli M19 barbershop sayti ikki oyda, Total Asset Silk Road korporativ sayti tahrirlar bilan birga taxminan ikki oyda tayyor bo‘ldi.

O‘z loyihangiz muddatini kalkulyatorda hisoblang:
https://razrabotkatashkent.uz/uz?utm_source=telegram&utm_medium=social&utm_campaign=channel#calculator`
  },
  {
    id: 'case-m19',
    publishAt: '2026-11-23T10:00:00+05:00',
    approved: true,
    image: '/social/telegram/m19.jpg',
    ru: `Кейс: сайт барбершопа M19 с онлайн-записью и магазином

M19 Barbershop в центре Ташкента ведёт запись клиентов в Altegio. Нужен был свой сайт: услуги с ценами и длительностью, мастера, онлайн-запись без ухода с сайта. И магазин, потому что кроме услуг барбершоп продаёт косметику.

Что сделали:
• встроили виджет Altegio: свободное время и мастера берутся из системы, где барбершоп уже работает, вести запись в двух местах не нужно;
• магазин косметики: каталог с категориями, корзина, заказ по имени и телефону;
• галерея работ с фото и видео;
• админ-панель: товары, галерея и заказы со статусами;
• адаптивная вёрстка, анимации на GSAP, Яндекс Метрика.

Товары, цены, галерею и заказы барбершоп ведёт сам, без разработчика. Разработка заняла два месяца, с января по март 2026 года. Сайт работает на m19.uz.

Подробнее о проекте:
https://razrabotkatashkent.uz/cases/m19?utm_source=telegram&utm_medium=social&utm_campaign=channel`,
    uz: `Keys: onlayn yozilish va do‘konli M19 barbershop sayti

Toshkent markazidagi M19 Barbershop mijozlar yozuvini Altegio’da yuritadi. O‘z sayti kerak edi: narxi va davomiyligi ko‘rsatilgan xizmatlar, ustalar, saytdan chiqmasdan onlayn yozilish. Yana do‘kon ham, chunki barbershop kosmetika sotadi.

Nima qildik:
• Altegio vidjetini o‘rnatdik: bo‘sh vaqt va ustalar barbershop ishlayotgan tizimdan olinadi, yozuvni ikki joyda yuritish shart emas;
• kosmetika do‘koni: toifali katalog, savat, ism va telefon bilan buyurtma;
• foto va video ishlar galereyasi;
• admin panel: mahsulotlar, galereya va holatli buyurtmalar;
• telefonga moslashgan sahifalar, GSAP animatsiyalari, Yandex Metrika.

Mahsulotlar, narxlar, galereya va buyurtmalarni barbershop dasturchisiz o‘zi boshqaradi. Ishlab chiqish 2026-yil yanvaridan martigacha, ikki oy davom etdi. Sayt m19.uz manzilida ishlaydi.

Batafsil:
https://razrabotkatashkent.uz/uz/cases/m19?utm_source=telegram&utm_medium=social&utm_campaign=channel`
  },
  {
    id: 'bot-or-app',
    publishAt: '2026-11-25T10:00:00+05:00',
    approved: true,
    ru: `Telegram-бот или мобильное приложение: что выбрать

Частая фраза на первой встрече: «Нам нужно приложение». Иногда так и есть, но нередко задачу решает бот или Mini App внутри Telegram, и клиенту не нужно ничего устанавливать.

Telegram-бот: от 3 млн сум (3 – 8 млн), 1 – 3 недели. Под один основной сценарий: запись, заявки или ответы на вопросы.

Telegram Mini App: от 8 млн сум (8 – 20 млн), 3 – 6 недель. Каталог, заказ и оплата внутри Telegram.

Мобильное приложение для iOS и Android: от 30 млн сум (30 – 80 млн), 2 – 4 месяца.

Приложение стоит рассматривать, когда:
• клиенты регулярно возвращаются в ваш сервис;
• нужны уведомления и функции устройства;
• сотрудникам нужен удобный рабочий инструмент на каждый день.

Если не уверены, начните с небольшой версии: выберите один законченный сценарий, проверьте его на клиентах и потом решайте, нужен ли следующий шаг. Перед мобильной разработкой мы сравниваем три варианта: одна платформа, кроссплатформенное приложение или адаптивный веб-сервис.

Сравнить стоимость вариантов можно в калькуляторе:
https://razrabotkatashkent.uz/?utm_source=telegram&utm_medium=social&utm_campaign=channel#calculator`,
    uz: `Telegram-bot yoki mobil ilova: qaysi birini tanlash kerak

Ko‘p eshitiladigan gap: «Bizga ilova kerak». Ba’zan shunday, lekin ko‘pincha vazifani bot yoki Telegram ichidagi Mini App hal qiladi, mijoz hech narsa o‘rnatmaydi.

Telegram-bot: 3 mln so‘mdan (3 – 8 mln), 1 – 3 hafta. Bitta asosiy ssenariy uchun: yozilish, arizalar yoki savollarga javoblar.

Telegram Mini App: 8 mln so‘mdan (8 – 20 mln), 3 – 6 hafta. Telegram ichida katalog, buyurtma va to‘lov.

iOS va Android uchun mobil ilova: 30 mln so‘mdan (30 – 80 mln), 2 – 4 oy.

Ilova haqida o‘ylash kerak, agar:
• mijozlar xizmatingizdan muntazam foydalansa;
• bildirishnomalar va qurilma imkoniyatlari kerak bo‘lsa;
• xodimlarga har kuni ishlatadigan qulay vosita kerak bo‘lsa.

Ikkilansangiz, kichik versiyadan boshlang: bitta tugallangan ssenariyni mijozlarda sinab ko‘ring, keyingi qadamni shundan keyin hal qiling. Mobil ilovadan oldin uch variantni solishtiramiz: bitta platforma, krossplatforma ilova yoki moslashuvchan veb-xizmat.

Variantlar narxini kalkulyatorda solishtiring:
https://razrabotkatashkent.uz/uz?utm_source=telegram&utm_medium=social&utm_campaign=channel#calculator`
  },
  {
    id: 'case-legat',
    publishAt: '2026-11-27T10:00:00+05:00',
    approved: true,
    image: '/social/telegram/legat.jpg',
    ru: `Кейс: CRM для судебной работы по просроченным кредитам

Клиент: компания из Ташкента, которая продаёт товары в рассрочку. Название не раскрываем.

Чтобы подать в суд по просроченному договору, юристу нужно собрать данные заёмщика и долга, отправить претензию почтой, выждать срок, определить суд, оплатить госпошлину и подготовить пакет документов. Клиенту нужна была система, которая проводит каждое дело по этим этапам.

Что сделали:
• импорт кредитов из Excel, пересчёт дней просрочки;
• претензии формируются каждую ночь и уходят через API UzPost с подписью E-IMZO;
• суд определяется по адресу регистрации заёмщика;
• квитанции о госпошлине через Billing Sud, по одной и пакетами;
• шесть документов для суда собираются автоматически и скачиваются одним архивом.

Разработка идёт с 6 июля 2026 года. На ноябрь в проекте 332 автотеста бэкенда и 77 тестов фронтенда.

Подробнее:
https://razrabotkatashkent.uz/cases/legat?utm_source=telegram&utm_medium=social&utm_campaign=channel`,
    uz: `Keys: muddati o‘tgan kreditlar bo‘yicha sud ishlari uchun CRM

Mijoz: Toshkentdagi muddatli to‘lovga tovar sotuvchi kompaniya. Nomini oshkor qilmaymiz.

Sudga murojaat uchun yurist qarzdor va qarz ma’lumotlarini yig‘ishi, pochta orqali talabnoma yuborishi, muddatni kutishi, sudni aniqlashi, davlat bojini to‘lashi va hujjatlar to‘plamini tayyorlashi kerak. Mijozga har bir ishni shu bosqichlardan o‘tkazadigan tizim kerak edi.

Nima qildik:
• kreditlarni Excel’dan import qilish, kechikish kunlarini qayta hisoblash;
• talabnomalar har kecha tayyorlanadi va E-IMZO bilan UzPost API orqali yuboriladi;
• sud qarzdorning ro‘yxatdagi manzili bo‘yicha aniqlanadi;
• Billing Sud orqali davlat boji kvitansiyalari;
• sud uchun oltita hujjat avtomatik tayyorlanadi va bitta arxivda yuklanadi.

Ish 2026-yil 6-iyuldan davom etmoqda. Noyabrda backendda 332 ta, frontendda 77 ta avtotest bor.

Batafsil:
https://razrabotkatashkent.uz/uz/cases/legat?utm_source=telegram&utm_medium=social&utm_campaign=channel`
  },
  {
    id: 'contractor-questions',
    publishAt: '2026-11-30T10:00:00+05:00',
    approved: true,
    ru: `Что спросить у подрядчика, прежде чем сравнивать цены

Два предложения «сайт за 5 млн» могут означать совсем разную работу. Что стоит спросить:

1. Что входит в цену: страницы, дизайн, языки, админ-панель для текстов.
2. Кто пишет тексты. У нас это отдельно: +0,15 – 0,3 млн сум за страницу.
3. Какие нужны интеграции: оплата, CRM, 1С, онлайн-запись. Каждая меняет цену и срок.
4. На кого оформлены домен, хостинг и аккаунты. Лучше на вас: аккаунты разработчика в магазинах приложений мы оформляем на заказчика.
5. Передадут ли после запуска доступы и документацию.
6. Фиксируется ли цена в договоре до начала работ.

И регулярные расходы: домен .uz около 80–100 тыс. сум в год, хостинг 50–300 тыс. сум в месяц, поддержка от 0,5–1,5 млн сум в месяц.

Все цены, функции и надбавки:
https://razrabotkatashkent.uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel`,
    uz: `Narxlarni solishtirishdan oldin pudratchidan nimani so‘rash kerak

«5 mln so‘mga sayt» degan ikki taklif butunlay boshqa-boshqa ishni anglatishi mumkin. Nimani so‘rash kerak:

1. Narxga nima kiradi: sahifalar, dizayn, tillar, matnlar uchun admin panel.
2. Matnlarni kim yozadi. Bizda alohida: sahifasiga +0.15 – 0.3 mln so‘m.
3. Qanday integratsiyalar kerak: to‘lov, CRM, 1C, onlayn yozilish. Har biri narx va muddatni o‘zgartiradi.
4. Domen, xosting va akkauntlar kimning nomiga. Yaxshisi sizning: ilova do‘konlaridagi dasturchi akkauntlarini biz buyurtmachi nomiga ochamiz.
5. Ishga tushirgandan keyin kirish huquqlari va hujjatlar topshiriladimi.
6. Narx ish boshlanishidan oldin shartnomada qayd etiladimi.

Doimiy xarajatlar ham bor: .uz domeni yiliga taxminan 80–100 ming so‘m, xosting oyiga 50–300 ming so‘m, qo‘llab-quvvatlash oyiga 0,5–1,5 mln so‘mdan.

Barcha narxlar, funksiyalar va qo‘shimchalar:
https://razrabotkatashkent.uz/uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel`
  },
  {
    id: 'case-bolalar-tashkiloti',
    publishAt: '2026-12-02T10:00:00+05:00',
    approved: true,
    image: '/social/telegram/bolalar-tashkiloti.jpg',
    ru: `Кейс: портал детской организации на трёх языках

O‘zbekiston Bolalar Tashkiloti работает во всех регионах Узбекистана. Нужен был открытый портал о деятельности и проектах, с новостями, медиаматериалами, формой обращения и входом для участников. На узбекском, русском и английском.

Сразу о границах нашей работы: бэкенд и админ-панель делал другой подрядчик. Мы сделали публичную часть и подключили её к API организации.

Что вошло в нашу часть:
• сайт на Nuxt с серверным рендерингом: деятельность, проекты, новости, медиа, контакты;
• три языка, у каждой версии свой адрес;
• деятельность по 14 регионам;
• частые вопросы и форма обращения с выбором региона;
• вход для участников.

Новости и проекты публикуются через админ-панель, без правки кода. Страницы отдаются готовым HTML, поисковики видят текст без JavaScript. Портал работает на bolalartashkiloti.uz.

Подробнее:
https://razrabotkatashkent.uz/cases/bolalar-tashkiloti?utm_source=telegram&utm_medium=social&utm_campaign=channel`,
    uz: `Keys: bolalar tashkiloti uchun uch tilli portal

O‘zbekiston Bolalar Tashkiloti barcha hududlarda faoliyat yuritadi. Unga faoliyat, loyihalar, yangiliklar, media materiallar, murojaat shakli va a’zolar uchun kirishga ega ochiq portal kerak edi. O‘zbek, rus va ingliz tillarida.

Ishimiz chegarasi: backend va admin panelni boshqa pudratchi yaratgan. Biz ommaviy qismni tayyorlab, tashkilot API’siga uladik.

Bizning qismimiz:
• server renderli Nuxt sayti: faoliyat, loyihalar, yangiliklar, media, kontaktlar;
• uch til, har bir versiyaning o‘z manzili bor;
• 14 hudud bo‘yicha faoliyat;
• savol-javoblar va hudud tanlanadigan murojaat shakli;
• a’zolar uchun kirish.

Yangiliklar va loyihalar admin panel orqali, kodsiz e’lon qilinadi. Sahifalar tayyor HTML bilan beriladi, qidiruv tizimlari matnni JavaScript’siz ko‘radi. Portal bolalartashkiloti.uz manzilida.

Batafsil:
https://razrabotkatashkent.uz/uz/cases/bolalar-tashkiloti?utm_source=telegram&utm_medium=social&utm_campaign=channel`
  },
  {
    id: 'how-we-work',
    publishAt: '2026-12-04T10:00:00+05:00',
    approved: true,
    ru: `Как мы работаем: от первого сообщения до запуска

Техническое задание не обязательно. Для первого разговора достаточно рассказать о бизнесе, задаче и результате, который вы хотите получить. Если есть примеры, текущий сайт или жёсткий срок, напишите и об этом.

1. Разбираемся в задаче. Что должно измениться для бизнеса и кто будет пользоваться продуктом.
2. Определяем первую версию. Сценарии, структура, состав работ и границы проекта. Называем стоимость и срок, затем фиксируем цену в договоре, до начала разработки.
3. Проектируем и разрабатываем. Сначала интерфейс и ключевой сценарий, потом реализация. Промежуточный результат показываем по ходу и обсуждаем решения с вами.
4. Запускаем. Проверяем работу, передаём доступы и документацию. Поддержку и доработки обсуждаем отдельным этапом.

С вами напрямую общается разработчик, без менеджеров-посредников. Предварительная оценка бесплатная.

Опишите задачу, и мы предложим состав первой версии:
https://razrabotkatashkent.uz/contact?utm_source=telegram&utm_medium=social&utm_campaign=channel`,
    uz: `Qanday ishlaymiz: birinchi xabardan ishga tushirishgacha

Texnik topshiriq shart emas. Birinchi suhbat uchun biznes, vazifa va kutilgan natija haqida aytib berish kifoya. Misollar, hozirgi sayt yoki qat’iy muddat bo‘lsa, ularni ham yozing.

1. Vazifani tushunib olamiz. Biznes uchun nima o‘zgarishi kerak va mahsulotdan kim foydalanadi.
2. Birinchi versiyani belgilaymiz. Ssenariylar, tuzilma, ishlar tarkibi va loyiha chegaralari. Narx va muddatni aytamiz, so‘ng narxni dasturlash boshlanishidan oldin shartnomada qayd etamiz.
3. Loyihalaymiz va yaratamiz. Avval interfeys va asosiy ssenariy, keyin dasturlash. Oraliq natijani ko‘rsatib, yechimlarni siz bilan muhokama qilamiz.
4. Ishga tushiramiz. Ishlashini tekshiramiz, kirish huquqlari va hujjatlarni topshiramiz. Qo‘llab-quvvatlashni alohida bosqich sifatida kelishamiz.

Siz vositachi menejerlarsiz dasturchi bilan bevosita muloqot qilasiz. Dastlabki baholash bepul.

Vazifangizni yozing, birinchi versiya tarkibini taklif qilamiz:
https://razrabotkatashkent.uz/uz/contact?utm_source=telegram&utm_medium=social&utm_campaign=channel`
  },
  {
    id: 'case-leadvex',
    publishAt: '2026-12-07T10:00:00+05:00',
    approved: true,
    image: '/social/telegram/leadvex.jpg',
    ru: `Кейс: Leadvex, наш собственный SaaS для автосалонов ОАЭ

Leadvex не заказ клиента, а продукт ООО «LEADVEX AI», юрлица, которое стоит за Razrabotka Tashkent.

Задача: автосалоны в ОАЭ получают заявки в WhatsApp, Messenger и Instagram, а данные о клиенте, машине и тест-драйве хранятся в разных местах. Нужен облачный сервис, где продавец ведёт заявку от первого сообщения до визита в салон.

Что сделано:
• общий входящий для переписки из трёх каналов;
• CRM лидов со статусами сделки;
• склад автомобилей по салонам с выгрузкой в CSV;
• запись на тест-драйв прямо из диалога;
• роли продавца, менеджера и владельца;
• интерфейс на английском и арабском, с письмом справа налево.

С июля 2026 года сделаны бэкенд, два фронтенд-приложения и сайт. Продукт запущен на leadvexai.com. Следующий этап, ИИ-ассистент, пока в разработке.

Подробнее:
https://razrabotkatashkent.uz/cases/leadvex?utm_source=telegram&utm_medium=social&utm_campaign=channel`,
    uz: `Keys: Leadvex, BAA avtosalonlari uchun o‘zimizning SaaS

Leadvex mijoz buyurtmasi emas, Razrabotka Tashkent ortidagi «LEADVEX AI» MChJning o‘z mahsuloti.

Vazifa: BAA avtosalonlari murojaatlarni WhatsApp, Messenger va Instagram orqali oladi, mijoz, avtomobil va test-drayv ma’lumotlari esa turli joylarda. Sotuvchi murojaatni birinchi xabardan salonga tashrifgacha olib boradigan bulutli xizmat kerak.

Nima qilindi:
• uchala kanal yozishmalari bitta ro‘yxatda;
• bitim holatlari bilan lidlar CRM’i;
• salonlar bo‘yicha avtomobillar ombori, CSV eksport;
• dialogdan test-drayvga yozish;
• sotuvchi, menejer va salon egasi rollari;
• ingliz va arab tilidagi interfeys, o‘ngdan chapga yozuv bilan.

2026-yil iyulidan beri backend, ikkita frontend ilova va sayt tayyorlandi. Mahsulot leadvexai.com manzilida ishlaydi. Keyingi bosqich, sun’iy intellekt yordamchisi, ishlab chiqilmoqda.

Batafsil:
https://razrabotkatashkent.uz/uz/cases/leadvex?utm_source=telegram&utm_medium=social&utm_campaign=channel`
  },
  // Декабрьские посты (docs/social-strategy-2026-12.md, раздел 6.6). Ждут одобрения владельца.
  {
    id: 'hidden-costs',
    publishAt: '2026-12-09T10:00:00+05:00',
    approved: false,
    ru: `Сколько стоит сайт после запуска: расходы, которых нет в смете

Смета на разработку отвечает на вопрос «сколько стоит сделать». Но у сайта, бота и приложения есть регулярные расходы. Лучше заложить их в бюджет сразу, чтобы через год не было сюрпризов.

• Домен .uz: около 80–100 тыс. сум в год.
• Хостинг: 50–300 тыс. сум в месяц.
• Поддержка и доработки: от 0,5–1,5 млн сум в месяц, состав и цену фиксируем в договоре под проект. Можно и без поддержки, тогда заранее договоритесь о ставке на срочные работы.
• Контент: тексты, фото, вычитка узбекской версии. Если тексты пишем мы, это +0,15 – 0,3 млн сум за страницу.
• Онлайн-оплата: договор с Payme, Click или Uzum заключает ваша компания или ИП. Заявку лучше подать заранее, параллельно с разработкой.
• Мобильное приложение: аккаунты разработчика в магазинах приложений мы оформляем на заказчика.

Домен, хостинг и аккаунты можно оформить на вашу компанию, как договоримся в проекте. Сервер мы настраиваем на ваш аккаунт.

Все цены и регулярные расходы:
https://razrabotkatashkent.uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=hidden-costs`,
    uz: `Ishga tushirgandan keyin sayt qancha turadi: smetada yo‘q xarajatlar

Dasturlash smetasi «yaratish qancha turadi» degan savolga javob beradi. Lekin sayt, bot va ilovaning doimiy xarajatlari ham bor. Bir yildan keyin kutilmagan xarajatlar chiqmasligi uchun ularni budjetga darhol kiritgan ma’qul.

• .uz domeni: yiliga taxminan 80–100 ming so‘m.
• Xosting: oyiga 50–300 ming so‘m.
• Qo‘llab-quvvatlash va takomillashtirish: oyiga 0.5–1.5 mln so‘mdan, tarkibi va narxi loyihaga qarab shartnomada qayd etiladi. Usiz ham bo‘ladi, lekin shoshilinch ishlar narxini oldindan kelishib oling.
• Kontent: matnlar, rasmlar, o‘zbekcha versiyani tahrirlash. Matnlarni biz yozsak, sahifasiga +0.15 – 0.3 mln so‘m.
• Onlayn to‘lov: Payme, Click yoki Uzum bilan shartnomani kompaniyangiz yoki YaTT tuzadi. Arizani oldindan, dasturlash bilan parallel topshirgan ma’qul.
• Mobil ilova: ilova do‘konlaridagi dasturchi akkauntlarini biz buyurtmachi nomiga ochamiz.

Domen, xosting va akkauntlarni kompaniyangiz nomiga rasmiylashtirish mumkin, loyihada kelishib olamiz. Serverni sizning akkauntingizda sozlaymiz.

Barcha narxlar va doimiy xarajatlar:
https://razrabotkatashkent.uz/uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=hidden-costs`
  },
  {
    id: 'bilingual-site',
    publishAt: '2026-12-11T10:00:00+05:00',
    approved: false,
    ru: `Сайт на русском и узбекском: что продумать до разработки

В Узбекистане клиенты пишут и на русском, и на узбекском. Но перевод меню ещё не делает сайт двуязычным. Что стоит решить до начала работ.

1. Переводите весь путь, а не только меню: карточку услуги, кнопку, поле формы, ошибку, подтверждение отправки. Частая проблема: услуга описана по-узбекски, а после нажатия на кнопку открывается русская форма.
2. Отдельные адреса для версий, например /uz/..., а не кнопка, которая подменяет текст на одной странице. Так поисковики видят обе версии.
3. Переключатель должен вести на ту же страницу. Человек, читающий об услуге, не должен искать её заново с главной.
4. Общий словарь: названия услуг, кнопок и терминов одинаковы на всех страницах. Названия брендов не переводятся.
5. Живой узбекский. Автоперевод годится как черновик, публиковать стоит после проверки человеком, который уверенно пишет по-узбекски. Отдельно проверьте латиницу: o‘ и g‘ часто набирают неправильно.
6. Обновляйте версии парой. Поменяли условия на русском, сразу поправьте узбекскую страницу.

По бюджету. В корпоративном сайте, каталоге и магазине RU + UZ уже в цене, английский добавляет +15%. В лендинге, боте и Mini App вторая версия: +20% и +1 неделя, три языка: +35% и +1,5 недели.

Посчитать свой вариант и посмотреть все надбавки:
https://razrabotkatashkent.uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=bilingual-site`,
    uz: `Ruscha va o‘zbekcha sayt: dasturlashdan oldin nimalarni o‘ylash kerak

O‘zbekistonda mijozlar rus tilida ham, o‘zbek tilida ham yozadi. Lekin menyuni tarjima qilish saytni ikki tilli qilmaydi. Ish boshlanishidan oldin nimalarni hal qilish kerak.

1. Faqat menyuni emas, butun yo‘lni tarjima qiling: xizmat kartochkasi, tugma, shakl maydoni, xato, yuborish tasdig‘i. Ko‘p uchraydigan muammo: xizmat o‘zbekcha yozilgan, tugmani bosgandan keyin esa ruscha shakl ochiladi.
2. Har bir versiya uchun alohida manzil, masalan /uz/..., bitta sahifada matnni almashtiradigan tugma emas. Shunda qidiruv tizimlari ikkala versiyani ko‘radi.
3. Til almashtirgich o‘sha sahifaning o‘ziga olib borsin. Xizmat haqida o‘qiyotgan odam uni bosh sahifadan qayta qidirmasligi kerak.
4. Umumiy lug‘at: xizmatlar, tugmalar va atamalar nomi barcha sahifalarda bir xil. Brend nomlari tarjima qilinmaydi.
5. Jonli o‘zbek tili. Avtomatik tarjima faqat qoralama, nashrdan oldin o‘zbek tilida ishonchli yozadigan odam tekshirsin. Lotin yozuvida o‘ va g‘ harflarini alohida tekshiring.
6. Versiyalarni juft yangilang. Ruscha shartlar o‘zgarsa, o‘zbekcha sahifani ham darhol to‘g‘rilang.

Budjet bo‘yicha. Korporativ sayt, katalog va do‘konda RU + UZ narxga kiritilgan, ingliz tili +15% qo‘shadi. Lending, bot va Mini App’da ikkinchi til: +20% va +1 hafta, uchta til: +35% va +1.5 hafta.

O‘z variantingizni hisoblang va barcha qo‘shimchalarni ko‘ring:
https://razrabotkatashkent.uz/uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=bilingual-site`
  },
  {
    id: 'integrations',
    publishAt: '2026-12-14T10:00:00+05:00',
    approved: false,
    ru: `Что сильнее всего меняет цену проекта: интеграции

Базовая цена из прайса редко бывает итоговой. Сильнее всего проект дорожает, когда сайт или бот нужно связать с другими системами. Наши цены на 2026 год:

• онлайн-оплата Payme, Click или Uzum: +1,5 – 3 млн сум, около недели;
• онлайн-запись со слотами и мастерами: +3 – 6 млн сум, 1 – 2 недели;
• передача заявок в CRM (amoCRM, Bitrix24): +2 – 5 млн сум, около недели;
• обмен товарами и остатками с 1С (каталог, магазин, веб-сервис): +3,5 – 8 млн сум, 2 – 3 недели;
• личный кабинет клиента (корпоративный сайт, каталог, магазин): +6 – 15 млн сум, 2 – 3 недели.

Как это складывается. Корпоративный сайт на 10 страниц, RU + UZ, заявки в CRM: 9 – 19 млн сум, 4 – 8 недель. Интернет-магазин RU + UZ с онлайн-оплатой и CRM: 15,5 – 33 млн сум, 8 – 12 недель. Если добавить обмен с 1С: 19 – 41 млн сум, 10 – 15 недель.

Два совета:
1. Если вы уже работаете в CRM или системе записи, подключайтесь к ней, а не заказывайте новую. Для барбершопа M19 мы встроили Altegio, где он уже вёл запись.
2. Заявку в платёжную систему подавайте заранее, параллельно с разработкой. Договор заключается на вашу компанию или ИП.

Это ориентир. Точную сумму называем после короткого бесплатного обсуждения и фиксируем в договоре.

Все цены и интеграции:
https://razrabotkatashkent.uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=integrations`,
    uz: `Loyiha narxini eng ko‘p nima o‘zgartiradi: integratsiyalar

Narxlar ro‘yxatidagi asosiy narx kamdan-kam yakuniy bo‘ladi. Sayt yoki botni boshqa tizimlar bilan bog‘lash kerak bo‘lganda loyiha eng ko‘p qimmatlashadi. 2026-yilgi narxlarimiz:

• Payme, Click yoki Uzum orqali onlayn to‘lov: +1.5 – 3 mln so‘m, taxminan bir hafta;
• slotlar va ustalar bilan onlayn yozilish: +3 – 6 mln so‘m, 1 – 2 hafta;
• murojaatlarni CRM’ga uzatish (amoCRM, Bitrix24): +2 – 5 mln so‘m, taxminan bir hafta;
• 1C bilan tovarlar va qoldiqlar almashinuvi (katalog, do‘kon, veb-xizmat): +3.5 – 8 mln so‘m, 2 – 3 hafta;
• mijozning shaxsiy kabineti (korporativ sayt, katalog, do‘kon): +6 – 15 mln so‘m, 2 – 3 hafta.

Amalda qanday yig‘iladi. 10 sahifali korporativ sayt, RU + UZ, murojaatlar CRM’ga: 9 – 19 mln so‘m, 4 – 8 hafta. Onlayn to‘lov va CRM bilan RU + UZ internet-do‘kon: 15.5 – 33 mln so‘m, 8 – 12 hafta. 1C bilan almashinuv qo‘shilsa: 19 – 41 mln so‘m, 10 – 15 hafta.

Ikki maslahat:
1. Agar CRM yoki yozilish tizimida allaqachon ishlayotgan bo‘lsangiz, yangisini buyurtma qilmasdan, unga ulaning. M19 barbershopi uchun yozuv yuritiladigan Altegio’ni saytga o‘rnatdik.
2. To‘lov tizimiga arizani oldindan, dasturlash bilan parallel topshiring. Shartnoma kompaniyangiz yoki YaTT nomiga tuziladi.

Bu taxminiy mo‘ljal. Aniq narxni qisqa bepul muhokamadan so‘ng aytamiz va shartnomada qayd etamiz.

Barcha narxlar va integratsiyalar:
https://razrabotkatashkent.uz/uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=integrations`
  },
  {
    id: 'who-answers',
    publishAt: '2026-12-16T10:00:00+05:00',
    approved: false,
    ru: `Кто отвечает на ваши сообщения

Меня зовут Шохрух Бурхонов, я разработчик Razrabotka Tashkent. Когда вы пишете в Telegram @shohrux_0626 или звоните по номеру +998 90 515 55 65, отвечаю я сам, без менеджеров-посредников.

Как устроена работа:
• обсуждаем задачу, техническое задание не обязательно;
• называю стоимость и срок, цену фиксируем в договоре до начала разработки;
• показываю промежуточный результат по ходу проекта;
• после запуска передаю доступы и документацию.

Работаем официально, по договору. Сайты делаем на русском и узбекском. Предварительная оценка бесплатная.

Опишите задачу, и мы предложим состав первой версии:
https://razrabotkatashkent.uz/contact?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=who-answers`,
    uz: `Xabarlaringizga kim javob beradi

Mening ismim Shohrux Burxonov, Razrabotka Tashkent dasturchisiman. Telegram’da @shohrux_0626 ga yozsangiz yoki +998 90 515 55 65 raqamiga qo‘ng‘iroq qilsangiz, vositachi menejerlarsiz o‘zim javob beraman.

Ish qanday tashkil etilgan:
• vazifani muhokama qilamiz, texnik topshiriq shart emas;
• narx va muddatni aytaman, narxni dasturlashdan oldin shartnomada qayd etamiz;
• loyiha davomida oraliq natijani ko‘rsataman;
• ishga tushirgandan keyin kirish huquqlari va hujjatlarni topshiraman.

Rasmiy ishlaymiz, shartnoma asosida. Saytlarni rus va o‘zbek tillarida yaratamiz. Dastlabki baholash bepul.

Vazifangizni yozing, birinchi versiya tarkibini taklif qilamiz:
https://razrabotkatashkent.uz/uz/contact?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=who-answers`
  },
  {
    id: 'project-lessons',
    publishAt: '2026-12-18T10:00:00+05:00',
    approved: false,
    ru: `Четыре вывода из наших проектов 2026 года

Это реальные проекты из раздела кейсов. Цены клиентов мы не раскрываем, но выводы пригодятся, когда вы будете планировать свой бюджет и срок.

1. Закладывайте время на согласование текстов. Корпоративный сайт Total Asset Silk Road занял около двух месяцев, с 13 мая по 15 июля 2026 года: компания сама редактирует контент в Directus, правки шли несколькими раундами. Итоговые тексты сверили с реестром правок клиента из 37 пунктов.

2. Интеграция с системой, которой вы уже пользуетесь, часто удобнее новой. Барбершоп M19 вёл запись в Altegio, поэтому мы встроили виджет Altegio в сайт, а не писали свою запись.

3. Большой проект можно разделить между командами, если заранее договориться об API. Для портала O‘zbekiston Bolalar Tashkiloti мы сделали публичную часть на трёх языках, а бэкенд и админ-панель разрабатывал другой подрядчик.

4. Веб-сервис не покупают один раз, его развивают этапами. CRM для судебной работы по кредитам мы делаем с 6 июля 2026 года, на ноябрь в проекте 332 автотеста бэкенда и 77 тестов фронтенда.

Если у вас похожая задача, опишите её, оценка бесплатная:
https://razrabotkatashkent.uz/contact?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=project-lessons`,
    uz: `2026-yilgi loyihalarimizdan to‘rtta xulosa

Bular keyslar bo‘limidagi haqiqiy loyihalar. Mijozlar narxini oshkor qilmaymiz, lekin xulosalar budjet va muddatni rejalashtirishda foydali bo‘ladi.

1. Matnlarni kelishish uchun vaqt ajrating. Total Asset Silk Road korporativ sayti taxminan ikki oy, 2026-yil 13-maydan 15-iyulgacha davom etdi: kompaniya kontentni Directus’da o‘zi tahrirlaydi, tahrirlar bir necha raundda o‘tdi. Yakuniy matnlarni mijozning 37 banddan iborat tahrirlar ro‘yxati bilan solishtirdik.

2. Allaqachon foydalanayotgan tizimingiz bilan integratsiya ko‘pincha yangisidan qulayroq. M19 barbershopi yozuvni Altegio’da yuritardi, shuning uchun o‘z yozilish tizimimizni yozmasdan, Altegio vidjetini saytga o‘rnatdik.

3. API haqida oldindan kelishilsa, katta loyihani jamoalar o‘rtasida bo‘lish mumkin. O‘zbekiston Bolalar Tashkiloti portali uchun uch tilli ommaviy qismni biz yaratdik, backend va admin panelni boshqa pudratchi ishlab chiqdi.

4. Veb-xizmat bir marta sotib olinmaydi, u bosqichma-bosqich rivojlantiriladi. Kreditlar bo‘yicha sud ishlari uchun CRM’ni 2026-yil 6-iyuldan beri yaratyapmiz, noyabr holatiga loyihada 332 ta backend va 77 ta frontend avtotesti bor.

Sizda ham shunga o‘xshash vazifa bo‘lsa, yozing, baholash bepul:
https://razrabotkatashkent.uz/uz/contact?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=project-lessons`
  },
  {
    id: 'seo-before-launch',
    publishAt: '2026-12-21T10:00:00+05:00',
    approved: false,
    ru: `SEO до запуска сайта: что проверить и каких обещаний не покупать

SEO начинается не с ключевых слов, а с вопросов будущего клиента. Что подготовить до запуска.

1. Страница под каждую услугу. На странице один главный вопрос клиента и понятный следующий шаг: заявка, звонок, калькулятор. Не пытайтесь уместить все услуги в один текст.
2. Содержание, которому можно доверять: конкретный состав работ, ограничения, актуальные контакты. Без вымышленных отзывов, клиентов и цифр.
3. Обе языковые версии целиком: описания услуг, формы, ошибки и подтверждения на русском и узбекском, с отдельными адресами.
4. Техническая готовность. Важные страницы открываются, ссылки и форма работают, забытых заглушек нет. Служебные и тестовые адреса закрыты от поиска.
5. Кто и когда открывает сайт для поиска. Это отдельное решение владельца сайта, а не галочка, которую разработчик снимает по умолчанию.

Каких обещаний не покупать: первое место в Google к определённой дате и гарантированное попадание в ответы ИИ. Такое пообещать нельзя, и мы не обещаем.

Мы закладываем HTML, который читают поисковые роботы, метаданные и структуру страниц. Позиции зависят ещё и от контента, конкуренции и продвижения.

Состав работ и цены по SEO-настройке (+2 – 4 млн сум, около недели) есть в прайсе:
https://razrabotkatashkent.uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=seo-before-launch`,
    uz: `Saytni ishga tushirishdan oldin SEO: nimani tekshirish va qanday va’dalarga pul to‘lamaslik kerak

SEO kalit so‘zlardan emas, bo‘lajak mijozning savollaridan boshlanadi. Ishga tushirishdan oldin nimalarni tayyorlash kerak.

1. Har bir xizmat uchun sahifa. Har bir sahifada mijozning bitta asosiy savoli va tushunarli keyingi qadam: murojaat, qo‘ng‘iroq, kalkulyator. Barcha xizmatlarni bitta matnga sig‘dirmang.
2. Ishonsa bo‘ladigan kontent: aniq ishlar tarkibi, cheklovlar, dolzarb kontaktlar. To‘qib chiqarilgan sharhlar, mijozlar va raqamlarsiz.
3. Ikkala til to‘liq: xizmatlar tavsifi, shakllar, xato va tasdiqlar rus va o‘zbek tillarida, alohida manzillar bilan.
4. Texnik tayyorgarlik. Muhim sahifalar ochiladi, havolalar va shakl ishlaydi, unutilgan vaqtinchalik sahifalar yo‘q. Xizmat va sinov manzillari qidiruvdan yopiq.
5. Saytni qidiruv uchun kim va qachon ochadi. Bu dasturchi o‘z-o‘zidan olib tashlaydigan belgi emas, sayt egasining alohida qarori.

Qanday va’dalarga pul to‘lamaslik kerak: belgilangan sanagacha Google’da birinchi o‘rin va sun’iy intellekt javoblariga kafolatli tushish. Buni va’da qilib bo‘lmaydi, biz ham va’da qilmaymiz.

Biz qidiruv robotlari o‘qiydigan HTML, metama’lumotlar va sahifalar tuzilmasini tayyorlaymiz. O‘rinlar kontent, raqobat va reklamaga ham bog‘liq.

SEO sozlash tarkibi va narxi (+2 – 4 mln so‘m, taxminan bir hafta) narxlar sahifasida:
https://razrabotkatashkent.uz/uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=seo-before-launch`
  }
];
