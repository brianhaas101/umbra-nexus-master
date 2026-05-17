const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const nodes = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/nodes/long_beach_graph_nodes.json"
);

const scores = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/scores/long_beach_graph_influence_scores.json"
);

const scoreMap = new Map(
  scores.scores.map(s => [s.graph_node_id, s])
);

const nodeCards = nodes.nodes.map(node => {
  const score = scoreMap.get(node.graph_node_id);

  return {
    graph_node_card_id:
      `BD_LB_GRAPH_NODE_CARD_${String(node.city_rank).padStart(5, "0")}`,

    graph_node_id:
      node.graph_node_id,

    organization_name:
      node.organization_name,

    city_rank:
      node.city_rank,

    graph_influence_rank:
      score ? score.graph_influence_rank : null,

    priority_tier:
      node.priority_tier,

    influence_tier:
      score ? score.influence_tier : "GRAPH_UNSCORED",

    best_score:
      node.best_score,

    influence_score:
      score ? score.influence_score : null,

    graph_degree:
      score ? score.graph_degree : 0,

    weighted_relationship_score:
      score ? score.weighted_relationship_score : 0,

    graph_node_type:
      node.graph_node_type,

    source_layers:
      node.source_layers,

    organization_types:
      node.organization_types,

    contact_ready:
      node.contact_ready,

    recommended_client_action:
      node.contact_ready
        ? "OPEN_DOSSIER_AND_MANUALLY_REVIEW_CONTACT_ROUTE"
        : "REVIEW_PROPAGATION_VALUE_BEFORE_CONTACT_ROUTE_VALIDATION",

    client_visible:
      true,

    automated_outreach_allowed:
      false,

    runtime_mutation_allowed:
      false
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/relationship_graph/long_beach/ui/node_cards/graph_node_cards.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_graph_node_cards_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_node_cards: nodeCards.length,
  node_cards: nodeCards
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "GRAPH_NODE_CARDS_COMPLETE",
  total_node_cards: nodeCards.length,
  output: out
}, null, 2));
