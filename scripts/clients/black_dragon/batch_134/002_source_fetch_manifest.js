const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const manifest = {
  version: "black_dragon_source_fetch_manifest_v1",
  generated_at: new Date().toISOString(),

  city: "Long Beach",
  state: "CA",

  fetch_mode: "DRY_RUN_VALIDATION_READY",

  source_groups: [
    {
      group_id: "EVENT_DISCOVERY_FETCH",
      category: "EVENT_DISCOVERY",
      enabled: true,
      sources: [
        { source_name: "CycleFish", validation_target: "EVENT_CALENDAR", fetch_allowed: true },
        { source_name: "LightningCustoms", validation_target: "EVENT_CALENDAR", fetch_allowed: true },
        { source_name: "RiderClubs Events", validation_target: "EVENT_DIRECTORY", fetch_allowed: true },
        { source_name: "Eventbrite Motorcycle Events", validation_target: "PUBLIC_EVENT_DISCOVERY", fetch_allowed: true },
        { source_name: "Meetup Riding Groups", validation_target: "GROUP_EVENT_DISCOVERY", fetch_allowed: true }
      ]
    },
    {
      group_id: "MEDIA_DISCOVERY_FETCH",
      category: "MOTORCYCLE_MEDIA",
      enabled: true,
      sources: [
        { source_name: "Motorcycle Podcasts", validation_target: "PODCAST_DIRECTORY", fetch_allowed: true },
        { source_name: "YouTube Motorcycle Creators", validation_target: "CREATOR_NETWORK", fetch_allowed: true },
        { source_name: "Motorcycle Magazine Networks", validation_target: "PUBLICATION_NETWORK", fetch_allowed: true },
        { source_name: "Reddit Motorcycle Communities", validation_target: "COMMUNITY_DISCUSSION_NETWORK", fetch_allowed: true }
      ]
    },
    {
      group_id: "DEALER_DISCOVERY_FETCH",
      category: "DEALERSHIP_NETWORKS",
      enabled: true,
      sources: [
        { source_name: "Harley-Davidson Dealer Network", validation_target: "DEALER_DIRECTORY", fetch_allowed: true },
        { source_name: "Indian Motorcycle Dealers", validation_target: "DEALER_DIRECTORY", fetch_allowed: true },
        { source_name: "BMW Motorrad Dealers", validation_target: "DEALER_DIRECTORY", fetch_allowed: true },
        { source_name: "PowerSports Dealer Registries", validation_target: "POWERSPORTS_DIRECTORY", fetch_allowed: true }
      ]
    },
    {
      group_id: "VETERAN_LEMC_FETCH",
      category: "VETERAN_AND_LEMC_NETWORKS",
      enabled: true,
      sources: [
        { source_name: "CVMA Chapters", validation_target: "VETERAN_MC_NETWORK", fetch_allowed: true },
        { source_name: "Patriot Guard Riders", validation_target: "VETERAN_RIDER_NETWORK", fetch_allowed: true },
        { source_name: "LEMC Directories", validation_target: "LAW_ENFORCEMENT_MC_NETWORK", fetch_allowed: true }
      ]
    },
    {
      group_id: "COMMUNITY_VENUE_FETCH",
      category: "COMMUNITY_VENUES",
      enabled: true,
      sources: [
        { source_name: "Bike Nights", validation_target: "COMMUNITY_EVENT_NETWORK", fetch_allowed: true },
        { source_name: "Tattoo and Barber Anchors", validation_target: "CULTURE_ANCHOR_NETWORK", fetch_allowed: true },
        { source_name: "Motorcycle Cafes", validation_target: "MOTO_COMMUNITY_VENUE", fetch_allowed: true },
        { source_name: "Moto Community Venues", validation_target: "COMMUNITY_GATHERING_VENUE", fetch_allowed: true }
      ]
    }
  ],

  promotion_policy: {
    fetch_results_candidate_only: true,
    verified_route_required_for_contact_ready: true,
    manual_validation_required_before_runtime_merge: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/fetch/manifests/source_fetch_manifest.json"
);

fs.writeFileSync(out, JSON.stringify(manifest, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SOURCE_FETCH_MANIFEST_COMPLETE",
  source_groups: manifest.source_groups.length,
  total_sources: manifest.source_groups.reduce((sum, g) => sum + g.sources.length, 0),
  output: out
}, null, 2));
