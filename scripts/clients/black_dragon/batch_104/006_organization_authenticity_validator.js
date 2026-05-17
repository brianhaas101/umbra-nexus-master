const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const registryPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/registries/import_execution_registry.json"
);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const results = registry.execution_targets.map(row => {
  const hasSeed = !!row.organization_seed;
  const hasDiscovered = !!row.discovered_organization_name;

  return {
    execution_id: row.execution_id,
    import_row_id: row.import_row_id,
    organization_seed: row.organization_seed,
    discovered_organization_name: row.discovered_organization_name,
    organization_authenticity_status:
      hasSeed || hasDiscovered ? "REVIEWABLE_ORGANIZATION_SEED" : "FAILED",
    quarantine_required:
      !(hasSeed || hasDiscovered),
    reason:
      hasSeed || hasDiscovered
        ? "ORGANIZATION_REFERENCE_PRESENT"
        : "MISSING_ORGANIZATION_REFERENCE"
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/audit/006_organization_authenticity_validation.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_organization_authenticity_validator_v1",
  generated_at: new Date().toISOString(),
  total: results.length,
  passed: results.filter(r => !r.quarantine_required).length,
  failed: results.filter(r => r.quarantine_required).length,
  results
}, null, 2));

console.log(JSON.stringify({
  status: "ORGANIZATION_AUTHENTICITY_VALIDATOR_COMPLETE",
  total: results.length,
  passed: results.filter(r => !r.quarantine_required).length,
  failed: results.filter(r => r.quarantine_required).length,
  output: out
}, null, 2));
