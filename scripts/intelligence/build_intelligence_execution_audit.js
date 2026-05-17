const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/audit/intelligence_execution_audit.json";

const required = [
  "public/data/intelligence/runtime/intelligence_master_runner.json",
  "public/data/intelligence/runtime/layer_output_manifest.json",
  "public/data/intelligence/outputs/unified_normalized_output_shell.json",
  "public/data/intelligence/runtime/runtime_handoff_manifest.json"
];

const missing = required.filter(f => !fs.existsSync(f));

const audit = {
  version: "nexus_intelligence_execution_audit_v1",
  generated_at: new Date().toISOString(),
  status: missing.length === 0 ? "PASS" : "REVIEW_REQUIRED",
  required_files: required.length,
  missing_files: missing.length,
  missing
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));

console.log("[INTELLIGENCE EXECUTION AUDIT]", audit.status, audit.missing_files);
