import { fetchRawRecords } from "../connectors/nist_cyber_publications_connector.js";
import { normalizeRecord } from "../normalizers/nist_cyber_publications_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "source_page_verified_nist_cyber_signals") {
  throw new Error("NIST parser verification failed.");
}

console.log("L01_NIST_CYBER_PUBLICATIONS_PASS");
