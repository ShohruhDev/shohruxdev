export default defineNuxtPlugin(nuxtApp=>{
 const c=useRuntimeConfig().public;const router=useRouter()
 if(!c.indexable||(!c.metrikaId&&!c.gaId))return
 const w=window as any,id=Number(c.metrikaId)
 const load=(src:string)=>{const s=document.createElement('script');s.async=true;s.src=src;document.head.appendChild(s)}
 if(id){w.ym=w.ym||function(){(w.ym.a=w.ym.a||[]).push(arguments)};w.ym.l=Date.now();w.ym(id,'init',{defer:true,clickmap:true,trackLinks:true,accurateTrackBounce:true});load('https://mc.yandex.ru/metrika/tag.js')}
 if(c.gaId){w.dataLayer=w.dataLayer||[];w.gtag=function(){w.dataLayer.push(arguments)};w.gtag('js',new Date());w.gtag('config',c.gaId,{send_page_view:false});load(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(c.gaId)}`)}
 // SPA: просмотр отправляем вручную после каждой смены страницы, когда заголовок уже обновлён.
 let referer=document.referrer,last=''
 nuxtApp.hook('page:finish',()=>setTimeout(()=>{
  const path=router.currentRoute.value.fullPath;if(path.startsWith('/admin')||path===last)return;last=path
  const url=location.origin+path
  if(id)w.ym(id,'hit',url,{title:document.title,referer})
  if(c.gaId)w.gtag('event','page_view',{page_location:url,page_title:document.title})
  referer=url
 },0))
})
