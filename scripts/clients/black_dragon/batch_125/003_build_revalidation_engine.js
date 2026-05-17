const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const revalidation = {

  version:
    "black_dragon_revalidation_engine_v1",

  generated_at:
    new Date().toISOString(),

  engine_id:
    "BD_REVALIDATION_ENGINE_V1",

  enabled:
    true,

  revalidation_targets: [

    "dead_websites",
    "broken_contact_routes",
    "inactive_events",
    "inactive_podcasts",
    "deleted_youtube_channels",
    "duplicate_entities",
    "renamed_organizations",
    "location_changes"
  ],

  failure_actions: [

    "mark_stale",
    "reduce_rank_score",
    "move_to_review_queue",
    "disable_contact_ready",
    "disable_runtime_visibility_if_severe"
  ],

  automatic_delete_allowed:
    false,

  quarantine_before_removal:
    true,

  review_required_before_disable:
    true
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/revalidation/revalidation_engine_registry.json"
);

fs.writeFileSync(out, JSON.stringify(revalidation, null, 2));

console.log(JSON.stringify({
  status: "REVALIDATION_ENGINE_COMPLETE",
  revalidation_targets: revalidation.revalidation_targets.length,
  output: out
}, null, 2));
