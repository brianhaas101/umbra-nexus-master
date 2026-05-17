const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const basePath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_major_city_targets.expanded_review.v1.json"
);

const nyPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/source_cache/state_directories/ny_dcjs_criminal_justice_agencies.authority_targets.json"
);

const outPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_major_city_targets.phase2_review.v1.json"
);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function norm(value) {
  return clean(value).toUpperCase();
}

function targetKey(t) {
  return `${norm(t.agency_name)}|${norm(t.city)}|${norm(t.state)}`;
}

function cityKey(c) {
  return `${norm(c.city)}|${norm(c.state)}`;
}

function toReviewTarget(t, index) {
  return {
    target_id: `BD-NY-${String(index + 1).padStart(4, "0")}`,
    source_candidate_id: t.source_candidate_id,
    agency_name: t.agency_name,
    authority_type: t.authority_type,
    agency_type: t.agency_type,
    agency_size_estimate: t.agency_size_estimate || 0,
    validated_tier: t.validated_tier,
    actionability: t.actionability,
    city: t.city,
    state: t.state,
    county: t.county || "",
    country: "US",
    lat: t.lat || null,
    lon: t.lon || null,
    address: t.address || "",
    phone: t.phone || "",
    website: t.website || "",
    contact_url: t.contact_url || t.website || "",
    source_name: t.source_name,
    source_url: t.source_url,
    review_status: "ny_authority_review_required",
    import_allowed: false,
    required_next_sources: t.required_next_sources || [
      "agency_websites.json",
      "official_agency_sites",
      "local_public_safety_budgets",
      "fbi_doj_press_releases"
    ],
    notes: t.notes || [
      "Merged from NY DCJS authority targets.",
      "Review-only target. Not approved for client action until contact and signal enrichment are confirmed."
    ]
  };
}

function main() {
  console.log("[MERGE NY AUTHORITY] Starting...");

  const base = readJson(basePath);
  const ny = readJson(nyPath);

  const cities = Array.isArray(base.cities) ? base.cities : [];
  const nyTargets = Array.isArray(ny.targets) ? ny.targets : [];

  let added = 0;
  let skippedDuplicates = 0;
  let idx = 0;

  const nextCities = cities.map((city) => {
    if (cityKey(city) !== "NEW YORK|NY") return city;

    const existing = Array.isArray(city.targets) ? city.targets : [];
    const seen = new Set(existing.map(targetKey));

    const additions = [];

    for (const target of nyTargets) {
      if (seen.has(targetKey(target))) {
        skippedDuplicates += 1;
        continue;
      }

      idx += 1;
      const reviewTarget = toReviewTarget(target, idx);
      additions.push(reviewTarget);
      seen.add(targetKey(reviewTarget));
      added += 1;
    }

    const mergedTargets = [...existing, ...additions];

    return {
      ...city,
      total_targets: mergedTargets.length,
      tier_1: mergedTargets.filter((t) => t.validated_tier === "TIER_1").length,
      tier_2: mergedTargets.filter((t) => t.validated_tier === "TIER_2").length,
      tier_3: mergedTargets.filter((t) => t.validated_tier === "TIER_3").length,
      review_low: mergedTargets.filter((t) => t.validated_tier === "REVIEW_LOW").length,
      coverage_status: mergedTargets.length > 0
        ? "phase2_review_targets_present"
        : "missing_validated_targets",
      targets: mergedTargets
    };
  });

  const output = {
    ...base,
    version: "v1-phase2-review",
    generated_at: new Date().toISOString(),
    purpose:
      "Phase 2 review target file. Includes validated targets, HIFLD expansion review targets, and NY DCJS authority targets.",
    policy: {
      ...base.policy,
      live_import_allowed: false,
      phase2_review_only: true,
      requires_signal_enrichment_before_client_action: true
    },
    phase2_merge: {
      added_ny_authority_targets: added,
      skipped_duplicates: skippedDuplicates,
      source_file: "ny_dcjs_criminal_justice_agencies.authority_targets.json",
      live_import_allowed: false
    },
    totals: {
      cities: nextCities.length,
      cities_with_targets: nextCities.filter((c) => c.total_targets > 0).length,
      cities_missing_targets: nextCities.filter((c) => c.total_targets === 0).length,
      targets: nextCities.reduce((sum, c) => sum + Number(c.total_targets || 0), 0),
      tier_1: nextCities.reduce((sum, c) => sum + Number(c.tier_1 || 0), 0),
      tier_2: nextCities.reduce((sum, c) => sum + Number(c.tier_2 || 0), 0),
      tier_3: nextCities.reduce((sum, c) => sum + Number(c.tier_3 || 0), 0),
      review_low: nextCities.reduce((sum, c) => sum + Number(c.review_low || 0), 0)
    },
    cities: nextCities
  };

  writeJson(outPath, output);

  console.log("[MERGE NY AUTHORITY] Added:", added);
  console.log("[MERGE NY AUTHORITY] Skipped duplicates:", skippedDuplicates);
  console.log("[MERGE NY AUTHORITY] Cities with targets:", output.totals.cities_with_targets);
  console.log("[MERGE NY AUTHORITY] Total targets:", output.totals.targets);
  console.log("[MERGE NY AUTHORITY] Output:", outPath);
}

main();