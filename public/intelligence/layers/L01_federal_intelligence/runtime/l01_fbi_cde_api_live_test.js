import { fetchRawRecords } from "../connectors/fbi_crime_data_explorer_connector.js";
import { normalizeRecord } from "../normalizers/fbi_crime_data_explorer_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "api_verified_fbi_cde_agencies") {
  throw new Error("FBI CDE verification failed.");
}

console.log("L01_FBI_CDE_API_PASS");
