const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/L03_local_agency_normalization.registry.json";

const registry = {
  version: "nexus_L03_local_agency_normalization_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L03_LOCAL_AGENCY_INTELLIGENCE",
  normalization_rules: {
    agency_name_required: true,
    city_or_county_required: true,
    jurisdiction_required: true,
    source_trace_required: true,
    entity_linking_required: true,
    duplicate_resolution_required: true
  },
  normalized_fields: [
    "agency_name",
    "agency_type",
    "state",
    "county",
    "city",
    "jurisdiction",
    "operational_scope",
    "staffing_signal",
    "budget_signal",
    "training_signal",
    "procurement_signal",
    "incident_signal",
    "community_pressure",
    "source_category",
    "confidence_score",
    "freshness_score"
  ],
  blocked_conditions: [
    "missing_agency_name",
    "missing_jurisdiction",
    "missing_source_trace",
    "duplicate_unresolved_entity",
    "unsupported_agency_type"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L03 NORMALIZATION REGISTRY] COMPLETE", registry.normalized_fields.length);
