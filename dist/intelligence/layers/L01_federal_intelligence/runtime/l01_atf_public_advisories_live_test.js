import { fetchRawRecords, describeConnector } from "../connectors/atf_public_advisories_connector.js";
import { normalizeRecord } from "../normalizers/atf_public_advisories_normalizer.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const descriptor = describeConnector();
assert(descriptor.active === true, "ATF connector must be active.");
assert(descriptor.black_dragon_coupling === false, "Black Dragon coupling must be false.");

const records = await fetchRawRecords();

assert(Array.isArray(records), "Connector must return array.");
assert(records.length === 1, "Connector must return one envelope.");
assert(records[0].layer_id === "L01", "Envelope layer mismatch.");
assert(records[0].source_id === "atf_public_advisories", "Envelope source mismatch.");

const normalized = normalizeRecord(records[0]);

assert(normalized.layer_id === "L01", "Normalized layer mismatch.");
assert(normalized.source_id === "atf_public_advisories", "Normalized source mismatch.");
assert(normalized.entity_type === "federal_law_enforcement_advisory_source_page", "Entity type mismatch.");
assert(normalized.parser_status === "source_page_verified_atf_signals", "Parser status mismatch.");
assert(normalized.federal_context.signals.length > 0, "Expected ATF signals.");
assert(normalized.black_dragon_coupling === false, "Black Dragon coupling must be false.");

console.log("L01_ATF_PUBLIC_ADVISORIES_SOURCE_PAGE_PASS");
