const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const basePath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_major_city_targets.phase2_review.v1.json"
);

const sources = [
  {
    label: "CA POST",
    prefix: "BD-CA",
    path: path.resolve(
      ROOT,
      "public/data/clients/black_dragon/source_cache/state_directories/ca_post_law_enforcement_agencies.authority_targets.json"
    )
  },
  {
    label: "FL FDLE",
    prefix: "BD-FL",
    path: path.resolve(
      ROOT,
      "public/data/clients/black_dragon/source_cache/state_directories/fl_fdle_criminal_justice_agency_websites.authority_targets.json"
    )
  }
];

const outPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_major_city_targets.phase2_plus_ca_fl.v1.json"
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

function toReviewTarget(t, prefix, index) {
  return {
    target_id: `${prefix}-${String(index + 1).padStart(4, "0")}`,
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
    review_status: t.review_status || "phase2_state_authority_review_required",
    import_allowed: false,
    live_import_allowed: false,
    required_next_sources: t.required_next_sources || [
      "agency_websites.json",
      "official_agency_sites",
      "local_public_safety_budgets",
      "fbi_doj_press_releases"
    ],
    notes: t.notes || [
      "Merged from state authority target file.",
      "Review-only target. Not approved for client action until contact and signal enrichment are confirmed."
    ]
  };
}

function main() {
  console.log("[MERGE CA+FL AUTHORITY] Starting...");

  const base = readJson(basePath);
  const cities = Array.isArray(base.cities) ? base.cities : [];

  const allTargets = [];

  for (const src of sources) {
    if (!fs.existsSync(src.path)) {
      throw new Error(`Missing source file for ${src.label}: ${src.path}`);
    }

    const data = readJson(src.path);
    const targets = Array.isArray(data.targets) ? data.targets : [];

    targets.forEach((target, index) => {
      allTargets.push({
        source_label: src.label,
        prefix: src.prefix,
        local_index: index,
        target
      });
    });

    console.log(`[MERGE CA+FL AUTHORITY] Loaded ${src.label}:`, targets.length);
  }

  let added = 0;
  let skippedDuplicates = 0;
  let skippedNoCity = 0;

  const cityMap = new Map(cities.map((c) => [cityKey(c), c]));

  const additionsByCity = new Map();

  for (const item of allTargets) {
    const target = item.target;
    const key = `${norm(target.city)}|${norm(target.state)}`;

    if (!cityMap.has(key)) {
      skippedNoCity += 1;
      continue;
    }

    if (!additionsByCity.has(key)) additionsByCity.set(key, []);

    additionsByCity.get(key).push(
      toReviewTarget(target, item.prefix, item.local_index)
    );
  }

  const nextCities = cities.map((city) => {
    const existing = Array.isArray(city.targets) ? city.targets : [];
    const seen = new Set(existing.map(targetKey));

    const additions = additionsByCity.get(cityKey(city)) || [];
    const accepted = [];

    for (const target of additions) {
      if (seen.has(targetKey(target))) {
        skippedDuplicates += 1;
        continue;
      }

      seen.add(targetKey(target));
      accepted.push(target);
      added += 1;
    }

    const mergedTargets = [...existing, ...accepted];

    return {
      ...city,
      total_targets: mergedTargets.length,
      tier_1: mergedTargets.filter((t) => t.validated_tier === "TIER_1").length,
      tier_2: mergedTargets.filter((t) => t.validated_tier === "TIER_2").length,
      tier_3: mergedTargets.filter((t) => t.validated_tier === "TIER_3").length,
      review_low: mergedTargets.filter((t) => t.validated_tier === "REVIEW_LOW").length,
      coverage_status:
        mergedTargets.length > 0
          ? "phase2_review_targets_present"
          : "missing_validated_targets",
      targets: mergedTargets
    };
  });

  const output = {
    ...base,
    version: "v1-phase2-plus-ca-fl",
    generated_at: new Date().toISOString(),
    purpose:
      "Phase 2 review target file with NY DCJS, CA POST, FL FDLE, and HIFLD review targets merged.",
    policy: {
      ...base.policy,
      live_import_allowed: false,
      phase2_review_only: true,
      requires_signal_enrichment_before_client_action: true
    },
    phase2_merge_ca_fl: {
      added_targets: added,
      skipped_duplicates: skippedDuplicates,
      skipped_no_matching_top50_city: skippedNoCity,
      source_files: sources.map((s) => path.basename(s.path)),
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

  console.log("[MERGE CA+FL AUTHORITY] Added:", added);
  console.log("[MERGE CA+FL AUTHORITY] Skipped duplicates:", skippedDuplicates);
  console.log("[MERGE CA+FL AUTHORITY] Skipped no matching city:", skippedNoCity);
  console.log("[MERGE CA+FL AUTHORITY] Cities with targets:", output.totals.cities_with_targets);
  console.log("[MERGE CA+FL AUTHORITY] Total targets:", output.totals.targets);
  console.log("[MERGE CA+FL AUTHORITY] Output:", outPath);
}

main();