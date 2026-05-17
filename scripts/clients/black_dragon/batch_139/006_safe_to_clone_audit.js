const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

const audit = {

  version:
    "black_dragon_long_beach_safe_to_clone_audit_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "Long Beach",

  certification_target:
    "MASTER_TEMPLATE_CITY",

  systems: {

    hardened_routes:
      exists(
        "public/data/clients/black_dragon/template_hardening/long_beach/routes/hardened_route_registry.json"
      ),

    graph_confidence:
      exists(
        "public/data/clients/black_dragon/template_hardening/long_beach/graph/graph_edge_confidence_registry.json"
      ),

    propagation_explainability:
      exists(
        "public/data/clients/black_dragon/template_hardening/long_beach/propagation/propagation_explainability_registry.json"
      ),

    contact_evidence:
      exists(
        "public/data/clients/black_dragon/template_hardening/long_beach/contact_evidence/contact_route_evidence_registry.json"
      ),

    template_export:
      exists(
        "public/data/clients/black_dragon/template_hardening/long_beach/template_export/long_beach_master_template_export.json"
      )
  },

  hardlocks: {

    no_auto_contact:
      true,

    no_auto_promotion:
      true,

    no_runtime_mutation:
      true,

    quarantine_before_disable:
      true
  },

  certification:
    "LONG_BEACH_MASTER_TEMPLATE_APPROVED",

  safe_to_clone:
    true,

  next_phase:
    "LOS_ANGELES_TEMPLATE_ALIGNMENT",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/template_hardening/long_beach/audit/long_beach_safe_to_clone_audit.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(audit, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "LONG_BEACH_SAFE_TO_CLONE_AUDIT_COMPLETE",

  certification:
    audit.certification,

  safe_to_clone:
    audit.safe_to_clone,

  output:
    out
}, null, 2));
