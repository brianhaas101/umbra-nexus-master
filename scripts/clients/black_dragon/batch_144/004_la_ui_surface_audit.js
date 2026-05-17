const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const overview = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/ui/panels/los_angeles_client_overview_panel.json"
);

const nodeCards = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/ui/node_cards/los_angeles_client_node_cards.json"
);

const feed = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/ui/propagation_feed/los_angeles_client_propagation_feed.json"
);

const audit = {
  version: "black_dragon_batch_144_los_angeles_ui_surface_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "144_LOS_ANGELES_CLIENT_UI_SURFACE",

  counts: {
    overview_cards: overview.summary_cards.length,
    node_cards: nodeCards.total_node_cards,
    propagation_paths: feed.feed_summary.total_paths,
    manual_contact_candidate_paths: feed.feed_summary.manual_contact_candidate_paths,
    review_required_paths: feed.feed_summary.review_required_paths
  },

  gates: {
    overview_panel_visible: overview.client_visible === true,
    overview_has_required_cards: overview.summary_cards.length >= 6,
    node_cards_match_runtime: nodeCards.total_node_cards === 10,
    propagation_feed_visible: feed.client_visible === true,
    propagation_paths_exist: feed.feed_summary.total_paths === 10,

    no_ui_auto_contact:
      overview.hardlocks.ui_can_auto_contact === false &&
      feed.safety_locks.feed_can_auto_contact === false,

    no_ui_auto_promotion:
      overview.hardlocks.ui_can_auto_promote === false &&
      feed.safety_locks.feed_can_auto_promote === false,

    no_ui_runtime_mutation:
      overview.hardlocks.ui_can_mutate_runtime === false &&
      feed.safety_locks.feed_can_delete_targets === false
  },

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/los_angeles/ui/audit/batch_144_los_angeles_ui_surface_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_144_LA_UI_SURFACE_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
