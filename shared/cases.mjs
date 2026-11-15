// Кейсы — только реальные проекты с разрешения клиента. Если список пуст, раздел скрыт:
// страницы /cases отдают 404, ссылок в меню и sitemap нет.
// В текстах — только проверяемые факты: без придуманных цифр, отзывов и названий клиентов под NDA.
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
export const caseList = [
  {
    slug: 'leadvex',
    service: 'apps',
    year: 2026,
    stack: ['Vue 3', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'Python', 'PostgreSQL'],
    links: [{ url: 'https://www.leadvexai.com/' }],
    cover: { src: '/cases/leadvex.webp', width: 1600, height: 1100 },
    ru: {
      title: 'CRM-система для автодилеров ОАЭ',
      client: 'Собственный продукт ООО «LEADVEX AI»: SaaS для автосалонов ОАЭ',
      summary:
        'Рабочее пространство для отдела продаж автосалона: переписка из WhatsApp, Messenger и Instagram, лиды, склад автомобилей и тест-драйвы. Интерфейс на английском и арабском.',
      task: 'Автосалоны в ОАЭ получают заявки в WhatsApp, Messenger и Instagram, а данные о клиенте, интересующей его машине и записи на тест-драйв хранятся в разных местах. Нужен был облачный сервис, в котором продавец ведёт заявку от первого сообщения до визита в салон. Каждый салон работает в своём изолированном аккаунте, а интерфейс должен поддерживать арабский язык с письмом справа налево.',
      solution: [
        'Общий входящий: переписка из подключённых аккаунтов WhatsApp, Messenger и Instagram в одном списке, назначение ответственного и перехват диалога.',
        'CRM лидов: ответственный, бюджет, интересующая машина, заметки, теги и статус сделки вплоть до «выиграна» или «проиграна».',
        'Склад автомобилей по салонам: характеристики, цена, фото, статус и выгрузка в CSV.',
        'Запись на тест-драйв прямо из диалога: редактор слотов, проверка пересечений, перенос записи.',
        'Роли продавца, менеджера и владельца, приглашения по email, журнал действий.',
        'Интерфейс на английском и арабском с раскладкой справа налево и выбором языка для каждого пользователя.',
        'Отдельная консоль для команды Leadvex: подключение салонов, тарифы и подписки.',
        'Токены каналов шифруются перед сохранением, запросы и выгрузки ограничены данными одного салона.',
        'Сайт продукта на английском, арабском и русском: тарифы и заявка на демо через WhatsApp.'
      ],
      results: [
        'Продукт запущен: сайт leadvexai.com и рабочее приложение app.leadvexai.com.',
        'С июля 2026 года сделаны бэкенд, два фронтенд-приложения (для салонов и для администраторов платформы) и сайт.',
        'Арабская версия интерфейса работает полностью, с письмом справа налево.',
        'Следующий этап: ИИ-ассистент, который отвечает по складу салона и записывает на тест-драйв. На сайте он честно помечен как «в разработке».'
      ]
    },
    uz: {
      title: 'BAA avtodilerlari uchun CRM tizimi',
      client: '«LEADVEX AI» MChJning o‘z mahsuloti: BAA avtosalonlari uchun SaaS',
      summary:
        'Avtosalon savdo bo‘limi uchun ish maydoni: WhatsApp, Messenger va Instagram yozishmalari, lidlar, avtomobillar ombori va test-drayvlar. Interfeys ingliz va arab tillarida.',
      task: 'BAA avtosalonlari murojaatlarni WhatsApp, Messenger va Instagram orqali oladi, mijoz, u qiziqqan avtomobil va test-drayv yozuvi haqidagi ma’lumotlar esa turli joylarda saqlanadi. Sotuvchi murojaatni birinchi xabardan salonga tashrifgacha olib boradigan bulutli xizmat kerak edi. Har bir salon o‘zining alohida akkauntida ishlaydi, interfeys esa arab tilini o‘ngdan chapga yozuv bilan qo‘llab-quvvatlashi kerak edi.',
      solution: [
        'Umumiy kiruvchi xabarlar: ulangan WhatsApp, Messenger va Instagram akkauntlaridagi yozishmalar bitta ro‘yxatda, mas’ul tayinlash va dialogni o‘z qo‘liga olish.',
        'Lidlar uchun CRM: mas’ul, byudjet, qiziqqan avtomobil, izohlar, teglar va «yutildi» yoki «yutqazildi»gacha bo‘lgan bitim holati.',
        'Salonlar bo‘yicha avtomobillar ombori: xususiyatlar, narx, rasmlar, holat va CSV formatida eksport.',
        'Test-drayvga to‘g‘ridan-to‘g‘ri dialogdan yozish: vaqt oraliqlari muharriri, to‘qnashuvlarni tekshirish, yozuvni ko‘chirish.',
        'Sotuvchi, menejer va salon egasi uchun rollar, email orqali taklifnomalar, amallar jurnali.',
        'Ingliz va arab tilidagi interfeys: o‘ngdan chapga joylashuv va har bir foydalanuvchi uchun til tanlash.',
        'Leadvex jamoasi uchun alohida konsol: salonlarni ulash, tariflar va obunalar.',
        'Kanal tokenlari saqlashdan oldin shifrlanadi, so‘rovlar va eksportlar bitta salon ma’lumotlari bilan cheklangan.',
        'Ingliz, arab va rus tillaridagi mahsulot sayti: tariflar va WhatsApp orqali demo so‘rovi.'
      ],
      results: [
        'Mahsulot ishga tushirilgan: leadvexai.com sayti va app.leadvexai.com ilovasi.',
        '2026-yil iyulidan beri backend, ikkita frontend ilova (salonlar va platforma administratorlari uchun) va sayt tayyorlandi.',
        'Arabcha interfeys o‘ngdan chapga yozuv bilan to‘liq ishlaydi.',
        'Keyingi bosqich: salon ombori asosida javob beradigan va test-drayvga yozadigan sun’iy intellekt yordamchisi. Saytda u ochiq «ishlab chiqilmoqda» deb belgilangan.'
      ]
    }
  },
  {
    slug: 'total-asset',
    service: 'web',
    year: 2026,
    stack: ['Nuxt 3', 'TypeScript', 'Tailwind CSS', 'Directus', 'PostgreSQL', 'Cloudflare R2'],
    links: [{ url: 'https://total-asset.uz/' }],
    cover: { src: '/cases/total-asset.webp', width: 1600, height: 1100 },
    ru: {
      title: 'Корпоративный сайт для консалтинговой компании',
      client: 'Total Asset Silk Road, консалтинговая компания, Ташкент',
      summary:
        'Двуязычный сайт с системой управления контентом: компания сама меняет тексты, услуги, команду, проекты и аналитику без программиста.',
      task: 'Total Asset Silk Road сопровождает международных инвесторов и корпоративных клиентов в Узбекистане. Компании нужен был сайт на английском и русском, который объясняет пять направлений работы, представляет команду и проекты и принимает заявки. Тексты компания готовила сама по техническому заданию и правила их по ходу проекта, поэтому важно было, чтобы любой текст можно было изменить без разработчика.',
      solution: [
        'Сайт на Nuxt 3 с серверным рендерингом: главная, о компании, услуги, команда с личными страницами, проекты, аналитика, контакты и правовые страницы.',
        'Английская и русская версии с отдельными адресами и разметкой hreflang.',
        'Directus в роли CMS: тексты, услуги, сотрудники, проекты и новости редактируются в админ-панели, включая тексты, которые раньше были зашиты в код.',
        'Роли редактора и проверяющего: редактор меняет контент, а статус публикации меняет только проверяющий.',
        'Форма заявки: обращения сохраняются в CMS со статусом «Новая» или «Обработана».',
        'SEO: мета-теги, Open Graph, JSON-LD, sitemap с hreflang, robots.txt.',
        'Безопасность: заголовки CSP и HSTS через nuxt-security.',
        'Инфраструктура: сайт на Vercel, CMS и PostgreSQL на Railway, медиафайлы в Cloudflare R2. Схема базы хранится в репозитории и применяется при деплое.'
      ],
      results: [
        'Сайт запущен на total-asset.uz на английском и русском языках.',
        'Работа заняла около двух месяцев: с 13 мая по 15 июля 2026 года, включая несколько раундов правок по замечаниям клиента.',
        'Компания сама редактирует контент в Directus, изменения появляются на сайте сразу.',
        'Тексты сверены с реестром правок клиента из 37 пунктов автоматической проверкой живого сайта.'
      ]
    },
    uz: {
      title: 'Konsalting kompaniyasi uchun korporativ sayt',
      client: 'Total Asset Silk Road, konsalting kompaniyasi, Toshkent',
      summary:
        'Kontentni boshqarish tizimiga ega ikki tilli sayt: kompaniya matnlar, xizmatlar, jamoa, loyihalar va tahliliy materiallarni dasturchisiz o‘zi o‘zgartiradi.',
      task: 'Total Asset Silk Road O‘zbekistonda xalqaro investorlar va korporativ mijozlarni qo‘llab-quvvatlaydi. Kompaniyaga besh ish yo‘nalishini tushuntiradigan, jamoa va loyihalarni tanishtiradigan va murojaatlarni qabul qiladigan ingliz va rus tillaridagi sayt kerak edi. Matnlarni kompaniya texnik topshiriq bo‘yicha o‘zi tayyorladi va loyiha davomida tahrir qildi, shuning uchun har qanday matnni dasturchisiz o‘zgartirish imkoni muhim edi.',
      solution: [
        'Server renderli Nuxt 3 sayti: bosh sahifa, kompaniya haqida, xizmatlar, shaxsiy sahifali jamoa, loyihalar, tahlil, kontaktlar va huquqiy sahifalar.',
        'Alohida manzilli inglizcha va ruscha versiyalar, hreflang belgilari.',
        'CMS sifatida Directus: matnlar, xizmatlar, xodimlar, loyihalar va yangiliklar admin panelda tahrirlanadi, avval kodga yozilgan matnlar ham.',
        'Muharrir va tekshiruvchi rollari: muharrir kontentni o‘zgartiradi, nashr holatini esa faqat tekshiruvchi o‘zgartiradi.',
        'Murojaat shakli: arizalar CMS ichida «Yangi» yoki «Ko‘rib chiqilgan» holati bilan saqlanadi.',
        'SEO: meta-teglar, Open Graph, JSON-LD, hreflang bilan sitemap, robots.txt.',
        'Xavfsizlik: nuxt-security orqali CSP va HSTS sarlavhalari.',
        'Infratuzilma: sayt Vercel’da, CMS va PostgreSQL Railway’da, media fayllar Cloudflare R2’da. Ma’lumotlar bazasi sxemasi repozitoriyda saqlanadi va deploy paytida qo‘llanadi.'
      ],
      results: [
        'Sayt total-asset.uz manzilida ingliz va rus tillarida ishga tushirilgan.',
        'Ish taxminan ikki oy davom etdi: 2026-yil 13-maydan 15-iyulgacha, mijoz izohlari bo‘yicha bir necha tahrir bosqichi bilan.',
        'Kompaniya kontentni Directus’da o‘zi tahrirlaydi, o‘zgarishlar saytda darhol ko‘rinadi.',
        'Matnlar mijozning 37 banddan iborat tahrirlar ro‘yxati bilan jonli saytni avtomatik tekshirish orqali solishtirilgan.'
      ]
    }
  },
  {
    slug: 'm19',
    service: 'web',
    year: 2026,
    stack: ['Vue 3', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Supabase', 'Vercel'],
    links: [{ url: 'https://www.m19.uz/' }],
    cover: { src: '/cases/m19.webp', width: 1600, height: 1100 },
    ru: {
      title: 'Сайт барбершопа с онлайн-записью и магазином косметики',
      client: 'M19 Barbershop, барбершоп в центре Ташкента',
      summary:
        'Сайт с ценами на услуги, онлайн-записью через Altegio, галереей работ и магазином косметики. Товары, галерею и заказы барбершоп ведёт сам в админ-панели.',
      task: 'Барбершоп ведёт запись клиентов в Altegio. Нужен был собственный сайт, где клиент видит услуги с ценами и длительностью, знакомится с мастерами и записывается онлайн, не уходя с сайта. Кроме услуг барбершоп продаёт косметику, и её тоже нужно было продавать через сайт.',
      solution: [
        'Главная страница: услуги с ценой и длительностью, карточки мастеров и скидка 20% на первый визит.',
        'Онлайн-запись: виджет Altegio встроен в сайт, свободное время и мастера берутся из системы, в которой барбершоп уже работает.',
        'Магазин косметики: каталог с категориями, корзина и оформление заказа по имени и телефону.',
        'Галерея работ с фото и видео по категориям.',
        'Админ-панель: товары и категории, загрузка фото и видео в галерею, заказы со статусами «новый», «в обработке», «выполнен», «отменён».',
        'Бэкенд на serverless-функциях Vercel с базой Supabase: заказы, товары, галерея, проверка входящих данных.',
        'Анимации на GSAP, адаптивная вёрстка под телефон, подключена Яндекс Метрика.'
      ],
      results: [
        'Сайт работает на m19.uz.',
        'Записи попадают сразу в Altegio, где барбершоп ведёт расписание, поэтому вести запись в двух местах не нужно.',
        'Барбершоп сам добавляет товары, меняет цены, загружает работы в галерею и обрабатывает заказы, без разработчика.',
        'Разработка заняла два месяца: с января по март 2026 года.'
      ]
    },
    uz: {
      title: 'Onlayn yozilish va kosmetika do‘koni bor barbershop sayti',
      client: 'M19 Barbershop, Toshkent markazidagi barbershop',
      summary:
        'Xizmatlar narxlari, Altegio orqali onlayn yozilish, ishlar galereyasi va kosmetika do‘koni bor sayt. Mahsulotlar, galereya va buyurtmalarni barbershop admin panelda o‘zi boshqaradi.',
      task: 'Barbershop mijozlar yozuvini Altegio’da yuritadi. Mijoz xizmatlarni narxi va davomiyligi bilan ko‘radigan, ustalar bilan tanishadigan va saytdan chiqmasdan onlayn yoziladigan o‘z sayti kerak edi. Barbershop xizmatlardan tashqari kosmetika ham sotadi, uni ham sayt orqali sotish kerak edi.',
      solution: [
        'Bosh sahifa: narxi va davomiyligi ko‘rsatilgan xizmatlar, ustalar kartochkalari va birinchi tashrifga 20% chegirma.',
        'Onlayn yozilish: Altegio vidjeti saytga o‘rnatilgan, bo‘sh vaqt va ustalar barbershop allaqachon ishlayotgan tizimdan olinadi.',
        'Kosmetika do‘koni: toifalarga bo‘lingan katalog, savat va ism hamda telefon raqami bilan buyurtma berish.',
        'Toifalar bo‘yicha foto va video ishlar galereyasi.',
        'Admin panel: mahsulotlar va toifalar, galereyaga foto va video yuklash, «yangi», «jarayonda», «bajarildi», «bekor qilindi» holatlari bilan buyurtmalar.',
        'Vercel serverless funksiyalaridagi backend va Supabase bazasi: buyurtmalar, mahsulotlar, galereya, kiruvchi ma’lumotlarni tekshirish.',
        'GSAP animatsiyalari, telefonga moslashgan sahifalar, Yandex Metrika ulangan.'
      ],
      results: [
        'Sayt m19.uz manzilida ishlaydi.',
        'Yozuvlar to‘g‘ridan-to‘g‘ri barbershop jadval yuritadigan Altegio’ga tushadi, shuning uchun yozuvni ikki joyda yuritish shart emas.',
        'Barbershop mahsulot qo‘shadi, narxlarni o‘zgartiradi, galereyaga ishlarni yuklaydi va buyurtmalarni dasturchisiz o‘zi qayta ishlaydi.',
        'Ishlab chiqish ikki oy davom etdi: 2026-yil yanvaridan martigacha.'
      ]
    }
  },
  {
    slug: 'bolalar-tashkiloti',
    service: 'web',
    year: 2026,
    stack: ['Nuxt', 'Vue 3', 'Nuxt i18n', 'REST API'],
    links: [{ url: 'https://bolalartashkiloti.uz/' }],
    cover: { src: '/cases/bolalar-tashkiloti.webp', width: 1600, height: 1100 },
    ru: {
      title: 'Портал детской общественной организации на трёх языках',
      client: 'O‘zbekiston Bolalar Tashkiloti, детская организация Узбекистана',
      summary:
        'Многоязычный портал: проекты, новости, медиаматериалы, деятельность в 14 регионах и вход для участников.',
      task: 'Организация работает во всех регионах Узбекистана. Ей нужен был открытый портал, который рассказывает о деятельности и проектах, публикует новости и медиаматериалы, принимает обращения и даёт участникам вход на сайт. Портал должен работать на узбекском, русском и английском.',
      solution: [
        'Публичная часть на Nuxt с серверным рендерингом: главная, деятельность, проекты, новости, медиаматериалы, контакты.',
        'Три языка: узбекский, русский и английский, у каждой версии свой адрес.',
        'Блок деятельности по 14 регионам: 12 областей, город Ташкент и Республика Каракалпакстан.',
        'Каталог проектов и лента новостей с датами.',
        'Раздел частых вопросов и форма обращения с выбором региона, телефоном и типом пользователя.',
        'Вход для участников организации.',
        'Сайт подключён к API организации: бэкенд и админ-панель разрабатывал другой подрядчик, мы сделали публичную часть. Новости и проекты публикуются без правки кода.'
      ],
      results: [
        'Портал работает на bolalartashkiloti.uz на трёх языках.',
        'Новости и проекты публикуются через админ-панель, сайт обновляется без участия разработчика.',
        'Страницы на всех трёх языках отдаются с сервера готовым HTML, поисковики видят текст без выполнения JavaScript.'
      ]
    },
    uz: {
      title: 'Bolalar jamoat tashkiloti uchun uch tilli portal',
      client: 'O‘zbekiston Bolalar Tashkiloti',
      summary:
        'Ko‘p tilli portal: loyihalar, yangiliklar, media materiallar, 14 hududdagi faoliyat va a’zolar uchun kirish.',
      task: 'Tashkilot O‘zbekistonning barcha hududlarida faoliyat yuritadi. Unga faoliyat va loyihalar haqida so‘zlab beradigan, yangiliklar va media materiallarni e’lon qiladigan, murojaatlarni qabul qiladigan va a’zolarga saytga kirish imkonini beradigan ochiq portal kerak edi. Portal o‘zbek, rus va ingliz tillarida ishlashi kerak edi.',
      solution: [
        'Server renderli Nuxt ochiq qismi: bosh sahifa, faoliyat, loyihalar, yangiliklar, media materiallar, kontaktlar.',
        'Uch til: o‘zbek, rus va ingliz, har bir versiyaning o‘z manzili bor.',
        '14 hudud bo‘yicha faoliyat bloki: 12 viloyat, Toshkent shahri va Qoraqalpog‘iston Respublikasi.',
        'Loyihalar katalogi va sanalari ko‘rsatilgan yangiliklar lentasi.',
        'Ko‘p beriladigan savollar bo‘limi va hudud, telefon raqami hamda foydalanuvchi turini ko‘rsatiladigan murojaat shakli.',
        'Tashkilot a’zolari uchun kirish.',
        'Sayt tashkilot API’siga ulangan: backend va admin panelni boshqa pudratchi ishlab chiqqan, biz ommaviy qismni tayyorladik. Yangiliklar va loyihalar kodni o‘zgartirmasdan e’lon qilinadi.'
      ],
      results: [
        'Portal bolalartashkiloti.uz manzilida uch tilda ishlaydi.',
        'Yangiliklar va loyihalar admin panel orqali e’lon qilinadi, sayt dasturchi ishtirokisiz yangilanadi.',
        'Uchala tildagi sahifalar serverdan tayyor HTML ko‘rinishida beriladi, qidiruv tizimlari matnni JavaScript’siz ko‘radi.'
      ]
    }
  },
  {
    slug: 'legat',
    service: 'apps',
    year: 2026,
    stack: ['Laravel', 'PHP', 'Vue 3', 'Pinia', 'Tailwind CSS', 'PostgreSQL', 'Docker'],
    links: [{ url: 'https://legat.uz/' }],
    cover: { src: '/cases/legat.webp', width: 1600, height: 1100 },
    ru: {
      title: 'CRM для автоматизации судебной работы по кредитам',
      client: 'Компания, продающая товары в рассрочку, Ташкент',
      summary:
        'Веб-система для юристов: от загрузки просроченных кредитов из Excel до претензии через UzPost, квитанции о госпошлине и пакета документов для суда.',
      task: 'Чтобы подать в суд по просроченному договору рассрочки, юристу нужно собрать данные заёмщика и долга, отправить претензию почтой, выждать срок, определить подсудный суд, оплатить госпошлину и подготовить пакет документов. Клиенту нужна была система, которая ведёт реестр кредитов, проводит каждое дело по этим этапам и сама формирует типовые документы.',
      solution: [
        'Импорт кредитов и графиков платежей из Excel, учёт платежей и пересчёт дней просрочки.',
        'Стадии дела: претензия, отправка в суд, передано в суд, принято или не принято судом. Подать в суд можно не раньше чем через 7 дней после претензии.',
        'Претензии по просроченным кредитам формируются каждую ночь и отправляются через API UzPost с подписью E-IMZO, статусы доставки обновляются каждый час.',
        'Определение подсудного суда по адресу регистрации заёмщика.',
        'Квитанции о госпошлине через Billing Sud, по одной и пакетами, с выгрузкой неоплаченных в Excel.',
        'Шесть документов формируются автоматически: претензия, исковое заявление, заявление о вынесении судебного приказа, график платежей, расчёт задолженности и выписка по платежам. Пакет скачивается одним ZIP-архивом в PDF.',
        'Шаблоны документов в DOCX загружаются в систему и меняются без программиста.',
        'Роли администратора, юриста и оператора, журнал действий, ограничение частоты запросов, токены входа с ограниченным сроком.',
        'Тяжёлые операции, например генерация пакетов и массовые квитанции, выполняются в очередях.'
      ],
      results: [
        'Система работает на legat.uz, сотрудники входят по личным учётным записям.',
        'Претензии, квитанции и пакет документов для суда формируются из данных кредита, без ручного набора.',
        'На ноябрь 2026 года: 332 автотеста бэкенда и 77 тестов фронтенда, деплой запускается только после прохождения всех проверок.',
        'Разработка идёт с 6 июля 2026 года, система продолжает развиваться.'
      ]
    },
    uz: {
      title: 'Kreditlar bo‘yicha sud ishlarini avtomatlashtirish uchun CRM',
      client: 'Muddatli to‘lovga tovar sotuvchi kompaniya, Toshkent',
      summary:
        'Yuristlar uchun veb-tizim: muddati o‘tgan kreditlarni Excel’dan yuklashdan UzPost orqali talabnoma, davlat boji kvitansiyasi va sud uchun hujjatlar to‘plamigacha.',
      task: 'Muddati o‘tgan muddatli to‘lov shartnomasi bo‘yicha sudga murojaat qilish uchun yurist qarzdor va qarz ma’lumotlarini yig‘ishi, talabnomani pochta orqali yuborishi, belgilangan muddatni kutishi, sudlovga taalluqli sudni aniqlashi, davlat bojini to‘lashi va hujjatlar to‘plamini tayyorlashi kerak. Mijozga kreditlar reyestrini yuritadigan, har bir ishni shu bosqichlardan o‘tkazadigan va namunaviy hujjatlarni o‘zi tayyorlaydigan tizim kerak edi.',
      solution: [
        'Kreditlar va to‘lov jadvallarini Excel’dan import qilish, to‘lovlarni hisobga olish va muddati o‘tgan kunlarni qayta hisoblash.',
        'Ish bosqichlari: talabnoma, sudga yuborish, sudga topshirildi, sud qabul qildi yoki qabul qilmadi. Sudga talabnomadan kamida 7 kun o‘tgach murojaat qilish mumkin.',
        'Muddati o‘tgan kreditlar bo‘yicha talabnomalar har kecha tayyorlanadi va E-IMZO imzosi bilan UzPost API orqali yuboriladi, yetkazish holatlari har soatda yangilanadi.',
        'Qarzdorning ro‘yxatdan o‘tgan manzili bo‘yicha sudlovga taalluqli sudni aniqlash.',
        'Billing Sud orqali davlat boji kvitansiyalari, bittadan va to‘plam bilan, to‘lanmaganlarini Excel’ga eksport qilish.',
        'Oltita hujjat avtomatik tayyorlanadi: talabnoma, da’vo arizasi, sud buyrug‘i chiqarish to‘g‘risidagi ariza, to‘lovlar jadvali, qarzdorlik hisob-kitobi va to‘lovlar bo‘yicha ko‘chirma. To‘plam PDF ko‘rinishida bitta ZIP arxiv bilan yuklab olinadi.',
        'DOCX hujjat shablonlari tizimga yuklanadi va dasturchisiz almashtiriladi.',
        'Administrator, yurist va operator rollari, amallar jurnali, so‘rovlar chastotasini cheklash, amal qilish muddati cheklangan kirish tokenlari.',
        'Og‘ir amallar, masalan to‘plamlarni yaratish va ommaviy kvitansiyalar, navbatlarda bajariladi.'
      ],
      results: [
        'Tizim legat.uz manzilida ishlaydi, xodimlar shaxsiy hisob orqali kiradi.',
        'Talabnomalar, kvitansiyalar va sud uchun hujjatlar to‘plami kredit ma’lumotlaridan qo‘lda terishsiz tayyorlanadi.',
        '2026-yil noyabr holatiga ko‘ra: backendda 332 ta va frontendda 77 ta avtotest, deploy faqat barcha tekshiruvlardan o‘tgandan keyin ishga tushadi.',
        'Ishlab chiqish 2026-yil 6-iyulda boshlangan, tizim rivojlanishda davom etmoqda.'
      ]
    }
  }
];

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
