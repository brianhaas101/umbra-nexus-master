import fs from "node:fs";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const layer = path.join(root, "public", "intelligence", "layers", "L01_federal_intelligence");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const registry = readJson(path.join(layer, "source_registry.json"));
const deferred = readJson(path.join(layer, "schemas", "deferred_activation_contracts.json"));

assert(registry.sources.length === 15, "Registry must contain 15 sources.");
assert(deferred.verified_live_sources === 9, "Deferred contract must show 9 live verified sources.");
assert(deferred.deferred_sources.length === 6, "Deferred contract must show 6 deferred sources.");
assert(deferred.completion_policy.layer_can_complete_with_deferred_sources === true, "Completion policy missing.");

const live = registry.sources.filter(s =>
  s.connector_active === true &&
  s.normalizer_active === true &&
  String(s.status || "").includes("verified")
);

const deferredIds = new Set(deferred.deferred_sources.map(s => s.source_id));

const deferredLocked = registry.sources.filter(s =>
  deferredIds.has(s.source_id) &&
  s.connector_active === false &&
  s.normalizer_active === false
);

assert(live.length === 9, `Expected 9 live verified sources. Found ${live.length}.`);
assert(deferredLocked.length === 6, `Expected 6 deferred locked sources. Found ${deferredLocked.length}.`);

const accounted = live.length + deferredLocked.length;
assert(accounted === 15, `Expected 15 accounted sources. Found ${accounted}.`);

assert(fs.existsSync(path.join(layer, "runtime", "l01_promotion_gate.js")), "Promotion gate missing.");
assert(fs.existsSync(path.join(layer, "schemas", "source_acquisition_resolver.json")), "Source acquisition resolver missing.");
assert(fs.existsSync(path.join(layer, "schemas", "deferred_activation_contracts.json")), "Deferred activation contract missing.");

for (const source of live) {
  assert(source.last_refresh, `${source.source_id} missing last_refresh.`);
}

for (const source of deferredLocked) {
  assert(source.last_refresh === null || source.last_refresh === undefined || source.last_refresh === "", `${source.source_id} deferred source has refresh timestamp.`);
}

console.log("L01_COMPLETION_VERIFIER_PASS");
