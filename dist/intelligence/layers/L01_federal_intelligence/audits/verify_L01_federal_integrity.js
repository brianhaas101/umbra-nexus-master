import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const layerRoot = path.join(root, "public", "intelligence", "layers", "L01_federal_intelligence");
const sourceRoot = path.join(root, "public", "intelligence", "source_registry", "L01_federal_intelligence");

const lockedFragments = [
  "public/scene.js",
  "public/globe/textures.js",
  "public/globe/layers.js",
  "index.html",
  "public/data/clients/black_dragon",
  "public/globe/clients/black_dragon"
];

function stripBom(text) {
  return text.replace(/^\uFEFF/, "");
}

function readJson(file) {
  const raw = fs.readFileSync(file, "utf8");
  return JSON.parse(stripBom(raw));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertNoBlackDragonReference(value, context) {
  const text = JSON.stringify(value).replaceAll("\\", "/").toLowerCase();

  for (const locked of lockedFragments) {
    assert(
      !text.includes(locked.toLowerCase()),
      `Black Dragon reference found in ${context}: ${locked}`
    );
  }
}

const layerDefinition = readJson(path.join(layerRoot, "layer_definition.json"));
const registry = readJson(path.join(layerRoot, "source_registry.json"));
const scoring = readJson(path.join(layerRoot, "schemas", "scoring_contract.json"));
const dossier = readJson(path.join(layerRoot, "schemas", "dossier_contract.json"));

assert(layerDefinition.layer_id === "L01", "Layer definition must be L01.");
assert(registry.registered_source_count === 15, "L01 must register exactly 15 sources.");
assert(Array.isArray(registry.sources), "Registry sources missing.");
assert(registry.sources.length === 15, "Registry must contain exactly 15 sources.");

for (const source of registry.sources) {

  assert(source.source_id, "Missing source_id.");
  assert(source.canonical_url?.startsWith("https://"), `${source.source_id} invalid canonical_url.`);
  assert(source.parser_script, `${source.source_id} missing parser_script.`);
  assert(source.normalizer_script, `${source.source_id} missing normalizer_script.`);

  assert(Array.isArray(source.entity_targets) && source.entity_targets.length > 0,
    `${source.source_id} missing entity targets.`);

  assert(Array.isArray(source.score_targets) && source.score_targets.length > 0,
    `${source.source_id} missing score targets.`);

  assert(Array.isArray(source.dossier_targets) && source.dossier_targets.length > 0,
    `${source.source_id} missing dossier targets.`);

  assert(source.synthetic_fillers_allowed === false,
    `${source.source_id} permits synthetic fillers.`);

  assert(source.inferred_contacts_allowed === false,
    `${source.source_id} permits inferred contacts.`);

  assert(source.black_dragon_coupling === false,
    `${source.source_id} has Black Dragon coupling.`);

  const sourceFile = path.join(sourceRoot, `${source.source_id}.json`);
  assert(fs.existsSync(sourceFile),
    `${source.source_id} source registry file missing.`);

  const connectorFile = path.join(root, source.parser_script);
  const normalizerFile = path.join(root, source.normalizer_script);

  assert(fs.existsSync(connectorFile),
    `${source.source_id} connector file missing.`);

  assert(fs.existsSync(normalizerFile),
    `${source.source_id} normalizer file missing.`);

  assertNoBlackDragonReference(source, source.source_id);
}

assert(scoring.runtime_promotion_allowed === false,
  "Scoring contract permits runtime promotion.");

assert(scoring.synthetic_score_boost_allowed === false,
  "Scoring contract permits synthetic score boosts.");

assert(dossier.write_policy === "append_only_with_source_trace",
  "Invalid dossier write policy.");

assertNoBlackDragonReference(layerDefinition, "layer_definition");
assertNoBlackDragonReference(registry, "source_registry");
assertNoBlackDragonReference(scoring, "scoring_contract");
assertNoBlackDragonReference(dossier, "dossier_contract");

console.log("L01_FEDERAL_GOVERNANCE_VERIFIER_PASS");
