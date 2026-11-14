import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openStore } from '../server/lib/store.mjs';
const [command, arg, date] = process.argv.slice(2);
const db = openStore(process.env.CONTENT_DB || resolve('.data/content.sqlite'));
try {
  if (command === 'import') {
    if (!arg) throw new Error('JSON file required');
    db.importDraft(JSON.parse(readFileSync(arg, 'utf8')));
    console.log('Draft imported; not published.');
  } else if (command === 'approve') {
    if (!arg || !date) throw new Error('slug and ISO datetime with timezone required');
    db.approve(arg, date);
    console.log('Approved and scheduled.');
  } else if (command === 'publish-due') {
    console.log(JSON.stringify({ published: db.publishDue(), at: new Date().toISOString() }));
  } else if (command === 'list') {
    console.table(db.queue());
  } else if (command === 'leads') {
    console.log(JSON.stringify(db.leads(), null, 2));
  } else {
    console.log(
      'Commands: import <file.json> | approve <slug> <ISO-datetime> | publish-due | list | leads'
    );
    if (command) process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
