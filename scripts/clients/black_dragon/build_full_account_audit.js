const fs = require("fs");

const ROOT = "public/data/clients/black_dragon";
const OUT = `${ROOT}/black_dragon_full_account_audit.json`;

function read(p, fallback = null) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const required = [
  "manual_verified_contacts.json",
  "state_candidates/ca_verified_contacts.json",
  "national_verified_outreach_shortlist.json",
  "normalized_intelligence_outputs.json",
  "dossier_targets.json",
  "black_dragon_client_sync.json",
  "globe_sync_export.real.json",
  "globe_data_adapter.json",
  "operational_ui_state.json",
  "runtime_authority_map.json",
  "runtime_integrity_check.json",
  "runtime_integration_batch_audit.json"
];

const missing = required.filter(f => !fs.existsSync(`${ROOT}/${f}`));

const az = read(`${ROOT}/manual_verified_contacts.json`, { contacts: [] });
const ca = read(`${ROOT}/state_candidates/ca_verified_contacts.json`, { contacts: [] });
const national = read(`${ROOT}/national_verified_outreach_shortlist.json`, { targets: [] });
const dossiers = read(`${ROOT}/dossier_targets.json`, { dossiers: [] });
const sync = read(`${ROOT}/black_dragon_client_sync.json`, { stats: {}, targets: [] });
const globe = read(`${ROOT}/globe_sync_export.real.json`, { total_nodes: 0 });
const ui = read(`${ROOT}/operational_ui_state.json`, { summary: {} });

const checks = {
  required_files_exist: missing.length === 0,
  az_verified_contacts_at_least_10: az.contacts.length >= 10,
  ca_verified_contacts_at_least_1: ca.contacts.length >= 1,
  national_targets_exist: national.targets.length > 0,
  dossiers_match_national: dossiers.dossiers.length === national.targets.length,
  sync_matches_dossiers: sync.stats.synced_targets === dossiers.dossiers.length,
  globe_nodes_match_sync: globe.total_nodes === sync.stats.synced_targets,
  ui_targets_match_sync: ui.summary.synced_targets === sync.stats.synced_targets,
  no_missing_phone_in_national: national.targets.every(t => t.contact && t.contact.phone)
};

const audit = {
  version: "black_dragon_full_account_audit_v1",
  generated_at: new Date().toISOString(),
  status: Object.values(checks).every(Boolean) ? "PASS" : "REVIEW_REQUIRED",
  missing,
  counts: {
    az_verified_contacts: az.contacts.length,
    ca_verified_contacts: ca.contacts.length,
    national_verified_targets: national.targets.length,
    dossiers: dossiers.dossiers.length,
    synced_targets: sync.stats.synced_targets || 0,
    globe_nodes: globe.total_nodes || 0,
    ui_targets: ui.summary.synced_targets || 0
  },
  checks
};

fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));
console.log("[FULL AUDIT]", audit.status, JSON.stringify(audit.counts));
