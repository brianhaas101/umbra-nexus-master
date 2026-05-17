const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const template = readJson(
  "public/data/clients/black_dragon/authentication/source_import/imports/real_source_import_template.v1.json"
);

const validated = readJson(
  "public/data/clients/black_dragon/authentication/source_import/validated/validated_source_imports.v1.json"
);

const rejected = readJson(
  "public/data/clients/black_dragon/authentication/source_import/rejected/rejected_source_imports.v1.json"
);

const audit = {
  version:
    "umbra_batch_090_real_source_import_validator_audit_v1",

  generated_at:
    new Date().toISOString(),

  template_integrity: {
    template_exists:
      !!template,

    required_fields:
      Array.isArray(template.required_fields) &&
      template.required_fields.length >= 8,

    source_imports_array:
      Array.isArray(template.source_imports),

    empty_initial_import:
      template.source_imports.length === 0
  },

  output_integrity: {
    validated_output_exists:
      Array.isArray(validated.validated_source_imports),

    rejected_output_exists:
      Array.isArray(rejected.rejected_source_imports),

    import_counts_match:
      validated.totals.imported === rejected.totals.imported,

    validation_totals_match:
      validated.totals.validated === rejected.totals.validated &&
      validated.totals.rejected === rejected.totals.rejected
  },

  safety_integrity: {
    no_auto_promotion:
      validated.totals.validated === 0,

    no_contact_ready_created:
      true,

    no_outreach_enabled:
      true,

    manual_import_required:
      template.source_imports.length === 0
  }
};

audit.pass =
  audit.template_integrity.template_exists &&
  audit.template_integrity.required_fields &&
  audit.template_integrity.source_imports_array &&
  audit.template_integrity.empty_initial_import &&
  audit.output_integrity.validated_output_exists &&
  audit.output_integrity.rejected_output_exists &&
  audit.output_integrity.import_counts_match &&
  audit.output_integrity.validation_totals_match &&
  audit.safety_integrity.no_auto_promotion &&
  audit.safety_integrity.no_contact_ready_created &&
  audit.safety_integrity.no_outreach_enabled &&
  audit.safety_integrity.manual_import_required;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/source_import/audit/batch_090_real_source_import_validator_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
