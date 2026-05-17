const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/live_ingestion_parser_framework.json";

const framework = {
  version: "nexus_live_ingestion_parser_framework_v1",
  generated_at: new Date().toISOString(),
  rule: "Parsers must output entities, evidence, signals, score_components, and dossier_fields only after validation.",
  parser_contract: {
    input_required: true,
    source_trace_required: true,
    entity_resolution_required: true,
    validation_required: true,
    normalized_output_required: true
  },
  parser_output_shape: {
    entities: [],
    evidence: [],
    signals: [],
    score_components: [],
    dossier_fields: []
  },
  supported_parser_modes: [
    "LOCAL_JSON",
    "MANUAL_VERIFIED_JSON",
    "HTML_STATIC",
    "CSV",
    "API_JSON",
    "RSS_HTML"
  ],
  blocked_conditions: [
    "missing_source_trace",
    "unlinked_entity",
    "unvalidated_contact",
    "unsupported_input_mode",
    "parser_output_schema_mismatch"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(framework, null, 2));

console.log("[LIVE PARSER FRAMEWORK] COMPLETE", framework.supported_parser_modes.length);
