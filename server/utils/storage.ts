import { resolve } from 'node:path'
import { openStore } from '../lib/store.mjs'
let instance: ReturnType<typeof openStore>
export function storage(){ return instance ||= openStore(process.env.CONTENT_DB || resolve('.data/content.sqlite')) }
