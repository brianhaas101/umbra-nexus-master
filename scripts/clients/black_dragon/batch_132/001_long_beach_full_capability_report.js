const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const registry = read(
  "public/data/clients/black_dragon/database_expansion/registries/database_source_registry.json"
);

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"
);

const checkpoint = read(
  "public/data/clients/black_dragon/checkpoints/long_beach_autonomous_runtime/exports/long_beach_autonomous_runtime_checkpoint.json"
);

const clientFeed = read(
  "public/data/clients/black_dragon/automation/client_feed/client_updates_feed.json"
);

const categories = registry.categories;

const totalDatabases =
  categories.reduce((sum, category) => sum + category.sources.length, 0);

const sourceTypes =
  Array.from(
    new Set(
      categories.flatMap(category =>
        category.sources.map(source => source.source_type)
      )
    )
  ).sort();

const sourcesByCategory =
  categories.map(category => ({
    category: category.category,
    description: category.description,
    source_count: category.sources.length,
    sources: category.sources.map(source => ({
      source_id: source.source_id,
      source_name: source.source_name,
      source_type: source.source_type,
      discovery_priority: source.discovery_priority || "UNSPECIFIED"
    }))
  }));

const runtimeEntities =
  runtime.merged_entities || [];

function countByLayer(layerName) {
  return runtimeEntities.filter(entity =>
    Array.isArray(entity.source_layers) &&
    entity.source_layers.includes(layerName)
  ).length;
}

const opportunitySurface = {
  total_deduped_runtime_entities:
    runtime.deduped_city_entities,

  contact_ready_entities:
    runtime.contact_ready_entities,

  hot_targets:
    runtimeEntities.filter(e => e.priority_tier === "HOT").length,

  warm_targets:
    runtimeEntities.filter(e => e.priority_tier === "WARM").length,

  review_targets:
    runtimeEntities.filter(e => e.priority_tier === "REVIEW").length,

  event_media_entities:
    countByLayer("EVENT_MEDIA"),

  retail_physical_channel_entities:
    countByLayer("RETAIL_PHYSICAL_CHANNEL"),

  club_association_entities:
    countByLayer("CLUB_ASSOCIATION"),

  support_infrastructure_entities:
    countByLayer("SUPPORT_INFRASTRUCTURE"),

  bulk_order_entities:
    countByLayer("BULK_ORDER"),

  online_distribution_entities:
    countByLayer("ONLINE_DISTRIBUTION"),

  culture_propagation_entities:
    countByLayer("CULTURE_PROPAGATION"),

  conversion_strategy_entities:
    countByLayer("CONVERSION_STRATEGY")
};

const estimatedReachModel = {
  note:
    "Conservative opportunity ranges only. These are operational exposure estimates, not guaranteed contacts or sales.",

  assumptions: {
    hot_target_min_reach: 100,
    hot_target_max_reach: 750,
    warm_target_min_reach: 25,
    warm_target_max_reach: 250,
    review_target_min_reach: 5,
    review_target_max_reach: 75,
    contact_ready_target_min_direct_action_value: 1,
    contact_ready_target_max_direct_action_value: 1
  }
};

const estimatedReach = {
  conservative_low_exposure:
    opportunitySurface.hot_targets * estimatedReachModel.assumptions.hot_target_min_reach +
    opportunitySurface.warm_targets * estimatedReachModel.assumptions.warm_target_min_reach +
    opportunitySurface.review_targets * estimatedReachModel.assumptions.review_target_min_reach,

  conservative_high_exposure:
    opportunitySurface.hot_targets * estimatedReachModel.assumptions.hot_target_max_reach +
    opportunitySurface.warm_targets * estimatedReachModel.assumptions.warm_target_max_reach +
    opportunitySurface.review_targets * estimatedReachModel.assumptions.review_target_max_reach,

  directly_actionable_public_routes:
    opportunitySurface.contact_ready_entities,

  newly_discovered_candidate_targets:
    clientFeed.summary_cards.find(card => card.card_id === "NEW_CANDIDATES")?.count || 0,

  routes_due_for_revalidation:
    clientFeed.summary_cards.find(card => card.card_id === "ROUTES_REVALIDATION")?.count || 0
};

const topTargets =
  runtimeEntities
    .slice(0, 25)
    .map(entity => ({
      city_rank: entity.city_rank,
      organization_name: entity.organization_name,
      priority_tier: entity.priority_tier,
      best_score: entity.best_score,
      source_layer_count: entity.source_layer_count,
      contact_ready: entity.contact_ready,
      source_layers: entity.source_layers
    }));

const report = {
  version:
    "black_dragon_long_beach_full_capability_report_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "Long Beach",

  state:
    "CA",

  checkpoint_id:
    checkpoint.checkpoint_id,

  summary: {
    total_database_sources_connected:
      totalDatabases,

    total_source_categories:
      categories.length,

    total_unique_source_types:
      sourceTypes.length,

    autonomous_capabilities:
      checkpoint.autonomous_capabilities.length,

    scheduler_hooks:
      checkpoint.scheduler_hooks.length,

    runtime_entities:
      runtime.deduped_city_entities,

    contact_ready_entities:
      runtime.contact_ready_entities,

    hot_targets:
      opportunitySurface.hot_targets,

    warm_targets:
      opportunitySurface.warm_targets,

    review_targets:
      opportunitySurface.review_targets,

    new_weekly_candidate_targets:
      estimatedReach.newly_discovered_candidate_targets
  },

  sources_by_category:
    sourcesByCategory,

  source_types:
    sourceTypes,

  opportunity_surface:
    opportunitySurface,

  estimated_reach_model:
    estimatedReachModel,

  estimated_reach:
    estimatedReach,

  top_25_runtime_targets:
    topTargets,

  hardlocks: {
    no_auto_contact:
      true,

    no_auto_promotion:
      true,

    quarantine_before_runtime:
      true,

    verified_route_required_for_contact_ready:
      true
  },

  interpretation: {
    what_this_means:
      "Black Dragon has a Long Beach autonomous runtime with database-backed discovery, ranked dossiers, map-visible targets, contact-route gating, and weekly update feeds.",

    what_it_does_not_mean:
      "It does not mean every exposed audience member is directly contactable, nor does it permit automated outreach.",

    client_value:
      "The system identifies where book sales, media propagation, event placement, club referrals, dealership placement, and digital distribution opportunities are strongest."
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/capability_audit/long_beach/exports/long_beach_full_capability_report.json"
);

fs.writeFileSync(out, JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LONG_BEACH_FULL_CAPABILITY_REPORT_COMPLETE",
  total_database_sources_connected: report.summary.total_database_sources_connected,
  total_source_categories: report.summary.total_source_categories,
  total_unique_source_types: report.summary.total_unique_source_types,
  runtime_entities: report.summary.runtime_entities,
  contact_ready_entities: report.summary.contact_ready_entities,
  conservative_low_exposure: estimatedReach.conservative_low_exposure,
  conservative_high_exposure: estimatedReach.conservative_high_exposure,
  output: out
}, null, 2));
