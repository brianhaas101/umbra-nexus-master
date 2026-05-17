const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const merged = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"
);

const dossiers = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/dossiers/long_beach_final_city_dossier_stack.json"
);

const nodes = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/map_nodes/long_beach_final_map_node_manifest.json"
);

const summary = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/long_beach_final_runtime_summary.json"
);

const audit = {
  version: "black_dragon_batch_124_long_beach_final_runtime_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "124_LONG_BEACH_FINAL_MERGE_DEDUPE_RUNTIME_REFRESH",

  counts: {
    raw_layer_rows: merged.raw_layer_rows,
    deduped_city_entities: merged.deduped_city_entities,
    contact_ready_entities: merged.contact_ready_entities,
    dossiers: dossiers.total_dossiers,
    map_nodes: nodes.total_map_nodes,
    hot: summary.totals.hot,
    warm: summary.totals.warm,
    review: summary.totals.review,
    automated_outreach_allowed: summary.totals.automated_outreach_allowed
  },

  gates: {
    raw_layer_rows_expected_90: merged.raw_layer_rows === 90,
    dedupe_reduced_or_equal: merged.deduped_city_entities <= merged.raw_layer_rows,
    dossiers_match_entities: dossiers.total_dossiers === merged.deduped_city_entities,
    map_nodes_match_dossiers: nodes.total_map_nodes === dossiers.total_dossiers,
    contact_ready_preserved_10: merged.contact_ready_entities === 10,
    all_nodes_visible: nodes.map_nodes.every(n => n.city_map_visible === true && n.dossier_visible === true),
    contact_ready_manual_only: merged.merged_entities.filter(e => e.contact_ready).every(e => e.outreach_execution_status === "CLIENT_MANUAL_ONLY"),
    automated_outreach_disabled: merged.merged_entities.every(e => e.automated_outreach_allowed === false)
  },

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/long_beach_final/audit/batch_124_long_beach_final_runtime_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_124_LONG_BEACH_FINAL_RUNTIME_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
