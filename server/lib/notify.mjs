const services={web:'Сайт',apps:'Веб-сервис',mobile:'Мобильное приложение',unsure:'Пока не знает'};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export function leadMessage(lead,id,siteUrl=''){
 const a=lead.attribution||{};
 const source=[a.channel,a.source||a.referrer,a.campaign].filter(Boolean).join(' · ');
 return [`<b>Новая заявка</b> (${lead.locale==='uz'?'UZ':'RU'})`,`<b>Имя:</b> ${esc(lead.name)}`,`<b>Контакт:</b> ${esc(lead.contact)}`,`<b>Направление:</b> ${esc(services[lead.service]||lead.service)}`,...(lead.budget?[`<b>Бюджет:</b> ${esc(lead.budget)}`]:[]),'',esc(lead.message.slice(0,3000)),'',`<b>Источник:</b> ${esc(source||'direct')}, вход: ${esc(a.landing||'/')}`,`ID: ${esc(id)}${siteUrl?` · ${esc(siteUrl)}/admin`:''}`].join('\n');
}
// Заявка уже сохранена в базе; сбой Telegram не должен ломать отправку формы.
export async function notifyLead(lead,id,{env=process.env,fetcher=fetch}={}){
 const token=env.TELEGRAM_BOT_TOKEN,chat=env.TELEGRAM_CHAT_ID;if(!token||!chat)return {status:'unconfigured'};
 try{
  const r=await fetcher(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chat,text:leadMessage(lead,id,env.SITE_URL),parse_mode:'HTML',disable_web_page_preview:true}),signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw Error(`HTTP ${r.status}`);return {status:'sent'};
 }catch(e){console.error(`Telegram lead notification failed for ${id}: ${e instanceof Error?e.message:'unknown error'}`);return {status:'failed'};}
}
