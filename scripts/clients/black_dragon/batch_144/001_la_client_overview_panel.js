const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

const graph = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/edges/los_angeles_graph_edges.json"
);

const paths = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/paths/los_angeles_propagation_paths.json"
);

const contactReview = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/contact_review/contact_route_review.json"
);

const deadRoutes = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/dead_routes/dead_route_review_queue.json"
);

const panel = {
  version: "black_dragon_los_angeles_client_overview_panel_v1",
  generated_at: new Date().toISOString(),

  client_id: "black_dragon_omg_cert_v1",
  city: "Los Angeles",
  state: "CA",

  panel_id: "BD_LA_CLIENT_OVERVIEW",
  panel_title: "Los Angeles Operational Intelligence",
  client_visible: true,

  summary_cards: [
    {
      card_id: "LA_RUNTIME_ENTITIES",
      label: "Runtime Entities",
      count: runtime.deduped_city_entities,
      meaning: "Los Angeles organizations currently visible in runtime."
    },
    {
      card_id: "LA_CONTACT_READY_CANDIDATES",
      label: "Manual Contact Candidates",
      count: contactReview.contact_ready_candidates,
      meaning: "Routes validated as reachable, pending manual review before action."
    },
    {
      card_id: "LA_GRAPH_EDGES",
      label: "Relationship Edges",
      count: graph.total_edges,
      meaning: "Detected relationship pathways inside the LA motorcycle ecosystem."
    },
    {
      card_id: "LA_PROPAGATION_PATHS",
      label: "Propagation Paths",
      count: paths.total_paths,
      meaning: "Influence paths for manual book-sale or awareness strategy."
    },
    {
      card_id: "LA_DEAD_ROUTE_REVIEW",
      label: "Route Review Items",
      count: deadRoutes.review_item_count,
      meaning: "Routes requiring review before manual action."
    },
    {
      card_id: "LA_CROSS_CITY_OVERLAPS",
      label: "Cross-City Overlaps",
      count: runtime.duplicate_review_entities,
      meaning: "Entities overlapping with Long Beach/regional graph context."
    }
  ],

  hardlocks: {
    ui_can_recommend: true,
    ui_can_auto_contact: false,
    ui_can_auto_promote: false,
    ui_can_delete_targets: false,
    ui_can_mutate_runtime: false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/los_angeles/ui/panels/los_angeles_client_overview_panel.json"
);

fs.writeFileSync(out, JSON.stringify(panel, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LOS_ANGELES_CLIENT_OVERVIEW_PANEL_COMPLETE",
  summary_cards: panel.summary_cards.length,
  output: out
}, null, 2));
