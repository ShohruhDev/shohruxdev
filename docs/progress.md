# Progress — docs/implementation-plan.md

Ruling: Nuxt вместо React-шаблона Product Design — явное требование Vue приоритетно.
Ruling: работа в новой папке без Git — origin не существует, ветки/коммиты не создаются.
Ruling: локальный CLI вместо публичной админки — достаточен для редакционного цикла, не требует ненастроенной авторизации.
Ruling: SQLite для проверяемой локальной версии; PostgreSQL остаётся вариантом рабочей инфраструктуры.
Ruling: продолжаем реализацию по разрешению «делай», без повторных согласований плана.

Task 1: complete — tests validate persistence, scheduling, privacy, rate limits.
Task 2: complete — public routes, SSR, form, responsive CSS, generated hero asset.
Task 3: complete — content CLI, editorial example, strategy and operations README.
Final review: fresh read-only reviewer; no critical findings.
Final: fixed punctuation-only phone acceptance — regression RED→GREEN.
Final: fixed unsupported article service destination — regression RED→GREEN.
Review limitations retained: production infrastructure/domain/notifications/LLM and legal policy require owner configuration, not represented as complete.
QA iteration 1: P2 hero too tall, third service below reference viewport. Reduced desktop hero to 634px and rows to 106px; final capture pending.
Ruling: Chrome used because in-app browser iab was unavailable; browser connector confirmed Chrome availability.
Task 4: complete — 5 unit tests pass, typecheck pass, production build pass, HTTP/CLI integration pass. Browser form error→success and persistent test record verified. Desktop layout fixed and re-compared; mobile menu/filter tested.
Final: minor (deferred): demonstration image device model differs from reference; replace with actual owner portfolio later.
Final: infrastructure and legal prerequisites accepted as explicit launch work, not silently declared complete.
Final screenshots: ../desktop-preview.jpg (1330×1182), ../mobile-preview.jpg (390×844), ../form-success.jpg. Temporary viewport reset; local preview marked as deliverable. Source archive excludes dependencies, builds, .env and local database.

## 26 октября — полноценная редакция

Добавлены /admin, темы, редактор с источниками/FAQ/коротким ответом, календарь, worker, адаптер Responses API с web_search, дневной/месячный лимит, журнал запусков, UTM/источники заявок, RSS и OAI-SearchBot в production robots. Автор Burxonov Shohrux. Подготовлены 12 тем и 1 черновик, публикация требует проверки.

Три замечания независимого review исправлены: optimistic concurrency для save/schedule, резервирование URL для генерации, запрет редактирования во время сохранения. Повторный review подтвердил исправления. Unit 13/13, typecheck, build, HTTP старых страниц и admin прошли. Отдельная production-сборка проверена: без noindex на статьях, без публичных демо и будущих статей; реальный worker выпустил согласованную статью и обновил heartbeat/feed/sitemap. Для финального локального просмотра возвращена закрытая от индексации сборка.

Реальный платный OpenAI API не вызывался. Генератор проверен через тестовый транспорт; для проверки с провайдером нужны ключ, доступная модель и бюджет. Домен/VPS, публичный деплой, уведомления и CRM пока отсутствуют.


## 26 октября — двуязычный сайт

Завершены русская и узбекская (латиница) публичные версии, /uz-маршруты, переключатель, локализованные услуги/журнал/форма/ошибки, reactive SEO, RSS/sitemap. Редактор хранит translations.uz и требует проверки перевода перед выпуском. Генератор готовит два текста; реальный API не вызывался. Стартовый черновик сохранён с переводом без публикации.

Review исправления: optional-поля русского текста не наследуются в узбекский; редактор поддерживает отсутствие FAQ; неизвестные узбекские страницы имеют правильный html lang; trailing slash нормализуется до вычисления доступных языков. Дополнительно браузером обнаружены и исправлены устаревавшие SEO-метаданные при клиентском переключении языков.

Итоговая проверка: unit 17/17, typecheck, build, bilingual HTTP (13 страниц), основной HTTP, admin HTTP, production worker/RSS/sitemap прошли. Адаптивность проверена в Chrome 390 и 1330 px; RU/UZ сохраняет выбранную услугу. Сайт остаётся локальным; домен/сервер/API не подключены.
