import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../server/lib/core.mjs';
import { openStore } from '../server/lib/store.mjs';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
test('lead attribution strips queries and credentials and classifies AI referrals', () => {
  assert.equal(typeof core.cleanAttribution, 'function');
  const a = core.cleanAttribution({
    landing: '/journal/site-or-app?email=private@example.com',
    referrer: 'https://chatgpt.com/c/private?secret=1',
    source: 'chatgpt.com',
    campaign: 'launch'
  });
  assert.equal(a.channel, 'ai');
  assert.equal(a.landing, '/journal/site-or-app');
  assert.equal(a.referrer, 'chatgpt.com');
  assert.equal(core.cleanAttribution({ referrer: 'javascript:alert(1)' }).referrer, '');
});
test('generator fails closed without key and never runs paid calls', async () => {
  const pipeline = await import('../server/lib/pipeline.mjs');
  const dir = mkdtempSync(join(tmpdir(), 'pipeline-')),
    db = openStore(join(dir, 'db'));
  try {
    const r = await pipeline.runGeneration(db, {
      env: {},
      fetcher: () => {
        throw Error('must not call');
      }
    });
    assert.equal(r.status, 'unconfigured');
    assert.equal(db.editorialState().runs.length, 0);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test('research-to-draft saves only cited sources and failure never publishes', async () => {
  const { runGeneration } = await import('../server/lib/pipeline.mjs');
  const dir = mkdtempSync(join(tmpdir(), 'pipeline-full-')),
    db = openStore(join(dir, 'db'));
  const env = {
    OPENAI_API_KEY: 'test-only-not-a-key',
    CONTENT_MODEL: 'fixture-model',
    CONTENT_MONTHLY_RUN_LIMIT: '30'
  };
  const url = 'https://web.dev/learn/performance';
  const article = {
    title: 'Выбор решения для сайта',
    description: 'Как выбрать решение',
    category: 'Выбор решения',
    answer: 'Короткий ответ для клиента. '.repeat(5),
    content: [{ heading: 'Выбор', body: 'Полезный текст' }],
    faq: [],
    sources: [{ title: 'web.dev', url }]
  };
  article.translations = { uz: structuredClone(article) };
  let calls = 0;
  const fetcher = async (endpoint, options) => {
    calls++;
    const body = JSON.parse(options.body);
    assert.equal(body.store, false);
    assert.equal(endpoint, 'https://api.openai.com/v1/responses');
    return {
      ok: true,
      json: async () =>
        calls === 1
          ? {
              status: 'completed',
              usage: { input_tokens: 10 },
              output: [
                {
                  type: 'message',
                  content: [
                    {
                      type: 'output_text',
                      text: 'Проверенные данные',
                      annotations: [{ type: 'url_citation', url, title: 'web.dev' }]
                    }
                  ]
                }
              ]
            }
          : {
              status: 'completed',
              usage: { output_tokens: 20 },
              output: [
                {
                  type: 'message',
                  content: [{ type: 'output_text', text: JSON.stringify(article) }]
                }
              ]
            }
    };
  };
  try {
    db.addTopic({
      slug: 'first-topic',
      title: 'Как выбрать сайт',
      brief: 'Помочь заказчику выбрать сайт',
      service: 'websites'
    });
    const result = await runGeneration(db, { env, fetcher, now: '2026-10-26T04:00:00.000Z' });
    assert.equal(result.status, 'complete');
    assert.equal(db.post('first-topic').status, 'draft');
    assert.equal(db.publicPosts().length, 0);
    assert.equal(db.editorialState().runs[0].status, 'complete');
    db.addTopic({
      slug: 'second-topic',
      title: 'Как выбрать приложение',
      brief: 'Помочь заказчику выбрать приложение',
      service: 'mobile-apps'
    });
    calls = 0;
    article.sources = [{ title: 'Invented', url: 'https://invented.example/fake' }];
    const failed = await runGeneration(db, { env, fetcher, now: '2026-10-27T04:00:00.000Z' });
    assert.equal(failed.status, 'failed');
    assert.equal(db.post('second-topic'), null);
    assert.match(db.editorialState().runs[0].error, /ссылки/);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
