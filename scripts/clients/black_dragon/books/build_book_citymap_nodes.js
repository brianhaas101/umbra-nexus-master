const fs = require("fs");
const path = require("path");

const layerPath = path.resolve(
  "public/data/clients/black_dragon/books/map/layers/book_propagation_map_layer.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/map/runtime/book_citymap_nodes.v1.json"
);

const layer = JSON.parse(fs.readFileSync(layerPath, "utf8"));

const nodes = (layer.features || []).map((f, index) => {
  const p = f.properties || {};
  const coords = f.geometry && Array.isArray(f.geometry.coordinates)
    ? f.geometry.coordinates
    : [-98.5795, 39.8283];

  return {
    node_id: `BD_BOOK_MAP_NODE_${String(index + 1).padStart(5, "0")}`,
    entity_id: p.entity_id,
    client_id: "black_dragon",
    module: "book_sales_v2",

    label: p.organization_name || "Unknown Target",
    organization_name: p.organization_name || "Unknown Target",
    leader_role: p.leader_role || "UNKNOWN",
    organization_type: p.organization_type || "UNKNOWN",

    lon: Number(coords[0]),
    lat: Number(coords[1]),

    region: p.region || "National",
    country: p.country || "USA",

    propagation_score: Number(p.propagation_score || 0),
    adaptive_priority_score: Number(p.adaptive_priority_score || 0),
    queue_priority_score: Number(p.queue_priority_score || 0),
    visual_score: Number(p.visual_score || 0),
    visual_intensity: p.visual_intensity || "LOW",

    queue_status: p.queue_status || "UNKNOWN",
    recommended_action: p.recommended_action || null,
    response_status: p.response_status || null,
    response_classification: p.response_classification || null,

    render: {
      node_type: "BLACK_DRAGON_BOOK_TARGET",
      visible_in_world: true,
      visible_in_city_map: true,
      pickable: true,
      pulse_enabled: true,
      scale_hint:
        p.visual_intensity === "CRITICAL" ? 1.45 :
        p.visual_intensity === "HIGH" ? 1.25 :
        p.visual_intensity === "MEDIUM" ? 1.05 :
        0.85
    }
  };
});

const payload = {
  version: "black_dragon_books_citymap_nodes_v1",
  generated_at: new Date().toISOString(),

  client_id: "black_dragon",
  module: "book_sales_v2",

  totals: {
    nodes: nodes.length,
    critical: nodes.filter(n => n.visual_intensity === "CRITICAL").length,
    high: nodes.filter(n => n.visual_intensity === "HIGH").length,
    medium: nodes.filter(n => n.visual_intensity === "MEDIUM").length,
    low: nodes.filter(n => n.visual_intensity === "LOW").length,
    with_responses: nodes.filter(n => !!n.response_status).length
  },

  nodes
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

console.log(JSON.stringify({
  status: "BLACK_DRAGON_CITYMAP_NODES_CREATED",
  totals: payload.totals,
  output: outputPath
}, null, 2));
