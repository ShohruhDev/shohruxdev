export function validateLead(input) {
  if (!input || typeof input !== 'object' || input.consent !== true || input.website) throw new Error('Проверьте поля и согласие на обработку данных.');
  const field=(key,min,max)=>{const s=input[key]; if(typeof s!=='string'||s.trim().length<min||s.length>max)throw new Error('Проверьте имя, контакт и описание задачи.');return s.trim();};
  const name=field('name',2,100), contact=field('contact',5,200), message=field('message',10,5000);
  const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const telegram=/^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/;
  const phone=/^\+?[\d\s()\-]{9,24}$/;
  const digits=contact.replace(/\D/g,'');
  const validPhone=phone.test(contact)&&digits.length>=9&&digits.length<=15;
  if(!email.test(contact)&&!telegram.test(contact)&&!validPhone)throw new Error('Укажите email, телефон или Telegram в формате @username.');
  if(!['web','apps','mobile','unsure'].includes(input.service))throw new Error('Выберите направление.');
  if(typeof input.budget!=='string'||input.budget.length>100)throw new Error('Проверьте бюджет.');
  return {name,contact,message,service:input.service,budget:input.budget.trim(),consent:true,locale:input.locale==='uz'?'uz':'ru',attribution:cleanAttribution(input.attribution)};
}

export function validateDraft(p) {
  if(!p||typeof p!=='object'||!/^([a-z0-9]+-)*[a-z0-9]+$/.test(p.slug)||p.slug.length>100)throw new Error('Invalid slug');
  for(const k of ['title','description','category'])if(typeof p[k]!=='string'||!p[k].trim()||p[k].length>350)throw new Error('Invalid '+k);
  if(p.service!==undefined&&!['websites','web-apps','mobile-apps'].includes(p.service))throw new Error('Invalid service');
  if(!Array.isArray(p.content)||!p.content.length||p.content.length>40)throw new Error('Invalid content');
  for(const s of p.content)if(typeof s.heading!=='string'||typeof s.body!=='string'||!s.body.trim()||s.heading.length>200||s.body.length>10000)throw new Error('Invalid section');
  for(const key of ['answer','author'])if(p[key]!==undefined&&(typeof p[key]!=='string'||p[key].length>(key==='author'?150:2000)))throw new Error('Invalid '+key);
  if(p.faq!==undefined&&(!Array.isArray(p.faq)||p.faq.length>12||p.faq.some(q=>!q||typeof q.question!=='string'||!q.question.trim()||q.question.length>300||typeof q.answer!=='string'||!q.answer.trim()||q.answer.length>2000)))throw new Error('Invalid FAQ');
  if(!Array.isArray(p.sources)||p.sources.length>30)throw new Error('Invalid sources');
  for(const s of p.sources){const u=new URL(s.url);if(u.protocol!=='https:'||u.username||u.password||s.url.length>2000||typeof s.title!=='string'||s.title.length>300)throw new Error('Invalid source');}
  if(p.translations!==undefined){
    if(!p.translations||typeof p.translations!=='object'||Array.isArray(p.translations)||Object.keys(p.translations).some(k=>k!=='uz'))throw new Error('Invalid translations');
    if(p.translations.uz){const u=p.translations.uz;if(Object.keys(u).some(k=>!['title','description','category','answer','content','faq','sources','readTime'].includes(k)))throw new Error('Invalid translation fields');if(u.translations!==undefined)throw new Error('Nested translations not allowed');validateDraft({slug:p.slug,service:p.service,author:p.author,...u,translations:undefined});}
  }
  return p;
}

export function cleanAttribution(input={}) {
 if(!input||typeof input!=='object')input={};
 const clean=v=>typeof v==='string'?v.replace(/[^a-zA-Z0-9._-]/g,'').slice(0,100):'';
 let referrer='';try{const url=new URL(input.referrer);if(['https:','http:'].includes(url.protocol))referrer=url.hostname.toLowerCase()}catch{}
 const source=clean(input.source).toLowerCase();const medium=clean(input.medium).toLowerCase();
 const signal=source||referrer;let channel='direct';
 if(/(^|\.)(chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$/.test(signal)||['chatgpt','perplexity','claude','gemini'].includes(signal))channel='ai';
 else if(['cpc','ppc','paid'].includes(medium))channel='paid';
 else if(/(^|\.)(google\.[a-z.]+|bing\.com|yandex\.[a-z.]+)$/.test(signal))channel='search';
 else if(['telegram','linkedin','instagram','youtube','facebook','vc','habr'].some(s=>signal===s||signal.includes(s+'.'))||signal==='t.me')channel='social';
 else if(signal)channel='referral';
 const landing=typeof input.landing==='string'&&/^\/(?!\/)/.test(input.landing)?input.landing.split(/[?#]/)[0].replace(/[^\p{L}\p{N}/_.%-]/gu,'').slice(0,250):'/';
 return {source,medium,campaign:clean(input.campaign),referrer,landing,channel};
}
