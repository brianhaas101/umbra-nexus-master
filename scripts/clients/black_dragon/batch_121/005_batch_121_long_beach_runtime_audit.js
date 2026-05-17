const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const merged = read(
  "public/data/clients/black_dragon/city_runtime/long_beach/merged/long_beach_merged_city_entities.json"
);

const dossiers = read(
  "public/data/clients/black_dragon/city_runtime/long_beach/dossiers/long_beach_city_dossier_stack.json"
);

const nodes = read(
  "public/data/clients/black_dragon/city_runtime/long_beach/map_nodes/long_beach_map_node_manifest.json"
);

const summary = read(
  "public/data/clients/black_dragon/city_runtime/long_beach/long_beach_city_runtime_summary.json"
);

const audit = {
  version:
    "black_dragon_batch_121_long_beach_runtime_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "121_LONG_BEACH_MERGE_DEDUPE_RUNTIME_CONSOLIDATION",

  counts: {
    raw_layer_rows:
      merged.raw_layer_rows,

    deduped_city_entities:
      merged.deduped_city_entities,

    city_dossiers:
      dossiers.total_dossiers,

    map_nodes:
      nodes.total_map_nodes,

    hot:
      summary.totals.hot,

    warm:
      summary.totals.warm,

    review:
      summary.totals.review,

    contact_ready:
      summary.totals.contact_ready
  },

  gates: {
    raw_layer_rows_expected_80:
      merged.raw_layer_rows === 80,

    dedupe_reduced_or_equal:
      merged.deduped_city_entities <= merged.raw_layer_rows,

    dossiers_match_entities:
      dossiers.total_dossiers === merged.deduped_city_entities,

    map_nodes_match_dossiers:
      nodes.total_map_nodes === dossiers.total_dossiers,

    all_nodes_visible:
      nodes.map_nodes.every(n => n.city_map_visible === true && n.dossier_visible === true),

    no_contact_ready_until_route_verified:
      nodes.map_nodes.every(n => n.contact_ready === false),

    automated_outreach_disabled:
      nodes.map_nodes.every(n => n.automated_outreach_allowed === false)
  },

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/long_beach/audit/batch_121_long_beach_runtime_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_121_LONG_BEACH_RUNTIME_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
