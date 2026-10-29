export default defineEventHandler(event=>{
 const c=useRuntimeConfig();setHeader(event,'Content-Type','application/xml; charset=utf-8')
 const paths=['/','/services','/services/websites','/services/web-apps','/services/mobile-apps','/process','/calculator','/journal','/contact'].map(path=>({path,modified:''}))
 paths.push(...storage().publicPosts().map((p:any)=>({path:`/journal/${p.slug}`,modified:p.updatedAt>p.publishedAt?p.updatedAt:p.publishedAt})))
 paths.push(...paths.filter(p=>!p.path.startsWith('/journal/')||storage().post(p.path.split('/').pop())?.translations?.uz).map(p=>({...p,path:'/uz'+(p.path==='/'?'':p.path)})))
 const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')
 return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+(c.public.indexable?paths.map(p=>`<url><loc>${esc(new URL(p.path,c.public.siteUrl).href)}</loc>${p.modified?`<lastmod>${esc(p.modified)}</lastmod>`:''}</url>`).join(''):'')+'</urlset>'
})
