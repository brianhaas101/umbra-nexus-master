const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const nodes = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/nodes/long_beach_graph_nodes.json"
);

const edges = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/edges/long_beach_graph_edges.json"
);

const scores = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/scores/long_beach_graph_influence_scores.json"
);

const paths = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/paths/long_beach_propagation_paths.json"
);

const panel = {
  version: "black_dragon_long_beach_graph_ui_overview_panel_v1",
  generated_at: new Date().toISOString(),

  city: "Long Beach",
  state: "CA",

  panel_id: "RELATIONSHIP_GRAPH_OVERVIEW",
  panel_title: "Long Beach Relationship Graph",
  client_visible: true,

  summary_cards: [
    {
      card_id: "GRAPH_NODES",
      label: "Graph Nodes",
      count: nodes.total_nodes,
      meaning: "Organizations currently visible in the Long Beach relationship graph."
    },
    {
      card_id: "GRAPH_EDGES",
      label: "Relationship Edges",
      count: edges.total_edges,
      meaning: "Detected relationship pathways between organizations."
    },
    {
      card_id: "PROPAGATION_PATHS",
      label: "Propagation Paths",
      count: paths.total_paths,
      meaning: "Recommended influence paths for manual sales or media strategy."
    },
    {
      card_id: "GRAPH_WARM",
      label: "Graph-Warm Influence Nodes",
      count: scores.scores.filter(s => s.influence_tier === "GRAPH_WARM").length,
      meaning: "Nodes with meaningful influence inside the local ecosystem."
    }
  ],

  top_influence_nodes:
    scores.scores.slice(0, 10).map(s => ({
      graph_influence_rank: s.graph_influence_rank,
      organization_name: s.organization_name,
      influence_tier: s.influence_tier,
      influence_score: s.influence_score,
      graph_degree: s.graph_degree,
      contact_ready: s.contact_ready
    })),

  hardlocks: {
    graph_ui_can_display: true,
    graph_ui_can_trigger_contact: false,
    graph_ui_can_auto_promote: false,
    graph_ui_can_mutate_runtime: false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/relationship_graph/long_beach/ui/panels/graph_overview_panel.json"
);

fs.writeFileSync(out, JSON.stringify(panel, null, 2), "utf8");

console.log(JSON.stringify({
  status: "GRAPH_UI_OVERVIEW_PANEL_COMPLETE",
  summary_cards: panel.summary_cards.length,
  top_influence_nodes: panel.top_influence_nodes.length,
  output: out
}, null, 2));
