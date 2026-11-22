import { test } from 'node:test';
import assert from 'node:assert/strict';
import { timeline, slideTree, ctaTree } from '../scripts/reels-cards.mjs';

const spec = {
  slides: [
    { title: 'Сколько стоит *сайт*', lines: ['Лендинг', 'Магазин'], seconds: 4 },
    { title: 'Цена в договоре', seconds: 2 }
  ],
  cta: 'Рассчитать стоимость — razrabotkatashkent.uz'
};

test('timeline раскрывает строки по одной: заголовок, потом каждая строка', () => {
  const t = timeline(spec);
  assert.deepEqual(
    t.map(s => [s.kind, s.slide, s.visible]),
    [
      ['slide', 0, 0],
      ['slide', 0, 1],
      ['slide', 0, 2],
      ['slide', 1, 0],
      ['cta', null, 0]
    ]
  );
  // слайд 0 занимает свои 4 секунды, CTA — 2.5
  assert.equal(t[2].end, 4);
  assert.equal(t[3].start, 4);
  assert.equal(t.at(-1).end - t.at(-1).start, 2.5);
});

test('timeline растягивает слайды под длину голоса, CTA остаётся 2.5 с', () => {
  const t = timeline(spec, 17);
  assert.equal(t.at(-1).end, 17);
  assert.equal(t.at(-1).end - t.at(-1).start, 2.5);
  // слайды 4:2 → 14.5 с делятся 2:1
  assert.ok(Math.abs(t[3].start - 14.5 * (4 / 6)) < 1e-9);
});

test('timeline без CTA заканчивается последним слайдом', () => {
  const t = timeline({ slides: [{ title: 'Раз', seconds: 3 }] });
  assert.equal(t.length, 1);
  assert.equal(t[0].end, 3);
});

test('slideTree: кадр 1080×1920, скрытые строки прозрачные, акцент синий', () => {
  const tree = slideTree(spec.slides[0], 1, { tag: 'Цены' });
  assert.equal(tree.props.style.width, 1080);
  assert.equal(tree.props.style.height, 1920);
  const json = JSON.stringify(tree);
  assert.match(json, /#2457f5/);
  assert.match(json, /"opacity":0/); // вторая строка ещё скрыта
  assert.match(json, /"opacity":1/);
});

test('ctaTree: синий фон, белый текст', () => {
  const json = JSON.stringify(ctaTree('Рассчитать стоимость'));
  assert.match(json, /"background":"#2457f5"/);
  assert.match(json, /"color":"#ffffff"/);
});
