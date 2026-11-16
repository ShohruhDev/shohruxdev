---
name: Razrabotka Tashkent
description: Корпоративный стиль сайта и соцсетей студии Razrabotka Tashkent — белый фон, тёплые серые полосы, один синий акцент, Montserrat.
source: app/assets/corporate.css (источник истины; при расхождении прав CSS — исправьте этот файл)
updated: 2026-11-16
colors:
  background: "#ffffff"
  surface: "#f8f7f5"        # тёплые серые полосы, вторичные кнопки, футер
  card: "#ffffff"
  text: "#1f1f1f"           # заголовки
  body: "#3c3c3c"           # абзацы и списки
  muted: "#6b6b6b"          # подписи, лиды, мета
  line: "#e7e5e1"           # рамки и разделители
  accent: "#2457f5"         # единственный акцент: кнопки, ссылки, активные состояния
  accent-hover: "#1a44cf"
  accent-soft: "#eaf0ff"    # фон выбранного, подсказки
  accent-ink: "#22408f"     # текст на accent-soft
  input-line: "#d1d1d1"
  placeholder: "#a3a3a3"
  error: "#d93025"
  logo-gradient: ["#3A6BFF", "#1C44D6"]  # только внутри знака
  logo-dot: "#FF6B3D"                    # только точка в знаке, нигде больше
typography:
  family: "Montserrat, sans-serif"   # @fontsource/montserrat, веса 400/500/600/700
  h1: { size: "clamp(32px, 3.6vw, 48px)", weight: 400, line-height: 1.22 }
  h2: { size: "clamp(26px, 2.6vw, 38px)", weight: 600, line-height: 1.18 }
  h3: { size: "20–24px", weight: 600 }
  lede: { size: 17px, line-height: 1.6, color: muted }
  body: { size: 16px, line-height: 1.6, color: body }
  label: { size: 13px, weight: 600, letter-spacing: 0.04em, color: muted }
  nav: { size: 14px, weight: 500 }
  button: { size: 16px, weight: 600 }
  stat: { size: "clamp(30px, 3vw, 44px)", weight: 600 }
  letter-spacing: normal       # без трекинга и без uppercase в заголовках
rounded:
  card: 24px
  control: 8px                 # кнопки, поля, FAQ, иконки-кнопки
  pill: 999px                  # только фильтры журнала
  logo-mark: 18/64 от размера  # в SVG знака
spacing:
  container: "max 1328px, поля 56px (32px на мобильном)"
  section: 72px                # 48px на мобильном
  band: 64px
  card-padding: 32px           # 24px на мобильном
  grid-gap: 20px
breakpoints:
  tablet: 1100px
  mobile: 760px
  test-width: 375px
elevation:
  none: "по умолчанию карточки плоские, с рамкой line или на surface"
  hover: "0 12px 40px rgba(18, 21, 27, 0.08), рамка становится прозрачной"
components:
  button-primary: "bg accent, текст #fff, min-height 50px, padding 14px 29px, radius 8px, 16px/600, без тени; hover accent-hover"
  button-secondary: "bg surface, текст text; hover bg line"
  button-small: "min-height 42px, padding 10px 18px, 14px"
  icon-button: "42×42, radius 8px, bg surface; hover bg accent-soft, цвет accent"
  card: "bg card, рамка 1px line, radius 24px, padding 32px; hover — тень elevation.hover, заголовок accent"
  band-card: "bg surface (или card на surface-полосе), radius 24px, без рамки"
  cta-section: "bg accent, текст #fff, радиус 24px, padding 48px; кнопка белая с текстом accent"
  input: "подпись сверху 14px/500; поле без рамки, линия снизу 1px input-line; focus — линия accent; ошибка — error"
  checkbox-radio: "20×20, рамка 1.5px #b9b9b9; checked — accent"
  faq-item: "bg surface, radius 8px, padding 20px 24px, вопрос 18px/600"
  number-label: "номер услуги/шага: 14px/700, цвет accent"
  header: "76px (64 на мобильном), белый 92% + blur, нижняя линия line"
  footer: "bg surface, текст muted, соцсети — круги 44px с рамкой line, hover accent"
---

# Razrabotka Tashkent — дизайн-система

Токены выше — для машин. Ниже — как ими пользоваться. Код: `app/assets/corporate.css` (подключается последним и переопределяет старые темы `main.css` и `art-direction.css`). Логотип: `app/components/BrandLogo.vue`, `public/brand/mark.svg`.

## Обзор

Спокойный корпоративный стиль: много белого, тёплые серые полосы для ритма, скруглённые карточки и **один** синий акцент. Ориентир владельца — уровень friflex.com, но бренд свой: не копируем их логотип, фиолетовый, шрифт Proxima Nova, графику и тексты.

Ощущение: аккуратная студия, которая показывает цены и сроки открыто. Не «креативное агентство», не стартап-неон.

## Цвет

- Фон страницы белый. Секции чередуются с полосами `surface` (#f8f7f5) на всю ширину.
- `accent` (#2457f5) — кнопки, ссылки, номера, активные состояния, одна CTA-плашка на странице. Не используем как фон больших областей, кроме `cta-section` и одной `bento-accent`-карточки.
- `accent-soft` (#eaf0ff) — выбранная опция калькулятора, активный язык, подсказки.
- Иерархия текста: `text` для заголовков, `body` для абзацев, `muted` для подписей.
- Оранжевая точка `#FF6B3D` живёт только внутри логотипа. Других цветов (зелёный, фиолетовый, градиенты) в интерфейсе нет. Ошибки — `#d93025`.
- Контраст: accent на белом ≈ 5,6:1, muted на surface ≈ 5:1 — оба проходят WCAG AA. Белый текст на accent — тоже.

## Типографика

- Только Montserrat, веса 400/500/600/700.
- h1 — **400** (лёгкий крупный заголовок), h2/h3 — 600. Межбуквенный интервал обычный, без uppercase (исключение — подпись «TASHKENT» в логотипе).
- Лиды 17px, текст 16px, line-height 1.6. Ширина лида ≤ 600px.
- Подписи над блоками — обычный текст `label` (13px/600, muted), **не плашка**.

## Сетка и ритм

- Контейнер до 1328px, поля 56px; на мобильном 32px.
- Секции 72px по вертикали (48px на мобильном). Сетки карточек: 3 колонки → 2 (≤1100px) → 1 (≤760px), gap 20px.
- Главная: hero 2 колонки (текст + `cursor-sculpture` с синим радиальным свечением), на мобильном картинка сверху, 200px.

## Формы и глубина

- Карточки плоские: либо рамка `line` на белом, либо `surface` без рамки. Тень появляется только на hover.
- Радиусы: 24px для карточек и больших блоков, 8px для всего интерактивного. Pill (999px) — только фильтры журнала.
- Поля ввода — «линия снизу», подпись сверху, как в корпоративных формах.

## Компоненты

Описаны в `components` во frontmatter. Перед новым компонентом проверьте, нет ли похожего в `corporate.css` (`.service-card`, `.bento-card`, `.step-card`, `.journal-card`, `.service-row`, `.cta-section`, `.faq`).

## Логотип

- Знак: синий скруглённый квадрат (градиент #3A6BFF → #1C44D6), белая арка-«дом» с курсором внутри, оранжевая точка в правом нижнем углу. Файлы: `public/brand/mark.svg`, `public/brand/logo-512.png`, аватар соцсетей `public/social/brand/avatar-1080.png`.
- Словесная часть: **Razrabotka** (18px/700) над **TASHKENT** (10px/600, трекинг 0.34em, uppercase, muted).
- Знак не перекрашивать, не обводить, не класть на синий фон без белого поля вокруг. Минимальный размер 32px.

## Соцсети

- Лента 1080×1350, поле 72px, логотип сверху, `razrabotkatashkent.uz` внизу, ключевой текст в центральной зоне 1080×1080.
- Stories 1080×1920, сверху и снизу по 250px без текста.
- Заголовок 54–66px полужирный, текст 28–34px. Белый фон, акцент #2457f5, полосы #eaf0ff / #f8f7f5.
- Образцы: `public/social/brand/ig-01.jpg … ig-09.jpg`, подробности — `docs/social-kit-2026-11.md`.

## Изображения

- Скриншоты реальных проектов в рамке браузера или телефона. Без персональных данных на экранах.
- Люди — только реальные фото владельца. Никаких стоков, сгенерированных «офисов» и «команд».

## Можно и нельзя

**Можно**
- Белый + surface-полосы + один accent.
- Крупный лёгкий h1, короткий лид, одна главная кнопка и одна вторичная.
- Номера услуг и шагов цветом accent.

**Нельзя**
- Eyebrow-плашки и бейджи-«чипсы» над заголовками (владелец просил убрать — не возвращать).
- Эмодзи, декоративные стрелки, «акции», бейджи «№1/топ/хит».
- Новые акцентные цвета, градиенты в интерфейсе, тёмные темы публичного сайта.
- Uppercase и трекинг в заголовках, второй шрифт.
- Чужие бренд-ассеты (логотипы, шрифты, иллюстрации friflex и других).
