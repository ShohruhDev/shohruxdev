// Картинки для соцсетей (og:image) 1200×630: разметка → SVG (satori) → PNG (resvg).
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { createHash } from 'node:crypto';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
const C = { bg: '#ffffff', text: '#1f1f1f', muted: '#6b6b6b', accent: '#2457f5', line: '#e7e5e1' };
// Знак бренда (как public/brand/mark.svg), вставляется картинкой — satori поддерживает SVG data URI.
const MARK = `data:image/svg+xml;base64,${Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A6BFF"/><stop offset="1" stop-color="#1C44D6"/></linearGradient></defs><rect width="64" height="64" rx="18" fill="url(#g)"/><path d="M16 50.5V31C16 21 24 14.5 32 10 40 14.5 48 21 48 31V50.5" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M25.5 23.5V45.6L30.6 40.9L34.4 48.7L38.2 47L34.6 39.4H41.4Z" fill="#fff"/><circle cx="48" cy="50.5" r="4.4" fill="#FF6B3D"/></svg>'
).toString('base64')}`;
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

// Версия шаблона: увеличить при изменении оформления или подписи
// (2 — имя автора кириллицей на RU, 3 — Montserrat и стиль DESIGN.md без плашек).
export const OG_TEMPLATE = 3;
/** Короткая версия содержимого: меняется вместе с текстом и сбрасывает кэш соцсетей. */
export function ogVersion(post) {
  return createHash('sha256')
    .update([OG_TEMPLATE, post.title, post.category, post.locale].join('\n'))
    .digest('hex')
    .slice(0, 10);
}

/** Общая карточка 1200×630 по DESIGN.md: белый фон, знак и словесный логотип, подпись, заголовок, низ. */
export function cardTree({ label, title, footer }, brand) {
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
      fontFamily: family('Montserrat'),
      fontWeight: 400
    },
    [
      h('div', { display: 'flex', alignItems: 'center', gap: 16 }, [
        { type: 'img', props: { src: MARK, width: 56, height: 56 } },
        h('div', { display: 'flex', flexDirection: 'column', gap: 6 }, [
          h('div', { fontSize: 28, fontWeight: 700, lineHeight: 1 }, brand.name.split(' ')[0]),
          h(
            'div',
            {
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 4.5,
              textTransform: 'uppercase',
              color: C.muted,
              lineHeight: 1
            },
            brand.name.split(' ').slice(1).join(' ')
          )
        ])
      ]),
      h(
        'div',
        { display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000 },
        [
          label ? h('div', { fontSize: 24, fontWeight: 600, color: C.accent }, label) : null,
          h('div', { fontSize: titleSize(heading), fontWeight: 600, lineHeight: 1.18 }, heading)
        ].filter(Boolean)
      ),
      h(
        'div',
        {
          display: 'flex',
          paddingTop: 24,
          borderTop: `1px solid ${C.line}`,
          fontSize: 24,
          color: C.muted
        },
        footer
      )
    ]
  );
}

/** brand: { name, domain, author } — передаёт маршрут (импорт #shared работает только в сборке Nuxt). */
export function articleTree({ title, category, locale }, brand) {
  const label = [locale === 'uz' ? 'Blog' : 'Журнал', category && clip(category, 40)]
    .filter(Boolean)
    .join(' · ');
  return cardTree({ label, title, footer: `${brand.author} · ${brand.domain}` }, brand);
}

export async function renderArticleImage(post, fonts, brand) {
  const svg = await satori(articleTree(post, brand), { width: OG_WIDTH, height: OG_HEIGHT, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
}

/** Файлы шрифтов Montserrat (montserrat-<набор>-<вес>-normal.woff) → формат satori. */
export function ogFonts(files) {
  return files.map(({ name, data }) => ({
    name: `Montserrat-${name.match(/-(latin-ext|latin|cyrillic)-/)?.[1] || 'latin'}`,
    data,
    weight: Number(name.match(/-(\d00)-/)?.[1] || 400),
    style: 'normal'
  }));
}
// satori берёт глифы из первого подходящего по имени файла, поэтому наборы символов перечислены явно.
const family = base => [`${base}-latin`, `${base}-cyrillic`, `${base}-latin-ext`].join(', ');
