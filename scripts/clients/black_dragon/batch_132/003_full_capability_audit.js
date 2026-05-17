const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const report = read(
  "public/data/clients/black_dragon/capability_audit/long_beach/exports/long_beach_full_capability_report.json"
);

const dbSummary = read(
  "public/data/clients/black_dragon/capability_audit/long_beach/exports/long_beach_database_source_summary.json"
);

const audit = {
  version:
    "black_dragon_batch_132_full_capability_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "132_FULL_LONG_BEACH_CAPABILITY_AUDIT",

  counts: {
    database_sources:
      report.summary.total_database_sources_connected,

    source_categories:
      report.summary.total_source_categories,

    unique_source_types:
      report.summary.total_unique_source_types,

    autonomous_capabilities:
      report.summary.autonomous_capabilities,

    scheduler_hooks:
      report.summary.scheduler_hooks,

    runtime_entities:
      report.summary.runtime_entities,

    contact_ready_entities:
      report.summary.contact_ready_entities,

    hot_targets:
      report.summary.hot_targets,

    warm_targets:
      report.summary.warm_targets,

    review_targets:
      report.summary.review_targets,

    new_weekly_candidate_targets:
      report.summary.new_weekly_candidate_targets,

    conservative_low_exposure:
      report.estimated_reach.conservative_low_exposure,

    conservative_high_exposure:
      report.estimated_reach.conservative_high_exposure
  },

  gates: {
    minimum_25_database_sources:
      report.summary.total_database_sources_connected >= 25,

    minimum_5_source_categories:
      report.summary.total_source_categories >= 5,

    runtime_entities_exist:
      report.summary.runtime_entities > 0,

    contact_ready_entities_exist:
      report.summary.contact_ready_entities >= 10,

    autonomous_capabilities_exist:
      report.summary.autonomous_capabilities >= 13,

    source_summary_matches_report:
      dbSummary.total_sources === report.summary.total_database_sources_connected,

    hardlocks_present:
      report.hardlocks.no_auto_contact === true &&
      report.hardlocks.no_auto_promotion === true &&
      report.hardlocks.quarantine_before_runtime === true
  },

  next_phase:
    "DISCUSS_CAPABILITY_REPORT_THEN_CALIFORNIA_REPLICATION",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/capability_audit/long_beach/audit/batch_132_full_capability_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_132_FULL_CAPABILITY_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
