// Автопубликация одобренных постов в Instagram (бизнес-аккаунт) и на Facebook-страницу
// через Graph API (очереди: shared/social-posts.mjs). Включается только при валидных настройках;
// ошибки не выходят за пределы тика и не ломают сайт.
//
// Учёт ведётся по паре «сеть × пост» в таблице meta_posts. Instagram публикуется в три шага,
// каждый в своём тике: создать контейнер (POST /{ig}/media) → дождаться status_code=FINISHED
// (GET /{container}) → опубликовать (POST /{ig}/media_publish). id контейнера сохраняется сразу,
// поэтому перезапуск после создания контейнера продолжает с него, а не создаёт второй.
// Неопубликованный контейнер ничего не показывает подписчикам и истекает через 24 часа,
// поэтому сбой до media_publish безопасно повторять. Сбой во время media_publish или публикации
// на странице без ответа помечается 'uncertain' и автоматически не повторяется.
//
// Истории Instagram (очередь instagramStories) идут теми же тремя шагами, только контейнер
// создаётся с media_type=STORIES и без подписи; учёт под отдельным ключом сети 'instagram_story',
// поэтому строки ленты ('instagram') не меняются. Документация Meta:
// https://developers.facebook.com/docs/instagram-platform/content-publishing/ (Story posts, лимит,
// опрос контейнера) и .../instagram-graph-api/reference/ig-user/media (media_type=STORIES).
//
// Токен уходит только в заголовке Authorization, не в адресе запроса, и вычищается из ошибок.
import {
  PRE_CONNECT,
  isZonedIso,
  liveGateReason,
  networkCode,
  redact,
  siteUrlFrom
} from './autopost.mjs';

export const GRAPH_HOST = 'https://graph.facebook.com';
export const DEFAULT_GRAPH_VERSION = 'v27.0';
export const NETWORKS = /** @type {const} */ (['instagram', 'facebook']);
/** Ключ учёта историй Instagram в meta_posts (отдельно от ленты 'instagram'). */
export const STORY = 'instagram_story';
/** Все очереди в порядке выбора при равном publishAt: лента Instagram, истории, Facebook. */
export const QUEUE_NETWORKS = /** @type {const} */ (['instagram', STORY, 'facebook']);
/** Сети, публикуемые в Instagram через media → media_publish (общий суточный лимит). */
export const IG_NETWORKS = /** @type {const} */ (['instagram', STORY]);
export const IG_CAPTION_LIMIT = 2200;
export const IG_HASHTAG_LIMIT = 30; // лимит API; сами очереди держат не больше 5 (см. shared/social-posts.mjs)
export const IG_MENTION_LIMIT = 20;
export const FB_TEXT_LIMIT = 63206;
// content_publishing_limit: quota_total 50 за 24 часа. Лимит считается по media_publish
// (опубликованные контейнеры), поэтому истории в него входят наравне с постами ленты.
export const IG_DAILY_LIMIT = 50;
export const RETRY_MS = 30 * 60000;
export const MAX_ATTEMPTS = 5;
export const STALE_MS = 5 * 60000;
export const POLL_TIMEOUT_MS = 5 * 60000; // Meta: опрашивать раз в минуту, не дольше 5 минут
export const CONTAINER_TTL_MS = 23 * 3600000; // контейнер истекает через 24 часа
const TIMEOUT_MS = 20000;
const DAY_MS = 24 * 3600000;

const TOKEN_RE = /^[A-Za-z0-9._|-]{32,}$/;
const NUM_ID_RE = /^\d{5,25}$/;
const VERSION_RE = /^v\d{1,3}\.\d$/;
const ID_RE = /^[a-z0-9][a-z0-9-]{1,60}$/;
const IMAGE_RE = /^\/social\/(?:brand|telegram)\/[a-z0-9-]+\.jpe?g$/;
const STORY_IMAGE_RE = /^\/social\/stories\/[a-z0-9-]+\.jpe?g$/;
const STORY_TEXT_FIELDS = ['caption', 'ru', 'uz', 'hashtags', 'message', 'link'];
const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;
const MENTION_RE = /(?<![\p{L}\p{N}_.])@[A-Za-z0-9_.]+/gu;

const flagOff = v =>
  String(v || '')
    .trim()
    .toLowerCase() === 'false';

/**
 * Правило включения: META_PAGE_ACCESS_TOKEN и META_PAGE_ID валидны (META_IG_USER_ID, если задан,
 * тоже), SITE_URL на HTTPS (Meta забирает картинки с сайта) и META_AUTOPOST=true, либо боевой
 * режим (NODE_ENV=production и SITE_INDEXABLE=true) без META_AUTOPOST=false.
 * META_INSTAGRAM=false / META_FACEBOOK=false выключают отдельную сеть.
 * Истории (stories) идут, когда включён Instagram и META_INSTAGRAM_STORIES не равен false.
 */
export function metaConfig(env = process.env) {
  const token = String(env.META_PAGE_ACCESS_TOKEN || '').trim();
  const pageId = String(env.META_PAGE_ID || '').trim();
  const igUserId = String(env.META_IG_USER_ID || '').trim();
  const version = String(env.META_GRAPH_VERSION || '').trim() || DEFAULT_GRAPH_VERSION;
  const siteUrl = siteUrlFrom(env);
  const networks = NETWORKS.filter(
    n => !flagOff(n === 'instagram' ? env.META_INSTAGRAM : env.META_FACEBOOK)
  );
  let reason = '';
  if (!pageId) reason = 'META_PAGE_ID is not set';
  else if (!NUM_ID_RE.test(pageId)) reason = 'META_PAGE_ID must be numeric';
  else if (!TOKEN_RE.test(token)) reason = 'META_PAGE_ACCESS_TOKEN is missing or malformed';
  else if (igUserId && !NUM_ID_RE.test(igUserId)) reason = 'META_IG_USER_ID must be numeric';
  else if (!VERSION_RE.test(version)) reason = 'META_GRAPH_VERSION must look like v27.0';
  else if (!siteUrl.startsWith('https://')) reason = 'SITE_URL must be https://';
  else if (!networks.length) reason = 'META_INSTAGRAM=false and META_FACEBOOK=false';
  else reason = liveGateReason(env, 'META_AUTOPOST');
  const stories = networks.includes('instagram') && !flagOff(env.META_INSTAGRAM_STORIES);
  const cfg = { enabled: !reason, reason, pageId, igUserId, version, siteUrl, networks, stories };
  // Токен не перечисляется: JSON.stringify(cfg) и console.log(cfg) его не покажут.
  Object.defineProperty(cfg, 'token', { value: token, enumerable: false });
  return /** @type {typeof cfg & { token: string }} */ (cfg);
}

/** Очереди, которые публикует тик: включённые сети и, если разрешены, истории. */
export const activeNetworks = cfg =>
  QUEUE_NETWORKS.filter(n => (n === STORY ? !!cfg.stories : cfg.networks.includes(n)));

/** Подпись Instagram: RU, разделитель «—», UZ и хэштеги, как в docs/social-kit-2026-11.md. */
export function instagramCaption(post) {
  return [post.ru, '—', post.uz, (post.hashtags || []).join(' ')]
    .map(s => String(s ?? '').trim())
    .filter(Boolean)
    .join('\n\n');
}

export const countHashtags = s => (String(s).match(HASHTAG_RE) || []).length;
export const countMentions = s => (String(s).match(MENTION_RE) || []).length;

/**
 * Список проблем очереди сети; пустой массив, если всё в порядке.
 * exists(path) проверяет наличие картинки (в тестах и CLI: файл в public/).
 */
export function validatePosts(posts, network, { exists } = {}) {
  if (!QUEUE_NETWORKS.includes(network)) return [`unknown network ${network}`];
  if (!Array.isArray(posts)) return [`${network}: queue must be an array`];
  const issues = [];
  const seen = new Set();
  for (const [i, p] of posts.entries()) {
    const at = `${network} #${i + 1}${p?.id ? ` (${p.id})` : ''}`;
    if (!p || typeof p !== 'object') {
      issues.push(`${at}: not an object`);
      continue;
    }
    if (!ID_RE.test(String(p.id))) issues.push(`${at}: bad id`);
    else if (seen.has(p.id)) issues.push(`${at}: duplicate id`);
    seen.add(p.id);
    if (!isZonedIso(p.publishAt)) issues.push(`${at}: publishAt must be ISO with timezone`);
    if (typeof p.approved !== 'boolean') issues.push(`${at}: approved must be true/false`);
    const story = network === STORY;
    if (p.image !== undefined) {
      if (!(story ? STORY_IMAGE_RE : IMAGE_RE).test(String(p.image)))
        issues.push(
          `${at}: image must be ${story ? '/social/stories' : '/social/brand|telegram'}/<name>.jpg`
        );
      else if (exists && !exists(p.image)) issues.push(`${at}: image file not found`);
    }
    if (story) {
      // История: только картинка (рекомендуется JPEG 1080×1920, 9:16), подписи у историй нет.
      if (p.image === undefined) issues.push(`${at}: image is required`);
      const extra = STORY_TEXT_FIELDS.filter(k => p[k] !== undefined);
      if (extra.length) issues.push(`${at}: stories have no caption (remove ${extra.join(', ')})`);
    } else if (network === 'instagram') {
      if (p.image === undefined) issues.push(`${at}: image is required`);
      if (typeof p.ru !== 'string' || !p.ru.trim()) issues.push(`${at}: ru text is required`);
      if (typeof p.uz !== 'string' || !p.uz.trim()) issues.push(`${at}: uz text is required`);
      if (
        p.hashtags !== undefined &&
        (!Array.isArray(p.hashtags) || !p.hashtags.every(h => /^#[\p{L}\p{N}_]+$/u.test(h)))
      )
        issues.push(`${at}: hashtags must be an array of #words`);
      const caption = instagramCaption(p);
      if (caption.length > IG_CAPTION_LIMIT)
        issues.push(`${at}: caption is ${caption.length} chars, limit ${IG_CAPTION_LIMIT}`);
      if (countHashtags(caption) > IG_HASHTAG_LIMIT)
        issues.push(`${at}: more than ${IG_HASHTAG_LIMIT} hashtags`);
      if (countMentions(caption) > IG_MENTION_LIMIT)
        issues.push(`${at}: more than ${IG_MENTION_LIMIT} @mentions`);
    } else {
      if (typeof p.message !== 'string' || !p.message.trim())
        issues.push(`${at}: message is required`);
      else if (p.message.length > FB_TEXT_LIMIT) issues.push(`${at}: message is too long`);
      if (p.link !== undefined) {
        if (!/^https:\/\/\S+$/.test(String(p.link))) issues.push(`${at}: link must be https://`);
        if (p.image !== undefined) issues.push(`${at}: use either image or link`);
      }
    }
  }
  return issues;
}

/** Одобренные посты, время которых наступило, в порядке публикации. */
export function selectDue(posts, now = Date.now()) {
  return posts
    .filter(p => p.approved === true && Date.parse(p.publishAt) <= now)
    .sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt) || (a.id < b.id ? -1 : 1));
}

export const postKey = (network, postId) => `${network}:${postId}`;

const containerFresh = (rec, now) =>
  !!rec?.container_id && Date.parse(rec.container_at) + CONTAINER_TTL_MS > now;

/**
 * Следующий шаг одной сети или null. Посты сети идут строго по порядку: незавершённый пост
 * (в работе или в ожидании повтора) задерживает следующие; пост с итоговой ошибкой
 * (gave_up, uncertain) их не задерживает.
 * step: 'create' | 'poll' | 'publish' | 'resume' (IG: повтор с ещё живым контейнером).
 */
export function nextStep(network, posts, records, now = Date.now()) {
  for (const post of selectDue(posts, now)) {
    const rec = records.get(postKey(network, post.id));
    const fresh = { network, post, rec };
    if (!rec) return { ...fresh, step: network === 'facebook' ? 'publish' : 'create' };
    switch (rec.status) {
      case 'published':
      case 'gave_up':
      case 'uncertain':
        continue;
      case 'container':
        return { ...fresh, step: rec.container_status === 'FINISHED' ? 'publish' : 'poll' };
      case 'failed':
        if (rec.next_attempt_at && Date.parse(rec.next_attempt_at) > now) return null;
        if (network === 'facebook') return { ...fresh, step: 'publish' };
        return { ...fresh, step: containerFresh(rec, now) ? 'resume' : 'create' };
      default:
        // creating / publishing: запрос в работе (или процесс упал; разберёт recoverMeta).
        return null;
    }
  }
  return null;
}

/**
 * Шаг для тика: самый ранний по publishAt среди включённых очередей; при равенстве лента
 * Instagram, затем истории, затем Facebook. igBlocked останавливает ленту и истории Instagram.
 */
export function nextAction(
  queues,
  records,
  networks,
  now = Date.now(),
  { igBlocked = false } = {}
) {
  let best = null;
  for (const network of QUEUE_NETWORKS) {
    if (!networks.includes(network) || (IG_NETWORKS.includes(network) && igBlocked)) continue;
    const step = nextStep(network, queues[network] || [], records, now);
    if (step && (!best || Date.parse(step.post.publishAt) < Date.parse(best.post.publishAt)))
      best = step;
  }
  return best;
}

export class GraphError extends Error {
  /** definite: запрос точно обработан и отклонён (или не дошёл), повтор не создаст дубль. */
  constructor(message, { definite = false, code = 0, status = 0 } = {}) {
    super(message);
    this.definite = definite;
    this.code = code;
    this.status = status;
  }
}

/** Убирает токены и любые access_token=… из текста (Graph может вернуть адрес с токеном). */
export function scrub(s, ...tokens) {
  return redact(s, ...tokens)
    .replace(/(access_token=)[^&\s"']+/gi, '$1<token>')
    .replace(/\bEA[A-Za-z0-9]{30,}\b/g, '<token>');
}

/** Все секреты конфигурации: настроенный токен и, если найден, токен страницы. */
const secretsOf = cfg => cfg.secrets || [cfg.token];

/** Копия конфигурации с другим токеном для запросов; оба токена вычищаются из ошибок. */
export function withToken(cfg, token) {
  const out = { ...cfg };
  Object.defineProperty(out, 'token', { value: token, enumerable: false });
  Object.defineProperty(out, 'secrets', {
    value: [...new Set([token, ...secretsOf(cfg)])],
    enumerable: false
  });
  return /** @type {typeof cfg} */ (out);
}

/**
 * Один запрос к Graph API. Токен в заголовке Authorization: Bearer, тело POST — form-urlencoded.
 * Ответ с объектом error: GraphError(definite), кроме кодов 1/2 и HTTP 5xx (сервер мог успеть
 * выполнить запрос). Ответ без JSON и обрыв после соединения: GraphError(definite: false).
 */
export async function graphRequest(cfg, method, path, params = {}, fetchImpl = fetch) {
  const url = new URL(`${GRAPH_HOST}/${cfg.version}/${path}`);
  const init = {
    method,
    headers: { Authorization: `Bearer ${cfg.token}` },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  };
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (method === 'GET') for (const [k, v] of entries) url.searchParams.set(k, String(v));
  else {
    init.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    init.body = new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
  }
  let res;
  try {
    res = await fetchImpl(url.href, init);
  } catch (e) {
    const code = networkCode(e);
    throw new GraphError(
      scrub(`Network error: ${e?.message || e}${code ? ` (${code})` : ''}`, ...secretsOf(cfg)),
      { definite: PRE_CONNECT.has(code) }
    );
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    // Ответ не JSON: результат неизвестен.
  }
  if (data?.error) {
    const err = data.error;
    const code = Number(err.code) || 0;
    const sub = err.error_subcode ? `/${err.error_subcode}` : '';
    const msg = err.error_user_msg || err.message || 'error';
    throw new GraphError(scrub(`Graph ${code || res.status}${sub}: ${msg}`, ...secretsOf(cfg)), {
      definite: !(res.status >= 500 || code === 1 || code === 2),
      code,
      status: res.status
    });
  }
  if (res.status >= 200 && res.status < 300 && data && typeof data === 'object') return data;
  throw new GraphError(`Graph HTTP ${res.status}: unexpected response`, { status: res.status });
}

export const TOKEN_KINDS = {
  resolved: 'system/user token → page token resolved',
  page: 'page token'
};

/**
 * Токен страницы: GET /{page-id}?fields=access_token,… с настроенным токеном. Для токена
 * системного пользователя (или пользователя) Graph возвращает access_token страницы; если его нет
 * или он совпадает с настроенным, настроенный токен уже является токеном страницы.
 * page — ответ без access_token (его нельзя выводить).
 */
export async function resolvePageToken(
  cfg,
  fetchImpl = fetch,
  fields = 'access_token,name,instagram_business_account'
) {
  let data;
  try {
    data = await graphRequest(cfg, 'GET', cfg.pageId, { fields }, fetchImpl);
  } catch (e) {
    // Поле access_token недоступно этому токену (#100, но не «объект не найден» /33).
    if (e instanceof GraphError && e.code === 100 && !/\/33:/.test(e.message))
      return { token: cfg.token, kind: 'page', page: null };
    throw e;
  }
  const { access_token: raw, ...page } = data;
  const pageToken = typeof raw === 'string' ? raw.trim() : '';
  const resolved = !!pageToken && pageToken !== cfg.token;
  return { token: resolved ? pageToken : cfg.token, kind: resolved ? 'resolved' : 'page', page };
}

/** IG User ID, привязанный к странице: GET /{page-id}?fields=instagram_business_account. */
export async function resolveIgUserId(cfg, fetchImpl = fetch) {
  const data = await graphRequest(
    cfg,
    'GET',
    cfg.pageId,
    { fields: 'instagram_business_account' },
    fetchImpl
  );
  const id = data?.instagram_business_account?.id;
  if (!id || !NUM_ID_RE.test(String(id)))
    throw new GraphError('No Instagram business account is linked to the Page', {
      definite: true
    });
  return String(id);
}

const imageUrl = (cfg, image) => new URL(image, cfg.siteUrl + '/').href;

/**
 * Один шаг публикации: не более одного запроса к Graph API за вызов.
 * cache — объект, живущий между тиками только в памяти: токен страницы (из токена системного
 * пользователя) и IG User ID, найденный по странице. Токен страницы не логируется и не сохраняется.
 * Возвращает { status: 'disabled' | 'idle' | 'busy' | 'token_resolved' | 'token_unavailable'
 *   | 'waiting_token' | 'resolved' | 'ig_unavailable' | 'container' | 'processing' | 'ready'
 *   | 'published' | 'failed' | 'gave_up' | 'uncertain', ... }.
 */
export async function metaTick(
  store,
  queues,
  cfg,
  { now = Date.now(), fetchImpl = fetch, cache = {} } = {}
) {
  if (!cfg.enabled) return { status: 'disabled' };
  const at = new Date(now).toISOString();
  store.recoverMetaPosts(new Date(now - STALE_MS).toISOString(), at);
  const rows = store.metaPosts();
  const records = new Map(rows.map(r => [postKey(r.network, r.post_id), r]));
  const igToday = rows.filter(
    r =>
      IG_NETWORKS.includes(r.network) && r.published_at && Date.parse(r.published_at) > now - DAY_MS
  ).length;
  const igUserId = cfg.igUserId || cache.igUserId || '';
  const igBlocked =
    igToday >= IG_DAILY_LIMIT || (!igUserId && Date.parse(cache.igRetryAt || '') > now);
  const action = nextAction(queues, records, activeNetworks(cfg), now, { igBlocked });
  if (!action) return { status: 'idle' };
  const { network, post, step } = action;
  const ref = { network, postId: post.id, step };

  // Токен страницы находим при первом шаге и держим в памяти; все запросы идут с ним.
  if (!cache.pageToken) {
    if (Date.parse(cache.pageTokenRetryAt || '') > now) return { status: 'waiting_token' };
    try {
      const r = await resolvePageToken(cfg, fetchImpl);
      cache.pageToken = r.token;
      cache.tokenKind = r.kind;
      delete cache.pageTokenRetryAt;
      const ig = r.page?.instagram_business_account?.id;
      if (!cfg.igUserId && ig && NUM_ID_RE.test(String(ig))) cache.igUserId = String(ig);
      return { status: 'token_resolved', kind: TOKEN_KINDS[r.kind] };
    } catch (e) {
      const definite = e instanceof GraphError && e.definite;
      cache.pageTokenRetryAt = new Date(now + (definite ? RETRY_MS : 5 * 60000)).toISOString();
      return { status: 'token_unavailable', error: errorText(e, cfg) };
    }
  }
  cfg = withToken(cfg, cache.pageToken);

  // IG User ID нужен для media и media_publish; находим один раз и держим в памяти.
  if (network !== 'facebook' && step !== 'poll' && !igUserId) {
    try {
      cache.igUserId = await resolveIgUserId(cfg, fetchImpl);
      delete cache.igRetryAt;
      return { status: 'resolved', igUserId: cache.igUserId };
    } catch (e) {
      cache.igRetryAt = new Date(now + RETRY_MS).toISOString();
      return { status: 'ig_unavailable', error: errorText(e, cfg, cache) };
    }
  }

  const fail = (e, extra = {}) => {
    const error = errorText(e, cfg, cache);
    const definite = e instanceof GraphError && e.definite;
    return { error, definite, ...extra };
  };

  if (network === 'facebook') {
    const attempts = store.claimMetaPost(network, post.id, 'publishing', at);
    if (!attempts) return { status: 'busy' };
    try {
      // Фото с подписью одним запросом (/photos, published=true) Graph отклоняет для
      // новой страницы (324/2069019). Поэтому в два шага: скрытое временное фото,
      // затем пост в ленте с этим фото. Скрытое фото не видно подписчикам, поэтому
      // повтор после сбоя на первом шаге безопасен.
      const photo = post.image
        ? await graphRequest(
            cfg,
            'POST',
            `${cfg.pageId}/photos`,
            { url: imageUrl(cfg, post.image), published: false, temporary: true },
            fetchImpl
          )
        : null;
      if (photo && !photo.id) throw new GraphError('Graph: no photo id in response');
      const data = photo
        ? await graphRequest(
            cfg,
            'POST',
            `${cfg.pageId}/feed`,
            { message: post.message, attached_media: JSON.stringify([{ media_fbid: photo.id }]) },
            fetchImpl
          )
        : await graphRequest(
            cfg,
            'POST',
            `${cfg.pageId}/feed`,
            { message: post.message, link: post.link },
            fetchImpl
          );
      const mediaId = String(data.post_id || data.id || '');
      if (!mediaId) throw new GraphError('Graph: no post id in response');
      store.finishMetaPost(network, post.id, 'publishing', { status: 'published', mediaId }, at);
      return { status: 'published', ...ref, mediaId };
    } catch (e) {
      const f = fail(e);
      return settleFailure(store, network, post.id, 'publishing', attempts, f, now, ref);
    }
  }

  // Instagram: лента ('instagram') или история (STORY), учёт под своим ключом сети.
  if (step === 'create' || step === 'resume') {
    const to = step === 'create' ? 'creating' : 'container';
    const attempts = store.claimMetaPost(network, post.id, to, at);
    if (!attempts) return { status: 'busy' };
    if (step === 'resume') {
      const rec = store.metaPosts().find(r => r.network === network && r.post_id === post.id);
      return pollContainer(store, cfg, post, rec, { now, at, fetchImpl, ref, cache });
    }
    try {
      const data = await graphRequest(
        cfg,
        'POST',
        `${igUserId}/media`,
        network === STORY
          ? { image_url: imageUrl(cfg, post.image), media_type: 'STORIES' }
          : { image_url: imageUrl(cfg, post.image), caption: instagramCaption(post) },
        fetchImpl
      );
      const containerId = String(data.id || '');
      if (!/^\d+$/.test(containerId)) throw new GraphError('Graph: no container id in response');
      store.finishMetaPost(
        network,
        post.id,
        'creating',
        { status: 'container', containerId, containerAt: at },
        at
      );
      return { status: 'container', ...ref, containerId };
    } catch (e) {
      // Контейнер без media_publish ничего не публикует: повтор безопасен в любом случае.
      const f = fail(e, { definite: true });
      return settleFailure(store, network, post.id, 'creating', attempts, f, now, ref);
    }
  }

  if (step === 'poll')
    return pollContainer(store, cfg, post, action.rec, { now, at, fetchImpl, ref, cache });

  // step === 'publish'
  if (!store.moveMetaPost(network, post.id, 'container', 'publishing', at))
    return { status: 'busy' };
  const rec = action.rec;
  try {
    const data = await graphRequest(
      cfg,
      'POST',
      `${igUserId}/media_publish`,
      { creation_id: rec.container_id },
      fetchImpl
    );
    const mediaId = String(data.id || '');
    if (!mediaId) throw new GraphError('Graph: no media id in response');
    store.finishMetaPost(network, post.id, 'publishing', { status: 'published', mediaId }, at);
    return { status: 'published', ...ref, mediaId };
  } catch (e) {
    // Контейнер остаётся: после явного отказа повтор пойдёт с ним же, пока он жив.
    return settleFailure(store, network, post.id, 'publishing', rec.attempts, fail(e), now, ref, {
      keepContainer: true
    });
  }
}

/** Текст ошибки без секретов. Отказ токена (#190) сбрасывает токен страницы: найдём заново. */
function errorText(e, cfg, cache) {
  if (cache && e instanceof GraphError && e.code === 190) {
    delete cache.pageToken;
    delete cache.tokenKind;
  }
  return scrub(e instanceof Error ? e.message : String(e), ...secretsOf(cfg)).slice(0, 500);
}

function settleFailure(store, network, postId, from, attempts, f, now, ref, opts = {}) {
  const at = new Date(now).toISOString();
  let status = 'uncertain';
  let nextAttemptAt = null;
  if (f.definite) {
    status = attempts >= MAX_ATTEMPTS ? 'gave_up' : 'failed';
    if (status === 'failed') nextAttemptAt = new Date(now + RETRY_MS).toISOString();
  }
  store.finishMetaPost(
    network,
    postId,
    from,
    { status, error: f.error, nextAttemptAt, keepContainer: !!opts.keepContainer },
    at
  );
  return { status, ...ref, error: f.error };
}

/** Проверяет готовность контейнера (GET /{container}?fields=status_code,status). */
async function pollContainer(store, cfg, post, rec, { now, at, fetchImpl, ref, cache }) {
  const network = ref.network;
  const elapsed = now - Date.parse(rec.container_at);
  const giveUp = (error, keepContainer = false) =>
    settleFailure(
      store,
      network,
      post.id,
      'container',
      rec.attempts,
      { error, definite: true },
      now,
      ref,
      { keepContainer }
    );
  let data;
  try {
    data = await graphRequest(
      cfg,
      'GET',
      rec.container_id,
      { fields: 'status_code,status' },
      fetchImpl
    );
  } catch (e) {
    const error = errorText(e, cfg, cache);
    if (elapsed > POLL_TIMEOUT_MS) return giveUp(`Container status unavailable: ${error}`, true);
    store.noteMetaPost(network, post.id, 'container', error, at);
    return { status: 'processing', ...ref, error };
  }
  const code = String(data.status_code || '');
  if (code === 'FINISHED') {
    store.markContainerFinished(network, post.id, at);
    return { status: 'ready', ...ref, containerId: rec.container_id };
  }
  if (code === 'PUBLISHED') {
    // Контейнер уже опубликован (например, вручную): второй раз не публикуем.
    store.finishMetaPost(network, post.id, 'container', { status: 'published', mediaId: null }, at);
    return { status: 'published', ...ref, mediaId: null };
  }
  if (code === 'ERROR' || code === 'EXPIRED')
    return giveUp(
      `Container ${code}${data.status ? `: ${scrub(data.status, ...secretsOf(cfg))}` : ''}`
    );
  if (elapsed > POLL_TIMEOUT_MS) return giveUp(`Container still ${code || 'unknown'} after 5 min`);
  return { status: 'processing', ...ref, containerStatus: code };
}

/** Таблица учёта публикаций; подключается в openStore так же, как telegramStore. */
export function metaStore(db, log = () => {}) {
  db.exec(
    `CREATE TABLE IF NOT EXISTS meta_posts(network TEXT NOT NULL,post_id TEXT NOT NULL,status TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,container_id TEXT,container_at TEXT,container_status TEXT,media_id TEXT,next_attempt_at TEXT,published_at TEXT,error TEXT,updated_at TEXT NOT NULL,PRIMARY KEY(network,post_id));`
  );
  const get = (network, postId) =>
    db.prepare('SELECT * FROM meta_posts WHERE network=? AND post_id=?').get(network, postId);
  return {
    metaPosts() {
      return db.prepare('SELECT * FROM meta_posts ORDER BY network,post_id').all();
    },
    /**
     * Атомарно занимает пост: новый или 'failed' с наступившим временем повтора переводится в
     * status. Возвращает номер попытки или 0, если пост уже занят/опубликован.
     */
    claimMetaPost(network, postId, status, at) {
      const r = db
        .prepare(
          `INSERT INTO meta_posts(network,post_id,status,attempts,updated_at) VALUES(?,?,?,1,?)
           ON CONFLICT(network,post_id) DO UPDATE SET status=excluded.status,attempts=attempts+1,error=NULL,next_attempt_at=NULL,container_status=NULL,updated_at=excluded.updated_at
           WHERE status='failed' AND (next_attempt_at IS NULL OR next_attempt_at<=excluded.updated_at)`
        )
        .run(network, postId, status, at);
      return r.changes ? get(network, postId).attempts : 0;
    },
    /** Переход from → to; 1, если переход выполнен. */
    moveMetaPost(network, postId, from, to, at) {
      return db
        .prepare(
          'UPDATE meta_posts SET status=?,updated_at=? WHERE network=? AND post_id=? AND status=?'
        )
        .run(to, at, network, postId, from).changes;
    },
    markContainerFinished(network, postId, at) {
      db.prepare(
        "UPDATE meta_posts SET container_status='FINISHED',error=NULL,updated_at=? WHERE network=? AND post_id=? AND status='container'"
      ).run(at, network, postId);
    },
    /** Временная ошибка опроса контейнера: только запись текста, статус не меняется. */
    noteMetaPost(network, postId, status, error, at) {
      db.prepare(
        'UPDATE meta_posts SET error=?,updated_at=? WHERE network=? AND post_id=? AND status=?'
      ).run(error, at, network, postId, status);
    },
    finishMetaPost(
      network,
      postId,
      from,
      {
        status,
        mediaId = null,
        containerId = null,
        containerAt = null,
        error = null,
        nextAttemptAt = null,
        keepContainer = false
      },
      at
    ) {
      // container_id сохраняется, пока контейнер может пригодиться: в 'container', после
      // опубликования (для справки) и после явного отказа media_publish (keepContainer).
      const keep = status === 'published' || status === 'uncertain' || keepContainer;
      db.prepare(
        `UPDATE meta_posts SET status=?,
           media_id=COALESCE(?,media_id),
           container_id=CASE WHEN ? IS NOT NULL THEN ? WHEN ? THEN container_id ELSE NULL END,
           container_at=CASE WHEN ? IS NOT NULL THEN ? WHEN ? THEN container_at ELSE NULL END,
           container_status=NULL,error=?,next_attempt_at=?,
           published_at=CASE WHEN ?='published' THEN ? ELSE published_at END,updated_at=?
         WHERE network=? AND post_id=? AND status=?`
      ).run(
        status,
        mediaId,
        containerId,
        containerId,
        keep ? 1 : 0,
        containerAt,
        containerAt,
        keep ? 1 : 0,
        error,
        nextAttemptAt,
        status,
        at,
        at,
        network,
        postId,
        from
      );
      log(`meta-${status}`, postKey(network, postId));
    },
    /**
     * Зависшие шаги (процесс упал во время запроса): 'creating' безопасно повторить
     * (неопубликованный контейнер истечёт сам), 'publishing' переводится в 'uncertain'.
     */
    recoverMetaPosts(olderThan, at = new Date().toISOString()) {
      const a = db
        .prepare(
          "UPDATE meta_posts SET status='failed',next_attempt_at=NULL,error='Interrupted while creating the container',updated_at=? WHERE status='creating' AND updated_at<?"
        )
        .run(at, olderThan).changes;
      const b = db
        .prepare(
          "UPDATE meta_posts SET status='uncertain',error='Interrupted during publish; check the account',updated_at=? WHERE status='publishing' AND updated_at<?"
        )
        .run(at, olderThan).changes;
      return a + b;
    },
    /** После ручной проверки: 'uncertain'-пост уже опубликован, повторять не нужно. */
    confirmMetaPost(network, postId) {
      const r = db
        .prepare(
          "UPDATE meta_posts SET status='published',published_at=updated_at,error=NULL WHERE network=? AND post_id=? AND status='uncertain'"
        )
        .run(network, postId);
      if (r.changes) log('meta-confirmed', postKey(network, postId));
      return r.changes;
    },
    /** Разрешает повторную публикацию после ручной проверки. Опубликованное не трогает. */
    retryMetaPost(network, postId) {
      const r = db
        .prepare(
          "DELETE FROM meta_posts WHERE network=? AND post_id=? AND status IN ('failed','gave_up','uncertain')"
        )
        .run(network, postId);
      if (r.changes) log('meta-retry', postKey(network, postId));
      return r.changes;
    }
  };
}
