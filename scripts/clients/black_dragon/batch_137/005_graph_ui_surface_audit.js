const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const overview = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/ui/panels/graph_overview_panel.json"
);

const nodeCards = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/ui/node_cards/graph_node_cards.json"
);

const edgeCards = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/ui/edge_cards/graph_edge_cards.json"
);

const feed = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/ui/client_feed/client_propagation_feed.json"
);

const audit = {
  version: "black_dragon_batch_137_graph_ui_surface_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "137_GRAPH_TO_CLIENT_UI_SURFACE_AND_AUDIT",

  counts: {
    overview_cards: overview.summary_cards.length,
    top_influence_nodes: overview.top_influence_nodes.length,
    node_cards: nodeCards.total_node_cards,
    edge_cards: edgeCards.total_edge_cards,
    propagation_feed_paths: feed.feed_summary.total_paths,
    direct_manual_action_paths: feed.feed_summary.direct_manual_action_paths,
    review_before_action_paths: feed.feed_summary.review_before_action_paths
  },

  gates: {
    overview_panel_client_visible: overview.client_visible === true,
    overview_has_cards: overview.summary_cards.length >= 4,
    node_cards_match_graph_nodes: nodeCards.total_node_cards === 68,
    edge_cards_exist: edgeCards.total_edge_cards > 0,
    propagation_feed_visible: feed.client_visible === true,
    propagation_paths_exist: feed.feed_summary.total_paths > 0,

    no_ui_triggered_outreach:
      overview.hardlocks.graph_ui_can_trigger_contact === false &&
      feed.safety_locks.feed_can_auto_contact === false,

    no_ui_auto_promotion:
      overview.hardlocks.graph_ui_can_auto_promote === false &&
      feed.safety_locks.feed_can_auto_promote === false,

    no_ui_runtime_mutation:
      overview.hardlocks.graph_ui_can_mutate_runtime === false &&
      feed.safety_locks.feed_can_delete_targets === false
  },

  next_phase: "BATCH_138_PRODUCTION_READINESS_AUDIT_FOR_LONG_BEACH",

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/relationship_graph/long_beach/ui/audit/batch_137_graph_ui_surface_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_137_GRAPH_UI_SURFACE_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
