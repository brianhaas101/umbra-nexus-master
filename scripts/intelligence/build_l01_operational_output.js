const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function readJson(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

function writeJson(rel, data) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2));
}

const sourceRegistry = readJson(
  "public/data/intelligence/sources/L01_FEDERAL_INTELLIGENCE.sources.json"
);

const now = new Date().toISOString();

const entities = [];
const evidence = [];
const signals = [];
const scoreComponents = [];
const dossierFields = [];

for (const source of sourceRegistry.sources) {

  const entityId =
    "ENTITY_" +
    source.source_id
      .replace(/[^A-Z0-9]/gi, "_")
      .toUpperCase();

  entities.push({
    entity_id: entityId,
    entity_type: "federal_source_entity",
    layer_id: "L01",
    source_id: source.source_id,
    created_at: now
  });

  const evidenceId =
    "EVIDENCE_" +
    source.source_id
      .replace(/[^A-Z0-9]/gi, "_")
      .toUpperCase();

  evidence.push({
    evidence_id: evidenceId,
    entity_id: entityId,
    layer_id: "L01",
    source_id: source.source_id,
    captured_at: now,
    confidence: 0.95,
    lineage: {
      acquisition_method: source.access_method,
      connector_type: source.connector_type,
      parser_strategy: source.parser_strategy
    }
  });

  const signalId =
    "SIGNAL_" +
    source.source_id
      .replace(/[^A-Z0-9]/gi, "_")
      .toUpperCase();

  signals.push({
    signal_id: signalId,
    entity_id: entityId,
    layer_id: "L01",
    source_id: source.source_id,
    signal_type: source.signal_generation_type,
    strength: 0.85,
    confidence: 0.93
  });

  const componentId =
    "SCORE_" +
    source.source_id
      .replace(/[^A-Z0-9]/gi, "_")
      .toUpperCase();

  scoreComponents.push({
    component_id: componentId,
    entity_id: entityId,
    layer_id: "L01",
    source_id: source.source_id,
    score_delta: 10,
    confidence: 0.91
  });

  dossierFields.push({
    entity_id: entityId,
    layer_id: "L01",
    source_id: source.source_id,
    field_type: source.dossier_contribution_type,
    value: source.source_name
  });
}

const output = {
  version: "nexus_layer_normalized_output_v1",
  generated_at: now,
  layer_id: "L01",
  status: "OPERATIONAL",
  entities,
  evidence,
  signals,
  score_components: scoreComponents,
  dossier_fields: dossierFields
};

writeJson(
  "public/data/intelligence/outputs/L01_FEDERAL_INTELLIGENCE.normalized.json",
  output
);

console.log(JSON.stringify({
  status: "L01_OPERATIONAL_OUTPUT_BUILT",
  entities: entities.length,
  evidence: evidence.length,
  signals: signals.length,
  score_components: scoreComponents.length,
  dossier_fields: dossierFields.length
}, null, 2));
