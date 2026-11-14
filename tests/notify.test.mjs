import test from 'node:test';
import assert from 'node:assert/strict';
import { leadMessage, notifyLead } from '../server/lib/notify.mjs';
const lead = {
  name: 'Ali <b>',
  contact: '@ali_dev',
  message: 'Нужен сайт для магазина',
  service: 'web',
  budget: '',
  locale: 'uz',
  attribution: { channel: 'search', referrer: 'google.com', landing: '/services/websites' }
};
test('formats lead with escaped HTML and source', () => {
  const m = leadMessage(lead, 'id-1', 'https://shohruxdev.uz');
  assert.match(m, /Ali &lt;b&gt;/);
  assert.match(m, /Сайт/);
  assert.match(m, /search · google\.com/);
  assert.match(m, /\(UZ\)/);
  assert.doesNotMatch(m, /Бюджет/);
});
test('skips without config, sends with config, survives Telegram errors', async () => {
  assert.equal((await notifyLead(lead, '1', { env: {} })).status, 'unconfigured');
  let call;
  const ok = async (url, init) => {
    call = { url, body: JSON.parse(init.body) };
    return { ok: true };
  };
  assert.equal(
    (
      await notifyLead(lead, '1', {
        env: { TELEGRAM_BOT_TOKEN: 'T', TELEGRAM_CHAT_ID: '42' },
        fetcher: ok
      })
    ).status,
    'sent'
  );
  assert.equal(call.url, 'https://api.telegram.org/botT/sendMessage');
  assert.equal(call.body.chat_id, '42');
  assert.equal(call.body.parse_mode, 'HTML');
  assert.equal(
    (
      await notifyLead(lead, '1', {
        env: { TELEGRAM_BOT_TOKEN: 'T', TELEGRAM_CHAT_ID: '42' },
        fetcher: async () => ({ ok: false, status: 401 })
      })
    ).status,
    'failed'
  );
  assert.equal(
    (
      await notifyLead(lead, '1', {
        env: { TELEGRAM_BOT_TOKEN: 'T', TELEGRAM_CHAT_ID: '42' },
        fetcher: async () => {
          throw Error('down');
        }
      })
    ).status,
    'failed'
  );
});
