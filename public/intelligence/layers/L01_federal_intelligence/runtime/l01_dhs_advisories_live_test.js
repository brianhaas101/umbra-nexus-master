import { fetchRawRecords, describeConnector } from "../connectors/dhs_advisories_connector.js";
import { normalizeRecord } from "../normalizers/dhs_advisories_normalizer.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const descriptor = describeConnector();
assert(descriptor.active === true, "DHS connector must be active.");
assert(descriptor.client_path_coupling === false, "Client path coupling must be false.");

const records = await fetchRawRecords();

assert(Array.isArray(records), "Connector must return array.");
assert(records.length === 1, "Connector must return one envelope.");
assert(records[0].layer_id === "L01", "Envelope layer mismatch.");
assert(records[0].source_id === "dhs_advisories", "Envelope source mismatch.");

const normalized = normalizeRecord(records[0]);

assert(normalized.layer_id === "L01", "Normalized layer mismatch.");
assert(normalized.source_id === "dhs_advisories", "Normalized source mismatch.");
assert(normalized.entity_type === "federal_homeland_security_source_page", "Entity type mismatch.");
assert(normalized.parser_status === "source_page_verified_dhs_signals", "Parser status mismatch.");
assert(normalized.federal_context.signals.length > 0, "Expected DHS signals.");
assert(normalized.client_path_coupling === false, "Client path coupling must be false.");

console.log("L01_DHS_ADVISORIES_SOURCE_PAGE_PASS");
