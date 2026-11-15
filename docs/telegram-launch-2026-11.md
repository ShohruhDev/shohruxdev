# Telegram: пакет запуска канала (ноябрь 2026)

Готовые тексты для канала Razrabotka Tashkent и шаблоны ответов в чатах. Все цифры взяты из `shared/pricing.mjs`, `shared/cases.mjs`, `app/data/services*.ts`, `shared/brand.mjs` и страницы `/prices`. Если цены на сайте поменяются, сначала обновите посты из этого файла.

Тексты постов лежат в блоках кода: их можно копировать в Telegram как есть. Длинную ссылку с UTM при публикации можно спрятать под текст (выделить слово, Ctrl+K / Cmd+K), метки при этом сохранятся.

## 1. Настройка канала

### Название

Только бренд, без ключевых слов:

1. **Razrabotka Tashkent** (рекомендую: совпадает с сайтом, картами и юрлицом в подписи).
2. **Разработка Ташкент** (кириллический вариант бренда, `brandAlternateName`).
3. **Razrabotka Tashkent | Разработка Ташкент** (если хочется, чтобы канал находился по обоим написаниям).

### @username (не проверял, свободны ли)

1. `@razrabotkatashkent`
2. `@razrabotka_tashkent`
3. `@razrabotkatashkent_uz`

### Аватар

`public/brand/logo-512.png`. Telegram обрежет его в круг, поэтому проверьте, что знак не касается краёв.

### Описание

В Telegram одно поле описания на канал (до 255 символов). Выберите версию по основной аудитории или возьмите двуязычную.

RU (≈170 символов):

```text
Разработка сайтов, веб-сервисов, Telegram-ботов и мобильных приложений для бизнеса в Ташкенте. Цены, сроки, кейсы. ООО «LEADVEX AI». Связь: @shohrux_0626, +998 90 515 55 65
```

UZ (≈170 символов):

```text
Toshkentda biznes uchun sayt, veb-xizmat, Telegram-bot va mobil ilovalar yaratish. Narxlar, muddatlar, keyslar. «LEADVEX AI» MChJ. Aloqa: @shohrux_0626, +998 90 515 55 65
```

RU + UZ в одном поле (≈180 символов):

```text
Сайты, боты и приложения для бизнеса в Ташкенте: цены, сроки, кейсы.
Saytlar, botlar va ilovalar: narxlar, muddatlar, keyslar.
ООО «LEADVEX AI». @shohrux_0626, +998 90 515 55 65
```

### Закреплённый пост

Опубликовать первым и закрепить. RU и UZ отдельными сообщениями, закрепить оба или только RU.

RU:

```text
Razrabotka Tashkent: сайты, веб-сервисы, Telegram-боты и мобильные приложения для бизнеса в Ташкенте и по всему Узбекистану.

О чём этот канал: цены и сроки без «звоните, расскажем», разборы типовых задач, как устроена работа и что мы сделали для клиентов.

Коротко о нас:
• работаем по договору, юрлицо ООО «LEADVEX AI»;
• цену фиксируем до начала разработки;
• вы общаетесь напрямую с разработчиком, без менеджеров-посредников;
• делаем сайты на русском и узбекском.

Цены: лендинг от 3 млн сум, корпоративный сайт от 7 млн сум, Telegram-бот от 8 млн сум, мобильное приложение от 40 млн сум. Все цены и калькулятор на сайте.

Связаться: +998 90 515 55 65, Telegram @shohrux_0626, ежедневно 9:00–20:00.

https://razrabotkatashkent.uz/?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

UZ:

```text
Razrabotka Tashkent: Toshkent va butun O‘zbekiston bizneslari uchun saytlar, veb-xizmatlar, Telegram-botlar va mobil ilovalar.

Kanalda nimalar bo‘ladi: «qo‘ng‘iroq qiling, aytamiz»siz narx va muddatlar, odatiy vazifalar tahlili, ish jarayoni va mijozlar uchun qilgan loyihalarimiz.

Qisqacha biz haqimizda:
• shartnoma asosida ishlaymiz, yuridik shaxs: «LEADVEX AI» MChJ;
• narxni dasturlash boshlanishidan oldin belgilaymiz;
• siz vositachi menejerlarsiz dasturchi bilan bevosita muloqot qilasiz;
• rus va o‘zbek tillarida saytlar yaratamiz.

Narxlar: lending 3 mln so‘mdan, korporativ sayt 7 mln so‘mdan, Telegram-bot 8 mln so‘mdan, mobil ilova 40 mln so‘mdan. Barcha narxlar va kalkulyator saytda.

Aloqa: +998 90 515 55 65, Telegram @shohrux_0626, har kuni 9:00–20:00.

https://razrabotkatashkent.uz/uz?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

## 2. Десять постов

### Как публиковать

- Один канал, два языка: сначала RU, через пару минут UZ, отдельными сообщениями. Если со временем UZ-аудитория окажется заметной, можно вынести её в отдельный канал.
- Посты-кейсы публикуются картинкой с подписью. Подпись к фото без Telegram Premium ограничена 1024 символами, поэтому кейсы написаны короче 1000 символов вместе со ссылкой.
- Обложки: `https://razrabotkatashkent.uz/cases/<slug>.webp` (1600×1100), они же лежат в `public/cases/`. Telegram иногда отправляет WebP как стикер или файл, поэтому перед загрузкой лучше сконвертировать в JPG: `sips -s format jpeg public/cases/m19.webp --out m19.jpg`.
- Эмодзи в постах не используются, это нормально для делового тона.

### Расписание (3 поста в неделю, пн / ср / пт)

Время 10:00 по Ташкенту взято как разумное начальное значение. Через 3–4 недели сверьте со статистикой просмотров и сдвиньте.

| Дата          | Пост                                                   | Ссылка                      |
| ------------- | ------------------------------------------------------ | --------------------------- |
| пн, 16 ноября | Закреплённый пост + №1 «Сколько стоит сайт в Ташкенте» | `/prices`                   |
| ср, 18 ноября | №2 Кейс: Total Asset Silk Road                         | `/cases/total-asset`        |
| пт, 20 ноября | №3 «За сколько делают сайт»                            | `/#calculator`              |
| пн, 23 ноября | №4 Кейс: M19 Barbershop                                | `/cases/m19`                |
| ср, 25 ноября | №5 «Telegram-бот или мобильное приложение»             | `/#calculator`              |
| пт, 27 ноября | №6 Кейс: CRM для судебной работы по кредитам           | `/cases/legat`              |
| пн, 30 ноября | №7 «Что спросить у подрядчика»                         | `/prices`                   |
| ср, 2 декабря | №8 Кейс: портал O‘zbekiston Bolalar Tashkiloti         | `/cases/bolalar-tashkiloti` |
| пт, 4 декабря | №9 «Как мы работаем»                                   | `/contact`                  |
| пн, 7 декабря | №10 Кейс: Leadvex                                      | `/cases/leadvex`            |

Полезные посты чередуются с кейсами: читатель сначала получает цены и сроки, а кейсы подтверждают, что за ними стоят реальные проекты.

---

### №1. Сколько стоит сайт в Ташкенте

Картинка: не нужна (или скриншот таблицы с `/prices`).

RU:

```text
Сколько стоит сайт в Ташкенте: наши цены на 2026 год

Публикуем базовые цены, чтобы бюджет можно было прикинуть до первого звонка.

Лендинг: от 3 млн сум (3 – 6 млн), 1 – 2 недели.
Корпоративный сайт до 7 страниц: от 7 млн сум (7 – 14 млн), 3 – 5 недель.
Сайт-каталог: от 10 млн сум (10 – 18 млн), 4 – 6 недель.
Интернет-магазин: от 15 млн сум (15 – 30 млн), 1,5 – 2,5 месяца.
Telegram-бот или Mini App: от 8 млн сум (8 – 20 млн), 2 – 5 недель.

Что меняет цену:
• вторая языковая версия (RU + UZ): +20%;
• дизайн на готовой основе: −20%, премиум с анимацией: +30%;
• онлайн-оплата Payme, Click или Uzum: +2 – 4 млн сум;
• срочно, на 30% быстрее: +30%.

Отдельно от разработки: домен .uz около 80–100 тыс. сум в год, хостинг 50–300 тыс. сум в месяц.

Это ориентир. Точную сумму называем после короткого обсуждения задачи, бесплатно, и фиксируем её в договоре до начала работ.

Полный прайс с функциями и интеграциями:
https://razrabotkatashkent.uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

UZ:

```text
Toshkentda sayt qancha turadi: 2026-yilgi narxlarimiz

Birinchi qo‘ng‘iroqdan oldin budjetni chamalab olishingiz uchun asosiy narxlarni e’lon qilamiz.

Lending: 3 mln so‘mdan (3 – 6 mln), 1 – 2 hafta.
7 sahifagacha korporativ sayt: 7 mln so‘mdan (7 – 14 mln), 3 – 5 hafta.
Katalog-sayt: 10 mln so‘mdan (10 – 18 mln), 4 – 6 hafta.
Internet-do‘kon: 15 mln so‘mdan (15 – 30 mln), 1.5 – 2.5 oy.
Telegram-bot yoki Mini App: 8 mln so‘mdan (8 – 20 mln), 2 – 5 hafta.

Narxga nima ta’sir qiladi:
• ikkinchi til (RU + UZ): +20%;
• tayyor asosdagi dizayn: −20%, animatsiyali premium dizayn: +30%;
• Payme, Click yoki Uzum orqali onlayn to‘lov: +2 – 4 mln so‘m;
• shoshilinch, 30% tezroq: +30%.

Dasturlashdan tashqari: .uz domeni yiliga taxminan 80–100 ming so‘m, xosting oyiga 50–300 ming so‘m.

Bu taxminiy mo‘ljal. Aniq narxni vazifani qisqa muhokama qilgandan so‘ng bepul aytamiz va uni ish boshlanishidan oldin shartnomada qayd etamiz.

Funksiyalar va integratsiyalar bilan to‘liq narxlar:
https://razrabotkatashkent.uz/uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

---

### №2. Кейс: корпоративный сайт для Total Asset Silk Road

Картинка: `https://razrabotkatashkent.uz/cases/total-asset.webp`

RU:

```text
Кейс: корпоративный сайт для Total Asset Silk Road

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
https://razrabotkatashkent.uz/cases/total-asset?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

UZ:

```text
Keys: Total Asset Silk Road uchun korporativ sayt

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
https://razrabotkatashkent.uz/uz/cases/total-asset?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

---

### №3. За сколько делают сайт

Картинка: не нужна.

RU:

```text
За сколько делают сайт: сроки по типам проектов

Срок зависит не только от разработчика, но и от того, как быстро готовы тексты, фото и решения с вашей стороны. Наши базовые сроки:

Лендинг: 1 – 2 недели.
Корпоративный сайт до 7 страниц: 3 – 5 недель.
Сайт-каталог: 4 – 6 недель.
Интернет-магазин: 1,5 – 2,5 месяца.
Telegram-бот или Mini App: 2 – 5 недель.
Веб-сервис, CRM или мобильное приложение: 2 – 4 месяца.

Что добавляет время:
• вторая языковая версия: +1 неделя, три языка: +1,5 недели;
• каждая страница сверх включённых: +1–2 дня;
• онлайн-оплата или интеграция с CRM: около +1 недели.

Ускорить можно двумя способами: дизайн на готовой основе или срочный режим. Срочно значит на 30% быстрее и на 30% дороже.

Из нашей практики: сайт барбершопа M19 с онлайн-записью и магазином занял два месяца, корпоративный сайт Total Asset Silk Road около двух месяцев вместе с раундами правок.

Прикинуть срок под свой проект можно в калькуляторе:
https://razrabotkatashkent.uz/?utm_source=telegram&utm_medium=social&utm_campaign=channel#calculator
```

UZ:

```text
Sayt qancha vaqtda tayyor bo‘ladi: loyiha turlari bo‘yicha muddatlar

Muddat faqat dasturchiga emas, matnlar, rasmlar va qarorlar sizning tomoningizdan qanchalik tez tayyor bo‘lishiga ham bog‘liq. Bizning asosiy muddatlarimiz:

Lending: 1 – 2 hafta.
7 sahifagacha korporativ sayt: 3 – 5 hafta.
Katalog-sayt: 4 – 6 hafta.
Internet-do‘kon: 1.5 – 2.5 oy.
Telegram-bot yoki Mini App: 2 – 5 hafta.
Veb-xizmat, CRM yoki mobil ilova: 2 – 4 oy.

Muddatni nima uzaytiradi:
• ikkinchi til: +1 hafta, uchta til: +1.5 hafta;
• kiritilganidan ortiq har bir sahifa: +1–2 kun;
• onlayn to‘lov yoki CRM bilan integratsiya: taxminan +1 hafta.

Tezlashtirishning ikki yo‘li bor: tayyor asosdagi dizayn yoki shoshilinch rejim. Shoshilinch rejim 30% tezroq va 30% qimmatroq.

Amaliyotimizdan: onlayn yozilish va do‘konli M19 barbershop sayti ikki oyda, Total Asset Silk Road korporativ sayti tahrirlar bilan birga taxminan ikki oyda tayyor bo‘ldi.

O‘z loyihangiz muddatini kalkulyatorda hisoblang:
https://razrabotkatashkent.uz/uz?utm_source=telegram&utm_medium=social&utm_campaign=channel#calculator
```

---

### №4. Кейс: сайт барбершопа M19 с онлайн-записью и магазином

Картинка: `https://razrabotkatashkent.uz/cases/m19.webp`

RU:

```text
Кейс: сайт барбершопа M19 с онлайн-записью и магазином

M19 Barbershop в центре Ташкента ведёт запись клиентов в Altegio. Нужен был свой сайт: услуги с ценами и длительностью, мастера, онлайн-запись без ухода с сайта. И магазин, потому что кроме услуг барбершоп продаёт косметику.

Что сделали:
• встроили виджет Altegio: свободное время и мастера берутся из системы, где барбершоп уже работает, вести запись в двух местах не нужно;
• магазин косметики: каталог с категориями, корзина, заказ по имени и телефону;
• галерея работ с фото и видео;
• админ-панель: товары, галерея и заказы со статусами;
• адаптивная вёрстка, анимации на GSAP, Яндекс Метрика.

Товары, цены, галерею и заказы барбершоп ведёт сам, без разработчика. Разработка заняла два месяца, с января по март 2026 года. Сайт работает на m19.uz.

Подробнее о проекте:
https://razrabotkatashkent.uz/cases/m19?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

UZ:

```text
Keys: onlayn yozilish va do‘konli M19 barbershop sayti

Toshkent markazidagi M19 Barbershop mijozlar yozuvini Altegio’da yuritadi. O‘z sayti kerak edi: narxi va davomiyligi ko‘rsatilgan xizmatlar, ustalar, saytdan chiqmasdan onlayn yozilish. Yana do‘kon ham, chunki barbershop kosmetika sotadi.

Nima qildik:
• Altegio vidjetini o‘rnatdik: bo‘sh vaqt va ustalar barbershop ishlayotgan tizimdan olinadi, yozuvni ikki joyda yuritish shart emas;
• kosmetika do‘koni: toifali katalog, savat, ism va telefon bilan buyurtma;
• foto va video ishlar galereyasi;
• admin panel: mahsulotlar, galereya va holatli buyurtmalar;
• telefonga moslashgan sahifalar, GSAP animatsiyalari, Yandex Metrika.

Mahsulotlar, narxlar, galereya va buyurtmalarni barbershop dasturchisiz o‘zi boshqaradi. Ishlab chiqish 2026-yil yanvaridan martigacha, ikki oy davom etdi. Sayt m19.uz manzilida ishlaydi.

Batafsil:
https://razrabotkatashkent.uz/uz/cases/m19?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

---

### №5. Telegram-бот или мобильное приложение

Картинка: не нужна.

RU:

```text
Telegram-бот или мобильное приложение: что выбрать

Частая фраза на первой встрече: «Нам нужно приложение». Иногда так и есть, но нередко задачу решает бот или Mini App внутри Telegram, и клиенту не нужно ничего устанавливать.

Telegram-бот или Mini App: от 8 млн сум (8 – 20 млн), 2 – 5 недель. Под один основной сценарий: запись, заказ или каталог.

Мобильное приложение для iOS и Android: от 40 млн сум (40 – 100 млн), 2 – 4 месяца.

Приложение стоит рассматривать, когда:
• клиенты регулярно возвращаются в ваш сервис;
• нужны уведомления и функции устройства;
• сотрудникам нужен удобный рабочий инструмент на каждый день.

Если не уверены, начните с небольшой версии: выберите один законченный сценарий, проверьте его на клиентах и потом решайте, нужен ли следующий шаг. Перед мобильной разработкой мы сравниваем три варианта: одна платформа, кроссплатформенное приложение или адаптивный веб-сервис.

Сравнить стоимость вариантов можно в калькуляторе:
https://razrabotkatashkent.uz/?utm_source=telegram&utm_medium=social&utm_campaign=channel#calculator
```

UZ:

```text
Telegram-bot yoki mobil ilova: qaysi birini tanlash kerak

Ko‘p eshitiladigan gap: «Bizga ilova kerak». Ba’zan shunday, lekin ko‘pincha vazifani bot yoki Telegram ichidagi Mini App hal qiladi, mijoz hech narsa o‘rnatmaydi.

Telegram-bot yoki Mini App: 8 mln so‘mdan (8 – 20 mln), 2 – 5 hafta. Bitta asosiy ssenariy uchun: yozilish, buyurtma yoki katalog.

iOS va Android uchun mobil ilova: 40 mln so‘mdan (40 – 100 mln), 2 – 4 oy.

Ilova haqida o‘ylash kerak, agar:
• mijozlar xizmatingizdan muntazam foydalansa;
• bildirishnomalar va qurilma imkoniyatlari kerak bo‘lsa;
• xodimlarga har kuni ishlatadigan qulay vosita kerak bo‘lsa.

Ikkilansangiz, kichik versiyadan boshlang: bitta tugallangan ssenariyni mijozlarda sinab ko‘ring, keyingi qadamni shundan keyin hal qiling. Mobil ilovadan oldin uch variantni solishtiramiz: bitta platforma, krossplatforma ilova yoki moslashuvchan veb-xizmat.

Variantlar narxini kalkulyatorda solishtiring:
https://razrabotkatashkent.uz/uz?utm_source=telegram&utm_medium=social&utm_campaign=channel#calculator
```

---

### №6. Кейс: CRM для судебной работы по кредитам

Картинка: `https://razrabotkatashkent.uz/cases/legat.webp`. Клиент анонимный: в тексте нет ни названия компании, ни домена.

RU:

```text
Кейс: CRM для судебной работы по просроченным кредитам

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
https://razrabotkatashkent.uz/cases/legat?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

UZ:

```text
Keys: muddati o‘tgan kreditlar bo‘yicha sud ishlari uchun CRM

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
https://razrabotkatashkent.uz/uz/cases/legat?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

---

### №7. Что спросить у подрядчика, прежде чем сравнивать цены

Картинка: не нужна.

RU:

```text
Что спросить у подрядчика, прежде чем сравнивать цены

Два предложения «сайт за 5 млн» могут означать совсем разную работу. Что стоит спросить:

1. Что входит в цену: страницы, дизайн, языки, админ-панель для текстов.
2. Кто пишет тексты. У нас это отдельно: +0,15 – 0,3 млн сум за страницу.
3. Какие нужны интеграции: оплата, CRM, 1С, онлайн-запись. Каждая меняет цену и срок.
4. На кого оформлены домен, хостинг и аккаунты. Лучше на вас: аккаунты разработчика в магазинах приложений мы оформляем на заказчика.
5. Передадут ли после запуска доступы и документацию.
6. Фиксируется ли цена в договоре до начала работ.

И регулярные расходы: домен .uz около 80–100 тыс. сум в год, хостинг 50–300 тыс. сум в месяц, поддержка от 0,5–1,5 млн сум в месяц.

Все цены, функции и надбавки:
https://razrabotkatashkent.uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

UZ:

```text
Narxlarni solishtirishdan oldin pudratchidan nimani so‘rash kerak

«5 mln so‘mga sayt» degan ikki taklif butunlay boshqa-boshqa ishni anglatishi mumkin. Nimani so‘rash kerak:

1. Narxga nima kiradi: sahifalar, dizayn, tillar, matnlar uchun admin panel.
2. Matnlarni kim yozadi. Bizda alohida: sahifasiga +0.15 – 0.3 mln so‘m.
3. Qanday integratsiyalar kerak: to‘lov, CRM, 1C, onlayn yozilish. Har biri narx va muddatni o‘zgartiradi.
4. Domen, xosting va akkauntlar kimning nomiga. Yaxshisi sizning: ilova do‘konlaridagi dasturchi akkauntlarini biz buyurtmachi nomiga ochamiz.
5. Ishga tushirgandan keyin kirish huquqlari va hujjatlar topshiriladimi.
6. Narx ish boshlanishidan oldin shartnomada qayd etiladimi.

Doimiy xarajatlar ham bor: .uz domeni yiliga taxminan 80–100 ming so‘m, xosting oyiga 50–300 ming so‘m, qo‘llab-quvvatlash oyiga 0,5–1,5 mln so‘mdan.

Barcha narxlar, funksiyalar va qo‘shimchalar:
https://razrabotkatashkent.uz/uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

---

### №8. Кейс: портал детской организации на трёх языках

Картинка: `https://razrabotkatashkent.uz/cases/bolalar-tashkiloti.webp`. Важно: наша часть только публичный сайт, бэкенд и админку делал другой подрядчик. Это сказано в тексте прямо.

RU:

```text
Кейс: портал детской организации на трёх языках

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
https://razrabotkatashkent.uz/cases/bolalar-tashkiloti?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

UZ:

```text
Keys: bolalar tashkiloti uchun uch tilli portal

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
https://razrabotkatashkent.uz/uz/cases/bolalar-tashkiloti?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

---

### №9. Как мы работаем: от первого сообщения до запуска

Картинка: не нужна.

RU:

```text
Как мы работаем: от первого сообщения до запуска

Техническое задание не обязательно. Для первого разговора достаточно рассказать о бизнесе, задаче и результате, который вы хотите получить. Если есть примеры, текущий сайт или жёсткий срок, напишите и об этом.

1. Разбираемся в задаче. Что должно измениться для бизнеса и кто будет пользоваться продуктом.
2. Определяем первую версию. Сценарии, структура, состав работ и границы проекта. Называем стоимость и срок, затем фиксируем цену в договоре, до начала разработки.
3. Проектируем и разрабатываем. Сначала интерфейс и ключевой сценарий, потом реализация. Промежуточный результат показываем по ходу и обсуждаем решения с вами.
4. Запускаем. Проверяем работу, передаём доступы и документацию. Поддержку и доработки обсуждаем отдельным этапом.

С вами напрямую общается разработчик, без менеджеров-посредников. Предварительная оценка бесплатная.

Опишите задачу, и мы предложим состав первой версии:
https://razrabotkatashkent.uz/contact?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

UZ:

```text
Qanday ishlaymiz: birinchi xabardan ishga tushirishgacha

Texnik topshiriq shart emas. Birinchi suhbat uchun biznes, vazifa va kutilgan natija haqida aytib berish kifoya. Misollar, hozirgi sayt yoki qat’iy muddat bo‘lsa, ularni ham yozing.

1. Vazifani tushunib olamiz. Biznes uchun nima o‘zgarishi kerak va mahsulotdan kim foydalanadi.
2. Birinchi versiyani belgilaymiz. Ssenariylar, tuzilma, ishlar tarkibi va loyiha chegaralari. Narx va muddatni aytamiz, so‘ng narxni dasturlash boshlanishidan oldin shartnomada qayd etamiz.
3. Loyihalaymiz va yaratamiz. Avval interfeys va asosiy ssenariy, keyin dasturlash. Oraliq natijani ko‘rsatib, yechimlarni siz bilan muhokama qilamiz.
4. Ishga tushiramiz. Ishlashini tekshiramiz, kirish huquqlari va hujjatlarni topshiramiz. Qo‘llab-quvvatlashni alohida bosqich sifatida kelishamiz.

Siz vositachi menejerlarsiz dasturchi bilan bevosita muloqot qilasiz. Dastlabki baholash bepul.

Vazifangizni yozing, birinchi versiya tarkibini taklif qilamiz:
https://razrabotkatashkent.uz/uz/contact?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

---

### №10. Кейс: Leadvex, собственный SaaS для автосалонов ОАЭ

Картинка: `https://razrabotkatashkent.uz/cases/leadvex.webp`. Это собственный продукт, не клиентский проект, и текст говорит об этом прямо.

RU:

```text
Кейс: Leadvex, наш собственный SaaS для автосалонов ОАЭ

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
https://razrabotkatashkent.uz/cases/leadvex?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

UZ:

```text
Keys: Leadvex, BAA avtosalonlari uchun o‘zimizning SaaS

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
https://razrabotkatashkent.uz/uz/cases/leadvex?utm_source=telegram&utm_medium=social&utm_campaign=channel
```

### Что публиковать после десяти постов

Каждую опубликованную статью журнала (`/journal/<slug>`) переделывать в короткий пост RU + UZ со ссылкой `utm_campaign=channel`. Темы из `server/lib/topics.mjs`, которые хорошо ложатся в канал: «Что подготовить перед заказом сайта в Узбекистане», «Каталог или интернет-магазин», «Сайт на русском и узбекском: что продумать до разработки», «Онлайн-запись для бизнеса», «Как принять готовый сайт у разработчика», «Что проверить для SEO перед запуском». Ссылаться только на статьи, которые уже опубликованы.

## 3. Шаблоны ответов в чатах

Перед первым сообщением в любом чате прочитайте его правила. Где реклама запрещена, отвечайте без ссылок или не отвечайте вовсе. Не рассылайте один и тот же текст по нескольким чатам, подстраивайте ответ под вопрос и сначала помогите по существу. Если упоминаете свои цены, честно скажите, что это ваши цены.

Ссылки в чатах размечены `utm_campaign=chats`, чтобы отличать их от постов канала.

### 1. «Сколько стоит сайт?»

RU:

```text
Зависит от типа и объёма. Для ориентира наши цены в Ташкенте: лендинг 3 – 6 млн сум, корпоративный сайт до 7 страниц 7 – 14 млн, интернет-магазин 15 – 30 млн.

Сильнее всего цену двигают число страниц, дизайн (на готовой основе или индивидуальный), вторая языковая версия и интеграции вроде оплаты или CRM. Плюс регулярно: домен .uz около 80–100 тыс. сум в год и хостинг 50–300 тыс. в месяц.

Напишите, что за бизнес и что сайт должен делать, подскажу, какой вариант подходит. Посчитать самому можно здесь: https://razrabotkatashkent.uz/?utm_source=telegram&utm_medium=social&utm_campaign=chats#calculator
```

UZ:

```text
Sayt turi va hajmiga bog‘liq. Mo‘ljal uchun Toshkentdagi bizning narxlarimiz: lending 3 – 6 mln so‘m, 7 sahifagacha korporativ sayt 7 – 14 mln, internet-do‘kon 15 – 30 mln.

Narxga eng ko‘p sahifalar soni, dizayn (tayyor asosda yoki individual), ikkinchi til va to‘lov yoki CRM kabi integratsiyalar ta’sir qiladi. Doimiy xarajatlar: .uz domeni yiliga taxminan 80–100 ming so‘m, xosting oyiga 50–300 ming so‘m.

Biznesingiz va sayt nima qilishi kerakligini yozing, qaysi variant mosligini aytaman. O‘zingiz hisoblab ko‘rishingiz mumkin: https://razrabotkatashkent.uz/uz?utm_source=telegram&utm_medium=social&utm_campaign=chats#calculator
```

### 2. «Кто сделает Telegram-бота?»

RU:

```text
Сначала стоит определить сценарий: запись, приём заказов, каталог, уведомления сотрудникам? От этого зависит, хватит ли обычного бота или нужен Mini App с полноценным интерфейсом внутри Telegram. Второй вопрос: куда должны попадать данные (таблица, CRM, 1С).

Мы делаем ботов и Mini App: от 8 млн сум и 2 – 5 недель на один основной сценарий. Если хотите, опишите задачу в личку @shohrux_0626, разберём.
```

UZ:

```text
Avval ssenariyni aniqlash kerak: yozilish, buyurtma qabul qilish, katalog yoki xodimlarga bildirishnoma? Oddiy bot yetadimi yoki Telegram ichida to‘liq interfeysli Mini App kerakmi, shunga bog‘liq. Ikkinchi savol: ma’lumotlar qayerga tushishi kerak (jadval, CRM, 1C).

Biz bot va Mini App yaratamiz: bitta asosiy ssenariy uchun 8 mln so‘mdan, 2 – 5 hafta. Xohlasangiz, vazifani @shohrux_0626 ga shaxsiy xabarda yozing, ko‘rib chiqamiz.
```

### 3. «Лендинг или полноценный сайт?»

RU:

```text
Лендинг подходит, когда у вас одна услуга или акция и одна цель: получить заявку. Многостраничный сайт нужен, если услуг несколько, у каждой свои вопросы и вы хотите, чтобы каждую находили в поиске по своему запросу.

Для ориентира наши цены: лендинг 3 – 6 млн сум, 1 – 2 недели; корпоративный сайт до 7 страниц 7 – 14 млн, 3 – 5 недель. Если сомневаетесь, начните с лендинга, но попросите сразу продумать структуру, чтобы потом не переделывать.
```

UZ:

```text
Bitta xizmat yoki aksiya va bitta maqsad bo‘lsa, ya’ni murojaat olish, lending yetadi. Xizmatlar bir nechta bo‘lsa, har birining o‘z savollari bo‘lsa va har birini qidiruvda alohida topishlarini xohlasangiz, ko‘p sahifali sayt kerak.

Mo‘ljal uchun narxlarimiz: lending 3 – 6 mln so‘m, 1 – 2 hafta; 7 sahifagacha korporativ sayt 7 – 14 mln, 3 – 5 hafta. Ikkilansangiz, lendingdan boshlang, lekin keyin qayta qilmaslik uchun tuzilmani oldindan o‘ylab chiqishni so‘rang.
```

### 4. «Нужен ли свой сервер?»

RU:

```text
Для сайта или бота свой физический сервер почти никогда не нужен, хватает арендованного хостинга или облачного сервера. По деньгам это обычно 50–300 тыс. сум в месяц, зависит от проекта.

Важнее другое: чтобы хостинг, домен и доступы были оформлены на вашу компанию, а не на разработчика, и чтобы делались резервные копии. Если сервис хранит персональные данные клиентов, заранее уточните у юриста требования к месту их хранения.
```

UZ:

```text
Sayt yoki bot uchun o‘z jismoniy serveringiz deyarli hech qachon kerak emas, ijaraga olingan xosting yoki bulutli server yetarli. Bu odatda oyiga 50–300 ming so‘m, loyihaga bog‘liq.

Muhimrog‘i: xosting, domen va kirish huquqlari dasturchi nomiga emas, kompaniyangiz nomiga rasmiylashtirilgan bo‘lsin va zaxira nusxalar olinsin. Agar xizmat mijozlarning shaxsiy ma’lumotlarini saqlasa, ularni saqlash joyiga oid talablarni yurist bilan oldindan aniqlang.
```

### 5. «Нужно приложение или хватит бота / сайта?»

RU:

```text
Приложение оправдано, когда клиенты возвращаются регулярно, нужны пуш-уведомления и функции телефона или это ежедневный инструмент для сотрудников. Если сценарий один (записаться, заказать, посмотреть каталог), часто хватает Telegram-бота или Mini App: клиенту ничего не нужно устанавливать.

Разница в бюджете заметная: у нас бот или Mini App от 8 млн сум, мобильное приложение для iOS и Android от 40 млн. Можно начать с бота, проверить спрос и уже потом решать про приложение.
```

UZ:

```text
Mijozlar muntazam qaytsa, push-bildirishnomalar va telefon imkoniyatlari kerak bo‘lsa yoki bu xodimlar uchun kundalik vosita bo‘lsa, ilova o‘zini oqlaydi. Ssenariy bitta bo‘lsa (yozilish, buyurtma, katalog), ko‘pincha Telegram-bot yoki Mini App yetadi: mijoz hech narsa o‘rnatmaydi.

Budjetdagi farq sezilarli: bizda bot yoki Mini App 8 mln so‘mdan, iOS va Android uchun mobil ilova 40 mln so‘mdan. Botdan boshlab, talabni tekshirib, keyin ilova haqida qaror qilish mumkin.
```

### 6. «За сколько можно сделать сайт?»

RU:

```text
Ориентиры по нашим срокам: лендинг 1 – 2 недели, корпоративный сайт до 7 страниц 3 – 5 недель, интернет-магазин 1,5 – 2,5 месяца. Вторая языковая версия добавляет около недели.

На практике срок чаще растягивают не разработка, а тексты, фото и согласования со стороны заказчика. Если подготовить их заранее, сроки реально выдержать. Если очень срочно, можно сократить срок примерно на 30%, но это дороже.
```

UZ:

```text
Bizning muddatlarimiz bo‘yicha mo‘ljal: lending 1 – 2 hafta, 7 sahifagacha korporativ sayt 3 – 5 hafta, internet-do‘kon 1.5 – 2.5 oy. Ikkinchi til taxminan bir hafta qo‘shadi.

Amalda muddatni ko‘pincha dasturlash emas, buyurtmachi tomonidagi matnlar, rasmlar va kelishuvlar cho‘zadi. Ularni oldindan tayyorlasangiz, muddatga ulgurish oson. Juda shoshilinch bo‘lsa, muddatni taxminan 30% qisqartirish mumkin, lekin bu qimmatroq.
```

### 7. «Нужен ли сайт на двух языках?»

RU:

```text
Если клиенты ищут вас и на русском, и на узбекском, да. Делайте две версии с отдельными адресами (например, /uz/...), а не переключатель, который подменяет текст на одной странице: так поисковики видят и индексируют обе версии.

По бюджету вторая языковая версия у нас добавляет около 20% к стоимости и неделю к сроку. Перевод лучше поручить человеку, который пишет на узбекском, и проверить латиницу: o‘ и g‘ часто набирают неправильно.
```

UZ:

```text
Mijozlar sizni rus tilida ham, o‘zbek tilida ham qidirsa, ha. Bitta sahifada matnni almashtiradigan tugma emas, alohida manzilli ikki versiya qiling (masalan, /uz/...): shunda qidiruv tizimlari ikkala versiyani ko‘radi va indekslaydi.

Budjet bo‘yicha ikkinchi til bizda narxga taxminan 20% va muddatga bir hafta qo‘shadi. Tarjimani o‘zbek tilida yozadigan odamga topshirgan va lotin yozuvini tekshirgan ma’qul: o‘ va g‘ harflari ko‘pincha noto‘g‘ri yoziladi.
```

### 8. «Как подключить Payme / Click к сайту?»

RU:

```text
Сначала нужен договор с платёжной системой (Payme, Click или Uzum) на ваше юрлицо или ИП, после него выдают данные для подключения. Разработчик встраивает оплату в сайт или бота и проверяет сценарии: успешная оплата, отмена, повторная попытка.

У нас подключение онлайн-оплаты стоит +2 – 4 млн сум и добавляет около недели. Совет: подавайте заявку в платёжную систему заранее, параллельно с разработкой, чтобы не ждать её в конце.
```

UZ:

```text
Avval yuridik shaxsingiz yoki YaTT nomiga to‘lov tizimi (Payme, Click yoki Uzum) bilan shartnoma tuziladi, shundan keyin ulanish uchun ma’lumotlar beriladi. Dasturchi to‘lovni sayt yoki botga o‘rnatadi va ssenariylarni tekshiradi: muvaffaqiyatli to‘lov, bekor qilish, qayta urinish.

Bizda onlayn to‘lovni ulash +2 – 4 mln so‘m turadi va taxminan bir hafta qo‘shadi. Maslahat: oxirida kutib qolmaslik uchun to‘lov tizimiga arizani oldindan, dasturlash bilan parallel topshiring.
```

### 9. «Нужно ли ТЗ? Что подготовить перед заказом сайта?»

RU:

```text
ТЗ не обязательно. Для первой оценки хватит такого списка: чем занимается бизнес, что сайт или бот должен делать (принимать заявки, продавать, записывать), на каких языках, есть ли готовые тексты и фото, пара сайтов, которые нравятся, и желаемый срок.

С этим подрядчик уже может назвать вилку цены и срока. Если хотите, пришлите это мне в личку @shohrux_0626, оценка бесплатная.
```

UZ:

```text
Texnik topshiriq shart emas. Dastlabki baholash uchun shu ro‘yxat yetadi: biznes nima bilan shug‘ullanadi, sayt yoki bot nima qilishi kerak (murojaat qabul qilish, sotish, yozib olish), qaysi tillarda, tayyor matn va rasmlar bormi, yoqqan bir-ikkita sayt va kutilgan muddat.

Shu ma’lumot bilan pudratchi narx va muddat oralig‘ini ayta oladi. Xohlasangiz, @shohrux_0626 ga shaxsiy xabarda yuboring, baholash bepul.
```

### 10. «Как выбрать подрядчика и не прогадать?»

RU:

```text
Что стоит проверить до оплаты:
• живые проекты, которые можно открыть и посмотреть самому;
• договор с составом работ и ценой, зафиксированной до старта;
• на кого оформляются домен, хостинг и аккаунты (лучше на вас);
• что передают после запуска: доступы, документацию;
• сколько стоит поддержка и доработки потом.

Если подрядчик не готов ответить на это письменно, это тоже ответ.
```

UZ:

```text
To‘lovdan oldin nimalarni tekshirish kerak:
• ochib, o‘zingiz ko‘ra oladigan ishlayotgan loyihalar;
• ishlar tarkibi va ish boshlanishidan oldin belgilangan narx yozilgan shartnoma;
• domen, xosting va akkauntlar kimning nomiga ochiladi (yaxshisi sizning nomingizga);
• ishga tushirgandan keyin nima topshiriladi: kirish huquqlari, hujjatlar;
• keyingi qo‘llab-quvvatlash va takomillashtirish qancha turadi.

Pudratchi bularga yozma javob berishga tayyor bo‘lmasa, bu ham javob.
```

## 4. Как измерять

1. **UTM-метки.** Все ссылки из канала размечены `utm_source=telegram&utm_medium=social&utm_campaign=channel`, из чатов `utm_campaign=chats`. Чтобы видеть, какой пост сработал, можно добавить `&utm_content=post-01` … `post-10`: Метрика это покажет, а журнал заявок в `/admin` хранит только source, medium и campaign. Свои ссылки собирайте генератором в `/admin` → «Каналы и заявки».
2. **Метрика: трафик.** «Отчёты» → «Источники» → «Метки UTM», фильтр `utm_source = telegram`. Сравнивайте `channel` и `chats` по визитам и времени на сайте. Без UTM переходы из Telegram часто выглядят как прямые заходы, поэтому ссылки без меток не публикуем.
3. **Метрика: цели.** Сайт отправляет четыре цели (`app/composables/useAnalytics.ts`), в GA4 они уходят под своими именами событий:

   | Цель в Метрике   | Когда срабатывает                                        | Событие GA4        |
   | ---------------- | -------------------------------------------------------- | ------------------ |
   | `phone_click`    | клик по номеру телефона (параметр `place`: где на сайте) | `contact_phone`    |
   | `telegram_click` | клик по ссылке на Telegram (параметр `place`)            | `contact_telegram` |
   | `calculator_cta` | кнопка заявки под результатом калькулятора               | `calculator_cta`   |
   | `lead`           | отправка формы на `/contact`                             | `generate_lead`    |

   Проверьте в настройках счётчика, что цели заведены как «JavaScript-событие» с точно такими идентификаторами, и добавьте их в отчёт по меткам UTM.

4. **Заявки с сайта.** В `/admin` → «Каналы и заявки» у каждой заявки видны канал (`social` для Telegram), source, campaign и страница входа. То же самое приходит в уведомлении о новой заявке строкой «Источник». Источник запоминается при первом заходе в рамках сессии браузера: если человек вернулся позже другим путём, метка потеряется.
5. **Обращения напрямую.** Кто пишет в личку @shohrux_0626 из канала или чата, на сайт может не зайти вообще. Ведите простую таблицу: дата, откуда пришёл (пост №, название чата), что нужно, итог. И спрашивайте в разговоре, откуда человек о вас узнал.
6. **Статистика канала.** Просмотры и пересылки по каждому посту смотрите в статистике Telegram (появляется, когда у канала наберётся достаточно подписчиков). Раз в неделю сверяйте: просмотры поста → визиты по UTM → цели → заявки. Через 4 недели решите, какие темы и какое время публикации оставить.
