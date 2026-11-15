import { resolve } from 'node:path';
import { openStore } from '../server/lib/store.mjs';
import {
  telegramConfig,
  validatePosts,
  buildMessages,
  sendKey,
  LANGS
} from '../server/lib/telegram.mjs';
import { telegramPosts } from '../shared/telegram-posts.mjs';
const db = openStore(process.env.CONTENT_DB || resolve('.data/content.sqlite'));
try {
  const [cmd, id, lang] = process.argv.slice(2);
  if (cmd === 'status') {
    const cfg = telegramConfig();
    const records = new Map(db.telegramSends().map(r => [sendKey(r.post_id, r.lang, r.seq), r]));
    const posts = telegramPosts.map(p => ({
      id: p.id,
      publishAt: p.publishAt,
      approved: p.approved,
      parts: LANGS.flatMap(l =>
        buildMessages(p, l, cfg.siteUrl || 'https://example.invalid').map((_, seq) => {
          const r = records.get(sendKey(p.id, l, seq));
          return `${l}#${seq}: ${r ? r.status : 'pending'}${r?.sent_at ? ` ${r.sent_at}` : ''}${r?.error ? ` (${r.error})` : ''}`;
        })
      )
    }));
    console.log(
      JSON.stringify({ config: cfg, issues: validatePosts(telegramPosts), posts }, null, 2)
    );
  } else if (cmd === 'retry' && id && (!lang || LANGS.includes(lang))) {
    console.log(`Cleared ${db.retryTelegramPost(id, lang)} failed/uncertain record(s) for ${id}.`);
  } else if (cmd === 'confirm' && id && LANGS.includes(lang)) {
    console.log(
      `Marked ${db.confirmTelegramPost(id, lang)} uncertain record(s) of ${id} ${lang} as sent.`
    );
  } else {
    console.log(
      'Usage: npm run telegram -- status | retry <post-id> [ru|uz] | confirm <post-id> <ru|uz>'
    );
    if (cmd) process.exitCode = 1;
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  db.close();
}
