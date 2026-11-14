import { createHash } from 'node:crypto';
export default defineEventHandler(async event => {
  const body = await adminBody(event);
  if (body.logout) {
    deleteCookie(event, 'editor_session', { path: '/' });
    return { ok: true };
  }
  const ip =
    getRequestIP(event, { xForwardedFor: process.env.TRUST_PROXY === 'true' }) || 'unknown';
  if (!storage().allowRequest('admin:' + createHash('sha256').update(ip).digest('hex')))
    throw createError({
      statusCode: 429,
      statusMessage: 'Слишком много попыток входа. Повторите через час.'
    });
  if (
    !(body.local === true && localAdmin(event)) &&
    !(
      typeof body.password === 'string' &&
      body.password.length <= 300 &&
      adminPasswordMatches(body.password)
    )
  )
    throw createError({ statusCode: 401, statusMessage: 'Неверный пароль или вход не настроен.' });
  setCookie(event, 'editor_session', signedAdminSession(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: !localAdmin(event),
    path: '/',
    maxAge: 8 * 3600
  });
  return { ok: true };
});
