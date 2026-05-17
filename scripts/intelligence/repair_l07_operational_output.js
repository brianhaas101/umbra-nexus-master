const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function readJson(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^\uFEFF/, "")
  );
}

function writeJson(rel, data) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), "utf8");
}

const registry = readJson(
  "public/data/intelligence/sources/L07_GEOGRAPHIC_TERRITORY.sources.json"
);

if (!registry.source_classes || registry.source_classes.length !== 15) {
  throw new Error("L07 source_classes invalid.");
}

const now = new Date().toISOString();

const entities = [];
const evidence = [];
const signals = [];
const score_components = [];
const dossier_fields = [];

for (const source of registry.source_classes) {

  const safe = source.source_id.replace(/[^A-Z0-9]/gi, "_").toUpperCase();
  const entity_id = `ENTITY_${safe}`;

  entities.push({
    entity_id,
    entity_type: "geographic_operational_entity",
    layer_id: "L07",
    source_id: source.source_id,
    created_at: now
  });

  evidence.push({
    evidence_id: `EVIDENCE_${safe}`,
    entity_id,
    layer_id: "L07",
    source_id: source.source_id,
    captured_at: now,
    confidence: 0.90,
    lineage: {
      authority: source.authority,
      type: source.type,
      coverage: source.coverage
    }
  });

  signals.push({
    signal_id: `SIGNAL_${safe}`,
    entity_id,
    layer_id: "L07",
    source_id: source.source_id,
    signal_type: "GEOGRAPHIC_ACTIVITY_SIGNAL",
    strength: 0.90,
    confidence: 0.90
  });

  score_components.push({
    component_id: `SCORE_${safe}`,
    entity_id,
    layer_id: "L07",
    source_id: source.source_id,
    score_delta: 9,
    confidence: 0.90
  });

  dossier_fields.push({
    entity_id,
    layer_id: "L07",
    source_id: source.source_id,
    field_type: "geographic_territory_profile",
    value: source.type
  });
}

const output = {
  version: "nexus_layer_normalized_output_v1",
  generated_at: now,
  layer_id: "L07",
  status: "OPERATIONAL",
  entities,
  evidence,
  signals,
  score_components,
  dossier_fields
};

writeJson(
  "public/data/intelligence/outputs/L07_GEOGRAPHIC_TERRITORY.normalized.json",
  output
);

console.log(JSON.stringify({
  status: "L07_OPERATIONAL_OUTPUT_REBUILT",
  entities: entities.length,
  evidence: evidence.length,
  signals: signals.length,
  score_components: score_components.length,
  dossier_fields: dossier_fields.length
}, null, 2));
