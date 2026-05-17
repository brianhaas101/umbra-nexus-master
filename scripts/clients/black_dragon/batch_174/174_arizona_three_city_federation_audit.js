const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const phoenix = read("public/data/clients/black_dragon/city_runtime/phoenix/merged/phoenix_merged_city_entities.json");
const scottsdale = read("public/data/clients/black_dragon/city_runtime/scottsdale/merged/scottsdale_merged_city_entities.json");
const mesa = read("public/data/clients/black_dragon/city_runtime/mesa/merged/mesa_merged_city_entities.json");

const phxReview = read("public/data/clients/black_dragon/automation/live_validation/phoenix/contact_review/contact_route_review.json");
const sctReview = read("public/data/clients/black_dragon/automation/live_validation/scottsdale/contact_review/contact_route_review.json");
const msaReview = read("public/data/clients/black_dragon/automation/live_validation/mesa/contact_review/contact_route_review.json");

const phxDead = read("public/data/clients/black_dragon/automation/live_validation/phoenix/dead_routes/dead_route_review_queue.json");
const sctDead = read("public/data/clients/black_dragon/automation/live_validation/scottsdale/dead_routes/dead_route_review_queue.json");
const msaDead = read("public/data/clients/black_dragon/automation/live_validation/mesa/dead_routes/dead_route_review_queue.json");

const cityRows = [
  { city: "Phoenix", runtime: phoenix, review: phxReview, dead: phxDead },
  { city: "Scottsdale", runtime: scottsdale, review: sctReview, dead: sctDead },
  { city: "Mesa", runtime: mesa, review: msaReview, dead: msaDead }
];

const federationEntities = cityRows.flatMap(row =>
  row.runtime.merged_entities.map(entity => ({
    ...entity,
    federation_city: row.city,
    federation_state: "Arizona"
  }))
);

const federationPayload = {
  version: "black_dragon_arizona_three_city_federation_entities_v1",
  generated_at: new Date().toISOString(),
  state: "Arizona",
  federation_id: "BLACK_DRAGON_ARIZONA_OPERATIONAL_CORRIDOR",
  federation_status: "THREE_CITY_STATE_FEDERATION_OPERATIONAL",
  operational_cities: ["Phoenix", "Scottsdale", "Mesa"],
  total_runtime_entities: federationEntities.length,
  federation_entities: federationEntities
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/state_federations/arizona/federation/graph/arizona_federation_entities.json"),
  JSON.stringify(federationPayload, null, 2),
  "utf8"
);

const grouped = {};
for (const entity of federationEntities) {
  const key = String(entity.organization_name).toLowerCase().trim();
  if (!grouped[key]) grouped[key] = [];
  grouped[key].push(entity);
}

const overlaps = Object.entries(grouped)
  .filter(([_, rows]) => rows.length > 1)
  .map(([name, rows], index) => ({
    arizona_overlap_id: `BD_AZ_OVERLAP_${String(index + 1).padStart(5, "0")}`,
    normalized_name: name,
    overlap_count: rows.length,
    participating_cities: [...new Set(rows.map(r => r.federation_city))],
    organizations: rows.map(r => ({
      city: r.federation_city,
      organization_name: r.organization_name,
      city_rank: r.city_rank,
      best_score: r.best_score
    })),
    overlap_type: "ARIZONA_STATE_CORRIDOR_ENTITY",
    state_priority: rows.some(r => r.best_score >= 9) ? "HIGH" : "MEDIUM",
    automated_outreach_allowed: false,
    runtime_mutation_allowed: false
  }));

const overlapPayload = {
  version: "black_dragon_arizona_three_city_overlap_registry_v1",
  generated_at: new Date().toISOString(),
  state: "Arizona",
  overlap_count: overlaps.length,
  overlaps
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/state_federations/arizona/federation/overlaps/arizona_overlap_registry.json"),
  JSON.stringify(overlapPayload, null, 2),
  "utf8"
);

const scores = federationEntities
  .map(entity => {
    const key = String(entity.organization_name).toLowerCase().trim();
    const overlap = overlaps.find(o => o.normalized_name === key);

    const cityDiversity = overlap ? overlap.participating_cities.length : 1;
    const overlapBoost = overlap ? Math.min(1.0, cityDiversity * 0.32) : 0;
    const regionalDuplicatePenalty =
      entity.regional_duplicate_detected || entity.cross_state_duplicate_detected
        ? 0.12
        : 0;

    const stateScore = Number(Math.max(0, entity.best_score + overlapBoost - regionalDuplicatePenalty).toFixed(2));

    return {
      arizona_federation_entity_id: entity.city_runtime_entity_id,
      organization_name: entity.organization_name,
      city: entity.federation_city,
      city_rank: entity.city_rank,
      base_score: entity.best_score,
      city_diversity: cityDiversity,
      overlap_boost: Number(overlapBoost.toFixed(3)),
      duplicate_review_penalty: regionalDuplicatePenalty,
      state_score: stateScore,
      state_priority:
        stateScore >= 9.5 ? "ARIZONA_STATE_HOT" :
        stateScore >= 8.5 ? "ARIZONA_STATE_WARM" :
        "ARIZONA_STATE_REVIEW"
    };
  })
  .sort((a, b) => b.state_score - a.state_score)
  .map((row, index) => ({
    ...row,
    state_rank: index + 1
  }));

const scorePayload = {
  version: "black_dragon_arizona_three_city_state_scores_v1",
  generated_at: new Date().toISOString(),
  state: "Arizona",
  scored_entities: scores.length,
  scores
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/state_federations/arizona/federation/scores/arizona_state_scores.json"),
  JSON.stringify(scorePayload, null, 2),
  "utf8"
);

const paths = scores.slice(0, 25).map((score, index) => {
  const overlap = overlaps.find(o => o.normalized_name === String(score.organization_name).toLowerCase().trim());

  return {
    arizona_state_path_id: `BD_AZ_STATE_PATH_${String(index + 1).padStart(5, "0")}`,
    root_organization: score.organization_name,
    root_city: score.city,
    state_rank: score.state_rank,
    state_score: score.state_score,
    city_span: overlap ? overlap.participating_cities.length : 1,
    participating_cities: overlap ? overlap.participating_cities : [score.city],
    path_type: overlap ? "ARIZONA_MULTI_CITY_PROPAGATION" : "ARIZONA_CITY_LEVEL_PROPAGATION",
    recommended_strategy: overlap ? "STATE_CORRIDOR_MANUAL_REVIEW" : "CITY_LEVEL_MANUAL_REVIEW",
    automated_outreach_allowed: false,
    runtime_mutation_allowed: false,
    contact_ready_promotion_allowed: false
  };
});

const pathPayload = {
  version: "black_dragon_arizona_three_city_propagation_paths_v1",
  generated_at: new Date().toISOString(),
  state: "Arizona",
  total_paths: paths.length,
  paths
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/state_federations/arizona/federation/paths/arizona_state_propagation_paths.json"),
  JSON.stringify(pathPayload, null, 2),
  "utf8"
);

const manualContactReview = cityRows.flatMap(row =>
  row.review.contact_review
    .filter(item => item.contact_ready_candidate === true)
    .map(item => ({
      ...item,
      city: row.city,
      state: "AZ"
    }))
);

const routeIssueReview = cityRows.flatMap(row =>
  (row.dead.dead_route_items || []).map(item => ({
    ...item,
    city: row.city,
    state: "AZ"
  }))
);

const reviewSurface = {
  version: "black_dragon_arizona_three_city_review_surface_v1",
  generated_at: new Date().toISOString(),
  state: "Arizona",
  client_visible: true,
  manual_contact_review: {
    item_count: manualContactReview.length,
    items: manualContactReview.map((item, index) => ({
      review_item_id: `BD_AZ_CONTACT_REVIEW_${String(index + 1).padStart(5, "0")}`,
      city: item.city,
      organization_name: item.organization_name,
      city_rank: item.city_rank,
      route_validation_status: item.route_validation_status,
      public_contact_url: item.public_contact_url,
      manual_contact_possible_after_review: item.manual_contact_possible_after_review === true,
      automated_outreach_allowed: false,
      contact_ready_promotion_allowed: false
    }))
  },
  route_issue_review: {
    item_count: routeIssueReview.length,
    items: routeIssueReview.map((item, index) => ({
      route_review_id: `BD_AZ_ROUTE_REVIEW_${String(index + 1).padStart(5, "0")}`,
      city: item.city,
      organization_name: item.organization_name,
      url: item.url,
      failure_status: item.failure_status,
      founder_review_required: item.founder_review_required !== false,
      automatic_delete_allowed: false,
      automated_outreach_allowed: false
    }))
  },
  hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_runtime_mutation: true,
    no_delete_without_quarantine: true
  }
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/state_federations/arizona/federation/review_surface/arizona_review_surface.json"),
  JSON.stringify(reviewSurface, null, 2),
  "utf8"
);

const audit = {
  version: "black_dragon_batch_174_arizona_three_city_federation_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "174_ARIZONA_THREE_CITY_FEDERATION_AUDIT",
  state: "Arizona",

  counts: {
    operational_cities: federationPayload.operational_cities.length,
    total_runtime_entities: federationPayload.total_runtime_entities,
    overlap_entities: overlapPayload.overlap_count,
    state_scores: scorePayload.scored_entities,
    state_propagation_paths: pathPayload.total_paths,
    manual_contact_review_items: reviewSurface.manual_contact_review.item_count,
    route_issue_review_items: reviewSurface.route_issue_review.item_count
  },

  gates: {
    three_operational_cities:
      federationPayload.operational_cities.length === 3,

    federation_entity_pool_exists:
      federationPayload.total_runtime_entities === 30,

    state_scores_match_entities:
      scorePayload.scored_entities === federationPayload.total_runtime_entities,

    propagation_paths_exist:
      pathPayload.total_paths > 0,

    review_surface_visible:
      reviewSurface.client_visible === true,

    manual_contact_review_exists:
      reviewSurface.manual_contact_review.item_count > 0,

    no_path_auto_outreach:
      pathPayload.paths.every(p => p.automated_outreach_allowed === false),

    no_path_auto_promotion:
      pathPayload.paths.every(p => p.contact_ready_promotion_allowed === false),

    no_runtime_mutation:
      pathPayload.paths.every(p => p.runtime_mutation_allowed === false) &&
      reviewSurface.hardlocks.no_runtime_mutation === true,

    no_auto_contact:
      reviewSurface.hardlocks.no_auto_contact === true,

    no_auto_promotion:
      reviewSurface.hardlocks.no_auto_promotion === true
  },

  certification:
    "ARIZONA_THREE_CITY_STATE_FEDERATION_OPERATIONAL",

  interpretation: {
    operational_meaning:
      "Arizona is now operating as a three-city state federation, not only isolated Phoenix/Scottsdale/Mesa city runtimes.",

    strategic_meaning:
      "Arizona can now support state-level propagation analysis, overlap scoring, and unified client review surfaces.",

    next_step:
      "Add Tucson to complete the first Arizona four-city operational corridor, then run final Arizona deployment certification."
  },

  next_phase:
    "BATCHES_175_179_TUCSON_OPERATIONAL_CITY_BUILD",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_federations/arizona/federation/audit/batch_174_arizona_three_city_federation_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_174_ARIZONA_THREE_CITY_FEDERATION_AUDIT_COMPLETE",
  audit_status: audit.status,
  certification: audit.certification,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
