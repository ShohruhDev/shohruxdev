# Переезд на razrabotkatashkent.uz

Новый основной домен — `razrabotkatashkent.uz`, бренд — «Razrabotka Tashkent». Регистратор — Eskiz. Старый домен `shohruxdev.uz` полностью отключается, без редиректа (решение владельца, 14.11.2026).

## Уже готово в коде

- Бренд вынесен в `shared/brand.mjs`: название, альтернативное название «Разработка Ташкент», домен.
- Логотип «RT» в шапке и подвале, иконки (`favicon-32.png`, `apple-touch-icon.png`), логотип для Schema.org (`/brand/rt-logo-512.jpg`).
- Заголовки вкладок, `og:site_name`, RSS, разметка Schema.org и страница обработки данных используют новый бренд и домен.
- SEO-заголовки услуг, калькулятора и главной ориентированы на «разработка … в Ташкенте» (RU и UZ).
- Все ссылки, canonical, hreflang, sitemap, robots и RSS строятся из `SITE_URL`. Код под конкретный домен не привязан, домен меняется только переменными.
- `www.` автоматически перенаправляется 301 на домен без `www`.

## Когда Eskiz одобрит домен

Проверка, что домен активен: `dig +short NS razrabotkatashkent.uz` возвращает `ns1.eskiz.uz` и `ns2.eskiz.uz`.

1. **Railway → сервис `web` → Settings → Networking → Custom Domain**: добавить `razrabotkatashkent.uz` и `www.razrabotkatashkent.uz`, порт 3000. Railway покажет нужные DNS-записи (CNAME и TXT `_railway-verify`).
2. **Eskiz → DNS домена razrabotkatashkent.uz**: внести записи, которые показал Railway.
   - `www` — CNAME на адрес `*.up.railway.app` из Railway.
   - Корень домена — так же, как сейчас настроен `shohruxdev.uz`: A-запись на IP, который выдаёт Railway, либо ALIAS/CNAME, если Eskiz поддерживает его для корня.
   - TXT `_railway-verify` — значение из Railway.
3. Дождаться в Railway статуса домена «Active» и выпуска HTTPS-сертификата. Проверка: `curl -I https://razrabotkatashkent.uz`.
4. **Railway → Variables**: `SITE_URL=https://razrabotkatashkent.uz`. Остальные переменные не менять, `SITE_INDEXABLE=true` уже стоит на рабочем сайте.
5. Пересобрать сервис, потому что SITE_URL используется при сборке: `railway service redeploy --service web` или Redeploy в панели. Изменение переменной в Railway обычно само предлагает передеплой.
6. Проверить на новом домене:
   - `https://razrabotkatashkent.uz/` — в коде страницы `canonical` указывает на новый домен.
   - `/robots.txt` и `/sitemap.xml` — адреса на новом домене.
   - `/uz`, `/calculator`, `/journal`, `/contact`. Отправить тестовую заявку и удалить её в `/admin`.
   - `https://www.razrabotkatashkent.uz/` перенаправляет на домен без `www`.
   - Вход в `/admin` работает (cookie Secure требует HTTPS).
   - В Telegram-уведомлении о заявке ссылка ведёт на новый домен.

## Отключение shohruxdev.uz

Выполнять только после того, как новый домен проверен.

1. Railway → Custom Domain: удалить `shohruxdev.uz` и `www.shohruxdev.uz`.
2. Eskiz → DNS shohruxdev.uz: удалить A-запись корня, CNAME `www` и TXT `_railway-verify`.
3. Помнить: без редиректа поисковики потеряют накопленные позиции и ссылки на старые адреса перестанут открываться. Новый домен индексируется с нуля.

## Поиск и аналитика

1. **Google Search Console** и **Яндекс Вебмастер**: добавить `razrabotkatashkent.uz`, подтвердить владение (DNS TXT в Eskiz), отправить `https://razrabotkatashkent.uz/sitemap.xml`.
2. Старый сайт в этих сервисах удалить или оставить для наблюдения, как страницы выпадут из индекса.
3. **Яндекс Метрика**: в настройках счётчика заменить адрес сайта на новый домен (или создать новый счётчик и обновить `YANDEX_METRIKA_ID`). **GA4**: обновить URL потока данных.
4. Обновить ссылку на сайт в Telegram-профиле, соцсетях, Google/Яндекс картах и везде, где стоял shohruxdev.uz.
