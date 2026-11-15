import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore } from '../server/lib/store.mjs';
import { nicheTopics } from '../server/lib/topics.mjs';
const dir = mkdtempSync(join(tmpdir(), 'admin-http-')),
  file = join(dir, 'content.sqlite'),
  port = 3177,
  base = `http://127.0.0.1:${port}`;
const env = {
  ...process.env,
  CONTENT_DB: file,
  PORT: String(port),
  HOST: '127.0.0.1',
  ADMIN_PASSWORD: 'test-password-only-123456',
  ADMIN_SESSION_SECRET: 'test-session-secret-only-12345678901234567890',
  ADMIN_LOCAL_PREVIEW: 'false',
  CONTENT_AUTOMATION_ENABLED: 'false'
};
const child = spawn(process.execPath, ['.output/server/index.mjs'], {
  env,
  stdio: ['ignore', 'pipe', 'pipe']
});
let cookie = '';
const post = (path, body, origin = base) =>
  fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, Cookie: cookie },
    body: JSON.stringify(body)
  });
try {
  await new Promise((res, rej) => {
    const timer = setTimeout(() => rej(Error('Server start timeout')), 15000);
    child.stdout.on('data', b => {
      if (b.toString().includes('Listening')) {
        clearTimeout(timer);
        res();
      }
    });
    child.once('exit', c => {
      clearTimeout(timer);
      rej(Error(`Server exited ${c}`));
    });
  });
  assert.equal((await fetch(base + '/api/admin/state')).status, 401);
  assert.equal((await post('/api/admin/action', { action: 'seed' })).status, 401);
  assert.equal(
    (await post('/api/admin/session', { password: env.ADMIN_PASSWORD }, 'https://evil.example'))
      .status,
    403
  );
  assert.equal((await post('/api/admin/session', { local: true })).status, 401);
  const login = await post('/api/admin/session', { password: env.ADMIN_PASSWORD });
  assert.equal(login.status, 200);
  const cookies = login.headers.get('set-cookie');
  assert.match(cookies, /HttpOnly/i);
  assert.match(cookies, /Secure/i);
  cookie = cookies.split(';')[0];
  let state = await (
    await fetch(base + '/api/admin/state', { headers: { Cookie: cookie } })
  ).json();
  assert.equal(state.posts.length, 0);
  assert.equal(JSON.stringify(state).includes(env.ADMIN_SESSION_SECRET), false);
  assert.equal(
    (await post('/api/admin/action', { action: 'seed' }, 'https://evil.example')).status,
    403
  );
  assert.equal((await post('/api/admin/action', { action: 'seed' })).status, 200);
  assert.equal((await post('/api/admin/action', { action: 'seed' })).status, 200);
  state = await (await fetch(base + '/api/admin/state', { headers: { Cookie: cookie } })).json();
  assert.equal(state.topics.length, nicheTopics.length);
  const revision = async () => {
    const data = await (
      await fetch(base + '/api/admin/state', { headers: { Cookie: cookie } })
    ).json();
    return data.posts.find(p => p.slug === 'admin-test').revision;
  };
  const draft = {
    slug: 'admin-test',
    title: 'Проверка полного цикла статьи',
    description: 'Материал для теста',
    category: 'Планирование',
    service: 'websites',
    author: 'Шохрух Бурхонов',
    answer: 'Начните с задач заказчика и условий запуска. '.repeat(4),
    content: Array.from({ length: 4 }, (_, i) => ({
      heading: `Раздел ${i}`,
      body: 'Уточните сценарии клиента и проверяемые требования. '.repeat(25)
    })),
    faq: [
      { question: 'Первый вопрос?', answer: 'Первый ответ.' },
      { question: 'Второй вопрос?', answer: 'Второй ответ.' }
    ],
    sources: [
      {
        title: 'Google',
        url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide'
      }
    ]
  };
  assert.equal((await post('/api/admin/action', { action: 'create', post: draft })).status, 200);
  assert.equal((await fetch(base + '/journal/admin-test')).status, 404);
  assert.equal(
    (
      await post('/api/admin/action', {
        action: 'schedule',
        revision: await revision(),
        slug: draft.slug,
        time: '2099-01-01T09:00:00+05:00',
        checks: {}
      })
    ).status,
    400
  );
  assert.equal(
    (
      await post('/api/admin/action', {
        action: 'schedule',
        revision: await revision(),
        slug: draft.slug,
        time: '2099-01-01T09:00:00+05:00',
        checks: { facts: true, sources: true, originality: true }
      })
    ).status,
    200
  );
  assert.equal((await fetch(base + '/journal/admin-test')).status, 404);
  assert.equal(
    (
      await post('/api/admin/action', {
        action: 'save',
        revision: await revision(),
        post: { ...draft, title: 'Исправленная статья' }
      })
    ).status,
    200
  );
  const db = openStore(file);
  assert.equal(db.post(draft.slug).status, 'draft');
  db.schedulePost(draft.slug, '2020-01-01T09:00:00+05:00', {
    facts: true,
    sources: true,
    originality: true
  });
  db.close();
  const published = await post('/api/admin/action', { action: 'publish-due' });
  assert.equal((await published.json()).published, 1);
  const publicArticle = await (await fetch(base + '/journal/admin-test')).text();
  assert.match(publicArticle, /Шохрух Бурхонов/);
  assert.match(publicArticle, /КОРОТКИЙ ОТВЕТ/);
  assert.match(publicArticle, /Первый вопрос/);
  assert.match(publicArticle, /datePublished/);
  const lead = await post('/api/leads', {
    name: 'Тест канала',
    contact: 'qa@example.com',
    message: 'Тестовая заявка из поиска ИИ',
    service: 'web',
    budget: '',
    consent: true,
    attribution: {
      source: 'chatgpt.com',
      landing: '/journal/admin-test?private=1',
      referrer: 'https://chatgpt.com/c/private'
    }
  });
  assert.equal(lead.status, 201);
  state = await (await fetch(base + '/api/admin/state', { headers: { Cookie: cookie } })).json();
  assert.equal(state.leads[0].attribution.channel, 'ai');
  assert.equal(state.leads[0].attribution.landing, '/journal/admin-test');
  const leadId = (await lead.json()).id;
  assert.equal(
    (await post('/api/admin/action', { action: 'delete-lead', id: leadId }, 'https://evil.example'))
      .status,
    403
  );
  assert.equal(
    (await post('/api/admin/action', { action: 'delete-lead', id: leadId })).status,
    200
  );
  assert.equal(
    (await post('/api/admin/action', { action: 'delete-lead', id: leadId })).status,
    400
  );
  state = await (await fetch(base + '/api/admin/state', { headers: { Cookie: cookie } })).json();
  assert.equal(
    state.leads.some(l => l.id === leadId),
    false
  );
  assert.equal((await post('/api/admin/action', { action: 'generate' })).status, 400);
  assert.match(await (await fetch(base + '/feed.xml')).text(), /<rss/);
  const page = await fetch(base + '/admin');
  assert.match(page.headers.get('x-robots-tag'), /noindex/);
  assert.match(page.headers.get('cache-control'), /no-store/);
  const invalid = await fetch(base + '/api/admin/state', {
    headers: { Cookie: cookie + 'tamper' }
  });
  assert.equal(invalid.status, 401);
  console.log(
    'PASS: admin auth, CSRF, production local bypass denied, cookie flags, private drafts, review checks, edit revokes schedule, publish, SSR author/FAQ/schema, lead AI attribution, secret isolation.'
  );
} finally {
  child.kill();
  if (child.exitCode === null) await new Promise(r => child.once('exit', r));
  rmSync(dir, { recursive: true, force: true });
}
