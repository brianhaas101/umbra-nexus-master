const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const schema = readJson(
  "public/data/clients/black_dragon/authentication/schemas/entity_authentication_schema.v1.json"
);

const queue = readJson(
  "public/data/clients/black_dragon/authentication/queues/entity_authentication_queue.v1.json"
);

const results = readJson(
  "public/data/clients/black_dragon/authentication/results/authentication_results_import.v1.json"
);

const tasks = queue.authentication_tasks || [];

const audit = {
  version:
    "umbra_batch_086_entity_authentication_pipeline_audit_v1",

  generated_at:
    new Date().toISOString(),

  schema_integrity: {
    statuses:
      schema.authentication_statuses.length >= 8,

    required_fields:
      schema.required_authentication_fields.length >= 8,

    public_source_required:
      schema.source_requirements.requires_public_source === true,

    organization_match_required:
      schema.source_requirements.requires_organization_match === true,

    region_match_required:
      schema.source_requirements.requires_region_match === true,

    manual_review_required:
      schema.source_requirements.requires_manual_review === true,

    hard_blocks_present:
      Object.values(schema.hard_blocks || {}).every(Boolean)
  },

  queue_integrity: {
    task_count:
      tasks.length,

    all_have_task_ids:
      tasks.every(x => !!x.auth_task_id),

    all_have_entity_ids:
      tasks.every(x => !!x.entity_id),

    all_have_names:
      tasks.every(x => !!x.organization_name),

    all_client_scoped:
      tasks.every(x => x.client_id === "black_dragon"),

    all_authentication_required:
      tasks.every(x => x.authentication_required === true),

    all_outreach_blocked:
      tasks.every(x => x.outreach_allowed === false),

    all_have_required_before_outreach:
      tasks.every(x =>
        Array.isArray(x.required_before_outreach) &&
        x.required_before_outreach.length >= 5
      ),

    all_have_forbidden_actions:
      tasks.every(x =>
        Array.isArray(x.forbidden_actions) &&
        x.forbidden_actions.includes("NO_OUTREACH") &&
        x.forbidden_actions.includes("NO_AUTO_CONTACT")
      ),

    all_have_search_queries:
      tasks.every(x =>
        Array.isArray(x.search_queries) &&
        x.search_queries.length >= 2
      )
  },

  import_integrity: {
    import_template_exists:
      Array.isArray(results.authentication_results),

    import_empty_initially:
      results.authentication_results.length === 0
  },

  safety_integrity: {
    outreach_allowed_zero:
      queue.totals.outreach_allowed === 0,

    no_auth_task_is_contact_ready:
      tasks.every(x =>
        x.contact_status !== "CONTACT_ROUTE_VERIFIED" &&
        x.outreach_allowed === false
      )
  }
};

audit.pass =
  audit.schema_integrity.statuses &&
  audit.schema_integrity.required_fields &&
  audit.schema_integrity.public_source_required &&
  audit.schema_integrity.organization_match_required &&
  audit.schema_integrity.region_match_required &&
  audit.schema_integrity.manual_review_required &&
  audit.schema_integrity.hard_blocks_present &&
  audit.queue_integrity.task_count >= 1000 &&
  audit.queue_integrity.all_have_task_ids &&
  audit.queue_integrity.all_have_entity_ids &&
  audit.queue_integrity.all_have_names &&
  audit.queue_integrity.all_client_scoped &&
  audit.queue_integrity.all_authentication_required &&
  audit.queue_integrity.all_outreach_blocked &&
  audit.queue_integrity.all_have_required_before_outreach &&
  audit.queue_integrity.all_have_forbidden_actions &&
  audit.queue_integrity.all_have_search_queries &&
  audit.import_integrity.import_template_exists &&
  audit.import_integrity.import_empty_initially &&
  audit.safety_integrity.outreach_allowed_zero &&
  audit.safety_integrity.no_auth_task_is_contact_ready;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/authentication/audit/batch_086_entity_authentication_pipeline_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
