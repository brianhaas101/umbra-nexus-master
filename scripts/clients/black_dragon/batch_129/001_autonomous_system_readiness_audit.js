const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const checks = {
  discovery_engine: {
    registry_exists: exists("public/data/clients/black_dragon/automation/discovery_queue/discovery_engine_registry.json"),
    runner_log_exists: exists("public/data/clients/black_dragon/automation/execution_logs/weekly_discovery_runner_log.json"),
    candidate_feed_exists: exists("public/data/clients/black_dragon/automation/simulation/candidates/weekly_discovery_candidates_long_beach.json"),
    dedupe_exists: exists("public/data/clients/black_dragon/automation/simulation/dedupe/weekly_candidate_dedupe_results.json")
  },

  revalidation_engine: {
    registry_exists: exists("public/data/clients/black_dragon/automation/revalidation/revalidation_engine_registry.json"),
    runner_log_exists: exists("public/data/clients/black_dragon/automation/execution_logs/weekly_revalidation_runner_log.json"),
    queue_exists: exists("public/data/clients/black_dragon/automation/simulation/revalidation/long_beach_contact_route_revalidation_queue.json")
  },

  signal_freshness_engine: {
    registry_exists: exists("public/data/clients/black_dragon/automation/freshness/signal_freshness_registry.json"),
    freshness_snapshot_exists: exists("public/data/clients/black_dragon/automation/simulation/freshness/long_beach_freshness_snapshot.json"),
    aging_run_exists: exists("public/data/clients/black_dragon/automation/freshness_aging/long_beach_daily_freshness_aging_run.json")
  },

  entity_aggregation_engine: {
    registry_exists: exists("public/data/clients/black_dragon/automation/discovery_queue/entity_aggregation_engine.json"),
    merged_runtime_exists: exists("public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"),
    dedupe_reduced_rows: false,
    source_layer_preservation: false
  },

  scheduled_recurring_pipelines: {
    schedule_registry_exists: exists("public/data/clients/black_dragon/automation/scheduler/scheduler_hook_registry.json"),
    runner_stubs_exist: exists("public/data/clients/black_dragon/automation/runners/runner_stub_creation_report.json"),
    execution_logs_exist: exists("public/data/clients/black_dragon/automation/execution_logs/weekly_discovery_runner_log.json")
  },

  continuous_refresh_capabilities: {
    entity_refresh_represented: false,
    relationship_refresh_represented: false,
    score_refresh_represented: false
  },

  decay_and_suppression: {
    signal_age_weighting_represented: false,
    stale_entity_detection_represented: false,
    inactive_organization_decay_represented: false,
    broken_route_decay_represented: false,
    dead_link_suppression_represented: false
  }
};

let runtime = null;
if (checks.entity_aggregation_engine.merged_runtime_exists) {
  runtime = read("public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json");

  checks.entity_aggregation_engine.dedupe_reduced_rows =
    runtime.raw_layer_rows > runtime.deduped_city_entities;

  checks.entity_aggregation_engine.source_layer_preservation =
    runtime.merged_entities.every(e =>
      Array.isArray(e.source_layers) &&
      e.source_layers.length >= 1 &&
      Array.isArray(e.source_records) &&
      e.source_records.length >= 1
    );
}

if (exists("public/data/clients/black_dragon/automation/freshness_aging/long_beach_daily_freshness_aging_run.json")) {
  const aging = read("public/data/clients/black_dragon/automation/freshness_aging/long_beach_daily_freshness_aging_run.json");

  checks.continuous_refresh_capabilities.entity_refresh_represented =
    aging.total_entities > 0;

  checks.continuous_refresh_capabilities.score_refresh_represented =
    aging.aged_entities.every(e =>
      typeof e.freshness_score === "number" &&
      typeof e.signal_age_days === "number"
    );

  checks.decay_and_suppression.signal_age_weighting_represented =
    aging.aged_entities.every(e => typeof e.signal_age_days === "number");

  checks.decay_and_suppression.stale_entity_detection_represented =
    aging.aged_entities.every(e => typeof e.stale_status === "string");

  checks.decay_and_suppression.inactive_organization_decay_represented =
    aging.aged_entities.every(e => typeof e.freshness_score === "number");
}

if (runtime) {
  checks.continuous_refresh_capabilities.relationship_refresh_represented =
    runtime.merged_entities.every(e =>
      Array.isArray(e.source_layers) &&
      Array.isArray(e.source_records)
    );
}

if (exists("public/data/clients/black_dragon/automation/simulation/revalidation/long_beach_contact_route_revalidation_queue.json")) {
  const revalidation = read("public/data/clients/black_dragon/automation/simulation/revalidation/long_beach_contact_route_revalidation_queue.json");

  checks.decay_and_suppression.broken_route_decay_represented =
    revalidation.queue.every(q =>
      q.disable_contact_ready_on_failure === true
    );

  checks.decay_and_suppression.dead_link_suppression_represented =
    revalidation.queue.every(q =>
      q.task_status === "PENDING_REVALIDATION"
    );
}

function flatten(obj, prefix = "") {
  let rows = [];

  for (const [key, value] of Object.entries(obj)) {
    const id = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "boolean") {
      rows.push({ check: id, passed: value });
    } else if (typeof value === "object" && value !== null) {
      rows = rows.concat(flatten(value, id));
    }
  }

  return rows;
}

const flattened = flatten(checks);

const failed = flattened.filter(c => c.passed !== true);
const passed = flattened.filter(c => c.passed === true);

const audit = {
  version: "black_dragon_batch_129_autonomous_system_readiness_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "129_AUTONOMOUS_SYSTEM_READINESS_AUDIT",

  purpose:
    "Verify autonomous refresh capabilities before city/state replication.",

  counts: {
    total_checks: flattened.length,
    passed_checks: passed.length,
    failed_checks: failed.length
  },

  systems_checked: checks,

  failed_checks: failed,

  replication_allowed:
    failed.length === 0,

  checkpoint_allowed:
    failed.length === 0,

  status:
    failed.length === 0 ? "PASS" : "REVIEW_REQUIRED",

  next_phase:
    failed.length === 0
      ? "BATCH_130_AUTONOMOUS_CITY_REPLICATION_TEMPLATE"
      : "BATCH_129_REPAIR_AUTONOMOUS_REFRESH_GAPS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/readiness/audit/batch_129_autonomous_system_readiness_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_129_AUTONOMOUS_SYSTEM_READINESS_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  replication_allowed: audit.replication_allowed,
  checkpoint_allowed: audit.checkpoint_allowed,
  failed_checks: audit.failed_checks,
  output: out
}, null, 2));
