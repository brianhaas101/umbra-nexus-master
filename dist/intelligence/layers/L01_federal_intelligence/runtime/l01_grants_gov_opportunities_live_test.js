import { fetchRawRecords } from "../connectors/grants_gov_opportunities_connector.js";
import { normalizeRecord } from "../normalizers/grants_gov_opportunities_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "source_page_verified_grants_gov_signals") {
  throw new Error("Grants.gov parser verification failed.");
}

console.log("L01_GRANTS_GOV_OPPORTUNITIES_PASS");
