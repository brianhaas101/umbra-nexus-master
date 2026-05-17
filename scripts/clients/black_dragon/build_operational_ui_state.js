const fs = require("fs");
const path = require("path");

const SYNC = "public/data/clients/black_dragon/black_dragon_client_sync.json";
const GLOBE = "public/data/clients/black_dragon/globe_data_adapter.json";
const INDEX = "public/data/clients/black_dragon/client_dossier_index.json";
const OUT = "public/data/clients/black_dragon/operational_ui_state.json";

function read(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const sync = read(SYNC);
const globe = read(GLOBE);
const index = read(INDEX);

const ui = {
  version: "black_dragon_operational_ui_state_v1",
  generated_at: new Date().toISOString(),
  client_key: "black_dragon",
  summary: {
    synced_targets: sync.stats.synced_targets,
    globe_nodes: globe.node_count,
    dossiers: index.total_dossiers,
    states: [...new Set((sync.targets || []).map(t => t.state))].sort()
  },
  default_view: {
    mode: "GLOBE",
    layer: "VERIFIED_OUTREACH_TARGETS",
    selected_client: "black_dragon"
  },
  panels: {
    dossier_panel_enabled: true,
    outreach_panel_enabled: true,
    intelligence_summary_enabled: true,
    execution_status_enabled: true
  },
  target_index: index.index
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(ui, null, 2));

console.log("[OPERATIONAL UI STATE] COMPLETE");
console.log("[OPERATIONAL UI STATE] Targets:", ui.summary.synced_targets);
