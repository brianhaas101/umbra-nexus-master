const fs = require("fs");
const path = require("path");

const OUT = "public/data/clients/black_dragon/runtime_integrity_check.json";

function readJson(p, fallback = null) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const required = [
  "public/data/clients/black_dragon/outreach_shortlist.json",
  "public/data/clients/black_dragon/national_verified_outreach_shortlist.json",
  "public/data/clients/black_dragon/normalized_intelligence_outputs.json",
  "public/data/clients/black_dragon/dossier_targets.json",
  "public/data/clients/black_dragon/black_dragon_client_sync.json",
  "public/data/clients/black_dragon/runtime_authority_map.json"
];

const national = readJson("public/data/clients/black_dragon/national_verified_outreach_shortlist.json", { targets: [] });
const dossiers = readJson("public/data/clients/black_dragon/dossier_targets.json", { dossiers: [] });
const sync = readJson("public/data/clients/black_dragon/black_dragon_client_sync.json", { targets: [] });

const missing = required.filter(p => !fs.existsSync(p));

const result = {
  version: "black_dragon_runtime_integrity_check_v1",
  generated_at: new Date().toISOString(),
  status: "PASS",
  missing_files: missing,
  counts: {
    national_targets: national.targets.length,
    dossiers: dossiers.dossiers.length,
    sync_targets: sync.targets.length
  },
  checks: {
    required_files_exist: missing.length === 0,
    national_targets_exist: national.targets.length > 0,
    dossier_count_matches_national: dossiers.dossiers.length === national.targets.length,
    sync_count_matches_dossiers: sync.targets.length === dossiers.dossiers.length
  }
};

if (
  missing.length ||
  !result.checks.national_targets_exist ||
  !result.checks.dossier_count_matches_national ||
  !result.checks.sync_count_matches_dossiers
) {
  result.status = "REVIEW_REQUIRED";
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(result, null, 2));

console.log("[RUNTIME INTEGRITY] COMPLETE");
console.log("[RUNTIME INTEGRITY] Status:", result.status);
console.log("[RUNTIME INTEGRITY] National:", result.counts.national_targets);
console.log("[RUNTIME INTEGRITY] Dossiers:", result.counts.dossiers);
console.log("[RUNTIME INTEGRITY] Sync:", result.counts.sync_targets);
