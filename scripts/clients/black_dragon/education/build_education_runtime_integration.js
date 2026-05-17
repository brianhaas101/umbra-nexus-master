const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(
    fs.readFileSync(path.resolve(file), "utf8")
  );
}

const seedPath =
  "public/data/clients/black_dragon/education/seed_targets/education_seed_targets.v1.json";

const operationalPath =
  "public/data/clients/black_dragon/education/operational/education_operational_seed_index.v1.json";

const discoveryPath =
  "public/data/clients/black_dragon/education/source_discovery/source_discovery_operational_index.v1.json";

const queuePath =
  "public/data/clients/black_dragon/education/source_discovery/queues/education_source_discovery_queue_batch_068.v1.json";

const promotionsPath =
  "public/data/clients/black_dragon/education/source_discovery/promotions/source_discovery_promotions.v1.json";

const dashboardPath =
  "public/data/clients/black_dragon/education/runtime/dashboard/education_runtime_dashboard.v1.json";

const runtimePath =
  "public/data/clients/black_dragon/education/runtime/integration/education_runtime_integration.v1.json";

const seeds =
  readJson(seedPath);

const operational =
  readJson(operationalPath);

const discovery =
  readJson(discoveryPath);

const queue =
  readJson(queuePath);

const promotions =
  readJson(promotionsPath);

const dashboard = {
  version:
    "black_dragon_education_runtime_dashboard_v1_batch_071",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  module:
    "education_expansion_v1",

  totals: {

    education_seed_targets:
      seeds.totals.seed_targets,

    operational_targets:
      operational.totals.operational_seed_targets,

    discovery_pending:
      discovery.totals.pending_discovery,

    discovery_queue:
      queue.totals.queued_tasks,

    source_discovered:
      promotions.totals.promoted,

    source_blocked:
      promotions.totals.blocked,

    outreach_allowed:
      0
  },

  status: {

    runtime_visible:
      true,

    outreach_enabled:
      false,

    contact_generation_enabled:
      false,

    response_generation_enabled:
      false,

    education_layer_live:
      true
  }
};

const runtime = {
  version:
    "black_dragon_education_runtime_integration_v1_batch_071",

  generated_at:
    new Date().toISOString(),

  runtime_layer: {
    layer_id:
      "BLACK_DRAGON_EDUCATION_EXPANSION",

    layer_status:
      "LIVE_RUNTIME_VISIBLE",

    client_id:
      "black_dragon",

    entity_classes: [
      "EDUCATION_NODE",
      "TRAINING_NODE",
      "LAW_ENFORCEMENT_NODE",
      "VETERAN_NODE"
    ],

    runtime_features: [
      "dashboard_metrics",
      "seed_tracking",
      "source_discovery_tracking",
      "promotion_tracking",
      "runtime_visibility"
    ],

    blocked_features: [
      "outreach_generation",
      "automated_contact",
      "auto_response_generation",
      "live_queue_insertion"
    ]
  }
};

fs.writeFileSync(
  path.resolve(dashboardPath),
  JSON.stringify(dashboard, null, 2)
);

fs.writeFileSync(
  path.resolve(runtimePath),
  JSON.stringify(runtime, null, 2)
);

console.log(JSON.stringify({
  status:
    "EDUCATION_RUNTIME_INTEGRATION_COMPLETE",

  dashboard_totals:
    dashboard.totals,

  runtime_layer:
    runtime.runtime_layer.layer_status
}, null, 2));
