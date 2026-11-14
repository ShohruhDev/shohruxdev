import { indexNowConfig } from '../lib/indexnow.mjs';
// Файл подтверждения ключа IndexNow: /<INDEXNOW_KEY>.txt
const cfg = indexNowConfig();
export default defineEventHandler(event => {
  if (!cfg.enabled || event.path !== `/${cfg.key}.txt`) return;
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  return cfg.key;
});
