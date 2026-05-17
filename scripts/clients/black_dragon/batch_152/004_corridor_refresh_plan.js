const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const refreshPlan = {
  version:
    "black_dragon_southern_california_corridor_refresh_plan_v1",

  generated_at:
    new Date().toISOString(),

  corridor:
    "SOUTHERN_CALIFORNIA",

  refresh_sequence: [
    {
      sequence: 1,
      phase: "CITY_FRESHNESS_REFRESH",
      cities: [
        "Long Beach",
        "Los Angeles",
        "San Diego"
      ],
      action: "Refresh timestamps, route validity, stale-route review queues."
    },
    {
      sequence: 2,
      phase: "CITY_GRAPH_REFRESH",
      cities: [
        "Long Beach",
        "Los Angeles",
        "San Diego"
      ],
      action: "Rebuild city graph scores and propagation paths from updated city runtime."
    },
    {
      sequence: 3,
      phase: "FEDERATION_OVERLAP_REFRESH",
      cities: [
        "Long Beach",
        "Los Angeles",
        "San Diego"
      ],
      action: "Recompute cross-city overlap entities and regional graph effects."
    },
    {
      sequence: 4,
      phase: "FEDERATION_REGIONAL_SCORE_REFRESH",
      cities: [
        "FEDERATION"
      ],
      action: "Recompute regional scores, rankings, and corridor propagation paths."
    },
    {
      sequence: 5,
      phase: "CLIENT_DELTA_FEED_REFRESH",
      cities: [
        "FEDERATION"
      ],
      action: "Generate client-facing weekly change summary."
    }
  ],

  mutation_policy: {
    refresh_can_update_freshness: true,
    refresh_can_queue_review: true,
    refresh_can_flag_decay_candidate: true,
    refresh_cannot_auto_contact: true,
    refresh_cannot_auto_promote: true,
    refresh_cannot_delete_runtime_entity: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/automation/refresh_plan/corridor_refresh_plan.json"
);

fs.writeFileSync(out, JSON.stringify(refreshPlan, null, 2), "utf8");

console.log(JSON.stringify({
  status: "CORRIDOR_REFRESH_PLAN_COMPLETE",
  refresh_phases: refreshPlan.refresh_sequence.length,
  output: out
}, null, 2));
