import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore } from '../server/lib/store.mjs';
const dir = mkdtempSync(join(tmpdir(), 'public-worker-')),
  file = join(dir, 'db.sqlite'),
  base = 'http://127.0.0.1:3178';
const seed = openStore(file);
const p = {
  slug: 'worker-post',
  title: 'Рабочая статья',
  description: 'Проверка автоматического выпуска',
  category: 'Запуск',
  author: 'Burxonov Shohrux',
  content: [{ heading: 'Первый раздел', body: 'Текст материала.' }],
  sources: []
};
p.translations = {
  uz: {
    title: 'Ishlaydigan maqola',
    description: 'Avtomatik nashr sinovi',
    category: 'Ishga tushirish',
    content: [{ heading: 'Birinchi bo‘lim', body: 'Maqola matni.' }],
    sources: []
  }
};
seed.importDraft(p);
seed.approve(p.slug, '2020-01-01T09:00:00+05:00');
seed.importDraft({ ...p, slug: 'private-future' });
seed.approve('private-future', '2099-01-01T09:00:00+05:00');
seed.close();
const child = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: {
    ...process.env,
    CONTENT_DB: file,
    PORT: '3178',
    HOST: '127.0.0.1',
    CONTENT_AUTOMATION_ENABLED: 'true',
    ADMIN_LOCAL_PREVIEW: 'true',
    OPENAI_API_KEY: '',
    CONTENT_MODEL: ''
  },
  stdio: ['ignore', 'pipe', 'pipe']
});
try {
  await new Promise((res, rej) => {
    const timer = setTimeout(() => rej(Error('Server start timeout')), 15000);
    child.stdout.on('data', b => {
      if (b.toString().includes('Listening')) {
        clearTimeout(timer);
        res();
      }
    });
    child.once('exit', c => {
      clearTimeout(timer);
      rej(Error(`Server exited ${c}`));
    });
  });
  const r = await fetch(base + '/journal/worker-post');
  assert.equal(r.status, 200);
  assert.ok(!r.headers.get('x-robots-tag')?.includes('noindex'));
  const html = await r.text();
  assert.match(html, /Burxonov Shohrux/);
  assert.doesNotMatch(html, /name="robots" content="noindex/);
  assert.match(html, /https:\/\/qa\.web-mobile\.test\/journal\/worker-post/);
  assert.equal((await fetch(base + '/journal/private-future')).status, 404);
  assert.equal((await fetch(base + '/journal/site-or-app')).status, 404);
  const posts = await (await fetch(base + '/api/posts')).json();
  assert.equal(posts.length, 1);
  const feed = await (await fetch(base + '/feed.xml')).text();
  assert.match(feed, /worker-post/);
  assert.doesNotMatch(feed, /private-future|site-or-app/);
  const uz = await (await fetch(base + '/uz/journal/worker-post')).text();
  assert.match(uz, /<html[^>]*lang="uz"/);
  assert.match(uz, /Ishlaydigan maqola/);
  assert.match(await (await fetch(base + '/feed.xml?lang=uz')).text(), /Ishlaydigan maqola/);
  const sitemap = await (await fetch(base + '/sitemap.xml')).text();
  assert.match(sitemap, /<lastmod>/);
  assert.match(sitemap, /\/uz\/journal\/worker-post/);
  assert.match(sitemap, /worker-post/);
  assert.doesNotMatch(sitemap, /private-future|site-or-app|\/admin/);
  const robots = await (await fetch(base + '/robots.txt')).text();
  assert.match(robots, /User-agent: OAI-SearchBot/);
  assert.match(robots, /Disallow: \/admin/);
  const session = await (await fetch(base + '/api/admin/session')).json();
  assert.equal(session.local, false);
  assert.equal((await fetch(base + '/api/admin/state')).status, 401);
  const db = openStore(file);
  assert.ok(db.editorialState().heartbeat);
  assert.equal(db.publicPosts().length, 1);
  assert.equal(db.publishDue(), 0);
  assert.equal(db.editorialState().runs.length, 0);
  db.close();
  console.log(
    'PASS: production indexable SSR, canonical, private/future/demo exclusion, RSS, sitemap, OAI-SearchBot, local bypass denied, real worker publishes due once with heartbeat and no API key calls.'
  );
} finally {
  child.kill();
  if (child.exitCode === null) await new Promise(r => child.once('exit', r));
  rmSync(dir, { recursive: true, force: true });
}
