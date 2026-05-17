const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const BD_DIR = path.join(ROOT, "public/data/clients/black_dragon");
const CACHE_DIR = path.join(BD_DIR, "source_cache/state_directories");

const REQUIRED_FILES = [
  path.join(BD_DIR, "targets_master.json"),
  path.join(BD_DIR, "scored_targets.json"),
  path.join(BD_DIR, "top_targets_shortlist.json"),
  path.join(BD_DIR, "top_targets_contact_enriched.json"),
  path.join(BD_DIR, "top_targets_outreach_package.json"),
  path.join(CACHE_DIR, "state_batch_az_il_oh_nc.authority_targets.json"),
  path.join(CACHE_DIR, "az_acjc_statewide_agency_directory.candidates.json")
];

const SCRIPTS = [
  "black_dragon_state_batch_parser.js",
  "black_dragon_state_batch_authority_filter.js",
  "black_dragon_state_batch_merge_validate.js",
  "black_dragon_phase3_score_targets.js",
  "black_dragon_phase3_build_shortlist.js",
  "black_dragon_phase3_contact_enrich.js",
  "black_dragon_phase3_build_outreach_package.js"
].map(f => path.join(ROOT, "scripts/connectors", f));

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function exists(file) {
  return fs.existsSync(file);
}

function countTargets(file) {
  if (!exists(file)) return null;
  const data = readJson(file);
  if (Array.isArray(data.targets)) return data.targets.length;
  if (Array.isArray(data.candidates)) return data.candidates.length;
  return null;
}

function auditJson(file) {
  try {
    readJson(file);
    return true;
  } catch {
    return false;
  }
}

function scanForSensitiveKeys(obj, pathName = "") {
  const hits = [];
  if (!obj || typeof obj !== "object") return hits;

  for (const [key, value] of Object.entries(obj)) {
    const full = pathName ? pathName + "." + key : key;
    if (/password|secret|token|api_key|apikey|private_key|admin|founder|root_access/i.test(key)) {
      hits.push(full);
    }

    if (value && typeof value === "object") {
      hits.push(...scanForSensitiveKeys(value, full));
    }
  }

  return hits;
}

function main() {
  console.log("[BD DEPLOY AUDIT] Starting...\n");

  let pass = true;

  console.log("== Required data files ==");
  for (const file of REQUIRED_FILES) {
    const ok = exists(file);
    const jsonOk = ok ? auditJson(file) : false;
    const count = ok && jsonOk ? countTargets(file) : null;

    console.log(`${ok && jsonOk ? "PASS" : "FAIL"} ${file}`);
    if (count !== null) console.log(`     count: ${count}`);

    if (!ok || !jsonOk) pass = false;
  }

  console.log("\n== Required scripts ==");
  for (const file of SCRIPTS) {
    const ok = exists(file);
    console.log(`${ok ? "PASS" : "FAIL"} ${file}`);
    if (!ok) pass = false;
  }

  console.log("\n== Count consistency ==");
  const targetsMaster = countTargets(path.join(BD_DIR, "targets_master.json"));
  const scored = countTargets(path.join(BD_DIR, "scored_targets.json"));
  const shortlist = countTargets(path.join(BD_DIR, "top_targets_shortlist.json"));
  const enriched = countTargets(path.join(BD_DIR, "top_targets_contact_enriched.json"));
  const outreach = countTargets(path.join(BD_DIR, "top_targets_outreach_package.json"));

  console.log("targets_master:", targetsMaster);
  console.log("scored_targets:", scored);
  console.log("shortlist:", shortlist);
  console.log("contact_enriched:", enriched);
  console.log("outreach_package:", outreach);

  if (targetsMaster !== scored) {
    console.log("FAIL scored_targets count must match targets_master count.");
    pass = false;
  }

  if (shortlist !== 25 || enriched !== 25 || outreach !== 25) {
    console.log("FAIL top-25 action files should each contain 25 targets.");
    pass = false;
  }

  console.log("\n== Sensitive key scan ==");
  const publicJsonFiles = [
    "targets_master.json",
    "scored_targets.json",
    "top_targets_shortlist.json",
    "top_targets_contact_enriched.json",
    "top_targets_outreach_package.json"
  ];

  for (const fileName of publicJsonFiles) {
    const file = path.join(BD_DIR, fileName);
    if (!exists(file)) continue;

    const data = readJson(file);
    const hits = scanForSensitiveKeys(data);

    if (hits.length) {
      console.log(`WARN ${fileName} sensitive-looking keys:`, hits);
    } else {
      console.log(`PASS ${fileName} no sensitive-looking keys found`);
    }
  }

  console.log("\n== Deployment decision ==");
  if (pass) {
    console.log("PASS Black Dragon data pipeline is deployment-ready for review.");
    console.log("NOTE Still verify Nexus UI/account loader and access controls before client login.");
  } else {
    console.log("FAIL Fix failed checks before client deployment.");
    process.exitCode = 1;
  }
}

main();
