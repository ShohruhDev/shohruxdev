// npm run pr-bot -- set-webhook   — подключить webhook бота заявок к /api/telegram/webhook
// npm run pr-bot -- webhook-info  — статус webhook (без секретов)
// Запускать с переменными production, например: railway run npm run pr-bot -- set-webhook
import { prBotConfig } from '../server/lib/pr-bot.mjs';
const cfg = prBotConfig();
const site = (process.env.SITE_URL || '').replace(/\/$/, '');
const call = async (method, payload) => {
  const r = await fetch(`https://api.telegram.org/bot${cfg.botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  });
  return r.json();
};
const [cmd] = process.argv.slice(2);
if (!cfg.botToken) throw Error('Нет TELEGRAM_BOT_TOKEN');
if (cmd === 'set-webhook') {
  if (!cfg.telegramSecret || !site.startsWith('https://'))
    throw Error('Нужны TELEGRAM_WEBHOOK_SECRET и SITE_URL с https');
  const r = await call('setWebhook', {
    url: `${site}/api/telegram/webhook`,
    secret_token: cfg.telegramSecret,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true
  });
  console.log(r.ok ? 'Webhook подключён' : `Ошибка: ${r.description}`);
} else if (cmd === 'webhook-info') {
  const { result: i = {} } = await call('getWebhookInfo');
  console.log(
    JSON.stringify(
      { url: i.url, pending: i.pending_update_count, lastError: i.last_error_message },
      null,
      2
    )
  );
} else {
  console.log('Команды: set-webhook, webhook-info');
}
