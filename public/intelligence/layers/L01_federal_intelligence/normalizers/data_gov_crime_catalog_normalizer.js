import { buildNormalizer } from "./shared_source_page_normalizer.js";

export const SOURCE_ID = "data_gov_crime_catalog";

export const normalizeRecord = buildNormalizer({
  source_id: SOURCE_ID,
  entity_slug: "data_gov_crime",
  entity_type: "federal_open_data_crime_catalog_source_page",
  identity_markers: [
    "data.gov",
    "dataset"
  ],
  signal_terms: [
    "crime",
    "dataset",
    "justice",
    "police",
    "public safety",
    "law enforcement"
  ],
  authority_score: 90,
  authority_basis: "official_data_gov_catalog_search",
  signal_score: 84,
  signal_basis: "crime_catalog_terms_present",
  evidence_type: "public_html_data_gov_catalog_fetch",
  parser_status: "source_page_verified_data_gov_crime_signals"
});
