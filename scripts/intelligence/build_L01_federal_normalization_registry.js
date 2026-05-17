const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/L01_federal_normalization.registry.json";

const registry = {
  version: "nexus_L01_federal_normalization_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L01_FEDERAL_INTELLIGENCE",
  normalization_rules: {
    federal_source_id_required: true,
    agency_or_program_required: true,
    jurisdiction_required: true,
    source_trace_required: true,
    date_observed_required: true,
    entity_linking_required: true
  },
  normalized_fields: [
    "federal_source",
    "federal_agency",
    "program_name",
    "case_or_award_id",
    "jurisdiction",
    "state",
    "county",
    "city",
    "related_entity",
    "signal_type",
    "signal_value",
    "federal_relevance",
    "source_category",
    "confidence_score",
    "freshness_score"
  ],
  blocked_conditions: [
    "missing_federal_source",
    "missing_source_trace",
    "unlinked_entity",
    "unsupported_federal_signal",
    "unresolved_jurisdiction"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L01 NORMALIZATION REGISTRY] COMPLETE", registry.normalized_fields.length);
