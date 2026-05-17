import { buildNormalizer } from "./shared_source_page_normalizer.js";

export const SOURCE_ID = "ice_news_releases";

export const normalizeRecord = buildNormalizer({
  source_id: SOURCE_ID,
  entity_slug: "ice",
  entity_type: "federal_immigration_enforcement_source_page",
  identity_markers: [
    "immigration and customs enforcement",
    "ice"
  ],
  signal_terms: [
    "enforcement",
    "investigation",
    "homeland security",
    "removal",
    "smuggling",
    "news release"
  ],
  authority_score: 92,
  authority_basis: "official_ice_newsroom",
  signal_score: 87,
  signal_basis: "ice_enforcement_terms_present",
  evidence_type: "public_html_ice_fetch",
  parser_status: "source_page_verified_ice_signals"
});
