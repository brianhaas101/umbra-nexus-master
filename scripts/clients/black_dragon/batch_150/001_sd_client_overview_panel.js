const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/merged/san_diego_merged_city_entities.json"
);

const graph = read(
  "public/data/clients/black_dragon/relationship_graph/san_diego/edges/san_diego_graph_edges.json"
);

const paths = read(
  "public/data/clients/black_dragon/relationship_graph/san_diego/paths/san_diego_propagation_paths.json"
);

const contactReview = read(
  "public/data/clients/black_dragon/automation/live_validation/san_diego/contact_review/contact_route_review.json"
);

const deadRoutes = read(
  "public/data/clients/black_dragon/automation/live_validation/san_diego/dead_routes/dead_route_review_queue.json"
);

const panel = {
  version:
    "black_dragon_san_diego_client_overview_panel_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "San Diego",

  state:
    "CA",

  panel_id:
    "BD_SD_CLIENT_OVERVIEW",

  panel_title:
    "San Diego Operational Intelligence",

  client_visible:
    true,

  summary_cards: [
    {
      card_id: "SD_RUNTIME_ENTITIES",
      label: "Runtime Entities",
      count: runtime.deduped_city_entities
    },
    {
      card_id: "SD_CONTACT_CANDIDATES",
      label: "Manual Contact Candidates",
      count: contactReview.contact_ready_candidates
    },
    {
      card_id: "SD_GRAPH_EDGES",
      label: "Graph Edges",
      count: graph.total_edges
    },
    {
      card_id: "SD_PROPAGATION_PATHS",
      label: "Propagation Paths",
      count: paths.total_paths
    },
    {
      card_id: "SD_DEAD_ROUTE_REVIEW",
      label: "Dead Route Reviews",
      count: deadRoutes.review_item_count
    },
    {
      card_id: "SD_CROSS_CITY_DUPLICATES",
      label: "Cross-City Overlaps",
      count: runtime.duplicate_review_entities
    }
  ],

  hardlocks: {
    ui_can_recommend:
      true,

    ui_can_auto_contact:
      false,

    ui_can_auto_promote:
      false,

    ui_can_delete_targets:
      false,

    ui_can_mutate_runtime:
      false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/san_diego/ui/panels/san_diego_client_overview_panel.json"
);

fs.writeFileSync(out, JSON.stringify(panel, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_CLIENT_OVERVIEW_PANEL_COMPLETE",
  summary_cards: panel.summary_cards.length,
  output: out
}, null, 2));
