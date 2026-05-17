import { fetchRawRecords } from "../connectors/cisa_advisories_connector.js";
import { normalizeRecord } from "../normalizers/cisa_advisories_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "source_page_verified_cisa_signals") {
  throw new Error("CISA parser verification failed.");
}

console.log("L01_CISA_ADVISORIES_PASS");
