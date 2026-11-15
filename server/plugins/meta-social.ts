import { metaConfig, metaTick, validatePosts } from '../lib/meta-social.mjs';
import { instagramPosts, facebookPosts } from '#shared/social-posts.mjs';
// Автопостинг в Instagram и на Facebook-страницу. Без валидных настроек плагин ничего не делает
// (см. deploy/railway.md, раздел Meta).
export default defineNitroPlugin(nitro => {
  const cfg = metaConfig();
  if (!cfg.enabled) return;
  const queues = { instagram: instagramPosts, facebook: facebookPosts };
  const issues = [
    ...validatePosts(instagramPosts, 'instagram'),
    ...validatePosts(facebookPosts, 'facebook')
  ];
  if (issues.length) {
    console.error(`Meta autopost disabled, invalid queue: ${issues.join('; ')}`);
    return;
  }
  const summary = cfg.networks
    .map(n => {
      const q = queues[n as keyof typeof queues];
      return `${n} ${q.filter(p => p.approved).length} of ${q.length}`;
    })
    .join(', ');
  console.log(`Meta autopost enabled for page ${cfg.pageId}: ${summary} posts approved.`);
  // Живёт между тиками только в памяти: токен страницы и IG User ID, найденные по странице.
  const cache = {};
  let running = false;
  async function tick() {
    if (running) return;
    running = true;
    try {
      const r = await metaTick(storage(), queues, cfg, { cache });
      const at = 'postId' in r ? ` ${r.network} ${r.postId}` : '';
      if (r.status === 'published')
        console.log(`Meta autopost published${at} (id ${r.mediaId ?? 'unknown'}).`);
      else if (r.status === 'token_resolved')
        console.log(`Meta autopost: ${r.kind} (kept in memory only).`);
      else if (r.status === 'resolved')
        console.log(`Meta autopost: Instagram account ${r.igUserId} found via the Page.`);
      else if (
        ['failed', 'gave_up', 'uncertain', 'ig_unavailable', 'token_unavailable'].includes(r.status)
      )
        console.error(`Meta autopost ${r.status}${at}: ${r.error}`);
    } catch {
      console.error('Meta autopost worker failed; inspect database and configuration.');
    } finally {
      running = false;
    }
  }
  const timer = setInterval(tick, 60000);
  timer.unref();
  void tick();
  nitro.hooks.hook('close', () => clearInterval(timer));
});
