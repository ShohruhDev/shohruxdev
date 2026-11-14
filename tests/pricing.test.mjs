import test from 'node:test';
import assert from 'node:assert/strict';
import { estimate } from '../shared/pricing.mjs';

test('base prices match the approved table', () => {
  assert.deepEqual(estimate({ type: 'landing' }), {
    type: 'landing',
    service: 'web',
    extraPages: 0,
    options: [],
    price: [3, 6],
    weeks: [1, 2]
  });
  assert.deepEqual(estimate({ type: 'shop' }).price, [15, 30]);
  assert.equal(estimate({ type: 'mobile' }).service, 'mobile');
});
test('extra pages, options, design, languages and urgency', () => {
  const r = estimate({ type: 'corporate', pages: 10, extras: ['booking'] });
  assert.equal(r.extraPages, 3);
  assert.deepEqual(
    r.price,
    [7 + 1.2 + 3, 14 + 2.1 + 6].map(v => Math.round(v * 2) / 2)
  );
  assert.deepEqual(estimate({ type: 'landing', design: 'template' }).price, [2.5, 5]);
  assert.deepEqual(estimate({ type: 'landing', langs: 2 }).price, [3.5, 7]);
  assert.deepEqual(estimate({ type: 'landing', urgent: true }).price, [4, 8]);
  assert.deepEqual(estimate({ type: 'landing', langs: 2 }).weeks, [2, 3]);
});
test('ignores options that do not apply to the project type and bad input', () => {
  assert.deepEqual(estimate({ type: 'landing', extras: ['onec', 'cabinet'] }).options, []);
  assert.equal(estimate({ type: 'nope' }).type, 'corporate');
  assert.equal(estimate({ type: 'corporate', pages: -5 }).extraPages, 0);
  assert.equal(estimate({ type: 'corporate', pages: 999 }).extraPages, 43);
  assert.deepEqual(estimate({ type: 'landing', extras: ['copy'] }).price, [3.5, 7]);
});
