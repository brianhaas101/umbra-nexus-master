const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const edges = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/edges/long_beach_graph_edges.json"
);

const edgeCards = edges.edges
  .sort((a, b) => b.edge_weight - a.edge_weight)
  .slice(0, 100)
  .map((edge, index) => ({
    graph_edge_card_id:
      `BD_LB_GRAPH_EDGE_CARD_${String(index + 1).padStart(5, "0")}`,

    graph_edge_id:
      edge.graph_edge_id,

    source_organization:
      edge.source_organization,

    target_organization:
      edge.target_organization,

    relationship_type:
      edge.relationship_type,

    shared_layer_count:
      edge.shared_layer_count,

    edge_weight:
      edge.edge_weight,

    propagation_capable:
      edge.propagation_capable,

    conversion_path_capable:
      edge.conversion_path_capable,

    client_interpretation:
      edge.propagation_capable
        ? "This relationship may help spread book awareness through adjacent communities or media channels."
        : edge.conversion_path_capable
          ? "This relationship may support manual conversion strategy through retail, club, or referral overlap."
          : "This relationship is visible for context and ecosystem mapping.",

    client_visible:
      true,

    automated_outreach_allowed:
      false,

    runtime_mutation_allowed:
      false
  }));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/relationship_graph/long_beach/ui/edge_cards/graph_edge_cards.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_graph_edge_cards_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_edge_cards: edgeCards.length,
  edge_cards: edgeCards
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "GRAPH_EDGE_CARDS_COMPLETE",
  total_edge_cards: edgeCards.length,
  output: out
}, null, 2));
