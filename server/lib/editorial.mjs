import {randomUUID,createHash} from 'node:crypto';
import {validateDraft} from './core.mjs';
export const localDay=(time)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tashkent',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(time));
export function qualityIssues(p){
 const issues=[];
 if(!p.answer||p.answer.trim().length<80)issues.push('Добавьте короткий ответ на главный вопрос (от 80 символов).');
 if(!p.author?.trim())issues.push('Укажите автора.');
 if(p.content.length<4||p.content.reduce((n,s)=>n+s.body.length,0)<2500)issues.push('Нужен содержательный материал: минимум 4 раздела и 2500 символов текста.');
 if(!p.sources.length)issues.push('Добавьте проверяемые первичные источники.');
 if(!p.faq||p.faq.length<2)issues.push('Ответьте минимум на два вопроса заказчика.');
 if(p.translations?.uz)issues.push(...qualityIssues({...p.translations.uz,author:p.author}).map(i=>'UZ: '+i));
 return issues;
}
export function editorialStore(db,log){
 db.exec(`CREATE TABLE IF NOT EXISTS topics(slug TEXT PRIMARY KEY,payload TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'queued',created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS generation_runs(id TEXT PRIMARY KEY,day TEXT NOT NULL,topic TEXT NOT NULL,status TEXT NOT NULL,started_at TEXT NOT NULL,finished_at TEXT,error TEXT,usage TEXT);
 CREATE TABLE IF NOT EXISTS worker_state(key TEXT PRIMARY KEY,value TEXT NOT NULL);`);
 const tx=fn=>{db.exec('BEGIN IMMEDIATE');try{const value=fn();db.exec('COMMIT');return value}catch(e){db.exec('ROLLBACK');throw e}};
 const post=slug=>{const r=db.prepare('SELECT * FROM posts WHERE slug=?').get(slug);return r?{...JSON.parse(r.payload),revision:createHash('sha256').update(JSON.stringify(r)).digest('hex'),status:r.status,scheduledAt:r.scheduled_at,publishedAt:r.published_at}:null};
 return {
  post,
  editorialState(){return {posts:db.prepare('SELECT slug FROM posts ORDER BY rowid DESC').all().map(r=>{const p=post(r.slug);return {...p,issues:qualityIssues(p)}}),topics:db.prepare('SELECT * FROM topics ORDER BY created_at,rowid').all().map(r=>({...JSON.parse(r.payload),status:r.status})),runs:db.prepare('SELECT * FROM generation_runs ORDER BY started_at DESC LIMIT 40').all(),heartbeat:db.prepare("SELECT value FROM worker_state WHERE key='heartbeat'").get()?.value||null};},
  heartbeat(now){db.prepare("INSERT INTO worker_state VALUES('heartbeat',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(now);},
  addTopic(p){
   if(!p||typeof p.slug!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||p.slug.length>100)throw Error('URL темы: латинские буквы, цифры и дефисы.');
   if(typeof p.title!=='string'||p.title.trim().length<5||p.title.length>200||typeof p.brief!=='string'||p.brief.trim().length<10||p.brief.length>3000)throw Error('Укажите тему и задачу материала.');
   if(!['websites','web-apps','mobile-apps'].includes(p.service))throw Error('Выберите услугу.');
   if(db.prepare('SELECT slug FROM posts WHERE slug=?').get(p.slug))throw Error('Статья с таким URL уже существует.');
   db.prepare('INSERT INTO topics(slug,payload,created_at) VALUES(?,?,?)').run(p.slug,JSON.stringify({slug:p.slug,title:p.title.trim(),brief:p.brief.trim(),service:p.service}),new Date().toISOString());
  },
  topicStatus(slug,status){if(!['queued','paused'].includes(status))throw Error('Неверный статус');const r=db.prepare("UPDATE topics SET status=? WHERE slug=? AND status IN ('queued','paused','failed')").run(status,slug);if(!r.changes)throw Error('Эту тему сейчас нельзя изменить.');},
  editPost(p,expectedRevision){validateDraft(p);return tx(()=>{const old=post(p.slug);if(!old)throw Error('Статья не найдена');if(expectedRevision!==undefined&&old.revision!==expectedRevision)throw Error('Статья изменена в другой вкладке. Откройте актуальную версию и повторите проверку.');if(old.status==='published')throw Error('Сначала снимите материал с публикации.');const clean={slug:p.slug,title:p.title,description:p.description,category:p.category,service:p.service,answer:p.answer||'',author:p.author||'',content:p.content,faq:p.faq||[],sources:p.sources,...(p.translations?{translations:p.translations}:{}),updatedAt:new Date().toISOString(),...(old.generation?{generation:old.generation}:{})};db.prepare("UPDATE posts SET payload=?,status='draft',scheduled_at=NULL WHERE slug=?").run(JSON.stringify(clean),p.slug);log('edited',p.slug);});},
  schedulePost(slug,time,checks,expectedRevision){return tx(()=>{
   const p=post(slug);if(!p||p.status==='published')throw Error('Нужен черновик.');
   if(expectedRevision!==undefined&&p.revision!==expectedRevision)throw Error('Статья изменена в другой вкладке. Откройте актуальную версию и повторите проверку.');
   const issues=qualityIssues(p);if(issues.length)throw Error(issues.join(' '));
   if(p.translations?.uz&&checks?.translation!==true)throw Error('Подтвердите проверку узбекского перевода.');
   if(!checks||checks.facts!==true||checks.sources!==true||checks.originality!==true)throw Error('Подтвердите проверку фактов, источников и пользы материала.');
   if(typeof time!=='string'||!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(time)||!Number.isFinite(Date.parse(time)))throw Error('Укажите дату и часовой пояс.');
   const iso=new Date(time).toISOString();
   if(db.prepare("SELECT slug FROM posts WHERE status='approved' AND scheduled_at=? AND slug<>?").get(iso,slug))throw Error('На это время уже запланирована статья.');
   db.prepare("UPDATE posts SET status='approved',scheduled_at=? WHERE slug=?").run(iso,slug);log('reviewed-and-scheduled',slug);
  });},
  unpublish(slug){const r=db.prepare("UPDATE posts SET status='draft',scheduled_at=NULL,published_at=NULL WHERE slug=?").run(slug);if(!r.changes)throw Error('Статья не найдена');log('unpublished',slug);},
  claimGeneration({now=new Date().toISOString(),monthlyLimit=30}={}){return tx(()=>{
   const day=localDay(now),expired=new Date(Date.parse(now)-10*60000).toISOString();
   const stale=db.prepare("SELECT * FROM generation_runs WHERE status='running' AND started_at<?").all(expired);
   for(const r of stale){db.prepare("UPDATE generation_runs SET status='failed',finished_at=?,error='Выполнение прервано. Повтор возможен в другой день.' WHERE id=?").run(now,r.id);db.prepare("UPDATE topics SET status='failed' WHERE slug=?").run(r.topic);}
   if(db.prepare("SELECT id FROM generation_runs WHERE status='running' OR day=?").get(day))return null;
   if(db.prepare('SELECT COUNT(*) AS n FROM generation_runs WHERE day LIKE ?').get(day.slice(0,7)+'%').n>=monthlyLimit)return null;
   db.prepare("UPDATE topics SET status='drafted' WHERE status IN ('queued','paused','failed') AND slug IN (SELECT slug FROM posts)").run();
   const topic=db.prepare("SELECT * FROM topics WHERE status='queued' ORDER BY created_at,rowid LIMIT 1").get();if(!topic)return null;
   const id=randomUUID();db.prepare('INSERT INTO generation_runs(id,day,topic,status,started_at) VALUES(?,?,?,\'running\',?)').run(id,day,topic.slug,now);db.prepare("UPDATE topics SET status='generating' WHERE slug=?").run(topic.slug);return {id,topic:JSON.parse(topic.payload)};
  });},
  finishGeneration(id,{draft,error,usage}={}){return tx(()=>{
   const run=db.prepare("SELECT * FROM generation_runs WHERE id=? AND status='running'").get(id);if(!run)throw Error('Запуск уже завершён.');
   if(draft){validateDraft(draft);if(draft.slug!==run.topic)throw Error('URL статьи отличается от темы.');db.prepare('INSERT INTO posts(slug,payload) VALUES(?,?)').run(draft.slug,JSON.stringify(draft));log('generated-draft',draft.slug);}
   else if(!error)throw Error('Нет результата генерации.');
   db.prepare('UPDATE generation_runs SET status=?,finished_at=?,error=?,usage=? WHERE id=?').run(draft?'complete':'failed',new Date().toISOString(),error||null,usage?JSON.stringify(usage):null,id);
   db.prepare('UPDATE topics SET status=? WHERE slug=?').run(draft?'drafted':'failed',run.topic);
  });}
 };
}
