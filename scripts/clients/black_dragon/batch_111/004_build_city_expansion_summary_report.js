const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const counts = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/target_expansion/planning/city_target_counts.json"),
  "utf8"
));

const tasks = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/target_expansion/queues/city_expansion_gap_queue.json"),
  "utf8"
));

const topReady = counts.cities
  .filter(c => c.clean_seed_count >= 20)
  .sort((a, b) => b.clean_seed_count - a.clean_seed_count);

const needsExpansion = counts.cities
  .filter(c => c.clean_seed_count < 20)
  .sort((a, b) => b.expansion_gap - a.expansion_gap);

const report = {
  version: "black_dragon_city_expansion_summary_report_v1",
  generated_at: new Date().toISOString(),

  target_goal_per_city: counts.target_goal_per_city,

  totals: {
    total_cities: counts.total_cities,
    cities_at_or_above_20: topReady.length,
    cities_needing_expansion: needsExpansion.length,
    total_expansion_tasks: tasks.total_expansion_tasks,
    total_new_verified_targets_needed:
      needsExpansion.reduce((sum, c) => sum + c.expansion_gap, 0)
  },

  cities_at_or_above_goal: topReady,

  cities_needing_expansion: needsExpansion
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/planning/city_expansion_summary_report.json"
);

fs.writeFileSync(out, JSON.stringify(report, null, 2));

console.log(JSON.stringify({
  status: "CITY_EXPANSION_SUMMARY_REPORT_COMPLETE",
  totals: report.totals,
  output: out
}, null, 2));
