const fs = require("fs");
const path = require("path");

const DOSSIERS = "public/data/clients/black_dragon/dossier_targets.json";
const OUT = "public/data/clients/black_dragon/client_dossier_index.json";

function read(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const dossiers = read(DOSSIERS);

const index = {
  version: "black_dragon_client_dossier_index_v1",
  generated_at: new Date().toISOString(),
  client_key: "black_dragon",
  total_dossiers: dossiers.total_dossiers,
  index: (dossiers.dossiers || []).map(d => ({
    entity_id: d.entity_id,
    agency_name: d.agency_name,
    state: d.state,
    city: d.city,
    dossier_status: d.dossier_status,
    final_score: d.intelligence_summary?.final_score || 0,
    contact_status: d.contact_path?.status || "UNKNOWN"
  }))
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(index, null, 2));

console.log("[DOSSIER INDEX] COMPLETE");
console.log("[DOSSIER INDEX] Dossiers:", index.total_dossiers);
