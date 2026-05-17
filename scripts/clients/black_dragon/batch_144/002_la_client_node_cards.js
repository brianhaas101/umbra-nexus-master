const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

const scores = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/scores/los_angeles_graph_influence_scores.json"
);

const contactReview = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/contact_review/contact_route_review.json"
);

const scoreByOrg = new Map(
  scores.scores.map(row => [row.organization_name, row])
);

const reviewByOrg = new Map(
  contactReview.contact_review.map(row => [row.organization_name, row])
);

const nodeCards = runtime.merged_entities.map(entity => {
  const score = scoreByOrg.get(entity.organization_name) || {};
  const review = reviewByOrg.get(entity.organization_name) || {};

  return {
    node_card_id: `BD_LA_CLIENT_NODE_CARD_${String(entity.city_rank).padStart(5, "0")}`,

    city_runtime_entity_id: entity.city_runtime_entity_id,
    organization_name: entity.organization_name,
    city_rank: entity.city_rank,

    priority_tier: entity.priority_tier,
    best_score: entity.best_score,

    graph_influence_rank: score.graph_influence_rank || null,
    graph_influence_score: score.influence_score || null,
    graph_degree: score.graph_degree || 0,
    influence_tier: score.influence_tier || "GRAPH_UNSCORED",

    cross_city_duplicate_detected: entity.cross_city_duplicate_detected,
    duplicate_resolution: entity.duplicate_resolution,
    founder_review_required: entity.founder_review_required,

    route_validation_status: review.route_validation_status || "NO_ROUTE_TESTED",
    public_contact_url: review.public_contact_url || null,
    contact_ready_candidate: review.contact_ready_candidate === true,
    manual_contact_possible_after_review: review.manual_contact_possible_after_review === true,

    recommended_client_action:
      review.contact_ready_candidate === true
        ? "Review dossier and manually verify contact route before outreach."
        : "Review route issue before considering manual contact.",

    client_visible: true,
    automated_outreach_allowed: false,
    contact_ready_promotion_allowed: false,
    runtime_mutation_allowed: false
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/los_angeles/ui/node_cards/los_angeles_client_node_cards.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_los_angeles_client_node_cards_v1",
  generated_at: new Date().toISOString(),
  city: "Los Angeles",
  state: "CA",
  total_node_cards: nodeCards.length,
  node_cards: nodeCards
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LOS_ANGELES_CLIENT_NODE_CARDS_COMPLETE",
  total_node_cards: nodeCards.length,
  output: out
}, null, 2));
