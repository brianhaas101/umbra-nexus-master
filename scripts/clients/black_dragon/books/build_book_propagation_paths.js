const fs = require("fs");
const path = require("path");

const clustersPath = path.resolve(
  "public/data/clients/black_dragon/books/map/clusters/book_regional_influence_clusters.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/map/paths/book_propagation_paths.v1.json"
);

const clusters = JSON.parse(fs.readFileSync(clustersPath, "utf8")).clusters || [];

const sorted = clusters
  .slice()
  .sort((a,b) => b.max_visual_score - a.max_visual_score);

const hubs = sorted.slice(0, Math.min(4, sorted.length));
const targets = sorted.slice(0, Math.min(13, sorted.length));

function pathStrength(a, b) {
  const base =
    (Number(a.max_visual_score || 0) + Number(b.avg_visual_score || 0)) / 2;

  const volumeBonus =
    Math.min(15, Number(a.target_count || 0) + Number(b.target_count || 0));

  return Math.max(1, Math.min(100, Math.round(base + volumeBonus)));
}

function intensity(score) {
  if (score >= 85) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}

const seen = new Set();
const paths = [];

for (const hub of hubs) {
  for (const target of targets) {
    if (hub.cluster_id === target.cluster_id) continue;

    const key = `${hub.cluster_id}::${target.cluster_id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const strength = pathStrength(hub, target);

    paths.push({
      path_id: `BD_BOOK_PATH_${String(paths.length + 1).padStart(4, "0")}`,
      client_id: "black_dragon",
      module: "book_sales_v2",

      source_cluster_id: hub.cluster_id,
      source_region: hub.region,
      source_lon: hub.lon,
      source_lat: hub.lat,
      source_score: hub.max_visual_score,

      target_cluster_id: target.cluster_id,
      target_region: target.region,
      target_lon: target.lon,
      target_lat: target.lat,
      target_score: target.max_visual_score,

      path_strength: strength,
      path_intensity: intensity(strength),

      propagation_logic: {
        source_is_high_influence_cluster: hub.max_visual_score >= 70,
        target_has_operational_targets: target.target_count > 0,
        path_is_predictive: true,
        path_is_verified: false
      },

      render: {
        visible_in_world: true,
        visible_in_city_map: true,
        animated: true,
        directional: true
      }
    });
  }
}

const out = {
  version: "black_dragon_books_propagation_paths_v1",
  generated_at: new Date().toISOString(),
  client_id: "black_dragon",
  module: "book_sales_v2",

  totals: {
    clusters: clusters.length,
    hubs: hubs.length,
    paths: paths.length,
    critical: paths.filter(p => p.path_intensity === "CRITICAL").length,
    high: paths.filter(p => p.path_intensity === "HIGH").length,
    medium: paths.filter(p => p.path_intensity === "MEDIUM").length,
    low: paths.filter(p => p.path_intensity === "LOW").length
  },

  paths
};

fs.writeFileSync(outputPath, JSON.stringify(out, null, 2));

console.log(JSON.stringify({
  status: "BOOK_PROPAGATION_PATHS_CREATED",
  totals: out.totals,
  output: outputPath
}, null, 2));
