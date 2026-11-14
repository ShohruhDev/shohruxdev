import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  INDEXNOW_ENDPOINT,
  indexNowConfig,
  indexNowOnPublish,
  publishedUrls,
  submitIndexNow
} from '../server/lib/indexnow.mjs';
import { openStore } from '../server/lib/store.mjs';

const env = {
  SITE_URL: 'https://razrabotkatashkent.uz/',
  SITE_INDEXABLE: 'true',
  INDEXNOW_KEY: 'a1b2c3d4e5f6'
};

test('IndexNow config requires indexable HTTPS site and valid key', () => {
  assert.equal(indexNowConfig(env).enabled, true);
  assert.equal(indexNowConfig(env).siteUrl, 'https://razrabotkatashkent.uz');
  assert.equal(indexNowConfig({ ...env, SITE_INDEXABLE: 'false' }).enabled, false);
  assert.equal(indexNowConfig({ ...env, INDEXNOW_KEY: 'short' }).enabled, false);
  assert.equal(indexNowConfig({ ...env, INDEXNOW_KEY: 'bad key!!' }).enabled, false);
  assert.equal(indexNowConfig({ ...env, SITE_URL: 'http://127.0.0.1:3000' }).enabled, false);
});

test('published URLs include translations and journal lists', () => {
  const urls = publishedUrls('https://x.uz', [
    { slug: 'a', translations: { uz: { title: 'A' } } },
    { slug: 'b' }
  ]);
  assert.deepEqual(urls, [
    'https://x.uz/journal',
    'https://x.uz/uz/journal',
    'https://x.uz/journal/a',
    'https://x.uz/uz/journal/a',
    'https://x.uz/journal/b'
  ]);
  assert.deepEqual(publishedUrls('https://x.uz', []), []);
});

test('submit sends protocol payload and rejects errors', async () => {
  const calls = [];
  const ok = async (url, init) => (
    calls.push({ url, body: JSON.parse(init.body) }),
    { status: 202 }
  );
  const cfg = indexNowConfig(env);
  assert.deepEqual(await submitIndexNow(cfg, ['https://razrabotkatashkent.uz/journal'], ok), {
    submitted: 1,
    status: 202
  });
  assert.equal(calls[0].url, INDEXNOW_ENDPOINT);
  assert.deepEqual(calls[0].body, {
    host: 'razrabotkatashkent.uz',
    key: 'a1b2c3d4e5f6',
    keyLocation: 'https://razrabotkatashkent.uz/a1b2c3d4e5f6.txt',
    urlList: ['https://razrabotkatashkent.uz/journal']
  });
  await assert.rejects(
    submitIndexNow(cfg, ['u'], async () => ({ status: 403 })),
    /403/
  );
  assert.deepEqual(await submitIndexNow({ enabled: false }, ['u'], ok), { skipped: true });
});

test('store notifies on publish only for newly published posts; failures are swallowed', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'indexnow-'));
  try {
    const sent = [];
    const fetchImpl = async (_url, init) => (
      sent.push(JSON.parse(init.body).urlList),
      { status: 200 }
    );
    const db = openStore(join(dir, 'c.sqlite'), {
      onPublish: indexNowOnPublish(indexNowConfig(env), fetchImpl)
    });
    db.importDraft({
      slug: 'site-cost',
      title: 'Стоимость сайта',
      description: 'Как определить бюджет',
      category: 'Веб-разработка',
      content: [{ heading: 'Объём', body: 'Начните с задач пользователей.' }],
      sources: []
    });
    db.approve('site-cost', '2026-10-26T10:00:00.000Z');
    assert.equal(db.publishDue('2026-10-26T10:00:00.000Z'), 1);
    assert.equal(db.publishDue('2026-10-26T10:00:00.000Z'), 0);
    await new Promise(r => setImmediate(r));
    assert.deepEqual(sent, [
      ['https://razrabotkatashkent.uz/journal', 'https://razrabotkatashkent.uz/journal/site-cost']
    ]);
    db.close();

    const failing = openStore(join(dir, 'd.sqlite'), {
      onPublish: () => {
        throw new Error('boom');
      }
    });
    failing.importDraft({
      slug: 'x',
      title: 'Заголовок',
      description: 'Описание',
      category: 'Веб-разработка',
      content: [{ heading: 'H', body: 'Текст.' }],
      sources: []
    });
    failing.approve('x', '2026-10-26T10:00:00.000Z');
    assert.equal(failing.publishDue('2026-10-26T10:00:00.000Z'), 1);
    failing.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
