const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const INPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_pass3_expanded_targets.json"
);

const OUTPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_pass3_ranked_locked.json"
);

function readJson(file) {
  let raw = fs.readFileSync(file, "utf8");
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  return JSON.parse(raw);
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function clean(v) {
  return String(v ?? "").replace(/\s+/g, " ").trim();
}

function classify(t) {
  if (t.entity_type === "city_shell" || t._live_account_source === "satellite_city_shell") {
    return "CITY_SHELL";
  }

  if (t._live_account_source === "black_dragon_pass3_expanded_target" || t?._pass3?.generated) {
    return "EXPANDED_TARGET";
  }

  if (t.black_dragon_dossier) {
    return "VERIFIED_TARGET";
  }

  return "REVIEW_TARGET";
}

function priorityScore(t, classification) {
  if (classification === "CITY_SHELL") return 0;

  const dossier = t.black_dragon_dossier || {};
  const agencyClass = clean(dossier.agency_class || "").toLowerCase();
  const base = Number(t?.scores?.umbraScore || 50);

  let bonus = 0;

  if (classification === "VERIFIED_TARGET") bonus += 18;
  if (classification === "EXPANDED_TARGET") bonus += 8;

  if (/training_division|task_force|specialized_unit/.test(agencyClass)) bonus += 12;
  if (/police_department|sheriff_office|public_safety_agency/.test(agencyClass)) bonus += 10;
  if (/campus_police/.test(agencyClass)) bonus += 5;
  if (/court_system|prosecutor_office/.test(agencyClass)) bonus += 2;

  if (dossier.live_outreach_allowed === true) bonus += 5;
  if (dossier.review_status === "client_dossier_review_required") bonus -= 3;

  return Math.max(0, Math.min(100, Math.round(base + bonus)));
}

function priorityBand(score, classification) {
  if (classification === "CITY_SHELL") return "NAVIGATION_ONLY";
  if (classification === "VERIFIED_TARGET") return "PRIORITY_A";

  if (score >= 90) return "PRIORITY_A";
  if (score >= 80) return "PRIORITY_B";
  if (score >= 68) return "PRIORITY_C";

  return "PRIORITY_REVIEW";
}

function lockTarget(t) {
  const classification = classify(t);
  const score = priorityScore(t, classification);
  const band = priorityBand(score, classification);

  const isExpanded = classification === "EXPANDED_TARGET";
  const isVerified = classification === "VERIFIED_TARGET";

  const dossier = t.black_dragon_dossier || null;

  const lockedDossier = dossier
    ? {
        ...dossier,
        verified: isVerified,
        verification_status: isVerified ? "verified_source_ingested" : "required",
        live_outreach_allowed: isVerified ? dossier.live_outreach_allowed === true : false,
        review_status: isVerified
          ? (dossier.review_status || "client_dossier_review_required")
          : "verification_required_before_outreach",
        priority_score: score,
        priority_band: band,
        target_classification: classification
      }
    : null;

  return {
    ...t,

    black_dragon_rank: {
      target_classification: classification,
      priority_score: score,
      priority_band: band,
      verified: isVerified,
      expanded: isExpanded,
      needs_verification: isExpanded || classification === "REVIEW_TARGET",
      live_outreach_allowed: lockedDossier?.live_outreach_allowed === true,
      outreach_gate:
        lockedDossier?.live_outreach_allowed === true
          ? "LIVE_OUTREACH_ALLOWED"
          : "OUTREACH_BLOCKED_PENDING_REVIEW"
    },

    black_dragon_dossier: lockedDossier
  };
}

function main() {
  console.log("[BD PASS 3 RANK LOCK] Starting...");

  if (!fs.existsSync(INPUT)) {
    console.error("[BD PASS 3 RANK LOCK] Missing input:", INPUT);
    process.exit(1);
  }

  const input = readJson(INPUT);
  const targets = Array.isArray(input.targets) ? input.targets : [];

  const locked = targets.map(lockTarget);

  const counts = locked.reduce((acc, t) => {
    const c = t.black_dragon_rank?.target_classification || "UNKNOWN";
    const b = t.black_dragon_rank?.priority_band || "UNKNOWN";
    acc.classification[c] = (acc.classification[c] || 0) + 1;
    acc.priority[b] = (acc.priority[b] || 0) + 1;
    if (t.black_dragon_rank?.needs_verification) acc.needs_verification++;
    if (t.black_dragon_rank?.live_outreach_allowed) acc.live_outreach_allowed++;
    return acc;
  }, {
    classification: {},
    priority: {},
    needs_verification: 0,
    live_outreach_allowed: 0
  });

  const output = {
    source: "black_dragon_pass3_ranked_locked",
    generated_at: new Date().toISOString(),
    note: "Ranked/locked Black Dragon dataset. Separates city shells, verified targets, expanded targets, priority bands, verification requirements, and outreach gates.",
    total_count: locked.length,
    counts,
    targets: locked
  };

  writeJson(OUTPUT, output);

  console.log("[BD PASS 3 RANK LOCK] Total:", locked.length);
  console.log("[BD PASS 3 RANK LOCK] Classification:", counts.classification);
  console.log("[BD PASS 3 RANK LOCK] Priority:", counts.priority);
  console.log("[BD PASS 3 RANK LOCK] Needs verification:", counts.needs_verification);
  console.log("[BD PASS 3 RANK LOCK] Live outreach allowed:", counts.live_outreach_allowed);
  console.log("[BD PASS 3 RANK LOCK] Output:", OUTPUT);
}

main();
