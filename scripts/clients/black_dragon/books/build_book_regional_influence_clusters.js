const fs = require("fs");
const path = require("path");

const nodesPath = path.resolve(
  "public/data/clients/black_dragon/books/map/runtime/book_citymap_nodes.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/map/clusters/book_regional_influence_clusters.v1.json"
);

const payload = JSON.parse(fs.readFileSync(nodesPath, "utf8"));
const nodes = payload.nodes || [];

function regionKey(node) {
  return String(node.region || "National").trim() || "National";
}

function avg(values) {
  if (!values.length) return 0;
  return Number((values.reduce((a,b) => a + b, 0) / values.length).toFixed(2));
}

function clusterIntensity(score) {
  if (score >= 85) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 50) return "MEDIUM";
  if (score > 0) return "LOW";
  return "NONE";
}

const grouped = new Map();

for (const node of nodes) {
  const key = regionKey(node);

  if (!grouped.has(key)) {
    grouped.set(key, []);
  }

  grouped.get(key).push(node);
}

const clusters = Array.from(grouped.entries()).map(([region, items], index) => {
  const lons = items.map(n => Number(n.lon)).filter(Number.isFinite);
  const lats = items.map(n => Number(n.lat)).filter(Number.isFinite);
  const visualScores = items.map(n => Number(n.visual_score || 0));

  const maxVisualScore = Math.max(...visualScores, 0);
  const avgVisualScore = avg(visualScores);

  return {
    cluster_id: `BD_BOOK_CLUSTER_${String(index + 1).padStart(4, "0")}`,
    client_id: "black_dragon",
    module: "book_sales_v2",

    region,
    country: "USA",

    lon: avg(lons),
    lat: avg(lats),

    target_count: items.length,
    critical_count: items.filter(n => n.visual_intensity === "CRITICAL").length,
    high_count: items.filter(n => n.visual_intensity === "HIGH").length,
    medium_count: items.filter(n => n.visual_intensity === "MEDIUM").length,
    low_count: items.filter(n => n.visual_intensity === "LOW").length,

    max_visual_score: maxVisualScore,
    avg_visual_score: avgVisualScore,
    cluster_intensity: clusterIntensity(maxVisualScore),

    response_count: items.filter(n => !!n.response_status).length,
    outreach_ready_count: items.filter(n => n.queue_status === "READY").length,
    enrichment_needed_count: items.filter(n => n.queue_status === "NEEDS_CONTACT_ENRICHMENT").length,

    entity_ids: items.map(n => n.entity_id),

    render: {
      node_type: "BLACK_DRAGON_BOOK_REGIONAL_CLUSTER",
      visible_in_world: true,
      visible_in_city_map: true,
      pickable: true,
      radius_hint: Math.max(2.2, Math.min(7.5, 2.2 + items.length * 0.45)),
      pulse_enabled: true,
      label_enabled: true
    }
  };
}).sort((a,b) => b.max_visual_score - a.max_visual_score);

const out = {
  version: "black_dragon_books_regional_influence_clusters_v1",
  generated_at: new Date().toISOString(),
  client_id: "black_dragon",
  module: "book_sales_v2",

  totals: {
    clusters: clusters.length,
    targets: nodes.length,
    critical_clusters: clusters.filter(c => c.cluster_intensity === "CRITICAL").length,
    high_clusters: clusters.filter(c => c.cluster_intensity === "HIGH").length,
    medium_clusters: clusters.filter(c => c.cluster_intensity === "MEDIUM").length,
    low_clusters: clusters.filter(c => c.cluster_intensity === "LOW").length
  },

  clusters
};

fs.writeFileSync(outputPath, JSON.stringify(out, null, 2));

console.log(JSON.stringify({
  status: "REGIONAL_INFLUENCE_CLUSTERS_CREATED",
  totals: out.totals,
  output: outputPath
}, null, 2));
