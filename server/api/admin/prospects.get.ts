import { DISTRICTS, SEGMENTS, huntConfig } from '../../lib/lead-hunt.mjs';
import { teamConfig } from '../../lib/team-chat.mjs';
export default defineEventHandler(event => {
  requireAdmin(event);
  const db = storage();
  const cfg = huntConfig();
  return {
    prospects: db.prospects(),
    counts: db.prospectCounts(),
    config: {
      enabled: cfg.enabled,
      places: Boolean(cfg.placesKey),
      drafts: Boolean(teamConfig().apiKey),
      daily: cfg.daily,
      lastSearch: db.huntGet('last_search'),
      lastQuery: db.huntGet('last_query')
    },
    segments: SEGMENTS.map(s => ({ id: s.id, query: s.query })),
    districts: DISTRICTS
  };
});
