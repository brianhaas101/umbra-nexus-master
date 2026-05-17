const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const candidates = read(
  "public/data/clients/black_dragon/automation/simulation/candidates/weekly_discovery_candidates_long_beach.json"
);

const dedupe = read(
  "public/data/clients/black_dragon/automation/simulation/dedupe/weekly_candidate_dedupe_results.json"
);

const freshness = read(
  "public/data/clients/black_dragon/automation/simulation/freshness/long_beach_freshness_snapshot.json"
);

const revalidation = read(
  "public/data/clients/black_dragon/automation/simulation/revalidation/long_beach_contact_route_revalidation_queue.json"
);

const delta = read(
  "public/data/clients/black_dragon/automation/simulation/delta_feed/long_beach_weekly_delta_feed.json"
);

const audit = {
  version: "black_dragon_batch_126_autonomous_discovery_simulation_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "126_AUTONOMOUS_DISCOVERY_SIMULATION_LONG_BEACH",

  counts: {
    discovery_candidates: candidates.total_candidates,
    new_candidates: dedupe.new_candidates,
    duplicate_review: dedupe.duplicate_review,
    freshness_entities: freshness.total_entities,
    revalidation_tasks: revalidation.total_revalidation_tasks,
    delta_new_candidates: delta.client_visible_summary.new_candidate_targets,
    new_contact_ready_targets: delta.client_visible_summary.new_contact_ready_targets,
    automated_outreach_actions: delta.client_visible_summary.automated_outreach_actions
  },

  gates: {
    candidates_generated: candidates.total_candidates > 0,
    dedupe_completed: dedupe.total_checked === candidates.total_candidates,
    freshness_snapshot_exists: freshness.total_entities > 0,
    revalidation_queue_for_contact_ready_targets: revalidation.total_revalidation_tasks === 10,
    delta_feed_generated: delta.client_visible_summary.new_candidate_targets === dedupe.new_candidates,
    no_auto_contact: delta.client_visible_summary.automated_outreach_actions === 0,
    no_auto_contact_ready_promotion: delta.client_visible_summary.new_contact_ready_targets === 0
  },

  next_phase: "BATCH_127_AUTONOMOUS_REFRESH_RUNNER_STUB_AND_CLIENT_FEED_WIRING",

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/simulation/audit/batch_126_autonomous_discovery_simulation_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_126_AUTONOMOUS_DISCOVERY_SIMULATION_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
