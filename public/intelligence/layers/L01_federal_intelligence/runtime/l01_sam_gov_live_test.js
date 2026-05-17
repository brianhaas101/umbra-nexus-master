import { fetchRawRecords, describeConnector } from "../connectors/sam_gov_connector.js";
import { normalizeRecord } from "../normalizers/sam_gov_normalizer.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const descriptor = describeConnector();
assert(descriptor.active === true, "SAM.gov connector must be active.");
assert(descriptor.black_dragon_coupling === false, "Black Dragon coupling must be false.");

const records = await fetchRawRecords();
assert(Array.isArray(records), "Connector must return array.");
assert(records.length === 1, "Connector must return one envelope.");
assert(records[0].source_id === "sam_gov", "Envelope source mismatch.");

const normalized = normalizeRecord(records[0]);
assert(normalized.layer_id === "L01", "Normalized layer mismatch.");
assert(normalized.source_id === "sam_gov", "Normalized source mismatch.");
assert(normalized.black_dragon_coupling === false, "Black Dragon coupling must be false.");

console.log("L01_SAM_GOV_LIVE_CONNECTOR_PASS");
