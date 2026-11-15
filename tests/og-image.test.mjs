import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  OG_HEIGHT,
  OG_WIDTH,
  clip,
  ogFonts,
  ogVersion,
  renderArticleImage,
  titleSize
} from '../server/lib/og-image.mjs';
import { authorFor, brandDomain, brandName } from '../shared/brand.mjs';
const brand = locale => ({ name: brandName, domain: brandDomain, author: authorFor(locale) });

const dir = 'server/assets/og-fonts';
const fonts = ogFonts(
  readdirSync(dir)
    .filter(f => f.endsWith('.woff'))
    .map(name => ({ name, data: readFileSync(join(dir, name)) }))
);

test('title helpers keep long headings readable', () => {
  assert.equal(titleSize('Коротко'), 76);
  assert.equal(titleSize('x'.repeat(120)), 44);
  assert.equal(clip('короткий текст', 50), 'короткий текст');
  const long = clip('слово '.repeat(40), 60);
  assert.ok([...long].length <= 61 && long.endsWith('…'));
});

test('version changes with visible content only', () => {
  const a = { title: 'A', category: 'B', locale: 'ru', description: 'x' };
  assert.equal(ogVersion(a), ogVersion({ ...a, description: 'y' }));
  assert.notEqual(ogVersion(a), ogVersion({ ...a, title: 'A2' }));
  assert.notEqual(ogVersion(a), ogVersion({ ...a, locale: 'uz' }));
});

test('renders 1200x630 PNG for Russian and Uzbek titles', async () => {
  assert.equal(fonts.length, 6);
  // Одинаковые имена приводят к «квадратам» вместо латиницы: satori берёт первый файл.
  assert.equal(new Set(fonts.map(f => f.name)).size, 6);
  for (const post of [
    { title: 'Что подготовить перед заказом сайта', category: 'Сайты', locale: 'ru' },
    {
      title: 'Sayt buyurtma qilishdan oldin nimalarni tayyorlash kerak: oʻzbekcha gʻ',
      category: 'Saytlar',
      locale: 'uz'
    }
  ]) {
    const png = await renderArticleImage(post, fonts, brand(post.locale));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), OG_WIDTH);
    assert.equal(png.readUInt32BE(20), OG_HEIGHT);
  }
});
