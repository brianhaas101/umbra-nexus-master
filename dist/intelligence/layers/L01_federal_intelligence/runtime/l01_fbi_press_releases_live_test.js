import { fetchRawRecords } from "../connectors/fbi_press_releases_connector.js";
import { normalizeRecord } from "../normalizers/fbi_press_releases_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "source_page_verified_fbi_signals") {
  throw new Error("FBI parser verification failed.");
}

console.log("L01_FBI_SOURCE_PAGE_PASS");
