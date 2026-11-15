import { handleGithubEvent, prBotConfig, verifyGithubSignature } from '../../lib/pr-bot.mjs';
// Webhook GitHub (события pull_request) → уведомление владельцу в Telegram.
export default defineEventHandler(async event => {
  const cfg = prBotConfig();
  if (!cfg.githubSecret) throw createError({ statusCode: 404 });
  const raw = await readRawBody(event);
  if (!raw || Buffer.byteLength(raw) > 1_000_000)
    throw createError({ statusCode: 413, statusMessage: 'Too large' });
  if (!verifyGithubSignature(raw, getHeader(event, 'x-hub-signature-256'), cfg.githubSecret))
    throw createError({ statusCode: 401, statusMessage: 'Bad signature' });
  const name = getHeader(event, 'x-github-event') || '';
  if (name === 'ping') return { ok: true };
  try {
    return await handleGithubEvent(name, JSON.parse(raw));
  } catch (e) {
    console.error(`PR bot (github): ${e instanceof Error ? e.message : 'unknown error'}`);
    return { status: 'failed' };
  }
});
