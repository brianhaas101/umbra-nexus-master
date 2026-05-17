const fs = require("fs");
const path = require("path");

const SYNC = "public/data/clients/black_dragon/black_dragon_client_sync.json";
const GEO = "public/data/clients/black_dragon/geographic_intelligence_layer.json";
const OUT = "public/data/clients/black_dragon/globe_sync_export.real.json";

function read(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }

const sync = read(SYNC);
const geo = read(GEO);

const geoMap = new Map(
  (geo.records || []).map(r => [`${r.state}|${r.agency_name}`.toUpperCase(), r])
);

const nodes = [];

for (const t of sync.targets || []) {
  const key = `${t.state}|${t.agency_name}`.toUpperCase();
  const g = geoMap.get(key);

  if (!g || g.geocode_status !== "GEOCODED_CITY_CENTROID") continue;

  nodes.push({
    entity_id: t.entity_id,
    label: t.agency_name,
    city: t.city,
    state: t.state,
    client_key: "black_dragon",
    node_type: "VERIFIED_OUTREACH_TARGET",
    dossier_ready: t.operational_status?.dossier_ready === true,
    outreach_ready: t.operational_status?.outreach_ready === true,
    score: t.intelligence_summary?.final_score || 0,
    confidence: t.intelligence_summary?.confidence || 0,
    lat: g.lat,
    lon: g.lon,
    geocode_type: "CITY_CENTROID",
    exact_agency_location: false
  });
}

const output = {
  version: "black_dragon_globe_sync_export_real_v1",
  generated_at: new Date().toISOString(),
  rule: "Uses verified city-centroid cache. No pseudo-random coordinates.",
  total_nodes: nodes.length,
  nodes
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[REAL GLOBE EXPORT] COMPLETE");
console.log("[REAL GLOBE EXPORT] Nodes:", nodes.length);
