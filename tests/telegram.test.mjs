import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  CAPTION_LIMIT,
  LANG_GAP_MS,
  MAX_ATTEMPTS,
  RETRY_MS,
  STALE_MS,
  TELEGRAM_API,
  buildMessages,
  escapeHtml,
  nextSend,
  selectDue,
  sendTelegram,
  splitText,
  telegramConfig,
  telegramTick,
  validatePosts
} from '../server/lib/telegram.mjs';
import { openStore } from '../server/lib/store.mjs';
import { telegramPosts } from '../shared/telegram-posts.mjs';
import { projectTypes, languages, designs, options, urgency } from '../shared/pricing.mjs';

const token = '123456789:AAbbCCddEEffGGhhIIjjKKllMMnnOOppQQr';
const env = {
  TELEGRAM_CHANNEL_ID: '@razrabotkatashkent',
  TELEGRAM_BOT_TOKEN: token,
  SITE_URL: 'https://razrabotkatashkent.uz/',
  NODE_ENV: 'production',
  SITE_INDEXABLE: 'true'
};
const T0 = Date.parse('2026-11-16T05:00:00Z');
const post = (id, publishAt, extra = {}) => ({
  id,
  publishAt,
  approved: true,
  ru: `RU ${id}`,
  uz: `UZ ${id}`,
  ...extra
});

function withStore(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'telegram-'));
  const store = openStore(join(dir, 'c.sqlite'));
  return Promise.resolve(fn(store, join(dir, 'c.sqlite'))).finally(() => {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  });
}
function fakeTelegram() {
  const calls = [];
  let id = 100;
  const fetchImpl = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body), signal: init.signal });
    return { status: 200, json: async () => ({ ok: true, result: { message_id: ++id } }) };
  };
  return { calls, fetchImpl };
}

test('config: inert unless channel, token, https site and the live/explicit gate all agree', () => {
  const on = telegramConfig(env);
  assert.equal(on.enabled, true);
  assert.equal(on.siteUrl, 'https://razrabotkatashkent.uz');
  assert.equal(on.token, token);
  assert.doesNotMatch(JSON.stringify(on), /AAbb/, 'token must not be serialised');
  const off = patch => telegramConfig({ ...env, ...patch }).enabled;
  assert.equal(off({ TELEGRAM_CHANNEL_ID: '' }), false);
  assert.equal(off({ TELEGRAM_CHANNEL_ID: 'razrabotka' }), false);
  assert.equal(telegramConfig({ ...env, TELEGRAM_CHANNEL_ID: '-1001234567890' }).enabled, true);
  assert.equal(off({ TELEGRAM_BOT_TOKEN: '' }), false);
  assert.equal(off({ TELEGRAM_BOT_TOKEN: 'not-a-token' }), false);
  assert.equal(off({ SITE_URL: 'http://127.0.0.1:3000' }), false);
  assert.equal(off({ SITE_INDEXABLE: 'false' }), false);
  assert.equal(off({ NODE_ENV: 'development' }), false);
  assert.equal(off({ TELEGRAM_AUTOPOST: 'false' }), false);
  assert.equal(
    off({ NODE_ENV: 'development', SITE_INDEXABLE: '', TELEGRAM_AUTOPOST: 'true' }),
    true
  );
  assert.equal(off({ TELEGRAM_AUTOPOST: 'true', TELEGRAM_CHANNEL_ID: '' }), false);
});

test('config: dedicated channel bot token wins over the lead-notification token', () => {
  const other = '987654321:ZZyyXXwwVVuuTTssRRqqPPooNNmmLLkkJJi';
  assert.equal(telegramConfig({ ...env, TELEGRAM_CHANNEL_BOT_TOKEN: other }).token, other);
  assert.equal(telegramConfig(env).token, token);
  assert.equal(
    telegramConfig({ ...env, TELEGRAM_BOT_TOKEN: '', TELEGRAM_CHANNEL_BOT_TOKEN: other }).enabled,
    true
  );
});

test('queue is valid, approval is explicit, on the planned schedule, images exist', () => {
  assert.deepEqual(validatePosts(telegramPosts), []);
  assert.equal(telegramPosts.length, 10);
  assert.ok(telegramPosts.every(p => typeof p.approved === 'boolean'));
  assert.equal(telegramPosts[0].publishAt, '2026-11-16T10:00:00+05:00');
  for (const p of telegramPosts) {
    assert.equal(new Date(p.publishAt).getUTCHours(), 5, `${p.id} at 10:00 Tashkent`);
    assert.ok([1, 3, 5].includes(new Date(p.publishAt).getUTCDay()), `${p.id} Mon/Wed/Fri`);
    if (p.image) {
      assert.ok(existsSync(join('public', p.image)), p.image);
      assert.ok(p.ru.length <= CAPTION_LIMIT && p.uz.length <= CAPTION_LIMIT, p.id);
    }
  }
  const at = '2026-11-16T10:00:00+05:00';
  assert.match(validatePosts([post('dup', at), post('dup', at)]).join(), /duplicate id/);
  assert.match(validatePosts([post('ok', 'tomorrow')]).join(), /publishAt/);
  assert.match(validatePosts([post('ok', '2026-11-16T10:00:00')]).join(), /publishAt/);
  assert.match(validatePosts([{ ...post('ok', at), image: '/cases/m19.webp' }]).join(), /image/);
  assert.match(validatePosts([{ ...post('ok', at), approved: 'yes' }]).join(), /approved/);
});

test('price post matches shared/pricing.mjs', () => {
  const [ru, uz] = [telegramPosts[0].ru, telegramPosts[0].uz];
  const fmt = n => String(n);
  for (const id of ['landing', 'corporate', 'catalog', 'shop', 'telegram']) {
    const [lo, hi] = projectTypes.find(t => t.id === id).price;
    assert.ok(ru.includes(`от ${fmt(lo)} млн сум (${lo} – ${hi} млн)`), `RU ${id}`);
    assert.ok(uz.includes(`${fmt(lo)} mln so‘mdan (${lo} – ${hi} mln)`), `UZ ${id}`);
  }
  const pct = k => Math.round((k - 1) * 100);
  assert.ok(ru.includes(`(RU + UZ): +${pct(languages[2].price)}%`));
  assert.ok(ru.includes(`−${-pct(designs.template.price)}%`));
  assert.ok(ru.includes(`+${pct(designs.premium.price)}%`));
  const pay = options.find(o => o.id === 'payments').price;
  assert.ok(ru.includes(`+${pay[0]} – ${pay[1]} млн сум`));
  assert.ok(ru.includes(`на ${-pct(urgency.time)}% быстрее: +${pct(urgency.price)}%`));
});

test('due selection: approved and due only, in publish order', () => {
  const posts = [
    post('later', '2026-11-18T10:00:00+05:00'),
    post('draft', '2026-11-10T10:00:00+05:00', { approved: false }),
    post('first', '2026-11-16T10:00:00+05:00'),
    post('older', '2026-11-14T10:00:00+05:00')
  ];
  assert.deepEqual(
    selectDue(posts, T0).map(p => p.id),
    ['older', 'first']
  );
  assert.deepEqual(
    selectDue(posts, T0 - 1).map(p => p.id),
    ['older']
  );
});

test('HTML escaping and caption splitting', () => {
  assert.equal(escapeHtml('a < b & c > d "q"'), 'a &lt; b &amp; c &gt; d "q"');
  assert.deepEqual(splitText('short', 10), ['short']);
  const paras = ['A'.repeat(600), 'B'.repeat(600), 'C'.repeat(600)].join('\n\n');
  const parts = splitText(paras, CAPTION_LIMIT, 4096);
  assert.deepEqual(parts, ['A'.repeat(600), 'B'.repeat(600) + '\n\n' + 'C'.repeat(600)]);
  const words = splitText('word '.repeat(50), 32);
  assert.ok(words.every(p => p.length <= 32 && !p.startsWith(' ') && !p.endsWith(' ')));
  assert.equal(words.join(' '), 'word '.repeat(50).trim());
  assert.deepEqual(splitText('x'.repeat(25), 10), ['x'.repeat(10), 'x'.repeat(10), 'x'.repeat(5)]);
  const emoji = splitText('😀'.repeat(6), 5);
  assert.ok(emoji.every(p => !/[\ud800-\udbff]$/.test(p)));
  assert.equal(emoji.join(''), '😀'.repeat(6));

  const site = 'https://razrabotkatashkent.uz';
  const long = post('long', T0, { image: '/social/telegram/m19.jpg', ru: paras + '\n\n<b>&' });
  const msgs = buildMessages(long, 'ru', site);
  assert.equal(msgs.length, 2);
  assert.equal(msgs[0].method, 'sendPhoto');
  assert.equal(msgs[0].body.photo, 'https://razrabotkatashkent.uz/social/telegram/m19.jpg');
  assert.equal(msgs[0].body.caption, 'A'.repeat(600));
  assert.equal(msgs[1].method, 'sendMessage');
  assert.ok(msgs[1].body.text.endsWith('&lt;b&gt;&amp;'));
  assert.equal(msgs[1].body.link_preview_options.is_disabled, true);
  const text = buildMessages(post('t', T0, { ru: 'Цены: https://x.uz?a=1&b=2' }), 'ru', site);
  assert.deepEqual(text, [
    {
      method: 'sendMessage',
      body: {
        text: 'Цены: https://x.uz?a=1&amp;b=2',
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true }
      }
    }
  ]);
  assert.deepEqual(buildMessages(post('no-uz', T0, { uz: undefined }), 'uz', site), []);
  for (const p of telegramPosts)
    for (const lang of ['ru', 'uz']) assert.equal(buildMessages(p, lang, site).length, 1, p.id);
});

test('sendTelegram calls the Bot API with timeout and classifies failures', async () => {
  const cfg = telegramConfig(env);
  const { calls, fetchImpl } = fakeTelegram();
  const msg = buildMessages(
    post('p', T0, { image: '/social/telegram/m19.jpg' }),
    'ru',
    cfg.siteUrl
  )[0];
  assert.equal(await sendTelegram(cfg, msg, fetchImpl), 101);
  assert.equal(calls[0].url, `${TELEGRAM_API}/bot${token}/sendPhoto`);
  assert.equal(calls[0].body.chat_id, '@razrabotkatashkent');
  assert.equal(calls[0].body.parse_mode, 'HTML');
  assert.ok(calls[0].signal instanceof AbortSignal);

  const reply = (status, data) => async () => ({ status, json: async () => data });
  await assert.rejects(
    sendTelegram(cfg, msg, reply(403, { ok: false, error_code: 403, description: 'Forbidden' })),
    e => e.definite === true && /403: Forbidden/.test(e.message)
  );
  await assert.rejects(
    sendTelegram(
      cfg,
      msg,
      reply(429, {
        ok: false,
        error_code: 429,
        description: 'Too Many',
        parameters: { retry_after: 7 }
      })
    ),
    e => e.definite && e.retryAfter === 7
  );
  await assert.rejects(
    sendTelegram(cfg, msg, async () => ({
      status: 502,
      json: async () => {
        throw Error('html');
      }
    })),
    e => e.definite === false
  );
  const dns = Object.assign(new TypeError('fetch failed'), { cause: { code: 'ENOTFOUND' } });
  await assert.rejects(
    sendTelegram(cfg, msg, async () => {
      throw dns;
    }),
    e => e.definite === true
  );
  const timeout = new DOMException(`timeout ${token}`, 'TimeoutError');
  await assert.rejects(
    sendTelegram(cfg, msg, async () => {
      throw timeout;
    }),
    e => e.definite === false && !e.message.includes(token) && e.message.includes('<token>')
  );
});

test('tick publishes RU then UZ once, survives restarts and never duplicates', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'telegram-'));
  const file = join(dir, 'c.sqlite');
  try {
    const cfg = telegramConfig(env);
    const posts = [
      post('a', '2026-11-16T10:00:00+05:00'),
      post('b', '2026-11-16T10:00:00+05:00', { approved: false })
    ];
    const { calls, fetchImpl } = fakeTelegram();
    let store = openStore(file);
    const tick = now => telegramTick(store, posts, cfg, { now, fetchImpl });
    assert.deepEqual(await tick(T0 - 1), { status: 'idle' });
    assert.deepEqual(await telegramTick(store, posts, telegramConfig({}), { now: T0, fetchImpl }), {
      status: 'disabled'
    });
    const r1 = await tick(T0);
    assert.equal(r1.status, 'sent');
    assert.equal(r1.lang, 'ru');
    // UZ ждёт паузу после RU.
    assert.equal((await tick(T0 + 60000)).status, 'idle');

    // «Перезапуск»: новое подключение к той же базе.
    store.close();
    store = openStore(file);
    assert.equal((await tick(T0 + LANG_GAP_MS)).lang, 'uz');
    for (let i = 1; i <= 3; i++)
      assert.equal((await tick(T0 + LANG_GAP_MS + i * 60000)).status, 'idle');
    assert.deepEqual(
      calls.map(c => c.body.text),
      ['RU a', 'UZ a']
    );
    assert.deepEqual(
      store.telegramSends().map(r => [r.lang, r.status, r.message_id]),
      [
        ['ru', 'sent', 101],
        ['uz', 'sent', 102]
      ]
    );
    assert.equal(
      store.claimTelegramSend({ postId: 'a', lang: 'ru', seq: 0 }, new Date().toISOString()),
      0
    );
    store.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a crash mid-send is marked uncertain, not resent; later posts continue', () =>
  withStore(async store => {
    const cfg = telegramConfig(env);
    const posts = [post('a', '2026-11-16T10:00:00+05:00'), post('b', '2026-11-16T10:05:00+05:00')];
    store.claimTelegramSend({ postId: 'a', lang: 'ru', seq: 0 }, new Date(T0).toISOString());
    const { calls, fetchImpl } = fakeTelegram();
    // Пока запрос мог ещё выполняться, ничего не отправляем повторно.
    assert.equal(
      (await telegramTick(store, posts, cfg, { now: T0 + 60000, fetchImpl })).status,
      'idle'
    );
    const r = await telegramTick(store, posts, cfg, { now: T0 + STALE_MS + 360000, fetchImpl });
    assert.equal(r.postId, 'b');
    assert.equal(store.telegramSends().find(x => x.post_id === 'a').status, 'uncertain');
    assert.deepEqual(
      calls.map(c => c.body.text),
      ['RU b']
    );
    assert.equal(store.confirmTelegramPost('a', 'ru'), 1);
    const uz = await telegramTick(store, posts, cfg, { now: T0 + STALE_MS + 360000, fetchImpl });
    assert.deepEqual([uz.postId, uz.lang], ['a', 'uz']);
    assert.equal(store.confirmTelegramPost('a', 'ru'), 0);
    assert.equal(store.retryTelegramPost('a', 'ru'), 0, 'sent rows are never cleared');
  }));

test('definite failures back off 30 minutes and give up after max attempts', () =>
  withStore(async store => {
    const cfg = telegramConfig(env);
    const posts = [post('a', '2026-11-16T10:00:00+05:00')];
    let n = 0;
    const failing = async () => (
      n++,
      {
        status: 400,
        json: async () => ({ ok: false, error_code: 400, description: 'chat not found' })
      }
    );
    let now = T0;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const r = await telegramTick(store, posts, cfg, { now, fetchImpl: failing });
      assert.equal(r.status, attempt < MAX_ATTEMPTS ? 'failed' : 'gave_up');
      assert.equal(
        (await telegramTick(store, posts, cfg, { now: now + 60000, fetchImpl: failing })).status,
        'idle'
      );
      now += RETRY_MS;
    }
    assert.equal(n, MAX_ATTEMPTS);
    assert.equal(
      (await telegramTick(store, posts, cfg, { now: now + RETRY_MS, fetchImpl: failing })).status,
      'idle'
    );
    const row = store.telegramSends()[0];
    assert.equal(row.attempts, MAX_ATTEMPTS);
    assert.match(row.error, /chat not found/);
    assert.equal(store.retryTelegramPost('a'), 1);
    const { fetchImpl } = fakeTelegram();
    assert.equal((await telegramTick(store, posts, cfg, { now, fetchImpl })).status, 'sent');
  }));

test('nextSend keeps order: a post waiting for retry holds back later posts', () => {
  const posts = [post('a', '2026-11-16T10:00:00+05:00'), post('b', '2026-11-16T10:00:00+05:00')];
  const site = 'https://x.uz';
  const records = new Map([
    ['a:ru:0', { status: 'failed', next_attempt_at: new Date(T0 + 1000).toISOString() }]
  ]);
  assert.equal(nextSend(posts, records, site, T0), null);
  assert.equal(nextSend(posts, records, site, T0 + 1000).postId, 'a');
  records.set('a:ru:0', { status: 'gave_up' });
  assert.equal(nextSend(posts, records, site, T0).postId, 'b');
});
