import { buildNormalizer } from "./shared_source_page_normalizer.js";

export const SOURCE_ID = "cbp_corridor_reports";

export const normalizeRecord = buildNormalizer({
  source_id: SOURCE_ID,
  entity_slug: "cbp_corridor",
  entity_type: "federal_border_corridor_source_page",
  identity_markers: [
    "customs and border protection",
    "cbp"
  ],
  signal_terms: [
    "border",
    "port",
    "ports of entry",
    "seizure",
    "trade",
    "travel",
    "inspection",
    "corridor"
  ],
  authority_score: 88,
  authority_basis: "official_cbp_newsroom_corridor_source",
  signal_score: 84,
  signal_basis: "cbp_border_corridor_terms_present",
  evidence_type: "public_html_cbp_corridor_fetch",
  parser_status: "source_page_verified_cbp_corridor_signals"
});
