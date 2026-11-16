// Настройка командного чата (запускать с переменными production: railway run npm run team -- <команда>)
//   discover     — id группы и ваш Telegram id из последних сообщений боту pm (до подключения webhook)
//   set-webhook  — подключить webhook бота pm к /api/team/webhook
//   check        — какие боты ролей заданы и отвечают (имена ботов, без токенов)
import { teamConfig } from '../server/lib/team-chat.mjs';
import { TEAM_ROLES } from '../shared/team-roles.mjs';
const cfg = teamConfig();
const site = (process.env.SITE_URL || '').replace(/\/$/, '');
const tg = async (token, method, payload) =>
  (
    await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    })
  ).json();
const [cmd] = process.argv.slice(2);
if (cmd === 'check') {
  for (const r of TEAM_ROLES) {
    const token = cfg.bots[r.id];
    if (!token) {
      console.log(`${r.id}: нет ${r.env}`);
      continue;
    }
    const me = await tg(token, 'getMe');
    console.log(`${r.id}: ${me.ok ? '@' + me.result.username : 'токен не работает'}`);
  }
  console.log(
    `Модель: ${cfg.provider} / ${cfg.model}, ключ ${cfg.apiKey.length >= 20 ? 'задан' : 'нет'}; TEAM_CHAT_ID: ${cfg.chatId || 'нет'}; TEAM_OWNER_ID: ${cfg.ownerId ? 'задан' : 'нет'}; TEAM_WEBHOOK_SECRET: ${cfg.secret ? 'задан' : 'нет'}`
  );
} else if (cmd === 'discover') {
  if (!cfg.bots.pm) throw Error('Нет TEAM_BOT_PM');
  const r = await tg(cfg.bots.pm, 'getUpdates', { limit: 50 });
  if (!r.ok) throw Error(r.description);
  const seen = new Set();
  for (const u of r.result) {
    const m = u.message || u.my_chat_member;
    if (!m?.chat) continue;
    const line = `чат ${m.chat.id} (${m.chat.type}${m.chat.title ? `, «${m.chat.title}»` : ''}) — от ${m.from?.id}${m.from?.username ? ` @${m.from.username}` : ''}`;
    if (!seen.has(line)) (console.log(line), seen.add(line));
  }
  if (!seen.size) console.log('Сообщений нет: напишите что-нибудь в группе и повторите.');
} else if (cmd === 'set-webhook') {
  if (!cfg.bots.pm || !cfg.secret || !site.startsWith('https://'))
    throw Error('Нужны TEAM_BOT_PM, TEAM_WEBHOOK_SECRET и SITE_URL с https');
  const r = await tg(cfg.bots.pm, 'setWebhook', {
    url: `${site}/api/team/webhook`,
    secret_token: cfg.secret,
    allowed_updates: ['message'],
    drop_pending_updates: true
  });
  console.log(r.ok ? 'Webhook командного чата подключён' : `Ошибка: ${r.description}`);
} else {
  console.log('Команды: discover, set-webhook, check');
}
