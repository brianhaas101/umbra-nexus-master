const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/audit/full_system_intelligence_audit.json";

const required = [
  "public/data/intelligence/runtime/master_layer_registry.json",
  "public/data/intelligence/runtime/unified_adapter_orchestration.registry.json",
  "public/data/intelligence/runtime/live_ingestion_execution_queue.json",
  "public/data/intelligence/runtime/cross_layer_dependency_graph.json"
];

const missing = required.filter(f => !fs.existsSync(f));

const audit = {
  version: "nexus_full_system_intelligence_audit_v1",
  generated_at: new Date().toISOString(),
  status: missing.length === 0 ? "PASS" : "REVIEW_REQUIRED",
  required_files: required.length,
  missing_files: missing.length,
  missing
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));
console.log("[FULL SYSTEM INTELLIGENCE AUDIT]", audit.status, audit.missing_files);
