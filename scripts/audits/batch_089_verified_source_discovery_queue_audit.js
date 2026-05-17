const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const queue = readJson(
  "public/data/clients/black_dragon/authentication/source_discovery/queues/verified_source_discovery_queue.v1.json"
);

const visual = readJson(
  "public/data/clients/black_dragon/authentication/source_discovery/visual/visual_contact_review_manifest.v1.json"
);

const tasks = queue.discovery_tasks || [];
const rows = visual.visual_review_rows || [];

const audit = {
  version:
    "umbra_batch_089_verified_source_discovery_queue_audit_v1",

  generated_at:
    new Date().toISOString(),

  queue_integrity: {
    retained_entities:
      queue.totals.retained_entities,

    discovery_tasks:
      queue.totals.discovery_tasks,

    region_queues:
      queue.totals.region_queues,

    public_source_found:
      queue.totals.public_source_found,

    authentication_pending:
      queue.totals.authentication_pending,

    all_have_task_ids:
      tasks.every(x => !!x.discovery_task_id),

    all_have_entity_ids:
      tasks.every(x => !!x.entity_id),

    all_have_organization_names:
      tasks.every(x => !!x.organization_name),

    all_have_regions:
      tasks.every(x => !!x.region),

    all_have_search_queries:
      tasks.every(x =>
        Array.isArray(x.search_queries) &&
        x.search_queries.length >= 4
      ),

    all_require_source_validation:
      tasks.every(x => x.source_validation_required === true),

    all_require_contact_validation:
      tasks.every(x => x.contact_route_validation_required === true),

    all_require_manual_review:
      tasks.every(x => x.manual_review_required === true)
  },

  visual_integrity: {
    visual_rows:
      visual.totals.visual_rows,

    pending_visual_review:
      visual.totals.pending_visual_review,

    all_have_row_ids:
      rows.every(x => !!x.row_id),

    all_have_entity_ids:
      rows.every(x => !!x.entity_id),

    all_have_names:
      rows.every(x => !!x.organization_name),

    all_pending_review:
      rows.every(x => x.reviewer_decision === "PENDING"),

    all_contact_ready_false:
      rows.every(x => x.contact_ready === false),

    all_outreach_allowed_false:
      rows.every(x => x.outreach_allowed === false)
  },

  safety_integrity: {
    contact_ready_zero:
      queue.totals.contact_ready === 0 &&
      visual.totals.contact_ready === 0,

    outreach_allowed_zero:
      queue.totals.outreach_allowed === 0 &&
      visual.totals.outreach_allowed === 0,

    visual_review_required_before_access:
      visual.access_policy ===
      "BLACK_DRAGON_CLIENT_ACCESS_BLOCKED_UNTIL_VISUAL_REVIEW_COMPLETE"
  }
};

audit.pass =
  audit.queue_integrity.retained_entities === 637 &&
  audit.queue_integrity.discovery_tasks === 637 &&
  audit.queue_integrity.region_queues > 0 &&
  audit.queue_integrity.all_have_task_ids &&
  audit.queue_integrity.all_have_entity_ids &&
  audit.queue_integrity.all_have_organization_names &&
  audit.queue_integrity.all_have_regions &&
  audit.queue_integrity.all_have_search_queries &&
  audit.queue_integrity.all_require_source_validation &&
  audit.queue_integrity.all_require_contact_validation &&
  audit.queue_integrity.all_require_manual_review &&
  audit.visual_integrity.visual_rows === 637 &&
  audit.visual_integrity.pending_visual_review === 637 &&
  audit.visual_integrity.all_have_row_ids &&
  audit.visual_integrity.all_have_entity_ids &&
  audit.visual_integrity.all_have_names &&
  audit.visual_integrity.all_pending_review &&
  audit.visual_integrity.all_contact_ready_false &&
  audit.visual_integrity.all_outreach_allowed_false &&
  audit.safety_integrity.contact_ready_zero &&
  audit.safety_integrity.outreach_allowed_zero &&
  audit.safety_integrity.visual_review_required_before_access;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/source_discovery/audit/batch_089_verified_source_discovery_queue_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
