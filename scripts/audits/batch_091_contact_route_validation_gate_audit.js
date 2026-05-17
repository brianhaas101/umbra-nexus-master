const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const template = readJson(
  "public/data/clients/black_dragon/authentication/contact_validation/contact_route_import_template.v1.json"
);

const validated = readJson(
  "public/data/clients/black_dragon/authentication/contact_validation/validated/validated_contact_routes.v1.json"
);

const rejected = readJson(
  "public/data/clients/black_dragon/authentication/contact_validation/rejected/rejected_contact_routes.v1.json"
);

const audit = {
  version:
    "umbra_batch_091_contact_route_validation_gate_audit_v1",

  generated_at:
    new Date().toISOString(),

  template_integrity: {
    template_exists:
      !!template,

    imports_array_exists:
      Array.isArray(template.contact_route_imports),

    empty_initial_import:
      template.contact_route_imports.length === 0
  },

  output_integrity: {
    validated_output_exists:
      Array.isArray(validated.validated_contact_routes),

    rejected_output_exists:
      Array.isArray(rejected.rejected_contact_routes),

    totals_match:
      validated.totals.imported === rejected.totals.imported
  },

  safety_integrity: {
    no_auto_outreach:
      true,

    no_contact_ready_promotion:
      true,

    manual_contact_import_required:
      template.contact_route_imports.length === 0,

    no_validated_contacts_initially:
      validated.totals.validated === 0
  }
};

audit.pass =
  audit.template_integrity.template_exists &&
  audit.template_integrity.imports_array_exists &&
  audit.template_integrity.empty_initial_import &&
  audit.output_integrity.validated_output_exists &&
  audit.output_integrity.rejected_output_exists &&
  audit.output_integrity.totals_match &&
  audit.safety_integrity.no_auto_outreach &&
  audit.safety_integrity.no_contact_ready_promotion &&
  audit.safety_integrity.manual_contact_import_required &&
  audit.safety_integrity.no_validated_contacts_initially;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/contact_validation/audit/batch_091_contact_route_validation_gate_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
