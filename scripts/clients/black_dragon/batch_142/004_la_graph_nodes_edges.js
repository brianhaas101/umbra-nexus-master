const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

const nodes = runtime.merged_entities.map(entity => ({
  graph_node_id:
    `BD_LA_GRAPH_NODE_${String(entity.city_rank).padStart(5, "0")}`,

  city_runtime_entity_id:
    entity.city_runtime_entity_id,

  organization_name:
    entity.organization_name,

  city_rank:
    entity.city_rank,

  priority_tier:
    entity.priority_tier,

  best_score:
    entity.best_score,

  source_layers:
    entity.source_layers,

  organization_types:
    entity.organization_types,

  contact_ready:
    false,

  graph_node_type:
    entity.organization_type.includes("EVENT")
      ? "EVENT_NODE"
      : entity.organization_type.includes("DEALERSHIP") ||
        entity.organization_type.includes("GEAR_STORE")
        ? "RETAIL_PLACEMENT_NODE"
        : entity.organization_type.includes("COMMUNITY") ||
          entity.organization_type.includes("VENUE")
          ? "COMMUNITY_PROPAGATION_NODE"
          : entity.organization_type.includes("BRAND")
            ? "BRAND_PROPAGATION_NODE"
            : "GENERAL_LA_NODE",

  cross_city_duplicate_detected:
    entity.cross_city_duplicate_detected,

  graph_visible:
    true,

  automated_outreach_allowed:
    false
}));

const edges = [];

function typeRelation(a, b) {
  if (
    a.graph_node_type === "EVENT_NODE" &&
    (
      b.graph_node_type === "BRAND_PROPAGATION_NODE" ||
      b.graph_node_type === "COMMUNITY_PROPAGATION_NODE"
    )
  ) return "EVENT_TO_PROPAGATION";

  if (
    a.graph_node_type === "RETAIL_PLACEMENT_NODE" &&
    b.graph_node_type === "COMMUNITY_PROPAGATION_NODE"
  ) return "RETAIL_TO_COMMUNITY";

  if (
    a.graph_node_type === "BRAND_PROPAGATION_NODE" &&
    b.graph_node_type === "COMMUNITY_PROPAGATION_NODE"
  ) return "BRAND_TO_COMMUNITY";

  if (
    a.cross_city_duplicate_detected ||
    b.cross_city_duplicate_detected
  ) return "CROSS_CITY_OVERLAP";

  return "LOCAL_ECOSYSTEM_OVERLAP";
}

for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i];
    const b = nodes[j];

    const relationshipType = typeRelation(a, b);

    const edgeWeight =
      Number(Math.min(1,
        0.25 +
        ((a.best_score + b.best_score) / 100) +
        (
          relationshipType === "CROSS_CITY_OVERLAP"
            ? 0.25
            : 0
        )
      ).toFixed(3));

    if (edgeWeight < 0.38) continue;

    edges.push({
      graph_edge_id:
        `BD_LA_GRAPH_EDGE_${String(edges.length + 1).padStart(6, "0")}`,

      source_graph_node_id:
        a.graph_node_id,

      target_graph_node_id:
        b.graph_node_id,

      source_organization:
        a.organization_name,

      target_organization:
        b.organization_name,

      relationship_type:
        relationshipType,

      edge_weight:
        edgeWeight,

      propagation_capable:
        [
          "EVENT_TO_PROPAGATION",
          "BRAND_TO_COMMUNITY",
          "CROSS_CITY_OVERLAP",
          "LOCAL_ECOSYSTEM_OVERLAP"
        ].includes(relationshipType),

      conversion_path_capable:
        [
          "RETAIL_TO_COMMUNITY",
          "CROSS_CITY_OVERLAP"
        ].includes(relationshipType),

      runtime_mutation_allowed:
        false,

      automated_outreach_allowed:
        false
    });
  }
}

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/relationship_graph/los_angeles/nodes/los_angeles_graph_nodes.json"),
  JSON.stringify({
    version: "black_dragon_los_angeles_graph_nodes_v1",
    generated_at: new Date().toISOString(),
    city: "Los Angeles",
    state: "CA",
    total_nodes: nodes.length,
    nodes
  }, null, 2),
  "utf8"
);

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/relationship_graph/los_angeles/edges/los_angeles_graph_edges.json"),
  JSON.stringify({
    version: "black_dragon_los_angeles_graph_edges_v1",
    generated_at: new Date().toISOString(),
    city: "Los Angeles",
    state: "CA",
    total_edges: edges.length,
    edges
  }, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status: "LOS_ANGELES_GRAPH_NODES_EDGES_COMPLETE",
  graph_nodes: nodes.length,
  graph_edges: edges.length
}, null, 2));
