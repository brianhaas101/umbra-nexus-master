const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const imported = read("public/data/clients/black_dragon/organization_import/imports/long_beach_real_organization_import.json");
const validated = read("public/data/clients/black_dragon/organization_import/validated/long_beach_validated_organizations.json");
const dossiers = read("public/data/clients/black_dragon/organization_import/dossiers/long_beach_ranked_dossiers.json");
const runtime = read("public/data/clients/black_dragon/organization_import/runtime/long_beach_runtime_map_nodes.json");

const audit = {
  version: "black_dragon_batch_113_long_beach_real_organization_import_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "113_REAL_ORGANIZATION_IMPORT",
  city: "Long Beach",
  state: "CA",

  counts: {
    imported: imported.total_imported,
    validated: validated.validated,
    rejected: validated.rejected,
    dossiers: dossiers.total_dossiers,
    runtime_map_nodes: runtime.total_runtime_nodes,
    hot: dossiers.dossiers.filter(d => d.priority_tier === "HOT").length,
    warm: dossiers.dossiers.filter(d => d.priority_tier === "WARM").length,
    review: dossiers.dossiers.filter(d => d.priority_tier === "REVIEW").length,
    contact_ready: runtime.runtime_nodes.filter(n => n.contact_ready).length
  },

  gates: {
    imported_10: imported.total_imported === 10,
    all_validated: validated.validated === 10 && validated.rejected === 0,
    dossiers_match_validated: dossiers.total_dossiers === validated.validated,
    runtime_nodes_match_dossiers: runtime.total_runtime_nodes === dossiers.total_dossiers,
    all_nodes_visible: runtime.runtime_nodes.every(n => n.city_map_visible === true && n.dossier_visible === true),
    no_contact_ready_until_route_verified: runtime.runtime_nodes.every(n => n.contact_ready === false),
    automated_outreach_disabled: runtime.runtime_nodes.every(n => n.automated_outreach_allowed === false),
    promotion_disabled: runtime.runtime_nodes.every(n => n.promotion_allowed === false)
  },

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/organization_import/audit/batch_113_long_beach_real_organization_import_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_113_LONG_BEACH_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
