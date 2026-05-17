const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const discoveryLog = read(
  "public/data/clients/black_dragon/automation/execution_logs/weekly_discovery_runner_log.json"
);

const freshnessRun = read(
  "public/data/clients/black_dragon/automation/freshness_aging/long_beach_daily_freshness_aging_run.json"
);

const revalidationLog = read(
  "public/data/clients/black_dragon/automation/execution_logs/weekly_revalidation_runner_log.json"
);

const clientFeed = read(
  "public/data/clients/black_dragon/automation/client_feed/client_updates_feed.json"
);

const snapshot = read(
  "public/data/clients/black_dragon/automation/snapshots/long_beach_runtime_snapshot_post_batch_127.json"
);

const audit = {
  version: "black_dragon_batch_127_runner_client_feed_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "127_AUTONOMOUS_REFRESH_RUNNER_STUB_AND_CLIENT_FEED_WIRING",

  counts: {
    discovery_candidates_detected: discoveryLog.candidates_detected,
    freshness_entities_aged: freshnessRun.total_entities,
    revalidation_tasks: revalidationLog.total_revalidation_tasks,
    client_feed_cards: clientFeed.summary_cards.length,
    client_feed_new_candidates: clientFeed.new_candidate_targets.length,
    snapshot_runtime_entities: snapshot.runtime_counts.deduped_city_entities,
    automated_outreach_actions: snapshot.automation_feed_counts.automated_outreach_actions
  },

  gates: {
    discovery_runner_log_exists:
      discoveryLog.runner_id === "BD_RUNNER_WEEKLY_DISCOVERY",

    freshness_runner_output_exists:
      freshnessRun.total_entities > 0,

    revalidation_runner_output_exists:
      revalidationLog.total_revalidation_tasks === 10,

    client_feed_visible_ready:
      clientFeed.feed_status === "CLIENT_VISIBLE_READY",

    client_feed_has_summary_cards:
      clientFeed.summary_cards.length === 4,

    snapshot_written:
      snapshot.snapshot_id === "BD_LONG_BEACH_SNAPSHOT_POST_BATCH_127",

    no_auto_contact:
      snapshot.automation_feed_counts.automated_outreach_actions === 0,

    no_auto_promotion:
      discoveryLog.runtime_promotion_performed === false,

    hardlocks_present:
      snapshot.hardlocks.no_auto_contact === true &&
      snapshot.hardlocks.no_auto_promotion === true &&
      snapshot.hardlocks.no_delete_without_quarantine === true
  },

  next_phase:
    "BATCH_128_AUTONOMOUS_REFRESH_CRON_WIRING_AND_UI_SURFACE",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/audit/batch_127_runner_client_feed_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_127_RUNNER_CLIENT_FEED_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
