const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const cities = [
  {
    city: "Phoenix",
    runtime: read("public/data/clients/black_dragon/city_runtime/phoenix/merged/phoenix_merged_city_entities.json"),
    review: read("public/data/clients/black_dragon/automation/live_validation/phoenix/contact_review/contact_route_review.json"),
    dead: read("public/data/clients/black_dragon/automation/live_validation/phoenix/dead_routes/dead_route_review_queue.json")
  },
  {
    city: "Scottsdale",
    runtime: read("public/data/clients/black_dragon/city_runtime/scottsdale/merged/scottsdale_merged_city_entities.json"),
    review: read("public/data/clients/black_dragon/automation/live_validation/scottsdale/contact_review/contact_route_review.json"),
    dead: read("public/data/clients/black_dragon/automation/live_validation/scottsdale/dead_routes/dead_route_review_queue.json")
  },
  {
    city: "Mesa",
    runtime: read("public/data/clients/black_dragon/city_runtime/mesa/merged/mesa_merged_city_entities.json"),
    review: read("public/data/clients/black_dragon/automation/live_validation/mesa/contact_review/contact_route_review.json"),
    dead: read("public/data/clients/black_dragon/automation/live_validation/mesa/dead_routes/dead_route_review_queue.json")
  },
  {
    city: "Tucson",
    runtime: read("public/data/clients/black_dragon/city_runtime/tucson/merged/tucson_merged_city_entities.json"),
    review: read("public/data/clients/black_dragon/automation/live_validation/tucson/contact_review/contact_route_review.json"),
    dead: read("public/data/clients/black_dragon/automation/live_validation/tucson/dead_routes/dead_route_review_queue.json")
  }
];

const federationEntities = cities.flatMap(row =>
  row.runtime.merged_entities.map(entity => ({
    ...entity,
    federation_city: row.city,
    federation_state: "Arizona"
  }))
);

const federation = {
  version: "black_dragon_arizona_four_city_federation_entities_v1",
  generated_at: new Date().toISOString(),
  state: "Arizona",
  federation_id: "BLACK_DRAGON_ARIZONA_OPERATIONAL_CORRIDOR",
  federation_status: "FOUR_CITY_STATE_FEDERATION_OPERATIONAL",
  operational_cities: cities.map(c => c.city),
  total_runtime_entities: federationEntities.length,
  federation_entities: federationEntities
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/state_federations/arizona/federation/graph/arizona_federation_entities.json"),
  JSON.stringify(federation, null, 2),
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

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/state_federations/arizona/federation/overlaps/arizona_overlap_registry.json"),
  JSON.stringify({
    version: "black_dragon_arizona_four_city_overlap_registry_v1",
    generated_at: new Date().toISOString(),
    state: "Arizona",
    overlap_count: overlaps.length,
    overlaps
  }, null, 2),
  "utf8"
);

const scores = federationEntities
  .map(entity => {
    const key = String(entity.organization_name).toLowerCase().trim();
    const overlap = overlaps.find(o => o.normalized_name === key);
    const cityDiversity = overlap ? overlap.participating_cities.length : 1;
    const overlapBoost = overlap ? Math.min(1.25, cityDiversity * 0.32) : 0;
    const duplicatePenalty =
      entity.regional_duplicate_detected || entity.cross_state_duplicate_detected
        ? 0.12
        : 0;

    const stateScore = Number(
      Math.max(0, entity.best_score + overlapBoost - duplicatePenalty).toFixed(2)
    );

    return {
      arizona_federation_entity_id: entity.city_runtime_entity_id,
      organization_name: entity.organization_name,
      city: entity.federation_city,
      city_rank: entity.city_rank,
      base_score: entity.best_score,
      city_diversity: cityDiversity,
      overlap_boost: Number(overlapBoost.toFixed(3)),
      duplicate_review_penalty: duplicatePenalty,
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

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/state_federations/arizona/federation/scores/arizona_state_scores.json"),
  JSON.stringify({
    version: "black_dragon_arizona_four_city_state_scores_v1",
    generated_at: new Date().toISOString(),
    state: "Arizona",
    scored_entities: scores.length,
    scores
  }, null, 2),
  "utf8"
);

const paths = scores.slice(0, 25).map((score, index) => {
  const overlap = overlaps.find(
    o => o.normalized_name === String(score.organization_name).toLowerCase().trim()
  );

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

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/state_federations/arizona/federation/paths/arizona_state_propagation_paths.json"),
  JSON.stringify({
    version: "black_dragon_arizona_four_city_propagation_paths_v1",
    generated_at: new Date().toISOString(),
    state: "Arizona",
    total_paths: paths.length,
    paths
  }, null, 2),
  "utf8"
);

const manualContactReview = cities.flatMap(row =>
  row.review.contact_review
    .filter(item => item.contact_ready_candidate === true)
    .map(item => ({
      ...item,
      city: row.city,
      state: "AZ"
    }))
);

const routeIssueReview = cities.flatMap(row =>
  (row.dead.dead_route_items || []).map(item => ({
    ...item,
    city: row.city,
    state: "AZ"
  }))
);

const reviewSurface = {
  version: "black_dragon_arizona_four_city_review_surface_v1",
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
  version: "black_dragon_batch_180R_arizona_four_city_rebuild_audit_v1",
  generated_at: new Date().toISOString(),

  batch: "180R_ARIZONA_FOUR_CITY_FEDERATION_REBUILD",

  state: "Arizona",

  counts: {
    operational_cities: federation.operational_cities.length,
    federation_entities: federation.total_runtime_entities,
    overlap_entities: overlaps.length,
    statewide_scores: scores.length,
    statewide_paths: paths.length,
    manual_contact_candidates: reviewSurface.manual_contact_review.item_count,
    route_review_items: reviewSurface.route_issue_review.item_count
  },

  gates: {
    four_operational_cities:
      federation.operational_cities.length === 4,

    tucson_included:
      federation.operational_cities.includes("Tucson"),

    statewide_entity_pool_exists:
      federation.total_runtime_entities === 40,

    statewide_scores_exist:
      scores.length === 40,

    statewide_paths_exist:
      paths.length > 0,

    review_surface_operational:
      reviewSurface.client_visible === true,

    no_auto_contact:
      reviewSurface.hardlocks.no_auto_contact === true &&
      paths.every(p => p.automated_outreach_allowed === false),

    no_auto_promotion:
      reviewSurface.hardlocks.no_auto_promotion === true &&
      paths.every(p => p.contact_ready_promotion_allowed === false),

    no_runtime_mutation:
      reviewSurface.hardlocks.no_runtime_mutation === true &&
      paths.every(p => p.runtime_mutation_allowed === false)
  },

  certification:
    "ARIZONA_FULL_STATE_DEPLOYMENT_CERTIFIED_REPAIRED",

  next_phase:
    "BATCH_181_NEVADA_MASTER_STATE_INITIALIZATION",

  status:
    "PASS"
};

const allGatesPass = Object.values(audit.gates).every(Boolean);
if (!allGatesPass) {
  audit.status = "FAIL";
  audit.certification = "ARIZONA_FULL_STATE_DEPLOYMENT_REPAIR_FAILED";
  audit.next_phase = "REPAIR_REQUIRED_BEFORE_NEVADA";
}

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_federations/arizona/deployment/audit/batch_180R_arizona_four_city_rebuild_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_180R_ARIZONA_FOUR_CITY_REBUILD_COMPLETE",
  audit_status: audit.status,
  certification: audit.certification,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));

if (!allGatesPass) process.exit(1);
