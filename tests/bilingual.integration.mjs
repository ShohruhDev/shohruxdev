import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore } from '../server/lib/store.mjs';
const dir = mkdtempSync(join(tmpdir(), 'bilingual-')),
  file = join(dir, 'db'),
  base = 'http://127.0.0.1:3179';
const db = openStore(file);
const draft = JSON.parse(readFileSync('content/launch-brief-draft.json', 'utf8'));
db.importDraft(draft);
db.schedulePost(draft.slug, '2020-01-01T09:00:00+05:00', {
  facts: true,
  sources: true,
  originality: true,
  translation: true
});
db.publishDue();
db.importDraft({ ...draft, slug: 'ru-only', translations: undefined });
db.approve('ru-only', '2020-01-01T09:00:00+05:00');
db.publishDue();
db.close();
const child = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: {
    ...process.env,
    PORT: '3179',
    HOST: '127.0.0.1',
    CONTENT_DB: file,
    CONTENT_AUTOMATION_ENABLED: 'false'
  },
  stdio: ['ignore', 'pipe', 'pipe']
});
try {
  await new Promise((res, rej) => {
    const timer = setTimeout(() => rej(Error('Startup timeout')), 15000);
    child.stdout.on('data', b => {
      if (b.toString().includes('Listening')) {
        clearTimeout(timer);
        res();
      }
    });
    child.once('exit', c => {
      clearTimeout(timer);
      rej(Error('Startup ' + c));
    });
  });
  for (const path of [
    '/uz',
    '/uz/services',
    '/uz/services/websites',
    '/uz/services/web-apps',
    '/uz/services/mobile-apps',
    '/uz/process',
    '/uz/contact',
    '/uz/privacy',
    '/uz/journal',
    '/uz/journal/site-or-app',
    '/uz/journal/website-budget',
    '/uz/journal/mvp-scope',
    '/uz/journal/' + draft.slug
  ]) {
    const r = await fetch(base + path);
    assert.equal(r.status, 200, path);
    const html = await r.text();
    assert.match(html, /<html[^>]*lang="uz"/, path);
    assert.match(html, /hreflang="ru"/, path);
    assert.match(html, /hreflang="uz"/, path);
    assert.ok(
      html.includes(`rel="canonical" href="http://127.0.0.1:3000${path}"`),
      path + ' canonical'
    );
    const visible = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
      .replace(/<head\b[^>]*>[\s\S]*?<\/head>/g, '')
      .replace(/<[^>]+>/g, '');
    assert.doesNotMatch(
      visible,
      /[А-Яа-яЁё]/,
      path + ' Russian visible text: ' + visible.match(/.{0,40}[А-Яа-яЁё].{0,80}/)?.[0]
    );
  }
  const trailing = await fetch(base + '/journal/ru-only/', { redirect: 'manual' });
  assert.equal(trailing.status, 301);
  assert.equal(trailing.headers.get('location'), '/journal/ru-only');
  const ru = await (await fetch(base + '/journal/ru-only')).text();
  assert.doesNotMatch(ru, /hreflang="uz"/);
  assert.ok(!ru.includes('href="/uz/journal/ru-only"'));
  assert.ok(ru.includes('href="/uz/journal"'));
  const missing = await (
    await fetch(base + '/uz/missing', { headers: { Accept: 'text/html' } })
  ).text();
  assert.match(missing, /<html[^>]*lang="uz"/);
  assert.equal((await fetch(base + '/uz/journal/ru-only')).status, 404);
  const uzPosts = await (await fetch(base + '/api/posts?lang=uz')).json();
  assert.ok(!uzPosts.some(p => p.slug === 'ru-only'));
  assert.equal(uzPosts.find(p => p.slug === draft.slug).title, draft.translations.uz.title);
  const lead = await fetch(base + '/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base },
    body: JSON.stringify({
      name: 'Sinov',
      contact: 'qa@example.com',
      message: 'Biznes uchun sayt yaratish kerak',
      service: 'web',
      budget: '',
      consent: true,
      locale: 'uz'
    })
  });
  assert.equal(lead.status, 201);
  const after = openStore(file);
  assert.equal(after.leads()[0].locale, 'uz');
  after.close();
  assert.match(await (await fetch(base + '/feed.xml?lang=uz')).text(), /<language>uz<\/language>/);
  console.log(
    'PASS: 13 Uzbek SSR routes without Russian visible text; lang/canonical/reciprocal alternates, published translation, RU-only exclusion and 404, Uzbek form persistence, RSS language.'
  );
} finally {
  child.kill();
  if (child.exitCode === null) await new Promise(r => child.once('exit', r));
  rmSync(dir, { recursive: true, force: true });
}
