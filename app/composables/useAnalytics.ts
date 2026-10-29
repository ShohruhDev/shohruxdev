// Цели в Метрике и GA4; без настроенных счётчиков ничего не делает.
export function useAnalytics(){
 const c=useRuntimeConfig().public
 const goal=(name:string,gaName=name,params:Record<string,string>={})=>{
  if(!import.meta.client)return
  const w=window as any
  if(c.metrikaId&&w.ym)w.ym(Number(c.metrikaId),'reachGoal',name,params)
  if(c.gaId&&w.gtag)w.gtag('event',gaName,params)
 }
 return {goal}
}
