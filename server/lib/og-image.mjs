// Картинки для соцсетей (og:image) 1200×630: разметка → SVG (satori) → PNG (resvg).
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { createHash } from 'node:crypto';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
const C = { bg: '#f3f2eb', text: '#171a15', muted: '#60665a', mint: '#b6e9b0', orange: '#f45a36' };
const h = (type, style, children) => ({ type, props: { style, children } });

export function titleSize(title) {
  const n = [...title].length;
  return n <= 40 ? 76 : n <= 70 ? 62 : n <= 100 ? 52 : 44;
}

export function clip(text, max) {
  const chars = [...String(text || '').trim()];
  if (chars.length <= max) return chars.join('');
  const cut = chars.slice(0, max).join('');
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 15)).trimEnd() + '…';
}

/** Короткая версия содержимого: меняется вместе с текстом и сбрасывает кэш соцсетей. */
export function ogVersion(post) {
  return createHash('sha256')
    .update([post.title, post.category, post.locale].join('\n'))
    .digest('hex')
    .slice(0, 10);
}

/** brand: { name, domain, author } — передаёт маршрут (импорт #shared работает только в сборке Nuxt). */
export function articleTree({ title, category, locale }, brand) {
  const label = locale === 'uz' ? 'Blog' : 'Журнал';
  const heading = clip(title, 130);
  return h(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 72px',
      background: C.bg,
      color: C.text,
      fontFamily: family('Manrope'),
      position: 'relative'
    },
    [
      h('div', {
        position: 'absolute',
        right: -120,
        top: -120,
        width: 420,
        height: 420,
        borderRadius: 420,
        background: C.mint
      }),
      h('div', {
        position: 'absolute',
        right: 96,
        bottom: 92,
        width: 64,
        height: 64,
        borderRadius: 64,
        background: C.orange
      }),
      h('div', { display: 'flex', alignItems: 'center', gap: 16 }, [
        h('div', { width: 22, height: 22, background: C.text, borderRadius: 6 }),
        h(
          'div',
          {
            fontFamily: family('Unbounded'),
            fontSize: 24,
            letterSpacing: 1,
            textTransform: 'uppercase'
          },
          brand.name
        )
      ]),
      h('div', { display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 960 }, [
        h(
          'div',
          {
            display: 'flex',
            alignSelf: 'flex-start',
            padding: '8px 20px',
            borderRadius: 40,
            background: C.text,
            color: C.bg,
            fontSize: 24
          },
          [label, category ? ` · ${clip(category, 40)}` : ''].join('')
        ),
        h(
          'div',
          {
            fontFamily: family('Unbounded'),
            fontSize: titleSize(heading),
            lineHeight: 1.12,
            letterSpacing: -1
          },
          heading
        )
      ]),
      h(
        'div',
        { display: 'flex', fontSize: 26, color: C.muted },
        `${brand.author} · ${brand.domain}`
      )
    ]
  );
}

export async function renderArticleImage(post, fonts, brand) {
  const svg = await satori(articleTree(post, brand), { width: OG_WIDTH, height: OG_HEIGHT, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
}

/** Файлы шрифтов → формат satori. Несколько файлов одного семейства дополняют друг друга. */
export function ogFonts(files) {
  return files.map(({ name, data }) => {
    const display = name.startsWith('unbounded');
    const subset = name.match(/-(latin-ext|latin|cyrillic)-/)?.[1] || 'latin';
    return {
      name: `${display ? 'Unbounded' : 'Manrope'}-${subset}`,
      data,
      weight: display ? 800 : 600,
      style: 'normal'
    };
  });
}
// satori берёт глифы из первого подходящего по имени файла, поэтому наборы символов перечислены явно.
const family = base => [`${base}-latin`, `${base}-cyrillic`, `${base}-latin-ext`].join(', ');
