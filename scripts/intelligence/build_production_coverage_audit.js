const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/audit/production_coverage_audit.json";

const required = [
  "public/data/intelligence/runtime/production_layer_status.registry.json",
  "public/data/intelligence/sources/national_source_coverage_matrix.json",
  "public/data/intelligence/sources/source_gap_analysis.json",
  "public/data/intelligence/runtime/intelligence_priority_build_queue.json"
];

const missing = required.filter(f => !fs.existsSync(f));

const gap = fs.existsSync(required[2])
  ? JSON.parse(fs.readFileSync(required[2], "utf8"))
  : { high_severity: null, medium_severity: null, low_severity: null };

const audit = {
  version: "nexus_production_coverage_audit_v1",
  generated_at: new Date().toISOString(),
  status: missing.length === 0 && gap.high_severity === 0 ? "PASS" : "REVIEW_REQUIRED",
  required_files: required.length,
  missing_files: missing.length,
  missing,
  high_severity_remaining: gap.high_severity,
  medium_severity_remaining: gap.medium_severity,
  low_severity_layers: gap.low_severity
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));

console.log("[PRODUCTION COVERAGE AUDIT]", audit.status, "high:", audit.high_severity_remaining);
