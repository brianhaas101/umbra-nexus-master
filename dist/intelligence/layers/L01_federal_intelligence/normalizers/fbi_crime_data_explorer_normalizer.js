import { normalizeFbiAgencyApi } from "./shared_fbi_api_normalizer.js";

export const normalizeRecord = rawEnvelope => normalizeFbiAgencyApi(rawEnvelope, {
  source_id: "fbi_crime_data_explorer",
  slug: "fbi_cde",
  entity_type: "federal_crime_data_agency_collection",
  authority_basis: "official_fbi_cde_authenticated_api",
  evidence_type: "official_fbi_cde_agency_api_fetch",
  parser_status: "api_verified_fbi_cde_agencies"
});
