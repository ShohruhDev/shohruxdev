import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore } from '../server/lib/store.mjs';
import { seedTopics, nicheTopics, starterTopics } from '../server/lib/topics.mjs';

function using(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'topics-')),
    db = openStore(join(dir, 'db'));
  try {
    fn(db);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
}

test('a new queue starts with business niches and seeding is idempotent', () =>
  using(db => {
    seedTopics(db);
    seedTopics(db);
    const topics = db.editorialState().topics;
    assert.equal(topics.length, nicheTopics.length);
    assert.equal(
      topics.some(t => starterTopics.some(old => old.slug === t.slug)),
      false
    );
    const run = db.claimGeneration({ now: '2026-10-29T04:00:00.000Z' });
    assert.equal(run.topic.slug, 'website-beauty-salon');
    seedTopics(db);
    assert.equal(
      db.editorialState().topics.find(t => t.slug === run.topic.slug).status,
      'generating'
    );
    assert.equal(db.claimGeneration({ now: '2026-10-29T04:01:00.000Z' }), null);
  }));

test('seeding preserves edited briefs, paused topics, existing articles and custom topics', () =>
  using(db => {
    db.addTopic({
      ...nicheTopics[0],
      brief: 'Редактор уточнил задачу: запись к мастерам двух филиалов.'
    });
    db.topicStatus(nicheTopics[0].slug, 'paused');
    db.addTopic({ ...starterTopics[0], slug: 'custom-client-question' });
    const published = nicheTopics[1];
    db.importDraft({
      slug: published.slug,
      title: published.title,
      description: 'Практическое руководство',
      category: 'Для бизнеса',
      service: published.service,
      content: [{ heading: 'Начало', body: 'Содержательный ответ заказчику.' }],
      sources: []
    });
    const before = db.editorialState();
    seedTopics(db);
    seedTopics(db);
    const after = db.editorialState();
    assert.deepEqual(after.topics.slice(0, 2), before.topics);
    assert.deepEqual(after.posts, before.posts);
    assert.equal(
      after.topics.some(t => t.slug === published.slug),
      false
    );
    assert.equal(
      db.claimGeneration({ now: '2026-10-29T04:00:00.000Z' }).topic.slug,
      'custom-client-question'
    );
  }));
