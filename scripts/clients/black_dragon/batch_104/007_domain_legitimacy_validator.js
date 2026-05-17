const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const registryPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/registries/import_execution_registry.json"
);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

function getDomain(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

const results = registry.execution_targets.map(row => {
  const domain = row.source_url ? getDomain(row.source_url) : null;
  const hasValidDomain = !!domain && domain.includes(".");

  return {
    execution_id: row.execution_id,
    import_row_id: row.import_row_id,
    source_url: row.source_url,
    domain,
    domain_legitimacy_status:
      hasValidDomain ? "DOMAIN_PARSEABLE" : "FAILED",
    quarantine_required:
      !hasValidDomain,
    reason:
      hasValidDomain
        ? "SOURCE_DOMAIN_PARSEABLE"
        : "MISSING_OR_INVALID_SOURCE_URL"
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/audit/007_domain_legitimacy_validation.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_domain_legitimacy_validator_v1",
  generated_at: new Date().toISOString(),
  total: results.length,
  passed: results.filter(r => !r.quarantine_required).length,
  failed: results.filter(r => r.quarantine_required).length,
  results
}, null, 2));

console.log(JSON.stringify({
  status: "DOMAIN_LEGITIMACY_VALIDATOR_COMPLETE",
  total: results.length,
  passed: results.filter(r => !r.quarantine_required).length,
  failed: results.filter(r => r.quarantine_required).length,
  output: out
}, null, 2));
