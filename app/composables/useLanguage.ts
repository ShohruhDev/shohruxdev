import dictionary from '#shared/uz.json'
import {localeOf,localePath} from '#shared/locale.mjs'
export function useLanguage(){
 const route=useRoute();const locale=computed(()=>localeOf(route.path))
 const t=(text:string)=>locale.value==='uz'?(dictionary as Record<string,string>)[text]||text:text
 const localPath=(path:string)=>localePath(path,locale.value)
 const translateTree=<T,>(value:T):T=>{if(typeof value==='string')return t(value) as T;if(Array.isArray(value))return value.map(v=>translateTree(v)) as T;if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,translateTree(v)])) as T;return value}
 return {locale,t,localPath,translateTree}
}
