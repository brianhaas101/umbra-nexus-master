const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const template = readJson(
  "public/data/clients/black_dragon/real_contact_expansion/imports/real_contact_expansion_import_template.v1.json"
);

const staged = readJson(
  "public/data/clients/black_dragon/real_contact_expansion/staged/staged_real_contacts.v1.json"
);

const map = readJson(
  "public/data/clients/black_dragon/real_contact_expansion/map/real_contact_expansion_city_map_nodes.v1.json"
);

const audit = {
  version: "umbra_batch_101_real_contact_expansion_intake_audit_v1",
  generated_at: new Date().toISOString(),

  template_integrity: {
    imports_array_exists: Array.isArray(template.real_contact_imports),
    forbidden_rules_present: Array.isArray(template.forbidden) && template.forbidden.length >= 6,
    required_fields_present: Array.isArray(template.required_fields) && template.required_fields.length >= 10
  },

  intake_integrity: {
    imported: staged.totals.imported,
    staged: staged.totals.staged,
    rejected: staged.totals.rejected,
    counts_match: staged.totals.imported === staged.totals.staged + staged.totals.rejected
  },

  map_integrity: {
    map_nodes: map.totals.map_nodes,
    map_matches_staged: map.totals.map_nodes === staged.totals.staged,
    all_nodes_city_visible: (map.nodes || []).every(x =>
      x.render.visible_in_world === true &&
      x.render.visible_in_city_map === true &&
      x.render.pickable === true
    )
  },

  safety_integrity: {
    contact_ready_zero: staged.totals.contact_ready === 0 && map.totals.contact_ready === 0,
    outreach_allowed_zero: staged.totals.outreach_allowed === 0 && map.totals.outreach_allowed === 0,
    no_auto_promotion: true
  }
};

audit.pass =
  audit.template_integrity.imports_array_exists &&
  audit.template_integrity.forbidden_rules_present &&
  audit.template_integrity.required_fields_present &&
  audit.intake_integrity.counts_match &&
  audit.map_integrity.map_matches_staged &&
  audit.map_integrity.all_nodes_city_visible &&
  audit.safety_integrity.contact_ready_zero &&
  audit.safety_integrity.outreach_allowed_zero &&
  audit.safety_integrity.no_auto_promotion;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/real_contact_expansion/audit/batch_101_real_contact_expansion_intake_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
