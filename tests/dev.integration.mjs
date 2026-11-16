// Регрессия: `nuxt dev` должен отдавать страницы, а не 500.
// Раньше в dev Nitro оставлял shared/*.mjs внешними и ломал относительные импорты
// (Cannot find module '/shared/team-roles.mjs'), хотя production-сборка работала.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'web-mobile-dev-'));
const port = 3177;
const base = `http://127.0.0.1:${port}`;
const child = spawn(
  process.execPath,
  ['node_modules/nuxt/bin/nuxt.mjs', 'dev', '--host', '127.0.0.1', '--port', String(port)],
  {
    env: { ...process.env, CONTENT_DB: join(dir, 'content.sqlite'), NUXT_TELEMETRY_DISABLED: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true
  }
);
let log = '';
child.stdout.on('data', b => (log += b));
child.stderr.on('data', b => (log += b));
const exited = new Promise(r => child.once('exit', r));

try {
  // Пока Nuxt собирает приложение, dev-сервер отвечает 503.
  const deadline = Date.now() + 120_000;
  let status = 0;
  while (Date.now() < deadline) {
    status = await fetch(base + '/')
      .then(r => r.status)
      .catch(() => 0);
    if (status && status !== 503) break;
    if (child.exitCode !== null) throw Error(`nuxt dev exited ${child.exitCode}\n${log}`);
    await new Promise(r => setTimeout(r, 1000));
  }
  for (const path of ['/', '/uz', '/contact']) {
    const r = await fetch(base + path);
    const body = await r.text();
    assert.equal(r.status, 200, `${path}: ${body.slice(0, 500)}\n${log}`);
    assert.match(body, /<h1/, path);
  }
  console.log('PASS: nuxt dev serves /, /uz, /contact with 200.');
} finally {
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {}
  await Promise.race([exited, new Promise(r => setTimeout(r, 5000))]);
  rmSync(dir, { recursive: true, force: true });
}
