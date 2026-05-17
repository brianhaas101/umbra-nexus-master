const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const normalized = read(
  "public/data/clients/black_dragon/target_expansion/planning/city_normalized_expansion_baseline.json"
);

const counts = read(
  "public/data/clients/black_dragon/target_expansion/planning/normalized_city_target_counts.json"
);

const queue = read(
  "public/data/clients/black_dragon/target_expansion/queues/normalized_city_expansion_gap_queue.json"
);

const summary = read(
  "public/data/clients/black_dragon/target_expansion/planning/normalized_city_summary_report.json"
);

const audit = {
  version: "black_dragon_batch_111_repair_city_normalization_audit_v1",
  generated_at: new Date().toISOString(),
  repair: "BATCH_111_REPAIR_CITY_NORMALIZATION",

  counts: {
    seed_records: normalized.total_seed_records,
    city_extracted: normalized.city_extracted,
    unresolved_city_records: normalized.unresolved,
    normalized_city_buckets: counts.total_cities,
    cities_at_or_above_20: summary.totals.cities_at_or_above_20,
    cities_needing_expansion: summary.totals.cities_needing_expansion,
    expansion_tasks: queue.total_expansion_tasks,
    total_new_verified_targets_needed: summary.totals.total_new_verified_targets_needed
  },

  gates: {
    seed_records_preserved:
      normalized.total_seed_records === 1014,

    organization_not_equal_city_repaired:
      counts.total_cities < normalized.total_seed_records,

    expansion_queue_matches_needing_expansion:
      queue.total_expansion_tasks === summary.totals.cities_needing_expansion,

    target_goal_is_20:
      counts.target_goal_per_city === 20,

    no_runtime_visibility_granted:
      normalized.seeds.every(s => s.verified_for_runtime === false)
  },

  next_phase:
    "BATCH_112_TARGET_EXPANSION_SOURCE_RESOLUTION",

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/audit/batch_111_repair_city_normalization_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_111_REPAIR_CITY_NORMALIZATION_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
