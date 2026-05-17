const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const runtimePath = path.join(
  ROOT,
  "public/data/clients/black_dragon/runtime_index/exports/client_runtime_target_index.json"
);

const runtime = JSON.parse(
  fs.readFileSync(runtimePath, "utf8")
);

const metrics = {

  current_runtime_targets:
    runtime.total_runtime_targets,

  verified_contact_routes:
    runtime.runtime_targets.filter(
      r => r.verified_contact_route_status === "VERIFIED_CONTACT_ROUTE"
    ).length,

  visible_city_map_nodes:
    runtime.runtime_targets.filter(
      r => r.city_map_visible
    ).length,

  visible_dossiers:
    runtime.runtime_targets.filter(
      r => r.dossier_visible
    ).length,

  contact_ready_targets:
    runtime.runtime_targets.filter(
      r => r.contact_ready
    ).length,

  automated_outreach_enabled:
    runtime.runtime_targets.filter(
      r => r.automated_outreach_allowed
    ).length,

  recommended_next_phase:
    "TARGET_EXPANSION"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/runtime_index/snapshots/target_expansion_seed_metrics.json"
);

fs.writeFileSync(out, JSON.stringify({

  version:
    "black_dragon_target_expansion_seed_metrics_v1",

  generated_at:
    new Date().toISOString(),

  metrics

}, null, 2));

console.log(JSON.stringify({

  status:
    "TARGET_EXPANSION_SEED_METRICS_COMPLETE",

  metrics,

  output:
    out

}, null, 2));
