import { demoPosts } from '../lib/demo-posts.mjs';
import { demoTranslations } from '../lib/demo-posts-uz.mjs';
/** Опубликованные статьи; демонстрационные — только в неиндексируемой сборке. */
export function publicPostList(): any[] {
  const posts = storage().publicPosts();
  if (useRuntimeConfig().public.indexable) return posts;
  return [
    ...posts,
    ...demoPosts
      .filter(p => !posts.some((x: any) => x.slug === p.slug))
      .map(p => ({
        ...p,
        translations: { uz: demoTranslations[p.slug as keyof typeof demoTranslations] }
      }))
  ];
}
