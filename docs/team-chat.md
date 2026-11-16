# Командный чат в Telegram

Группа, где владелец пишет как **CEO**, а шесть ролей-ботов отвечают, обсуждают между собой и заводят задачи.

| Роль | id в чате | Переменная с токеном |
| --- | --- | --- |
| Руководитель проектов | `@pm` | `TEAM_BOT_PM` |
| Маркетолог | `@marketer` | `TEAM_BOT_MARKETER` |
| SMM-специалист | `@smm` | `TEAM_BOT_SMM` |
| SEO-специалист | `@seo` | `TEAM_BOT_SEO` |
| Разработчик | `@developer` | `TEAM_BOT_DEVELOPER` |
| Финансист | `@finance` | `TEAM_BOT_FINANCE` |

## Как это работает

- Telegram не показывает ботам сообщения других ботов, поэтому разговор ведёт сервер. Сообщение CEO принимает бот `pm` (webhook `/api/team/webhook`), координатор (Claude) выбирает 1–3 роли, сервер отвечает от имени их ботов.
- Роли зовут друг друга через `@id` в тексте. Не больше `TEAM_MAX_BOT_TURNS` (по умолчанию 4) реплик ботов на одно сообщение CEO.
- Обратиться к роли напрямую: `@seo что по индексации?`. Статус и расход за день: `/status`.
- Если CEO ставит задачу («задача: …», «делаем»), координатор заводит GitHub Issue с меткой `team-task`; ежедневный облачный цикл команды берёт такие задачи в работу и открывает PR.
- Лимит: `TEAM_DAILY_MESSAGES` сообщений CEO в день (по умолчанию 50). Модель: через OpenRouter (`OPENROUTER_API_KEY`, по умолчанию `anthropic/claude-opus-5.5`) или напрямую через Anthropic API (`ANTHROPIC_API_KEY`, `claude-opus-5-5`); сменить — `TEAM_MODEL`, уровень усилий — `TEAM_EFFORT` (по умолчанию `low`).
- Если у роли ещё нет своего бота, она пишет через бота PM с подписью роли.
- Правила команды те же, что в `docs/team.md`: реальные факты, публикации и траты — только после «да» CEO.

## Настройка

1. **Боты.** В @BotFather создайте 6 ботов (`/newbot`), например «Razrabotka PM», «Razrabotka Маркетолог» и т. д. Для бота PM: `/setprivacy` → выбрать бота → **Disable** (иначе он не увидит ваши сообщения в группе).
2. **Группа.** Создайте группу, добавьте всех шестерых ботов, напишите в ней любое сообщение.
3. **Ключ модели.** На openrouter.ai → Keys создайте ключ и задайте у него лимит расходов (или ключ Anthropic на platform.claude.com).
4. **Переменные в Railway:** `OPENROUTER_API_KEY` (или `ANTHROPIC_API_KEY`), `TEAM_BOT_*` (6 токенов), `TEAM_WEBHOOK_SECRET` (случайная строка, например `openssl rand -hex 24`).
5. **id группы и ваш id:** `railway run npm run team -- discover` → задать `TEAM_CHAT_ID` и `TEAM_OWNER_ID`.
6. **Проверка и запуск:** `railway run npm run team -- check`, затем после перезапуска сервиса `railway run npm run team -- set-webhook`.
7. **Задачи в GitHub:** токену `GITHUB_TOKEN` нужно право **Issues: Read and write**.
