import { runFixtureIngestion } from "./l01_ingestion_runner.js";
import { replayHash } from "./l01_replay_hash.js";
import { bridgeToPipe01 } from "./l01_pipe01_bridge.js";
import { appendFederalDossier } from "./l01_dossier_append.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const fixture = runFixtureIngestion();
assert(fixture.count === 15, "Fixture ingestion must account for 15 sources.");

const sample = Object.freeze({
  layer_id: "L01",
  source_id: "test_source",
  entity_id: "entity_test",
  entity_type: "federal_test_entity",
  source_trace: Object.freeze([{ canonical_url: "https://example.gov", retrieved_at: "2026-05-13T00:00:00.000Z" }]),
  evidence: Object.freeze([{ evidence_type: "test", source_url: "https://example.gov" }]),
  federal_context: Object.freeze({ signal: "test" }),
  score_components: Object.freeze([{ score_name: "authority_score", score_value: 90 }])
});

const hashA = replayHash({ b: 1, a: 2 });
const hashB = replayHash({ a: 2, b: 1 });
assert(hashA === hashB, "Deterministic connector output hashing failed.");

const bridged = bridgeToPipe01(sample);
assert(bridged.pipe_stage === "PIPE_01", "PIPE_01 bridge failed.");
assert(bridged.provenance_trace.provenance_id.startsWith("prov_"), "Provenance trace injection failed.");

const dossier = appendFederalDossier({}, sample);
assert(dossier.federal_sources.length === 1, "Federal dossier append failed.");
assert(dossier.federal_sources[0].source_id === "test_source", "Dossier source mismatch.");

console.log("L01_FULL_REQUIREMENTS_TEST_PASS");
