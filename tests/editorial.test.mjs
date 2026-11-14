import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore } from '../server/lib/store.mjs';
const draft = {
  slug: 'test-article',
  title: 'Как выбрать сайт для бизнеса',
  description: 'Практическое руководство для заказчика',
  category: 'Выбор решения',
  service: 'websites',
  answer:
    'Выберите сайт, если клиенту нужно найти услуги и оставить обращение. Приложение имеет смысл для регулярного сценария использования.',
  author: 'Burxonov Shohrux',
  content: Array.from({ length: 4 }, (_, i) => ({
    heading: `Раздел ${i + 1}`,
    body: 'Уточните задачи клиента и критерии запуска. '.repeat(25)
  })),
  faq: [
    { question: 'С чего начать?', answer: 'Опишите задачи клиентов.' },
    { question: 'Как оценить стоимость?', answer: 'Составьте список сценариев.' }
  ],
  sources: [
    {
      title: 'Google',
      url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide'
    }
  ]
};
export { draft };
function using(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'editorial-'));
  const db = openStore(join(dir, 'db.sqlite'));
  try {
    return fn(db);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
}
test('editorial scheduling requires review and edits revoke approval', () =>
  using(db => {
    db.importDraft(draft);
    assert.equal(typeof db.editPost, 'function');
    assert.throws(() => db.schedulePost(draft.slug, '2026-11-01T09:00:00+05:00', {}));
    db.schedulePost(draft.slug, '2026-11-01T09:00:00+05:00', {
      facts: true,
      sources: true,
      originality: true
    });
    assert.equal(db.post(draft.slug).status, 'approved');
    db.editPost({ ...draft, title: 'Новая версия' });
    assert.equal(db.post(draft.slug).status, 'draft');
    assert.equal(db.publishDue('2026-11-02T00:00:00.000Z'), 0);
  }));
test('claims generation once per day, concurrent runs blocked and errors retained', () =>
  using(db => {
    assert.equal(typeof db.addTopic, 'function');
    db.addTopic({
      slug: 'topic-one',
      title: 'Выбор сайта',
      brief: 'Помочь заказчику выбрать решение',
      service: 'websites'
    });
    db.addTopic({
      slug: 'topic-two',
      title: 'Сроки запуска',
      brief: 'Как спланировать запуск продукта',
      service: 'websites'
    });
    const run = db.claimGeneration({ now: '2026-10-26T04:00:00.000Z', monthlyLimit: 30 });
    assert.ok(run.id);
    assert.equal(db.claimGeneration({ now: '2026-10-26T04:01:00.000Z', monthlyLimit: 30 }), null);
    db.finishGeneration(run.id, { error: 'Провайдер недоступен' });
    assert.equal(db.claimGeneration({ now: '2026-10-26T05:00:00.000Z', monthlyLimit: 30 }), null);
    assert.equal(db.editorialState().runs[0].status, 'failed');
    assert.ok(db.claimGeneration({ now: '2026-10-27T04:00:00.000Z', monthlyLimit: 30 }));
  }));
test('published revisions require unpublishing; duplicate slots rejected', () =>
  using(db => {
    assert.equal(typeof db.schedulePost, 'function');
    db.importDraft(draft);
    db.importDraft({ ...draft, slug: 'second-post' });
    const checks = { facts: true, sources: true, originality: true };
    db.schedulePost(draft.slug, '2026-11-01T09:00:00+05:00', checks);
    assert.throws(() => db.schedulePost('second-post', '2026-11-01T09:00:00+05:00', checks));
    db.publishDue('2026-11-01T05:00:00.000Z');
    assert.throws(() => db.editPost(draft));
    db.unpublish(draft.slug);
    assert.equal(db.publicPosts().length, 0);
  }));
test('rejects stale save and stale approval from a second editor', () =>
  using(db => {
    db.importDraft(draft);
    const viewed = db.post(draft.slug);
    db.editPost({ ...viewed, title: 'Новая версия' }, viewed.revision);
    assert.throws(
      () => db.editPost({ ...viewed, title: 'Старая вкладка' }, viewed.revision),
      /измен/
    );
    assert.throws(
      () =>
        db.schedulePost(
          draft.slug,
          '2026-11-01T09:00:00+05:00',
          { facts: true, sources: true, originality: true },
          viewed.revision
        ),
      /измен/
    );
    assert.equal(db.post(draft.slug).status, 'draft');
  }));
test('manual drafts reconcile queued topics and cannot overwrite a running reservation', () =>
  using(db => {
    db.addTopic({
      slug: draft.slug,
      title: draft.title,
      brief: 'Помочь заказчику выбрать решение',
      service: 'websites'
    });
    db.importDraft(draft);
    assert.equal(db.claimGeneration({ now: '2026-10-26T04:00:00.000Z' }), null);
    db.addTopic({
      slug: 'reserved',
      title: 'Новый вопрос клиента',
      brief: 'Помочь заказчику определить состав проекта',
      service: 'websites'
    });
    const run = db.claimGeneration({ now: '2026-10-27T04:00:00.000Z' });
    assert.equal(run.topic.slug, 'reserved');
    assert.throws(() => db.importDraft({ ...draft, slug: 'reserved' }), /генерац/);
  }));
