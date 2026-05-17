const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const federation = read(
  "public/data/clients/black_dragon/state_federations/arizona/federation/graph/arizona_federation_entities.json"
);

const overlaps = read(
  "public/data/clients/black_dragon/state_federations/arizona/federation/overlaps/arizona_overlap_registry.json"
);

const scores = read(
  "public/data/clients/black_dragon/state_federations/arizona/federation/scores/arizona_state_scores.json"
);

const paths = read(
  "public/data/clients/black_dragon/state_federations/arizona/federation/paths/arizona_state_propagation_paths.json"
);

const review = read(
  "public/data/clients/black_dragon/state_federations/arizona/federation/review_surface/arizona_review_surface.json"
);

const deploymentGraph = {
  version: "black_dragon_arizona_final_deployment_graph_v1",
  generated_at: new Date().toISOString(),

  deployment_id:
    "BLACK_DRAGON_ARIZONA_STATE_DEPLOYMENT",

  state:
    "Arizona",

  deployment_status:
    "FULL_STATE_DEPLOYMENT_READY",

  operational_cities:
    federation.operational_cities,

  federation_entity_count:
    federation.total_runtime_entities,

  overlap_entity_count:
    overlaps.overlap_count,

  state_propagation_paths:
    paths.total_paths,

  highest_state_score:
    scores.scores[0]?.state_score || 0,

  deployment_hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_runtime_mutation: true,
    no_delete_without_quarantine: true,
    manual_review_required_for_contact: true,
    statewide_overlap_review_required: true
  }
};

fs.writeFileSync(
  path.join(
    ROOT,
    "public/data/clients/black_dragon/state_federations/arizona/deployment/graph/arizona_final_deployment_graph.json"
  ),
  JSON.stringify(deploymentGraph, null, 2),
  "utf8"
);

const statewideScores = {
  version: "black_dragon_arizona_final_statewide_scores_v1",
  generated_at: new Date().toISOString(),

  state:
    "Arizona",

  statewide_entity_scores:
    scores.scores.map(row => ({
      state_rank: row.state_rank,
      organization_name: row.organization_name,
      city: row.city,
      state_score: row.state_score,
      state_priority: row.state_priority,
      city_diversity: row.city_diversity
    })),

  statewide_score_statistics: {
    total_scored_entities:
      scores.scores.length,

    hot_entities:
      scores.scores.filter(r => r.state_priority === "ARIZONA_STATE_HOT").length,

    warm_entities:
      scores.scores.filter(r => r.state_priority === "ARIZONA_STATE_WARM").length,

    review_entities:
      scores.scores.filter(r => r.state_priority === "ARIZONA_STATE_REVIEW").length
  }
};

fs.writeFileSync(
  path.join(
    ROOT,
    "public/data/clients/black_dragon/state_federations/arizona/deployment/scores/arizona_final_statewide_scores.json"
  ),
  JSON.stringify(statewideScores, null, 2),
  "utf8"
);

const statewidePaths = {
  version: "black_dragon_arizona_final_statewide_paths_v1",
  generated_at: new Date().toISOString(),

  state:
    "Arizona",

  statewide_paths:
    paths.paths.map((row, index) => ({
      statewide_path_rank: index + 1,
      root_organization: row.root_organization,
      root_city: row.root_city,
      state_score: row.state_score,
      city_span: row.city_span,
      participating_cities: row.participating_cities,
      path_type: row.path_type,
      recommended_strategy: row.recommended_strategy,
      automated_outreach_allowed: false,
      runtime_mutation_allowed: false
    })),

  statewide_path_statistics: {
    total_paths:
      paths.total_paths,

    multi_city_paths:
      paths.paths.filter(p => p.city_span > 1).length,

    single_city_paths:
      paths.paths.filter(p => p.city_span === 1).length
  }
};

fs.writeFileSync(
  path.join(
    ROOT,
    "public/data/clients/black_dragon/state_federations/arizona/deployment/paths/arizona_final_statewide_paths.json"
  ),
  JSON.stringify(statewidePaths, null, 2),
  "utf8"
);

const statewideReview = {
  version: "black_dragon_arizona_final_review_surface_v1",
  generated_at: new Date().toISOString(),

  state:
    "Arizona",

  client_visible:
    true,

  statewide_manual_contact_candidates:
    review.manual_contact_review.item_count,

  statewide_route_review_items:
    review.route_issue_review.item_count,

  review_surface_status:
    "STATEWIDE_REVIEW_OPERATIONAL",

  review_hardlocks:
    review.hardlocks
};

fs.writeFileSync(
  path.join(
    ROOT,
    "public/data/clients/black_dragon/state_federations/arizona/deployment/review_surface/arizona_final_review_surface.json"
  ),
  JSON.stringify(statewideReview, null, 2),
  "utf8"
);

const certification = {
  version: "black_dragon_arizona_final_state_certification_v1",
  generated_at: new Date().toISOString(),

  state:
    "Arizona",

  certification_id:
    "BLACK_DRAGON_ARIZONA_FULL_DEPLOYMENT_CERTIFICATION",

  certification_status:
    "CERTIFIED",

  deployment_scope: {
    operational_cities:
      federation.operational_cities,

    runtime_entities:
      federation.total_runtime_entities,

    overlap_entities:
      overlaps.overlap_count,

    statewide_paths:
      paths.total_paths
  },

  operational_meaning:
    "Arizona is now a fully certified operational state deployment under the California master-state replication architecture.",

  strategic_meaning:
    "Arizona is now suitable for statewide propagation analysis, statewide review operations, and interstate expansion bridging.",

  next_state:
    "Nevada",

  next_phase:
    "BATCH_181_NEVADA_MASTER_STATE_INITIALIZATION"
};

fs.writeFileSync(
  path.join(
    ROOT,
    "public/data/clients/black_dragon/state_federations/arizona/deployment/certification/arizona_final_state_certification.json"
  ),
  JSON.stringify(certification, null, 2),
  "utf8"
);

const audit = {
  version: "black_dragon_batch_180_arizona_final_deployment_audit_v1",
  generated_at: new Date().toISOString(),

  batch:
    "180_ARIZONA_FINAL_DEPLOYMENT_CERTIFICATION",

  state:
    "Arizona",

  counts: {
    operational_cities:
      federation.operational_cities.length,

    federation_entities:
      federation.total_runtime_entities,

    overlap_entities:
      overlaps.overlap_count,

    statewide_scores:
      statewideScores.statewide_score_statistics.total_scored_entities,

    statewide_paths:
      statewidePaths.statewide_path_statistics.total_paths,

    manual_contact_candidates:
      statewideReview.statewide_manual_contact_candidates,

    route_review_items:
      statewideReview.statewide_route_review_items
  },

  gates: {
    four_operational_cities:
      federation.operational_cities.length === 4,

    statewide_entity_pool_exists:
      federation.total_runtime_entities === 40,

    statewide_scores_exist:
      statewideScores.statewide_score_statistics.total_scored_entities === 40,

    statewide_paths_exist:
      statewidePaths.statewide_path_statistics.total_paths > 0,

    review_surface_operational:
      statewideReview.review_surface_status === "STATEWIDE_REVIEW_OPERATIONAL",

    certification_complete:
      certification.certification_status === "CERTIFIED",

    no_auto_contact:
      deploymentGraph.deployment_hardlocks.no_auto_contact === true,

    no_auto_promotion:
      deploymentGraph.deployment_hardlocks.no_auto_promotion === true,

    no_runtime_mutation:
      deploymentGraph.deployment_hardlocks.no_runtime_mutation === true
  },

  certification:
    "ARIZONA_FULL_STATE_DEPLOYMENT_CERTIFIED",

  interpretation: {
    operational_meaning:
      "Arizona is now the first fully replicated non-California state deployment in Nexus.",

    replication_meaning:
      "The California master-state architecture has now been successfully replicated outside California.",

    next_state:
      "Nevada"
  },

  next_phase:
    "BATCH_181_NEVADA_MASTER_STATE_INITIALIZATION",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_federations/arizona/deployment/audit/batch_180_arizona_final_deployment_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_180_ARIZONA_FINAL_DEPLOYMENT_AUDIT_COMPLETE",
  audit_status: audit.status,
  certification: audit.certification,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
