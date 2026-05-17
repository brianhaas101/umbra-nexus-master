const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const cleanPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/planning/normalized_city_target_counts.clean.json"
);

const counts = JSON.parse(fs.readFileSync(cleanPath, "utf8"));

const queue = counts.cities
  .filter(c => c.expansion_gap > 0)
  .map((city, index) => ({
    expansion_work_id:
      `BD_EXPANSION_WORK_${String(index + 1).padStart(5, "0")}`,

    city: city.city,
    state: city.state,
    country: city.country || "USA",

    current_clean_seed_count: city.clean_seed_count,
    target_goal: city.target_goal,
    expansion_gap: city.expansion_gap,

    required_new_verified_targets: city.expansion_gap,

    expansion_status:
      "PENDING_REAL_SOURCE_RESOLUTION",

    source_resolution_required:
      true,

    runtime_visibility_allowed:
      false,

    contact_ready:
      false,

    automated_outreach_allowed:
      false,

    promotion_allowed:
      false
  }));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/source_resolution/queues/clean_city_expansion_work_queue.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_clean_city_expansion_work_queue_v1",
  generated_at: new Date().toISOString(),
  total_city_expansion_tasks: queue.length,
  queue
}, null, 2));

console.log(JSON.stringify({
  status: "CLEAN_CITY_EXPANSION_WORK_QUEUE_COMPLETE",
  total_city_expansion_tasks: queue.length,
  output: out
}, null, 2));
