const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/dossier_field_schema.registry.json";

const registry = {
  version: "nexus_dossier_field_schema_registry_v1",
  generated_at: new Date().toISOString(),
  rule: "Every dossier field must be traceable to evidence, assigned to a field group, and confidence-scored.",
  required_fields: [
    "entity_id",
    "field_group",
    "field_name",
    "value",
    "source_trace",
    "confidence_score",
    "freshness_score",
    "layer_id",
    "generated_at"
  ],
  field_groups: [
    "identity",
    "authority",
    "training",
    "budget",
    "procurement",
    "risk",
    "geography",
    "command",
    "communication",
    "engagement",
    "recommendation"
  ],
  blocked_conditions: [
    "field_without_source",
    "field_without_entity",
    "unsupported_field_group",
    "unverified_final_recommendation"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[DOSSIER FIELD SCHEMA] COMPLETE", registry.required_fields.length);
