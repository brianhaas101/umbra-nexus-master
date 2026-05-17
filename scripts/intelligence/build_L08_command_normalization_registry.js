const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/L08_command_normalization.registry.json";

const registry = {
  version: "nexus_L08_command_normalization_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L08_COMMAND_STRUCTURE",
  normalization_rules: {
    person_entity_resolution_required: true,
    role_title_required: true,
    department_or_division_required: true,
    authority_path_required: true,
    source_trace_required: true,
    date_observed_required: true
  },
  normalized_fields: [
    "person_name",
    "title",
    "rank",
    "department",
    "division",
    "authority_type",
    "decision_role",
    "training_authority",
    "procurement_influence",
    "command_level",
    "reports_to",
    "source_category",
    "confidence_score"
  ],
  blocked_conditions: [
    "missing_person_or_role",
    "missing_source_trace",
    "unverified_command_claim",
    "unsupported_authority_type",
    "stale_leadership_record_without_date"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L08 NORMALIZATION REGISTRY] COMPLETE", registry.normalized_fields.length);
