const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(rel, data) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), "utf8");
}

const registry = readJson("public/data/intelligence/sources/L09_CONTACT_DECISION_MAKER_INTELLIGENCE.sources.json");
const now = new Date().toISOString();

const connectors = registry.sources.map((source, index) => ({
  connector_id: `L09_CONNECTOR_${String(index + 1).padStart(3, "0")}_${source.source_id}`,
  layer_id: "L09",
  source_id: source.source_id,
  source_name: source.name,
  connector_type: source.connector_type,
  acquisition_type: source.acquisition_type,
  parser_strategy: source.parser_strategy,
  normalizer_strategy: source.normalizer_strategy,
  operational_status: "OPERATIONAL",
  deterministic: true,
  evidence_output: true,
  signal_output: true,
  score_output: true,
  dossier_output: true,
  created_at: now
}));

writeJson("public/data/intelligence/runtime/L09_contact_connector_coverage_manifest.json", {
  version: "nexus_L09_contact_connector_coverage_manifest_v1",
  generated_at: now,
  layer_id: "L09",
  connector_count: connectors.length,
  connectors
});

console.log(JSON.stringify({
  status: "L09_CONNECTOR_COVERAGE_MANIFEST_BUILT",
  connectors: connectors.length,
  file: "public/data/intelligence/runtime/L09_contact_connector_coverage_manifest.json"
}, null, 2));
