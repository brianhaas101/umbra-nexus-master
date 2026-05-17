import fs from "node:fs";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const l01 = path.join(root, "public", "intelligence", "layers", "L01_federal_intelligence");
const l02 = path.join(root, "public", "intelligence", "layers", "L02_state_intelligence");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

assert(fs.existsSync(l02), "L02 directory missing.");
assert(fs.existsSync(path.join(l02, "layer_definition.json")), "L02 layer definition missing.");
assert(fs.existsSync(path.join(l02, "source_registry.json")), "L02 source registry missing.");
assert(fs.existsSync(path.join(l02, "schemas", "runtime_contract.json")), "L02 runtime contract missing.");
assert(fs.existsSync(path.join(l02, "runtime")), "L02 runtime directory missing.");
assert(fs.existsSync(path.join(l02, "connectors")), "L02 connectors directory missing.");
assert(fs.existsSync(path.join(l02, "normalizers")), "L02 normalizers directory missing.");
assert(fs.existsSync(path.join(l02, "freeze")), "L02 freeze directory missing.");

const layer = readJson(path.join(l02, "layer_definition.json"));
const runtime = readJson(path.join(l02, "schemas", "runtime_contract.json"));

assert(layer.layer_id === "L02", "Bad L02 layer_id.");
assert(layer.depends_on.includes("L01"), "L02 must depend on L01.");
assert(layer.rules.no_l01_mutation === true, "L01 mutation guard missing.");
assert(layer.rules.no_client_path_mutation === true, "Client path guard missing.");
assert(runtime.rules.l01_is_read_only === true, "Runtime must treat L01 as read-only.");

assert(fs.existsSync(path.join(l01, "freeze", "L01_post_hardening_freeze_manifest.json")), "Locked L01 freeze manifest missing.");

console.log("L02_SCAFFOLD_VERIFIER_PASS");
