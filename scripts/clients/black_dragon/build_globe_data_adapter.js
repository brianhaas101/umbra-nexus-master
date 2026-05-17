const fs = require("fs");
const path = require("path");

const GLOBE = "public/data/clients/black_dragon/globe_sync_export.real.json";
const CLUSTERS = "public/data/clients/black_dragon/territory_clusters.json";
const OUT = "public/data/clients/black_dragon/globe_data_adapter.json";

function read(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const globe = read(GLOBE);
const clusters = read(CLUSTERS);

const adapter = {
  version: "black_dragon_globe_data_adapter_v1",
  generated_at: new Date().toISOString(),
  client_key: "black_dragon",
  layer_id: "L07_GEOGRAPHIC_TERRITORY",
  node_count: globe.total_nodes,
  cluster_count: clusters.total_clusters,
  render_rules: {
    node_type: "VERIFIED_OUTREACH_TARGET",
    coordinate_source: "CITY_CENTROID",
    exact_agency_location: false,
    show_only_outreach_ready: true
  },
  nodes: globe.nodes.map(n => ({
    id: n.entity_id,
    label: n.label,
    city: n.city,
    state: n.state,
    lat: n.lat,
    lon: n.lon,
    score: n.score,
    confidence: n.confidence,
    dossier_ready: n.dossier_ready,
    outreach_ready: n.outreach_ready,
    node_type: n.node_type
  })),
  clusters: clusters.clusters
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(adapter, null, 2));

console.log("[GLOBE DATA ADAPTER] COMPLETE");
console.log("[GLOBE DATA ADAPTER] Nodes:", adapter.node_count);
console.log("[GLOBE DATA ADAPTER] Clusters:", adapter.cluster_count);
