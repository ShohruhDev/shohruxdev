import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateLead, validateDraft } from '../server/lib/core.mjs';
import { openStore } from '../server/lib/store.mjs';

const valid = { name: ' Анна ', contact: 'anna@example.com', message: 'Нужен сайт с каталогом товаров', service: 'web', budget: '', consent: true, website: '' };
test('requires a usable contact, task and explicit consent', () => {
  assert.equal(validateLead(valid).name, 'Анна');
  for (const input of [{...valid, contact:'abc'}, {...valid, consent:false}, {...valid, message:' '}, {...valid, name:'x'.repeat(101)}, {...valid, message:'x'.repeat(5001)}, {...valid, service:'invalid'}, null]) {
    assert.throws(()=>validateLead(input));
  }
  assert.throws(()=>validateLead({...valid, website:'spam.example'}));
});
test('persists leads, hides drafts and future posts, publishes due approvals once', () => {
  const dir=mkdtempSync(join(tmpdir(),'web-mobile-')); const file=join(dir,'test.sqlite');
  let db=openStore(file);
  try {
    const id=db.saveLead(validateLead(valid)); db.close(); db=openStore(file);
    assert.equal(db.leads()[0].id,id);
    const draft={slug:'site-cost', title:'Стоимость сайта', description:'Как определить бюджет', category:'Веб-разработка', content:[{heading:'Объём',body:'Начните с задач пользователей.'}], sources:[]};
    db.importDraft(draft); assert.equal(db.publicPosts('2026-10-25T10:00:00.000Z').length,0);
    assert.equal(db.publishDue('2026-10-25T10:00:00.000Z'),0);
    db.approve('site-cost','2026-10-26T10:00:00.000Z');
    assert.equal(db.publishDue('2026-10-25T10:00:00.000Z'),0);
    assert.equal(db.publicPosts('2026-10-25T10:00:00.000Z').length,0);
    assert.equal(db.publishDue('2026-10-26T10:00:00.000Z'),1);
    assert.equal(db.publishDue('2026-10-26T10:00:00.000Z'),0);
    assert.equal(db.publicPosts('2026-10-26T10:00:00.000Z')[0].slug,'site-cost');
    assert.throws(()=>db.importDraft(draft));
    assert.throws(()=>db.approve('missing','2026-10-26T10:00:00.000Z'));
    assert.throws(()=>db.approve('site-cost','not-a-date'));
  } finally {db.close();rmSync(dir,{recursive:true,force:true});}
});

test('rejects contacts without enough digits',()=>{
  assert.throws(()=>validateLead({...valid,contact:'---------'}));
  assert.throws(()=>validateLead({...valid,contact:'+(12)--- -'}));
});

test('rejects article links to unknown services',()=>{
 const p={slug:'test',title:'Test',description:'Description',category:'Web',content:[{heading:'H',body:'Body'}],sources:[],service:'nonexistent'};
 assert.throws(()=>validateDraft(p));
});

test('limits repeated submissions and opens a new window after an hour',()=>{
 const dir=mkdtempSync(join(tmpdir(),'web-mobile-rate-'));const db=openStore(join(dir,'test.sqlite'));
 try {for(let i=0;i<5;i++)assert.equal(db.allowRequest('client',10000000),true);assert.equal(db.allowRequest('client',10000000),false);assert.equal(db.allowRequest('another',10000000),true);assert.equal(db.allowRequest('client',13600001),true);}finally{db.close();rmSync(dir,{recursive:true,force:true});}
});
test('deletes only the requested lead', () => {
  const dir=mkdtempSync(join(tmpdir(),'web-mobile-')); const db=openStore(join(dir,'test.sqlite'));
  try {
    const keep=db.saveLead(validateLead(valid)), drop=db.saveLead(validateLead({...valid,name:'Тест'}));
    db.deleteLead(drop);
    assert.deepEqual(db.leads().map(l=>l.id),[keep]);
    assert.throws(()=>db.deleteLead(drop),/не найдена/); assert.throws(()=>db.deleteLead(undefined));
  } finally { db.close(); rmSync(dir,{recursive:true,force:true}); }
});
