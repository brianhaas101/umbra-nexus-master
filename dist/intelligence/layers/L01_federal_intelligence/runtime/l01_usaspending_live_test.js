import { fetchRawRecords, describeConnector } from "../connectors/usaspending_gov_connector.js";
import { normalizeRecord } from "../normalizers/usaspending_gov_normalizer.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const descriptor = describeConnector();

assert(descriptor.active === true, "USAspending connector must be active.");
assert(descriptor.black_dragon_coupling === false, "Black Dragon coupling must be false.");

const records = await fetchRawRecords();

assert(Array.isArray(records), "Connector must return an array.");
assert(records.length === 1, "Connector should return one envelope.");
assert(records[0].layer_id === "L01", "Envelope layer_id mismatch.");
assert(records[0].source_id === "usaspending_gov", "Envelope source_id mismatch.");
assert(records[0].black_dragon_coupling === false, "Envelope Black Dragon coupling must be false.");

const normalized = normalizeRecord(records[0]);

assert(normalized.layer_id === "L01", "Normalized layer_id mismatch.");
assert(normalized.source_id === "usaspending_gov", "Normalized source_id mismatch.");
assert(normalized.entity_type === "federal_agency_reference_collection", "Normalized entity_type mismatch.");
assert(normalized.federal_context.agency_count > 0, "Expected at least one agency.");
assert(normalized.black_dragon_coupling === false, "Normalized Black Dragon coupling must be false.");

console.log("L01_USASPENDING_LIVE_CONNECTOR_PASS");
