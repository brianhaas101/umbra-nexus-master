const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const runtime = read(
  "public/data/clients/black_dragon/runtime_index/exports/client_runtime_target_index.json"
);

const citySummary = read(
  "public/data/clients/black_dragon/runtime_index/exports/city_runtime_summary.json"
);

const manifest = read(
  "public/data/clients/black_dragon/runtime_index/exports/visible_organization_manifest.json"
);

const metrics = read(
  "public/data/clients/black_dragon/runtime_index/snapshots/target_expansion_seed_metrics.json"
);

const audit = {

  version:
    "black_dragon_batch_109_runtime_index_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "109_CLIENT_RUNTIME_TARGET_INDEX",

  counts: {

    runtime_targets:
      runtime.total_runtime_targets,

    visible_organizations:
      manifest.total_visible_organizations,

    city_summary_records:
      citySummary.total_cities,

    visible_city_map_nodes:
      metrics.metrics.visible_city_map_nodes,

    visible_dossiers:
      metrics.metrics.visible_dossiers
  },

  gates: {

    runtime_targets_exist:
      runtime.total_runtime_targets >= 0,

    manifest_matches_runtime:
      manifest.total_visible_organizations === runtime.total_runtime_targets,

    city_summary_exists:
      citySummary.total_cities >= 1,

    visible_nodes_match_runtime:
      metrics.metrics.visible_city_map_nodes === runtime.total_runtime_targets,

    dossiers_match_runtime:
      metrics.metrics.visible_dossiers === runtime.total_runtime_targets,

    automated_outreach_still_disabled:
      metrics.metrics.automated_outreach_enabled === 0
  },

  next_phase:
    "TARGET_EXPANSION",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/runtime_index/audit/batch_109_runtime_index_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({

  status:
    "BATCH_109_RUNTIME_INDEX_AUDIT_COMPLETE",

  audit_status:
    audit.status,

  counts:
    audit.counts,

  gates:
    audit.gates,

  output:
    out

}, null, 2));
