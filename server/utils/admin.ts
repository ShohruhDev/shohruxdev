import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto'
import type {H3Event} from 'h3'
const ephemeral=randomBytes(32).toString('hex')
const secret=()=>process.env.ADMIN_SESSION_SECRET||ephemeral
const digest=(s:string)=>createHash('sha256').update(s).digest()
export function localAdmin(event:H3Event){
 const c=useRuntimeConfig();const host=getRequestURL(event).hostname;const ip=getRequestIP(event,{xForwardedFor:false})
 return process.env.ADMIN_LOCAL_PREVIEW==='true'&&!c.public.indexable&&['127.0.0.1','localhost','[::1]'].includes(host)&&['127.0.0.1','::1','::ffff:127.0.0.1'].includes(ip||'')
}
export function adminConfigured(){return (process.env.ADMIN_PASSWORD||'').length>=16&&(process.env.ADMIN_SESSION_SECRET||'').length>=32}
export function adminPasswordMatches(password:string){return adminConfigured()&&timingSafeEqual(digest(password),digest(process.env.ADMIN_PASSWORD!))}
export function signedAdminSession(){const data=Buffer.from(JSON.stringify({exp:Date.now()+8*3600000})).toString('base64url');return data+'.'+createHmac('sha256',secret()).update(data).digest('base64url')}
export function adminAuthenticated(event:H3Event){
 if(!localAdmin(event)&&!adminConfigured())return false
 const cookie=getCookie(event,'editor_session');if(!cookie||cookie.length>500)return false
 const [data,mac]=cookie.split('.');if(!data||!mac)return false
 const expected=createHmac('sha256',secret()).update(data).digest('base64url')
 if(!timingSafeEqual(digest(mac),digest(expected)))return false
 try{return JSON.parse(Buffer.from(data,'base64url').toString()).exp>Date.now()}catch{return false}
}
export function requireAdmin(event:H3Event){if(!adminAuthenticated(event))throw createError({statusCode:401,statusMessage:'Войдите в редакцию.'})}
export function requireAdminOrigin(event:H3Event){if(getHeader(event,'origin')!==getRequestURL(event).origin)throw createError({statusCode:403,statusMessage:'Недопустимый источник запроса.'})}
export async function adminBody(event:H3Event){
 requireAdminOrigin(event)
 if(!getHeader(event,'content-type')?.startsWith('application/json'))throw createError({statusCode:415,statusMessage:'Требуется JSON.'})
 if(Number(getHeader(event,'content-length')||0)>200000)throw createError({statusCode:413,statusMessage:'Слишком большой материал.'})
 const raw=await readRawBody(event);if(!raw||Buffer.byteLength(raw)>200000)throw createError({statusCode:413,statusMessage:'Слишком большой материал.'})
 try{return JSON.parse(raw)}catch{throw createError({statusCode:400,statusMessage:'Некорректные данные.'})}
}
