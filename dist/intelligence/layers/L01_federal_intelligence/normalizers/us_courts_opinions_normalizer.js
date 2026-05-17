import { buildNormalizer } from "./shared_source_page_normalizer.js";

export const SOURCE_ID = "us_courts_opinions";

export const normalizeRecord = buildNormalizer({
  source_id: SOURCE_ID,
  entity_slug: "us_courts",
  entity_type: "federal_judicial_source_page",
  identity_markers: [
    "united states courts",
    "uscourts.gov"
  ],
  signal_terms: [
    "court",
    "judicial",
    "federal",
    "opinions",
    "judiciary",
    "appeals"
  ],
  authority_score: 94,
  authority_basis: "official_us_courts_source",
  signal_score: 88,
  signal_basis: "federal_judicial_terms_present",
  evidence_type: "public_html_us_courts_fetch",
  parser_status: "source_page_verified_us_courts_signals"
});
