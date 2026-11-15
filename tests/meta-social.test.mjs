import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  CONTAINER_TTL_MS,
  DEFAULT_GRAPH_VERSION,
  GRAPH_HOST,
  IG_CAPTION_LIMIT,
  MAX_ATTEMPTS,
  POLL_TIMEOUT_MS,
  RETRY_MS,
  STALE_MS,
  countHashtags,
  graphRequest,
  instagramCaption,
  metaConfig,
  TOKEN_KINDS,
  metaTick as rawTick,
  resolvePageToken,
  nextAction,
  scrub,
  selectDue,
  validatePosts
} from '../server/lib/meta-social.mjs';
import { openStore } from '../server/lib/store.mjs';
import { instagramPosts, facebookPosts } from '../shared/social-posts.mjs';

const token = 'EAAGm0PX4ZCpsBAKzZBexampleTokenValue1234567890abcdefXYZ';
const env = {
  META_PAGE_ACCESS_TOKEN: token,
  META_PAGE_ID: '61596688616863',
  META_IG_USER_ID: '17841400000000001',
  SITE_URL: 'https://razrabotkatashkent.uz/',
  NODE_ENV: 'production',
  SITE_INDEXABLE: 'true'
};
const T0 = Date.parse('2026-11-23T07:00:00Z'); // 12:00 Ташкент
const AT = '2026-11-23T12:00:00+05:00';
const igPost = (id, publishAt = AT, extra = {}) => ({
  id,
  publishAt,
  approved: true,
  image: '/social/brand/ig-01.jpg',
  hashtags: ['#ташкент'],
  ru: `RU ${id}`,
  uz: `UZ ${id}`,
  ...extra
});
const fbPost = (id, publishAt = AT, extra = {}) => ({
  id,
  publishAt,
  approved: true,
  image: '/social/brand/ig-01.jpg',
  message: `FB ${id}`,
  ...extra
});
// Большинство тестов про очередь, а не про токен: кэш с уже найденным токеном страницы
// (настроенный токен и есть токен страницы). Тесты токена передают свой cache.
const metaTick = (store, q, cfg, opts = {}) =>
  rawTick(store, q, cfg, { cache: { pageToken: token, tokenKind: 'page' }, ...opts });
const exists = p => existsSync(join('public', p));
const MIN = 60000;

function withStore(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'meta-'));
  const file = join(dir, 'c.sqlite');
  const box = { store: openStore(file) };
  box.reopen = () => {
    box.store.close();
    box.store = openStore(file);
    return box.store;
  };
  return Promise.resolve(fn(box)).finally(() => {
    box.store.close();
    rmSync(dir, { recursive: true, force: true });
  });
}

/** Поддельный Graph API: handlers['POST <path>'] возвращает { status, body } или бросает. */
function fakeGraph(handlers = {}) {
  const calls = [];
  let n = 0;
  const defaults = {
    'GET 61596688616863': () => ({
      body: { id: '61596688616863', instagram_business_account: { id: '17841400000000009' } }
    }),
    'POST 17841400000000001/media': () => ({ body: { id: String(900 + ++n) } }),
    'POST 17841400000000009/media': () => ({ body: { id: String(900 + ++n) } }),
    'GET container': () => ({ body: { status_code: 'FINISHED' } }),
    'POST 17841400000000001/media_publish': () => ({ body: { id: String(1800 + ++n) } }),
    'POST 17841400000000009/media_publish': () => ({ body: { id: String(1800 + ++n) } }),
    'POST 61596688616863/photos': () => ({ body: { id: '55', post_id: `61596688616863_${++n}` } }),
    'POST 61596688616863/feed': () => ({ body: { id: `61596688616863_${++n}` } })
  };
  const fetchImpl = async (href, init) => {
    const url = new URL(href);
    const path = url.pathname.replace(`/${DEFAULT_GRAPH_VERSION}/`, '');
    const body = init.body ? Object.fromEntries(new URLSearchParams(init.body)) : null;
    calls.push({ href, method: init.method, path, body, headers: init.headers, url });
    let key = `${init.method} ${path}`;
    if (init.method === 'GET' && /^9\d\d$/.test(path)) key = 'GET container';
    const h = handlers[key] || defaults[key];
    if (!h) throw new Error(`unexpected ${key}`);
    const r = await h({ path, body, url });
    return {
      status: r.status ?? 200,
      json: async () => {
        if (r.raw) throw new SyntaxError('not json');
        return r.body;
      }
    };
  };
  return { calls, fetchImpl };
}
const queues = (ig = [], fb = []) => ({ instagram: ig, facebook: fb });

test('config: inert unless token, page id, https site and the live/explicit gate all agree', () => {
  const on = metaConfig(env);
  assert.equal(on.enabled, true);
  assert.equal(on.siteUrl, 'https://razrabotkatashkent.uz');
  assert.equal(on.version, DEFAULT_GRAPH_VERSION);
  assert.deepEqual(on.networks, ['instagram', 'facebook']);
  assert.equal(on.token, token);
  assert.doesNotMatch(JSON.stringify(on), /EAAG/, 'token must not be serialised');
  const off = patch => metaConfig({ ...env, ...patch }).enabled;
  assert.equal(off({ META_PAGE_ID: '' }), false);
  assert.equal(off({ META_PAGE_ID: 'razrabotkatashkent' }), false);
  assert.equal(off({ META_PAGE_ACCESS_TOKEN: '' }), false);
  assert.equal(off({ META_PAGE_ACCESS_TOKEN: 'short' }), false);
  assert.equal(off({ META_PAGE_ACCESS_TOKEN: `${token} x` }), false);
  assert.equal(off({ META_IG_USER_ID: '' }), true, 'IG id is optional');
  assert.equal(off({ META_IG_USER_ID: '@razrabotka' }), false);
  assert.equal(off({ META_GRAPH_VERSION: '27' }), false);
  assert.equal(metaConfig({ ...env, META_GRAPH_VERSION: 'v26.0' }).version, 'v26.0');
  assert.equal(off({ SITE_URL: 'http://127.0.0.1:3000' }), false);
  assert.equal(off({ SITE_INDEXABLE: 'false' }), false);
  assert.equal(off({ NODE_ENV: 'development' }), false);
  assert.equal(off({ META_AUTOPOST: 'false' }), false);
  assert.equal(off({ META_AUTOPOST: 'FALSE' }), false);
  assert.equal(off({ NODE_ENV: 'development', SITE_INDEXABLE: '', META_AUTOPOST: 'true' }), true);
  assert.equal(off({ META_AUTOPOST: 'true', META_PAGE_ID: '' }), false);
  assert.deepEqual(metaConfig({ ...env, META_INSTAGRAM: 'false' }).networks, ['facebook']);
  assert.deepEqual(metaConfig({ ...env, META_FACEBOOK: 'false' }).networks, ['instagram']);
  assert.equal(off({ META_INSTAGRAM: 'false', META_FACEBOOK: 'false' }), false);
  assert.equal(metaConfig({}).enabled, false);
});

test('queues come from the social kit: valid, explicit approval, on the planned calendar', () => {
  assert.deepEqual(validatePosts(instagramPosts, 'instagram', { exists }), []);
  assert.deepEqual(validatePosts(facebookPosts, 'facebook', { exists }), []);
  assert.deepEqual(
    instagramPosts.map(p => p.id),
    ['ig-01', 'ig-02', 'ig-03', 'ig-04', 'ig-05', 'ig-06', 'ig-07', 'ig-08', 'ig-09']
  );
  assert.deepEqual(
    facebookPosts.map(p => p.id),
    ['fb-1', 'fb-2', 'fb-3', 'fb-4', 'fb-5', 'fb-6']
  );
  for (const p of [...instagramPosts, ...facebookPosts]) {
    assert.equal(typeof p.approved, 'boolean', `${p.id}: approval is explicit`);
    assert.match(p.publishAt, /^2026-1[12]-\d\dT12:00:00\+05:00$/, p.id);
    assert.ok(exists(p.image), p.image);
  }
  assert.deepEqual(
    instagramPosts.map(p => p.publishAt.slice(5, 10)),
    ['11-16', '11-16', '11-16', '11-18', '11-20', '11-23', '11-25', '11-27', '11-30']
  );
  assert.deepEqual(
    facebookPosts.map(p => p.publishAt.slice(5, 10)),
    ['11-16', '11-19', '11-23', '11-26', '11-30', '12-03']
  );
  for (const p of instagramPosts) {
    assert.equal(p.image, `/social/brand/${p.id}.jpg`);
    const caption = instagramCaption(p);
    assert.ok(caption.length <= IG_CAPTION_LIMIT, p.id);
    assert.ok(countHashtags(caption) <= 5, `${p.id}: first five hashtags only`);
    assert.ok(caption.startsWith(p.ru) && caption.includes(`\n\n—\n\n${p.uz}\n\n#`), p.id);
  }
  // Порядок публикации совпадает с сеткой из docs/social-kit-2026-11.md.
  assert.deepEqual(
    selectDue(
      instagramPosts.map(p => ({ ...p, approved: true })),
      Infinity
    ).map(p => p.id),
    instagramPosts.map(p => p.id)
  );
});

test('queue texts match docs/social-kit-2026-11.md exactly', async () => {
  const { readFileSync } = await import('node:fs');
  const doc = readFileSync('docs/social-kit-2026-11.md', 'utf8');
  const blocks = [...doc.matchAll(/```text\n([\s\S]*?)\n```/g)].map(m => m[1]);
  for (const p of instagramPosts) {
    const full = blocks.find(b => b.startsWith(p.ru + '\n\n—\n\n' + p.uz + '\n\n#'));
    assert.ok(full, `${p.id} text is verbatim from the doc`);
    const docTags = full.split('\n').pop().split(' ');
    assert.deepEqual(p.hashtags, docTags.slice(0, 5), p.id);
  }
  for (const p of facebookPosts) assert.ok(blocks.includes(p.message), p.id);
});

test('validatePosts catches broken entries', () => {
  const v = (posts, network = 'instagram') => validatePosts(posts, network, { exists }).join();
  assert.equal(v([igPost('ok')]), '');
  assert.match(v([igPost('dup'), igPost('dup')]), /duplicate id/);
  assert.match(v([igPost('Bad Id')]), /bad id/);
  assert.match(v([igPost('ok', 'tomorrow')]), /publishAt/);
  assert.match(v([igPost('ok', '2026-11-23T12:00:00')]), /publishAt/);
  assert.match(v([igPost('ok', AT, { approved: 'yes' })]), /approved/);
  assert.match(v([igPost('ok', AT, { image: '/cases/m19.webp' })]), /image must be/);
  assert.match(v([igPost('ok', AT, { image: '/social/brand/missing.jpg' })]), /not found/);
  assert.match(v([igPost('ok', AT, { image: undefined })]), /image is required/);
  assert.match(v([igPost('ok', AT, { uz: '' })]), /uz text/);
  assert.match(v([igPost('ok', AT, { ru: 'x'.repeat(IG_CAPTION_LIMIT) })]), /limit 2200/);
  const tags = Array.from({ length: 31 }, (_, i) => `#t${i}`);
  assert.match(v([igPost('ok', AT, { hashtags: tags })]), /more than 30 hashtags/);
  assert.match(v([igPost('ok', AT, { hashtags: ['no-hash'] })]), /hashtags must be/);
  const mentions = Array.from({ length: 21 }, (_, i) => `@user${i}`).join(' ');
  assert.match(v([igPost('ok', AT, { ru: mentions })]), /mentions/);
  assert.equal(v([fbPost('fb')], 'facebook'), '');
  assert.equal(v([fbPost('fb', AT, { image: undefined })], 'facebook'), '', 'text-only is fine');
  assert.match(v([fbPost('fb', AT, { message: ' ' })], 'facebook'), /message is required/);
  assert.match(
    v([fbPost('fb', AT, { image: undefined, link: 'http://x.uz' })], 'facebook'),
    /https/
  );
  assert.match(v([fbPost('fb', AT, { link: 'https://x.uz' })], 'facebook'), /either image or link/);
  assert.match(validatePosts([], 'linkedin').join(), /unknown network/);
  // Без exists наличие файла не проверяется (так очередь проверяет сервер при старте).
  assert.deepEqual(
    validatePosts([igPost('ok', AT, { image: '/social/brand/missing.jpg' })], 'instagram'),
    []
  );
});

test('due selection and network choice: approved, due, earliest first, Instagram on ties', () => {
  const ig = [igPost('later', '2026-11-25T12:00:00+05:00'), igPost('ig', AT)];
  const fb = [fbPost('draft', '2026-11-20T12:00:00+05:00', { approved: false }), fbPost('fb', AT)];
  assert.deepEqual(
    selectDue(ig, T0).map(p => p.id),
    ['ig']
  );
  const all = ['instagram', 'facebook'];
  const a = nextAction(queues(ig, fb), new Map(), all, T0);
  assert.deepEqual([a.network, a.post.id, a.step], ['instagram', 'ig', 'create']);
  const b = nextAction(queues(ig, fb), new Map(), ['facebook'], T0);
  assert.deepEqual([b.network, b.post.id, b.step], ['facebook', 'fb', 'publish']);
  const early = [fbPost('early', '2026-11-23T11:00:00+05:00')];
  assert.equal(nextAction(queues(ig, early), new Map(), all, T0).network, 'facebook');
  assert.equal(nextAction(queues(ig, fb), new Map(), all, T0 - 1), null);
  // Пост в ожидании повтора задерживает следующие посты той же сети, но не другую сеть.
  const records = new Map([
    ['instagram:ig', { status: 'failed', next_attempt_at: new Date(T0 + MIN).toISOString() }]
  ]);
  const ig2 = [...ig, igPost('ig2', AT)];
  assert.equal(nextAction(queues(ig2, fb), records, all, T0).network, 'facebook');
  assert.equal(nextAction(queues(ig2, []), records, all, T0), null);
  records.set('instagram:ig', { status: 'gave_up' });
  assert.equal(nextAction(queues(ig2, []), records, all, T0).post.id, 'ig2');
});

test('graphRequest: token only in the Authorization header, form body, errors classified', async () => {
  const cfg = metaConfig(env);
  const { calls, fetchImpl } = fakeGraph();
  await graphRequest(
    cfg,
    'POST',
    '61596688616863/feed',
    { message: 'a&b', link: undefined },
    fetchImpl
  );
  const c = calls[0];
  assert.equal(c.href, `${GRAPH_HOST}/${DEFAULT_GRAPH_VERSION}/61596688616863/feed`);
  assert.equal(c.headers.Authorization, `Bearer ${token}`);
  assert.equal(c.headers['Content-Type'], 'application/x-www-form-urlencoded');
  assert.deepEqual(c.body, { message: 'a&b' });
  assert.ok(!c.href.includes(token));
  await graphRequest(
    cfg,
    'GET',
    '61596688616863',
    { fields: 'instagram_business_account' },
    fetchImpl
  );
  assert.equal(calls[1].url.searchParams.get('fields'), 'instagram_business_account');
  assert.equal(calls[1].url.searchParams.get('access_token'), null);

  const reply =
    (status, body, raw = false) =>
    async () => ({
      status,
      json: async () => {
        if (raw) throw new SyntaxError('html');
        return body;
      }
    });
  const gerr = (code, message, extra = {}) => ({ error: { code, message, ...extra } });
  await assert.rejects(
    graphRequest(cfg, 'GET', 'x', {}, reply(400, gerr(100, 'Invalid parameter'))),
    e => e.definite === true && e.code === 100 && /Graph 100: Invalid parameter/.test(e.message)
  );
  await assert.rejects(
    graphRequest(cfg, 'GET', 'x', {}, reply(500, gerr(2, 'Service temporarily unavailable'))),
    e => e.definite === false
  );
  await assert.rejects(
    graphRequest(cfg, 'GET', 'x', {}, reply(400, gerr(1, 'An unknown error occurred'))),
    e => e.definite === false
  );
  await assert.rejects(
    graphRequest(cfg, 'GET', 'x', {}, reply(502, null, true)),
    e => e.definite === false && /HTTP 502/.test(e.message)
  );
  const dns = Object.assign(new TypeError('fetch failed'), { cause: { code: 'ENOTFOUND' } });
  await assert.rejects(
    graphRequest(cfg, 'GET', 'x', {}, async () => {
      throw dns;
    }),
    e => e.definite === true
  );
  // Graph и сеть могут вернуть адрес с токеном: в тексте ошибки его не остаётся.
  const echo = gerr(190, `Bad url https://graph.facebook.com/v27.0/me?access_token=${token}&x=1`);
  await assert.rejects(
    graphRequest(cfg, 'GET', 'x', {}, reply(400, echo)),
    e => !e.message.includes(token) && e.message.includes('access_token=<token>&x=1')
  );
  const timeout = new DOMException(`timeout ${token}`, 'TimeoutError');
  await assert.rejects(
    graphRequest(cfg, 'GET', 'x', {}, async () => {
      throw timeout;
    }),
    e => e.definite === false && !e.message.includes(token) && e.message.includes('<token>')
  );
  assert.equal(scrub('key EAAB' + 'x'.repeat(40) + ' end', ''), 'key <token> end');
});

test('Instagram: container → poll → publish, one request per tick, never twice', () =>
  withStore(async box => {
    const cfg = metaConfig(env);
    const q = queues([igPost('a'), igPost('b', AT, { approved: false })]);
    const { calls, fetchImpl } = fakeGraph();
    const tick = now => metaTick(box.store, q, cfg, { now, fetchImpl });
    assert.deepEqual(await tick(T0 - 1), { status: 'idle' });
    assert.deepEqual(await metaTick(box.store, q, metaConfig({}), { now: T0, fetchImpl }), {
      status: 'disabled'
    });
    assert.equal(calls.length, 0);

    const r1 = await tick(T0);
    assert.deepEqual([r1.status, r1.postId, r1.containerId], ['container', 'a', '901']);
    assert.equal(calls[0].path, '17841400000000001/media');
    assert.equal(calls[0].body.image_url, 'https://razrabotkatashkent.uz/social/brand/ig-01.jpg');
    assert.equal(calls[0].body.caption, 'RU a\n\n—\n\nUZ a\n\n#ташкент');
    assert.equal(calls[0].body.access_token, undefined);

    const r2 = await tick(T0 + MIN);
    assert.equal(r2.status, 'ready');
    assert.equal(calls[1].path, '901');
    assert.equal(calls[1].url.searchParams.get('fields'), 'status_code,status');

    const r3 = await tick(T0 + 2 * MIN);
    assert.deepEqual([r3.status, r3.mediaId], ['published', '1802']);
    assert.deepEqual(calls[2].body, { creation_id: '901' });
    assert.equal(calls.length, 3);

    for (let i = 3; i < 8; i++) assert.equal((await tick(T0 + i * MIN)).status, 'idle');
    assert.equal(calls.length, 3);
    const row = box.store.metaPosts()[0];
    assert.deepEqual(
      [row.network, row.post_id, row.status, row.media_id, row.container_id, row.attempts],
      ['instagram', 'a', 'published', '1802', '901', 1]
    );
    assert.equal(
      box.store.claimMetaPost('instagram', 'a', 'creating', new Date().toISOString()),
      0
    );
  }));

test('Instagram: restart after the container was created resumes it, no second container', () =>
  withStore(async box => {
    const cfg = metaConfig(env);
    const q = queues([igPost('a')]);
    let status = 'IN_PROGRESS';
    const { calls, fetchImpl } = fakeGraph({
      'GET container': () => ({ body: { status_code: status } })
    });
    assert.equal((await metaTick(box.store, q, cfg, { now: T0, fetchImpl })).status, 'container');
    const store = box.reopen(); // «перезапуск»: новое подключение к той же базе, пустой кэш
    const r = await metaTick(store, q, cfg, { now: T0 + MIN, fetchImpl });
    assert.deepEqual([r.status, r.containerStatus], ['processing', 'IN_PROGRESS']);
    status = 'FINISHED';
    box.reopen();
    assert.equal(
      (await metaTick(box.store, q, cfg, { now: T0 + 2 * MIN, fetchImpl })).status,
      'ready'
    );
    box.reopen();
    assert.equal(
      (await metaTick(box.store, q, cfg, { now: T0 + 3 * MIN, fetchImpl })).status,
      'published'
    );
    assert.deepEqual(
      calls.map(c => `${c.method} ${c.path}`),
      ['POST 17841400000000001/media', 'GET 901', 'GET 901', 'POST 17841400000000001/media_publish']
    );
  }));

test('Instagram: a crash during media_publish is uncertain and never auto-retried', () =>
  withStore(async box => {
    const cfg = metaConfig(env);
    const q = queues([igPost('a'), igPost('b', '2026-11-23T12:05:00+05:00')]);
    const { calls, fetchImpl } = fakeGraph();
    await metaTick(box.store, q, cfg, { now: T0, fetchImpl });
    await metaTick(box.store, q, cfg, { now: T0 + MIN, fetchImpl });
    // Процесс «упал» сразу после перехода в publishing, до ответа Graph.
    assert.equal(
      box.store.moveMetaPost(
        'instagram',
        'a',
        'container',
        'publishing',
        new Date(T0 + 2 * MIN).toISOString()
      ),
      1
    );
    box.reopen();
    // Пока запрос мог ещё выполняться, ничего не делаем по этой сети.
    assert.equal(
      (await metaTick(box.store, q, cfg, { now: T0 + 3 * MIN, fetchImpl })).status,
      'idle'
    );
    const later = T0 + 2 * MIN + STALE_MS + 1;
    const r = await metaTick(box.store, q, cfg, { now: later, fetchImpl });
    assert.deepEqual([r.status, r.postId], ['container', 'b'], 'later posts continue');
    const a = box.store.metaPosts().find(x => x.post_id === 'a');
    assert.equal(a.status, 'uncertain');
    assert.equal(a.container_id, '901', 'container id kept for manual checking');
    assert.ok(!calls.some(c => c.path.endsWith('media_publish') && c.body.creation_id === '901'));
    assert.equal(box.store.confirmMetaPost('instagram', 'a'), 1);
    assert.equal(box.store.metaPosts().find(x => x.post_id === 'a').status, 'published');
    assert.equal(box.store.retryMetaPost('instagram', 'a'), 0, 'published rows are never cleared');
  }));

test('Instagram: media_publish timeout is uncertain; explicit refusal retries with the same container', () =>
  withStore(async box => {
    const cfg = metaConfig(env);
    const q = queues([igPost('a')]);
    let mode = 'refuse';
    const { calls, fetchImpl } = fakeGraph({
      'POST 17841400000000001/media_publish': () => {
        if (mode === 'refuse')
          return {
            status: 400,
            body: { error: { code: 9, error_subcode: 2207042, message: 'limit' } }
          };
        if (mode === 'timeout') throw new DOMException('aborted', 'TimeoutError');
        return { body: { id: '777' } };
      }
    });
    const tick = now => metaTick(box.store, q, cfg, { now, fetchImpl });
    await tick(T0);
    await tick(T0 + MIN);
    const f = await tick(T0 + 2 * MIN);
    assert.equal(f.status, 'failed');
    assert.match(f.error, /Graph 9\/2207042: limit/);
    let row = box.store.metaPosts()[0];
    assert.deepEqual(
      [row.container_id, row.next_attempt_at],
      ['901', new Date(T0 + 2 * MIN + RETRY_MS).toISOString()]
    );
    assert.equal((await tick(T0 + 3 * MIN)).status, 'idle', 'backs off');
    // Повтор: тот же контейнер, сначала проверка статуса, затем публикация.
    const resume = await tick(T0 + 2 * MIN + RETRY_MS);
    assert.deepEqual([resume.status, resume.step], ['ready', 'resume']);
    mode = 'timeout';
    const u = await tick(T0 + 3 * MIN + RETRY_MS);
    assert.equal(u.status, 'uncertain');
    for (let i = 0; i < 3; i++)
      assert.equal((await tick(T0 + 5 * RETRY_MS + i * MIN)).status, 'idle');
    assert.deepEqual(
      calls.filter(c => c.path.endsWith('/media')).length,
      1,
      'only one container was ever created'
    );
    // После ручной проверки (поста нет) — retry: новый цикл.
    mode = 'ok';
    assert.equal(box.store.retryMetaPost('instagram', 'a'), 1);
    assert.equal((await tick(T0 + 6 * RETRY_MS)).status, 'container');
    row = box.store.metaPosts()[0];
    assert.equal(row.status, 'container');
  }));

test('Instagram: container ERROR, EXPIRED or stuck processing → failed, new container next time', () =>
  withStore(async box => {
    const cfg = metaConfig(env);
    const q = queues([igPost('a')]);
    let reply = { body: { status_code: 'ERROR', status: 'Error: 2207026' } };
    const { calls, fetchImpl } = fakeGraph({ 'GET container': () => reply });
    const tick = now => metaTick(box.store, q, cfg, { now, fetchImpl });
    await tick(T0);
    const e = await tick(T0 + MIN);
    assert.equal(e.status, 'failed');
    assert.match(e.error, /Container ERROR: Error: 2207026/);
    assert.equal(box.store.metaPosts()[0].container_id, null);
    reply = { body: { status_code: 'IN_PROGRESS' } };
    let now = T0 + MIN + RETRY_MS;
    assert.equal((await tick(now)).status, 'container', 'a fresh container is created');
    assert.equal((await tick(now + MIN)).status, 'processing');
    const stuck = await tick(now + POLL_TIMEOUT_MS + MIN);
    assert.equal(stuck.status, 'failed');
    assert.match(stuck.error, /still IN_PROGRESS/);
    // Опрос, который не удаётся из-за сети, повторяется до таймаута, контейнер сохраняется.
    let pollFails = true;
    reply = null;
    const flaky = fakeGraph({
      'GET container': () => {
        if (pollFails)
          throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNRESET' } });
        return { body: { status_code: 'FINISHED' } };
      }
    });
    now += RETRY_MS + POLL_TIMEOUT_MS + MIN;
    await metaTick(box.store, q, cfg, { now, fetchImpl: flaky.fetchImpl });
    const p = await metaTick(box.store, q, cfg, { now: now + MIN, fetchImpl: flaky.fetchImpl });
    assert.equal(p.status, 'processing');
    assert.match(box.store.metaPosts()[0].error, /ECONNRESET/);
    pollFails = false;
    assert.equal(
      (await metaTick(box.store, q, cfg, { now: now + 2 * MIN, fetchImpl: flaky.fetchImpl }))
        .status,
      'ready'
    );
    // Контейнер, уже опубликованный (например, вручную), второй раз не публикуется.
    const done = fakeGraph({ 'GET container': () => ({ body: { status_code: 'PUBLISHED' } }) });
    const q2 = queues([igPost('c')]);
    await metaTick(box.store, q2, cfg, { now, fetchImpl: done.fetchImpl });
    const pub = await metaTick(box.store, q2, cfg, { now: now + MIN, fetchImpl: done.fetchImpl });
    assert.equal(pub.status, 'published');
    assert.ok(!done.calls.some(c => c.path.endsWith('media_publish')));
    assert.ok(calls.length >= 4);
  }));

test('Instagram: an expired container is not reused on retry', () =>
  withStore(async box => {
    const cfg = metaConfig(env);
    const q = queues([igPost('a')]);
    const { calls, fetchImpl } = fakeGraph({
      'POST 17841400000000001/media_publish': () => ({
        status: 400,
        body: { error: { code: 100, message: 'no' } }
      })
    });
    await metaTick(box.store, q, cfg, { now: T0, fetchImpl });
    await metaTick(box.store, q, cfg, { now: T0 + MIN, fetchImpl });
    assert.equal(
      (await metaTick(box.store, q, cfg, { now: T0 + 2 * MIN, fetchImpl })).status,
      'failed'
    );
    const r = await metaTick(box.store, q, cfg, { now: T0 + CONTAINER_TTL_MS + 1, fetchImpl });
    assert.equal(r.step, 'create');
    assert.equal(calls.filter(c => c.path.endsWith('/media')).length, 2);
  }));

test('Instagram: a crash while creating the container is retried (nothing was published)', () =>
  withStore(async box => {
    const cfg = metaConfig(env);
    const q = queues([igPost('a')]);
    box.store.claimMetaPost('instagram', 'a', 'creating', new Date(T0).toISOString());
    const { fetchImpl } = fakeGraph();
    assert.equal((await metaTick(box.store, q, cfg, { now: T0 + MIN, fetchImpl })).status, 'idle');
    const r = await metaTick(box.store, q, cfg, { now: T0 + STALE_MS + MIN, fetchImpl });
    assert.equal(r.status, 'container');
    assert.equal(box.store.metaPosts()[0].attempts, 2);
  }));

test('Instagram: IG user id comes with the Page token lookup and is cached in memory', () =>
  withStore(async box => {
    const cfg = metaConfig({ ...env, META_IG_USER_ID: '' });
    const q = queues([igPost('a')]);
    const cache = {};
    const { calls, fetchImpl } = fakeGraph();
    const tick = now => rawTick(box.store, q, cfg, { now, fetchImpl, cache });
    const r = await tick(T0);
    assert.deepEqual(r, { status: 'token_resolved', kind: TOKEN_KINDS.page });
    assert.equal(
      calls[0].url.searchParams.get('fields'),
      'access_token,name,instagram_business_account'
    );
    assert.equal(cache.igUserId, '17841400000000009');
    assert.equal((await tick(T0 + MIN)).status, 'container');
    assert.equal(calls[1].path, '17841400000000009/media');
    await tick(T0 + 2 * MIN);
    assert.equal((await tick(T0 + 3 * MIN)).status, 'published');
    assert.equal(calls.filter(c => c.path === '61596688616863').length, 1);

    // Страница без привязанного Instagram: ошибка, повтор не раньше чем через 30 минут, FB идёт дальше.
    const none = fakeGraph({ 'GET 61596688616863': () => ({ body: { id: '61596688616863' } }) });
    const c2 = {};
    const q2 = queues([igPost('x')], [fbPost('f', '2026-11-23T12:01:00+05:00')]);
    const t2 = now => rawTick(box.store, q2, cfg, { now, fetchImpl: none.fetchImpl, cache: c2 });
    assert.equal((await t2(T0 + 4 * MIN)).status, 'token_resolved');
    const u = await t2(T0 + 5 * MIN);
    assert.equal(u.status, 'ig_unavailable');
    assert.match(u.error, /No Instagram business account/);
    assert.equal(none.calls[1].url.searchParams.get('fields'), 'instagram_business_account');
    const f = await t2(T0 + 6 * MIN);
    assert.deepEqual([f.status, f.network], ['published', 'facebook']);
    assert.equal((await t2(T0 + 7 * MIN)).status, 'idle');
  }));

test('system-user token: Page token is resolved once and used for Facebook and Instagram calls', () =>
  withStore(async box => {
    const pageToken = 'EAAPageTokenFromSystemUser0987654321abcdefPAGE';
    const cfg = metaConfig(env);
    const q = queues([igPost('a')], [fbPost('f')]);
    const cache = {};
    const { calls, fetchImpl } = fakeGraph({
      'GET 61596688616863': ({ url }) => ({
        body: { id: '61596688616863', name: 'Razrabotka Tashkent', access_token: pageToken }
      }),
      'POST 61596688616863/photos': () => ({
        status: 400,
        body: { error: { code: 100, message: `bad url ?access_token=x echo ${pageToken}` } }
      })
    });
    const tick = now => rawTick(box.store, q, cfg, { now, fetchImpl, cache });
    const r = await tick(T0);
    assert.deepEqual(r, { status: 'token_resolved', kind: TOKEN_KINDS.resolved });
    assert.equal(calls[0].headers.Authorization, `Bearer ${token}`, 'lookup uses configured token');
    assert.equal(cache.pageToken, pageToken);
    assert.ok(!JSON.stringify(r).includes(pageToken));
    const ig = await tick(T0 + MIN);
    assert.equal(ig.status, 'container');
    assert.equal(calls[1].headers.Authorization, `Bearer ${pageToken}`);
    assert.equal(calls[1].body.access_token, undefined);
    await tick(T0 + 2 * MIN);
    await tick(T0 + 3 * MIN);
    const fb = await tick(T0 + 4 * MIN);
    assert.deepEqual([fb.network, fb.status], ['facebook', 'failed']);
    assert.equal(calls.at(-1).path, '61596688616863/photos');
    assert.equal(calls.at(-1).headers.Authorization, `Bearer ${pageToken}`);
    assert.ok(!fb.error.includes(pageToken), 'page token scrubbed from errors');
    assert.ok(!JSON.stringify(box.store.metaPosts()).includes(pageToken));
    assert.ok(calls.slice(1).every(c => c.headers.Authorization === `Bearer ${pageToken}`));
    assert.equal(calls.filter(c => c.path === '61596688616863').length, 1, 'resolved once');
  }));

test('Page token configured directly: no access_token in the lookup → configured token is used', async () => {
  const cfg = metaConfig(env);
  const plain = fakeGraph({
    'GET 61596688616863': () => ({ body: { id: '61596688616863', name: 'Razrabotka Tashkent' } })
  });
  const a = await resolvePageToken(cfg, plain.fetchImpl);
  assert.deepEqual([a.token === token, a.kind, a.page.name], [true, 'page', 'Razrabotka Tashkent']);
  const same = fakeGraph({
    'GET 61596688616863': () => ({ body: { id: '61596688616863', access_token: token } })
  });
  const b = await resolvePageToken(cfg, same.fetchImpl);
  assert.deepEqual([b.token === token, b.kind, 'access_token' in b.page], [true, 'page', false]);
  const noField = fakeGraph({
    'GET 61596688616863': () => ({
      status: 400,
      body: { error: { code: 100, message: 'Tried accessing nonexisting field (access_token)' } }
    })
  });
  const c = await resolvePageToken(cfg, noField.fetchImpl);
  assert.deepEqual([c.token === token, c.kind], [true, 'page']);
  const missing = fakeGraph({
    'GET 61596688616863': () => ({
      status: 400,
      body: { error: { code: 100, error_subcode: 33, message: 'Object does not exist' } }
    })
  });
  await assert.rejects(resolvePageToken(cfg, missing.fetchImpl), /100\/33/);
});

test('Page token lookup failures wait before retrying; a rejected token (#190) is looked up again', () =>
  withStore(async box => {
    const cfg = metaConfig(env);
    const q = queues([], [fbPost('f'), fbPost('g', '2026-11-23T12:30:00+05:00')]);
    const cache = {};
    let lookup = 'expired';
    let photos = 'ok';
    const { calls, fetchImpl } = fakeGraph({
      'GET 61596688616863': () =>
        lookup === 'expired'
          ? { status: 400, body: { error: { code: 190, message: `Session expired ${token}` } } }
          : {
              body: {
                id: '61596688616863',
                access_token: `EAAfreshPageToken${lookup}1234567890abcdef`
              }
            },
      'POST 61596688616863/photos': () =>
        photos === 'ok'
          ? { body: { id: '1', post_id: '61596688616863_1' } }
          : { status: 400, body: { error: { code: 190, message: 'Invalid OAuth access token' } } }
    });
    const tick = now => rawTick(box.store, q, cfg, { now, fetchImpl, cache });
    const u = await tick(T0);
    assert.equal(u.status, 'token_unavailable');
    assert.ok(!u.error.includes(token));
    assert.equal((await tick(T0 + MIN)).status, 'waiting_token');
    assert.equal(calls.length, 1);
    lookup = 'one';
    assert.equal((await tick(T0 + RETRY_MS)).status, 'token_resolved');
    assert.equal((await tick(T0 + RETRY_MS + MIN)).status, 'published');
    photos = 'reject';
    const f = await tick(Date.parse('2026-11-23T12:30:00+05:00'));
    assert.equal(f.status, 'failed');
    assert.equal(cache.pageToken, undefined, 'cached page token dropped after #190');
    lookup = 'two';
    photos = 'ok';
    const later = Date.parse('2026-11-23T12:30:00+05:00') + RETRY_MS;
    assert.equal((await tick(later - MIN)).status, 'idle', 'no lookup while nothing is due');
    assert.equal((await tick(later)).status, 'token_resolved');
    assert.equal(cache.pageToken, 'EAAfreshPageTokentwo1234567890abcdef');
    assert.equal((await tick(later + MIN)).status, 'published');
    assert.equal(calls.at(-1).headers.Authorization, `Bearer ${cache.pageToken}`);
  }));

test('Facebook: photo post with caption, text post via feed, one call each', () =>
  withStore(async box => {
    const cfg = metaConfig({ ...env, META_INSTAGRAM: 'false' });
    const q = queues(
      [igPost('ig-ignored')],
      [
        fbPost('photo'),
        fbPost('text', '2026-11-23T12:10:00+05:00', {
          image: undefined,
          link: 'https://razrabotkatashkent.uz/prices'
        })
      ]
    );
    const { calls, fetchImpl } = fakeGraph();
    const p = await metaTick(box.store, q, cfg, { now: T0 + 15 * MIN, fetchImpl });
    assert.deepEqual(
      [p.status, p.network, p.postId, p.mediaId],
      ['published', 'facebook', 'photo', '61596688616863_1']
    );
    assert.equal(calls[0].path, '61596688616863/photos');
    assert.deepEqual(calls[0].body, {
      url: 'https://razrabotkatashkent.uz/social/brand/ig-01.jpg',
      caption: 'FB photo',
      published: 'true'
    });
    const t = await metaTick(box.store, q, cfg, { now: T0 + 16 * MIN, fetchImpl });
    assert.equal(t.postId, 'text');
    assert.equal(calls[1].path, '61596688616863/feed');
    assert.deepEqual(calls[1].body, {
      message: 'FB text',
      link: 'https://razrabotkatashkent.uz/prices'
    });
    assert.equal(
      (await metaTick(box.store, q, cfg, { now: T0 + 17 * MIN, fetchImpl })).status,
      'idle'
    );
    assert.equal(calls.length, 2);
  }));

test('Facebook: definite failures back off and give up; timeouts are uncertain', () =>
  withStore(async box => {
    const cfg = metaConfig(env);
    const q = queues([], [fbPost('a'), fbPost('b', '2026-11-23T12:01:00+05:00')]);
    let n = 0;
    const { fetchImpl } = fakeGraph({
      'POST 61596688616863/photos': () => (
        n++,
        { status: 403, body: { error: { code: 200, message: `Permissions error ${token}` } } }
      )
    });
    let now = T0 + MIN;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const r = await metaTick(box.store, queues([], [fbPost('a')]), cfg, { now, fetchImpl });
      assert.equal(r.status, attempt < MAX_ATTEMPTS ? 'failed' : 'gave_up');
      assert.ok(!r.error.includes(token), 'token scrubbed from errors');
      assert.equal(
        (await metaTick(box.store, queues([], [fbPost('a')]), cfg, { now: now + MIN, fetchImpl }))
          .status,
        'idle'
      );
      now += RETRY_MS;
    }
    assert.equal(n, MAX_ATTEMPTS);
    const row = box.store.metaPosts()[0];
    assert.equal(row.attempts, MAX_ATTEMPTS);
    assert.match(row.error, /Graph 200: Permissions error <token>/);
    assert.ok(!JSON.stringify(box.store.metaPosts()).includes(token));

    const slow = fakeGraph({
      'POST 61596688616863/photos': () => {
        throw new DOMException('The operation was aborted due to timeout', 'TimeoutError');
      }
    });
    const u = await metaTick(box.store, q, cfg, { now, fetchImpl: slow.fetchImpl });
    assert.deepEqual([u.status, u.postId], ['uncertain', 'b']);
    assert.equal(
      (await metaTick(box.store, q, cfg, { now: now + RETRY_MS, fetchImpl: slow.fetchImpl }))
        .status,
      'idle'
    );
    assert.equal(slow.calls.length, 1);
    // 5xx без JSON: результат неизвестен — тоже uncertain.
    const q3 = queues([], [fbPost('c')]);
    const bad = fakeGraph({ 'POST 61596688616863/photos': () => ({ status: 502, raw: true }) });
    assert.equal(
      (await metaTick(box.store, q3, cfg, { now, fetchImpl: bad.fetchImpl })).status,
      'uncertain'
    );
    assert.equal(box.store.retryMetaPost('facebook', 'a'), 1);
    assert.equal(box.store.retryMetaPost('facebook', 'b'), 1);
  }));

test('Instagram daily publishing limit pauses Instagram but not Facebook', () =>
  withStore(async box => {
    const cfg = metaConfig(env);
    const at = new Date(T0 - MIN).toISOString();
    for (let i = 0; i < 50; i++) {
      box.store.claimMetaPost('instagram', `old-${i}`, 'publishing', at);
      box.store.finishMetaPost(
        'instagram',
        `old-${i}`,
        'publishing',
        { status: 'published', mediaId: String(i) },
        at
      );
    }
    const q = queues([igPost('a')], [fbPost('f', '2026-11-23T12:30:00+05:00')]);
    const { fetchImpl } = fakeGraph();
    assert.equal((await metaTick(box.store, q, cfg, { now: T0, fetchImpl })).status, 'idle');
    assert.equal(
      (await metaTick(box.store, q, cfg, { now: T0 + 30 * MIN, fetchImpl })).network,
      'facebook'
    );
    assert.equal(
      (await metaTick(box.store, q, cfg, { now: T0 + 24 * 3600000, fetchImpl })).status,
      'container'
    );
  }));

test('Telegram and Meta records live side by side in the same database', () =>
  withStore(async box => {
    assert.deepEqual(box.store.metaPosts(), []);
    assert.deepEqual(box.store.telegramSends(), []);
    assert.equal(
      box.store.claimMetaPost('facebook', 'fb-1', 'publishing', new Date(T0).toISOString()),
      1
    );
    assert.equal(
      box.store.claimMetaPost('facebook', 'fb-1', 'publishing', new Date(T0).toISOString()),
      0
    );
    assert.equal(box.store.recoverMetaPosts(new Date(T0 + STALE_MS + 1).toISOString()), 1);
    assert.equal(box.store.metaPosts()[0].status, 'uncertain');
  }));
