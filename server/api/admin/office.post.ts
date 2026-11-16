import { askPerson, assignTask, closeTask, mergeFromPanel } from '../../lib/team-panel.mjs';
import { createTeamLlm, teamConfig } from '../../lib/team-chat.mjs';
let llm: ReturnType<typeof createTeamLlm> | undefined;
export default defineEventHandler(async event => {
  requireAdmin(event);
  const b = await adminBody(event);
  const cfg = teamConfig();
  const store = storage();
  try {
    if (b.action === 'ask') {
      llm ||= createTeamLlm(cfg);
      return await askPerson({ personId: b.person, text: b.text }, { store, cfg, llm });
    }
    if (b.action === 'history') return { messages: store.dmHistory(String(b.person || '')) };
    if (b.action === 'assign') {
      const r = await assignTask(
        { personId: b.person, title: b.title, details: b.details },
        { store, cfg }
      );
      resetOfficeCache();
      return r;
    }
    if (b.action === 'close-task') {
      await closeTask(Number(b.number), { cfg });
      resetOfficeCache();
      return { ok: true };
    }
    if (b.action === 'merge') {
      const n = Number(b.number);
      if (!Number.isInteger(n) || n < 1) throw Error('Неверный номер PR.');
      const message = await mergeFromPanel(n, {});
      resetOfficeCache();
      return { message };
    }
    throw Error('Неизвестное действие.');
  } catch (e) {
    throw createError({
      statusCode: 400,
      statusMessage: e instanceof Error ? e.message.slice(0, 300) : 'Ошибка.'
    });
  }
});
