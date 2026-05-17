const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const registryPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/registries/import_execution_registry.json"
);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

function looksLikeEmail(v) {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function looksLikePhone(v) {
  return typeof v === "string" && /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(v);
}

const results = registry.execution_targets.map(row => {
  const route = row.contact_route || "";
  const hasPublicContact =
    looksLikeEmail(route) ||
    looksLikePhone(route) ||
    !!row.contact_person_or_role;

  return {
    execution_id: row.execution_id,
    import_row_id: row.import_row_id,
    contact_route: row.contact_route,
    contact_route_type: row.contact_route_type,
    contact_person_or_role: row.contact_person_or_role,
    public_contact_status:
      hasPublicContact ? "CONTACT_ROUTE_REVIEWABLE" : "FAILED",
    quarantine_required:
      !hasPublicContact,
    reason:
      hasPublicContact
        ? "PUBLIC_CONTACT_ROUTE_PRESENT"
        : "NO_PUBLIC_CONTACT_ROUTE_PRESENT"
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/audit/008_public_contact_validation.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_public_contact_validator_v1",
  generated_at: new Date().toISOString(),
  total: results.length,
  passed: results.filter(r => !r.quarantine_required).length,
  failed: results.filter(r => r.quarantine_required).length,
  results
}, null, 2));

console.log(JSON.stringify({
  status: "PUBLIC_CONTACT_VALIDATOR_COMPLETE",
  total: results.length,
  passed: results.filter(r => !r.quarantine_required).length,
  failed: results.filter(r => r.quarantine_required).length,
  output: out
}, null, 2));
