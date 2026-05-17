import { fetchRawRecords } from "../connectors/fbi_field_offices_connector.js";
import { normalizeRecord } from "../normalizers/fbi_field_offices_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "source_page_verified_fbi_field_office_signals") {
  throw new Error("FBI Field Offices verification failed.");
}

console.log("L01_FBI_FIELD_OFFICES_PASS");
