import { buildNormalizer } from "./shared_source_page_normalizer.js";

export const SOURCE_ID = "fbi_press_releases";

export const normalizeRecord = buildNormalizer({
  source_id: SOURCE_ID,
  entity_slug: "fbi",
  entity_type: "federal_investigative_source_page",
  identity_markers: [
    "federal bureau of investigation",
    "fbi"
  ],
  signal_terms: [
    "investigation",
    "federal",
    "counterterrorism",
    "cyber",
    "public corruption",
    "news"
  ],
  authority_score: 94,
  authority_basis: "official_fbi_newsroom",
  signal_score: 88,
  signal_basis: "fbi_investigative_terms_present",
  evidence_type: "public_html_fbi_fetch",
  parser_status: "source_page_verified_fbi_signals"
});
