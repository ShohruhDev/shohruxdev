// Reels без съёмки: ролик из фирменных карточек, строки появляются по одной, в конце синяя карточка
// с призывом. Для недель, когда владелец не может сниматься. Стиль — как карточки ленты
// (public/social/brand/ig-*.jpg): белый фон, шапка с логотипом, Montserrat, акцент #2457f5.
//
//   npm run reels:cards -- content/video/cards/prices.json
//
// Сценарий (JSON):
//   {
//     "out": "2026-12-01-prices-cards.mp4",
//     "tag": "Цены",                         // плашка справа в шапке, необязательно
//     "voice": "content/video/raw/voice.m4a", // голос владельца, необязательно: слайды растянутся под него
//     "slides": [
//       { "eyebrow": "Цены 2026", "title": "Сколько стоит *сайт*", "lines": ["Лендинг — 2,5–5 млн сум"], "seconds": 5 }
//     ],
//     "cta": "Рассчитать стоимость — razrabotkatashkent.uz"
//   }
// Слова в *звёздочках* — синим акцентом. Цифры брать только из shared/pricing.mjs и shared/cases.mjs.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { W, H, SAFE, FAMILY, loadFonts } from './reels.mjs';

const C = {
  bg: '#ffffff',
  text: '#1f1f1f',
  muted: '#6b6b6b',
  accent: '#2457f5',
  accentSoft: '#eaf0ff',
  line: '#e6e4e0'
};
const CTA_SECONDS = 2.5;
const PADX = 72;

const h = (type, style, children, extra = {}) => ({ type, props: { style, children, ...extra } });

/** Текст со *звёздочками* → span-ы по словам, акцентные — синие. */
function rich(text) {
  let accent = false;
  return String(text)
    .split(/\s+/)
    .filter(Boolean)
    .map(word => {
      const opens = word.startsWith('*');
      const closes = word.endsWith('*') && (word.length > 1 || !opens);
      const on = accent || opens;
      accent = on && !closes;
      return h('span', on ? { color: C.accent } : {}, word.replace(/\*/g, ''));
    });
}

/**
 * Сценарий → состояния кадра: [{kind:'slide'|'cta', slide, visible, start, end}].
 * Слайд: сначала заголовок (visible=0), затем по одной строке; время слайда делится поровну.
 * total (длина голоса) — растягиваем слайды пропорционально, CTA всегда CTA_SECONDS.
 */
export function timeline(spec, total = null) {
  const slides = spec.slides || [];
  const base = slides.map(s => Number(s.seconds) || 3);
  const sum = base.reduce((a, b) => a + b, 0) || 1;
  const cta = spec.cta ? CTA_SECONDS : 0;
  const k = total ? Math.max(0.1, total - cta) / sum : 1;
  const out = [];
  let t = 0;
  slides.forEach((s, i) => {
    const states = (s.lines?.length || 0) + 1;
    const len = base[i] * k;
    for (let v = 0; v < states; v++) {
      const start = t + (len / states) * v;
      // последнее состояние заканчивается ровно на границе слайда — без накопления ошибки
      const end = v === states - 1 ? t + len : start + len / states;
      out.push({ kind: 'slide', slide: i, visible: v, start, end });
    }
    t += len;
  });
  if (spec.cta) out.push({ kind: 'cta', slide: null, visible: 0, start: t, end: t + cta });
  return out;
}

let logoUri = null;
function logo() {
  if (!logoUri)
    logoUri = `data:image/png;base64,${readFileSync(resolve('public/brand/logo-512.png')).toString('base64')}`;
  return logoUri;
}

function header(tag) {
  return h(
    'div',
    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
    [
      h('div', { display: 'flex', alignItems: 'center' }, [
        h('img', { width: 72, height: 72, borderRadius: 18 }, undefined, {
          src: logoUriSafe(),
          width: 72,
          height: 72
        }),
        h('div', { display: 'flex', flexDirection: 'column', marginLeft: 20 }, [
          h('span', { fontSize: 32, fontWeight: 700, color: C.text }, 'Razrabotka'),
          h('span', { fontSize: 18, fontWeight: 600, color: C.muted, letterSpacing: 4 }, 'TASHKENT')
        ])
      ]),
      tag
        ? h(
            'div',
            {
              display: 'flex',
              padding: '14px 32px',
              borderRadius: 40,
              background: C.accentSoft,
              color: C.accent,
              fontSize: 30,
              fontWeight: 600
            },
            tag
          )
        : h('div', { display: 'flex' }, '')
    ]
  );
}

// В тестах логотипа может не быть под рукой — тогда прозрачный пиксель.
function logoUriSafe() {
  try {
    return logo();
  } catch {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
}

/** Кадр слайда: шапка, надзаголовок, заголовок, строки (первые visible — видны, остальные прозрачные). */
export function slideTree(slide, visible, { tag } = {}) {
  const lines = (slide.lines || []).map((line, i) =>
    h(
      'div',
      {
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: 12,
        padding: '28px 0',
        borderBottom: `2px solid ${C.line}`,
        fontSize: 48,
        fontWeight: 600,
        color: C.text,
        opacity: i < visible ? 1 : 0
      },
      rich(line)
    )
  );
  return h(
    'div',
    {
      width: W,
      height: H,
      display: 'flex',
      flexDirection: 'column',
      background: C.bg,
      fontFamily: FAMILY,
      padding: `${SAFE}px ${PADX}px ${SAFE}px`
    },
    [
      header(tag),
      h(
        'div',
        { display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' },
        [
          slide.eyebrow
            ? h(
                'div',
                {
                  display: 'flex',
                  fontSize: 32,
                  fontWeight: 700,
                  color: C.accent,
                  letterSpacing: 3,
                  marginBottom: 24,
                  textTransform: 'uppercase'
                },
                slide.eyebrow
              )
            : null,
          h(
            'div',
            {
              display: 'flex',
              flexWrap: 'wrap',
              columnGap: 22,
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.12,
              color: C.text,
              marginBottom: lines.length ? 48 : 0
            },
            rich(slide.title || '')
          ),
          ...lines
        ].filter(Boolean)
      ),
      h(
        'div',
        { display: 'flex', fontSize: 30, fontWeight: 600, color: C.text },
        'razrabotkatashkent.uz'
      )
    ]
  );
}

/** Финальная карточка: синий фон, белый текст по центру. «Действие — сайт» делим на две строки. */
export function ctaTree(text) {
  const [action, ...rest] = String(text).split(/\s+—\s+/);
  const site = rest.join(' — ');
  return h(
    'div',
    {
      width: W,
      height: H,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: C.accent,
      fontFamily: FAMILY,
      padding: `${SAFE}px ${PADX}px`,
      color: '#ffffff'
    },
    [
      h(
        'div',
        {
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          textAlign: 'center',
          columnGap: 20,
          fontSize: 80,
          fontWeight: 700,
          lineHeight: 1.15
        },
        action
          .split(/\s+/)
          .filter(Boolean)
          .map(w => h('span', {}, w))
      ),
      site
        ? h('div', { display: 'flex', marginTop: 40, fontSize: 48, fontWeight: 600 }, site)
        : null
    ].filter(Boolean)
  );
}

async function render(tree, fonts, file) {
  const { default: satori } = await import('satori');
  const { Resvg } = await import('@resvg/resvg-js');
  const svg = await satori(tree, { width: W, height: H, fonts });
  writeFileSync(file, new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng());
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`${cmd} упал:\n${(r.stderr || '').slice(-2000)}`);
  return r;
}

export async function main(argv = process.argv.slice(2)) {
  const file = argv[0];
  if (!file) {
    console.log('npm run reels:cards -- <сценарий.json>');
    process.exit(1);
  }
  const spec = JSON.parse(readFileSync(file, 'utf8'));
  const voice = spec.voice ? resolve(spec.voice) : null;
  const total = voice
    ? Number(
        run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', voice])
          .stdout
      )
    : null;
  const states = timeline(spec, total);
  const fonts = await loadFonts();
  const tmp = mkdtempSync(join(tmpdir(), 'reels-cards-'));
  const list = [];
  for (const [i, s] of states.entries()) {
    const png = join(tmp, `s${String(i).padStart(3, '0')}.png`);
    await render(
      s.kind === 'cta' ? ctaTree(spec.cta) : slideTree(spec.slides[s.slide], s.visible, spec),
      fonts,
      png
    );
    list.push(`file '${png}'\nduration ${(s.end - s.start).toFixed(3)}`);
  }
  // concat-демуксер требует повторить последний кадр, иначе его длительность теряется
  list.push(`file '${join(tmp, `s${String(states.length - 1).padStart(3, '0')}.png`)}'`);
  const listFile = join(tmp, 'list.txt');
  writeFileSync(listFile, list.join('\n'));

  const length = states.at(-1).end;
  const outDir = resolve('content/video/out');
  mkdirSync(outDir, { recursive: true });
  const out = resolve(outDir, spec.out || 'cards-reels.mp4');
  mkdirSync(dirname(out), { recursive: true });
  run('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    listFile,
    ...(voice ? ['-i', voice] : ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo']),
    '-filter_complex',
    `[0:v]fps=30,format=yuv420p[v];[1:a]${voice ? 'loudnorm=I=-14:TP=-1.5:LRA=11,' : ''}apad[a]`,
    '-map',
    '[v]',
    '-map',
    '[a]',
    '-t',
    length.toFixed(3),
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '20',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-ar',
    '48000',
    '-movflags',
    '+faststart',
    out
  ]);
  console.log(
    `Готово: ${out}\nДлительность: ${length.toFixed(1)}s, кадров-состояний: ${states.length}`
  );
  return { out, states };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch(e => {
    console.error(e.message);
    process.exit(1);
  });
}
