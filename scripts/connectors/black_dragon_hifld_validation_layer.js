// scripts/connectors/black_dragon_hifld_validation_layer.js
// Final validation + tiering layer for HIFLD authority targets.
// Does NOT write to leads_master.json.

const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "hifld_local_law_enforcement_locations";

const inputPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.authority_targets.json`
);

const outPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.validated_targets.json`
);

const MAJOR_CITY_STATE = {
  PHOENIX: "AZ",
  "LOS ANGELES": "CA",
  HOUSTON: "TX",
  DALLAS: "TX",
  PORTLAND: "OR",
  EUGENE: "OR",
  SEATTLE: "WA",
  ALBUQUERQUE: "NM",
  "LAS VEGAS": "NV",
  MIAMI: "FL",
  ATLANTA: "GA",
  CHARLOTTE: "NC"
};

const BAD_ENTITY_PATTERNS = [
  /SCHOOL/i,
  /UNIVERSITY/i,
  /COLLEGE/i,
  /SEMINARY/i,
  /MEDICAL/i,
  /HOSPITAL/i,
  /HEALTH/i,
  /AIRPORT/i,
  /TRANSIT/i,
  /RAILROAD/i,
  /PARK POLICE/i,
  /TRIBAL/i,
  /CONSTABLE/i,
  /MARSHAL/i,
  /JAIL/i,
  /DETENTION/i,
  /CORRECTION/i,
  /PRECINCT/i,
  /SUBSTATION/i,
  /DIVISION/i,
  /HEADQUARTERS/i,
  /HQ/i
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function upper(value) {
  return clean(value).toUpperCase();
}

function matchesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function agencySize(entity) {
  const n = Number(entity.agency_size_estimate);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function geoStatus(entity) {
  const city = upper(entity.city);
  const state = upper(entity.state);

  if (MAJOR_CITY_STATE[city] && MAJOR_CITY_STATE[city] !== state) {
    return {
      ok: false,
      reason: `major_city_state_mismatch:${city}_expected_${MAJOR_CITY_STATE[city]}_got_${state}`
    };
  }

  return { ok: true, reason: "geo_ok" };
}

function classifyPublicSafety(entity) {
  const name = upper(entity.agency_name);

  if (name.includes("DEPARTMENT OF PUBLIC SAFETY") && !name.includes("TEXAS DEPARTMENT")) {
    return "municipal_public_safety_authority";
  }

  return entity.authority_type;
}

function validateEntity(entity) {
  const name = clean(entity.agency_name);
  const display = clean(entity.display_name);
  const text = `${name} ${display}`;
  const size = agencySize(entity);
  const geo = geoStatus(entity);

  const flags = [];
  const rejects = [];

  if (!geo.ok) rejects.push(geo.reason);
  if (matchesAny(text, BAD_ENTITY_PATTERNS)) rejects.push("bad_entity_pattern");

  if (size <= 0) flags.push("unknown_or_invalid_agency_size");
  else if (size < 50) flags.push("micro_agency_under_50");
  else if (size < 100) flags.push("small_agency_under_100");

  const authorityType = classifyPublicSafety(entity);

  let tier = "TIER_3";
  let actionability = "long_tail";
if (rejects.length > 0) {
  tier = "REJECT";
  actionability = "do_not_import";
} else if (size >= 1000) {
  tier = "TIER_1";
  actionability = "prime_target";
} else if (size >= 300) {
  tier = "TIER_2";
  actionability = "strong_target";
} else if (size >= 100) {
  tier = "TIER_3";
  actionability = "review_target";
} else if (authorityType === "county_sheriff_authority") {
  tier = "HOLD";
  actionability = "small_sheriff_office";
} else {
  tier = "HOLD";
  actionability = "hold_small_agency";
}

  return {
    ...entity,
    authority_type: authorityType,
    validation_status: rejects.length ? "rejected" : "validated",
    validation_rejects: rejects,
    validation_flags: flags,
    validated_tier: tier,
    actionability,
    live_import_allowed: false
  };
}

function main() {
  console.log("[HIFLD VALIDATION] Starting...");

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing authority targets: ${inputPath}`);
  }

  const input = readJson(inputPath);
  const targets = Array.isArray(input.targets) ? input.targets : [];

  const validated = targets.map(validateEntity);

  const validTargets = validated.filter((x) => x.validation_status === "validated");
  const rejected = validated.filter((x) => x.validation_status === "rejected");

  const output = {
    source_id: SOURCE_ID,
    generated_at: new Date().toISOString(),
    input_authority_count: targets.length,
    validated_count: validTargets.length,
    rejected_count: rejected.length,
    tier_counts: {
      tier_1: validated.filter((x) => x.validated_tier === "TIER_1").length,
      tier_2: validated.filter((x) => x.validated_tier === "TIER_2").length,
      tier_3: validated.filter((x) => x.validated_tier === "TIER_3").length,
      hold: validated.filter((x) => x.validated_tier === "HOLD").length,
      reject: validated.filter((x) => x.validated_tier === "REJECT").length
    },
    live_import_allowed: false,
    validation_rules: {
      no_leads_master_write: true,
      major_city_state_validation: true,
      micro_agency_hold_threshold: 100,
      reject_bad_entity_patterns: true
    },
    targets: validated.sort((a, b) => {
      const rank = { TIER_1: 1, TIER_2: 2, TIER_3: 3, HOLD: 4, REJECT: 5 };
      return (rank[a.validated_tier] || 99) - (rank[b.validated_tier] || 99)
        || Number(b.priority_score || 0) - Number(a.priority_score || 0);
    })
  };

  writeJson(outPath, output);

  console.log("[HIFLD VALIDATION] Input authority:", targets.length);
  console.log("[HIFLD VALIDATION] Validated:", output.validated_count);
  console.log("[HIFLD VALIDATION] Rejected:", output.rejected_count);
  console.log("[HIFLD VALIDATION] Tier counts:", output.tier_counts);
  console.log("[HIFLD VALIDATION] Output:", outPath);
}

main();