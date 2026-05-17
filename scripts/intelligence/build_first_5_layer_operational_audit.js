const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/audit/first_5_layer_operational_audit.json";

const required = [
  "public/data/intelligence/outputs/entity_deduplication_output.json",
  "public/data/intelligence/outputs/unified_entity_intelligence_index.json",
  "public/data/intelligence/outputs/unified_score_aggregation.json",
  "public/data/intelligence/outputs/unified_dossier_synthesis.json",
  "public/data/intelligence/runtime/runtime_entity_cache.json",
  "public/data/intelligence/outputs/L10_outreach_readiness_synthesis.json",
  "public/data/intelligence/outputs/L12_relationship_strength_scoring.json"
];

const missing = required.filter(f => !fs.existsSync(f));

const audit = {
  version: "nexus_first_5_layer_operational_audit_v1",
  generated_at: new Date().toISOString(),
  status: missing.length === 0 ? "PASS" : "REVIEW_REQUIRED",
  required_files: required.length,
  missing_files: missing.length,
  missing
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });

fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));

console.log("[FIRST 5 LAYER OPERATIONAL AUDIT]", audit.status, audit.missing_files);
