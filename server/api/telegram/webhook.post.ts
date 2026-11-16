import { handleTelegramUpdate, prBotConfig, safeEqual } from '../../lib/pr-bot.mjs';
// Webhook бота заявок: кнопки и ответы «давай» на сообщения о PR.
export default defineEventHandler(async event => {
  const cfg = prBotConfig();
  if (!cfg.telegramSecret) throw createError({ statusCode: 404 });
  if (!safeEqual(getHeader(event, 'x-telegram-bot-api-secret-token') || '', cfg.telegramSecret))
    throw createError({ statusCode: 401 });
  const raw = await readRawBody(event);
  if (!raw || Buffer.byteLength(raw) > 200_000) return { ok: true };
  try {
    await handleTelegramUpdate(JSON.parse(raw));
  } catch (e) {
    console.error(`PR bot (telegram): ${e instanceof Error ? e.message : 'unknown error'}`);
  }
  // Telegram всегда получает 200, иначе будет повторять одно и то же обновление.
  return { ok: true };
});
