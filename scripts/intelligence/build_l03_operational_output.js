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

const registry = readJson("public/data/intelligence/sources/L03_LOCAL_OPERATIONAL_INTELLIGENCE.sources.json");
const now = new Date().toISOString();

const entities = [];
const evidence = [];
const signals = [];
const score_components = [];
const dossier_fields = [];

for (const source of registry.sources) {
  const safe = source.source_id.replace(/[^A-Z0-9]/gi, "_").toUpperCase();
  const entity_id = `ENTITY_${safe}`;

  entities.push({
    entity_id,
    entity_type: "local_operational_source_entity",
    layer_id: "L03",
    source_id: source.source_id,
    created_at: now
  });

  evidence.push({
    evidence_id: `EVIDENCE_${safe}`,
    entity_id,
    layer_id: "L03",
    source_id: source.source_id,
    captured_at: now,
    confidence: source.authority_score,
    lineage: {
      acquisition_method: source.acquisition_type,
      connector_type: source.connector_type,
      parser_strategy: source.parser_strategy,
      normalizer_strategy: source.normalizer_strategy,
      retention_policy: source.evidence_retention_policy
    }
  });

  signals.push({
    signal_id: `SIGNAL_${safe}`,
    entity_id,
    layer_id: "L03",
    source_id: source.source_id,
    signal_type: source.signal_generation_type,
    strength: Math.min(0.95, source.authority_score),
    confidence: Math.min(0.94, source.authority_score)
  });

  score_components.push({
    component_id: `SCORE_${safe}`,
    entity_id,
    layer_id: "L03",
    source_id: source.source_id,
    score_delta: Math.round(source.authority_score * 10),
    confidence: Math.min(0.93, source.authority_score)
  });

  dossier_fields.push({
    entity_id,
    layer_id: "L03",
    source_id: source.source_id,
    field_type: source.dossier_contribution_type,
    value: source.name
  });
}

writeJson("public/data/intelligence/outputs/L03_LOCAL_OPERATIONAL_INTELLIGENCE.normalized.json", {
  version: "nexus_layer_normalized_output_v1",
  generated_at: now,
  layer_id: "L03",
  status: "OPERATIONAL",
  entities,
  evidence,
  signals,
  score_components,
  dossier_fields
});

console.log(JSON.stringify({
  status: "L03_OPERATIONAL_OUTPUT_BUILT",
  entities: entities.length,
  evidence: evidence.length,
  signals: signals.length,
  score_components: score_components.length,
  dossier_fields: dossier_fields.length
}, null, 2));
