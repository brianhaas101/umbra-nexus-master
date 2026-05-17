const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const discovery_registry = {

  version:
    "black_dragon_discovery_engine_registry_v1",

  generated_at:
    new Date().toISOString(),

  engine_id:
    "BD_DISCOVERY_ENGINE_V1",

  city_scope:
    ["Long Beach"],

  enabled:
    true,

  discovery_targets: [

    "motorcycle_podcasts",
    "motorcycle_youtube_channels",
    "motorcycle_events",
    "motorcycle_swap_meets",
    "motorcycle_dealerships",
    "motorcycle_media",
    "motorcycle_clubs",
    "motorcycle_nonprofits",
    "motorcycle_influencers",
    "motorcycle_community_venues",
    "motorcycle_tattoo_shops",
    "motorcycle_barber_networks",
    "motorcycle_fundraisers",
    "motorcycle_event_vendors"
  ],

  candidate_queue_only:
    true,

  direct_runtime_promotion_allowed:
    false,

  automated_contact_allowed:
    false,

  quarantine_unknown_entities:
    true,

  duplicate_prevention_enabled:
    true,

  entity_aggregation_enabled:
    true,

  review_required_before_contact_ready:
    true
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/discovery_queue/discovery_engine_registry.json"
);

fs.writeFileSync(out, JSON.stringify(discovery_registry, null, 2));

console.log(JSON.stringify({
  status: "DISCOVERY_ENGINE_REGISTRY_COMPLETE",
  discovery_targets: discovery_registry.discovery_targets.length,
  output: out
}, null, 2));
