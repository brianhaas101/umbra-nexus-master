const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const summaryPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/planning/normalized_city_summary_report.json"
);

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));

const queue = summary.cities_needing_expansion.map((city, index) => ({

  organization_discovery_task_id:
    `BD_ORG_DISCOVERY_${String(index + 1).padStart(5, "0")}`,

  city:
    city.city,

  state:
    city.state,

  country:
    "USA",

  current_clean_seed_count:
    city.clean_seed_count,

  target_goal:
    city.target_goal,

  expansion_gap:
    city.expansion_gap,

  discovery_categories: [

    "MOTORCYCLE_CLUB",
    "MOTORCYCLE_RIGHTS_ORGANIZATION",
    "ABATE_CHAPTER",
    "MOTORCYCLE_EVENT_ORGANIZER",
    "HARLEY_DEALERSHIP",
    "INDEPENDENT_MOTORCYCLE_SHOP",
    "CUSTOM_MOTORCYCLE_BUILDER",
    "MOTORCYCLE_MUSEUM",
    "MOTORCYCLE_MEDIA",
    "MOTORCYCLE_PODCAST",
    "LAW_ENFORCEMENT_MC_UNIT",
    "GANG_INVESTIGATION_UNIT",
    "PUBLIC_SAFETY_TRAINING",
    "VETERAN_RIDING_GROUP",
    "COMMUNITY_RIDING_ASSOCIATION"
  ],

  runtime_visibility_allowed:
    false,

  dossier_creation_allowed:
    false,

  contact_ready:
    false,

  automated_outreach_allowed:
    false,

  founder_integrity_lock:
    true,

  discovery_status:
    "PENDING_REAL_ORGANIZATION_DISCOVERY"
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/organization_discovery/queues/city_organization_discovery_queue.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_city_organization_discovery_queue_v1",
  generated_at: new Date().toISOString(),
  total_discovery_tasks: queue.length,
  queue
}, null, 2));

console.log(JSON.stringify({
  status: "CITY_ORGANIZATION_DISCOVERY_QUEUE_COMPLETE",
  total_discovery_tasks: queue.length,
  output: out
}, null, 2));
