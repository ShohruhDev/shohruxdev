# Instagram: Stories и «Актуальное» (ноябрь 2026)

Пакет для пяти закреплённых историй (Highlights, «Актуальное») в профиле Razrabotka Tashkent: обложки, кадры историй, точный текст на каждом кадре, ссылки для стикера и порядок действий в приложении.

Цены и сроки взяты из `shared/pricing.mjs` (подписи из `app/data/pricing-labels.ts`, перевод из `shared/uz.json`), кейсы из `shared/cases.mjs`, этапы работы из `app/data/services.ts` (`steps`, страница `/process`), контакты из `shared/brand.mjs`. Отзывов, скидок, гарантий и метрик, которых нет на сайте, в кадрах нет. Обещания о сроке ответа тоже нет.

Если цены на сайте поменяются, кадры `prices-*` и `faq-1..4` нужно перерисовать.

## Файлы и стиль

Все файлы лежат в `public/social/stories/`, формат 1080×1920 JPEG, каждый меньше 300 КБ.

- Стиль тот же, что у ленты (`public/social/brand/ig-01..09.jpg`): Montserrat, текст #1f1f1f, синий акцент #2457f5, оранжевая точка из знака, логотип и плашка-рубрика вверху, адрес сайта внизу. Чередуются белые, светло-серые (#f8f7f5, кейсы) и синие кадры.
- Безопасные зоны: в верхних 250 px и нижних 300 px текста нет, там интерфейс Instagram (полоски прогресса, имя профиля, поле ответа).
- Основной текст от 40 до 220 px, подписи и рубрики от 32 px.
- Обложки: синий фон с мягким градиентом, белая линейная иконка с оранжевой точкой в центре. Иконка помещается в центральный круг диаметром около 600 px, который Instagram вырезает для обложки.

| Обложка               | Highlight | Иконка                       |
| --------------------- | --------- | ---------------------------- |
| `cover-prices.jpg`    | Цены      | ценник                       |
| `cover-cases.jpg`     | Кейсы     | монитор с окном сайта        |
| `cover-process.jpg`   | Процесс   | маршрут от точки к точке     |
| `cover-faq.jpg`       | Вопросы   | облачко с вопросительным знаком |
| `cover-contacts.jpg`  | Контакты  | телефонная трубка            |

## UTM для стикера-ссылки

Шаблон: `https://razrabotkatashkent.uz<путь>?utm_source=instagram&utm_medium=story&utm_campaign=<highlight>&utm_content=<кадр>`.

`utm_campaign` равен ключу Highlight (`prices`, `cases`, `process`, `faq`, `contacts`). Журнал заявок в `/admin` хранит source, medium и campaign. `utm_content` (имя кадра) видно только в Метрике, его можно не вставлять.

На один кадр ставится один стикер-ссылка. Ссылки на Telegram (`t.me/...`) без UTM: метки там не работают.

## Порядок в профиле

Слева направо: **Цены → Кейсы → Процесс → Вопросы → Контакты**.

Instagram ставит первым тот Highlight, который создали или пополнили последним. Поэтому создавайте их в обратном порядке: сначала «Контакты», в конце «Цены». Если позже добавить историю в любой Highlight, он переедет в начало ряда.

---

## 1. Цены (`prices`)

Название Highlight: **Цены**. Обложка: `cover-prices.jpg`. Порядок: prices-1, prices-2, prices-3, затем узбекские prices-1-uz, prices-2-uz, prices-3-uz.

### prices-1.jpg (белый)

```text
[плашка] Цены
ЦЕНЫ НА 2026 ГОД
Сколько стоит сайт
Лендинг | Одна страница под услугу или акцию | от 3 млн сум | 1–2 нед.
Корпоративный сайт | Услуги, о компании, контакты | от 7 млн сум | 3–5 нед.
Сайт-каталог | Товары или услуги с фильтрами | от 10 млн сум | 4–6 нед.
Интернет-магазин | Корзина, заказ, оплата | от 15 млн сум | 1,5–2,5 мес.
Базовые цены. Итог зависит от дизайна, языков и интеграций.
razrabotkatashkent.uz · Все цены: /prices
```

Стикер: `https://razrabotkatashkent.uz/prices?utm_source=instagram&utm_medium=story&utm_campaign=prices&utm_content=prices-1`

### prices-2.jpg (белый)

```text
[плашка] Цены
ЦЕНЫ НА 2026 ГОД
Боты, сервисы и приложения
Telegram-бот или Mini App | Запись, заказ или каталог в Telegram | от 8 млн сум | 2–5 нед.
Веб-сервис / CRM | Личный кабинет, внутренняя система | от 25 млн сум | 2–4 мес.
Мобильное приложение | iOS и Android | от 40 млн сум | 2–4 мес.
Можно начать с небольшой версии.
razrabotkatashkent.uz · Все цены: /prices
```

Стикер: `https://razrabotkatashkent.uz/prices?utm_source=instagram&utm_medium=story&utm_campaign=prices&utm_content=prices-2`

### prices-3.jpg (синий)

```text
[плашка] Цены
ЦЕНЫ НА 2026 ГОД
Что меняет цену
Дизайн на готовой основе −20%
Премиум-дизайн с анимацией +30%
Две языковые версии (RU + UZ) +20%
Срочно: срок на 30% короче +30%
Онлайн-оплата +2–4 млн
Интеграция с 1С +5–12 млн
[белая карточка] Точную сумму фиксируем в договоре до начала работ.
Рассчитать свой проект
razrabotkatashkent.uz/calculator
razrabotkatashkent.uz · Цены в сумах
```

Стикер: `https://razrabotkatashkent.uz/calculator?utm_source=instagram&utm_medium=story&utm_campaign=prices&utm_content=prices-3`

### prices-1-uz.jpg (белый)

```text
[plashka] Narxlar
2026-YIL NARXLARI
Sayt narxi qancha
Lending | Xizmat yoki aksiya uchun bitta sahifa | 3 mln so‘mdan | 1–2 hafta
Korporativ sayt | Xizmatlar, kompaniya haqida, kontaktlar | 7 mln so‘mdan | 3–5 hafta
Katalog-sayt | Filtrli tovarlar yoki xizmatlar | 10 mln so‘mdan | 4–6 hafta
Internet-do‘kon | Savat, buyurtma, to‘lov | 15 mln so‘mdan | 1.5–2.5 oy
Bazaviy narxlar. Yakuniy narx dizayn, tillar va integratsiyalarga bog‘liq.
razrabotkatashkent.uz · Barcha narxlar: /uz/prices
```

Стикер: `https://razrabotkatashkent.uz/uz/prices?utm_source=instagram&utm_medium=story&utm_campaign=prices&utm_content=prices-1-uz`

### prices-2-uz.jpg (белый)

```text
[plashka] Narxlar
2026-YIL NARXLARI
Botlar, servislar va ilovalar
Telegram-bot yoki Mini App | Telegram’da yozilish, buyurtma yoki katalog | 8 mln so‘mdan | 2–5 hafta
Veb-xizmat / CRM | Shaxsiy kabinet, ichki tizim | 25 mln so‘mdan | 2–4 oy
Mobil ilova | iOS va Android | 40 mln so‘mdan | 2–4 oy
Kichik versiyadan boshlash mumkin.
razrabotkatashkent.uz · Barcha narxlar: /uz/prices
```

Стикер: `https://razrabotkatashkent.uz/uz/prices?utm_source=instagram&utm_medium=story&utm_campaign=prices&utm_content=prices-2-uz`

### prices-3-uz.jpg (синий)

```text
[plashka] Narxlar
2026-YIL NARXLARI
Narxga nima ta’sir qiladi
Tayyor asosdagi dizayn −20%
Animatsiyali premium dizayn +30%
Ikki tilli versiya (RU + UZ) +20%
Shoshilinch: muddat 30% qisqaroq +30%
Onlayn to‘lov +2–4 mln
1C bilan integratsiya +5–12 mln
[oq kartochka] Aniq narx ish boshlanishidan oldin shartnomada qayd etiladi.
Loyihangizni hisoblang
razrabotkatashkent.uz/uz/calculator
razrabotkatashkent.uz · Narxlar so‘mda
```

Стикер: `https://razrabotkatashkent.uz/uz/calculator?utm_source=instagram&utm_medium=story&utm_campaign=prices&utm_content=prices-3-uz`

---

## 2. Кейсы (`cases`)

Название Highlight: **Кейсы**. Обложка: `cover-cases.jpg`. Порядок как на сайте (`shared/cases.mjs`): cases-1 … cases-5. На каждом кадре скриншот-мокап из `public/cases/<slug>.webp`.

### cases-1.jpg: Leadvex

```text
[плашка] Свой продукт
СОБСТВЕННЫЙ ПРОДУКТ
Leadvex: CRM для автосалонов ОАЭ
SaaS ООО «LEADVEX AI», не заказ клиента
✓ WhatsApp, Messenger и Instagram в одном окне
✓ Английский и арабский. Продукт запущен
Подробнее о проекте
razrabotkatashkent.uz/cases/leadvex
```

Стикер: `https://razrabotkatashkent.uz/cases/leadvex?utm_source=instagram&utm_medium=story&utm_campaign=cases&utm_content=cases-1`

### cases-2.jpg: Total Asset Silk Road

```text
[плашка] Кейс
КОРПОРАТИВНЫЙ САЙТ
Сайт консалтинговой компании
Total Asset Silk Road, Ташкент
✓ Версии на английском и русском
✓ Тексты компания меняет сама в CMS
Подробнее о проекте
razrabotkatashkent.uz/cases/total-asset
```

Стикер: `https://razrabotkatashkent.uz/cases/total-asset?utm_source=instagram&utm_medium=story&utm_campaign=cases&utm_content=cases-2`

### cases-3.jpg: M19 Barbershop

```text
[плашка] Кейс
САЙТ С ЗАПИСЬЮ И МАГАЗИНОМ
Сайт барбершопа M19
M19 Barbershop, центр Ташкента
✓ Онлайн-запись сразу попадает в Altegio
✓ Магазин и админ-панель, срок 2 месяца
Подробнее о проекте
razrabotkatashkent.uz/cases/m19
```

Стикер: `https://razrabotkatashkent.uz/cases/m19?utm_source=instagram&utm_medium=story&utm_campaign=cases&utm_content=cases-3`

### cases-4.jpg: O‘zbekiston Bolalar Tashkiloti

Наша часть здесь только публичный сайт, бэкенд и админ-панель делал другой подрядчик. Кадр говорит об этом прямо.

```text
[плашка] Кейс
ПОРТАЛ НА ТРЁХ ЯЗЫКАХ
Портал детской организации
O‘zbekiston Bolalar Tashkiloti
✓ Узбекский, русский и английский
✓ Наша часть: публичный сайт. Бэкенд делал другой подрядчик
Подробнее о проекте
razrabotkatashkent.uz/cases/bolalar-tashkiloti
```

Стикер: `https://razrabotkatashkent.uz/cases/bolalar-tashkiloti?utm_source=instagram&utm_medium=story&utm_campaign=cases&utm_content=cases-4`

### cases-5.jpg: CRM для юристов (клиент анонимный)

Название клиента не указано. Как и в посте ig-06, на мокапе в боковом меню видно название продукта «Legat», а в адресе кейса есть slug `legat` (см. раздел «Нужно подтвердить»).

```text
[плашка] Кейс
ВЕБ-СИСТЕМА ДЛЯ ЮРИСТОВ
CRM для судебной работы по кредитам
Клиент: компания рассрочки, Ташкент
✓ Претензии через UzPost с E-IMZO
✓ 6 документов для суда автоматически
Подробнее о проекте
razrabotkatashkent.uz/cases/legat
```

Стикер: `https://razrabotkatashkent.uz/cases/legat?utm_source=instagram&utm_medium=story&utm_campaign=cases&utm_content=cases-5`

---

## 3. Процесс (`process`)

Название Highlight: **Процесс**. Обложка: `cover-process.jpg`. Порядок: process-1 … process-4. Все кадры синие.

Кадры повторяют четыре этапа со страницы `/process` (`app/data/services.ts`, `steps`), а не пятиэтапную схему «заявка → смета → договор → разработка → запуск и поддержка». Договор и фиксированная цена входят в этап 02, показы промежуточного результата в этап 03. Сопровождение на сайте обсуждается отдельным этапом, поэтому в кадрах оно не обещано.

### process-1.jpg

```text
[плашка] Процесс
КАК МЫ РАБОТАЕМ · ШАГ 1 ИЗ 4
01.
Разбираемся в задаче
Что должно измениться для бизнеса и кто будет пользоваться продуктом.
✓ Техническое задание не обязательно
✓ Достаточно описать бизнес, задачу и желаемый результат
razrabotkatashkent.uz/process
```

### process-2.jpg

```text
[плашка] Процесс
КАК МЫ РАБОТАЕМ · ШАГ 2 ИЗ 4
02.
Определяем первую версию
Сценарии, структура, состав работ и границы проекта.
✓ До разработки согласуем оценку и порядок работы
✓ Цена фиксируется в договоре до начала работ
razrabotkatashkent.uz/process
```

### process-3.jpg

```text
[плашка] Процесс
КАК МЫ РАБОТАЕМ · ШАГ 3 ИЗ 4
03.
Проектируем и разрабатываем
Сначала интерфейс и ключевой сценарий, затем реализация.
✓ Показываем промежуточный результат и обсуждаем решения
✓ С вами работает разработчик, без менеджеров-посредников
razrabotkatashkent.uz/process
```

### process-4.jpg

```text
[плашка] Процесс
КАК МЫ РАБОТАЕМ · ШАГ 4 ИЗ 4
04.
Запускаем и развиваем
Проверяем работу, передаём доступы и документацию.
✓ Дальнейшее сопровождение обсуждаем отдельным этапом
✓ Поддержка и доработки: от 0,5–1,5 млн сум в месяц
razrabotkatashkent.uz/process · Оценка бесплатно
```

Стикеры: на process-1…3 `https://razrabotkatashkent.uz/process?utm_source=instagram&utm_medium=story&utm_campaign=process&utm_content=process-N` (N = 1, 2, 3). На process-4 заявка: `https://razrabotkatashkent.uz/contact?utm_source=instagram&utm_medium=story&utm_campaign=process&utm_content=process-4`

---

## 4. Вопросы (`faq`)

Название Highlight: **Вопросы**. Обложка: `cover-faq.jpg`. Порядок: faq-1 … faq-4. Вопрос стоит в синем «облачке», ответ ниже на белом.

### faq-1.jpg

```text
[плашка] Вопросы
ЧАСТЫЙ ВОПРОС
Сколько стоит сайт?
Лендинг · от 3 млн сум
Корпоративный сайт · от 7 млн сум
Интернет-магазин · от 15 млн сум
Итог зависит от дизайна, языков и интеграций. Точную сумму называем после короткого обсуждения, бесплатно, и фиксируем в договоре.
Рассчитать свой проект
razrabotkatashkent.uz/calculator
```

Стикер: `https://razrabotkatashkent.uz/calculator?utm_source=instagram&utm_medium=story&utm_campaign=faq&utm_content=faq-1`

### faq-2.jpg

```text
[плашка] Вопросы
ЧАСТЫЙ ВОПРОС
Сколько времени займёт разработка?
Лендинг · 1–2 нед.
Корпоративный сайт · 3–5 нед.
Интернет-магазин · 1,5–2,5 мес.
Мобильное приложение · 2–4 мес.
Срок зависит и от того, как быстро готовы тексты и фото. Срочный режим: на 30% быстрее и на 30% дороже.
Все цены и сроки
razrabotkatashkent.uz/prices
```

Стикер: `https://razrabotkatashkent.uz/prices?utm_source=instagram&utm_medium=story&utm_campaign=faq&utm_content=faq-2`

### faq-3.jpg

```text
[плашка] Вопросы
ЧАСТЫЙ ВОПРОС
Telegram-бот или мобильное приложение?
Бот или Mini App · от 8 млн сум, 2–5 нед.
Приложение iOS и Android · от 40 млн сум, 2–4 мес.
Боту не нужна установка. Приложение оправдано, когда клиенты возвращаются регулярно и нужны уведомления и функции телефона.
Сравнить варианты в калькуляторе
razrabotkatashkent.uz/calculator
```

Стикер: `https://razrabotkatashkent.uz/calculator?utm_source=instagram&utm_medium=story&utm_campaign=faq&utm_content=faq-3`

### faq-4.jpg

```text
[плашка] Вопросы
ЧАСТЫЙ ВОПРОС
Сделаете сайт на двух языках?
Русский + узбекский · +20% к цене
Плюс английский · +35% к цене
Вторая версия добавляет к сроку около недели. Пример: портал Bolalar Tashkiloti на узбекском, русском и английском.
Пример на трёх языках
razrabotkatashkent.uz/cases/bolalar-tashkiloti
```

Стикер: `https://razrabotkatashkent.uz/cases/bolalar-tashkiloti?utm_source=instagram&utm_medium=story&utm_campaign=faq&utm_content=faq-4`

---

## 5. Контакты (`contacts`)

Название Highlight: **Контакты**. Обложка: `cover-contacts.jpg`. Порядок: contacts-1, contacts-1-uz. Оба кадра синие.

### contacts-1.jpg

```text
[плашка] Контакты
ОБСУДИМ ВАШ ПРОЕКТ
Давайте начнём с разговора.
Даже если пока есть только идея.
Телефон · +998 90 515 55 65
Telegram · @shohrux_0626
Telegram-канал · t.me/razrabotkatashkent
Сайт · razrabotkatashkent.uz
Часы · Ежедневно 9:00–20:00
ООО «LEADVEX AI» · ТЗ не обязательно
```

Стикер: `https://razrabotkatashkent.uz/contact?utm_source=instagram&utm_medium=story&utm_campaign=contacts&utm_content=contacts-1`. Можно вместо него поставить ссылку `https://t.me/shohrux_0626`, если заявки удобнее принимать в Telegram.

### contacts-1-uz.jpg

```text
[plashka] Kontaktlar
LOYIHANGIZNI MUHOKAMA QILAMIZ
Keling, suhbatdan boshlaymiz.
Hozircha faqat g‘oyangiz bo‘lsa ham.
Telefon · +998 90 515 55 65
Telegram · @shohrux_0626
Telegram-kanal · t.me/razrabotkatashkent
Sayt · razrabotkatashkent.uz/uz
Ish vaqti · Har kuni 9:00–20:00
«LEADVEX AI» MChJ · Texnik topshiriq shart emas
```

Стикер: `https://razrabotkatashkent.uz/uz/contact?utm_source=instagram&utm_medium=story&utm_campaign=contacts&utm_content=contacts-1-uz`

---

## Как создать «Актуальное» в приложении Instagram

API Meta умеет публиковать истории, но не ставит стикер-ссылку и не создаёт Highlights. Поэтому этот пакет публикуется вручную с телефона.

### Подготовка

1. Перенесите `public/social/stories/*.jpg` на телефон без сжатия: AirDrop, кабель или Telegram «Избранное», **отправка файлом**, а не фото.
2. Проверьте, что архив историй включён: Профиль → ☰ → «Архив» → ⋯ → «Настройки» → «Сохранять истории в архив». Без архива история пропадёт через 24 часа, и добавить её в «Актуальное» позже не получится.

### Публикация одной истории со ссылкой

1. На главной: «+» → «История» → выберите кадр из галереи.
2. Нажмите значок стикеров → «Ссылка» → вставьте URL из этого файла → при желании «Настроить текст стикера» (например «Все цены», «Калькулятор», «Подробнее», «Написать»).
3. Поставьте стикер в свободное место под строкой с адресом сайта, не поверх текста. Цвет стикера переключается нажатием на него, белый или синий подходят к обоим фонам.
4. «Ваша история» → опубликовать.
5. Кадры одного Highlight публикуйте по порядку из этого файла: Instagram показывает истории внутри Highlight в порядке публикации.

### Создание Highlight

Создавайте Highlights в обратном порядке: Контакты → Вопросы → Процесс → Кейсы → Цены.

1. Опубликуйте все кадры этого Highlight (например contacts-1 и contacts-1-uz).
2. Профиль → кружок «+ Новое» под описанием → отметьте истории этого Highlight → «Далее».
3. «Изменить обложку» → значок галереи → выберите `cover-<key>.jpg` → проверьте, что иконка в центре круга → «Готово».
4. Название: Цены / Кейсы / Процесс / Вопросы / Контакты → «Добавить».
5. Повторите для следующего Highlight.

Добавить историю в существующий Highlight: откройте историю (или её в архиве) → «Выделить» (сердце внизу) → выберите Highlight. Поменять обложку или убрать кадр: долгое нажатие на кружок Highlight → «Редактировать актуальное».

После обновления цен на сайте: опубликуйте новые кадры, добавьте их в «Цены», а старые уберите через «Редактировать актуальное».

## Нужно подтвердить владельцу

1. **Кейс Legat.** Адрес `razrabotkatashkent.uz/cases/legat` и мокап (в меню видно «Legat») показывают название продукта, как и в посте ig-06. Название компании-клиента нигде не указано. Если и название продукта светить нельзя, замените ссылку на `/cases` и перерисуйте cases-5 с другим мокапом.
2. **Поддержка от 0,5–1,5 млн сум в месяц** (process-4) взята со страницы `/prices` (блок «Дополнительные расходы»). Подтвердите, что сумма актуальна.
3. **Процесс в 4 шага, как на сайте**, а не в 5 шагов из задания. Отдельного этапа «поддержка» нет: сайт говорит, что сопровождение обсуждается отдельно.
4. **faq-2:** фраза «срок зависит и от того, как быстро готовы тексты и фото» взята из согласованного поста ig-07, на страницах сайта её нет.
5. **Мокап M19** показывает баннер «−20% скидка» с сайта барбершопа. Это акция самого клиента на его сайте, а не наше предложение.
6. **Узбекские кадры** сделаны только для «Цен» и «Контактов». Кейсы, процесс и вопросы есть только на русском. Если узбекоязычных подписчиков окажется заметно больше, их можно перевести тем же шаблоном.
