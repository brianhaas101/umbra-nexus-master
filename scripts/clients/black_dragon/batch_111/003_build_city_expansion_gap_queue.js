const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const countsPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/planning/city_target_counts.json"
);

const counts = JSON.parse(fs.readFileSync(countsPath, "utf8"));

const queue = counts.cities
  .filter(c => c.expansion_gap > 0)
  .map((city, index) => ({
    city_expansion_task_id:
      `BD_CITY_EXPANSION_TASK_${String(index + 1).padStart(5, "0")}`,

    city:
      city.city,

    state:
      city.state,

    country:
      city.country,

    current_clean_seed_count:
      city.clean_seed_count,

    target_goal:
      city.target_goal,

    expansion_gap:
      city.expansion_gap,

    required_new_verified_targets:
      city.expansion_gap,

    expansion_priority:
      city.clean_seed_count === 0
        ? "HIGH"
        : city.clean_seed_count < 10
          ? "MEDIUM"
          : "LOW",

    required_target_types: [
      "LAW_ENFORCEMENT_AGENCY",
      "SHERIFF_OFFICE",
      "TRAINING_DIVISION",
      "PUBLIC_SAFETY_AGENCY",
      "GANG_OR_ORGANIZED_CRIME_UNIT",
      "CRIMINAL_JUSTICE_TRAINING_SOURCE"
    ],

    source_rules: {
      real_public_sources_only: true,
      verified_contact_route_required_before_runtime: true,
      no_synthetic_contacts: true,
      no_placeholder_orgs: true,
      no_automated_outreach: true
    },

    task_status:
      "PENDING_TARGET_EXPANSION"
  }));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/queues/city_expansion_gap_queue.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_city_expansion_gap_queue_v1",
  generated_at: new Date().toISOString(),
  total_expansion_tasks: queue.length,
  queue
}, null, 2));

console.log(JSON.stringify({
  status: "CITY_EXPANSION_GAP_QUEUE_COMPLETE",
  total_expansion_tasks: queue.length,
  output: out
}, null, 2));
