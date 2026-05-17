const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(
    fs.readFileSync(path.resolve(file), "utf8")
  );
}

const schema =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/imports/verified_source_import_schema.v1.json"
  );

const imports =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/imports/verified_source_imports.v1.json"
  );

const promotions =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/promotions/source_discovery_promotions.v1.json"
  );

const queue =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/contact_queue/contact_discovery_queue.v1.json"
  );

const promoted =
  promotions.promoted_records || [];

const audit = {
  version:
    "umbra_batch_070_verified_source_import_gate_audit_v1",

  generated_at:
    new Date().toISOString(),

  schema_integrity: {
    required_fields:
      schema.required_import_fields.length >= 8,

    allowed_statuses:
      schema.allowed_validation_statuses.length >= 3,

    promotion_requirements_present:
      !!schema.promotion_requirements,

    hard_blocks_present:
      Object.values(schema.hard_blocks || {}).every(Boolean)
  },

  import_integrity: {
    import_template_exists:
      Array.isArray(imports.import_records),

    no_fake_seed_imports:
      imports.import_records.length === 0
  },

  promotion_integrity: {
    promoted_count_matches:
      promotions.totals.promoted === promoted.length,

    all_outreach_blocked:
      promoted.every(x =>
        x.outreach_status === "OUTREACH_BLOCKED"
      ),

    all_contact_discovery_pending:
      promoted.every(x =>
        x.contact_discovery_status === "CONTACT_DISCOVERY_PENDING"
      ),

    all_forbidden_actions_present:
      promoted.every(x =>
        Array.isArray(x.forbidden_actions) &&
        x.forbidden_actions.includes("NO_OUTREACH")
      )
  },

  queue_integrity: {
    queue_exists:
      !!queue,

    outreach_blocked:
      queue.totals.outreach_blocked === queue.totals.queued
  }
};

audit.pass =
  audit.schema_integrity.required_fields &&
  audit.schema_integrity.allowed_statuses &&
  audit.schema_integrity.promotion_requirements_present &&
  audit.schema_integrity.hard_blocks_present &&
  audit.import_integrity.import_template_exists &&
  audit.import_integrity.no_fake_seed_imports &&
  audit.promotion_integrity.promoted_count_matches &&
  audit.promotion_integrity.all_outreach_blocked &&
  audit.promotion_integrity.all_contact_discovery_pending &&
  audit.promotion_integrity.all_forbidden_actions_present &&
  audit.queue_integrity.queue_exists &&
  audit.queue_integrity.outreach_blocked;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/education/source_discovery/audit/batch_070_verified_source_import_gate_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
