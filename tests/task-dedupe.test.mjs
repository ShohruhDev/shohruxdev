import test from 'node:test';
import assert from 'node:assert/strict';
import { findDuplicate, similarity } from '../server/lib/task-dedupe.mjs';

const open = [
  {
    number: 47,
    role: 'developer',
    title: 'Баг: «делаем» и «задача: …» в личном чате Офиса не создают issues team-task'
  },
  {
    number: 49,
    role: 'smm',
    title: 'Разобрать 3 Reels из Instagram и предложить, что применить у нас'
  },
  { number: 35, role: 'seo', title: 'Подключить сайт к Bing Webmaster Tools' }
];

test('реальные дубли 16.11 находятся', () => {
  assert.equal(
    findDuplicate(open, {
      role: 'developer',
      title:
        'Офис: создание issues из «задача:»/«делаем» + отдельное issue на каждую строку «задача:»'
    })?.number,
    47
  );
  assert.equal(
    findDuplicate(open, {
      role: 'smm',
      title: 'Разобрать 3 Reels через браузер владельца (дополнение к #49)'
    })?.number,
    49
  );
});

test('разные задачи не склеиваются', () => {
  assert.equal(
    findDuplicate(open, { role: 'seo', title: 'Добавить sitemap в Яндекс Вебмастер' }),
    null
  );
  assert.equal(findDuplicate(open, { role: 'smm', title: '5 идей постов для Telegram' }), null);
  // Та же тема, но другая роль — не дубль.
  assert.equal(
    findDuplicate(open, { role: 'designer', title: 'Подключить сайт к Bing Webmaster Tools' }),
    null
  );
  assert.equal(similarity('', 'что-то'), 0);
});
