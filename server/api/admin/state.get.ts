import {generationConfig} from '../../lib/pipeline.mjs'
export default defineEventHandler(event=>{requireAdmin(event);return {...storage().editorialState(),leads:storage().leads(),config:{...generationConfig(),indexable:useRuntimeConfig().public.indexable,siteUrl:useRuntimeConfig().public.siteUrl}}})
