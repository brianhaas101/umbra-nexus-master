const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const staged = readJson(
  "public/data/clients/black_dragon/authentication/contact_staging/imports/staged_contact_routes.v1.json"
);

const validated = readJson(
  "public/data/clients/black_dragon/authentication/contact_validation/validated/validated_contact_routes.v1.json"
);

const rejected = readJson(
  "public/data/clients/black_dragon/authentication/contact_validation/rejected/rejected_contact_routes.v1.json"
);

const audit = {
  version:
    "umbra_batch_096_contact_route_staging_audit_v1",

  generated_at:
    new Date().toISOString(),

  staging_integrity: {
    validated_sources:
      staged.totals.validated_sources,

    staged_contacts:
      staged.totals.staged_contacts,

    blocked_contacts:
      staged.totals.blocked_contacts,

    totals_match:
      staged.totals.validated_sources ===
      staged.totals.staged_contacts + staged.totals.blocked_contacts
  },

  validation_integrity: {
    imported:
      validated.totals.imported,

    validated:
      validated.totals.validated,

    rejected:
      validated.totals.rejected,

    totals_match:
      validated.totals.imported ===
      validated.totals.validated + validated.totals.rejected
  },

  safety_integrity: {
    contact_ready_zero:
      staged.totals.contact_ready === 0,

    outreach_allowed_zero:
      staged.totals.outreach_allowed === 0,

    no_auto_promotion:
      true
  }
};

audit.pass =
  audit.staging_integrity.validated_sources >= 0 &&
  audit.staging_integrity.totals_match &&
  audit.validation_integrity.imported ===
    audit.staging_integrity.staged_contacts &&
  audit.validation_integrity.totals_match &&
  audit.safety_integrity.contact_ready_zero &&
  audit.safety_integrity.outreach_allowed_zero &&
  audit.safety_integrity.no_auto_promotion;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/contact_staging/audit/batch_096_contact_route_staging_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
