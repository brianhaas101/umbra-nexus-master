const fs = require("fs");
const path = require("path");

const OUT = "public/data/clients/black_dragon/intelligence_refresh_ledger.json";

const files = [
  "outreach_shortlist.json",
  "national_verified_outreach_shortlist.json",
  "normalized_intelligence_outputs.json",
  "dossier_targets.json",
  "black_dragon_client_sync.json",
  "source_freshness_audit.json",
  "live_ingestion_manifest.json"
];

const root = "public/data/clients/black_dragon";

const ledger = {
  version: "black_dragon_intelligence_refresh_ledger_v1",
  generated_at: new Date().toISOString(),
  client_key: "black_dragon",
  files: files.map(file => {
    const p = path.join(root, file);
    const exists = fs.existsSync(p);
    const stat = exists ? fs.statSync(p) : null;

    return {
      file,
      exists,
      bytes: exists ? stat.size : 0,
      last_modified: exists ? stat.mtime.toISOString() : null
    };
  })
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(ledger, null, 2));

console.log("[REFRESH LEDGER] COMPLETE");
console.log("[REFRESH LEDGER] Files:", ledger.files.length);
