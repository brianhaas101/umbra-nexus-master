const fs = require("fs");
const path = require("path");

const IN = "public/data/clients/black_dragon/geographic_intelligence_layer.json";
const OUT = "public/data/clients/black_dragon/territory_clusters.json";

const geo = JSON.parse(fs.readFileSync(IN, "utf8"));

const clusters = {};

for (const r of geo.records || []) {
  const key = r.state;
  if (!clusters[key]) {
    clusters[key] = {
      cluster_id: `STATE_${key}`,
      state: key,
      target_count: 0,
      geocoded_count: 0,
      agencies: []
    };
  }

  clusters[key].target_count++;
  if (r.geocode_status === "GEOCODED_CITY_CENTROID") clusters[key].geocoded_count++;

  clusters[key].agencies.push({
    agency_name: r.agency_name,
    city: r.city,
    lat: r.lat,
    lon: r.lon,
    geocode_status: r.geocode_status
  });
}

const output = {
  version: "black_dragon_territory_clusters_v1",
  generated_at: new Date().toISOString(),
  rule: "Clusters are state-level operational groupings pending finer regional/jurisdiction mapping.",
  total_clusters: Object.keys(clusters).length,
  clusters: Object.values(clusters)
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[TERRITORY CLUSTERS] COMPLETE");
console.log("[TERRITORY CLUSTERS] Clusters:", output.total_clusters);
