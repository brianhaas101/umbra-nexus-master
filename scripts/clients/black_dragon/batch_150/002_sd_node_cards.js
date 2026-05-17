const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/merged/san_diego_merged_city_entities.json"
);

const scores = read(
  "public/data/clients/black_dragon/relationship_graph/san_diego/scores/san_diego_graph_influence_scores.json"
);

const review = read(
  "public/data/clients/black_dragon/automation/live_validation/san_diego/contact_review/contact_route_review.json"
);

const scoreMap = new Map(
  scores.scores.map(row => [row.organization_name, row])
);

const reviewMap = new Map(
  review.contact_review.map(row => [row.organization_name, row])
);

const nodeCards = runtime.merged_entities.map(entity => {

  const graphScore =
    scoreMap.get(entity.organization_name) || {};

  const routeReview =
    reviewMap.get(entity.organization_name) || {};

  return {
    node_card_id:
      `BD_SD_NODE_CARD_${String(entity.city_rank).padStart(5, "0")}`,

    organization_name:
      entity.organization_name,

    city_rank:
      entity.city_rank,

    priority_tier:
      entity.priority_tier,

    best_score:
      entity.best_score,

    graph_influence_rank:
      graphScore.graph_influence_rank || null,

    graph_influence_score:
      graphScore.influence_score || null,

    graph_degree:
      graphScore.graph_degree || 0,

    route_validation_status:
      routeReview.route_validation_status || "NO_ROUTE_TESTED",

    contact_ready_candidate:
      routeReview.contact_ready_candidate === true,

    cross_city_duplicate_detected:
      entity.cross_city_duplicate_detected,

    duplicate_resolution:
      entity.duplicate_resolution,

    recommended_action:
      routeReview.contact_ready_candidate === true
        ? "MANUAL_REVIEW_THEN_CONTACT"
        : "REVIEW_ROUTE_FIRST",

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
  "public/data/clients/black_dragon/city_runtime/san_diego/ui/node_cards/san_diego_client_node_cards.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_san_diego_client_node_cards_v1",

  generated_at:
    new Date().toISOString(),

  total_node_cards:
    nodeCards.length,

  node_cards:
    nodeCards
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_NODE_CARDS_COMPLETE",
  total_node_cards: nodeCards.length,
  output: out
}, null, 2));
