import {generationConfig,runGeneration} from '../lib/pipeline.mjs'
import {seedTopics} from '../lib/topics.mjs'
export default defineNitroPlugin(nitro=>{
 if(!generationConfig().enabled)return
 try{seedTopics(storage())}catch{console.error('Editorial topic seeding failed.')}
 let running=false
 async function tick(){
  if(running)return;running=true
  try{
   const now=new Date();storage().heartbeat(now.toISOString());storage().publishDue(now.toISOString())
   const hour=Number(new Intl.DateTimeFormat('en-GB',{hour:'2-digit',hourCycle:'h23',timeZone:'Asia/Tashkent'}).format(now))
   if(hour>=8){const r=await runGeneration(storage());if(r.status==='complete'||r.status==='failed')console.log(`Editorial generation ${r.status}: ${r.slug||r.error}`)}
  }catch{console.error('Editorial worker failed; inspect database and configuration.')}finally{running=false}
 }
 const timer=setInterval(tick,60000);timer.unref();void tick()
 nitro.hooks.hook('close',()=>clearInterval(timer))
})
