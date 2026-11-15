import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { openStore } from '../server/lib/store.mjs';
import {
  QUEUE_NETWORKS,
  STORY,
  TOKEN_KINDS,
  graphRequest,
  instagramCaption,
  metaConfig,
  postKey,
  resolvePageToken,
  scrub,
  validatePosts,
  withToken
} from '../server/lib/meta-social.mjs';
import { instagramPosts, facebookPosts, instagramStories } from '../shared/social-posts.mjs';

const ALIASES = {
  ig: 'instagram',
  instagram: 'instagram',
  fb: 'facebook',
  facebook: 'facebook',
  story: STORY,
  stories: STORY,
  instagram_story: STORY
};
const NETS = '<instagram|story|facebook>';
const USAGE = `Usage: npm run meta -- status | retry ${NETS} <post-id> | confirm ${NETS} <post-id> | whoami`;
const queues = { instagram: instagramPosts, [STORY]: instagramStories, facebook: facebookPosts };
const [cmd, net, id] = process.argv.slice(2);
const network = ALIASES[String(net || '').toLowerCase()];

async function whoami() {
  const cfg = metaConfig();
  if (!cfg.token || !cfg.pageId) throw new Error('Set META_PAGE_ACCESS_TOKEN and META_PAGE_ID.');
  let auth = cfg;
  try {
    // Токен системного пользователя → токен страницы; токен страницы используется как есть.
    const resolved = await resolvePageToken(cfg, fetch, 'access_token,id,name');
    auth = withToken(cfg, resolved.token);
    const page = await graphRequest(auth, 'GET', cfg.pageId, {
      fields: 'id,name,instagram_business_account{id,username}'
    });
    const ig = page.instagram_business_account;
    const out = {
      graphVersion: cfg.version,
      token: TOKEN_KINDS[resolved.kind],
      page: { id: page.id, name: page.name },
      instagram: ig ? { id: ig.id, username: ig.username ?? null } : null,
      autopost: {
        enabled: cfg.enabled,
        reason: cfg.reason,
        networks: cfg.networks,
        stories: cfg.stories
      }
    };
    if (cfg.igUserId && ig && cfg.igUserId !== ig.id)
      out.warning = `META_IG_USER_ID=${cfg.igUserId} differs from the Page's linked account`;
    const igId = cfg.igUserId || ig?.id;
    if (igId) {
      try {
        const limit = await graphRequest(auth, 'GET', `${igId}/content_publishing_limit`, {
          fields: 'quota_usage,config'
        });
        out.publishingLimit = limit.data?.[0] ?? null;
      } catch (e) {
        out.publishingLimit = `unavailable: ${e.message}`;
      }
    }
    console.log(JSON.stringify(out, null, 2));
  } catch (e) {
    throw new Error(scrub(e?.message || String(e), cfg.token, auth.token));
  }
}

const db = openStore(process.env.CONTENT_DB || resolve('.data/content.sqlite'));
try {
  if (cmd === 'status') {
    const cfg = metaConfig();
    const records = new Map(db.metaPosts().map(r => [postKey(r.network, r.post_id), r]));
    // В образе Railway исходной public/ нет, статика лежит в .output/public.
    const exists = p => ['public', '.output/public'].some(dir => existsSync(join(dir, p)));
    const out = {
      config: cfg,
      issues: QUEUE_NETWORKS.flatMap(n => validatePosts(queues[n], n, { exists })),
      posts: Object.fromEntries(
        QUEUE_NETWORKS.map(n => [
          n,
          queues[n].map(p => {
            const r = records.get(postKey(n, p.id));
            return {
              id: p.id,
              publishAt: p.publishAt,
              approved: p.approved,
              ...(n === STORY
                ? { image: p.image }
                : { chars: n === 'instagram' ? instagramCaption(p).length : p.message.length }),
              status: r ? r.status : 'pending',
              ...(r?.attempts ? { attempts: r.attempts } : {}),
              ...(r?.container_id ? { container: r.container_id } : {}),
              ...(r?.media_id ? { mediaId: r.media_id } : {}),
              ...(r?.published_at ? { publishedAt: r.published_at } : {}),
              ...(r?.next_attempt_at ? { nextAttemptAt: r.next_attempt_at } : {}),
              ...(r?.error ? { error: r.error } : {})
            };
          })
        ])
      )
    };
    console.log(JSON.stringify(out, null, 2));
  } else if (cmd === 'retry' && network && id) {
    console.log(
      `Cleared ${db.retryMetaPost(network, id)} failed/uncertain record(s) for ${network} ${id}.`
    );
  } else if (cmd === 'confirm' && network && id) {
    console.log(
      `Marked ${db.confirmMetaPost(network, id)} uncertain record(s) of ${network} ${id} as published.`
    );
  } else if (cmd === 'whoami') {
    await whoami();
  } else {
    console.log(USAGE);
    if (cmd) process.exitCode = 1;
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  db.close();
}
