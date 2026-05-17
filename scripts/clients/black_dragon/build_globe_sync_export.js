const fs = require("fs");
const path = require("path");

const SYNC = "public/data/clients/black_dragon/black_dragon_client_sync.json";
const OUT = "public/data/clients/black_dragon/globe_sync_export.json";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function pseudoCoord(seed, min, max) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const n = Math.abs(hash % 10000) / 10000;
  return min + (max - min) * n;
}

const sync = readJson(SYNC);

const nodes = (sync.targets || []).map(t => {
  const state = t.state || "";
  const agency = t.agency_name || "";

  return {
    entity_id: t.entity_id,
    label: agency,
    city: t.city || "",
    state,
    client_key: "black_dragon",
    node_type: "VERIFIED_OUTREACH_TARGET",
    dossier_ready: t.operational_status?.dossier_ready === true,
    outreach_ready: t.operational_status?.outreach_ready === true,
    score: t.intelligence_summary?.final_score || 0,
    confidence: t.intelligence_summary?.confidence || 0,
    lat: pseudoCoord(state + agency + "lat", 32, 42),
    lon: pseudoCoord(state + agency + "lon", -124, -111)
  };
});

const output = {
  version: "black_dragon_globe_sync_export_v1",
  generated_at: new Date().toISOString(),
  rule: "Coordinates are placeholder approximations until geocoding layer is wired. Do not use for final geospatial accuracy.",
  total_nodes: nodes.length,
  nodes
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[GLOBE SYNC] COMPLETE");
console.log("[GLOBE SYNC] Nodes:", nodes.length);
