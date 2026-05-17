import { fetchRawRecords, describeConnector } from "../connectors/doj_announcements_connector.js";
import { normalizeRecord } from "../normalizers/doj_announcements_normalizer.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const descriptor = describeConnector();

assert(descriptor.active === true, "DOJ connector must be active.");
assert(descriptor.black_dragon_coupling === false, "Black Dragon coupling must be false.");

const records = await fetchRawRecords();

assert(Array.isArray(records), "Connector must return array.");
assert(records.length === 1, "Connector must return one envelope.");
assert(records[0].layer_id === "L01", "Envelope layer mismatch.");
assert(records[0].source_id === "doj_announcements", "Envelope source mismatch.");
assert(records[0].black_dragon_coupling === false, "Envelope Black Dragon coupling must be false.");

const normalized = normalizeRecord(records[0]);

assert(normalized.layer_id === "L01", "Normalized layer mismatch.");
assert(normalized.source_id === "doj_announcements", "Normalized source mismatch.");
assert(normalized.entity_type === "federal_justice_announcement_source_page", "Entity type mismatch.");
assert(normalized.evidence[0].evidence_type === "public_html_source_page_fetch", "Evidence type mismatch.");
assert(normalized.federal_context.page_title !== null, "Expected DOJ page title.");
assert(normalized.black_dragon_coupling === false, "Normalized Black Dragon coupling must be false.");

console.log("L01_DOJ_ANNOUNCEMENTS_SOURCE_PAGE_PASS");
