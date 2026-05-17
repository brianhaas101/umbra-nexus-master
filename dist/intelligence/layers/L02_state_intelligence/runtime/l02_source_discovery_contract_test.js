import fs from "node:fs";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const l02 = path.join(root, "public", "intelligence", "layers", "L02_state_intelligence");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const registry = readJson(path.join(l02, "source_registry.json"));
const contract = readJson(path.join(l02, "schemas", "source_discovery_contract.json"));
const stateModel = readJson(path.join(l02, "schemas", "state_entity_model.json"));

assert(registry.source_count === 3, "Expected 3 registered L02 sources.");
assert(contract.batch_size === 3, "Batch size must be 3.");
assert(contract.discovery_rules.live_activation_allowed === false, "Discovery must not activate live sources.");
assert(contract.discovery_rules.no_l01_mutation === true, "L01 mutation guard missing.");
assert(contract.discovery_rules.state_local_provenance_required === true, "State provenance guard missing.");
assert(stateModel.rules.federal_bridge_compatible === true, "Federal bridge compatibility missing.");
assert(stateModel.rules.synthetic_fillers_allowed === false, "Synthetic filler guard missing.");

console.log("L02_SOURCE_DISCOVERY_CONTRACT_PASS");
