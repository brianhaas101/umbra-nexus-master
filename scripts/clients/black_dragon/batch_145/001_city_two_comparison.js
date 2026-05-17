const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const lbRuntime = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"
);

const laRuntime = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

const lbGraph = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/edges/long_beach_graph_edges.json"
);

const laGraph = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/edges/los_angeles_graph_edges.json"
);

const lbPaths = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/paths/long_beach_propagation_paths.json"
);

const laPaths = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/paths/los_angeles_propagation_paths.json"
);

const laContactReview = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/contact_review/contact_route_review.json"
);

const lbNames = new Set(
  lbRuntime.merged_entities.map(e => e.organization_name.toLowerCase())
);

const laNames = new Set(
  laRuntime.merged_entities.map(e => e.organization_name.toLowerCase())
);

const overlapNames = [...laNames].filter(name => lbNames.has(name));

const comparison = {
  version: "black_dragon_city_two_comparison_v1",
  generated_at: new Date().toISOString(),

  cities_compared: [
    "Long Beach, CA",
    "Los Angeles, CA"
  ],

  totals: {
    cities_operational: 2,
    combined_runtime_entities:
      lbRuntime.merged_entities.length + laRuntime.merged_entities.length,
    combined_graph_edges:
      lbGraph.total_edges + laGraph.total_edges,
    combined_propagation_paths:
      lbPaths.total_paths + laPaths.total_paths,
    combined_contact_ready_or_candidate_routes:
      lbRuntime.contact_ready_entities + laContactReview.contact_ready_candidates,
    cross_city_overlap_entities:
      overlapNames.length
  },

  city_breakdown: [
    {
      city: "Long Beach",
      state: "CA",
      status: "PRODUCTION_TEMPLATE_CITY",
      runtime_entities: lbRuntime.merged_entities.length,
      contact_ready_entities: lbRuntime.contact_ready_entities,
      graph_edges: lbGraph.total_edges,
      propagation_paths: lbPaths.total_paths
    },
    {
      city: "Los Angeles",
      state: "CA",
      status: "SECOND_OPERATIONAL_CITY",
      runtime_entities: laRuntime.merged_entities.length,
      contact_ready_candidates: laContactReview.contact_ready_candidates,
      graph_edges: laGraph.total_edges,
      propagation_paths: laPaths.total_paths,
      duplicate_review_entities: laRuntime.duplicate_review_entities
    }
  ],

  cross_city_overlaps: overlapNames.map(name => ({
    organization_name_normalized: name,
    overlap_type: "LONG_BEACH_LOS_ANGELES_SHARED_ENTITY",
    regional_graph_value: "HIGH"
  })),

  interpretation: {
    operational_meaning:
      "Black Dragon now has two operational Southern California city runtimes with graph intelligence, propagation paths, and live route review.",
    strategic_meaning:
      "The system is beginning to behave as a regional intelligence graph rather than isolated city lists.",
    next_expansion_logic:
      "The next city should extend the Southern California corridor before broader statewide rollout."
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/multi_city/comparison/long_beach_los_angeles_comparison.json"
);

fs.writeFileSync(out, JSON.stringify(comparison, null, 2), "utf8");

console.log(JSON.stringify({
  status: "CITY_TWO_COMPARISON_COMPLETE",
  totals: comparison.totals,
  output: out
}, null, 2));
