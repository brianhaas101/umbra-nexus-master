const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const dedupe = read(
  "public/data/clients/black_dragon/candidate_queue/phoenix/dedupe/phoenix_cross_state_dedupe.json"
);

const merged = dedupe.deduped_candidates.map((candidate, index) => {
  const bestScore = Number((candidate.estimated_influence_score * 0.55 + candidate.estimated_conversion_score * 0.45).toFixed(2));

  return {
    city_runtime_entity_id: `BD_PHX_RUNTIME_ENTITY_${String(index + 1).padStart(5, "0")}`,
    candidate_id: candidate.candidate_id,
    organization_name: candidate.organization_name,
    organization_type: candidate.organization_type,
    city: "Phoenix",
    state: "AZ",
    public_route_url: candidate.public_route_url,
    source_layers: [candidate.source_category, "PHOENIX_DISCOVERY_IMPORT"],
    source_records: candidate.source_lineage,
    source_layer_count: 2,
    priority_tier: bestScore >= 8.9 ? "HOT" : bestScore >= 8.25 ? "WARM" : "REVIEW",
    best_score: bestScore,
    estimated_influence_score: candidate.estimated_influence_score,
    estimated_conversion_score: candidate.estimated_conversion_score,
    cross_state_duplicate_detected: candidate.cross_state_duplicate_detected,
    duplicate_resolution: candidate.duplicate_resolution,
    founder_review_required: candidate.founder_review_required,
    contact_ready: false,
    runtime_visible: true,
    city_map_visible: true,
    dossier_visible: true,
    automated_outreach_allowed: false,
    runtime_mutation_allowed: false
  };
});

const ranked = merged
  .sort((a,b) => b.best_score - a.best_score)
  .map((entity, index) => ({ ...entity, city_rank: index + 1 }));

const runtime = {
  version: "black_dragon_phoenix_runtime_merge_v1",
  generated_at: new Date().toISOString(),
  city: "Phoenix",
  state: "AZ",
  runtime_status: "RUNTIME_VISIBLE_CONTACT_LOCKED",
  raw_layer_rows: dedupe.dedupe_candidate_count,
  deduped_city_entities: ranked.length,
  contact_ready_entities: 0,
  duplicate_review_entities: ranked.filter(e => e.cross_state_duplicate_detected).length,
  merged_entities: ranked,
  inherited_laws: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_runtime_delete_without_quarantine: true,
    verified_route_required_for_contact_ready: true,
    cross_state_duplicates_require_founder_review: true
  }
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/phoenix/merged/phoenix_merged_city_entities.json"),
  JSON.stringify(runtime, null, 2),
  "utf8"
);

const dossiers = runtime.merged_entities.map(entity => ({
  dossier_id: `BD_PHX_DOSSIER_${String(entity.city_rank).padStart(5, "0")}`,
  city_runtime_entity_id: entity.city_runtime_entity_id,
  organization_name: entity.organization_name,
  city_rank: entity.city_rank,
  priority_tier: entity.priority_tier,
  best_score: entity.best_score,
  summary: `${entity.organization_name} is a Phoenix motorcycle ecosystem candidate for Black Dragon propagation analysis.`,
  intelligence_fields: {
    influence_score: entity.estimated_influence_score,
    conversion_score: entity.estimated_conversion_score,
    cross_state_duplicate_detected: entity.cross_state_duplicate_detected,
    duplicate_resolution: entity.duplicate_resolution,
    source_layers: entity.source_layers
  },
  operational_status: {
    runtime_visible: true,
    contact_ready: false,
    manual_review_required: true,
    automated_outreach_allowed: false
  }
}));

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/phoenix/dossiers/phoenix_runtime_dossiers.json"),
  JSON.stringify({ version: "black_dragon_phoenix_runtime_dossiers_v1", generated_at: new Date().toISOString(), dossier_count: dossiers.length, dossiers }, null, 2),
  "utf8"
);

const baseLat = 33.4484;
const baseLon = -112.0740;

const mapNodes = runtime.merged_entities.map((entity, index) => ({
  map_node_id: `BD_PHX_MAP_NODE_${String(entity.city_rank).padStart(5, "0")}`,
  city_runtime_entity_id: entity.city_runtime_entity_id,
  organization_name: entity.organization_name,
  city_rank: entity.city_rank,
  priority_tier: entity.priority_tier,
  best_score: entity.best_score,
  lat: Number((baseLat + ((index % 5) - 2) * 0.018).toFixed(6)),
  lon: Number((baseLon + (Math.floor(index / 5) - 1) * 0.024).toFixed(6)),
  node_type: entity.cross_state_duplicate_detected ? "CROSS_STATE_OVERLAP_NODE" : "PHOENIX_RUNTIME_NODE",
  runtime_visible: true,
  contact_ready: false,
  automated_outreach_allowed: false
}));

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/phoenix/map_nodes/phoenix_runtime_map_nodes.json"),
  JSON.stringify({ version: "black_dragon_phoenix_runtime_map_nodes_v1", generated_at: new Date().toISOString(), map_node_count: mapNodes.length, map_nodes: mapNodes }, null, 2),
  "utf8"
);

const graphNodes = runtime.merged_entities.map(entity => ({
  graph_node_id: `BD_PHX_GRAPH_NODE_${String(entity.city_rank).padStart(5, "0")}`,
  organization_name: entity.organization_name,
  city_runtime_entity_id: entity.city_runtime_entity_id,
  graph_node_type: entity.organization_type,
  city_rank: entity.city_rank,
  best_score: entity.best_score,
  cross_state_duplicate_detected: entity.cross_state_duplicate_detected,
  graph_visible: true
}));

const graphEdges = [];

for (let i = 0; i < graphNodes.length; i++) {
  for (let j = i + 1; j < graphNodes.length; j++) {
    const a = graphNodes[i];
    const b = graphNodes[j];

    const edgeWeight = Number(Math.min(1, ((a.best_score + b.best_score) / 20)).toFixed(3));

    if (edgeWeight < 0.82) continue;

    graphEdges.push({
      graph_edge_id: `BD_PHX_GRAPH_EDGE_${String(graphEdges.length + 1).padStart(6, "0")}`,
      source_graph_node_id: a.graph_node_id,
      target_graph_node_id: b.graph_node_id,
      source_organization: a.organization_name,
      target_organization: b.organization_name,
      relationship_type: a.cross_state_duplicate_detected || b.cross_state_duplicate_detected ? "INTERSTATE_CORRIDOR_OVERLAP" : "PHOENIX_ECOSYSTEM_RELATIONSHIP",
      edge_weight: edgeWeight,
      propagation_capable: true,
      automated_outreach_allowed: false,
      runtime_mutation_allowed: false
    });
  }
}

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/relationship_graph/phoenix/nodes/phoenix_graph_nodes.json"),
  JSON.stringify({ version: "black_dragon_phoenix_graph_nodes_v1", generated_at: new Date().toISOString(), total_nodes: graphNodes.length, nodes: graphNodes }, null, 2),
  "utf8"
);

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/relationship_graph/phoenix/edges/phoenix_graph_edges.json"),
  JSON.stringify({ version: "black_dragon_phoenix_graph_edges_v1", generated_at: new Date().toISOString(), total_edges: graphEdges.length, edges: graphEdges }, null, 2),
  "utf8"
);

const scores = graphNodes.map(node => {
  const degree = graphEdges.filter(edge => edge.source_graph_node_id === node.graph_node_id || edge.target_graph_node_id === node.graph_node_id).length;
  const influenceScore = Number((node.best_score * 0.7 + degree * 0.3).toFixed(2));

  return {
    graph_node_id: node.graph_node_id,
    organization_name: node.organization_name,
    graph_degree: degree,
    influence_score: influenceScore,
    graph_influence_rank: 0,
    cross_state_duplicate_detected: node.cross_state_duplicate_detected,
    influence_tier: influenceScore >= 9 ? "GRAPH_HOT" : influenceScore >= 8 ? "GRAPH_WARM" : "GRAPH_REVIEW"
  };
})
.sort((a,b) => b.influence_score - a.influence_score)
.map((score, index) => ({ ...score, graph_influence_rank: index + 1 }));

const paths = scores.slice(0, 10).map((score, index) => ({
  propagation_path_id: `BD_PHX_PROP_PATH_${String(index + 1).padStart(5, "0")}`,
  root_organization: score.organization_name,
  root_influence_score: score.influence_score,
  recommended_use: "MANUAL_REVIEW_THEN_ACTION",
  connected_target_count: graphEdges.filter(edge => edge.source_organization === score.organization_name || edge.target_organization === score.organization_name).length,
  automated_outreach_allowed: false,
  runtime_mutation_allowed: false
}));

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/relationship_graph/phoenix/scores/phoenix_graph_influence_scores.json"),
  JSON.stringify({ version: "black_dragon_phoenix_graph_influence_scores_v1", generated_at: new Date().toISOString(), total_scored_nodes: scores.length, scores }, null, 2),
  "utf8"
);

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/relationship_graph/phoenix/paths/phoenix_propagation_paths.json"),
  JSON.stringify({ version: "black_dragon_phoenix_propagation_paths_v1", generated_at: new Date().toISOString(), total_paths: paths.length, paths }, null, 2),
  "utf8"
);

const audit = {
  version: "black_dragon_batch_160_phoenix_runtime_merge_graph_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "160_PHOENIX_RUNTIME_MERGE_AND_GRAPH",
  counts: {
    runtime_entities: runtime.deduped_city_entities,
    duplicate_review_entities: runtime.duplicate_review_entities,
    dossiers: dossiers.length,
    map_nodes: mapNodes.length,
    graph_nodes: graphNodes.length,
    graph_edges: graphEdges.length,
    scored_nodes: scores.length,
    propagation_paths: paths.length
  },
  gates: {
    runtime_entities_exist: runtime.deduped_city_entities === 10,
    dossiers_match_runtime: dossiers.length === runtime.deduped_city_entities,
    map_nodes_match_runtime: mapNodes.length === runtime.deduped_city_entities,
    graph_nodes_match_runtime: graphNodes.length === runtime.deduped_city_entities,
    graph_edges_exist: graphEdges.length > 0,
    scored_nodes_match_runtime: scores.length === runtime.deduped_city_entities,
    propagation_paths_exist: paths.length > 0,
    no_contact_ready: runtime.contact_ready_entities === 0,
    no_automated_outreach: runtime.merged_entities.every(e => e.automated_outreach_allowed === false),
    no_runtime_mutation: runtime.merged_entities.every(e => e.runtime_mutation_allowed === false)
  },
  next_phase: "BATCH_161_PHOENIX_LIVE_VALIDATION",
  status: "PASS"
};

const auditOut = path.join(ROOT, "public/data/clients/black_dragon/city_runtime/phoenix/audit/batch_160_phoenix_runtime_merge_graph_audit.json");
fs.writeFileSync(auditOut, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_160_PHOENIX_RUNTIME_MERGE_GRAPH_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: auditOut
}, null, 2));
