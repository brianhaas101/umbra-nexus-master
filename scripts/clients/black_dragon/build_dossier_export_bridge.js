const fs = require("fs");

const INPUT = "public/data/clients/black_dragon/dossier_targets.json";
const OUTPUT = "public/data/clients/black_dragon/dossier_export_bridge.json";

const data = JSON.parse(fs.readFileSync(INPUT, "utf8"));

const exportData = {
  version: "black_dragon_dossier_export_bridge_v1",
  generated_at: new Date().toISOString(),

  dossiers: data.dossiers.map(d => ({
    entity_id: d.entity_id,
    agency_name: d.agency_name,
    state: d.state,
    score: d.intelligence_summary.final_score,
    contact_status: d.contact_path.status,
    relevance: d.training_relevance.black_dragon_fit
  }))
};

fs.writeFileSync(OUTPUT, JSON.stringify(exportData, null, 2));

console.log("[DOSSIER EXPORT] COMPLETE");
console.log("[DOSSIER EXPORT] Dossiers:", exportData.dossiers.length);
