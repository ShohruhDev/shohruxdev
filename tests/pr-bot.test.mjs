import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import {
  verifyGithubSignature,
  prMessage,
  handleGithubEvent,
  handleTelegramUpdate,
  checksState,
  mergePr
} from '../server/lib/pr-bot.mjs';

const env = {
  TELEGRAM_BOT_TOKEN: 'T',
  TELEGRAM_CHAT_ID: '42',
  GITHUB_TOKEN: 'G',
  GITHUB_REPO: 'o/r'
};
const pr = {
  number: 7,
  title: 'Fix <title>',
  body: 'Нужно ревью владельца\nЧто сделано',
  html_url: 'https://github.com/o/r/pull/7',
  head: { ref: 'team/x', sha: 'abc' },
  base: { repo: { full_name: 'o/r' } },
  user: { login: 'bot' },
  additions: 3,
  deletions: 1,
  changed_files: 2
};
/** Fake fetch: routes by URL, records calls. */
function fake(routes) {
  const calls = [];
  const fn = async (url, init = {}) => {
    calls.push({ url, method: init.method || 'GET', body: init.body && JSON.parse(init.body) });
    const hit = Object.entries(routes).find(([k]) => url.includes(k));
    const data = hit ? hit[1] : { ok: true };
    return {
      ok: data.__status ? data.__status < 300 : true,
      status: data.__status || 200,
      json: async () => data
    };
  };
  return { fn, calls };
}

test('verifies GitHub signature', () => {
  const sig = 'sha256=' + createHmac('sha256', 's').update('{}').digest('hex');
  assert.equal(verifyGithubSignature('{}', sig, 's'), true);
  assert.equal(verifyGithubSignature('{}', sig, 'other'), false);
  assert.equal(verifyGithubSignature('{}', undefined, 's'), false);
  assert.equal(verifyGithubSignature('{}', sig, ''), false);
});

test('PR message escapes HTML, flags review and has buttons', () => {
  const m = prMessage(pr);
  assert.match(m.text, /PR #7/);
  assert.match(m.text, /Fix &lt;title&gt;/);
  assert.match(m.text, /ревью/);
  assert.deepEqual(
    m.reply_markup.inline_keyboard[0].map(b => b.callback_data),
    ['merge:7', 'skip:7']
  );
});

test('GitHub events: opened → message, merged → info, draft/other repo ignored', async () => {
  const { fn, calls } = fake({});
  assert.equal(
    (
      await handleGithubEvent(
        'pull_request',
        { action: 'opened', pull_request: pr },
        { env, fetcher: fn }
      )
    ).status,
    'sent'
  );
  assert.equal(calls[0].body.chat_id, '42');
  assert.ok(calls[0].body.reply_markup);
  const merged = { ...pr, merged: true };
  assert.equal(
    (
      await handleGithubEvent(
        'pull_request',
        { action: 'closed', pull_request: merged },
        { env, fetcher: fn }
      )
    ).status,
    'sent'
  );
  assert.equal(
    (
      await handleGithubEvent(
        'pull_request',
        { action: 'opened', pull_request: { ...pr, draft: true } },
        { env, fetcher: fn }
      )
    ).status,
    'ignored'
  );
  const foreign = { ...pr, base: { repo: { full_name: 'x/y' } } };
  assert.equal(
    (
      await handleGithubEvent(
        'pull_request',
        { action: 'opened', pull_request: foreign },
        { env, fetcher: fn }
      )
    ).status,
    'ignored'
  );
  assert.equal((await handleGithubEvent('pull_request', {}, { env: {} })).status, 'unconfigured');
});

test('checks state', () => {
  assert.equal(checksState([]), 'pending');
  assert.equal(checksState([{ status: 'in_progress' }]), 'pending');
  assert.equal(
    checksState([
      { status: 'completed', conclusion: 'success' },
      { status: 'completed', conclusion: 'skipped' }
    ]),
    'success'
  );
  assert.equal(checksState([{ status: 'completed', conclusion: 'failure' }]), 'failure');
});

test('merge only with green CI', async () => {
  const open = { state: 'open', merged: false, mergeable: true, title: 'T', head: { sha: 'abc' } };
  let f = fake({
    '/pulls/7/merge': { merged: true },
    '/pulls/7': open,
    '/check-runs': { check_runs: [{ status: 'completed', conclusion: 'success' }] }
  });
  assert.match(await mergePr(7, { env, fetcher: f.fn }), /смёржен/);
  const put = f.calls.find(c => c.method === 'PUT');
  assert.equal(put.body.merge_method, 'merge');
  assert.equal(put.body.sha, 'abc');

  f = fake({ '/pulls/7': open, '/check-runs': { check_runs: [{ status: 'queued' }] } });
  assert.match(await mergePr(7, { env, fetcher: f.fn }), /CI ещё идёт/);
  assert.ok(!f.calls.some(c => c.method === 'PUT'));

  f = fake({
    '/pulls/7': open,
    '/check-runs': { check_runs: [{ status: 'completed', conclusion: 'failure' }] }
  });
  assert.match(await mergePr(7, { env, fetcher: f.fn }), /CI упал/);

  f = fake({ '/pulls/7': { ...open, mergeable: false } });
  assert.match(await mergePr(7, { env, fetcher: f.fn }), /конфликт/);

  assert.match(await mergePr(7, { env: { ...env, GITHUB_TOKEN: '' } }), /GITHUB_TOKEN/);
});

test('Telegram: only owner chat; button and «давай» reply merge', async () => {
  const open = { state: 'open', merged: false, mergeable: true, title: 'T', head: { sha: 'abc' } };
  const routes = {
    '/pulls/7/merge': { merged: true },
    '/pulls/7': open,
    '/check-runs': { check_runs: [{ status: 'completed', conclusion: 'success' }] }
  };

  let f = fake(routes);
  const stranger = { callback_query: { id: 'c', data: 'merge:7', message: { chat: { id: 1 } } } };
  assert.equal((await handleTelegramUpdate(stranger, { env, fetcher: f.fn })).status, 'ignored');
  assert.equal(f.calls.length, 0);

  f = fake(routes);
  const click = {
    callback_query: { id: 'c', data: 'merge:7', message: { chat: { id: 42 }, message_id: 5 } }
  };
  assert.equal((await handleTelegramUpdate(click, { env, fetcher: f.fn })).status, 'merge');
  assert.ok(f.calls.some(c => c.method === 'PUT'));

  f = fake(routes);
  const reply = {
    message: {
      message_id: 9,
      chat: { id: 42 },
      text: 'давай',
      reply_to_message: { text: 'PR #7: Fix' }
    }
  };
  assert.equal((await handleTelegramUpdate(reply, { env, fetcher: f.fn })).status, 'merge');
  assert.ok(f.calls.some(c => c.method === 'PUT'));

  f = fake(routes);
  const noReply = { message: { message_id: 9, chat: { id: 42 }, text: 'Давай' } };
  assert.equal((await handleTelegramUpdate(noReply, { env, fetcher: f.fn })).status, 'hint');
  assert.ok(!f.calls.some(c => c.method === 'PUT'));

  f = fake(routes);
  const chatter = {
    message: {
      message_id: 9,
      chat: { id: 42 },
      text: 'привет',
      reply_to_message: { text: 'PR #7' }
    }
  };
  assert.equal((await handleTelegramUpdate(chatter, { env, fetcher: f.fn })).status, 'ignored');

  f = fake(routes);
  const skip = { callback_query: { id: 'c', data: 'skip:7', message: { chat: { id: 42 } } } };
  assert.equal((await handleTelegramUpdate(skip, { env, fetcher: f.fn })).status, 'skip');
  assert.ok(!f.calls.some(c => c.method === 'PUT'));
});
