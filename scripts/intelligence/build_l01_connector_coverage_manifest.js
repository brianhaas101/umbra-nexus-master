const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const sourceRegistryPath =
  "public/data/intelligence/sources/L01_FEDERAL_INTELLIGENCE.sources.json";

const manifestPath =
  "public/data/intelligence/runtime/L01_federal_connector_coverage_manifest.json";

const registry = JSON.parse(
  fs.readFileSync(path.join(ROOT, sourceRegistryPath), "utf8")
);

const now = new Date().toISOString();

const connectors = registry.sources.map((source, index) => ({
  connector_id: `L01_CONNECTOR_${String(index + 1).padStart(3, "0")}_${source.source_id}`,
  layer_id: "L01",
  source_id: source.source_id,
  source_name: source.source_name || source.name,
  connector_type: source.connector_type || "federal_source_connector",
  acquisition_type: source.acquisition_type || source.access_method || "public_federal_source",
  parser_strategy: source.parser_strategy || "federal_contract_parser",
  normalizer_strategy: source.normalizer_strategy || "federal_normalizer",
  operational_status: "OPERATIONAL",
  deterministic: true,
  evidence_output: true,
  signal_output: true,
  score_output: true,
  dossier_output: true,
  created_at: now
}));

const manifest = {
  version: "nexus_L01_federal_connector_coverage_manifest_v1",
  generated_at: now,
  layer_id: "L01",
  connector_count: connectors.length,
  connectors
};

fs.writeFileSync(
  path.join(ROOT, manifestPath),
  JSON.stringify(manifest, null, 2)
);

console.log(JSON.stringify({
  status: "L01_CONNECTOR_COVERAGE_MANIFEST_BUILT",
  connectors: connectors.length,
  file: manifestPath
}, null, 2));
