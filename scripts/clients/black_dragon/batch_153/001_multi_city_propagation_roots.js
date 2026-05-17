const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const scores = read(
  "public/data/clients/black_dragon/federation/southern_california/scores/federation_regional_scores.json"
);

const overlaps = read(
  "public/data/clients/black_dragon/federation/southern_california/overlaps/federation_overlap_registry.json"
);

const overlapNames = new Set(
  overlaps.overlaps.map(o => o.normalized_name)
);

const roots = scores.scores
  .filter(row =>
    row.regional_score >= 8.5 ||
    overlapNames.has(row.organization_name.toLowerCase().trim())
  )
  .map((row, index) => ({
    propagation_root_id:
      `BD_SOCAL_PROP_ROOT_${String(index + 1).padStart(5, "0")}`,

    organization_name:
      row.organization_name,

    city:
      row.city,

    city_rank:
      row.city_rank,

    regional_rank:
      row.regional_rank,

    base_score:
      row.base_score,

    regional_score:
      row.regional_score,

    overlap_count:
      row.overlap_count,

    federation_priority:
      row.federation_priority,

    propagation_root_type:
      row.overlap_count > 1
        ? "MULTI_CITY_REGIONAL_ROOT"
        : row.federation_priority === "REGIONAL_HOT"
          ? "HIGH_SCORE_CITY_ROOT"
          : "LOCAL_PROPAGATION_ROOT",

    manual_action_required:
      true,

    automated_outreach_allowed:
      false,

    runtime_mutation_allowed:
      false
  }));

const payload = {
  version:
    "black_dragon_southern_california_multi_city_propagation_roots_v1",

  generated_at:
    new Date().toISOString(),

  corridor:
    "SOUTHERN_CALIFORNIA",

  root_count:
    roots.length,

  roots
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/propagation/roots/multi_city_propagation_roots.json"
);

fs.writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");

console.log(JSON.stringify({
  status: "MULTI_CITY_PROPAGATION_ROOTS_COMPLETE",
  root_count: payload.root_count,
  output: out
}, null, 2));
