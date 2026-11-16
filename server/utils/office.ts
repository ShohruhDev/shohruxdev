import { githubOverview } from '../lib/team-panel.mjs';
import { teamConfig } from '../lib/team-chat.mjs';
// Данные GitHub для панели «Офис» кэшируются на минуту, чтобы не упираться в лимиты API.
type Gh = Awaited<ReturnType<typeof githubOverview>>;
let cache: { at: number; data: Gh } | undefined;
export function resetOfficeCache() {
  cache = undefined;
}
export async function officeGithub(fresh = false): Promise<Gh> {
  if (!cache || fresh || Date.now() - cache.at > 60_000)
    cache = {
      at: Date.now(),
      data: await githubOverview(teamConfig()).catch((e: unknown) => ({
        tasks: [],
        prs: [],
        merged: [],
        error: e instanceof Error ? e.message : 'GitHub недоступен'
      }))
    };
  return cache.data;
}
