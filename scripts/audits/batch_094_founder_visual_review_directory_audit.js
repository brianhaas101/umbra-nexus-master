const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function exists(file) {
  return fs.existsSync(path.resolve(file));
}

const jsonFile =
  "public/data/clients/black_dragon/founder_review/exports/founder_visual_review_directory.v1.json";

const csvFile =
  "public/data/clients/black_dragon/founder_review/exports/founder_visual_review_directory.csv";

const payload =
  readJson(jsonFile);

const rows =
  payload.founder_review_rows || [];

const audit = {
  version:
    "umbra_batch_094_founder_visual_review_directory_audit_v1",

  generated_at:
    new Date().toISOString(),

  file_integrity: {
    json_exists:
      exists(jsonFile),

    csv_exists:
      exists(csvFile)
  },

  row_integrity: {
    founder_review_rows:
      rows.length,

    all_have_review_ids:
      rows.every(x => !!x.founder_review_id),

    all_have_entity_ids:
      rows.every(x => !!x.entity_id),

    all_have_organization_names:
      rows.every(x => !!x.organization_name),

    all_have_regions:
      rows.every(x => !!x.region),

    all_founder_only:
      payload.founder_access_only === true,

    all_client_access_blocked:
      rows.every(x =>
        x.contact_ready === false &&
        x.outreach_allowed === false
      )
  },

  totals_integrity: {
    pending_visual_review:
      payload.totals.pending_visual_review,

    contact_ready:
      payload.totals.contact_ready,

    outreach_allowed:
      payload.totals.outreach_allowed
  }
};

audit.pass =
  audit.file_integrity.json_exists &&
  audit.file_integrity.csv_exists &&
  audit.row_integrity.founder_review_rows === 637 &&
  audit.row_integrity.all_have_review_ids &&
  audit.row_integrity.all_have_entity_ids &&
  audit.row_integrity.all_have_organization_names &&
  audit.row_integrity.all_have_regions &&
  audit.row_integrity.all_founder_only &&
  audit.row_integrity.all_client_access_blocked &&
  audit.totals_integrity.pending_visual_review === 637 &&
  audit.totals_integrity.contact_ready === 0 &&
  audit.totals_integrity.outreach_allowed === 0;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/founder_review/audit/batch_094_founder_visual_review_directory_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
