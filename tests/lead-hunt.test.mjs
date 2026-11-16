import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore } from '../server/lib/store.mjs';
import { teamConfig } from '../server/lib/team-chat.mjs';
import {
  SEGMENTS,
  auditSite,
  draftPrompt,
  fetchSite,
  huntConfig,
  huntTick,
  markSent,
  privateAddress,
  queryAt,
  searchPlaces,
  setProspectStatus
} from '../server/lib/lead-hunt.mjs';

const dir = mkdtempSync(join(tmpdir(), 'hunt-'));
const store = openStore(join(dir, 'db.sqlite'));
test.after(() => {
  store.close();
  rmSync(dir, { recursive: true, force: true });
});
const cfg = huntConfig({
  GOOGLE_PLACES_API_KEY: 'AIza-test-key-0123456789',
  LEAD_HUNT_ENABLED: 'true',
  LEAD_HUNT_DAILY: '5'
});
const teamCfg = teamConfig({
  OPENROUTER_API_KEY: 'sk-or-test-0123456789abcdef',
  TEAM_CHAT_ID: '-100',
  TEAM_OWNER_ID: '7',
  TEAM_WEBHOOK_SECRET: 's',
  TEAM_BOT_PM: 'tok-pm-0123456789abcdef'
});
const res = (body, status = 200, headers = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers(headers),
  json: async () => body,
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body))
});
const publicDns = async () => [{ address: '93.184.216.34' }];

test('настройки: ключ-заглушка не считается ключом, лимит в пределах', () => {
  assert.equal(huntConfig({ GOOGLE_PLACES_API_KEY: '…' }).placesKey, '');
  assert.equal(huntConfig({ LEAD_HUNT_DAILY: '500' }).daily, 10);
  assert.equal(cfg.daily, 5);
});

test('запросы идут по кругу: сегмент × район', () => {
  assert.equal(queryAt(0).text, 'стоматология Юнусабад Ташкент');
  assert.equal(queryAt(1).segment, 'clinic');
  assert.match(queryAt(SEGMENTS.length).text, /^стоматология Чиланзар/);
});

test('частные адреса блокируются (SSRF)', () => {
  for (const ip of [
    '127.0.0.1',
    '10.1.2.3',
    '192.168.0.1',
    '172.20.0.1',
    '169.254.169.254',
    '100.64.0.1',
    '::1',
    'fd00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
    '0.0.0.0'
  ])
    assert.equal(privateAddress(ip), true, ip);
  for (const ip of ['93.184.216.34', '8.8.8.8', '2606:4700::1'])
    assert.equal(privateAddress(ip), false, ip);
});

test('загрузка сайта: не ходит во внутреннюю сеть даже через редирект', async () => {
  const urls = [];
  const fetcher = async url => {
    urls.push(url);
    return res('', 302, { location: 'http://127.0.0.1/admin' });
  };
  const r = await fetchSite('https://example.uz', { fetcher, lookup: publicDns });
  assert.equal(r.ok, false);
  assert.deepEqual(urls, ['https://example.uz/']);
  assert.equal((await fetchSite('file:///etc/passwd', { fetcher, lookup: publicDns })).ok, false);
  assert.equal(
    (
      await fetchSite('https://intra.local', {
        fetcher,
        lookup: async () => [{ address: '10.0.0.5' }]
      })
    ).ok,
    false
  );
});

test('аудит сайта находит проблемы', () => {
  const now = new Date('2026-11-16T00:00:00Z');
  assert.equal(auditSite(null).score, 90);
  const old = auditSite(
    { ok: true, url: 'http://old.uz/', html: '<title>Клиника</title><p>© 2019 Клиника</p>' },
    now
  );
  assert.ok(old.issues.includes('Нет мобильной версии'));
  assert.ok(old.issues.some(i => i.includes('HTTPS')));
  assert.ok(old.issues.includes('Сайт не обновлялся с 2019 года'));
  assert.equal(old.score, 70);
  const good = auditSite(
    {
      ok: true,
      url: 'https://good.uz/',
      html: '<meta name="viewport"><form></form><a href="https://t.me/good_clinic">tg</a> © 2026'
    },
    now
  );
  assert.deepEqual(good.issues, []);
  assert.equal(good.telegram, 'https://t.me/good_clinic');
  assert.ok(good.score < 30);
});

test('поиск Google Places: запрос и разбор', async () => {
  let req;
  const places = await searchPlaces(
    cfg,
    { segment: 'dental', text: 'стоматология Юнусабад Ташкент' },
    async (url, init) => {
      req = { url, init };
      return res({
        places: [
          {
            id: 'A',
            displayName: { text: 'Dent' },
            websiteUri: 'https://dent.uz',
            internationalPhoneNumber: '+998 90 000 00 00',
            rating: 4.5,
            userRatingCount: 20
          },
          { id: 'B', displayName: { text: 'Closed' }, businessStatus: 'CLOSED_PERMANENTLY' }
        ]
      });
    }
  );
  assert.equal(req.url, 'https://places.googleapis.com/v1/places:searchText');
  assert.equal(req.init.headers['X-Goog-Api-Key'], cfg.placesKey);
  assert.match(req.init.headers['X-Goog-FieldMask'], /places\.websiteUri/);
  assert.equal(JSON.parse(req.init.body).regionCode, 'UZ');
  assert.deepEqual(
    places.map(p => p.id),
    ['g:A']
  );
  await assert.rejects(searchPlaces({ placesKey: '' }, {}), /GOOGLE_PLACES_API_KEY/);
});

test('черновик: факты из аудита, правила бренда, подпись', () => {
  const p = { name: 'Dent', segment: 'dental', audit: { issues: ['Нет сайта'] }, history: [] };
  const ru = draftPrompt(p, 1);
  assert.match(ru, /Нет сайта/);
  assert.match(ru, /от 2,5 млн сум/);
  assert.match(ru, /Шохрух Бурхонов/);
  assert.match(draftPrompt(p, 2, 'uz'), /латиница.*so‘mdan/);
});

test('полный цикл: поиск → аудит → черновик → отправил → касание 2 → закрытие', async () => {
  const sent = [];
  const fetcher = async (url, init) => {
    if (url.startsWith('https://places.googleapis.com'))
      return res({
        places: [
          {
            id: 'P1',
            displayName: { text: 'Без сайта' },
            internationalPhoneNumber: '+998901112233'
          },
          { id: 'P2', displayName: { text: 'Хороший сайт' }, websiteUri: 'https://good.uz' }
        ]
      });
    if (url.startsWith('https://good.uz'))
      return res('<meta name="viewport"><form></form><a href="https://t.me/goodsite">tg</a>');
    if (url.startsWith('https://api.telegram.org')) {
      sent.push(JSON.parse(init.body).text);
      return res({ ok: true });
    }
    return res({}, 404);
  };
  const prompts = [];
  const llm = {
    chat: async (system, user) => {
      prompts.push(system);
      return {
        text: `Здравствуйте! Текст ${prompts.length}`,
        usage: { input: 10, output: 5, cached: 0 }
      };
    }
  };
  const now = new Date('2026-11-16T06:00:00Z');
  const r = await huntTick({ store, cfg, teamCfg, llm, fetcher, lookup: publicDns, now });
  assert.equal(r.found, 2);
  assert.equal(r.drafted, 1);
  assert.equal(r.skipped, 1);
  assert.match(prompts[0], /Тебя зовут Нигора/);
  assert.match(sent[0], /Жасур.*1 сообщение ждёт/);
  assert.equal(store.huntGet('query_index'), '1');

  // Второй проход в тот же день не ищет повторно.
  assert.equal(
    (await huntTick({ store, cfg, teamCfg, llm, fetcher, lookup: publicDns, now })).found,
    0
  );

  const [p] = store.prospects(['ready']);
  assert.equal(p.id, 'g:P1');
  markSent(store, p.id, 'Отправленный текст', now);
  assert.throws(() => markSent(store, p.id, '', now), /уже обработано/);
  const s = store.prospect(p.id);
  assert.equal(s.status, 'sent');
  assert.equal(s.nextTouchAt, '2026-11-19T06:00:00.000Z');

  const later = new Date('2026-11-19T07:00:00Z');
  const r2 = await huntTick({
    store,
    cfg: { ...cfg, enabled: false },
    teamCfg,
    llm,
    fetcher,
    lookup: publicDns,
    now: later
  });
  assert.equal(r2.followups, 1);
  assert.match(prompts.at(-1), /Тебя зовут Жасур/);
  const p2 = store.prospect(p.id);
  assert.equal(p2.touch, 2);
  assert.equal(p2.status, 'ready');

  setProspectStatus(store, p.id, 'replied');
  assert.equal(store.prospect(p.id).status, 'replied');
  assert.throws(() => setProspectStatus(store, p.id, 'sent'), /Неверный статус/);
  assert.deepEqual(
    store.prospect(p.id).history.map(h => h.kind),
    ['audit', 'draft', 'sent', 'draft', 'status']
  );
});

test('после 4 касаний без ответа — отказ', async () => {
  store.prospectAdd({ id: 'm:x', name: 'Тихая компания', segment: 'auto' });
  store.prospectUpdate('m:x', { status: 'sent', touch: 4, nextTouchAt: '2026-01-01T00:00:00Z' });
  const r = await huntTick({
    store,
    cfg: { ...cfg, placesKey: '' },
    teamCfg: null,
    llm: null,
    now: new Date('2026-02-01T00:00:00Z')
  });
  assert.equal(r.lost, 1);
  assert.equal(store.prospect('m:x').status, 'lost');
});
