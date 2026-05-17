const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/L02_state_normalization.registry.json";

const registry = {
  version: "nexus_L02_state_normalization_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L02_STATE_INTELLIGENCE",
  normalization_rules: {
    state_code_required: true,
    source_trace_required: true,
    agency_resolution_required: true,
    jurisdiction_required: true,
    date_observed_required: true,
    cross_state_comparison_supported: true
  },
  normalized_fields: [
    "state",
    "agency_name",
    "agency_type",
    "program_name",
    "activity_type",
    "activity_date",
    "regulatory_relevance",
    "training_relevance",
    "procurement_relevance",
    "budget_relevance",
    "regional_cluster",
    "source_category",
    "confidence_score",
    "freshness_score",
    "authority_level"
  ],
  blocked_conditions: [
    "missing_state_code",
    "missing_source_trace",
    "unresolved_agency",
    "unsupported_activity_type",
    "invalid_jurisdiction"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L02 NORMALIZATION REGISTRY] COMPLETE", registry.normalized_fields.length);
