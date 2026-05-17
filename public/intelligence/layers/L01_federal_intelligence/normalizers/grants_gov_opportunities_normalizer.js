import { buildNormalizer } from "./shared_source_page_normalizer.js";

export const SOURCE_ID = "grants_gov_opportunities";

export const normalizeRecord = buildNormalizer({
  source_id: SOURCE_ID,
  entity_slug: "grants_gov",
  entity_type: "federal_grant_opportunity_source_page",
  identity_markers: [
    "grants.gov",
    "search grants"
  ],
  signal_terms: [
    "grant",
    "opportunity",
    "funding",
    "agency",
    "eligibility",
    "assistance"
  ],
  authority_score: 95,
  authority_basis: "official_grants_gov_search_page",
  signal_score: 90,
  signal_basis: "grants_gov_opportunity_terms_present",
  evidence_type: "public_html_grants_gov_fetch",
  parser_status: "source_page_verified_grants_gov_signals"
});
