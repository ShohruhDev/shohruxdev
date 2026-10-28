export default defineNuxtRouteMiddleware(async to=>{
 if(to.path.length>1&&to.path.endsWith('/'))return navigateTo({path:to.path.replace(/\/+$/,''),query:to.query,hash:to.hash},{redirectCode:301,replace:true})
 const available=useState<string[]>('page-languages',()=>['ru','uz'])
 if(/^\/(?:uz\/)?journal\/[^/]+\/?$/.test(to.path)){
  const posts=await useRequestFetch()<any[]>('/api/posts',{query:{lang:'ru'}})
  available.value=posts.find(p=>p.slug===to.params.slug)?.availableLocales||['ru']
 }else available.value=to.path==='/admin'?['ru']:['ru','uz']
})
