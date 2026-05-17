const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/authority/source_validation_engine.registry.json";

const registry = {
  version: "nexus_source_validation_engine_v1",
  generated_at: new Date().toISOString(),
  validation_rules: {
    official_source_priority_required: true,
    guessed_data_disallowed: true,
    orphaned_records_disallowed: true,
    unsupported_formats_rejected: true,
    invalid_entity_links_rejected: true
  },
  validation_pipeline: [
    "SOURCE_EXISTS",
    "SOURCE_REACHABLE",
    "FORMAT_VALID",
    "ENTITY_RESOLUTION_VALID",
    "NORMALIZATION_VALID",
    "EVIDENCE_CHAIN_VALID",
    "RUNTIME_COMPATIBLE",
    "AUDIT_LOGGED"
  ],
  authority_thresholds: {
    minimum_authority_score: 0.7,
    minimum_confidence_score: 0.75,
    minimum_freshness_score: 0.6
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[SOURCE VALIDATION ENGINE] COMPLETE");
