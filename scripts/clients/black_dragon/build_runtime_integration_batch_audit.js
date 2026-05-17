const fs = require("fs");
const path = require("path");

const OUT = "public/data/clients/black_dragon/runtime_integration_batch_audit.json";

function read(p, fallback = null) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const files = [
  "runtime_loader_manifest.json",
  "globe_data_adapter.json",
  "client_dossier_index.json",
  "operational_ui_state.json",
  "black_dragon_client_sync.json",
  "globe_sync_export.real.json",
  "dossier_targets.json",
  "national_verified_outreach_shortlist.json"
];

const root = "public/data/clients/black_dragon";

const sync = read(`${root}/black_dragon_client_sync.json`, { stats: {}, targets: [] });
const globe = read(`${root}/globe_data_adapter.json`, { node_count: 0 });
const dossierIndex = read(`${root}/client_dossier_index.json`, { total_dossiers: 0 });
const ui = read(`${root}/operational_ui_state.json`, { summary: {} });

const missing = files.filter(f => !fs.existsSync(`${root}/${f}`));

const checks = {
  required_files_exist: missing.length === 0,
  sync_matches_globe: sync.stats.synced_targets === globe.node_count,
  sync_matches_dossier_index: sync.stats.synced_targets === dossierIndex.total_dossiers,
  ui_matches_sync: ui.summary?.synced_targets === sync.stats.synced_targets
};

const pass = Object.values(checks).every(Boolean);

const audit = {
  version: "black_dragon_runtime_integration_batch_audit_v1",
  generated_at: new Date().toISOString(),
  status: pass ? "PASS" : "REVIEW_REQUIRED",
  missing,
  checks,
  counts: {
    sync_targets: sync.stats.synced_targets || 0,
    globe_nodes: globe.node_count || 0,
    dossier_index: dossierIndex.total_dossiers || 0,
    ui_targets: ui.summary?.synced_targets || 0
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));

console.log("[RUNTIME BATCH AUDIT] COMPLETE");
console.log("[RUNTIME BATCH AUDIT] Status:", audit.status);
console.log("[RUNTIME BATCH AUDIT] Counts:", JSON.stringify(audit.counts));
