const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function write(rel, data) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"
);

const feed = read(
  "public/data/clients/black_dragon/automation/client_feed/client_updates_feed.json"
);

const snapshot = {
  version: "black_dragon_long_beach_runtime_snapshot_v1",
  generated_at: new Date().toISOString(),
  snapshot_id: "BD_LONG_BEACH_SNAPSHOT_POST_BATCH_127",
  city: "Long Beach",
  state: "CA",

  runtime_counts: {
    raw_layer_rows: runtime.raw_layer_rows,
    deduped_city_entities: runtime.deduped_city_entities,
    contact_ready_entities: runtime.contact_ready_entities,
    hot: runtime.merged_entities.filter(e => e.priority_tier === "HOT").length,
    warm: runtime.merged_entities.filter(e => e.priority_tier === "WARM").length,
    review: runtime.merged_entities.filter(e => e.priority_tier === "REVIEW").length
  },

  automation_feed_counts: {
    new_candidate_targets:
      feed.summary_cards.find(c => c.card_id === "NEW_CANDIDATES").count,

    routes_due_for_revalidation:
      feed.summary_cards.find(c => c.card_id === "ROUTES_REVALIDATION").count,

    automated_outreach_actions:
      feed.summary_cards.find(c => c.card_id === "AUTOMATION_ACTIONS").count
  },

  top_10_runtime_targets:
    runtime.merged_entities.slice(0, 10).map(e => ({
      city_rank: e.city_rank,
      organization_name: e.organization_name,
      priority_tier: e.priority_tier,
      best_score: e.best_score,
      contact_ready: e.contact_ready
    })),

  hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_delete_without_quarantine: true
  }
};

write(
  "public/data/clients/black_dragon/automation/snapshots/long_beach_runtime_snapshot_post_batch_127.json",
  snapshot
);

console.log(JSON.stringify({
  status: "RUNTIME_SNAPSHOT_WRITER_COMPLETE",
  snapshot_id: snapshot.snapshot_id,
  output: "public/data/clients/black_dragon/automation/snapshots/long_beach_runtime_snapshot_post_batch_127.json"
}, null, 2));
