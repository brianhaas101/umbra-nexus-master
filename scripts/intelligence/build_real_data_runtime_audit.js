const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/audit/real_data_runtime_audit.json";

const required = [
  "public/data/intelligence/runtime/connector_implementation_priority.registry.json",
  "public/data/intelligence/runtime/first_live_source_activation_set.json",
  "public/data/intelligence/runtime/live_ingestion_parser_framework.json",
  "public/data/intelligence/runtime/unified_evidence_ingestion_engine.json"
];

const missing = required.filter(f => !fs.existsSync(f));

const audit = {
  version: "nexus_real_data_runtime_audit_v1",
  generated_at: new Date().toISOString(),
  status: missing.length === 0 ? "PASS" : "REVIEW_REQUIRED",
  required_files: required.length,
  missing_files: missing.length,
  missing,
  note: "PASS confirms real-data ingestion framework exists. It does not mean external live connectors are pulling yet."
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));

console.log("[REAL DATA RUNTIME AUDIT]", audit.status, audit.missing_files);
