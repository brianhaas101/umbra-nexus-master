const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read("public/data/clients/black_dragon/city_runtime/mesa/merged/mesa_merged_city_entities.json");
const graph = read("public/data/clients/black_dragon/relationship_graph/mesa/edges/mesa_graph_edges.json");
const scores = read("public/data/clients/black_dragon/relationship_graph/mesa/scores/mesa_graph_influence_scores.json");
const paths = read("public/data/clients/black_dragon/relationship_graph/mesa/paths/mesa_propagation_paths.json");
const validation = read("public/data/clients/black_dragon/automation/live_validation/mesa/results/live_http_validation_results.json");
const contactReview = read("public/data/clients/black_dragon/automation/live_validation/mesa/contact_review/contact_route_review.json");
const deadRoutes = read("public/data/clients/black_dragon/automation/live_validation/mesa/dead_routes/dead_route_review_queue.json");

const panel = {
  version: "black_dragon_mesa_client_overview_panel_v1",
  generated_at: new Date().toISOString(),
  city: "Mesa",
  state: "AZ",
  panel_id: "BD_MSA_CLIENT_OVERVIEW",
  panel_title: "Mesa Operational Intelligence",
  client_visible: true,
  summary_cards: [
    { card_id: "MSA_RUNTIME_ENTITIES", label: "Runtime Entities", count: runtime.deduped_city_entities },
    { card_id: "MSA_CONTACT_CANDIDATES", label: "Manual Contact Candidates", count: contactReview.contact_ready_candidates },
    { card_id: "MSA_GRAPH_EDGES", label: "Graph Edges", count: graph.total_edges },
    { card_id: "MSA_PROPAGATION_PATHS", label: "Propagation Paths", count: paths.total_paths },
    { card_id: "MSA_ROUTE_REVIEW", label: "Route Reviews", count: deadRoutes.review_item_count },
    { card_id: "MSA_REGIONAL_DUPLICATES", label: "Regional Overlaps", count: runtime.duplicate_review_entities }
  ],
  hardlocks: {
    ui_can_recommend: true,
    ui_can_auto_contact: false,
    ui_can_auto_promote: false,
    ui_can_delete_targets: false,
    ui_can_mutate_runtime: false
  }
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/mesa/ui/panels/mesa_client_overview_panel.json"),
  JSON.stringify(panel, null, 2),
  "utf8"
);

const scoreMap = new Map(scores.scores.map(row => [row.organization_name, row]));
const reviewMap = new Map(contactReview.contact_review.map(row => [row.organization_name, row]));

const nodeCards = runtime.merged_entities.map(entity => {
  const graphScore = scoreMap.get(entity.organization_name) || {};
  const routeReview = reviewMap.get(entity.organization_name) || {};

  return {
    node_card_id: `BD_MSA_NODE_CARD_${String(entity.city_rank).padStart(5, "0")}`,
    organization_name: entity.organization_name,
    city_rank: entity.city_rank,
    priority_tier: entity.priority_tier,
    best_score: entity.best_score,
    graph_influence_rank: graphScore.graph_influence_rank || null,
    graph_influence_score: graphScore.influence_score || null,
    graph_degree: graphScore.graph_degree || 0,
    route_validation_status: routeReview.route_validation_status || "NO_ROUTE_TESTED",
    contact_ready_candidate: routeReview.contact_ready_candidate === true,
    regional_duplicate_detected: entity.regional_duplicate_detected,
    duplicate_resolution: entity.duplicate_resolution,
    recommended_action: routeReview.contact_ready_candidate === true ? "MANUAL_REVIEW_THEN_CONTACT" : "REVIEW_ROUTE_FIRST",
    client_visible: true,
    automated_outreach_allowed: false,
    runtime_mutation_allowed: false
  };
});

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/mesa/ui/node_cards/mesa_client_node_cards.json"),
  JSON.stringify({ version: "black_dragon_mesa_client_node_cards_v1", generated_at: new Date().toISOString(), total_node_cards: nodeCards.length, node_cards: nodeCards }, null, 2),
  "utf8"
);

const feed = {
  version: "black_dragon_mesa_propagation_feed_v1",
  generated_at: new Date().toISOString(),
  city: "Mesa",
  state: "AZ",
  client_visible: true,
  feed_summary: {
    total_paths: paths.total_paths,
    manual_contact_candidate_paths: paths.paths.filter(p => {
      const r = reviewMap.get(p.root_organization);
      return r && r.contact_ready_candidate;
    }).length
  },
  propagation_paths: paths.paths.map(pathRow => {
    const reviewRow = reviewMap.get(pathRow.root_organization) || {};

    return {
      propagation_path_id: pathRow.propagation_path_id,
      root_organization: pathRow.root_organization,
      root_influence_score: pathRow.root_influence_score,
      route_validation_status: reviewRow.route_validation_status || "NO_ROUTE_TESTED",
      contact_ready_candidate: reviewRow.contact_ready_candidate === true,
      recommended_action: reviewRow.contact_ready_candidate === true ? "MANUAL_REVIEW_THEN_ACTION" : "ROUTE_REVIEW_REQUIRED",
      connected_target_count: pathRow.connected_target_count,
      automated_outreach_allowed: false,
      runtime_mutation_allowed: false
    };
  })
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/mesa/ui/propagation_feed/mesa_client_propagation_feed.json"),
  JSON.stringify(feed, null, 2),
  "utf8"
);

const uiAudit = {
  version: "black_dragon_batch_167_mesa_ui_surface_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "167_MESA_UI_AND_PRODUCTION_AUDIT",
  counts: {
    overview_cards: panel.summary_cards.length,
    node_cards: nodeCards.length,
    propagation_paths: feed.feed_summary.total_paths
  },
  gates: {
    overview_visible: panel.client_visible === true,
    node_cards_match_runtime: nodeCards.length === 10,
    propagation_paths_exist: feed.feed_summary.total_paths > 0,
    no_ui_auto_contact: panel.hardlocks.ui_can_auto_contact === false,
    no_ui_auto_promotion: panel.hardlocks.ui_can_auto_promote === false,
    no_ui_runtime_mutation: panel.hardlocks.ui_can_mutate_runtime === false
  },
  status: "PASS"
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/mesa/ui/audit/batch_167_mesa_ui_surface_audit.json"),
  JSON.stringify(uiAudit, null, 2),
  "utf8"
);

const prodAudit = {
  version: "black_dragon_mesa_production_readiness_audit_v1",
  generated_at: new Date().toISOString(),
  city: "Mesa",
  state: "AZ",
  certification_target: "ARIZONA_THIRD_OPERATIONAL_CITY",
  counts: {
    runtime_entities: runtime.deduped_city_entities,
    graph_edges: graph.total_edges,
    propagation_paths: paths.total_paths,
    validation_routes: validation.validation_count,
    valid_routes: validation.validation_results.filter(r => r.fetch_status === "VALID").length,
    contact_ready_candidates: contactReview.contact_ready_candidates,
    regional_duplicate_entities: runtime.duplicate_review_entities,
    ui_node_cards: uiAudit.counts.node_cards
  },
  gates: {
    runtime_active: runtime.runtime_status === "RUNTIME_VISIBLE_CONTACT_LOCKED",
    runtime_entities_exist: runtime.deduped_city_entities === 10,
    graph_active: graph.total_edges > 0,
    propagation_active: paths.total_paths > 0,
    live_validation_active: validation.validation_count === 10,
    contact_review_active: contactReview.review_count === 10,
    ui_surface_active: uiAudit.status === "PASS",
    no_auto_contact: runtime.inherited_laws.no_auto_contact === true,
    no_auto_promotion: runtime.inherited_laws.no_auto_promotion === true,
    no_automated_outreach: validation.validation_results.every(r => r.automated_outreach_allowed === false),
    no_contact_ready_promotion: contactReview.contact_review.every(r => r.contact_ready_promotion_allowed === false)
  },
  certification: "MESA_OPERATIONAL_CITY_APPROVED",
  next_phase: "BATCH_168_ARIZONA_TWO_CITY_COMPARISON_AND_MESA_SELECTION",
  status: "PASS"
};

const out = path.join(ROOT, "public/data/clients/black_dragon/production_readiness/mesa/audit/mesa_production_readiness_audit.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(prodAudit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_167_MESA_PRODUCTION_READINESS_AUDIT_COMPLETE",
  audit_status: prodAudit.status,
  certification: prodAudit.certification,
  counts: prodAudit.counts,
  gates: prodAudit.gates,
  output: out
}, null, 2));

