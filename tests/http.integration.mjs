import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { openStore } from '../server/lib/store.mjs';
const dir = mkdtempSync(join(tmpdir(), 'web-mobile-http-'));
const file = join(dir, 'content.sqlite');
const port = 3176;
const base = `http://127.0.0.1:${port}`;
const env = { ...process.env, CONTENT_DB: file, PORT: String(port), HOST: '127.0.0.1' };
const child = spawn(process.execPath, ['.output/server/index.mjs'], {
  env,
  stdio: ['ignore', 'pipe', 'pipe']
});
try {
  await new Promise((res, rej) => {
    const timer = setTimeout(() => rej(Error('Server did not start')), 15000);
    child.stdout.on('data', b => {
      if (b.toString().includes('Listening')) {
        clearTimeout(timer);
        res();
      }
    });
    child.on('exit', c => {
      clearTimeout(timer);
      rej(Error(`Server exited ${c}`));
    });
  });
  for (const path of [
    '/',
    '/services',
    '/services/websites',
    '/services/web-apps',
    '/services/mobile-apps',
    '/process',
    '/calculator',
    '/prices',
    '/journal',
    '/contact',
    '/privacy',
    '/journal/site-or-app'
  ]) {
    const r = await fetch(base + path);
    assert.equal(r.status, 200, path);
    const html = await r.text();
    assert.match(html, /<h1/);
    assert.match(html, /noindex/);
    assert.match(html, /rel="canonical"/);
  }
  // Раздел кейсов скрыт, пока в shared/cases.mjs нет ни одного кейса.
  const { cases } = await import('../shared/cases.mjs');
  for (const path of [
    '/services/missing',
    '/journal/private-draft',
    '/missing-page',
    ...(cases.length ? ['/cases/missing'] : ['/cases', '/cases/missing'])
  ])
    assert.equal((await fetch(base + path)).status, 404, path);
  const home = await (await fetch(base)).text();
  assert.match(home, /<h1[^>]*>САЙТЫ\./);
  assert.match(home, /Мобильные приложения/);
  assert.match(await (await fetch(base + '/robots.txt')).text(), /Disallow: \//);
  assert.doesNotMatch(await (await fetch(base + '/sitemap.xml')).text(), /<loc>/);
  const payload = {
    name: 'Тест клиента',
    contact: 'qa@example.com',
    message: 'Тестовая заявка на сайт с каталогом',
    service: 'web',
    budget: '',
    website: '',
    consent: true
  };
  const post = (body, extra = {}) =>
    fetch(base + '/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...extra },
      body: JSON.stringify(body)
    });
  assert.equal((await post(payload, { origin: 'https://invalid.example' })).status, 403);
  assert.equal((await post({ ...payload, consent: false })).status, 400);
  assert.equal((await post({ ...payload, contact: '---------' })).status, 400);
  const good = await post(payload);
  assert.equal(good.status, 201);
  const { id } = await good.json();
  const db = openStore(file);
  assert.equal(db.leads()[0].id, id);
  db.close();
  const run = (...args) => {
    const r = spawnSync(process.execPath, ['scripts/content.mjs', ...args], {
      env,
      encoding: 'utf8'
    });
    assert.equal(r.status, 0, r.stderr);
    return r.stdout;
  };
  run('import', 'content/example-draft.json');
  assert.equal((await fetch(base + '/journal/brief-checklist')).status, 404);
  assert.ok(
    !(await (await fetch(base + '/api/posts')).json()).some(p => p.slug === 'brief-checklist')
  );
  run('approve', 'brief-checklist', '2020-01-01T09:00:00+05:00');
  assert.equal((await fetch(base + '/journal/brief-checklist')).status, 404);
  assert.equal(JSON.parse(run('publish-due')).published, 1);
  assert.equal(JSON.parse(run('publish-due')).published, 0);
  assert.equal((await fetch(base + '/journal/brief-checklist')).status, 200);
  console.log(
    'PASS: 10 SSR pages, 3 real 404s, canonical/noindex/robots, origin+contact+consent validation, durable lead, draft privacy, CLI publication and idempotency.'
  );
} finally {
  child.kill();
  await new Promise(r => child.once('exit', r));
  rmSync(dir, { recursive: true, force: true });
}
