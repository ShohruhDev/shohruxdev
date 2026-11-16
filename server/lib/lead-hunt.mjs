// Поиск клиентов (вкладка «Клиенты» в /office).
// Жасур (продажи) находит компании через Google Places API, Дильноза (бизнес-аналитик) проверяет
// их сайт, Нигора (копирайтер) пишет первое сообщение, Жасур — повторные касания (до 4).
// Ничего не отправляется автоматически: владелец одобряет и отправляет сам (WhatsApp, Telegram,
// звонок). Холодные массовые рассылки — риск блокировок и ЗРУ-547, поэтому только вручную.
import { lookup as dnsLookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { randomUUID } from 'node:crypto';
import { personById } from '../../shared/team-people.mjs';
import { tgSend } from './team-chat.mjs';

const real = v => (String(v || '').trim().length >= 20 ? String(v).trim() : '');

export function huntConfig(env = process.env) {
  const daily = Number(env.LEAD_HUNT_DAILY || 10);
  return {
    placesKey: real(env.GOOGLE_PLACES_API_KEY),
    enabled: env.LEAD_HUNT_ENABLED === 'true',
    daily: Number.isInteger(daily) && daily > 0 && daily <= 20 ? daily : 10,
    // 05:00 UTC = 10:00 Ташкент.
    hourUtc: 5
  };
}

// Сегменты: кому и что предлагаем. offer — подсказка для текста (по прайсу).
export const SEGMENTS = [
  { id: 'dental', query: 'стоматология', offer: 'сайт с онлайн-записью или Telegram-бот записи' },
  { id: 'clinic', query: 'медицинский центр', offer: 'сайт клиники с записью к врачу' },
  { id: 'barber', query: 'барбершоп', offer: 'Telegram-бот или Mini App для онлайн-записи' },
  { id: 'beauty', query: 'салон красоты', offer: 'онлайн-запись через Telegram-бот или сайт' },
  { id: 'edu', query: 'учебный центр', offer: 'сайт с заявкой на курс и Telegram-бот' },
  { id: 'auto', query: 'автосервис', offer: 'сайт с записью на ремонт' },
  { id: 'fitness', query: 'фитнес клуб', offer: 'сайт и Mini App для абонементов и записи' },
  { id: 'furniture', query: 'мебель на заказ', offer: 'сайт-каталог с заявкой на расчёт' },
  { id: 'build', query: 'строительная компания', offer: 'корпоративный сайт с проектами' },
  { id: 'wholesale', query: 'оптовая компания', offer: 'каталог для дилеров или интеграция с 1С' },
  { id: 'travel', query: 'туристическое агентство', offer: 'сайт с турами и заявкой' },
  { id: 'restaurant', query: 'ресторан', offer: 'меню и заказ через Telegram Mini App' }
];
export const DISTRICTS = [
  'Юнусабад',
  'Чиланзар',
  'Мирзо-Улугбек',
  'Яккасарай',
  'Мирабад',
  'Шайхантахур',
  'Яшнабад',
  'Алмазар',
  'Сергели',
  'Учтепа'
];
export const segmentById = id => SEGMENTS.find(s => s.id === id);

/** Следующий запрос по кругу: сегмент × район. */
export function queryAt(i) {
  const s = SEGMENTS[i % SEGMENTS.length];
  const d = DISTRICTS[Math.floor(i / SEGMENTS.length) % DISTRICTS.length];
  return { segment: s.id, text: `${s.query} ${d} Ташкент` };
}

// Интервал до следующего касания (дни) после касания N.
const NEXT_TOUCH_DAYS = { 1: 3, 2: 4, 3: 7 };
export const MAX_TOUCHES = 4;

export function leadHuntStore(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS prospects(id TEXT PRIMARY KEY, created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL, source TEXT NOT NULL, segment TEXT NOT NULL, name TEXT NOT NULL,
      address TEXT, phone TEXT, website TEXT, maps_url TEXT, rating REAL, reviews INTEGER,
      audit TEXT, score INTEGER, status TEXT NOT NULL, touch INTEGER NOT NULL DEFAULT 0,
      next_touch_at TEXT, draft TEXT, history TEXT NOT NULL DEFAULT '[]', note TEXT);
    CREATE INDEX IF NOT EXISTS prospects_status ON prospects(status, updated_at);
    CREATE TABLE IF NOT EXISTS hunt_state(key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
  const row = r =>
    r && {
      id: r.id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      source: r.source,
      segment: r.segment,
      name: r.name,
      address: r.address || '',
      phone: r.phone || '',
      website: r.website || '',
      mapsUrl: r.maps_url || '',
      rating: r.rating,
      reviews: r.reviews,
      audit: r.audit ? JSON.parse(r.audit) : null,
      score: r.score,
      status: r.status,
      touch: r.touch,
      nextTouchAt: r.next_touch_at,
      draft: r.draft || '',
      history: JSON.parse(r.history || '[]'),
      note: r.note || ''
    };
  const COLS = {
    status: 'status',
    touch: 'touch',
    nextTouchAt: 'next_touch_at',
    draft: 'draft',
    note: 'note',
    score: 'score',
    audit: 'audit',
    history: 'history',
    website: 'website'
  };
  return {
    /** Добавляет компанию, если её ещё нет. Возвращает true для новой. */
    prospectAdd(p) {
      const now = new Date().toISOString();
      return (
        db
          .prepare(
            `INSERT OR IGNORE INTO prospects(id,created_at,updated_at,source,segment,name,address,phone,
              website,maps_url,rating,reviews,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,'new')`
          )
          .run(
            p.id || 'm:' + randomUUID(),
            now,
            now,
            p.source || 'manual',
            p.segment || 'other',
            String(p.name).slice(0, 200),
            p.address || null,
            p.phone || null,
            p.website || null,
            p.mapsUrl || null,
            p.rating ?? null,
            p.reviews ?? null
          ).changes === 1
      );
    },
    prospect(id) {
      return row(db.prepare('SELECT * FROM prospects WHERE id=?').get(id));
    },
    prospects(statuses) {
      const list = statuses?.length
        ? db
            .prepare(
              `SELECT * FROM prospects WHERE status IN (${statuses.map(() => '?').join(',')}) ORDER BY updated_at DESC LIMIT 200`
            )
            .all(...statuses)
        : db.prepare('SELECT * FROM prospects ORDER BY updated_at DESC LIMIT 200').all();
      return list.map(row);
    },
    prospectCounts() {
      return Object.fromEntries(
        db
          .prepare('SELECT status, COUNT(*) n FROM prospects GROUP BY status')
          .all()
          .map(r => [r.status, r.n])
      );
    },
    prospectDue(nowIso) {
      return db
        .prepare(
          "SELECT * FROM prospects WHERE status='sent' AND next_touch_at<=? ORDER BY next_touch_at LIMIT 20"
        )
        .all(nowIso)
        .map(row);
    },
    prospectUpdate(id, fields, event) {
      const p = this.prospect(id);
      if (!p) throw Error('Компания не найдена.');
      const sets = [],
        vals = [];
      for (const [k, v] of Object.entries(fields)) {
        if (!COLS[k]) continue;
        sets.push(`${COLS[k]}=?`);
        vals.push(k === 'audit' || k === 'history' ? JSON.stringify(v) : v);
      }
      if (event) {
        sets.push('history=?');
        vals.push(
          JSON.stringify([...p.history, { at: new Date().toISOString(), ...event }].slice(-30))
        );
      }
      sets.push('updated_at=?');
      vals.push(new Date().toISOString());
      db.prepare(`UPDATE prospects SET ${sets.join(',')} WHERE id=?`).run(...vals, id);
      return this.prospect(id);
    },
    /** Удаляет отклонённые и пропущенные старше N дней (минимизация данных). */
    prospectPurge(beforeIso) {
      return db
        .prepare("DELETE FROM prospects WHERE status IN ('lost','skipped') AND updated_at<?")
        .run(beforeIso).changes;
    },
    huntGet(key, fallback = '') {
      return db.prepare('SELECT value FROM hunt_state WHERE key=?').get(key)?.value ?? fallback;
    },
    huntSet(key, value) {
      db.prepare(
        'INSERT INTO hunt_state VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'
      ).run(key, String(value));
    }
  };
}

// ---------- Поиск: Google Places API (New), Text Search ----------

const FIELDS = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.websiteUri',
  'places.internationalPhoneNumber',
  'places.googleMapsUri',
  'places.rating',
  'places.userRatingCount',
  'places.businessStatus'
].join(',');

export async function searchPlaces(cfg, query, fetcher = fetch) {
  if (!cfg.placesKey) throw Error('Не задан GOOGLE_PLACES_API_KEY — поиск по картам выключен.');
  const r = await fetcher('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': cfg.placesKey,
      'X-Goog-FieldMask': FIELDS
    },
    body: JSON.stringify({
      textQuery: query.text,
      languageCode: 'ru',
      regionCode: 'UZ',
      pageSize: 20,
      locationBias: {
        circle: { center: { latitude: 41.3111, longitude: 69.2797 }, radius: 25000 }
      }
    }),
    signal: AbortSignal.timeout(15000)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(`Google Places HTTP ${r.status}: ${data?.error?.message || ''}`.trim());
  return (data.places || [])
    .filter(p => !p.businessStatus || p.businessStatus === 'OPERATIONAL')
    .map(p => ({
      id: 'g:' + p.id,
      source: 'google',
      segment: query.segment,
      name: p.displayName?.text || 'Без названия',
      address: p.formattedAddress || '',
      phone: p.internationalPhoneNumber || '',
      website: p.websiteUri || '',
      mapsUrl: p.googleMapsUri || '',
      rating: p.rating ?? null,
      reviews: p.userRatingCount ?? null
    }));
}

// ---------- Проверка сайта ----------

/** true для частных, служебных и локальных адресов (защита от SSRF). */
export function privateAddress(ip) {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return privateAddress(v.slice(7));
  return v === '::' || v === '::1' || /^f[cd]/.test(v) || /^fe[89ab]/.test(v);
}

async function safeUrl(raw, lookup) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) return null;
  if (u.port && !['80', '443'].includes(u.port)) return null;
  const host = u.hostname.replace(/^\[|\]$/g, '');
  const addrs = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true }).catch(() => []);
  if (!addrs.length || addrs.some(a => privateAddress(a.address))) return null;
  return u;
}

/** Загружает главную страницу (до 3 редиректов, 8 с, 600 КБ). */
export async function fetchSite(raw, { fetcher = fetch, lookup = dnsLookup } = {}) {
  let url = raw;
  for (let hop = 0; hop < 4; hop++) {
    const u = await safeUrl(url, lookup);
    if (!u) return { ok: false, error: 'адрес недоступен' };
    let r;
    try {
      r = await fetcher(u.href, {
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RazrabotkaTashkentAudit/1.0)' },
        signal: AbortSignal.timeout(8000)
      });
    } catch {
      return { ok: false, error: 'сайт не открывается', url: u.href };
    }
    if (r.status >= 300 && r.status < 400 && r.headers.get('location')) {
      url = new URL(r.headers.get('location'), u).href;
      continue;
    }
    if (!r.ok) return { ok: false, error: `сайт отвечает ошибкой ${r.status}`, url: u.href };
    const html = (await r.text()).slice(0, 600_000);
    return { ok: true, url: u.href, html };
  }
  return { ok: false, error: 'слишком много перенаправлений' };
}

const SOCIAL_ONLY =
  /(^|\.)(instagram\.com|facebook\.com|t\.me|telegram\.me|taplink\.cc|linktr\.ee)$/i;

const uniq = (list, max = 3) => [...new Set(list)].slice(0, max);
const TG_SKIP = /^(share|joinchat|addstickers|proxy|s|iv|c)$/i;
const IG_SKIP = /^(p|reel|reels|explore|stories|accounts|tv)$/i;

/** Контакты со страницы: Telegram, почта, Instagram, Facebook, телефоны. */
export function extractContacts(html = '', pageUrl = '') {
  const src = `${pageUrl} ${html}`;
  const telegram = uniq(
    [...src.matchAll(/(?:https?:\/\/)?(?:t\.me|telegram\.me)\/([A-Za-z][A-Za-z0-9_]{3,31})\b/gi)]
      .map(m => m[1])
      .filter(u => !TG_SKIP.test(u))
      .map(u => `https://t.me/${u}`)
  );
  const email = uniq(
    [...src.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}/gi)]
      .map(m => m[0].toLowerCase())
      .filter(e => !/\.(png|jpe?g|svg|webp|gif)$/.test(e))
      .filter(e => !/(example\.|sentry|wixpress|domain\.com|email\.com)/.test(e))
  );
  const instagram = uniq(
    [...src.matchAll(/instagram\.com\/([A-Za-z0-9_.]{2,30})/gi)]
      .map(m => m[1].replace(/\.$/, ''))
      .filter(u => !IG_SKIP.test(u))
      .map(u => `https://instagram.com/${u}`)
  );
  const facebook = uniq(
    [...src.matchAll(/facebook\.com\/([A-Za-z0-9_.-]{3,60})/gi)]
      .map(m => m[1])
      .filter(u => !/^(sharer|share|tr|plugins|dialog)/i.test(u))
      .map(u => `https://facebook.com/${u}`)
  );
  const phones = uniq(
    [...html.matchAll(/href=["']tel:([+\d\s()-]{9,20})/gi)].map(m => m[1].replace(/[^\d+]/g, ''))
  );
  return { telegram, email, instagram, facebook, phones };
}

/** Ссылка на чат Telegram по номеру (работает, если человек разрешил находить себя по номеру). */
export function telegramByPhone(phone = '') {
  const d = String(phone).replace(/\D/g, '');
  const full = d.length === 9 ? '998' + d : d;
  return /^998\d{9}$/.test(full) ? `https://t.me/+${full}` : '';
}

/** Что не так с сайтом. Чем выше score, тем полезнее наше предложение. */
export function auditSite(site, now = new Date()) {
  if (!site) return { issues: ['Нет сайта'], score: 90, kind: 'none' };
  if (site.socialOnly)
    return {
      issues: ['Вместо сайта — только соцсеть или Taplink'],
      score: 80,
      kind: 'social',
      url: site.url,
      contacts: extractContacts(site.html || '', site.url)
    };
  if (!site.ok)
    return {
      issues: [`Сайт: ${site.error}`],
      score: 75,
      kind: 'broken',
      url: site.url,
      contacts: extractContacts('', '')
    };
  const html = site.html;
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ');
  const issues = [];
  let score = 10;
  const viewport = /<meta[^>]+name=["']?viewport/i.test(html);
  if (!viewport) {
    issues.push('Нет мобильной версии');
    score = Math.max(score, 70);
  }
  if (site.url.startsWith('http:')) {
    issues.push('Нет HTTPS — браузер пишет «Не защищено»');
    score = Math.max(score, 60);
  }
  const years = [...text.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–—]\s*)?(20\d{2})/gi)].map(
    m => Number(m[1])
  );
  const year = years.length ? Math.max(...years) : null;
  if (year && year <= now.getUTCFullYear() - 3) {
    issues.push(`Сайт не обновлялся с ${year} года`);
    score = Math.max(score, 50);
  }
  const contacts = extractContacts(html);
  const telegram = contacts.telegram[0] || '';
  const form = /<form[\s>]/i.test(html) || /запис|booking|bron|yozil/i.test(text);
  if (!form) {
    issues.push('Нет онлайн-записи или формы заявки');
    score = Math.max(score, 40);
  }
  if (!telegram) {
    issues.push('Нет Telegram для связи');
    score = Math.max(score, 30);
  }
  const title = (html.match(/<title[^>]*>([^<]{0,120})/i) || [])[1]?.trim() || '';
  return { issues, score, kind: 'site', url: site.url, title, year, viewport, telegram, contacts };
}

export async function auditProspect(p, deps = {}) {
  if (!p.website) return auditSite(null);
  let host = '';
  try {
    host = new URL(p.website).hostname;
  } catch {
    return auditSite(null);
  }
  if (SOCIAL_ONLY.test(host)) {
    // Taplink и Linktree — страницы со ссылками: оттуда берём Telegram, почту, Instagram.
    const page = /taplink\.cc|linktr\.ee/i.test(host) ? await fetchSite(p.website, deps) : null;
    return auditSite({ socialOnly: true, url: p.website, html: page?.ok ? page.html : '' });
  }
  return auditSite(await fetchSite(p.website, deps), deps.now);
}

// ---------- Тексты ----------

const STAGE = {
  1: 'Первое сообщение: одно конкретное наблюдение о компании, одно предложение, мягкий вопрос в конце.',
  2: 'Второе касание через несколько дней: коротко напомни, добавь пользу (пример из кейса или цифру из прайса), без давления.',
  3: 'Третье касание: предложи бесплатный разбор их сайта или идею за 15 минут созвона.',
  4: 'Последнее касание: вежливо закрой разговор, оставь контакт, без давления.'
};

export function draftPrompt(p, touch, lang = 'ru') {
  const seg = segmentById(p.segment);
  const prev = p.history
    .filter(h => h.kind === 'sent')
    .map(h => `Касание ${h.touch}: ${h.text}`)
    .join('\n');
  return `Напиши сообщение компании от Razrabotka Tashkent для отправки в Telegram или на почту.

Компания: ${p.name}${p.address ? `, ${p.address}` : ''}
Отрасль: ${seg?.query || 'другое'}
${p.rating ? `Рейтинг на Google Картах: ${p.rating} (${p.reviews || 0} отзывов)\n` : ''}Что нашла Дильноза: ${(p.audit?.issues || []).join('; ') || 'нет данных'}
Что можем предложить: ${seg?.offer || 'сайт или Telegram-бот'}
${prev ? `Уже отправлено:\n${prev}\n` : ''}
Задача: касание ${touch} из ${MAX_TOUCHES}. ${STAGE[touch]}

Правила (BRAND.md): ${lang === 'uz' ? 'на узбекском, только латиница, o‘ и g‘ с апострофом ‘ (U+2018), цены в формате «2.5 mln so‘mdan»' : 'на русском, цены в формате «от 2,5 млн сум»'}; 300–550 знаков; прямо, коротко, фактами, на «вы»; в конце — один следующий шаг (вопрос или предложение созвониться); без markdown и эмодзи; без слов «топ», «№1», «лучшие», «гарантируем», «за три дня», без скидок и выдуманных цифр; цены только из прайса; не выдумывай факты о компании и не обещай результат; не называй клиентов, кроме разрешённых кейсов. Подпись: ${lang === 'uz' ? '«Shohrux Burxonov, Razrabotka Tashkent — razrabotkatashkent.uz»' : '«Шохрух Бурхонов, Razrabotka Tashkent — razrabotkatashkent.uz»'}. Верни только текст сообщения.`;
}

const personaSystem = id => {
  const p = personById(id);
  return `Тебя зовут ${p.persona}, ты — ${p.title} в Razrabotka Tashkent. ${p.prompt}`;
};

export async function draftMessage(llm, p, touch, lang = 'ru') {
  const author = touch === 1 ? 'copywriter' : 'sales';
  const r = await llm.chat(personaSystem(author), draftPrompt(p, touch, lang));
  const text = String(r.text || '')
    .replace(/^["«]|["»]$/g, '')
    .trim()
    .slice(0, 1200);
  if (!text) throw Error('Модель не вернула текст.');
  return { text, author, usage: r.usage };
}

// ---------- Цикл ----------

const day = d => d.toISOString().slice(0, 10);

/**
 * Один проход: (раз в день) найти компании → проверить сайты → написать черновики →
 * подготовить повторные касания. deps: { store, cfg, teamCfg, llm, fetcher, lookup, now, force, query }
 */
export async function huntTick(deps) {
  const { store, cfg, teamCfg, llm, fetcher = fetch, lookup = dnsLookup, now = new Date() } = deps;
  const out = { found: 0, audited: 0, drafted: 0, followups: 0, lost: 0, skipped: 0, errors: [] };
  const count = u =>
    u &&
    store.teamCount(day(now), { calls: 1, input: u.input, output: u.output, cached: u.cached });

  // 1. Поиск — раз в день после 10:00 Ташкента или по кнопке.
  const due = store.huntGet('last_search') !== day(now) && now.getUTCHours() >= cfg.hourUtc;
  if (cfg.placesKey && (deps.force || (cfg.enabled && due))) {
    const i = Number(store.huntGet('query_index', '0'));
    const q = deps.query?.text ? deps.query : queryAt(i);
    try {
      const places = await searchPlaces(cfg, q, fetcher);
      for (const p of places) {
        if (out.found >= cfg.daily) break;
        if (store.prospectAdd(p)) out.found++;
      }
      if (!deps.query?.text) store.huntSet('query_index', i + 1);
      store.huntSet('last_search', day(now));
      store.huntSet('last_query', q.text);
    } catch (e) {
      out.errors.push(e instanceof Error ? e.message : 'поиск не удался');
    }
  }

  // 2. Проверка сайтов и первые сообщения.
  for (const p of store.prospects(['new']).slice(0, cfg.daily)) {
    try {
      const audit = await auditProspect(p, { fetcher, lookup, now });
      out.audited++;
      if (audit.score < 30) {
        store.prospectUpdate(
          p.id,
          {
            status: 'skipped',
            audit,
            score: audit.score,
            note: 'Сайт в порядке — предложить нечего'
          },
          { kind: 'audit', who: 'business-analyst', text: 'Сайт в порядке, пропускаем.' }
        );
        out.skipped++;
        continue;
      }
      store.prospectUpdate(
        p.id,
        { audit, score: audit.score },
        { kind: 'audit', who: 'business-analyst', text: audit.issues.join('; ') }
      );
      if (!llm) continue;
      const d = await draftMessage(llm, { ...p, audit }, 1);
      count(d.usage);
      store.prospectUpdate(
        p.id,
        { status: 'ready', touch: 1, draft: d.text },
        { kind: 'draft', who: d.author, touch: 1 }
      );
      out.drafted++;
    } catch (e) {
      out.errors.push(`${p.name}: ${e instanceof Error ? e.message : 'ошибка'}`);
    }
  }

  // 2б. Контакты (Telegram, почта, Instagram) для компаний, проверенных до появления этой функции.
  for (const p of store
    .prospects(['ready', 'sent', 'replied', 'meeting'])
    .filter(p => p.website && p.audit && !p.audit.contacts)
    .slice(0, 10)) {
    try {
      const fresh = await auditProspect(p, { fetcher, lookup, now });
      store.prospectUpdate(p.id, {
        audit: {
          ...p.audit,
          contacts: fresh.contacts || {
            telegram: [],
            email: [],
            instagram: [],
            facebook: [],
            phones: []
          }
        }
      });
    } catch {
      /* попробуем в следующий раз */
    }
  }

  // 3. Повторные касания.
  for (const p of store.prospectDue(now.toISOString())) {
    try {
      if (p.touch >= MAX_TOUCHES) {
        store.prospectUpdate(
          p.id,
          { status: 'lost', note: `Нет ответа после ${MAX_TOUCHES} касаний` },
          { kind: 'lost', who: 'sales', text: 'Нет ответа — закрываем.' }
        );
        out.lost++;
        continue;
      }
      if (!llm) continue;
      const d = await draftMessage(llm, p, p.touch + 1);
      count(d.usage);
      store.prospectUpdate(
        p.id,
        { status: 'ready', touch: p.touch + 1, draft: d.text },
        { kind: 'draft', who: d.author, touch: p.touch + 1 }
      );
      out.followups++;
    } catch (e) {
      out.errors.push(`${p.name}: ${e instanceof Error ? e.message : 'ошибка'}`);
    }
  }

  store.prospectPurge(new Date(now.getTime() - 180 * 864e5).toISOString());

  // 4. Короткий отчёт в командный чат.
  const ready = out.drafted + out.followups;
  if (ready && teamCfg?.enabled) {
    const sales = personById('sales');
    const text = `${sales.persona} (продажи): ${out.found ? `нашёл ${out.found} компаний, ` : ''}${ready} ${ready === 1 ? 'сообщение ждёт' : 'сообщений ждут'} вашего одобрения в Офисе → вкладка «Клиенты».`;
    await tgSend(teamCfg.bots.pm, teamCfg.chatId, text, fetcher).catch(() => {});
    store.teamAdd('sales', text);
  }
  return out;
}

/** Владелец отправил сообщение: фиксируем касание и дату следующего. */
export function markSent(store, id, text, now = new Date()) {
  const p = store.prospect(id);
  if (!p || p.status !== 'ready') throw Error('Это сообщение уже обработано.');
  const days = NEXT_TOUCH_DAYS[p.touch];
  return store.prospectUpdate(
    id,
    {
      status: 'sent',
      draft: '',
      nextTouchAt: new Date(now.getTime() + (days ?? 7) * 864e5).toISOString()
    },
    { kind: 'sent', who: 'ceo', touch: p.touch, text: String(text || p.draft).slice(0, 1200) }
  );
}

export const PROSPECT_STATUSES = {
  new: 'Найдена',
  ready: 'На одобрение',
  sent: 'Ждём ответа',
  replied: 'Ответили',
  meeting: 'Созвон',
  won: 'Сделка',
  lost: 'Отказ',
  skipped: 'Пропущена'
};

/** Ручная смена статуса владельцем. */
export function setProspectStatus(store, id, status) {
  if (!['replied', 'meeting', 'won', 'lost', 'skipped'].includes(status))
    throw Error('Неверный статус.');
  return store.prospectUpdate(
    id,
    { status, nextTouchAt: null },
    { kind: 'status', who: 'ceo', text: PROSPECT_STATUSES[status] }
  );
}

// Один проход за раз: плагин по расписанию и кнопка «Найти сейчас» не должны пересекаться.
let busy = false;
export async function runExclusive(fn) {
  if (busy) throw Error('Команда уже ищет — подождите минуту.');
  busy = true;
  try {
    return await fn();
  } finally {
    busy = false;
  }
}
