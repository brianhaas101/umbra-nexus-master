import { fetchRawRecords } from "../connectors/cbp_corridor_reports_connector.js";
import { normalizeRecord } from "../normalizers/cbp_corridor_reports_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "source_page_verified_cbp_corridor_signals") {
  throw new Error("CBP corridor parser verification failed.");
}

console.log("L01_CBP_CORRIDOR_REPORTS_SOURCE_PAGE_PASS");
