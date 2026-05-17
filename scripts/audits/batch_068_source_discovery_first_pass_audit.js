const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const queue =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/queues/education_source_discovery_queue_batch_068.v1.json"
  );

const report =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/reports/education_source_discovery_first_pass_report.v1.json"
  );

const tasks =
  queue.discovery_tasks || [];

const audit = {
  version:
    "umbra_batch_068_education_source_discovery_first_pass_audit_v1",

  generated_at:
    new Date().toISOString(),

  queue_integrity: {
    task_count:
      tasks.length,

    max_batch_respected:
      tasks.length <= 75,

    all_queued_for_discovery:
      tasks.every(t =>
        t.discovery_status === "QUEUED_FOR_PUBLIC_SOURCE_DISCOVERY"
      ),

    all_outreach_blocked:
      tasks.every(t =>
        t.outreach_status === "OUTREACH_BLOCKED"
      ),

    all_no_contacts_attached:
      tasks.every(t =>
        t.contact_status === "NO_CONTACT_ATTACHED"
      ),

    all_have_search_queries:
      tasks.every(t =>
        Array.isArray(t.search_queries) &&
        t.search_queries.length >= 1
      ),

    all_require_official_source:
      tasks.every(t =>
        t.required_result === "official_public_source_url"
      ),

    all_have_forbidden_result_types:
      tasks.every(t =>
        Array.isArray(t.forbidden_result_types) &&
        t.forbidden_result_types.includes("generated_email") &&
        t.forbidden_result_types.includes("generated_phone") &&
        t.forbidden_result_types.includes("unverified_contact")
      )
  },

  report_integrity: {
    input_targets:
      report.input_targets === 600,

    selected_targets_match:
      report.selected_targets === tasks.length,

    selection_policy_present:
      !!report.selection_policy,

    category_counts_present:
      Object.keys(report.category_counts || {}).length > 0
  }
};

audit.pass =
  audit.queue_integrity.task_count > 0 &&
  audit.queue_integrity.max_batch_respected &&
  audit.queue_integrity.all_queued_for_discovery &&
  audit.queue_integrity.all_outreach_blocked &&
  audit.queue_integrity.all_no_contacts_attached &&
  audit.queue_integrity.all_have_search_queries &&
  audit.queue_integrity.all_require_official_source &&
  audit.queue_integrity.all_have_forbidden_result_types &&
  audit.report_integrity.input_targets &&
  audit.report_integrity.selected_targets_match &&
  audit.report_integrity.selection_policy_present &&
  audit.report_integrity.category_counts_present;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/education/source_discovery/audit/batch_068_source_discovery_first_pass_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
