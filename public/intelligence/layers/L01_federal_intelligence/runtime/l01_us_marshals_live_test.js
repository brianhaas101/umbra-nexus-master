import { fetchRawRecords } from "../connectors/us_marshals_notices_connector.js";
import { normalizeRecord } from "../normalizers/us_marshals_notices_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "source_page_verified_usms_signals") {
  throw new Error("USMS parser verification failed.");
}

console.log("L01_USMS_SOURCE_PAGE_PASS");
