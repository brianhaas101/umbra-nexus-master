import { fetchRawRecords } from "../connectors/fbi_ucr_connector.js";
import { normalizeRecord } from "../normalizers/fbi_ucr_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "api_verified_fbi_ucr_agencies") {
  throw new Error("FBI UCR verification failed.");
}

console.log("L01_FBI_UCR_API_PASS");
