const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const plan = {
  version:
    "black_dragon_database_expansion_strategy_v1",

  generated_at:
    new Date().toISOString(),

  purpose:
    "Expand source intelligence depth before statewide replication.",

  current_runtime_focus: [
    "motorcycle events",
    "motorcycle media",
    "retail channels",
    "clubs and associations",
    "support infrastructure",
    "online distribution",
    "conversion strategy",
    "culture expansion"
  ],

  next_database_targets: [
    {
      priority: 1,
      category: "EVENT_DISCOVERY",
      databases: [
        "CycleFish",
        "LightningCustoms",
        "RiderClubs",
        "Eventbrite motorcycle events",
        "Meetup riding groups"
      ],
      reason:
        "continuous biker event discovery and propagation"
    },

    {
      priority: 2,
      category: "MOTORCYCLE_MEDIA",
      databases: [
        "Podcast directories",
        "YouTube motorcycle creators",
        "Instagram biker brands",
        "TikTok motorcycle creators",
        "Motorcycle magazine networks"
      ],
      reason:
        "continuous audience propagation and digital exposure"
    },

    {
      priority: 3,
      category: "DEALERSHIP_NETWORKS",
      databases: [
        "Harley-Davidson dealer network",
        "Indian Motorcycle dealers",
        "BMW Motorrad dealers",
        "Metric motorcycle dealers",
        "PowerSports dealer registries"
      ],
      reason:
        "physical book placement and recurring retail exposure"
    },

    {
      priority: 4,
      category: "VETERAN_AND_LEMC_NETWORKS",
      databases: [
        "CVMA chapters",
        "Patriot Guard Riders",
        "LEMC directories",
        "Veteran motorcycle associations"
      ],
      reason:
        "high-probability cultural alignment and referrals"
    },

    {
      priority: 5,
      category: "COMMUNITY_VENUES",
      databases: [
        "Bike nights",
        "Tattoo/barber anchor locations",
        "Motorcycle cafes",
        "Moto community venues"
      ],
      reason:
        "persistent local discovery anchors"
    }
  ],

  expansion_rules: {
    no_fake_entities: true,
    no_auto_contact_ready: true,
    quarantine_before_runtime: true,
    dedupe_before_merge: true,
    freshness_engine_required: true,
    revalidation_required: true,
    source_lineage_required: true
  },

  recommended_next_batch:
    "BATCH_131_DATABASE_AND_SOURCE_EXPANSION_LAYER"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/checkpoints/long_beach_autonomous_runtime/exports/database_expansion_strategy.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(plan, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "DATABASE_EXPANSION_STRATEGY_COMPLETE",

  categories:
    plan.next_database_targets.length,

  output:
    out
}, null, 2));
