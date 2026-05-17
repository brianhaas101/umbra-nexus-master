const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const readiness = read(
  "public/data/clients/black_dragon/automation/readiness/audit/batch_129_autonomous_system_readiness_audit.json"
);

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"
);

const scheduler = read(
  "public/data/clients/black_dragon/automation/scheduler/scheduler_hook_registry.json"
);

const clientFeed = read(
  "public/data/clients/black_dragon/automation/client_feed/client_updates_feed.json"
);

const monitoring = read(
  "public/data/clients/black_dragon/automation/admin_monitoring/automation_admin_monitoring.json"
);

const checkpoint = {
  version:
    "black_dragon_long_beach_autonomous_runtime_checkpoint_v1",

  generated_at:
    new Date().toISOString(),

  checkpoint_id:
    "BLACK_DRAGON_LONG_BEACH_AUTONOMOUS_RUNTIME_POST_BATCH_130",

  city:
    "Long Beach",

  state:
    "CA",

  operational_status:
    "LOCKED_AUTONOMOUS_RUNTIME_BASELINE",

  readiness_audit_status:
    readiness.status,

  readiness_checks:
    readiness.counts,

  runtime_counts: {
    deduped_entities:
      runtime.deduped_city_entities,

    contact_ready_entities:
      runtime.contact_ready_entities,

    hot:
      runtime.merged_entities.filter(
        e => e.priority_tier === "HOT"
      ).length,

    warm:
      runtime.merged_entities.filter(
        e => e.priority_tier === "WARM"
      ).length,

    review:
      runtime.merged_entities.filter(
        e => e.priority_tier === "REVIEW"
      ).length
  },

  autonomous_capabilities: [
    "DISCOVERY_ENGINE",
    "REVALIDATION_ENGINE",
    "SIGNAL_FRESHNESS_ENGINE",
    "ENTITY_AGGREGATION_ENGINE",
    "SCHEDULED_RECURRING_PIPELINES",
    "CONTINUOUS_ENTITY_REFRESH",
    "CONTINUOUS_RELATIONSHIP_REFRESH",
    "CONTINUOUS_SCORE_REFRESH",
    "SIGNAL_AGE_WEIGHTING",
    "STALE_ENTITY_DETECTION",
    "INACTIVE_ORGANIZATION_DECAY",
    "BROKEN_ROUTE_DECAY",
    "DEAD_LINK_SUPPRESSION"
  ],

  scheduler_hooks:
    scheduler.hooks.map(h => ({
      hook_id: h.hook_id,
      cadence: h.cadence,
      enabled: h.enabled
    })),

  client_feed_status:
    clientFeed.feed_status,

  monitoring_health:
    monitoring.health,

  hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_delete_without_quarantine: true,
    quarantine_before_runtime: true,
    verified_route_required_for_contact_ready: true
  },

  replication_policy: {
    replication_allowed: true,
    architecture_locked_before_replication: true,
    future_cities_must_inherit_same_laws: true,
    runtime_mutation_requires_logging: true,
    freshness_engine_required: true,
    revalidation_engine_required: true
  },

  next_phase:
    "DATABASE_AND_SOURCE_EXPANSION_BEFORE_STATE_REPLICATION"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/checkpoints/long_beach_autonomous_runtime/exports/long_beach_autonomous_runtime_checkpoint.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(checkpoint, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "LONG_BEACH_AUTONOMOUS_RUNTIME_CHECKPOINT_COMPLETE",

  checkpoint_id:
    checkpoint.checkpoint_id,

  runtime_entities:
    checkpoint.runtime_counts.deduped_entities,

  autonomous_capabilities:
    checkpoint.autonomous_capabilities.length,

  output:
    out
}, null, 2));
