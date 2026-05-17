const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const registryPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/registries/import_execution_registry.json"
);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const seen = new Set();

const results = registry.execution_targets.map(row => {
  const key = [
    row.source_url || "NO_URL",
    row.organization_seed || row.discovered_organization_name || "NO_ORG",
    row.contact_route || "NO_CONTACT"
  ].join("::").toLowerCase();

  const duplicate = seen.has(key);
  seen.add(key);

  return {
    execution_id: row.execution_id,
    import_row_id: row.import_row_id,
    duplicate_key: key,
    duplicate_status: duplicate ? "DUPLICATE" : "UNIQUE",
    quarantine_required: duplicate,
    reason: duplicate ? "DUPLICATE_IMPORT_RECORD" : "UNIQUE_IMPORT_RECORD"
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/audit/009_duplicate_contact_detection.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_duplicate_contact_detector_v1",
  generated_at: new Date().toISOString(),
  total: results.length,
  unique: results.filter(r => !r.quarantine_required).length,
  duplicates: results.filter(r => r.quarantine_required).length,
  results
}, null, 2));

console.log(JSON.stringify({
  status: "DUPLICATE_CONTACT_DETECTOR_COMPLETE",
  total: results.length,
  unique: results.filter(r => !r.quarantine_required).length,
  duplicates: results.filter(r => r.quarantine_required).length,
  output: out
}, null, 2));
