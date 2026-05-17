const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const phoenix = read(
  "public/data/clients/black_dragon/city_runtime/phoenix/merged/phoenix_merged_city_entities.json"
);

const scottsdale = read(
  "public/data/clients/black_dragon/city_runtime/scottsdale/merged/scottsdale_merged_city_entities.json"
);

const phxGraph = read(
  "public/data/clients/black_dragon/relationship_graph/phoenix/edges/phoenix_graph_edges.json"
);

const sctGraph = read(
  "public/data/clients/black_dragon/relationship_graph/scottsdale/edges/scottsdale_graph_edges.json"
);

const phxPaths = read(
  "public/data/clients/black_dragon/relationship_graph/phoenix/paths/phoenix_propagation_paths.json"
);

const sctPaths = read(
  "public/data/clients/black_dragon/relationship_graph/scottsdale/paths/scottsdale_propagation_paths.json"
);

const phxReview = read(
  "public/data/clients/black_dragon/automation/live_validation/phoenix/contact_review/contact_route_review.json"
);

const sctReview = read(
  "public/data/clients/black_dragon/automation/live_validation/scottsdale/contact_review/contact_route_review.json"
);

const phxNames = new Set(
  phoenix.merged_entities.map(e => String(e.organization_name).toLowerCase().trim())
);

const sctNames = new Set(
  scottsdale.merged_entities.map(e => String(e.organization_name).toLowerCase().trim())
);

const overlaps = [...sctNames].filter(name => phxNames.has(name));

const comparison = {
  version: "black_dragon_arizona_two_city_comparison_v1",
  generated_at: new Date().toISOString(),

  state: "Arizona",

  cities_compared: [
    "Phoenix, AZ",
    "Scottsdale, AZ"
  ],

  totals: {
    operational_cities: 2,
    combined_runtime_entities:
      phoenix.merged_entities.length + scottsdale.merged_entities.length,

    combined_graph_edges:
      phxGraph.total_edges + sctGraph.total_edges,

    combined_propagation_paths:
      phxPaths.total_paths + sctPaths.total_paths,

    combined_contact_ready_candidates:
      phxReview.contact_ready_candidates + sctReview.contact_ready_candidates,

    direct_city_overlap_entities:
      overlaps.length,

    scottsdale_regional_duplicates:
      scottsdale.duplicate_review_entities || 0
  },

  city_breakdown: [
    {
      city: "Phoenix",
      state: "AZ",
      status: "ARIZONA_FIRST_OPERATIONAL_CITY",
      runtime_entities: phoenix.merged_entities.length,
      graph_edges: phxGraph.total_edges,
      propagation_paths: phxPaths.total_paths,
      contact_ready_candidates: phxReview.contact_ready_candidates,
      route_review_items:
        phxReview.review_count - phxReview.contact_ready_candidates
    },
    {
      city: "Scottsdale",
      state: "AZ",
      status: "ARIZONA_SECOND_OPERATIONAL_CITY",
      runtime_entities: scottsdale.merged_entities.length,
      graph_edges: sctGraph.total_edges,
      propagation_paths: sctPaths.total_paths,
      contact_ready_candidates: sctReview.contact_ready_candidates,
      regional_duplicate_entities: scottsdale.duplicate_review_entities,
      route_review_items:
        sctReview.review_count - sctReview.contact_ready_candidates
    }
  ],

  direct_city_overlaps:
    overlaps.map(name => ({
      organization_name_normalized: name,
      overlap_type: "PHOENIX_SCOTTSDALE_SHARED_ENTITY",
      state_graph_value: "HIGH"
    })),

  interpretation: {
    operational_meaning:
      "Arizona now has two operational city runtimes with graph intelligence, live validation, propagation paths, and client-safe review logic.",

    structural_meaning:
      "Arizona is now ready to begin state-level federation preparation after Mesa is added.",

    next_expansion_logic:
      "Mesa should be added as the third Arizona city because it expands the Phoenix metro corridor and increases local overlap density before Tucson extends the southern route."
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_federations/arizona/comparison/phoenix_scottsdale_comparison.json"
);

fs.writeFileSync(out, JSON.stringify(comparison, null, 2), "utf8");

console.log(JSON.stringify({
  status: "ARIZONA_TWO_CITY_COMPARISON_COMPLETE",
  totals: comparison.totals,
  output: out
}, null, 2));
