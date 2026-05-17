const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/unified_evidence_ingestion_engine.json";

const engine = {
  version: "nexus_unified_evidence_ingestion_engine_v1",
  generated_at: new Date().toISOString(),
  rule: "Evidence ingestion accepts only parser outputs matching the Nexus evidence schema and linked to stable entities.",
  ingestion_stages: [
    "READ_SOURCE",
    "PARSE_RAW_INPUT",
    "RESOLVE_ENTITY",
    "BUILD_EVIDENCE",
    "BUILD_SIGNAL",
    "BUILD_SCORE_COMPONENT",
    "BUILD_DOSSIER_FIELD",
    "VALIDATE_OUTPUT",
    "WRITE_LAYER_OUTPUT",
    "UPDATE_UNIFIED_FUSION"
  ],
  required_registries: [
    "entity_schema.registry.json",
    "evidence_schema.registry.json",
    "signal_schema.registry.json",
    "dossier_field_schema.registry.json",
    "scoring_component_schema.registry.json"
  ],
  output_root: "public/data/intelligence/outputs",
  status: "ENGINE_DECLARED_IMPLEMENTATION_NEXT"
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(engine, null, 2));

console.log("[EVIDENCE INGESTION ENGINE] COMPLETE", engine.ingestion_stages.length);
