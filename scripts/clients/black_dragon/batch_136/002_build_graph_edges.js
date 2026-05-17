const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const graphNodes = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/nodes/long_beach_graph_nodes.json"
);

const nodes = graphNodes.nodes;

function overlap(a, b) {
  const aLayers = new Set(a.source_layers || []);
  const bLayers = new Set(b.source_layers || []);

  let shared = 0;

  for (const layer of aLayers) {
    if (bLayers.has(layer)) shared += 1;
  }

  return shared;
}

function relationshipType(a, b, sharedLayers) {
  if (sharedLayers > 0) return "SHARED_SOURCE_LAYER";

  if (
    a.graph_node_type === "EVENT_MEDIA_NODE" &&
    b.graph_node_type === "DIGITAL_PROPAGATION_NODE"
  ) return "EVENT_TO_DIGITAL_AMPLIFICATION";

  if (
    a.graph_node_type === "RETAIL_PLACEMENT_NODE" &&
    b.graph_node_type === "COMMUNITY_ASSOCIATION_NODE"
  ) return "RETAIL_TO_RIDER_COMMUNITY";

  if (
    a.graph_node_type === "CULTURE_PROPAGATION_NODE" &&
    b.graph_node_type === "DIGITAL_PROPAGATION_NODE"
  ) return "CULTURE_TO_DIGITAL_PROPAGATION";

  if (
    a.graph_node_type === "COMMUNITY_ASSOCIATION_NODE" &&
    b.graph_node_type === "EVENT_MEDIA_NODE"
  ) return "COMMUNITY_TO_EVENT_PROPAGATION";

  return null;
}

function edgeWeight(a, b, sharedLayers, type) {
  let base = 0;

  if (sharedLayers > 0) base += sharedLayers * 0.22;

  if (type && type !== "SHARED_SOURCE_LAYER") base += 0.35;

  base += Math.min(0.25, ((a.best_score || 0) + (b.best_score || 0)) / 100);

  if (a.contact_ready || b.contact_ready) base += 0.08;

  return Number(Math.min(1, base).toFixed(3));
}

const edges = [];

for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i];
    const b = nodes[j];

    const sharedLayers = overlap(a, b);
    const type = relationshipType(a, b, sharedLayers);

    if (!type) continue;

    const weight = edgeWeight(a, b, sharedLayers, type);

    if (weight < 0.25) continue;

    edges.push({
      graph_edge_id:
        `BD_LB_GRAPH_EDGE_${String(edges.length + 1).padStart(6, "0")}`,

      source_graph_node_id:
        a.graph_node_id,

      target_graph_node_id:
        b.graph_node_id,

      source_organization:
        a.organization_name,

      target_organization:
        b.organization_name,

      relationship_type:
        type,

      shared_layer_count:
        sharedLayers,

      edge_weight:
        weight,

      propagation_capable:
        [
          "EVENT_TO_DIGITAL_AMPLIFICATION",
          "CULTURE_TO_DIGITAL_PROPAGATION",
          "COMMUNITY_TO_EVENT_PROPAGATION",
          "SHARED_SOURCE_LAYER"
        ].includes(type),

      conversion_path_capable:
        [
          "RETAIL_TO_RIDER_COMMUNITY",
          "SHARED_SOURCE_LAYER"
        ].includes(type),

      graph_visible:
        true,

      runtime_mutation_allowed:
        false,

      automated_outreach_allowed:
        false
    });
  }
}

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/relationship_graph/long_beach/edges/long_beach_graph_edges.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_graph_edges_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_edges: edges.length,
  edges
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LONG_BEACH_GRAPH_EDGES_COMPLETE",
  total_edges: edges.length,
  output: out
}, null, 2));
