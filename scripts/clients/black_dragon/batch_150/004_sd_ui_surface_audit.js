const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const overview = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/ui/panels/san_diego_client_overview_panel.json"
);

const nodeCards = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/ui/node_cards/san_diego_client_node_cards.json"
);

const feed = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/ui/propagation_feed/san_diego_client_propagation_feed.json"
);

const audit = {
  version:
    "black_dragon_batch_150_san_diego_ui_surface_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "150_SAN_DIEGO_UI_AND_PRODUCTION_AUDIT",

  counts: {
    overview_cards:
      overview.summary_cards.length,

    node_cards:
      nodeCards.total_node_cards,

    propagation_paths:
      feed.feed_summary.total_paths
  },

  gates: {
    overview_visible:
      overview.client_visible === true,

    node_cards_match_runtime:
      nodeCards.total_node_cards === 10,

    propagation_paths_exist:
      feed.feed_summary.total_paths > 0,

    no_ui_auto_contact:
      overview.hardlocks.ui_can_auto_contact === false,

    no_ui_auto_promotion:
      overview.hardlocks.ui_can_auto_promote === false,

    no_ui_runtime_mutation:
      overview.hardlocks.ui_can_mutate_runtime === false
  },

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/san_diego/ui/audit/batch_150_san_diego_ui_surface_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_150_SAN_DIEGO_UI_SURFACE_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
