import { huntConfig, huntTick, runExclusive } from '../lib/lead-hunt.mjs';
import { createTeamLlm, teamConfig } from '../lib/team-chat.mjs';
// Поиск клиентов: раз в 10 минут проверяет, пора ли искать компании, и готовит черновики касаний.
// Включается LEAD_HUNT_ENABLED=true; без GOOGLE_PLACES_API_KEY работает только с компаниями,
// добавленными вручную в Офисе.
export default defineNitroPlugin(nitro => {
  const cfg = huntConfig();
  if (!cfg.enabled) return;
  const teamCfg = teamConfig();
  const llm = teamCfg.apiKey ? createTeamLlm(teamCfg) : undefined;
  console.log(
    `Lead hunt enabled: ${cfg.daily}/day, places ${cfg.placesKey ? 'on' : 'off'}, drafts ${llm ? 'on' : 'off'}.`
  );
  let running = false;
  async function tick() {
    if (running) return;
    running = true;
    try {
      const r = await runExclusive(() => huntTick({ store: storage(), cfg, teamCfg, llm }));
      if (r.found || r.drafted || r.followups || r.errors.length)
        console.log(
          `Lead hunt: found ${r.found}, drafted ${r.drafted}, follow-ups ${r.followups}, errors ${r.errors.length}.`
        );
    } catch {
      console.error('Lead hunt worker failed.');
    } finally {
      running = false;
    }
  }
  const timer = setInterval(tick, 600000);
  timer.unref();
  setTimeout(tick, 30000).unref();
  nitro.hooks.hook('close', () => clearInterval(timer));
});
