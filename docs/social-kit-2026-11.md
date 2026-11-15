# Соцсети: пакет запуска (ноябрь 2026)

Instagram, Facebook, LinkedIn и Telegram для Razrabotka Tashkent. Здесь всё, что нужно вставить в профили, порядок создания аккаунтов, первые посты и недельный ритм.

Все цифры взяты из `shared/pricing.mjs`, `shared/cases.mjs`, `app/data/services*.ts` и `shared/brand.mjs`. Отзывов, скидок и метрик, которых нет в этих файлах, в текстах нет. Если цены на сайте поменяются, сначала обновите посты из этого файла и из `docs/telegram-launch-2026-11.md`.

Картинки лежат в `public/social/brand/`. Telegram-канал настраивается по отдельному пакету: [docs/telegram-launch-2026-11.md](telegram-launch-2026-11.md). Здесь он есть только в общем расписании.

Аккаунты, пароли и коды подтверждения владелец создаёт и вводит сам.

## 0. Общие данные для всех сетей

| Поле               | Значение                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Название           | **Razrabotka Tashkent** (как на сайте, в картах и в Telegram)                                          |
| Альтернативное     | Разработка Ташкент                                                                                     |
| Юрлицо             | ООО «LEADVEX AI» / «LEADVEX AI» MChJ / "LEADVEX AI" LLC, ИНН 313 300 268                               |
| Телефон            | +998 90 515 55 65                                                                                      |
| Telegram для связи | https://t.me/shohrux_0626                                                                              |
| Часы               | ежедневно 9:00–20:00                                                                                   |
| Адрес              | **не показываем**: офиса для посетителей нет, как в Google и Яндексе. Только город и зона обслуживания |
| Зона обслуживания  | Ташкент, Ташкентская область, весь Узбекистан                                                          |
| Аватар             | `public/social/brand/avatar-1080.png` (знак на белом, с полями под круглую обрезку)                    |
| Единый @username   | `razrabotkatashkent` везде, где свободен (свободность не проверял)                                     |

UTM для ссылки в профиле: `?utm_source=<instagram|facebook|linkedin>&utm_medium=social&utm_campaign=profile`. Для ссылок в постах: `utm_campaign=posts`. Для кнопки действия на странице дополнительно `&utm_content=cta-button`. Журнал заявок в `/admin` хранит source, medium и campaign, а `utm_content` видно только в Метрике.

Адрес юрлица (г. Ташкент, Алмазарский район, ул. Корасарой, 335) в соцсетях не указываем: в Google и Яндексе он скрыт, и посетители по нему не принимаются. Город «Ташкент» в описании и зона обслуживания этому не противоречат.

## 1. Порядок создания

Сначала Facebook, потом Instagram, LinkedIn в любой момент.

1. **Facebook-страница.** Создаётся из личного профиля Facebook владельца (личный профиль нужен обязательно, на странице он публично не виден).
2. **Meta Business Suite / бизнес-портфолио.** На business.facebook.com создать бизнес-портфолио «Razrabotka Tashkent» и добавить в него страницу. Это пригодится для будущего автопостинга (ветка `feat/social-autopost`): API публикации в Instagram и Facebook работает через приложение Meta, привязанное к портфолио, а токены выдаются администратору страницы.
3. **Instagram, профессиональный аккаунт типа «Бизнес»** (не «Автор»), связанный с Facebook-страницей. Без связи со страницей и бизнес-типа Instagram Graph API публиковать не даст.
4. **LinkedIn, страница компании.** Создаётся только из личного профиля LinkedIn. С пустого или только что созданного профиля LinkedIn может отказать: заполните профиль (имя, фото, должность, место работы Razrabotka Tashkent), добавьте несколько контактов и повторите через пару дней.
5. **Telegram-канал**: по `docs/telegram-launch-2026-11.md`.

После создания всех профилей добавьте их ссылки на сайт (подвал, страница контактов) и в разметку Organization `sameAs`. Это отдельная задача в коде, этот пакет её не делает.

Безопасность: на всех аккаунтах включите двухфакторную аутентификацию через приложение-аутентификатор и сохраните резервные коды. На Facebook-странице и в бизнес-портфолио добавьте второго администратора (доверенный человек), чтобы не потерять доступ.

## 2. Facebook-страница

### Лимиты

| Поле                 | Лимит                                                            |
| -------------------- | ---------------------------------------------------------------- |
| Название страницы    | до 75 символов                                                   |
| Имя пользователя (@) | 5–50 символов: латиница, цифры, точки                            |
| Био (Intro)          | до 101 символа                                                   |
| Категории            | до 3                                                             |
| Обложка              | 1640×624 (показывается как 820×312, на телефоне обрезаются бока) |
| Фото профиля         | от 320×320, круглая обрезка                                      |

### Поля

**Название:** `Razrabotka Tashkent`

**@username** (варианты по порядку):

1. `razrabotkatashkent`
2. `razrabotka.tashkent`
3. `razrabotkatashkent.uz`

**Категории** (выбираются из списка; если формулировки отличаются, берите ближайшие):

1. Компания по разработке ПО (Software Company)
2. Веб-дизайнер (Website Designer)
3. IT-компания (Information Technology Company)

**Био, RU** (96 символов):

```text
Сайты, Telegram-боты и мобильные приложения для бизнеса в Ташкенте. Цена фиксируется в договоре.
```

**Био, UZ** (94 символа), если основная аудитория страницы узбекоязычная:

```text
Toshkent bizneslari uchun sayt, Telegram-bot va mobil ilovalar. Narx shartnomada qayd etiladi.
```

Поле одно, двуязычная версия в 101 символ не помещается. Рекомендую RU: посты на странице тоже на русском.

**Подробное описание.** Если в разделе «Информация» есть поле для подробного описания, вставьте RU-текст из Google-карточки (`docs/business-listings.md`, раздел «Описание»), он одинаковый для всех карточек.

**Веб-сайт:**

```text
https://razrabotkatashkent.uz/?utm_source=facebook&utm_medium=social&utm_campaign=profile
```

Второй ссылкой (поле допускает несколько сайтов): `https://t.me/shohrux_0626`.

**Телефон:** +998 90 515 55 65. **Эл. почта:** см. раздел 8, пункт 2.

**Часы работы:** «Открыто в выбранные часы», каждый день 9:00–20:00.

**Местоположение:** адрес не заполнять. Если Facebook предлагает «Зону обслуживания», укажите Ташкент и Узбекистан. Если есть только поле адреса, укажите город Ташкент без улицы и снимите галочку «Клиенты приходят по этому адресу» (или аналогичную), чтобы не показывалась карта.

**Кнопка действия:** «Связаться с нами» (Contact us) со ссылкой:

```text
https://razrabotkatashkent.uz/contact?utm_source=facebook&utm_medium=social&utm_campaign=profile&utm_content=cta-button
```

Кнопка «Отправить сообщение» (Messenger) тоже возможна, но тогда сообщения в Messenger нужно читать каждый день. Если отвечать будете только в Telegram, выбирайте «Связаться с нами».

**Картинки:** фото профиля `avatar-1080.png`, обложка `facebook-cover-1640x624.jpg`. Текст обложки стоит в центре, поэтому на телефоне он не обрезается, а на компьютере его не закрывает аватар.

### Чек-лист создания (делает владелец)

1. Войти в свой личный Facebook → меню → «Страницы» → «Создать страницу».
2. Название `Razrabotka Tashkent`, категория «Компания по разработке ПО», био из блока выше → «Создать страницу».
3. Шаг «Контакты и часы»: сайт с UTM, телефон, часы 9:00–20:00 каждый день, адрес не заполнять (см. «Местоположение»).
4. Загрузить фото профиля и обложку.
5. Настройки страницы → имя пользователя: `razrabotkatashkent` или следующий вариант.
6. Добавить остальные две категории и кнопку «Связаться с нами».
7. business.facebook.com → создать бизнес-портфолио → «Аккаунты» → «Страницы» → добавить страницу.
8. Включить двухфакторную аутентификацию, добавить второго администратора.
9. Опубликовать первый пост (раздел 6), только после этого приглашать знакомых подписаться.

## 3. Instagram

### Лимиты

| Поле                 | Лимит                                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| Имя (Name)           | до 64 символов; менять можно 2 раза за 14 дней                          |
| Имя пользователя (@) | до 30 символов: латиница, цифры, точки, подчёркивания                   |
| Описание (Bio)       | до 150 символов                                                         |
| Ссылки               | до 5                                                                    |
| Подпись к посту      | до 2200 символов                                                        |
| Хэштеги              | до 30; в конце 2025 года сообщалось о переходе на лимит 5, см. раздел 4 |
| Фото в ленте         | 1080×1350 (4:5); в сетке профиля показывается обрезанным по центру      |

### Поля

**Имя:** `Razrabotka Tashkent` (поле участвует в поиске, но ключевые слова в нём выглядят как спам; оставляем только бренд).

**@username** (варианты по порядку):

1. `razrabotkatashkent`
2. `razrabotka.tashkent`
3. `razrabotka_tashkent`

**Категория** (показывать на профиле: включить): «Компания по разработке ПО» (Software Company). Запасные: «IT-компания», «Веб-дизайнер».

**Описание, RU** (133 символа):

```text
Сайты, Telegram-боты и мобильные приложения для бизнеса в Ташкенте.
Цена фиксируется в договоре до начала работ.
Ежедневно 9:00–20:00
```

**Описание, UZ** (137 символов):

```text
Toshkentda biznes uchun sayt, Telegram-bot va mobil ilovalar.
Narx ish boshlanishidan oldin shartnomada qayd etiladi.
Har kuni 9:00–20:00
```

**Описание, RU + UZ** (137 символов), рекомендую для старта: подписи к постам тоже двуязычные.

```text
Сайты, боты и приложения для бизнеса в Ташкенте
Saytlar, botlar va mobil ilovalar
Цена в договоре до старта · Narx shartnomada
9:00–20:00
```

**Ссылки** (первая показывается в профиле, остальные под «и ещё N»):

1. Сайт: `https://razrabotkatashkent.uz/?utm_source=instagram&utm_medium=social&utm_campaign=profile`, название «Сайт и цены».
2. Telegram для связи: `https://t.me/shohrux_0626`, название «Написать в Telegram».
3. Telegram-канал, когда будет создан: `https://t.me/razrabotkatashkent` (или выбранный @username), название «Telegram-канал».

**Контакты (кнопки на профиле):** телефон +998 90 515 55 65 (кнопка «Позвонить»), эл. почта (см. раздел 8). **Адрес оставить пустым**: Instagram позволяет бизнес-аккаунту не указывать адрес, тогда на профиле нет карты. Город «Ташкент» уже есть в описании. Часы работы Instagram не показывает, они видны на связанной Facebook-странице.

**Кнопки действий** (запись, заказ еды и т. п.) не нужны.

**Аватар:** `avatar-1080.png`.

**Актуальное (Highlights)**, по мере появления сторис: «Цены», «Кейсы», «Как работаем», «Контакты».

### Чек-лист создания (делает владелец)

1. В приложении Instagram: профиль → «Добавить аккаунт» → «Создать новый аккаунт». Почту лучше взять рабочую (раздел 8), а не личную.
2. Имя пользователя `razrabotkatashkent` (или следующий вариант), пароль, код подтверждения из письма или SMS.
3. «Настройки и конфиденциальность» → «Тип аккаунта и инструменты» → «Переключиться на профессиональный аккаунт» → категория «Компания по разработке ПО» → тип **«Бизнес»**.
4. На шаге контактов: телефон и почта, адрес пустой.
5. Связать с Facebook-страницей: «Настройки» → «Центр аккаунтов» (или на шаге «Подключить Facebook» при переключении) → выбрать страницу Razrabotka Tashkent. Проверка: в Meta Business Suite у страницы должен появиться Instagram.
6. «Редактировать профиль»: имя, описание, ссылки, аватар, включить отображение категории.
7. В бизнес-портфолио (business.facebook.com) → «Аккаунты» → «Аккаунты Instagram» → добавить этот аккаунт.
8. Включить двухфакторную аутентификацию.
9. Опубликовать первые три поста (ig-01…ig-03) в день запуска, чтобы профиль не был пустым (раздел 4).

## 4. Instagram: первые 9 постов

### Сетка

Instagram показывает новые посты слева сверху. Если публиковать по порядку 01 → 09, через три недели сетка выглядит так:

| Ряд | Слева                         | В центре                         | Справа                   |
| --- | ----------------------------- | -------------------------------- | ------------------------ |
| 1   | ig-09 Как мы работаем (синий) | ig-08 Кейс Leadvex               | ig-07 Сроки              |
| 2   | ig-06 Кейс CRM для юристов    | ig-05 Бот или приложение (синий) | ig-04 Кейс Total Asset   |
| 3   | ig-03 Цены                    | ig-02 Кейс M19                   | ig-01 Знакомство (синий) |

Синие карточки идут по диагонали, кейсы со скриншотами чередуются с текстовыми карточками. Порядок важен: если пропустить или переставить пост, рисунок сетки сместится. Ключевой текст на всех картинках лежит в центральной зоне 1080×1080, поэтому при обрезке в сетке профиля заголовки не теряются.

Текст на картинках только на русском, подписи RU + UZ. Если узбекоязычная аудитория окажется заметной, картинки можно перевести тем же шаблоном.

### Как публиковать

- Подпись: сначала RU, затем разделитель и UZ. Хэштеги в конце подписи (или первым комментарием, если хотите чистую подпись).
- Ссылки в подписях Instagram не кликаются, поэтому в конце «ссылка в профиле».
- Хэштеги в каждом посте отсортированы по важности. В конце 2025 года Instagram начал ограничивать хэштеги (сообщалось о лимите 5 на пост). Если Instagram не даст опубликовать больше, оставьте первые пять.
- Эмодзи не используем, как и в Telegram.
- Время: 12:00–13:00 по Ташкенту для начала, через 3–4 недели сверить со статистикой.

---

### ig-01. Знакомство

Картинка: `public/social/brand/ig-01.jpg`

```text
Razrabotka Tashkent: сайты, веб-сервисы, Telegram-боты и мобильные приложения для бизнеса в Ташкенте и по всему Узбекистану.

Коротко о нас:
• работаем по договору, юрлицо ООО «LEADVEX AI»;
• цену фиксируем до начала разработки;
• вы общаетесь напрямую с разработчиком, без менеджеров-посредников;
• делаем сайты на русском и узбекском.

Здесь будут цены и сроки, разборы типовых задач и проекты, которые мы сделали.

Связаться: +998 90 515 55 65, Telegram @shohrux_0626, ежедневно 9:00–20:00. Ссылка на сайт в профиле.

—

Razrabotka Tashkent: Toshkent va butun O‘zbekiston bizneslari uchun saytlar, veb-xizmatlar, Telegram-botlar va mobil ilovalar.

Qisqacha biz haqimizda:
• shartnoma asosida ishlaymiz, yuridik shaxs: «LEADVEX AI» MChJ;
• narxni dasturlash boshlanishidan oldin belgilaymiz;
• siz vositachi menejerlarsiz dasturchi bilan bevosita muloqot qilasiz;
• rus va o‘zbek tillarida saytlar yaratamiz.

Aloqa: +998 90 515 55 65, Telegram @shohrux_0626, har kuni 9:00–20:00. Sayt havolasi profilda.

#ташкент #разработкасайтов #saytyaratish #созданиесайтов #телеграмбот #мобильноеприложение #вебстудия #toshkent #узбекистан #uzbekistan #сайтдлябизнеса
```

### ig-02. Кейс: сайт барбершопа M19

Картинка: `public/social/brand/ig-02.jpg`

```text
Кейс: сайт барбершопа M19 с онлайн-записью и магазином

M19 Barbershop в центре Ташкента ведёт запись клиентов в Altegio. Нужен был свой сайт: услуги с ценами и длительностью, мастера, онлайн-запись без ухода с сайта. И магазин, потому что барбершоп продаёт косметику.

Что сделали:
• встроили виджет Altegio: свободное время и мастера берутся из системы, где барбершоп уже работает;
• магазин косметики: каталог, корзина, заказ по имени и телефону;
• галерея работ с фото и видео;
• админ-панель для товаров, галереи и заказов.

Товары, цены и заказы барбершоп ведёт сам, без разработчика. Разработка заняла два месяца. Сайт: m19.uz

—

Keys: onlayn yozilish va do‘konli M19 barbershop sayti

Toshkent markazidagi M19 Barbershop mijozlar yozuvini Altegio’da yuritadi. Narxli xizmatlar, ustalar, saytdan chiqmasdan onlayn yozilish va kosmetika do‘koni kerak edi.

Nima qildik: Altegio vidjeti, toifali katalog va savatli do‘kon, foto va video galereya, mahsulotlar va buyurtmalar uchun admin panel. Ishlab chiqish ikki oy davom etdi. Sayt: m19.uz

Batafsil: profildagi havola.

#разработкасайтов #ташкент #saytyaratish #сайтподключ #онлайнзапись #барбершоп #интернетмагазин #toshkent #вебстудия #uzbekistan
```

### ig-03. Сколько стоит разработка

Картинка: `public/social/brand/ig-03.jpg`

```text
Сколько стоит разработка в Ташкенте: наши цены на 2026 год

Лендинг: от 3 млн сум, 1–2 недели.
Корпоративный сайт до 7 страниц: от 7 млн сум, 3–5 недель.
Сайт-каталог: от 10 млн сум, 4–6 недель.
Интернет-магазин: от 15 млн сум, 6–10 недель.
Telegram-бот или Mini App: от 8 млн сум, 2–5 недель.
Мобильное приложение iOS и Android: от 40 млн сум, 2–4 месяца.

Что меняет цену: вторая языковая версия +20%, онлайн-оплата Payme, Click или Uzum +2–4 млн сум, срочность +30%.

Это ориентир. Точную сумму называем после короткого обсуждения задачи, бесплатно, и фиксируем её в договоре. Полный прайс и калькулятор на сайте, ссылка в профиле.

—

Toshkentda dasturlash qancha turadi: 2026-yilgi narxlarimiz

Lending: 3 mln so‘mdan, 1–2 hafta.
7 sahifagacha korporativ sayt: 7 mln so‘mdan, 3–5 hafta.
Katalog-sayt: 10 mln so‘mdan, 4–6 hafta.
Internet-do‘kon: 15 mln so‘mdan, 6–10 hafta.
Telegram-bot yoki Mini App: 8 mln so‘mdan, 2–5 hafta.
iOS va Android mobil ilova: 40 mln so‘mdan, 2–4 oy.

Aniq narxni vazifani muhokama qilgandan so‘ng bepul aytamiz va shartnomada qayd etamiz. To‘liq narxlar va kalkulyator saytda.

#сколькостоитсайт #разработкасайтов #ташкент #saytyaratish #созданиесайтов #ценанасайт #телеграмбот #мобильноеприложение #toshkent #узбекистан #sayt
```

### ig-04. Кейс: сайт Total Asset Silk Road

Картинка: `public/social/brand/ig-04.jpg`

```text
Кейс: корпоративный сайт для консалтинговой компании

Total Asset Silk Road сопровождает международных инвесторов в Узбекистане. Нужен был сайт на английском и русском: пять направлений работы, команда, проекты и заявки. Тексты компания писала сама и правила по ходу проекта, поэтому главное требование: любой текст меняется без программиста.

Что сделали:
• сайт на Nuxt 3: услуги, команда с личными страницами, проекты, аналитика;
• Directus как CMS: тексты, услуги, сотрудники и проекты правятся в админ-панели;
• роли редактора и проверяющего;
• заявки сохраняются в CMS со статусом.

Работа заняла около двух месяцев вместе с раундами правок. Сайт: total-asset.uz

—

Keys: konsalting kompaniyasi uchun korporativ sayt

Total Asset Silk Road O‘zbekistonda xalqaro investorlarni qo‘llab-quvvatlaydi. Ingliz va rus tillarida sayt kerak edi, har qanday matn dasturchisiz o‘zgarishi kerak edi.

Nima qildik: Nuxt 3 sayti, CMS sifatida Directus, muharrir va tekshiruvchi rollari, murojaatlar CMS ichida holati bilan. Ish tahrirlar bilan birga taxminan ikki oy davom etdi. Sayt: total-asset.uz

#корпоративныйсайт #разработкасайтов #ташкент #saytyaratish #вебразработка #консалтинг #toshkent #uzbekistan #webdevelopment
```

### ig-05. Telegram-бот или мобильное приложение

Картинка: `public/social/brand/ig-05.jpg`

```text
Telegram-бот или мобильное приложение: что выбрать

Частая фраза на первой встрече: «Нам нужно приложение». Иногда так и есть, но нередко задачу решает бот или Mini App внутри Telegram, и клиенту не нужно ничего устанавливать.

Бот или Mini App: от 8 млн сум, 2–5 недель, один основной сценарий: запись, заказ или каталог.
Приложение для iOS и Android: от 40 млн сум, 2–4 месяца.

Приложение стоит рассматривать, когда клиенты регулярно возвращаются, нужны уведомления и функции телефона или сотрудникам нужен рабочий инструмент на каждый день.

Не уверены? Начните с одного законченного сценария, проверьте его на клиентах и потом решайте про следующий шаг. Сравнить варианты можно в калькуляторе на сайте.

—

Telegram-bot yoki mobil ilova: qaysi birini tanlash kerak

Ko‘pincha vazifani bot yoki Telegram ichidagi Mini App hal qiladi, mijoz hech narsa o‘rnatmaydi.

Bot yoki Mini App: 8 mln so‘mdan, 2–5 hafta, bitta asosiy ssenariy.
iOS va Android ilova: 40 mln so‘mdan, 2–4 oy.

Mijozlar muntazam qaytsa, bildirishnomalar va telefon imkoniyatlari kerak bo‘lsa, ilova o‘zini oqlaydi. Ikkilansangiz, bitta ssenariydan boshlang.

#телеграмбот #telegrambot #мобильноеприложение #разработкаприложений #ташкент #miniapp #botyaratish #mobililova #toshkent #узбекистан #uzbekistan
```

### ig-06. Кейс: CRM для судебной работы по кредитам

Картинка: `public/social/brand/ig-06.jpg`. Клиент анонимный: ни названия компании, ни домена в подписи нет.

```text
Кейс: CRM для судебной работы по просроченным кредитам

Клиент: компания из Ташкента, которая продаёт товары в рассрочку. Название не раскрываем.

Чтобы подать в суд по просроченному договору, юристу нужно собрать данные, отправить претензию почтой, выждать срок, определить суд, оплатить госпошлину и подготовить пакет документов. Клиенту нужна была система, которая проводит каждое дело по этим этапам.

Что сделали:
• импорт кредитов из Excel и пересчёт дней просрочки;
• претензии каждую ночь уходят через API UzPost с подписью E-IMZO;
• суд определяется по адресу регистрации заёмщика;
• квитанции о госпошлине через Billing Sud;
• шесть документов для суда собираются автоматически.

Разработка идёт с июля 2026 года. На ноябрь в проекте 332 автотеста бэкенда и 77 тестов фронтенда.

—

Keys: muddati o‘tgan kreditlar bo‘yicha sud ishlari uchun CRM

Mijoz: Toshkentdagi muddatli to‘lovga tovar sotuvchi kompaniya. Nomini oshkor qilmaymiz.

Nima qildik: kreditlarni Excel’dan import qilish, E-IMZO bilan UzPost API orqali talabnomalar, sudni manzil bo‘yicha aniqlash, Billing Sud orqali davlat boji kvitansiyalari, sud uchun oltita hujjat avtomatik. Noyabrda backendda 332 ta, frontendda 77 ta avtotest bor.

#crm #автоматизация #разработкаcrm #ташкент #вебразработка #рассрочка #юристы #toshkent #dasturlash #uzbekistan
```

### ig-07. За сколько делают сайт

Картинка: `public/social/brand/ig-07.jpg`

```text
За сколько делают сайт: наши базовые сроки

Лендинг: 1–2 недели.
Корпоративный сайт до 7 страниц: 3–5 недель.
Сайт-каталог: 4–6 недель.
Интернет-магазин: 6–10 недель.
Telegram-бот или Mini App: 2–5 недель.
Веб-сервис, CRM или мобильное приложение: 2–4 месяца.

Что добавляет время: вторая языковая версия около недели, онлайн-оплата или интеграция с CRM около недели. Срочный режим: на 30% быстрее и на 30% дороже.

Срок зависит и от того, как быстро готовы тексты, фото и решения с вашей стороны. Из практики: сайт барбершопа M19 с записью и магазином занял два месяца.

Прикинуть срок под свой проект: калькулятор на сайте, ссылка в профиле.

—

Sayt qancha vaqtda tayyor bo‘ladi: asosiy muddatlarimiz

Lending: 1–2 hafta.
7 sahifagacha korporativ sayt: 3–5 hafta.
Katalog-sayt: 4–6 hafta.
Internet-do‘kon: 6–10 hafta.
Telegram-bot yoki Mini App: 2–5 hafta.
Veb-xizmat, CRM yoki mobil ilova: 2–4 oy.

Ikkinchi til taxminan bir hafta qo‘shadi. Shoshilinch rejim 30% tezroq va 30% qimmatroq.

#разработкасайтов #сроки #ташкент #saytyaratish #созданиесайтов #сайтподключ #toshkent #вебстудия #uzbekistan
```

### ig-08. Кейс: Leadvex, собственный продукт

Картинка: `public/social/brand/ig-08.jpg`. Это продукт ООО «LEADVEX AI», не заказ клиента: подпись говорит об этом прямо.

```text
Кейс: Leadvex, наш собственный SaaS для автосалонов ОАЭ

Leadvex не заказ клиента, а продукт ООО «LEADVEX AI», юрлица, которое стоит за Razrabotka Tashkent.

Автосалоны в ОАЭ получают заявки в WhatsApp, Messenger и Instagram, а данные о клиенте, машине и тест-драйве хранятся в разных местах. Нужен был облачный сервис, где продавец ведёт заявку от первого сообщения до визита в салон.

Что сделано:
• общий входящий для переписки из трёх каналов;
• CRM лидов и склад автомобилей по салонам;
• запись на тест-драйв прямо из диалога;
• интерфейс на английском и арабском, с письмом справа налево.

С июля 2026 года сделаны бэкенд, два фронтенд-приложения и сайт. Продукт запущен на leadvexai.com. ИИ-ассистент пока в разработке.

—

Keys: Leadvex, BAA avtosalonlari uchun o‘zimizning SaaS

Leadvex mijoz buyurtmasi emas, «LEADVEX AI» MChJning o‘z mahsuloti.

Nima qilindi: uchala kanal yozishmalari bitta ro‘yxatda, lidlar CRM’i, avtomobillar ombori, dialogdan test-drayvga yozish, ingliz va arab tilidagi interfeys. Mahsulot leadvexai.com manzilida ishlaydi.

#saas #crm #разработкаприложений #вебсервис #ташкент #startup #toshkent #uzbekistan #dasturlash
```

### ig-09. Как мы работаем

Картинка: `public/social/brand/ig-09.jpg`

```text
Как мы работаем: от первого сообщения до запуска

Техническое задание не обязательно. Для первого разговора достаточно рассказать о бизнесе, задаче и результате, который вы хотите получить.

1. Разбираемся в задаче: что должно измениться для бизнеса и кто будет пользоваться продуктом.
2. Определяем первую версию: сценарии, структура, состав работ. Называем стоимость и срок, цену фиксируем в договоре до начала разработки.
3. Проектируем и разрабатываем: сначала интерфейс и ключевой сценарий, промежуточный результат показываем по ходу.
4. Запускаем: проверяем работу, передаём доступы и документацию.

Предварительная оценка бесплатная. Напишите в Telegram @shohrux_0626 или позвоните: +998 90 515 55 65.

—

Qanday ishlaymiz: birinchi xabardan ishga tushirishgacha

Texnik topshiriq shart emas. Birinchi suhbat uchun biznes, vazifa va kutilgan natija haqida aytib berish kifoya.

1. Vazifani tushunib olamiz.
2. Birinchi versiyani belgilaymiz, narxni dasturlashdan oldin shartnomada qayd etamiz.
3. Loyihalaymiz va yaratamiz, oraliq natijani ko‘rsatamiz.
4. Ishga tushiramiz, kirish huquqlari va hujjatlarni topshiramiz.

Dastlabki baholash bepul. Telegram: @shohrux_0626, telefon: +998 90 515 55 65.

#разработкасайтов #ташкент #saytyaratish #вебстудия #телеграмбот #мобильноеприложение #toshkent #узбекистан #uzbekistan #dasturlash
```

### Что дальше

Кейс портала O‘zbekiston Bolalar Tashkiloti в первые девять не вошёл (сетка держится на чередовании 5 текстовых и 4 кейсов). Его можно опубликовать десятым: текст поста №8 из Telegram-пакета, картинка по тому же шаблону (раздел 9). Обязательно сохранить оговорку, что бэкенд и админку делал другой подрядчик.

## 5. LinkedIn: страница компании

### Лимиты

| Поле                        | Лимит                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------ |
| Название                    | до 100 символов                                                                      |
| Публичный URL               | linkedin.com/company/… : латиница, цифры, дефисы                                     |
| Слоган (Tagline)            | до 120 символов                                                                      |
| Описание (About / Overview) | до 2000 символов                                                                     |
| Специализации               | до 20                                                                                |
| Отрасль                     | одна                                                                                 |
| Логотип                     | 400×400 (подойдёт `avatar-1080.png`)                                                 |
| Обложка                     | 1128×191 на странице компании; 1584×396 тоже принимается и обрезается сверху и снизу |

### Поля

**Название:** `Razrabotka Tashkent`

**Публичный URL** (варианты по порядку):

1. `linkedin.com/company/razrabotkatashkent`
2. `linkedin.com/company/razrabotka-tashkent`
3. `linkedin.com/company/razrabotkatashkent-uz`

**Сайт:**

```text
https://razrabotkatashkent.uz/?utm_source=linkedin&utm_medium=social&utm_campaign=profile
```

У сайта нет английской версии (только RU и UZ), поэтому ссылки из LinkedIn ведут на русскую.

**Отрасль:** Software Development. **Размер компании:** 2–10 сотрудников (подтвердить, раздел 8). **Тип:** Privately Held. **Год основания:** 2026 (ООО зарегистрировано 02.09.2026; подтвердить, раздел 8).

**Местоположение:** Uzbekistan, Tashkent, без улицы. Если форма требует улицу, местоположение лучше не добавлять совсем, чтобы данные совпадали с Google и Яндексом.

**Телефон** (поле есть в «Contact info»): +998 90 515 55 65.

**Кнопка:** «Contact us» со ссылкой:

```text
https://razrabotkatashkent.uz/contact?utm_source=linkedin&utm_medium=social&utm_campaign=profile&utm_content=cta-button
```

**Специализации** (по одной):

```text
Website Development
Web Applications
CRM Development
Telegram Bots
Telegram Mini Apps
Mobile App Development
iOS
Android
UI/UX Design
Multilingual Websites
Payment Integration
Nuxt
Vue.js
Laravel
FastAPI
PostgreSQL
SEO
```

**Слоган, EN** (115 символов):

```text
Websites, web services, Telegram bots and mobile apps for businesses in Uzbekistan. Fixed price before development.
```

**Слоган, RU** (117 символов):

```text
Сайты, веб-сервисы, Telegram-боты и мобильные приложения для бизнеса в Узбекистане. Цена фиксируется до начала работ.
```

**Слоган, UZ** (109 символов):

```text
O‘zbekiston bizneslari uchun sayt, veb-xizmat, Telegram-bot va mobil ilovalar. Narx ishdan oldin belgilanadi.
```

**Описание, EN** (основной язык страницы, ≈1500 символов):

```text
Razrabotka Tashkent is a software development studio in Tashkent, Uzbekistan. We build websites, web services and CRMs, Telegram bots and Mini Apps, and mobile apps for iOS and Android.

How we work:
• A technical specification is not required. We start with the business task and the result you need.
• We agree the scope of the first version and fix the price in the contract before development starts.
• You talk directly to the developer, without account managers in between.
• App store developer accounts are registered in the client's name.

Selected work:
• Leadvex, our own SaaS CRM for car dealerships in the UAE: a shared inbox for WhatsApp, Messenger and Instagram, leads, vehicle stock and test drives, with an English and Arabic (right-to-left) interface.
• A bilingual English and Russian corporate website with Directus CMS for Total Asset Silk Road, a consulting company in Tashkent.
• A CRM that automates court work on overdue installment loans: claims sent via the UzPost API with E-IMZO signatures, state fee receipts via Billing Sud, and six court documents generated automatically.
• A website with Altegio online booking and a cosmetics shop for M19 Barbershop in Tashkent.
• The public part of a trilingual Uzbek, Russian and English portal for O‘zbekiston Bolalar Tashkiloti, connected to the organization's API.

Base prices and a cost calculator are published on our website.

Legal entity: "LEADVEX AI" LLC, Tashkent, Uzbekistan.
Contact: +998 90 515 55 65, Telegram @shohrux_0626, daily 9:00–20:00.
```

**Описание, RU** (добавить через «Manage languages» → Russian):

```text
Razrabotka Tashkent — студия разработки в Ташкенте. Делаем сайты, веб-сервисы и CRM, Telegram-ботов и Mini App, мобильные приложения для iOS и Android.

Как мы работаем:
• Техническое задание не обязательно: начинаем с задачи бизнеса и нужного результата.
• Согласуем состав первой версии и фиксируем цену в договоре до начала разработки.
• Вы общаетесь напрямую с разработчиком, без менеджеров-посредников.
• Аккаунты разработчика в магазинах приложений оформляются на заказчика.

Проекты:
• Leadvex, наш собственный SaaS для автосалонов ОАЭ: общий входящий для WhatsApp, Messenger и Instagram, лиды, склад автомобилей и тест-драйвы, интерфейс на английском и арабском.
• Корпоративный сайт на английском и русском с CMS Directus для консалтинговой компании Total Asset Silk Road.
• CRM для судебной работы по просроченным кредитам: претензии через API UzPost с подписью E-IMZO, квитанции через Billing Sud, шесть документов для суда автоматически.
• Сайт с онлайн-записью через Altegio и магазином косметики для M19 Barbershop.
• Публичная часть портала O‘zbekiston Bolalar Tashkiloti на трёх языках, подключённая к API организации.

Базовые цены и калькулятор стоимости опубликованы на сайте.

Юрлицо: ООО «LEADVEX AI», Ташкент.
Связь: +998 90 515 55 65, Telegram @shohrux_0626, ежедневно 9:00–20:00.
```

**Описание, UZ.** Если узбекского нет в списке языков LinkedIn, этот текст можно не публиковать или добавить в конец EN-описания (лимит 2000 символов это позволяет только в сокращённом виде: первые два абзаца).

```text
Razrabotka Tashkent — Toshkentdagi dasturlash studiyasi. Saytlar, veb-xizmatlar va CRM, Telegram-botlar va Mini App, iOS va Android uchun mobil ilovalar yaratamiz.

Qanday ishlaymiz:
• Texnik topshiriq shart emas: biznes vazifasi va kerakli natijadan boshlaymiz.
• Birinchi versiya tarkibini kelishamiz va narxni dasturlash boshlanishidan oldin shartnomada qayd etamiz.
• Siz vositachi menejerlarsiz dasturchi bilan bevosita muloqot qilasiz.
• Ilova do‘konlaridagi dasturchi akkauntlari buyurtmachi nomiga ochiladi.

Asosiy narxlar va narx kalkulyatori saytda e’lon qilingan.

Yuridik shaxs: «LEADVEX AI» MChJ, Toshkent.
Aloqa: +998 90 515 55 65, Telegram @shohrux_0626, har kuni 9:00–20:00.
```

**Картинки:** логотип `avatar-1080.png`, обложка `linkedin-banner-1128x191.jpg` (текст сдвинут вправо, чтобы его не закрывал логотип). Если LinkedIn попросит обложку большего размера, загрузите `linkedin-cover-1584x396.jpg`: текст в ней стоит по центру и переживает обрезку сверху и снизу.

### Чек-лист создания (делает владелец)

1. Заполнить личный профиль LinkedIn: реальные имя и фамилия, фото, должность и компания (подтвердить, раздел 8), несколько контактов.
2. linkedin.com → «Для бизнеса» (For Business) → «Создать страницу компании» → «Компания».
3. Название, публичный URL, сайт с UTM, отрасль, размер, тип, логотип, слоган. Поставить галочку, что вы уполномоченный представитель компании.
4. «Создать страницу». Если LinkedIn отказал из-за профиля, дополнить профиль и повторить через несколько дней.
5. «Редактировать страницу»: описание EN, местоположение, специализации, телефон, год основания, обложка, кнопка «Contact us».
6. «Manage languages» → добавить Russian (название, слоган, описание RU).
7. В личном профиле указать место работы со ссылкой на созданную страницу, чтобы она показывалась у вас в опыте.
8. Для будущего автопостинга: API публикации от имени компании (Community Management API) выдаётся по отдельной заявке в LinkedIn Developer Portal, нужен админ страницы. Подавать заявку стоит после того, как на странице появятся первые посты.

## 6. Посты LinkedIn (EN) и Facebook (RU)

### LinkedIn: 6 постов

Тон деловой, без эмодзи, 3–4 хэштега в конце. Ссылки в тексте LinkedIn заметно режет в охвате, поэтому ссылку можно поставить первым комментарием, а в тексте написать «link in the comments». Картинки кейсов: `public/cases/<slug>.webp`, перед загрузкой сконвертировать в JPG (`sips -s format jpeg public/cases/leadvex.webp --out leadvex.jpg`); на них английский интерфейс есть только у Leadvex, у остальных русский, это нормально для скриншотов.

UTM для ссылок: `?utm_source=linkedin&utm_medium=social&utm_campaign=posts`.

#### LI-1. Introduction

Картинка: `linkedin-cover-1584x396.jpg` или без картинки.

```text
Razrabotka Tashkent is now on LinkedIn.

We are a software development studio in Tashkent, Uzbekistan, operating as "LEADVEX AI" LLC. We build websites, web services and CRMs, Telegram bots and Mini Apps, and mobile apps for iOS and Android.

A few principles we work by:
• The price is fixed in the contract before development starts.
• Clients talk directly to the developer, not to an account manager.
• App store developer accounts are registered in the client's name.
• Multilingual by default: we have shipped interfaces in Uzbek, Russian, English and Arabic.

On this page we will share case studies and notes on building software for businesses in Uzbekistan and the region.

https://razrabotkatashkent.uz/?utm_source=linkedin&utm_medium=social&utm_campaign=posts

#Uzbekistan #Tashkent #SoftwareDevelopment #WebDevelopment
```

#### LI-2. Case: Leadvex, our own SaaS for UAE car dealerships

Картинка: `public/cases/leadvex.webp` (в JPG).

```text
Case study: Leadvex, a CRM for car dealerships in the UAE

Leadvex is not a client project. It is our own product, built by "LEADVEX AI" LLC, the company behind Razrabotka Tashkent.

The problem: dealerships in the UAE receive enquiries through WhatsApp, Messenger and Instagram, while customer details, the car they are interested in and test drive bookings live in different places.

What we built:
• A shared inbox for conversations from connected WhatsApp, Messenger and Instagram accounts.
• Lead management with owners, budgets, notes, tags and deal status.
• Vehicle stock per showroom with CSV export.
• Test drive booking directly from a conversation, with overlap checks.
• Roles for sales reps, managers and owners, plus an activity log.
• A full English and Arabic interface with right-to-left layout.
• Channel tokens encrypted at rest; every query is scoped to a single dealership.

Since July 2026 we have shipped the backend, two frontend applications and the marketing site. The product is live at leadvexai.com. The next stage, an AI assistant, is marked "in development" on the site.

Case study: https://razrabotkatashkent.uz/cases/leadvex?utm_source=linkedin&utm_medium=social&utm_campaign=posts

#SaaS #UAE #CRM #ProductDevelopment
```

#### LI-3. Case: bilingual website for an investment consultancy

Картинка: `public/cases/total-asset.webp` (в JPG).

```text
Case study: a bilingual corporate website for Total Asset Silk Road

Total Asset Silk Road supports international investors and corporate clients in Uzbekistan. They needed an English and Russian website covering five service lines, the team, projects and enquiries.

The key requirement: the client wrote and revised the copy throughout the project, so every text had to be editable without a developer.

What we built:
• A server-rendered Nuxt 3 site with separate URLs and hreflang for each language.
• Directus as the CMS, including texts that were previously hard-coded.
• Editor and reviewer roles: only the reviewer can change publication status.
• Enquiries stored in the CMS with a "new" or "processed" status.
• SEO basics: meta tags, Open Graph, JSON-LD, sitemap with hreflang; CSP and HSTS headers.

The work took about two months, from 13 May to 15 July 2026, including several rounds of revisions. The site is live at total-asset.uz.

https://razrabotkatashkent.uz/cases/total-asset?utm_source=linkedin&utm_medium=social&utm_campaign=posts

#WebDevelopment #HeadlessCMS #Nuxt #Uzbekistan
```

#### LI-4. Case: automating court work on overdue loans

Картинка: `public/cases/legat.webp` (в JPG). Клиент анонимный, домен и название не упоминать.

```text
Case study: automating court work on overdue installment loans

The client is a Tashkent company that sells goods in installments. We do not disclose its name.

To take an overdue contract to court, a lawyer has to collect borrower and debt data, send a formal claim by post, wait the required period, determine the competent court, pay the state fee and prepare a document package. We built a system that walks every case through these stages.

What it does:
• Imports loans and payment schedules from Excel and recalculates days overdue.
• Generates claims every night and sends them through the UzPost API with E-IMZO digital signatures; delivery statuses update hourly.
• Determines the court from the borrower's registered address.
• Issues state fee receipts through Billing Sud, one by one or in batches.
• Generates six court documents automatically and downloads them as a single ZIP of PDFs.
• Runs heavy operations in queues; access is split between administrator, lawyer and operator roles.

Development started on 6 July 2026 and continues. As of November 2026 the project has 332 backend and 77 frontend automated tests, and deployment runs only after all checks pass.

https://razrabotkatashkent.uz/cases/legat?utm_source=linkedin&utm_medium=social&utm_campaign=posts

#LegalTech #Automation #Laravel #Uzbekistan
```

#### LI-5. Case: the public side of a trilingual national portal

Картинка: `public/cases/bolalar-tashkiloti.webp` (в JPG).

```text
Case study: the public website of a trilingual portal for O‘zbekiston Bolalar Tashkiloti

O‘zbekiston Bolalar Tashkiloti is a children's organization working in every region of Uzbekistan. It needed an open portal about its activities and projects, with news, media, an enquiry form and member sign-in, in Uzbek, Russian and English.

To be clear about scope: the backend and admin panel were built by another contractor. We built the public website and connected it to the organization's API.

Our part:
• A server-rendered Nuxt site: activities, projects, news, media and contacts.
• Three languages, each with its own URLs.
• Activities across 14 regions: 12 provinces, Tashkent city and the Republic of Karakalpakstan.
• FAQ and an enquiry form with region selection, plus member sign-in.

Pages are served as ready HTML in all three languages, so search engines see the text without running JavaScript. News and projects are published through the admin panel with no code changes. The portal is live at bolalartashkiloti.uz.

https://razrabotkatashkent.uz/cases/bolalar-tashkiloti?utm_source=linkedin&utm_medium=social&utm_campaign=posts

#Multilingual #Nuxt #WebDevelopment #Uzbekistan
```

#### LI-6. Why we publish our prices

Картинка: без картинки или скриншот страницы `/prices`.

```text
Why we publish our prices

Ask a group of business owners in Tashkent how much a website costs and the answers will differ many times over. Usually everyone is right: "a website" can mean a one-page form or a system that files court documents.

So we publish our base prices (in Uzbek som, as of November 2026):
• Landing page: from UZS 3 million, 1–2 weeks
• Corporate website, up to 7 pages: from UZS 7 million, 3–5 weeks
• Online shop: from UZS 15 million, 6–10 weeks
• Telegram bot or Mini App: from UZS 8 million, 2–5 weeks
• Web service or CRM: from UZS 25 million, 2–4 months
• Mobile app for iOS and Android: from UZS 40 million, 2–4 months

What moves the price most: a second language version (about +20%), payment integrations such as Payme, Click or Uzum, CRM or 1C integration, design level and urgency.

The final figure is agreed after a free discussion of the task and fixed in the contract before development starts.

Full price list and calculator: https://razrabotkatashkent.uz/prices?utm_source=linkedin&utm_medium=social&utm_campaign=posts

#Uzbekistan #PricingTransparency #WebDevelopment #SmallBusiness
```

### Facebook: 6 постов

Только RU, ссылки кликабельные: `?utm_source=facebook&utm_medium=social&utm_campaign=posts`. Картинки те же, что в Instagram. Хэштеги на Facebook почти ничего не дают, 2–3 в конце достаточно.

#### FB-1. Знакомство

Картинка: `ig-01.jpg`

```text
Razrabotka Tashkent: сайты, веб-сервисы, Telegram-боты и мобильные приложения для бизнеса в Ташкенте и по всему Узбекистану.

Коротко о нас:
• работаем по договору, юрлицо ООО «LEADVEX AI»;
• цену фиксируем до начала разработки;
• вы общаетесь напрямую с разработчиком, без менеджеров-посредников;
• делаем сайты на русском и узбекском.

На этой странице будут цены и сроки, разборы типовых задач и проекты, которые мы сделали.

Связаться: +998 90 515 55 65, Telegram @shohrux_0626, ежедневно 9:00–20:00.

https://razrabotkatashkent.uz/?utm_source=facebook&utm_medium=social&utm_campaign=posts

#ташкент #разработкасайтов
```

#### FB-2. Цены

Картинка: `ig-03.jpg`

```text
Сколько стоит разработка в Ташкенте: наши цены на 2026 год

Публикуем базовые цены, чтобы бюджет можно было прикинуть до первого звонка.

Лендинг: от 3 млн сум (3–6 млн), 1–2 недели.
Корпоративный сайт до 7 страниц: от 7 млн сум (7–14 млн), 3–5 недель.
Сайт-каталог: от 10 млн сум (10–18 млн), 4–6 недель.
Интернет-магазин: от 15 млн сум (15–30 млн), 6–10 недель.
Telegram-бот или Mini App: от 8 млн сум (8–20 млн), 2–5 недель.
Мобильное приложение iOS и Android: от 40 млн сум (40–100 млн), 2–4 месяца.

Что меняет цену:
• вторая языковая версия (RU + UZ): +20%;
• дизайн на готовой основе: −20%, премиум с анимацией: +30%;
• онлайн-оплата Payme, Click или Uzum: +2–4 млн сум;
• срочно, на 30% быстрее: +30%.

Отдельно от разработки: домен .uz около 80–100 тыс. сум в год, хостинг 50–300 тыс. сум в месяц.

Точную сумму называем после короткого обсуждения задачи, бесплатно, и фиксируем в договоре до начала работ.

Полный прайс и калькулятор: https://razrabotkatashkent.uz/prices?utm_source=facebook&utm_medium=social&utm_campaign=posts
```

#### FB-3. Кейс: M19 Barbershop

Картинка: `ig-02.jpg`

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

Подробнее: https://razrabotkatashkent.uz/cases/m19?utm_source=facebook&utm_medium=social&utm_campaign=posts
```

#### FB-4. Бот или приложение

Картинка: `ig-05.jpg`

```text
Telegram-бот или мобильное приложение: что выбрать

Частая фраза на первой встрече: «Нам нужно приложение». Иногда так и есть, но нередко задачу решает бот или Mini App внутри Telegram, и клиенту не нужно ничего устанавливать.

Telegram-бот или Mini App: от 8 млн сум, 2–5 недель. Под один основной сценарий: запись, заказ или каталог.

Мобильное приложение для iOS и Android: от 40 млн сум, 2–4 месяца.

Приложение стоит рассматривать, когда:
• клиенты регулярно возвращаются в ваш сервис;
• нужны уведомления и функции устройства;
• сотрудникам нужен удобный рабочий инструмент на каждый день.

Если не уверены, начните с одного законченного сценария, проверьте его на клиентах и потом решайте про следующий шаг. Перед мобильной разработкой мы сравниваем три варианта: одна платформа, кроссплатформенное приложение или адаптивный веб-сервис.

Сравнить стоимость: https://razrabotkatashkent.uz/?utm_source=facebook&utm_medium=social&utm_campaign=posts#calculator
```

#### FB-5. Кейс: Total Asset Silk Road

Картинка: `ig-04.jpg`

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

Подробнее: https://razrabotkatashkent.uz/cases/total-asset?utm_source=facebook&utm_medium=social&utm_campaign=posts
```

#### FB-6. Как мы работаем

Картинка: `ig-09.jpg`

```text
Как мы работаем: от первого сообщения до запуска

Техническое задание не обязательно. Для первого разговора достаточно рассказать о бизнесе, задаче и результате, который вы хотите получить. Если есть примеры, текущий сайт или жёсткий срок, напишите и об этом.

1. Разбираемся в задаче. Что должно измениться для бизнеса и кто будет пользоваться продуктом.
2. Определяем первую версию. Сценарии, структура, состав работ и границы проекта. Называем стоимость и срок, затем фиксируем цену в договоре, до начала разработки.
3. Проектируем и разрабатываем. Сначала интерфейс и ключевой сценарий, потом реализация. Промежуточный результат показываем по ходу.
4. Запускаем. Проверяем работу, передаём доступы и документацию. Поддержку и доработки обсуждаем отдельным этапом.

С вами напрямую общается разработчик, без менеджеров-посредников. Предварительная оценка бесплатная.

Опишите задачу: https://razrabotkatashkent.uz/contact?utm_source=facebook&utm_medium=social&utm_campaign=posts
```

## 7. Ритм публикаций

### Расписание первых трёх недель

Telegram идёт по своему расписанию из `docs/telegram-launch-2026-11.md` (пн / ср / пт с 16 ноября). Остальные сети стартуют в понедельник 23 ноября, если аккаунты будут готовы к этому дню; если позже, сдвиньте всю таблицу целиком.

| Дата           | Telegram (10:00)        | Instagram (12:00)        | Facebook (12:00)        | LinkedIn (9:00)      |
| -------------- | ----------------------- | ------------------------ | ----------------------- | -------------------- |
| пн, 23 ноября  | №4 Кейс M19             | ig-01 + ig-02 + ig-03    | FB-1 Знакомство         | LI-1 Introduction    |
| ср, 25 ноября  | №5 Бот или приложение   | ig-04 Total Asset        | —                       | —                    |
| чт, 26 ноября  | —                       | —                        | FB-2 Цены               | LI-2 Leadvex         |
| пт, 27 ноября  | №6 Кейс CRM для юристов | ig-05 Бот или приложение | —                       | —                    |
| пн, 30 ноября  | №7 Что спросить         | ig-06 CRM для юристов    | FB-3 M19                | —                    |
| вт, 1 декабря  | —                       | —                        | —                       | LI-3 Total Asset     |
| ср, 2 декабря  | №8 Bolalar Tashkiloti   | ig-07 Сроки              | —                       | —                    |
| чт, 3 декабря  | —                       | —                        | FB-4 Бот или приложение | LI-4 CRM для юристов |
| пт, 4 декабря  | №9 Как мы работаем      | ig-08 Leadvex            | —                       | —                    |
| пн, 7 декабря  | №10 Кейс Leadvex        | ig-09 Как мы работаем    | FB-5 Total Asset        | —                    |
| вт, 8 декабря  | —                       | —                        | —                       | LI-5 Bolalar         |
| чт, 10 декабря | —                       | —                        | FB-6 Как мы работаем    | LI-6 Prices          |

### Обычная неделя после запуска

| День | Telegram      | Instagram                 | Facebook                   | LinkedIn             |
| ---- | ------------- | ------------------------- | -------------------------- | -------------------- |
| пн   | полезный пост | пост в ленту (та же тема) | кросспост из Instagram, RU | —                    |
| вт   | —             | сторис (по желанию)       | —                          | пост EN              |
| ср   | кейс          | пост в ленту (кейс)       | —                          | —                    |
| чт   | —             | —                         | пост RU (кейс или польза)  | пост EN (по желанию) |
| пт   | полезный пост | пост в ленту или сторис   | —                          | —                    |

Итого в неделю: Telegram 3, Instagram 2–3, Facebook 2, LinkedIn 1–2. Источник тем один: опубликованные статьи журнала `/journal` и новые кейсы. Сначала пишется Telegram-пост, остальные сети получают его адаптацию.

### Что кросспостится

Одна тема проходит по сетям с разной подачей. Через Meta Business Suite пост можно опубликовать в Instagram и Facebook одновременно, но подписи разные (в Instagram RU + UZ без ссылок, в Facebook RU со ссылкой), поэтому включайте «Настроить для каждой платформы» или публикуйте отдельно.

| Тема                      | Telegram          | Instagram | Facebook | LinkedIn |
| ------------------------- | ----------------- | --------- | -------- | -------- |
| Знакомство                | закреплённый пост | ig-01     | FB-1     | LI-1     |
| Цены                      | №1                | ig-03     | FB-2     | LI-6     |
| Сроки                     | №3                | ig-07     | —        | —        |
| Бот или приложение        | №5                | ig-05     | FB-4     | —        |
| Как мы работаем           | №9                | ig-09     | FB-6     | —        |
| Кейс M19                  | №4                | ig-02     | FB-3     | —        |
| Кейс Total Asset          | №2                | ig-04     | FB-5     | LI-3     |
| Кейс CRM для юристов      | №6                | ig-06     | —        | LI-4     |
| Кейс Leadvex              | №10               | ig-08     | —        | LI-2     |
| Кейс Bolalar Tashkiloti   | №8                | (позже)   | —        | LI-5     |
| Что спросить у подрядчика | №7                | —         | —        | —        |

Как мерить: UTM-метки и цели Метрики те же, что в разделе 4 Telegram-пакета. Обращения в Direct, Messenger и LinkedIn на сайт не попадают, их записывайте в ту же таблицу «дата, откуда пришёл, что нужно, итог».

## 8. Что подтвердить владельцу

1. **@username.** Свободность ни одного варианта не проверялась. Лучше один и тот же `razrabotkatashkent` во всех четырёх сетях; если он занят где-то, берите следующий вариант одинаково везде.
2. **Почта для аккаунтов и кнопки «Эл. почта».** Публичной почты на сайте нет. В заявке Golden Pages указан `team@leadvexai.com`. Решите, какую почту показывать (или не показывать вовсе), и заведите отдельный ящик для регистрации соцсетей.
3. **LinkedIn: кто администратор и какая должность.** В статье для vc.ru автор подписан как руководитель студии, а в заявке Golden Pages руководителем указан «Директор, Камолов Ахмад». Нужно решить, из чьего профиля создаётся страница и какую должность там писать.
4. **LinkedIn: размер компании и год основания.** Предложены «2–10 сотрудников» и 2026 (дата регистрации ООО). Часть кейсов (M19, январь 2026) сделана до регистрации ООО, если для вас важно, год можно не указывать.
5. **Скриншот CRM для юристов.** Название клиента нигде в текстах нет, но на обложке кейса (она же на сайте) в интерфейсе видно название системы «Legat», а в ссылке на кейс есть `/cases/legat`. Так же сделано на сайте и в Telegram-пакете; если это нежелательно, нужна другая обложка.
6. **Картинки только на русском.** UZ есть в подписях. Если нужны узбекские версии карточек, их можно сделать тем же шаблоном.
7. **Английской версии сайта нет.** Ссылки из LinkedIn ведут на русские страницы.
8. **Хэштеги в Instagram.** Если лимит в 5 хэштегов уже действует, оставляйте первые пять из каждого списка.

## 9. Файлы

| Файл                                               | Размер    | Где использовать                               |
| -------------------------------------------------- | --------- | ---------------------------------------------- |
| `public/social/brand/avatar-1080.png`              | 1080×1080 | аватар Instagram, Facebook, LinkedIn, Telegram |
| `public/social/brand/facebook-cover-1640x624.jpg`  | 1640×624  | обложка Facebook                               |
| `public/social/brand/linkedin-banner-1128x191.jpg` | 1128×191  | обложка страницы компании LinkedIn             |
| `public/social/brand/linkedin-cover-1584x396.jpg`  | 1584×396  | запасная обложка LinkedIn, картинка к LI-1     |
| `public/social/brand/ig-01.jpg` … `ig-09.jpg`      | 1080×1350 | лента Instagram, посты Facebook                |

Картинки собраны из HTML (Montserrat из `@fontsource/montserrat`, цвета из `app/assets/corporate.css`) и отрендерены Playwright, затем сжаты в JPG (каждый файл меньше 250 КБ). Чтобы сделать новую карточку в том же стиле (например, десятый пост с кейсом Bolalar Tashkiloti), возьмите любую из картинок за образец: поле 72 px, шапка с логотипом, ярлык справа, заголовок 54–66 px, подвал с адресом сайта.
