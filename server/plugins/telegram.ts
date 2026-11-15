import { telegramConfig, telegramTick, validatePosts } from '../lib/telegram.mjs';
import { telegramPosts } from '#shared/telegram-posts.mjs';
// Автопостинг в Telegram-канал. Без валидных настроек плагин ничего не делает (см. deploy/railway.md).
export default defineNitroPlugin(nitro => {
  const cfg = telegramConfig();
  if (!cfg.enabled) return;
  const issues = validatePosts(telegramPosts);
  if (issues.length) {
    console.error(`Telegram autopost disabled, invalid queue: ${issues.join('; ')}`);
    return;
  }
  const approved = telegramPosts.filter(p => p.approved).length;
  console.log(
    `Telegram autopost enabled for ${cfg.channel}: ${approved} of ${telegramPosts.length} posts approved.`
  );
  let running = false;
  async function tick() {
    if (running) return;
    running = true;
    try {
      const r = await telegramTick(storage(), telegramPosts, cfg);
      if (r.status === 'sent')
        console.log(
          `Telegram autopost sent ${r.postId} ${r.lang}#${r.seq} (message ${r.messageId}).`
        );
      else if (r.status === 'failed' || r.status === 'gave_up' || r.status === 'uncertain')
        console.error(`Telegram autopost ${r.status} ${r.postId} ${r.lang}#${r.seq}: ${r.error}`);
    } catch {
      console.error('Telegram autopost worker failed; inspect database and configuration.');
    } finally {
      running = false;
    }
  }
  const timer = setInterval(tick, 60000);
  timer.unref();
  void tick();
  nitro.hooks.hook('close', () => clearInterval(timer));
});
