import { fetchRawRecords, describeConnector } from "../connectors/fbi_crime_data_explorer_connector.js";
import { normalizeRecord } from "../normalizers/fbi_crime_data_explorer_normalizer.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const descriptor = describeConnector();

assert(descriptor.active === true, "FBI CDE connector must be active.");
assert(descriptor.black_dragon_coupling === false, "Black Dragon coupling must be false.");

const records = await fetchRawRecords();

assert(Array.isArray(records), "Connector must return array.");
assert(records.length === 1, "Connector must return one envelope.");
assert(records[0].layer_id === "L01", "Envelope layer mismatch.");
assert(records[0].source_id === "fbi_crime_data_explorer", "Envelope source mismatch.");

const normalized = normalizeRecord(records[0]);

assert(normalized.layer_id === "L01", "Normalized layer mismatch.");
assert(normalized.source_id === "fbi_crime_data_explorer", "Normalized source mismatch.");
assert(normalized.entity_type === "federal_crime_data_agency_collection", "Entity type mismatch.");
assert(normalized.federal_context.agency_count > 0, "Expected FBI CDE agencies.");
assert(normalized.black_dragon_coupling === false, "Black Dragon coupling must be false.");

console.log("L01_FBI_CDE_LIVE_CONNECTOR_PASS");
