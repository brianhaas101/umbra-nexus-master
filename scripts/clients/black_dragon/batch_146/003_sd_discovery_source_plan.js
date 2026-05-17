const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const registry = read(
  "public/data/clients/black_dragon/database_expansion/registries/database_source_registry.json"
);

const sourcePlan = {
  version: "black_dragon_san_diego_discovery_source_plan_v1",
  generated_at: new Date().toISOString(),

  city: "San Diego",
  state: "CA",

  source_categories:
    registry.categories.map(category => ({
      category: category.category,
      source_count: category.sources.length,
      sources:
        category.sources.map(source => ({
          source_id: source.source_id,
          source_name: source.source_name,
          source_type: source.source_type,
          discovery_priority: source.discovery_priority || "UNSPECIFIED",
          city_query_required: true,
          candidate_only_until_validated: true
        }))
    })),

  discovery_rules: {
    candidate_queue_only: true,
    no_direct_runtime_promotion: true,
    dedupe_before_merge: true,
    source_lineage_required: true,
    freshness_required: true,
    cross_city_dedupe_required: true
  },

  expected_local_vectors: [
    "coastal riding community",
    "military and veteran rider networks",
    "motorcycle dealerships",
    "bike nights",
    "regional Southern California events",
    "cross-border and desert ride corridors"
  ]
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/template_alignment/san_diego/exports/san_diego_discovery_source_plan.json"
);

fs.writeFileSync(out, JSON.stringify(sourcePlan, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_DISCOVERY_SOURCE_PLAN_COMPLETE",
  source_categories: sourcePlan.source_categories.length,
  total_sources: sourcePlan.source_categories.reduce((sum, c) => sum + c.source_count, 0),
  output: out
}, null, 2));
