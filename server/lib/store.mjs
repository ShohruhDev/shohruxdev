import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { validateDraft } from './core.mjs';
import { editorialStore } from './editorial.mjs';
import { telegramStore } from './telegram.mjs';

export function openStore(path, { onPublish } = {}) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS leads(id TEXT PRIMARY KEY, created_at TEXT NOT NULL, payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS posts(slug TEXT PRIMARY KEY, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', scheduled_at TEXT, published_at TEXT);
    CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, happened_at TEXT NOT NULL, action TEXT NOT NULL, slug TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY, since INTEGER NOT NULL, count INTEGER NOT NULL);`);
  const log = (action, slug) =>
    db
      .prepare('INSERT INTO audit(happened_at,action,slug) VALUES(?,?,?)')
      .run(new Date().toISOString(), action, slug);
  return {
    ...editorialStore(db, log),
    ...telegramStore(db, log),
    close: () => db.close(),
    saveLead(p) {
      const id = randomUUID();
      db.prepare('INSERT INTO leads VALUES(?,?,?)').run(
        id,
        new Date().toISOString(),
        JSON.stringify(p)
      );
      return id;
    },
    deleteLead(id) {
      if (typeof id !== 'string' || !db.prepare('DELETE FROM leads WHERE id=?').run(id).changes)
        throw new Error('Заявка не найдена.');
      log('lead-deleted', id);
    },
    leads() {
      return db
        .prepare('SELECT * FROM leads ORDER BY created_at DESC')
        .all()
        .map(r => ({ id: r.id, createdAt: r.created_at, ...JSON.parse(r.payload) }));
    },
    allowRequest(key, now = Date.now()) {
      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare('DELETE FROM rate_limits WHERE since < ?').run(now - 3600000);
        const row = db.prepare('SELECT * FROM rate_limits WHERE key=?').get(key);
        if (row && row.count >= 5) {
          db.exec('COMMIT');
          return false;
        }
        db.prepare(
          'INSERT INTO rate_limits VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=count+1'
        ).run(key, now);
        db.exec('COMMIT');
        return true;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    importDraft(p) {
      validateDraft(p);
      db.exec('BEGIN IMMEDIATE');
      try {
        if (db.prepare("SELECT slug FROM topics WHERE slug=? AND status='generating'").get(p.slug))
          throw Error('Этот URL зарезервирован текущей генерацией.');
        db.prepare('INSERT INTO posts(slug,payload) VALUES(?,?)').run(p.slug, JSON.stringify(p));
        db.prepare("UPDATE topics SET status='drafted' WHERE slug=?").run(p.slug);
        log('draft', p.slug);
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    approve(slug, time) {
      if (
        !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(time) ||
        !Number.isFinite(Date.parse(time))
      )
        throw new Error('Use ISO date with timezone');
      const r = db
        .prepare(
          "UPDATE posts SET status='approved', scheduled_at=? WHERE slug=? AND status='draft'"
        )
        .run(new Date(time).toISOString(), slug);
      if (!r.changes) throw new Error('Draft not found');
      log('approved', slug);
    },
    publishDue(now = new Date().toISOString()) {
      if (!Number.isFinite(Date.parse(now))) throw new Error('Invalid time');
      db.exec('BEGIN IMMEDIATE');
      try {
        const rows = db
          .prepare("SELECT slug,payload FROM posts WHERE status='approved' AND scheduled_at<=?")
          .all(now);
        for (const r of rows) {
          db.prepare("UPDATE posts SET status='published', published_at=? WHERE slug=?").run(
            now,
            r.slug
          );
          log('published', r.slug);
        }
        db.exec('COMMIT');
        if (rows.length && onPublish) {
          try {
            onPublish(rows.map(r => ({ ...JSON.parse(r.payload), slug: r.slug })));
          } catch {
            // Уведомления о публикации не должны влиять на сам выпуск.
          }
        }
        return rows.length;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    publicPosts(now = new Date().toISOString()) {
      return db
        .prepare(
          "SELECT * FROM posts WHERE status='published' AND published_at<=? ORDER BY published_at DESC"
        )
        .all(now)
        .map(r => ({ ...JSON.parse(r.payload), publishedAt: r.published_at, demo: false }));
    },
    queue() {
      return db
        .prepare('SELECT slug,status,scheduled_at,published_at FROM posts ORDER BY scheduled_at')
        .all();
    }
  };
}
