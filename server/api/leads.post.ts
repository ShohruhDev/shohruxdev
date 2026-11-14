import { createHash } from 'node:crypto';
import { validateLead } from '../lib/core.mjs';
import { notifyLead } from '../lib/notify.mjs';
export default defineEventHandler(async event => {
  const origin = getHeader(event, 'origin');
  if (origin && origin !== getRequestURL(event).origin)
    throw createError({ statusCode: 403, statusMessage: 'Недопустимый источник запроса' });
  if (!getHeader(event, 'content-type')?.startsWith('application/json'))
    throw createError({ statusCode: 415, statusMessage: 'Требуется JSON' });
  const ip =
    getRequestIP(event, { xForwardedFor: process.env.TRUST_PROXY === 'true' }) || 'unknown';
  if (!storage().allowRequest(createHash('sha256').update(ip).digest('hex')))
    throw createError({
      statusCode: 429,
      statusMessage: 'Слишком много запросов. Попробуйте через час.'
    });
  if (Number(getHeader(event, 'content-length') || 0) > 30000)
    throw createError({ statusCode: 413, statusMessage: 'Слишком большой запрос' });
  const raw = await readRawBody(event);
  if (!raw || Buffer.byteLength(raw) > 30000)
    throw createError({ statusCode: 413, statusMessage: 'Слишком большой запрос' });
  let data;
  try {
    data = validateLead(JSON.parse(raw));
  } catch (e) {
    throw createError({
      statusCode: 400,
      statusMessage: e instanceof Error ? e.message : 'Проверьте поля формы'
    });
  }
  const id = storage().saveLead(data);
  await notifyLead(data, id);
  setResponseStatus(event, 201);
  return { ok: true, id };
});
