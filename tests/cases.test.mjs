import test from 'node:test';
import assert from 'node:assert/strict';
import { cases, checkCases, localizeCase, validateCase } from '../shared/cases.mjs';

const lang = (p = '') => ({
  title: p + 'Заголовок',
  client: p + 'Клиент',
  summary: p + 'Итог',
  task: p + 'Задача',
  solution: [p + 'Решение'],
  results: [p + 'Результат']
});
const valid = {
  slug: 'salon-booking',
  service: 'apps',
  year: 2026,
  stack: ['Nuxt'],
  links: [{ url: 'https://example.uz' }],
  ru: lang(),
  uz: lang('uz ')
};

test('real cases in the list are valid', () => {
  assert.doesNotThrow(() => checkCases(cases));
});

test('case requires both languages and correct links', () => {
  assert.deepEqual(validateCase(valid), []);
  assert.ok(validateCase({ ...valid, uz: undefined }).includes('uz.title'));
  assert.ok(validateCase({ ...valid, ru: { ...lang(), results: [] } }).includes('ru.results'));
  assert.ok(validateCase({ ...valid, slug: 'Bad Slug' }).includes('slug'));
  assert.ok(validateCase({ ...valid, service: 'seo' }).includes('service'));
  assert.ok(validateCase({ ...valid, links: [{ url: 'http://x.uz' }] }).includes('links'));
  assert.ok(
    validateCase({ ...valid, cover: { src: 'x.webp', width: 1, height: 1 } }).includes('cover')
  );
  assert.throws(() => checkCases([valid, valid]), /duplicate/);
});

test('localization merges shared and language fields', () => {
  const uz = localizeCase(valid, 'uz');
  assert.equal(uz.title, 'uz Заголовок');
  assert.equal(uz.slug, 'salon-booking');
  assert.equal(uz.ru, undefined);
  assert.equal(localizeCase(valid, 'ru').title, 'Заголовок');
});
