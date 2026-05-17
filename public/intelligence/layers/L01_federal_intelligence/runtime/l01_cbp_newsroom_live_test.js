import { fetchRawRecords } from "../connectors/cbp_newsroom_connector.js";
import { normalizeRecord } from "../normalizers/cbp_newsroom_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "source_page_verified_cbp_signals") {
  throw new Error("CBP parser verification failed.");
}

console.log("L01_CBP_NEWSROOM_SOURCE_PAGE_PASS");
