import { localizePost } from '#shared/locale.mjs';
import { ogVersion } from '../lib/og-image.mjs';
export default defineEventHandler(event => {
  const lang = getQuery(event).lang === 'uz' ? 'uz' : 'ru';
  return publicPostList()
    .map(p => localizePost(p, lang))
    .filter(Boolean)
    .map(p => ({ ...p, ogVersion: ogVersion(p) }));
});
