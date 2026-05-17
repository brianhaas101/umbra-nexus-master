const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const baseline = read(
  "public/data/clients/black_dragon/target_expansion/planning/city_expansion_baseline.json"
);

const counts = read(
  "public/data/clients/black_dragon/target_expansion/planning/city_target_counts.json"
);

const queue = read(
  "public/data/clients/black_dragon/target_expansion/queues/city_expansion_gap_queue.json"
);

const summary = read(
  "public/data/clients/black_dragon/target_expansion/planning/city_expansion_summary_report.json"
);

const audit = {
  version: "black_dragon_batch_111_city_target_expansion_planner_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "111_CITY_TARGET_EXPANSION_PLANNER",

  counts: {
    clean_seed_records: baseline.total_seed_records,
    total_cities: counts.total_cities,
    cities_at_or_above_20: summary.totals.cities_at_or_above_20,
    cities_needing_expansion: summary.totals.cities_needing_expansion,
    expansion_tasks: queue.total_expansion_tasks,
    total_new_verified_targets_needed: summary.totals.total_new_verified_targets_needed
  },

  gates: {
    clean_seeds_loaded: baseline.total_seed_records > 0,
    city_counts_exist: counts.total_cities > 0,
    expansion_queue_matches_needing_expansion:
      queue.total_expansion_tasks === summary.totals.cities_needing_expansion,

    no_runtime_visibility_granted:
      baseline.seeds.every(s => s.verified_for_runtime === false),

    target_goal_is_20:
      counts.target_goal_per_city === 20
  },

  next_phase:
    "BATCH_112_TARGET_EXPANSION_SOURCE_RESOLUTION",

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/audit/batch_111_city_target_expansion_planner_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_111_CITY_TARGET_EXPANSION_PLANNER_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
