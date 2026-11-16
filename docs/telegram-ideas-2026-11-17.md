# Идеи постов для Telegram-канала на 17–23.11.2026 (issue #34)

Дата: 16.11.2026. Автор: SMM. Это идеи, не готовые посты: в `shared/telegram-posts.mjs` ничего не добавлено, флаги одобрения не ставились, публикаций нет. Полные тексты RU + UZ напишу после выбора идей владельцем и добавлю в очередь с `approved: false`.

## Контекст недели

В очереди уже стоят три поста: `case-total-asset` (ср 18.11), `timelines` (пт 20.11), `case-m19` (пн 23.11). Пост `prices-2026` вышел 16.11. Идеи ниже не повторяют темы очереди (цены и сроки по типам, три кейса, бот или приложение, вопросы подрядчику, как работаем) и темы декабрьского плана (`hidden-costs`, `bilingual-site`, `integrations`, `who-answers`, `project-lessons`, `seo-before-launch`).

Ритм по стратегии: пн, ср, пт в 10:00. Занятых слотов на неделе нет только во вт и чт, поэтому идеи 1 и 2 ставлю туда. Идеи 3–5 нужны, если владелец хочет больше трёх постов в неделю; иначе переносим их на недели 24–30.11 в слоты, которые освободятся.

## UTM: расхождение с issue

В issue упомянута схема `post` / `pinned`. Действующая карта `docs/utm-map-2026-11.md` (раздел 2) и `docs/social-strategy-2026-12.md` задают для поста Telegram-канала: `utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=<id поста>`. Значений `post` и `pinned` в карте нет, поэтому взята карта. Правила карты: всё строчными латиницей, `utm_content` равен `id` поста в очереди. Ссылка на личку `t.me/shohrux_0626` без меток (карта: личка и звонки не размечаются, источник выясняем вопросом «Откуда вы о нас узнали?»). Напоминание: `utm_content` видно только в Метрике, в `/admin` и заявке он не хранится. Старые посты очереди без `utm_content`.

## Сводка

| # | id (utm_content) | Тема | Формат | Язык | Рубрика | Слот | Ссылка на сайт |
|---|---|---|---|---|---|---|---|
| 1 | `brief-checklist` | Что написать в первом сообщении: шесть пунктов для оценки | текстовый пост | RU | призыв, польза | вт 17.11, 10:00 | `/contact` |
| 2 | `bot-booking-estimate` | Telegram-бот с онлайн-записью: пример расчёта | текстовый пост | RU | цены | чт 19.11, 10:00 | `/#calculator` |
| 3 | `webapp-first-scenario` | CRM или личный кабинет: с чего начать | текстовый пост | RU | цены, польза | пт 20.11, 16:00 (доп.) | `/services/web-apps` |
| 4 | `landing-or-corporate` | Lending yoki korporativ sayt: qaysi biri kerak | текстовый пост | UZ | цены, польза | сб 21.11, 11:00 (доп.) | `/uz/prices` |
| 5 | `after-launch-terms` | Ishga tushgandan keyin: kafolat, kirish huquqlari, kod | текстовый пост | UZ | как работаем | пн 23.11, 16:00 (доп.) | `/uz/process` |

Формат везде текст без картинки (до 4096 символов): картинок нужного бренда на эти темы нет, а дизайнера не нагружаем. Для каждого поста готовим парную версию на втором языке (очередь отправляет RU, через 2 минуты UZ). Основной язык указан тот, на котором пишем первым.

## Описание идей

Все цены ниже из `shared/pricing.mjs`; расчёты в идеях 2 и 4 сделаны функцией `estimate()` и перепроверены перед написанием текста.

### 1. `brief-checklist`: что написать в первом сообщении (RU)

- Тезисы: ТЗ не нужно. Для первой оценки хватает шести пунктов: чем занимается бизнес; что должен делать сайт, бот или сервис; языки (RU, UZ); есть ли тексты и фото; один-два сайта-примера; желаемый срок.
- Что даст ответ: оценка бесплатная, цену фиксируем в договоре до начала разработки; отвечает разработчик напрямую.
- Источник: `docs/knowledge-base.md`, раздел 2 («Нужно ли ТЗ»), раздел 12.
- CTA: «Напишите в Telegram @shohrux_0626, достаточно этих шести строк». Ссылка: `https://razrabotkatashkent.uz/contact?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=brief-checklist`
- Пересечение: Instagram `ig-18` с похожей темой, но в Telegram такого поста нет; в нём акцент на «скопируйте и отправьте», это пост для заявок.

### 2. `bot-booking-estimate`: Telegram-бот с записью, пример расчёта (RU)

- Тезисы: бот с одним сценарием стоит от 3 млн сум (3–8 млн), 1–3 недели. Онлайн-запись (слоты, мастера, напоминания) +3–6 млн сум, +1–2 недели.
- Пример по калькулятору: бот на русском с записью 6–14 млн сум, 2–5 недель; на RU + UZ 7–17 млн сум, 3–6 недель (вторая версия +20% и +1 неделя).
- Вывод: при одном сценарии часто хватает бота, приложение за 30–80 млн не нужно (связка с постом `bot-or-app`).
- CTA: «Посчитайте свой вариант в калькуляторе или опишите задачу в Telegram». Ссылка: `https://razrabotkatashkent.uz/?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=bot-booking-estimate#calculator`
- Не обещать: сроки «за N дней», рост записей, число клиентов.

### 3. `webapp-first-scenario`: CRM или личный кабинет, с чего начать (RU)

- Тезисы: веб-сервис, CRM или личный кабинет: от 20 млн сум (20–50 млн), 2–4 месяца (8–17 недель); в составе роли, ключевой сценарий, база данных, админка.
- Совет: начать с одного законченного сценария, остальное оценить отдельно. Факторы цены: число ролей, бизнес-правила, интеграции, перенос данных.
- Примеры без новых фактов: Legat (клиент анонимен, «компания рассрочки, Ташкент»: импорт из Excel, шаблоны документов меняются без программиста) и Leadvex (собственный продукт). Кейс Legat выходит в канале 27.11, поэтому пост 3 ставить не раньше этого слота или упоминать кейс без деталей.
- CTA: описать, какие таблицы и переписка мешают сейчас, в Telegram. Ссылка: `https://razrabotkatashkent.uz/services/web-apps?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=webapp-first-scenario`
- Название клиента Legat не называть; интерфейс не показывать.

### 4. `landing-or-corporate`: lending yoki korporativ sayt (UZ, латиница)

- Тезисы: lending (1 sahifa, 6 blokkacha, ariza shakli): 2.5 mln so‘mdan (2.5–5 mln), 1–2 hafta. Korporativ sayt (7 sahifagacha, admin panel matnlar uchun, RU + UZ narxda): 6 mln so‘mdan (6–12 mln), 3–5 hafta.
- Нюанс для УЗ-аудитории: если нужны RU + UZ, lending стоит 3–6 mln so‘m, 2–3 hafta (ikkinchi til +20%, +1 hafta); в корпоративном сайте оба языка уже в цене.
- Как выбрать: одна услуга или акция, нужна одна форма заявки: lending. Несколько услуг, раздел «о компании», тексты правит сам бизнес: korporativ sayt.
- CTA: yozing Telegram’da, vazifani qisqa muhokama qilamiz (baholash bepul). Ссылка: `https://razrabotkatashkent.uz/uz/prices?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=landing-or-corporate`
- Проверка UZ: o‘/g‘ с апострофом ‘, цены в формате «2.5 mln so‘mdan», кириллицы нет.

### 5. `after-launch-terms`: kafolat, kirish huquqlari, kod (UZ, латиница)

- Тезисы (решения CEO от 16.11.2026): после сдачи 1 oy davomida qilingan ishdagi xatolarni bepul tuzatamiz (новые доработки не входят); kod, dizayn va kirish huquqlari to‘liq to‘lovdan keyin mijozga topshiriladi; hujjatlar bilan; to‘lov shartlari har bir loyiha uchun shartnomada qayd etiladi; qo‘llab-quvvatlash kafolatdan keyin alohida, 0.5–1.5 mln so‘mdan (shartnomada, loyihaga qarab).
- Слова «гарантируем результат» не использовать: речь только об исправлении ошибок. Проценты предоплаты не называть.
- Расхождение: `docs/social-strategy-2026-12.md` (раздел 2) говорит «гарантий не обещаем», но база знаний от 16.11.2026 фиксирует гарантию 1 месяц как решение CEO; беру базу знаний. Текст перед постановкой в очередь советую показать `legal`.
- CTA: shartnoma shartlarini oldindan so‘rang, Telegram’da yozing. Ссылка: `https://razrabotkatashkent.uz/uz/process?utm_source=telegram&utm_medium=social&utm_campaign=channel&utm_content=after-launch-terms`

## Что нужно от владельца

1. Выбрать идеи (минимум 1 и 2 для вт и чт) и сказать, нужен ли ритм сверх 3 постов в неделю.
2. Подтвердить, что формулировка про гарантию 1 месяц (идея 5) может идти публично.
3. После выбора: SMM пишет RU + UZ, добавляет в `shared/telegram-posts.mjs` с `approved: false`, проверяет `npm test`; флаг ставит владелец.

## Проверка по правилам

Эмодзи, скидок, отзывов, выдуманных цифр и названия клиента Legat нет. Кейсы только реальные (M19, Total Asset, Leadvex как собственный продукт, Legat анонимно; Bolalar Tashkiloti в идеях не используется). Цены из `shared/pricing.mjs`, расчёты через `estimate()`.
