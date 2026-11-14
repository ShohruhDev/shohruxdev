# SEO-аудит и план: ноябрь 2026

Дата: 14 ноября 2026. Сверка текущего кода сайта с актуальными практиками Google, Яндекса и AI-поиска.

Доля поисковых систем в Узбекистане (Statcounter, июнь–октябрь 2026): Google около 77%, Яндекс 18–24% (на мобильных его доля выше), Bing около 1,4%. Отсюда приоритеты: Google — основной канал, Яндекс — обязательный второй.

## 0. Блокер: сайта нет в интернете

- `razrabotkatashkent.uz` не резолвится в DNS. Railway-превью отдаёт 404.
- `SITE_INDEXABLE` выключен: на всех страницах стоит `noindex`, robots закрывает весь сайт.

Пока это не исправлено, остальные пункты плана не работают. Поисковый «возраст» домена начинает копиться только после запуска.

## 1. Что уже сделано хорошо

- SSR, отдельные URL `/uz`, взаимные hreflang (`ru`, `uz`, `x-default`) и self-canonical соответствуют правилам Google.
- Sitemap включает только существующие переводы, у статей есть `lastmod`.
- robots закрывает `/admin` и `/api/` и разрешает OAI-SearchBot.
- JSON-LD: ProfessionalService, Person, WebSite, BreadcrumbList, Article с автором и датами.
- Редиректы с www, 404, позиция «без вымышленных отзывов и рейтингов». Это совпадает с ЭПОС Яндекса и E-E-A-T Google.
- Публикация статей требует ручного согласования, человек остаётся в контуре.

## 2. Что изменилось в 2025–2026 и влияет на нас

| Факт | Следствие для сайта |
|---|---|
| FAQ rich results Google отключил в мае 2026, HowTo не показываются с 2023 | FAQPage на услугах оставляем (безвредно, полезно Яндексу и AI), но сниппетов не ждём |
| Core- и спам-апдейты 2026 бьют по scaled content abuse; спам-политики теперь распространяются и на AI Overviews | Главный риск — LLM-журнал. Частоту ограничиваем, в каждую статью добавляем собственный опыт |
| AI Overviews снижают клики по информационным запросам примерно на 40% | Основная ставка на коммерческие страницы (услуги, цены, кейсы), журнал — вторичен |
| Google: для AI-поиска не нужны llms.txt и особая разметка, достаточно обычного SEO | llms.txt не приоритет |
| Яндекс опубликовал рамку ЭПОС (апрель 2026): адрес, реквизиты, портфолио, отзывы, Яндекс Бизнес, Метрика | Нужны реальные коммерческие факторы |
| Алиса AI цитирует почти только сайты из топ-5–10; в Вебмастере есть отчёт «Видимость в Алисе AI» | Отдельного GEO нет, нужна классическая позиция в топе |
| Турбо-страницы Яндекс закрыл в 2025 | Не внедрять |
| Порог INP — 200 мс (официально), LCP 2,5 с, CLS 0,1 | Целиться в INP ≤150 мс как запас |
| Отчёт «Generative AI performance» в Search Console доступен всем | Отслеживать после запуска |

## 3. План по приоритетам

### P0 — запуск (неделя 1)

1. Домен, DNS, HTTPS. Затем `SITE_URL=https://razrabotkatashkent.uz`, `SITE_INDEXABLE=true` и пересборка.
2. **Google Search Console** (Domain property через DNS) и **Яндекс Вебмастер**: отправить sitemap, проверить главную, услуги и `/uz`.
3. В Вебмастере указать регион «Ташкент».
4. **Bing Webmaster Tools**: импорт из GSC. Это охват Copilot и, вероятно, ChatGPT search.
5. **Яндекс Метрика** с целями «заявка», «клик Telegram», «клик телефон» (`YANDEX_METRIKA_ID` уже поддерживается). GA4 по желанию. Счётчики грузить отложенно, чтобы не портить INP.

### P1 — коммерческие факторы и доверие (недели 1–4)

6. Карточки **Google Business Profile, Яндекс Бизнес, 2GIS** с одинаковыми названием, адресом и телефоном (NAP). Если офиса нет, использовать зону обслуживания без выдуманного адреса.
7. Контакты в шапке: телефон +998, Telegram. На странице контактов указать статус исполнителя (ИП/самозанятый/компания), если владелец готов это раскрыть.
8. **Портфолио/кейсы** — отдельный URL на каждый кейс: задача, решение, стек, результат, ссылки на сторы. Это главный недостающий сигнал для обоих поисковиков.
9. **Цены «от»** на страницах услуг и SSR-текст с диапазонами рядом с калькулятором, а не только JS-виджет.
10. Страница автора (Burxonov Shohrux): опыт, стек, ссылки на GitHub, LinkedIn, Habr. На неё ведёт `author.url` в Article (сейчас ведёт на главную). В Person и Organization добавить `sameAs`.

### P2 — технические доработки в коде (недели 2–4)

Статус на 14.11.2026. Сделано: 11 (IndexNow; включается переменной `INDEXNOW_KEY`), 13 (крошки в три уровня для статей и услуг), 14 (301 со слэша на конце), автор статьи ссылается на `#person`, шрифты подключены через файлы с `unicode-range`. Пункт 12 сделан: картинки статей генерируются автоматически по адресу `/og/journal/<slug>.png` (satori + resvg, шрифты в `server/assets/og-fonts`), кэшируются в памяти, адрес меняется вместе с заголовком. По пункту 15: на русской главной всё ещё грузится набор latin-ext Unbounded (около 100 КБ), причина не найдена. Пункт 16 не нужен: `*` уже разрешает всех ботов.

11. **IndexNow** (ключ-файл + пинг при публикации статьи): ускоряет Яндекс и Bing. Google протокол не поддерживает.
12. **OG-картинки по статьям**: сейчас у всех страниц `og-default.jpg`. Варианты: генерация (nuxt-og-image) или поле обложки в редакторе.
13. **BreadcrumbList для статей** в три уровня: Главная → Журнал → Статья (сейчас два).
14. Проверить единообразие trailing slash: без слэша, 301 со слэшем.
15. Аудит CWV на production: 16 файлов шрифтов в CSS, LCP-картинка с `fetchpriority="high"` и явными размерами.
16. robots: явно разрешить ClaudeBot и PerplexityBot (сейчас разрешены через `*`, это опционально). Решить, разрешать ли GPTBot (обучение). `Google-Extended` не влияет на AI Overviews.

### P3 — контент (постоянно)

17. Журнал: 1–2 статьи в неделю, не ежедневно. Обязательно добавлять опыт владельца, цифры, скриншоты. Слабые статьи не публиковать. В Вебмастере следить за долей «малоценных» страниц: фильтр МПК бьёт по всему сайту.
18. Новые услуги-посадочные только при реальном предложении: Telegram-боты и Mini Apps, UI/UX, поддержка.
19. Не делать страницы под города СНГ: это doorway pages. Максимум одна страница «работаем с клиентами из СНГ» с реальными кейсами.
20. Узбекский: проверить спрос в Wordstat и Keyword Planner на латинице и кириллице («mobil ilova yaratish» / «мобил илова яратиш»). Кириллические формулировки добавлять в тексты, отдельную версию сайта не делать.

### P4 — внешние сигналы (с месяца 2)

21. Habr и vc.ru: технические и бизнес-кейсы. Это упоминания бренда, которые учитывают AI-системы.
22. Telegram-канал и гостевые посты в узбекских IT-каналах: растят брендовый спрос.
23. Профили на Workspace.ru (раздел Ташкента), Clutch, GoodFirms, Behance, GitHub. Каталог IT Park, если есть резидентство.
24. PR-поводы для Spot.uz, Kun.uz, Gazeta.uz.
25. Запрещено: биржи ссылок, PBN, накрутка поведенческих факторов, массовые прогоны по каталогам.

## 4. Что не делать

- llms.txt как «продвижение» (97% таких файлов не получают запросов).
- Турбо-страницы.
- Фейковые отзывы, AggregateRating, LocalBusiness с несуществующим адресом.
- Шаблонные страницы под города и вариации запросов.
- Ежедневная LLM-публикация без редактуры.
- Переход на @nuxtjs/seo ради «галочки»: всё, что он даёт, уже реализовано вручную.

## 5. Неопределённости

- ChatGPT search, вероятно, использует индекс Bing, но OpenAI это официально не подтвердил.
- Веса поведенческих и коммерческих факторов Яндекс не публикует.
- Соотношение запросов на узбекской латинице и кириллице публично не измерено.
- Требования к регистрации .uz изменились 04.03.2026: сверить на lex.uz.

## Источники

- Google AI optimization guide: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- Gen AI report в GSC: https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
- hreflang: https://developers.google.com/search/docs/specialty/international/localized-versions
- INP: https://web.dev/articles/inp
- Отключение FAQ rich results: https://www.seroundtable.com/google-search-console-deprecated-structured-data-40083.html
- Core update май 2026: https://searchengineland.com/google-may-2026-core-update-rolling-out-now-478430
- Клики и AI Overviews: https://ppc.land/researchers-find-google-ai-overviews-cut-publisher-clicks-39-8/
- Яндекс ЭПОС: https://yandex.ru/support/webmaster/ru/epos
- Региональность Яндекса: https://yandex.ru/support/webmaster/recommendations/regionality.html
- IndexNow (Яндекс): https://yandex.com/support/webmaster/en/indexing-options/index-now
- Источники Алисы AI: https://www.retail.ru/news/ashmanov-i-partnery-za-polgoda-dolya-saytov-ne-iz-topa-10-v-otvetakh-alisy-upala-10-iyunya-2026-278744/
- Закрытие Турбо-страниц: https://habr.com/ru/companies/click/news/884704
- Боты OpenAI: https://developers.openai.com/api/docs/bots
- llms.txt (Ahrefs): https://www.searchenginejournal.com/97-of-llms-txt-files-got-no-requests-ahrefs-data-shows/
- Google Business Profile, страны: https://support.google.com/business/answer/6270107
- 2GIS: https://help.2gis.com/question/how-to-add-company-to-2GIS
- Доли поисковиков: https://gs.statcounter.com/search-engine-market-share/all/uzbekistan
- Положение о .uz: https://lex.uz/uz/docs/8078042
