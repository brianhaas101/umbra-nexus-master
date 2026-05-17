import { fetchRawRecords } from "../connectors/data_gov_crime_catalog_connector.js";
import { normalizeRecord } from "../normalizers/data_gov_crime_catalog_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "source_page_verified_data_gov_crime_signals") {
  throw new Error("Data.gov Crime parser verification failed.");
}

console.log("L01_DATA_GOV_CRIME_CATALOG_PASS");
