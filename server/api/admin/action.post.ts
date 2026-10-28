import {generationConfig,runGeneration} from '../../lib/pipeline.mjs'
import {seedTopics} from '../../lib/topics.mjs'
export default defineEventHandler(async event=>{
 requireAdmin(event);const b=await adminBody(event);const db=storage()
 try{
  if(b.action==='seed')seedTopics(db)
  else if(b.action==='add-topic')db.addTopic(b.topic)
  else if(b.action==='topic-status')db.topicStatus(b.slug,b.status)
  else if(b.action==='create')db.importDraft(b.post)
  else if(b.action==='save'){if(typeof b.revision!=='string')throw Error('Откройте актуальную версию статьи.');db.editPost(b.post,b.revision)}
  else if(b.action==='schedule'){
   if(Date.parse(b.time)<Date.now())throw Error('Выберите будущее время публикации.')
   if(typeof b.revision!=='string')throw Error('Откройте актуальную версию статьи.');db.schedulePost(b.slug,b.time,b.checks,b.revision)
  }
  else if(b.action==='unpublish')db.unpublish(b.slug)
  else if(b.action==='publish-due')return {ok:true,published:db.publishDue()}
  else if(b.action==='generate'){
   if(!generationConfig().ready)throw Error('ИИ не подключён. Настройте ключ, модель и лимит на сервере.')
   return {ok:true,result:await runGeneration(db)}
  }
  else throw Error('Неизвестное действие.')
  return {ok:true}
 }catch(e){throw createError({statusCode:e instanceof Error&&e.message.includes('изменена в другой вкладке')?409:400,statusMessage:e instanceof Error&&!e.message.includes('UNIQUE')?e.message:'Этот URL уже используется.'})}
})
