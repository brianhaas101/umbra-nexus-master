import { validateRawEnvelope } from "./l01_connector_sandbox.js";
import { replayHash } from "./l01_replay_hash.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const invalidMissing = {
  layer_id: "L01",
  source_id: "bad_source"
};

const invalidMissingResult = validateRawEnvelope(invalidMissing);
assert(invalidMissingResult.valid === false, "Missing fields should fail.");
assert(invalidMissingResult.errors.includes("missing:canonical_url"), "Missing canonical_url not caught.");

const invalidUrl = {
  layer_id: "L01",
  source_id: "bad_source",
  source_name: "Bad Source",
  canonical_url: "http://bad.example",
  retrieved_at: "2026-05-13T00:00:00.000Z",
  raw_record_type: "bad",
  raw_payload: {},
  source_trace: {}
};

const invalidUrlResult = validateRawEnvelope(invalidUrl);
assert(invalidUrlResult.valid === false, "HTTP URL should fail.");
assert(invalidUrlResult.errors.includes("invalid:canonical_url_protocol"), "Bad URL protocol not caught.");

const synthetic = {
  layer_id: "L01",
  source_id: "bad_source",
  source_name: "Bad Source",
  canonical_url: "https://bad.example",
  retrieved_at: "2026-05-13T00:00:00.000Z",
  raw_record_type: "bad",
  raw_payload: {},
  source_trace: {},
  synthetic_fillers_allowed: true
};

const syntheticResult = validateRawEnvelope(synthetic);
assert(syntheticResult.valid === false, "Synthetic filler flag should fail.");
assert(syntheticResult.errors.includes("blocked:synthetic_fillers"), "Synthetic flag not caught.");

const a = replayHash({ b: 1, a: 2 });
const b = replayHash({ a: 2, b: 1 });
assert(a === b, "Replay hash must be stable across key order.");

console.log("L01_FAILURE_TESTS_PASS");
