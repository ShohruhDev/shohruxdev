import { resolve } from 'node:path';
import { openStore } from '../server/lib/store.mjs';
import { indexNowOnPublish } from '../server/lib/indexnow.mjs';
import { seedTopics } from '../server/lib/topics.mjs';
import { runGeneration, generationConfig } from '../server/lib/pipeline.mjs';
const db = openStore(process.env.CONTENT_DB || resolve('.data/content.sqlite'), {
  onPublish: indexNowOnPublish()
});
try {
  const cmd = process.argv[2];
  if (cmd === 'seed') {
    seedTopics(db);
    console.log('Business-niche topics added. Existing topics preserved.');
  } else if (cmd === 'tick') {
    const published = db.publishDue();
    const result = await runGeneration(db);
    console.log(JSON.stringify({ published, result }));
  } else if (cmd === 'status') {
    const s = db.editorialState();
    console.log(
      JSON.stringify(
        {
          config: generationConfig(),
          heartbeat: s.heartbeat,
          topics: s.topics.length,
          drafts: s.posts.filter(p => p.status === 'draft').length,
          runs: s.runs
        },
        null,
        2
      )
    );
  } else {
    console.log('Usage: npm run editorial -- seed | tick | status');
    if (cmd) process.exitCode = 1;
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  db.close();
}
