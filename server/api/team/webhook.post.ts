import { createTeamLlm, handleTeamUpdate, teamConfig } from '../../lib/team-chat.mjs';
import { safeEqual } from '../../lib/pr-bot.mjs';
// Webhook бота pm командного чата. Отвечает сразу; разговор ролей идёт в фоне
// (ответ Claude дольше таймаута Telegram, иначе Telegram будет повторять обновление).
let llm: ReturnType<typeof createTeamLlm> | undefined;
let queue: Promise<unknown> = Promise.resolve();
export default defineEventHandler(async event => {
  const cfg = teamConfig();
  if (!cfg.enabled) throw createError({ statusCode: 404 });
  if (!safeEqual(getHeader(event, 'x-telegram-bot-api-secret-token') || '', cfg.secret))
    throw createError({ statusCode: 401 });
  const raw = await readRawBody(event);
  if (!raw || Buffer.byteLength(raw) > 200_000) return { ok: true };
  let update: unknown;
  try {
    update = JSON.parse(raw);
  } catch {
    return { ok: true };
  }
  llm ||= createTeamLlm(cfg);
  // Сообщения обрабатываются по одному, чтобы роли видели ответы друг друга по порядку.
  queue = queue
    .then(() => handleTeamUpdate(update, { store: storage(), cfg, llm: llm! }))
    .catch(e => console.error(`Team chat: ${e instanceof Error ? e.message : 'unknown error'}`));
  return { ok: true };
});
