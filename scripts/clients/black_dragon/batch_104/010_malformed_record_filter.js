const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const registryPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/registries/import_execution_registry.json"
);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const required = [
  "execution_id",
  "import_row_id",
  "discovery_task_id",
  "source_type",
  "organization_seed"
];

const results = registry.execution_targets.map(row => {
  const missing = required.filter(k => !row[k]);

  return {
    execution_id: row.execution_id || null,
    import_row_id: row.import_row_id || null,
    missing_required_fields: missing,
    malformed_status: missing.length ? "MALFORMED" : "STRUCTURALLY_VALID",
    quarantine_required: missing.length > 0,
    reason:
      missing.length
        ? "MISSING_REQUIRED_FIELDS"
        : "REQUIRED_FIELDS_PRESENT"
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/audit/010_malformed_record_filter.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_malformed_record_filter_v1",
  generated_at: new Date().toISOString(),
  required_fields: required,
  total: results.length,
  structurally_valid: results.filter(r => !r.quarantine_required).length,
  malformed: results.filter(r => r.quarantine_required).length,
  results
}, null, 2));

console.log(JSON.stringify({
  status: "MALFORMED_RECORD_FILTER_COMPLETE",
  total: results.length,
  structurally_valid: results.filter(r => !r.quarantine_required).length,
  malformed: results.filter(r => r.quarantine_required).length,
  output: out
}, null, 2));
