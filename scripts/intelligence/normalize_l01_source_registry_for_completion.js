const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SOURCE_FILE = "public/data/intelligence/sources/L01_FEDERAL_INTELLIGENCE.sources.json";

const abs = path.join(ROOT, SOURCE_FILE);
const registry = JSON.parse(fs.readFileSync(abs, "utf8"));

if (!Array.isArray(registry.sources)) {
  throw new Error("L01 source registry missing sources array.");
}

registry.sources = registry.sources.map((source, index) => {
  return {
    ...source,
    layer_id: "L01",
    name: source.name || source.source_name || source.source_id,
    authority_score: source.authority_score ?? 0.95,
    acquisition_type: source.acquisition_type || source.access_method || "public_federal_source",
    cadence: source.cadence || source.update_frequency || "scheduled",
    operational_status: source.operational_status || (source.production_ready ? "OPERATIONAL" : "PLANNED"),
    evidence_retention_policy: source.evidence_retention_policy || "retain_with_federal_trace",
    registry_index: index + 1
  };
});

registry.layer_id = "L01";
registry.normalized_for_completion_audit = true;
registry.normalized_at = new Date().toISOString();

fs.writeFileSync(abs, JSON.stringify(registry, null, 2));

console.log(JSON.stringify({
  status: "L01_SOURCE_REGISTRY_NORMALIZED",
  sources: registry.sources.length,
  file: SOURCE_FILE
}, null, 2));
