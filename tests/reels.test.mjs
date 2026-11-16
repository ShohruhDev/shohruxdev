import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSilences,
  keepSegments,
  mapTime,
  parseSrt,
  captionTree,
  mergeShortCues
} from '../scripts/reels.mjs';

const LOG = `
[silencedetect @ 0x1] silence_start: 3.02
[silencedetect @ 0x1] silence_end: 5.51 | silence_duration: 2.49
[silencedetect @ 0x1] silence_start: 9.9
[silencedetect @ 0x1] silence_end: 10 | silence_duration: 0.1
`;

test('parseSilences читает пары start/end', () => {
  assert.deepEqual(parseSilences(LOG), [
    { start: 3.02, end: 5.51 },
    { start: 9.9, end: 10 }
  ]);
});

test('keepSegments оставляет речь с запасом и выкидывает огрызки', () => {
  const segs = keepSegments(parseSilences(LOG), 10, 0.15);
  assert.equal(segs.length, 2);
  assert.deepEqual(segs[0], { start: 0, end: 3.17 });
  assert.ok(Math.abs(segs[1].start - 5.36) < 1e-9);
  assert.ok(Math.abs(segs[1].end - 10) < 1e-9);
});

test('keepSegments без пауз — весь ролик', () => {
  assert.deepEqual(keepSegments([], 7), [{ start: 0, end: 7 }]);
});

test('mapTime переводит время исходника в смонтированное', () => {
  const segs = [
    { start: 0, end: 3 },
    { start: 5, end: 10 }
  ];
  assert.equal(mapTime(1, segs), 1);
  assert.equal(mapTime(4, segs), 3); // внутри вырезанной паузы — к началу следующего куска
  assert.equal(mapTime(6, segs), 4);
  assert.equal(mapTime(99, segs), 8);
});

test('parseSrt разбирает реплики, включая многострочные', () => {
  const cues = parseSrt(
    '1\r\n00:00:00,500 --> 00:00:02,800\r\nПервая\r\nстрока\r\n\r\n2\r\n00:01:05,000 --> 00:01:06,250\r\nVtoraya\r\n'
  );
  assert.deepEqual(cues, [
    { start: 0.5, end: 2.8, text: 'Первая строка' },
    { start: 65, end: 66.25, text: 'Vtoraya' }
  ]);
});

test('captionTree: слова в *звёздочках* — акцентным цветом', () => {
  const card = captionTree('Считаем *сайт на* двух').props.children[0];
  const words = card.props.children;
  assert.deepEqual(
    words.map(w => [w.props.children, w.props.style.color || null]),
    [
      ['Считаем', null],
      ['сайт', '#2457f5'],
      ['на', '#2457f5'],
      ['двух', null]
    ]
  );
});

test('mergeShortCues приклеивает короткий хвост к предыдущей реплике', () => {
  const cues = mergeShortCues([
    { start: 4.8, end: 6.2, text: 'Открываем калькулятор и выбираем нужные' },
    { start: 6.2, end: 7.6, text: ' страницы.' },
    { start: 9.4, end: 11.4, text: 'Цена фиксируется до начала работы.' },
    { start: 13, end: 13.5, text: 'Всё.' }
  ]);
  assert.deepEqual(cues, [
    { start: 4.8, end: 7.6, text: 'Открываем калькулятор и выбираем нужные страницы.' },
    { start: 9.4, end: 11.4, text: 'Цена фиксируется до начала работы.' },
    { start: 13, end: 13.5, text: 'Всё.' } // далеко по времени — отдельно
  ]);
});
