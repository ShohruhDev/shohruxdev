import { demoPosts } from '../lib/demo-posts.mjs';
import { demoTranslations } from '../lib/demo-posts-uz.mjs';
import { localizePost } from '#shared/locale.mjs';
export default defineEventHandler(event => {
  const lang = getQuery(event).lang === 'uz' ? 'uz' : 'ru';
  const posts = storage().publicPosts();
  const all = useRuntimeConfig().public.indexable
    ? posts
    : [
        ...posts,
        ...demoPosts
          .filter(p => !posts.some((x: any) => x.slug === p.slug))
          .map(p => ({
            ...p,
            translations: { uz: demoTranslations[p.slug as keyof typeof demoTranslations] }
          }))
      ];
  return all.map(p => localizePost(p, lang)).filter(Boolean);
});
