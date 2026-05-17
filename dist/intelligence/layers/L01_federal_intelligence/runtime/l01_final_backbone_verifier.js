import fs from "node:fs";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const layer = path.join(root, "public", "intelligence", "layers", "L01_federal_intelligence");
const expansion = path.join(root, "public", "intelligence", "source_registry", "L01_federal_intelligence_expansion");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const registry = readJson(path.join(layer, "source_registry.json"));

const canonicalLive = registry.sources.filter(s =>
  s.connector_active === true &&
  s.normalizer_active === true &&
  String(s.status || "").includes("verified")
);

const expansionFiles = fs.existsSync(expansion)
  ? fs.readdirSync(expansion).filter(f => f.endsWith(".json"))
  : [];

const expansionLive = expansionFiles
  .map(file => readJson(path.join(expansion, file)))
  .filter(s =>
    s.connector_active === true &&
    s.normalizer_active === true &&
    s.expansion_source === true &&
    String(s.status || "").includes("verified")
  );

const totalLive = canonicalLive.length + expansionLive.length;

assert(canonicalLive.length === 10, `Expected 10 canonical live sources. Found ${canonicalLive.length}.`);
assert(expansionLive.length === 5, `Expected 5 expansion live sources. Found ${expansionLive.length}.`);
assert(totalLive === 15, `Expected 15 total verified federal sources. Found ${totalLive}.`);

const requiredRuntime = [
  "l01_promotion_gate.js",
  "l01_connector_sandbox.js",
  "l01_ingestion_runner.js",
  "l01_failure_tests.js",
  "l01_replay_hash.js",
  "l01_provenance_trace.js",
  "l01_pipe01_bridge.js",
  "l01_dossier_append.js",
  "l01_full_requirements_test.js",
  "l01_access_acquisition_plan_test.js"
];

for (const file of requiredRuntime) {
  assert(fs.existsSync(path.join(layer, "runtime", file)), `Missing runtime file: ${file}`);
}

const requiredSchemas = [
  "raw_record_envelope_schema.json",
  "connector_parser_contract.json",
  "federal_entity_mapping_rules.json",
  "pipeline_bridge_contract.json",
  "activation_policy.json",
  "source_specific_extraction_mappings.json",
  "connector_operational_policies.json",
  "deferred_activation_contracts.json",
  "federal_access_acquisition_plan.json",
  "source_modernization_plan.json"
];

for (const file of requiredSchemas) {
  assert(fs.existsSync(path.join(layer, "schemas", file)), `Missing schema file: ${file}`);
}

for (const source of [...canonicalLive, ...expansionLive]) {
  assert(source.last_refresh, `${source.source_id} missing last_refresh.`);
  assert(source.synthetic_fillers_allowed === false, `${source.source_id} allows synthetic fillers.`);
  assert(source.inferred_contacts_allowed === false, `${source.source_id} allows inferred contacts.`);
}

console.log("L01_FINAL_BACKBONE_VERIFIER_PASS");
