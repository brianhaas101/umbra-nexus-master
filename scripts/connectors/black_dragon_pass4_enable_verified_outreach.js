const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const INPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_pass3_ranked_locked.json"
);

const OUTPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_pass4_outreach_enabled.json"
);

function readJson(file) {
  let raw = fs.readFileSync(file, "utf8");
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  return JSON.parse(raw);
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function enableOutreach(target) {
  const rank = target.black_dragon_rank || {};
  const classification = rank.target_classification;

  const isCityShell = classification === "CITY_SHELL" || target.entity_type === "city_shell";
  const isVerified = classification === "VERIFIED_TARGET";
  const isExpanded = classification === "EXPANDED_TARGET";

  const allow = isVerified && !isCityShell && !isExpanded;

  const outreachGate = allow
    ? "LIVE_OUTREACH_ALLOWED"
    : "OUTREACH_BLOCKED_PENDING_REVIEW";

  const nextRank = {
    ...rank,
    verified: isVerified,
    expanded: isExpanded,
    needs_verification: isExpanded || classification === "REVIEW_TARGET",
    live_outreach_allowed: allow,
    outreach_gate: outreachGate,
    outreach_enabled_at: allow ? new Date().toISOString() : null
  };

  const dossier = target.black_dragon_dossier
    ? {
        ...target.black_dragon_dossier,
        verified: isVerified,
        verification_status: isVerified ? "verified_source_ingested" : "required",
        live_outreach_allowed: allow,
        review_status: allow
          ? "outreach_ready"
          : "verification_required_before_outreach",
        outreach_gate: outreachGate
      }
    : null;

  return {
    ...target,
    black_dragon_rank: nextRank,
    black_dragon_dossier: dossier,
    black_dragon_outreach: {
      status: allow ? "READY" : "BLOCKED",
      gate: outreachGate,
      allowed: allow,
      allowed_reason: allow
        ? "Verified Black Dragon target with ingested dossier."
        : "Target requires verification or is navigation-only.",
      recommended_action: allow
        ? "Prepare first-touch outreach after final human review of public contact route."
        : "Verify target source, contact route, and agency relevance before outreach.",
      last_updated: new Date().toISOString()
    }
  };
}

function main() {
  console.log("[BD PASS 4 OUTREACH] Starting...");

  if (!fs.existsSync(INPUT)) {
    console.error("[BD PASS 4 OUTREACH] Missing input:", INPUT);
    process.exit(1);
  }

  const input = readJson(INPUT);
  const targets = Array.isArray(input.targets) ? input.targets : [];

  const enabled = targets.map(enableOutreach);

  const counts = enabled.reduce((acc, t) => {
    const c = t.black_dragon_rank?.target_classification || "UNKNOWN";
    acc.classification[c] = (acc.classification[c] || 0) + 1;

    if (t.black_dragon_outreach?.allowed) acc.live_outreach_allowed++;
    if (t.black_dragon_outreach?.status === "BLOCKED") acc.blocked++;
    if (t.black_dragon_rank?.needs_verification) acc.needs_verification++;

    return acc;
  }, {
    classification: {},
    live_outreach_allowed: 0,
    blocked: 0,
    needs_verification: 0
  });

  const output = {
    source: "black_dragon_pass4_outreach_enabled",
    generated_at: new Date().toISOString(),
    note: "Pass 4 enables outreach only for verified Black Dragon targets. Expanded/model targets remain blocked until verification.",
    total_count: enabled.length,
    counts,
    targets: enabled
  };

  writeJson(OUTPUT, output);

  console.log("[BD PASS 4 OUTREACH] Total:", enabled.length);
  console.log("[BD PASS 4 OUTREACH] Classification:", counts.classification);
  console.log("[BD PASS 4 OUTREACH] Live outreach allowed:", counts.live_outreach_allowed);
  console.log("[BD PASS 4 OUTREACH] Blocked:", counts.blocked);
  console.log("[BD PASS 4 OUTREACH] Needs verification:", counts.needs_verification);
  console.log("[BD PASS 4 OUTREACH] Output:", OUTPUT);
}

main();
