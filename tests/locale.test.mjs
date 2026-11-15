import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDraft } from '../server/lib/core.mjs';
test('validates Uzbek article body instead of accepting partial or recursive translation', () => {
  const p = {
    slug: 'locale-test',
    title: 'Title',
    description: 'Description',
    category: 'Web',
    content: [{ heading: 'H', body: 'Body' }],
    sources: []
  };
  assert.throws(() => validateDraft({ ...p, translations: { uz: { title: 'Faqat sarlavha' } } }));
  assert.throws(() =>
    validateDraft({ ...p, translations: { uz: { ...p, translations: { uz: {} } } } })
  );
});
import { localePath, localizePost } from '../shared/locale.mjs';
import { openStore } from '../server/lib/store.mjs';
import { readFileSync } from 'node:fs';
test('language paths preserve queries and untranslated articles do not masquerade as Uzbek', () => {
  assert.equal(localePath('/contact?service=mobile', 'uz'), '/uz/contact?service=mobile');
  assert.equal(localePath('/uz/services/websites', 'ru'), '/services/websites');
  assert.equal(localizePost({ slug: 'ru-only', title: 'Русский текст' }, 'uz'), null);
});
test('translation persists and requires explicit review before bilingual publication', () => {
  const p = JSON.parse(
    readFileSync(new URL('../content/launch-brief-draft.json', import.meta.url), 'utf8')
  );
  const db = openStore(':memory:');
  try {
    db.importDraft(p);
    const original = db.post(p.slug);
    db.editPost({ ...original, title: 'Правка заголовка' }, original.revision);
    assert.equal(db.post(p.slug).translations.uz.title, p.translations.uz.title);
    assert.throws(
      () =>
        db.schedulePost(p.slug, '2030-01-01T09:00:00+05:00', {
          facts: true,
          sources: true,
          originality: true
        }),
      /перевод/
    );
    db.schedulePost(p.slug, '2030-01-01T09:00:00+05:00', {
      facts: true,
      sources: true,
      originality: true,
      translation: true
    });
    assert.equal(db.publishDue('2030-01-01T05:00:00.000Z'), 1);
    assert.equal(
      localizePost(db.publicPosts('2030-01-01T05:00:00.000Z')[0], 'uz').title,
      p.translations.uz.title
    );
  } finally {
    db.close();
  }
});
test('Uzbek publication never inherits optional Russian body fields', () => {
  const p = {
    slug: 'test',
    title: 'Русский заголовок',
    answer: 'Русский ответ',
    faq: [{ question: 'Вопрос', answer: 'Ответ' }],
    readTime: '5 мин',
    author: 'Author',
    translations: {
      uz: {
        title: 'Sarlavha',
        description: 'Tavsif',
        category: 'Bo‘lim',
        content: [{ heading: 'H', body: 'B' }],
        sources: []
      }
    }
  };
  const uz = localizePost(p, 'uz');
  assert.equal(uz.answer, undefined);
  assert.equal(uz.faq, undefined);
  assert.equal(uz.readTime, undefined);
  assert.equal(uz.author, 'Author');
});

test('site author is shown in Cyrillic on RU and in Latin on UZ, whatever the stored spelling', () => {
  for (const author of [
    'Burxonov Shohrux',
    'Burxonov Sh.',
    'Shohrux Burxonov',
    'Шохрух Бурхонов'
  ]) {
    const p = {
      slug: 'a',
      title: 'Заголовок',
      author,
      translations: {
        uz: { title: 'Sarlavha', description: 'T', category: 'B', content: [], sources: [] }
      }
    };
    assert.equal(localizePost(p, 'ru').author, 'Шохрух Бурхонов');
    assert.equal(localizePost(p, 'uz').author, 'Shohrux Burxonov');
  }
});

test('publication dates use readable RU/UZ months and the Tashkent calendar day', async () => {
  const { publicationDate } = await import('../shared/locale.mjs');
  assert.equal(publicationDate('2026-10-28T20:00:00Z', 'uz'), '2026-yil 29-oktabr');
  assert.equal(publicationDate('2026-10-28T18:00:00Z', 'ru'), '28 октября 2026 г.');
  assert.equal(publicationDate('2026-12-31T20:00:00Z', 'uz'), '2027-yil 1-yanvar');
});
