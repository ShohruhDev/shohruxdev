---
name: webapp-testing
description: "QA сайта в браузере: проверка страниц, формы заявки, RU/UZ, скриншоты, консоль. Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs."
license: Complete terms in LICENSE.txt
---

## Применение в Razrabotka Tashkent (читать первым)

Скилл из открытой библиотеки (источник — `SOURCE.md`). Отвечай по-русски, UZ-тексты — латиницей. Факты, цены, кейсы и решения владельца — из `docs/knowledge-base.md`, `shared/*.mjs`, `BRAND.md`; они главнее примеров ниже. Ссылки на скиллы, которых нет в `.claude/skills/`, пропускай.

- **Playwright запускается через uv** (Python у нас без глобальных пакетов): `uv run --with playwright python script.py`. Браузер: `uv run --with playwright python -m playwright install chromium` (локально уже установлен). В облачной среде, если uv нет: `pip install playwright && python -m playwright install --with-deps chromium`.
- Сервер — **продакшен-сборка** (dev-режим сейчас отдаёт 500: Nitro не находит `/shared/team-roles.mjs`). Сначала `npm run build`, затем через `scripts/with_server.py` с отдельной тестовой базой:
  `CONTENT_DB=/tmp/qa.sqlite HOST=127.0.0.1 PORT=3005 uv run --with playwright python .claude/skills/webapp-testing/scripts/with_server.py --server "node .output/server/index.mjs" --port 3005 -- uv run --with playwright python check.py`
- Проверено 2026-11-16: `/`, `/uz`, `/prices`, `/calculator`, `/contact`, `/uz/contact` — 200, верный `lang`, hreflang, без кириллицы на UZ, 0 ошибок консоли, без горизонтальной прокрутки на 375px.
- Что проверять — `.claude/agents/qa.md`: форма, калькулятор, RU↔UZ, SEO-теги, 375/768/десктоп. Production — только чтение, без тестовых заявок.

---

# Web Application Testing

To test local web applications, write native Python Playwright scripts.

**Helper Scripts Available**:
- `scripts/with_server.py` - Manages server lifecycle (supports multiple servers)

**Always run scripts with `--help` first** to see usage. DO NOT read the source until you try running the script first and find that a customized solution is abslutely necessary. These scripts can be very large and thus pollute your context window. They exist to be called directly as black-box scripts rather than ingested into your context window.

## Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Run: python scripts/with_server.py --help
        │        Then use the helper + write simplified Playwright script
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

## Example: Using with_server.py

To start a server, run `--help` first, then use the helper:

**Single server:**
```bash
python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py
```

**Multiple servers (e.g., backend + frontend):**
```bash
python scripts/with_server.py \
  --server "cd backend && python server.py" --port 3000 \
  --server "cd frontend && npm run dev" --port 5173 \
  -- python your_automation.py
```

To create an automation script, include only Playwright logic (servers are managed automatically):
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True) # Always launch chromium in headless mode
    page = browser.new_page()
    page.goto('http://localhost:5173') # Server already running and ready
    page.wait_for_load_state('networkidle') # CRITICAL: Wait for JS to execute
    # ... your automation logic
    browser.close()
```

## Reconnaissance-Then-Action Pattern

1. **Inspect rendered DOM**:
   ```python
   page.screenshot(path='/tmp/inspect.png', full_page=True)
   content = page.content()
   page.locator('button').all()
   ```

2. **Identify selectors** from inspection results

3. **Execute actions** using discovered selectors

## Common Pitfall

❌ **Don't** inspect the DOM before waiting for `networkidle` on dynamic apps
✅ **Do** wait for `page.wait_for_load_state('networkidle')` before inspection

## Best Practices

- **Use bundled scripts as black boxes** - To accomplish a task, consider whether one of the scripts available in `scripts/` can help. These scripts handle common, complex workflows reliably without cluttering the context window. Use `--help` to see usage, then invoke directly. 
- Use `sync_playwright()` for synchronous scripts
- Always close the browser when done
- Use descriptive selectors: `text=`, `role=`, CSS selectors, or IDs
- Add appropriate waits: `page.wait_for_selector()` or `page.wait_for_timeout()`

## Reference Files

- **examples/** - Examples showing common patterns:
  - `element_discovery.py` - Discovering buttons, links, and inputs on a page
  - `static_html_automation.py` - Using file:// URLs for local HTML
  - `console_logging.py` - Capturing console logs during automation