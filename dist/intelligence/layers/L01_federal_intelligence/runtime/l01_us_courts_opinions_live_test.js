import { fetchRawRecords } from "../connectors/us_courts_opinions_connector.js";
import { normalizeRecord } from "../normalizers/us_courts_opinions_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "source_page_verified_us_courts_signals") {
  throw new Error("US Courts parser verification failed.");
}

console.log("L01_US_COURTS_OPINIONS_PASS");
