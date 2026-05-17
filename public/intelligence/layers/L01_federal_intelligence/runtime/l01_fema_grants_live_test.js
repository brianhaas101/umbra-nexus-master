import { fetchRawRecords, describeConnector } from "../connectors/fema_grants_connector.js";
import { normalizeRecord } from "../normalizers/fema_grants_normalizer.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const descriptor = describeConnector();
assert(descriptor.active === true, "FEMA connector must be active.");
assert(descriptor.black_dragon_coupling === false, "Black Dragon coupling must be false.");

const records = await fetchRawRecords();

assert(Array.isArray(records), "Connector must return array.");
assert(records.length === 1, "Connector must return one envelope.");
assert(records[0].layer_id === "L01", "Envelope layer mismatch.");
assert(records[0].source_id === "fema_grants", "Envelope source mismatch.");

const normalized = normalizeRecord(records[0]);

assert(normalized.layer_id === "L01", "Normalized layer mismatch.");
assert(normalized.source_id === "fema_grants", "Normalized source mismatch.");
assert(normalized.entity_type === "federal_grant_source_page", "Entity type mismatch.");
assert(normalized.parser_status === "source_page_verified_grant_signals", "Parser status mismatch.");
assert(normalized.federal_context.grant_signals.length > 0, "Expected grant signals.");
assert(normalized.black_dragon_coupling === false, "Black Dragon coupling must be false.");

console.log("L01_FEMA_GRANTS_SOURCE_PAGE_PASS");
