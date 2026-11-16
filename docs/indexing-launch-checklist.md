# Чек-лист запуска индексации (T-001)

Дата: 16.11.2026. Сайт: https://razrabotkatashkent.uz. Источники: `docs/domain-razrabotkatashkent.md`, `docs/seo-audit-2026-11.md`, `docs/business-listings.md`, `nuxt.config.ts`, `Dockerfile`, `server/lib/indexnow.mjs`.

Обозначения: **К** — команда (проверки только чтением), **В** — только владелец (пароли, коды, DNS, Railway, аккаунты).

## Блокеры владельцу

1. **Railway Variables.** Проверить и при необходимости задать `SITE_URL=https://razrabotkatashkent.uz` и `SITE_INDEXABLE=true`, затем передеплой. Документы расходятся: `docs/domain-razrabotkatashkent.md` пишет, что `true` уже стоит, `deploy/railway.md` и аудит от 14.11 — что выключено. Фактическое состояние показывает шаг 1 ниже.
2. **Последствия `SITE_INDEXABLE=true`.** Включается боевой режим автопостинга в Telegram и Meta (`server/lib/autopost.mjs`, `deploy/railway.md`: если `TELEGRAM_AUTOPOST` и `META_AUTOPOST` не равны `false`), исчезают демо-статьи. Перед включением решить, нужны ли автопосты; иначе задать `TELEGRAM_AUTOPOST=false` и `META_AUTOPOST=false`.
3. **Search Console и Яндекс Вебмастер.** Вход в аккаунты, добавление домена и TXT-записи в Eskiz DNS. Без этого шаги 4–6 не выполнить.
4. **Счётчики.** Нужны ID Яндекс Метрики (`YANDEX_METRIKA_ID`) и, если нужен GA4, `GA_MEASUREMENT_ID`. В репозитории их значений нет, неизвестно, заданы ли они в Railway.
5. **Карточки.** Google: подтверждение видео, логотип и фото. Яндекс Бизнес: ответ на звонок/SMS модерации. 2GIS: ответ на звонок модератора. Замена ссылки shohruxdev.uz на новые адреса с UTM из `docs/business-listings.md`.
6. **Риск A-записи.** Корень домена указывает на IP `153.52.255.92`; при смене IP Railway корень перестанет открываться (`docs/domain-razrabotkatashkent.md`).

## Порядок шагов

### 1. Состояние сайта сейчас (К)

- `curl -sI https://razrabotkatashkent.uz/ | head -20`: ожидается 200. Если есть заголовок `x-robots-tag: noindex, nofollow`, индексация выключена.
- `curl -s https://razrabotkatashkent.uz/robots.txt`: при выключенной индексации строка `Disallow: /` и больше ничего.

### 2. Домен, DNS, HTTPS (К проверяет, В правит)

- `dig +short NS razrabotkatashkent.uz` возвращает `ns1.eskiz.uz` и `ns2.eskiz.uz`.
- `dig +short razrabotkatashkent.uz` возвращает `153.52.255.92`; `dig +short CNAME www.razrabotkatashkent.uz` возвращает `m03h7vx1.up.railway.app.`
- `curl -sI https://www.razrabotkatashkent.uz/` — 301 на `https://razrabotkatashkent.uz/` (`server/middleware/00.canonical-host.ts`).
- `curl -sI https://razrabotkatashkent.uz/journal/` — 301 на адрес без слэша (`01.trailing-slash.ts`).

### 3. SITE_INDEXABLE и пересборка (В)

Значения читаются при сборке (`Dockerfile`: `ARG SITE_URL`, `ARG SITE_INDEXABLE`, по умолчанию `false`), поэтому после смены переменных нужен передеплой (`railway service redeploy --service web` или Redeploy в панели). Сборка падает, если `SITE_INDEXABLE=true` без реального HTTPS `SITE_URL` (`nuxt.config.ts`). Сначала решить пункт 2 блокеров.

Проверка (К), когда деплой завершён:

- `curl -sI https://razrabotkatashkent.uz/ | grep -i x-robots-tag`: заголовка нет.
- `curl -s https://razrabotkatashkent.uz/ | grep -io '<meta name="robots"[^>]*>'`: нет `noindex`.
- `curl -s https://razrabotkatashkent.uz/robots.txt`: `Allow: /`, `Disallow: /api/`, `Disallow: /admin`, строка `Sitemap: https://razrabotkatashkent.uz/sitemap.xml`.
- `curl -s https://razrabotkatashkent.uz/sitemap.xml | grep -c '<loc>'`: адреса только на новом домене; для страниц есть пары `ru`/`uz` и `x-default` (hreflang).
- Главная и `/uz`: в `<head>` self-canonical на `razrabotkatashkent.uz` и взаимные `hreflang`.
- Демо-статей в `/journal` нет.

### 4. IndexNow (В задаёт, К проверяет)

Включается, только если `SITE_INDEXABLE=true`, `SITE_URL` начинается с `https://` и `INDEXNOW_KEY` из 8–128 символов `a-zA-Z0-9-` (`server/lib/indexnow.mjs`). По `docs/domain-razrabotkatashkent.md` ключ в Railway задан. Значение ключа не выводить.

- Проверка: `https://razrabotkatashkent.uz/<INDEXNOW_KEY>.txt` отдаёт 200 с текстом, равным ключу (подставляет владелец). 404 означает, что IndexNow выключен.
- Пинг уходит при публикации статьи; сбои пишутся в лог Railway строкой `IndexNow submission failed`. Google протокол не поддерживает.

### 5. Google Search Console (В, К проверяет чтением)

1. Свойство «Домен» `razrabotkatashkent.uz`, подтверждение через DNS TXT в Eskiz. Результат: статус «Подтверждено».
2. Sitemaps: отправить `https://razrabotkatashkent.uz/sitemap.xml`. Результат: статус «Успешно», число найденных страниц совпадает с `<loc>` в шаге 3.
3. Проверка URL (главная, страница услуги, `/uz`, `/prices`): «URL есть в Google» или «Можно проиндексировать»; запросить индексирование для главной.
4. Bing Webmaster Tools: импорт из GSC (`docs/seo-audit-2026-11.md`, P0).

### 6. Яндекс Вебмастер (В, К проверяет чтением)

1. Добавить `https://razrabotkatashkent.uz`, подтвердить владение (DNS TXT в Eskiz). Результат: «Права подтверждены».
2. Индексирование → Файлы Sitemap: добавить `https://razrabotkatashkent.uz/sitemap.xml`; статус «OK».
3. Права и доступ → Региональность (раздел «Регион сайта»): указать «Ташкент». Результат: регион отображается в настройках.
4. Диагностика → «Проверка ответа сервера» для главной и `/uz`: код 200.
5. Позднее: отчёт «Видимость в Алисе AI» и доля «малоценных» страниц.

### 7. Метрика и GA4 (В настраивает, К проверяет в браузере)

- Счётчики подключаются в `app/plugins/analytics.client.ts` только при `SITE_INDEXABLE=true` и заданных `YANDEX_METRIKA_ID` / `GA_MEASUREMENT_ID`; показывается баннер cookie (`CookieNotice.vue`). В SSR-HTML их не видно, проверять браузером, не `curl`.
- Метрика: заменить адрес сайта на `razrabotkatashkent.uz` (или создать новый счётчик и обновить `YANDEX_METRIKA_ID`). GA4: обновить URL потока.
- Цели типа «JavaScript-событие» с идентификаторами `phone_click`, `telegram_click`, `calculator_cta`, `lead` (GA4: `contact_phone`, `contact_telegram`, `calculator_cta`, `generate_lead`), список — `docs/telegram-launch-2026-11.md`, раздел 4.
- Проверка: открыть сайт, принять cookie; в Метрике «Вебвизор/Онлайн» или в GA4 DebugView/Realtime виден визит; клик по телефону и Telegram даёт цель.

### 8. Карточки на картах (В; К сверяет данные)

Данные NAP, категории, описания и UTM-ссылки — `docs/business-listings.md`, состояние на 15.11.2026:

| Сервис | Что осталось | Как проверить |
| --- | --- | --- |
| Google Business Profile | Подтверждение видео, логотип и фото, замена ссылки на сайт | Профиль в статусе «Подтверждён», в Google по запросу «Razrabotka Tashkent» виден профиль |
| Яндекс Бизнес | Модерация, звонок/SMS, логотип, замена ссылки | Карточка опубликована, найдена в Яндексе по названию |
| 2GIS | Звонок модератора, замена ссылки | Организация находится в 2GIS по названию |
| Golden Pages | Ожидание модерации | Карточка в каталоге |

Сверка NAP (К): название «Razrabotka Tashkent» и телефон +998 90 515 55 65 на сайте (контакты, подвал, `telephone` в JSON-LD) совпадают с карточками; адрес в Google и Яндексе скрыт сознательно.

### 9. Контроль через 7 дней (К, чтение)

- GSC: отчёт «Страницы» без массовых «Заблокировано noindex»/«Исключено canonical».
- Вебмастер: страницы в поиске, нет критичных ошибок.
- Метрика: визиты и цели приходят. Ожиданий по позициям и срокам не фиксируем.
