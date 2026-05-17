import { fetchRawRecords } from "../connectors/state_education_connector.js";
import { normalizeRecord } from "../normalizers/state_education_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.layer_id !== "L02") throw new Error("Layer mismatch.");
if (normalized.state_code !== "CA") throw new Error("State mismatch.");
if (normalized.parser_status !== "source_page_verified_state_education_signals") throw new Error("Parser status mismatch.");

console.log("L02_STATE_EDUCATION_PASS");
