import { processLayer01 } from "./layer_01.js";

const valid = {
  source_url: "https://example.gov/source",
  source_type: "public_source_record",
  source_title: "Example Public Source",
  retrieved_at: "2026-05-13T00:00:00.000Z",
  city: "Example City",
  entity: "Example Entity",
  claim: "Example sourced claim for Layer 01 validation.",
  confidence: 80
};

const invalid = {
  source_url: "",
  source_type: "public_source_record",
  source_title: "Invalid Source",
  retrieved_at: "not-a-date",
  city: "Example City",
  entity: "Example Entity",
  claim: "Invalid unsourced claim.",
  inferred_email: "fake@example.com"
};

const validOut = processLayer01(valid);
const invalidOut = processLayer01(invalid);

if (validOut.accepted !== true) {
  throw new Error("Layer 01 valid fixture failed acceptance.");
}

if (validOut.provenance_status !== "accepted_with_source") {
  throw new Error("Layer 01 valid fixture provenance status failed.");
}

if (!validOut.record_id || !validOut.record_id.startsWith("l01_")) {
  throw new Error("Layer 01 deterministic record_id failed.");
}

if (invalidOut.accepted !== false) {
  throw new Error("Layer 01 invalid fixture failed rejection.");
}

if (!invalidOut.rejection_reasons.includes("missing_required_field:source_url")) {
  throw new Error("Layer 01 missing source_url rejection failed.");
}

if (!invalidOut.rejection_reasons.includes("invalid_source_url")) {
  throw new Error("Layer 01 invalid URL rejection failed.");
}

if (!invalidOut.rejection_reasons.includes("invalid_retrieved_at")) {
  throw new Error("Layer 01 invalid timestamp rejection failed.");
}

if (!invalidOut.rejection_reasons.includes("rejected_field_present:inferred_email")) {
  throw new Error("Layer 01 inferred email rejection failed.");
}

console.log("LAYER_01_TESTS_PASS");
