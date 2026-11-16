import { fireConfig, officeOverview } from '../../lib/team-panel.mjs';
import { teamConfig } from '../../lib/team-chat.mjs';
export default defineEventHandler(async event => {
  requireAdmin(event);
  const gh = await officeGithub(getQuery(event).fresh === '1');
  return {
    ...officeOverview({ store: storage(), gh, cfg: teamConfig() }),
    fireReady: Boolean(fireConfig().token)
  };
});
