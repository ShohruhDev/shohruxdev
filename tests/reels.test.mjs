import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSilences,
  keepSegments,
  mapTime,
  parseSrt,
  captionTree,
  mergeShortCues,
  splitWords,
  buildGraph,
  HALF
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

test('splitWords режет реплику на слова, время по длине слов, без дыр', () => {
  const out = splitWords([{ start: 1, end: 3, text: 'Сколько стоит *сайт*' }]);
  assert.deepEqual(
    out.map(c => c.text),
    ['Сколько', 'стоит', '*сайт*']
  );
  assert.equal(out[0].start, 1);
  assert.equal(out.at(-1).end, 3);
  for (let i = 1; i < out.length; i++) assert.equal(out[i].start, out[i - 1].end);
  assert.ok(out[0].end - out[0].start > out[2].end - out[2].start);
});

test('splitWords переносит акцент из многословных *звёздочек* на каждое слово', () => {
  const out = splitWords([{ start: 0, end: 1, text: 'это *цена в договоре* всегда' }]);
  assert.deepEqual(
    out.map(c => c.text),
    ['это', '*цена*', '*в*', '*договоре*', 'всегда']
  );
});

test('splitWords по два слова, если попросили', () => {
  const out = splitWords([{ start: 0, end: 2, text: 'раз два три' }], 2);
  assert.deepEqual(
    out.map(c => c.text),
    ['раз два', 'три']
  );
});

test('buildGraph в режиме split: верх и низ по половине кадра, склейка vstack', () => {
  const f = buildGraph({
    segs: [{ start: 0, end: 5 }],
    hasAudio: true,
    overlays: [{ y: 100, start: 0, end: 3 }],
    split: true,
    cutTotal: 5
  }).join(';');
  assert.equal(HALF, 960);
  assert.match(f, /\[1:v\]scale=1080:960:force_original_aspect_ratio=decrease,pad=1080:960/);
  assert.match(f, /trim=0:5\.000/);
  assert.match(f, /\[top\]\[bot\]vstack\[b0\]/);
  // подписи сдвигаются на один вход: 0 — видео, 1 — верх, 2.. — картинки
  assert.match(f, /\[b0\]\[2:v\]overlay/);
});

test('buildGraph без split остаётся прежним: полный кадр 9:16', () => {
  const f = buildGraph({
    segs: [{ start: 0, end: 5 }],
    hasAudio: false,
    overlays: [{ y: 100, start: 0, end: 3 }],
    cutTotal: 5
  }).join(';');
  assert.match(f, /scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920/);
  assert.doesNotMatch(f, /vstack/);
  assert.match(f, /\[b0\]\[1:v\]overlay/);
});
