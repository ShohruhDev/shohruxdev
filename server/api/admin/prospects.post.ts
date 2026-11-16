import {
  draftMessage,
  huntConfig,
  huntTick,
  markSent,
  runExclusive,
  segmentById,
  setProspectStatus
} from '../../lib/lead-hunt.mjs';
import { createTeamLlm, teamConfig } from '../../lib/team-chat.mjs';
let llm: ReturnType<typeof createTeamLlm> | undefined;
const str = (v: unknown, max: number) =>
  String(v ?? '')
    .trim()
    .slice(0, max);
export default defineEventHandler(async event => {
  requireAdmin(event);
  const b = await adminBody(event);
  const store = storage();
  const teamCfg = teamConfig();
  if (teamCfg.apiKey) llm ||= createTeamLlm(teamCfg);
  try {
    if (b.action === 'hunt') {
      const cfg = huntConfig();
      const seg = segmentById(str(b.segment, 30));
      const query = seg
        ? {
            segment: seg.id,
            text: `${seg.query} ${str(b.district, 40)} Ташкент`.replace(/\s+/g, ' ')
          }
        : undefined;
      const r = await runExclusive(() =>
        huntTick({ store, cfg, teamCfg, llm, force: true, query })
      );
      return r;
    }
    if (b.action === 'add') {
      const name = str(b.name, 200);
      if (name.length < 2) throw Error('Укажите название компании.');
      let website = str(b.website, 300);
      if (website && !/^https?:\/\//i.test(website)) website = 'https://' + website;
      if (website) new URL(website);
      store.prospectAdd({
        source: 'manual',
        segment: segmentById(str(b.segment, 30))?.id || 'other',
        name,
        website,
        phone: str(b.phone, 40)
      });
      return { ok: true };
    }
    const id = str(b.id, 200);
    if (b.action === 'save-draft') {
      const p = store.prospect(id);
      if (p?.status !== 'ready') throw Error('Черновик уже обработан.');
      store.prospectUpdate(id, { draft: str(b.draft, 1500) }, { kind: 'edit', who: 'ceo' });
      return { ok: true };
    }
    if (b.action === 'redraft') {
      const p = store.prospect(id);
      if (p?.status !== 'ready') throw Error('Черновик уже обработан.');
      if (!llm) throw Error('Модель не подключена: нет ключа OpenRouter.');
      const d = await draftMessage(llm, p, p.touch || 1, b.lang === 'uz' ? 'uz' : 'ru');
      store.teamCount(new Date().toISOString().slice(0, 10), { calls: 1, ...d.usage });
      store.prospectUpdate(id, { draft: d.text }, { kind: 'draft', who: d.author, touch: p.touch });
      return { draft: d.text };
    }
    if (b.action === 'sent') {
      markSent(store, id, str(b.text, 1500));
      return { ok: true };
    }
    if (b.action === 'status') {
      setProspectStatus(store, id, str(b.status, 20));
      return { ok: true };
    }
    throw Error('Неизвестное действие.');
  } catch (e) {
    throw createError({
      statusCode: 400,
      statusMessage: e instanceof Error ? e.message.slice(0, 300) : 'Ошибка.'
    });
  }
});
