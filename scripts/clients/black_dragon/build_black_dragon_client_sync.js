const fs = require("fs");
const path = require("path");

const DOSSIER_PATH = "public/data/clients/black_dragon/dossier_targets.json";
const SHORTLIST_PATH = "public/data/clients/black_dragon/national_verified_outreach_shortlist.json";
const EXEC_PATH = "public/data/clients/black_dragon/outreach_execution_log.json";

const OUT_PATH = "public/data/clients/black_dragon/black_dragon_client_sync.json";

function readJson(p, fallback=null) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function slug(v) {
  return String(v || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function main() {
  const dossiers = readJson(DOSSIER_PATH, { dossiers: [] });
  const shortlist = readJson(SHORTLIST_PATH, { targets: [] });
  const execution = readJson(EXEC_PATH, { targets: [] });

  const syncTargets = [];

  for (const dossier of dossiers.dossiers || []) {

    const shortlistMatch = (shortlist.targets || []).find(t =>
      slug(t.agency_name) === slug(dossier.agency_name) &&
      t.state === dossier.state
    );

    const executionMatch = (execution.targets || []).find(t =>
      slug(t.agency_name) === slug(dossier.agency_name) &&
      t.state === dossier.state
    );

    syncTargets.push({
      entity_id: dossier.entity_id,
      agency_name: dossier.agency_name,
      city: dossier.city,
      state: dossier.state,

      operational_status: {
        dossier_ready: true,
        outreach_ready: !!shortlistMatch,
        execution_tracking_exists: !!executionMatch
      },

      intelligence_summary: dossier.intelligence_summary,

      contact_path: dossier.contact_path,

      outreach_execution: executionMatch || {
        status: "NOT_STARTED",
        attempts: 0,
        notes: ""
      },

      source_trace:
        dossier.agency_identity?.source_trace || [],

      sync_version: "BD_CLIENT_SYNC_V1"
    });
  }

  const output = {
    version: "black_dragon_client_sync_v1",
    generated_at: new Date().toISOString(),

    stats: {
      dossiers: dossiers.dossiers.length,
      outreach_targets: shortlist.targets.length,
      execution_targets: execution.targets.length,
      synced_targets: syncTargets.length
    },

    runtime_rules: {
      no_fake_contacts: true,
      manual_verification_required: true,
      official_sources_only: true,
      outreach_requires_verified_path: true
    },

    targets: syncTargets
  };

  writeJson(OUT_PATH, output);

  console.log("[CLIENT SYNC] COMPLETE");
  console.log("[CLIENT SYNC] Synced targets:", syncTargets.length);
  console.log("[CLIENT SYNC] Output:", OUT_PATH);
}

main();
