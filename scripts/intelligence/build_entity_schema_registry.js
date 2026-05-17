const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/entity_schema.registry.json";

const registry = {
  version: "nexus_entity_schema_registry_v1",
  generated_at: new Date().toISOString(),
  rule: "Every intelligence record must resolve to a stable entity before scoring, dossier generation, globe export, or runtime sync.",
  required_fields: [
    "entity_id",
    "entity_type",
    "display_name",
    "canonical_name",
    "city",
    "state",
    "country",
    "source_trace",
    "confidence_score",
    "created_at",
    "updated_at"
  ],
  entity_types: [
    "LAW_ENFORCEMENT_AGENCY",
    "TRAINING_PROVIDER",
    "PUBLIC_SAFETY_ENTITY",
    "GOVERNMENT_OFFICE",
    "PRIVATE_COMPANY",
    "PERSON",
    "LOCATION",
    "EVENT",
    "PROCUREMENT_OPPORTUNITY"
  ],
  blocked_conditions: [
    "missing_entity_id",
    "missing_source_trace",
    "duplicate_entity_without_resolution",
    "unverified_final_identity"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[ENTITY SCHEMA] COMPLETE", registry.required_fields.length);
