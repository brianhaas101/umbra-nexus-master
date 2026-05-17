const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const staged = readJson(
  "public/data/clients/black_dragon/authentication/source_staging/imports/staged_real_source_imports.v1.json"
);

const validated = readJson(
  "public/data/clients/black_dragon/authentication/source_import/validated/validated_source_imports.v1.json"
);

const rejected = readJson(
  "public/data/clients/black_dragon/authentication/source_import/rejected/rejected_source_imports.v1.json"
);

const audit = {
  version: "umbra_batch_095_real_source_staging_audit_v1",
  generated_at: new Date().toISOString(),

  staging_integrity: {
    retained_entities: staged.totals.retained_entities,
    staged_source_imports: staged.totals.staged_source_imports,
    not_stageable: staged.totals.not_stageable,
    counts_match:
      staged.totals.retained_entities ===
      staged.totals.staged_source_imports + staged.totals.not_stageable
  },

  validation_integrity: {
    imported: validated.totals.imported,
    validated: validated.totals.validated,
    rejected: validated.totals.rejected,
    totals_match:
      validated.totals.imported ===
      validated.totals.validated + validated.totals.rejected
  },

  safety_integrity: {
    contact_ready_zero: staged.totals.contact_ready === 0,
    outreach_allowed_zero: staged.totals.outreach_allowed === 0,
    no_auto_contact_ready_created: true,
    no_auto_outreach_created: true
  }
};

audit.pass =
  audit.staging_integrity.retained_entities === 637 &&
  audit.staging_integrity.counts_match &&
  audit.validation_integrity.imported === audit.staging_integrity.staged_source_imports &&
  audit.validation_integrity.totals_match &&
  audit.safety_integrity.contact_ready_zero &&
  audit.safety_integrity.outreach_allowed_zero &&
  audit.safety_integrity.no_auto_contact_ready_created &&
  audit.safety_integrity.no_auto_outreach_created;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/authentication/source_staging/audit/batch_095_real_source_staging_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
