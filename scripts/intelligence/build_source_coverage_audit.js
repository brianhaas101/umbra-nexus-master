const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/audit/source_coverage_audit.json";

const required = [
  "public/data/intelligence/sources/layer_source_catalog_index.json",
  "public/data/intelligence/sources/national_source_coverage_matrix.json",
  "public/data/intelligence/sources/source_gap_analysis.json",
  "public/data/intelligence/runtime/intelligence_priority_build_queue.json"
];

const missing = required.filter(f => !fs.existsSync(f));

const audit = {
  version: "nexus_source_coverage_audit_v1",
  generated_at: new Date().toISOString(),
  status: missing.length === 0 ? "PASS" : "REVIEW_REQUIRED",
  required_files: required.length,
  missing_files: missing.length,
  missing
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));

console.log("[SOURCE COVERAGE AUDIT]", audit.status, audit.missing_files);
