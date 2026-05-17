const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const snapshot = read(
  "public/data/clients/black_dragon/automation/snapshots/long_beach_runtime_snapshot_post_batch_127.json"
);

const mutationLog = {
  version: "black_dragon_runtime_mutation_log_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",

  mutation_policy: {
    runtime_mutations_require_log: true,
    score_changes_require_before_after: true,
    contact_ready_changes_require_route_evidence: true,
    delete_forbidden_without_quarantine: true
  },

  mutations: [
    {
      mutation_id: "BD_MUTATION_000001",
      source_batch: "BATCH_127",
      mutation_type: "CLIENT_FEED_WIRING",
      before_state: "NO_CLIENT_AUTOMATION_FEED",
      after_state: "CLIENT_VISIBLE_FEED_READY",
      automated_contact_performed: false,
      automated_promotion_performed: false
    },
    {
      mutation_id: "BD_MUTATION_000002",
      source_batch: "BATCH_127",
      mutation_type: "RUNTIME_SNAPSHOT_WRITTEN",
      before_state: "NO_POST_127_SNAPSHOT",
      after_state: snapshot.snapshot_id,
      automated_contact_performed: false,
      automated_promotion_performed: false
    }
  ]
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/mutation_logs/runtime_mutation_log.json"
);

fs.writeFileSync(out, JSON.stringify(mutationLog, null, 2), "utf8");

const history = {
  version: "black_dragon_runtime_snapshot_history_index_v1",
  generated_at: new Date().toISOString(),
  snapshots: [
    {
      snapshot_id: snapshot.snapshot_id,
      path: "public/data/clients/black_dragon/automation/snapshots/long_beach_runtime_snapshot_post_batch_127.json",
      city: "Long Beach",
      state: "CA",
      deduped_entities: snapshot.runtime_counts.deduped_city_entities,
      contact_ready_entities: snapshot.runtime_counts.contact_ready_entities
    }
  ]
};

const histOut = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/history/runtime_snapshot_history_index.json"
);

fs.writeFileSync(histOut, JSON.stringify(history, null, 2), "utf8");

console.log(JSON.stringify({
  status: "MUTATION_LOG_AND_HISTORY_INDEX_COMPLETE",
  mutations: mutationLog.mutations.length,
  snapshots: history.snapshots.length,
  output: out
}, null, 2));
