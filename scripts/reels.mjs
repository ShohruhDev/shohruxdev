// Черновой монтаж Reels из сырого видео владельца: вырезает паузы, делает 9:16 (1080×1920),
// выравнивает звук и накладывает подписи в фирменном стиле (Montserrat, акцент #2457f5).
// ffmpeg в системе собран без libass/drawtext, поэтому подписи рендерим картинками (satori → PNG)
// и накладываем фильтром overlay.
//
//   npm run reels -- content/video/raw/clip.mov [--srt subs.srt] [--title "Заголовок"] [--cta "Следующий шаг"]
//                    [--out name.mp4] [--keep-pauses] [--noise -35dB] [--min-pause 0.6]
//                    [--transcribe] [--lang ru|uz|auto]
//                    [--layout split --top screen.mp4|slide.png] [--words 1|2]
//
// --layout split: кадр пополам. Сверху --top (запись экрана, скриншот, карточка), снизу владелец
// в камеру; подписи — на стыке половин. --words N: субтитры по N слов (по умолчанию в split — 1),
// время внутри реплики делится по длине слов.
//
// SRT — по времени исходного файла (как его отдаёт Whisper или как написал владелец).
// --transcribe: распознать речь whisper.cpp (brew install whisper-cpp), SRT ляжет рядом с исходником
// (clip.srt) — его можно поправить и пересобрать с --srt. Модель: WHISPER_MODEL или
// ~/.local/share/whisper/ggml-large-v3-turbo-q5_0.bin.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const W = 1080;
export const H = 1920;
export const HALF = H / 2; // высота половины кадра в режиме split
export const SAFE = 250; // stories/reels: сверху и снизу 250px без текста (DESIGN.md)
const PAD = 0.15; // запас вокруг речи, чтобы не резать слова
const C = { card: '#ffffff', text: '#1f1f1f', accent: '#2457f5', panel: '#f8f7f5' };

/** Вывод silencedetect → [{start,end}] пауз. */
export function parseSilences(log) {
  const out = [];
  let start = null;
  for (const line of String(log).split('\n')) {
    const s = line.match(/silence_start: (-?[\d.]+)/);
    const e = line.match(/silence_end: ([\d.]+)/);
    if (s) start = Math.max(0, Number(s[1]));
    if (e && start !== null) {
      out.push({ start, end: Number(e[1]) });
      start = null;
    }
  }
  return out;
}

/** Паузы → куски, которые оставляем. Короткие куски (<0.2s) отбрасываем. */
export function keepSegments(silences, duration, pad = PAD) {
  const segs = [];
  let t = 0;
  for (const { start, end } of silences) {
    const a = t;
    const b = Math.min(duration, start + pad);
    if (b - a >= 0.2) segs.push({ start: a, end: b });
    t = Math.max(t, end - pad);
  }
  if (duration - t >= 0.2) segs.push({ start: t, end: duration });
  return segs;
}

/** Время исходника → время после вырезания пауз (внутри вырезанного — к началу следующего куска). */
export function mapTime(t, segs) {
  let acc = 0;
  for (const s of segs) {
    if (t < s.start) return acc;
    if (t <= s.end) return acc + (t - s.start);
    acc += s.end - s.start;
  }
  return acc;
}

const ts = v => {
  const [h, m, s] = v.replace(',', '.').split(':');
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
};
/** SRT → [{start,end,text}]. */
export function parseSrt(src) {
  return String(src)
    .replace(/\r/g, '')
    .split(/\n\n+/)
    .map(block => {
      const lines = block.trim().split('\n');
      const i = lines.findIndex(l => l.includes('-->'));
      if (i < 0) return null;
      const [a, b] = lines[i].split('-->').map(x => ts(x.trim()));
      const text = lines
        .slice(i + 1)
        .join(' ')
        .trim();
      return text ? { start: a, end: b, text } : null;
    })
    .filter(Boolean);
}

/** Короткий хвост («страницы.») приклеиваем к предыдущей реплике, если она рядом и влезет в 2 строки. */
export function mergeShortCues(cues, { minChars = 14, maxChars = 56, maxGap = 0.3 } = {}) {
  const out = [];
  for (const cue of cues) {
    const prev = out.at(-1);
    const text = cue.text.trim();
    if (
      prev &&
      text.length < minChars &&
      cue.start - prev.end <= maxGap &&
      prev.text.length + 1 + text.length <= maxChars
    ) {
      prev.text = `${prev.text} ${text}`;
      prev.end = cue.end;
    } else out.push({ ...cue, text });
  }
  return out;
}

/**
 * Реплики → куски по n слов. Время внутри реплики делится пропорционально длине слов,
 * куски идут встык. Многословный акцент *a b* переносится на каждое слово.
 */
export function splitWords(cues, n = 1) {
  const out = [];
  for (const cue of cues) {
    let accent = false;
    const words = cue.text
      .split(/\s+/)
      .filter(Boolean)
      .map(word => {
        const opens = word.startsWith('*');
        const closes = word.endsWith('*') && (word.length > 1 || !opens);
        const on = accent || opens;
        accent = on && !closes;
        const bare = word.replace(/\*/g, '');
        return { text: on ? `*${bare}*` : bare, len: bare.length + 1 };
      });
    const chunks = [];
    for (let i = 0; i < words.length; i += n) {
      const part = words.slice(i, i + n);
      chunks.push({
        text: part.map(w => w.text).join(' '),
        len: part.reduce((a, w) => a + w.len, 0)
      });
    }
    const total = chunks.reduce((a, c) => a + c.len, 0) || 1;
    let t = cue.start;
    chunks.forEach((c, i) => {
      const end = i === chunks.length - 1 ? cue.end : t + ((cue.end - cue.start) * c.len) / total;
      out.push({ start: t, end, text: c.text });
      t = end;
    });
  }
  return out;
}

/**
 * Граф ffmpeg: куски видео/звука → concat → кадр → подписи; звук → loudnorm.
 * split: вход 1 — верхняя половина (уже зациклен/растянут на cutTotal), владелец — снизу.
 */
export function buildGraph({ segs, hasAudio, overlays, split = false, cutTotal }) {
  const f = [];
  segs.forEach((s, i) => {
    f.push(`[0:v]trim=${s.start.toFixed(3)}:${s.end.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`);
    if (hasAudio)
      f.push(`[0:a]atrim=${s.start.toFixed(3)}:${s.end.toFixed(3)},asetpts=PTS-STARTPTS[a${i}]`);
  });
  const ins = segs.map((_, i) => (hasAudio ? `[v${i}][a${i}]` : `[v${i}]`)).join('');
  f.push(
    `${ins}concat=n=${segs.length}:v=1:a=${hasAudio ? 1 : 0}${hasAudio ? '[vc][ac]' : '[vc]'}`
  );
  if (split) {
    // лицо обычно в верхней трети вертикального кадра — кроп чуть выше центра
    f.push(
      `[vc]scale=${W}:${HALF}:force_original_aspect_ratio=increase,crop=${W}:${HALF}:(iw-ow)/2:(ih-oh)/3,setsar=1,fps=30[bot]`
    );
    f.push(
      `[1:v]scale=${W}:${HALF}:force_original_aspect_ratio=decrease,pad=${W}:${HALF}:(ow-iw)/2:(oh-ih)/2:color=${C.panel},setsar=1,fps=30,trim=0:${cutTotal.toFixed(3)},setpts=PTS-STARTPTS[top]`
    );
    f.push(`[top][bot]vstack[b0]`);
  } else {
    f.push(
      `[vc]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=30[b0]`
    );
  }
  const first = split ? 2 : 1;
  overlays.forEach((ov, i) => {
    f.push(
      `[b${i}][${i + first}:v]overlay=0:${Math.round(ov.y)}:enable='between(t,${ov.start.toFixed(3)},${ov.end.toFixed(3)})'[b${i + 1}]`
    );
  });
  if (hasAudio) f.push(`[ac]loudnorm=I=-14:TP=-1.5:LRA=11[aout]`);
  return f;
}

const h = (type, style, children) => ({ type, props: { style, children } });

/** Плашка подписи: белая карточка radius 24, текст Montserrat 600. Слова в *звёздочках* — акцентом. */
export function captionTree(text, { size = 60, maxWidth = W - 144 } = {}) {
  // По слову на span: flex-gap даёт ровные пробелы и перенос строк.
  let accent = false;
  const parts = String(text)
    .split(/\s+/)
    .filter(Boolean)
    .map(word => {
      const opens = word.startsWith('*');
      const closes = word.endsWith('*') && (word.length > 1 || !opens);
      const on = accent || opens;
      accent = on && !closes;
      return h('span', on ? { color: C.accent } : {}, word.replace(/\*/g, ''));
    });
  return h('div', { width: W, display: 'flex', justifyContent: 'center' }, [
    h(
      'div',
      {
        maxWidth,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px 36px',
        background: C.card,
        borderRadius: 24,
        color: C.text,
        fontFamily: FAMILY,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.25,
        columnGap: Math.round(size * 0.28)
      },
      parts
    )
  ]);
}

// satori: каждый набор символов — отдельное имя шрифта, иначе кириллица выпадает в «квадратики».
const SUBSETS = ['latin', 'cyrillic', 'latin-ext'];
export const FAMILY = SUBSETS.map(s => `Montserrat-${s}`).join(', ');

export async function loadFonts() {
  const dir = resolve('node_modules/@fontsource/montserrat/files');
  const fonts = [];
  for (const subset of SUBSETS)
    for (const weight of [600, 700])
      fonts.push({
        name: `Montserrat-${subset}`,
        weight,
        style: 'normal',
        data: readFileSync(join(dir, `montserrat-${subset}-${weight}-normal.woff`))
      });
  return fonts;
}

async function renderPng(tree, fonts, file) {
  const { default: satori } = await import('satori');
  const { Resvg } = await import('@resvg/resvg-js');
  const svg = await satori(tree, { width: W, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  writeFileSync(file, png);
  // высота нужна, чтобы поставить плашку над нижней безопасной зоной
  return Number(svg.match(/height="(\d+)/)?.[1] || 200);
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`${cmd} упал:\n${(r.stderr || '').slice(-2000)}`);
  return r;
}

export const WHISPER_MODEL =
  process.env.WHISPER_MODEL || join(homedir(), '.local/share/whisper/ggml-large-v3-turbo-q5_0.bin');

/** Речь → SRT рядом с исходником (clip.mov → clip.srt). Возвращает путь к SRT. */
export function transcribe(input, lang = 'ru', tmp = mkdtempSync(join(tmpdir(), 'reels-'))) {
  if (!existsSync(WHISPER_MODEL))
    throw new Error(`Нет модели whisper: ${WHISPER_MODEL} (см. .claude/skills/reels-montage)`);
  const wav = join(tmp, 'speech.wav');
  run('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    input,
    '-ar',
    '16000',
    '-ac',
    '1',
    wav
  ]);
  const base = join(dirname(resolve(input)), basename(input, extname(input)));
  // -ml 42 -sow: короткие реплики по словам — помещаются в 2 строки плашки
  run('whisper-cli', [
    '-m',
    WHISPER_MODEL,
    '-l',
    lang,
    '-osrt',
    '-ml',
    '42',
    '-sow',
    '-np',
    '-of',
    base,
    wav
  ]);
  return `${base}.srt`;
}

function parseArgs(argv) {
  const o = {
    input: null,
    srt: null,
    title: null,
    out: null,
    transcribe: false,
    lang: 'ru',
    keepPauses: false,
    noise: '-35dB',
    minPause: 0.6,
    layout: 'full',
    top: null,
    words: null
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--srt') o.srt = argv[++i];
    else if (a === '--title') o.title = argv[++i];
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--cta') o.cta = argv[++i];
    else if (a === '--keep-pauses') o.keepPauses = true;
    else if (a === '--transcribe') o.transcribe = true;
    else if (a === '--lang') o.lang = argv[++i];
    else if (a === '--noise') o.noise = argv[++i];
    else if (a === '--min-pause') o.minPause = Number(argv[++i]);
    else if (a === '--layout') o.layout = argv[++i];
    else if (a === '--top') o.top = argv[++i];
    else if (a === '--words') o.words = Number(argv[++i]);
    else if (!o.input) o.input = a;
  }
  return o;
}

export async function main(argv = process.argv.slice(2)) {
  const o = parseArgs(argv);
  if (!o.input) {
    console.log(
      'npm run reels -- <видео> [--srt subs.srt | --transcribe [--lang ru|uz]] [--title "..."] [--cta "..."] [--out name.mp4] [--keep-pauses] [--layout split --top screen.mp4] [--words 1|2]'
    );
    process.exit(1);
  }
  const split = o.layout === 'split';
  if (split && !o.top) throw new Error('--layout split требует --top <видео или картинка>');
  if (split && !existsSync(o.top)) throw new Error(`Нет файла --top: ${o.top}`);
  const words = o.words ?? (split ? 1 : 0);
  if (o.transcribe && !o.srt) {
    o.srt = transcribe(o.input, o.lang);
    console.log(`Субтитры распознаны: ${o.srt} (проверь текст, поправь и пересобери с --srt)`);
  }
  const duration = Number(
    run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', o.input])
      .stdout
  );
  const hasAudio =
    run('ffprobe', [
      '-v',
      'error',
      '-select_streams',
      'a',
      '-show_entries',
      'stream=index',
      '-of',
      'csv=p=0',
      o.input
    ]).stdout.trim() !== '';

  let segs = [{ start: 0, end: duration }];
  if (!o.keepPauses && hasAudio) {
    const log = spawnSync(
      'ffmpeg',
      [
        '-hide_banner',
        '-i',
        o.input,
        '-af',
        `silencedetect=noise=${o.noise}:d=${o.minPause}`,
        '-f',
        'null',
        '-'
      ],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
    ).stderr;
    segs = keepSegments(parseSilences(log), duration);
  }
  const cutTotal = segs.reduce((n, s) => n + s.end - s.start, 0);

  const tmp = mkdtempSync(join(tmpdir(), 'reels-'));
  const fonts = await loadFonts();
  const overlays = [];
  if (o.title) {
    const file = join(tmp, 'title.png');
    await renderPng(captionTree(o.title, { size: 72 }), fonts, file);
    overlays.push({ file, y: SAFE + 60, start: 0, end: Math.min(3, cutTotal) });
  }
  if (o.cta) {
    const file = join(tmp, 'cta.png');
    const height = await renderPng(captionTree(o.cta, { size: 64 }), fonts, file);
    overlays.push({
      file,
      // split: в центре верхней половины, чтобы не наезжать на субтитры на стыке
      y: split ? (HALF - height) / 2 : (H - height) / 2,
      start: Math.max(0, cutTotal - 2.5),
      end: cutTotal + 1
    });
  }
  if (o.srt) {
    let cues = mergeShortCues(parseSrt(readFileSync(o.srt, 'utf8')));
    if (words > 0) cues = splitWords(cues, words);
    for (const [i, cue] of cues.entries()) {
      const start = mapTime(cue.start, segs);
      const end = mapTime(cue.end, segs);
      if (end - start < 0.1) continue;
      const file = join(tmp, `cap-${i}.png`);
      const height = await renderPng(captionTree(cue.text, { size: words ? 64 : 60 }), fonts, file);
      // split: на стыке половин, как у разговорных роликов; иначе — над нижней безопасной зоной
      const y = split ? HALF - height / 2 : H - SAFE - 120 - height;
      overlays.push({ file, y, start, end });
    }
  }

  const f = buildGraph({ segs, hasAudio, overlays, split, cutTotal });

  const outDir = resolve('content/video/out');
  mkdirSync(outDir, { recursive: true });
  const out = o.out
    ? resolve(outDir, o.out)
    : join(outDir, `${basename(o.input, extname(o.input))}-reels.mp4`);
  const filterFile = join(tmp, 'graph.txt');
  writeFileSync(filterFile, f.join(';\n'));
  run('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    o.input,
    ...(split
      ? [
          ...(/\.(png|jpe?g|webp)$/i.test(o.top)
            ? ['-loop', '1', '-t', cutTotal.toFixed(3)]
            : ['-stream_loop', '-1']),
          '-i',
          o.top
        ]
      : []),
    ...overlays.flatMap(ov => ['-i', ov.file]),
    '-filter_complex_script',
    filterFile,
    '-map',
    `[b${overlays.length}]`,
    ...(hasAudio ? ['-map', '[aout]', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000'] : []),
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '20',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-t',
    cutTotal.toFixed(3),
    out
  ]);
  console.log(
    `Готово: ${out}\nДлительность: ${duration.toFixed(1)}s → ${cutTotal.toFixed(1)}s (вырезано пауз: ${(duration - cutTotal).toFixed(1)}s, кусков: ${segs.length}), подписей: ${overlays.length}`
  );
  return { out, segs, overlays };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch(e => {
    console.error(e.message);
    process.exit(1);
  });
}
