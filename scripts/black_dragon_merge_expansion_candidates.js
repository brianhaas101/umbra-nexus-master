const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const basePath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_major_city_targets.v1.json"
);

const expansionPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_city_expansion_candidates.v1.json"
);

const outPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_major_city_targets.expanded_review.v1.json"
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

function targetKey(target) {
  return `${norm(target.agency_name)}|${norm(target.city)}|${norm(target.state)}`;
}

function cityKey(city) {
  return `${norm(city.city)}|${norm(city.state)}`;
}

function toReviewTarget(candidate, index) {
  return {
    target_id: `BD-EXP-${String(index + 1).padStart(4, "0")}`,
    source_candidate_id: candidate.candidate_id,
    agency_name: candidate.agency_name,
    authority_type: candidate.agency_type || "law_enforcement",
    agency_size_estimate: candidate.agency_size_estimate || 0,
    validated_tier: candidate.recommended_tier || "REVIEW_LOW",
    actionability:
      candidate.recommended_tier === "TIER_1"
        ? "prime_review_target"
        : candidate.recommended_tier === "TIER_2"
          ? "strong_review_target"
          : candidate.recommended_tier === "TIER_3"
            ? "review_target"
            : "low_review_target",
    city: candidate.city,
    state: candidate.state,
    county: candidate.county || "",
    lat: candidate.lat,
    lon: candidate.lon,
    address: candidate.address || "",
    phone: candidate.phone || "",
    contact_url: candidate.contact_url || candidate.website || "",
    source_name: candidate.source_name || "HIFLD Local Law Enforcement Locations",
    source_url: candidate.source_url || "",
    review_status: "expanded_review_required",
    import_allowed: false,
    required_next_sources: [
      "agency_websites.json",
      "official_agency_sites",
      "local_public_safety_budgets",
      "fbi_doj_press_releases"
    ],
    notes: [
      "Merged from HIFLD city expansion candidate file.",
      "Review-only expansion target.",
      "Not approved for live client action until official website/contact and signal enrichment are confirmed."
    ]
  };
}

function main() {
  console.log("[MERGE EXPANSION] Starting...");

  const base = readJson(basePath);
  const expansion = readJson(expansionPath);

  const cities = Array.isArray(base.cities) ? base.cities : [];
  const expansionCities = Array.isArray(expansion.cities) ? expansion.cities : [];

  const expansionByCity = new Map(
    expansionCities.map((city) => [cityKey(city), city])
  );

  let added = 0;
  let skippedDuplicates = 0;
  let reviewIndex = 0;

  const nextCities = cities.map((city) => {
    const existingTargets = Array.isArray(city.targets) ? city.targets : [];
    const seen = new Set(existingTargets.map(targetKey));

    const expansionCity = expansionByCity.get(cityKey(city));
    const candidates = expansionCity?.expansion_candidates || [];

    const reviewTargets = [];

    for (const candidate of candidates) {
      const provisional = {
        agency_name: candidate.agency_name,
        city: candidate.city,
        state: candidate.state
      };

      if (seen.has(targetKey(provisional))) {
        skippedDuplicates += 1;
        continue;
      }

      reviewIndex += 1;
      const target = toReviewTarget(candidate, reviewIndex);
      seen.add(targetKey(target));
      reviewTargets.push(target);
      added += 1;
    }

    const mergedTargets = [...existingTargets, ...reviewTargets];

    return {
      ...city,
      total_targets: mergedTargets.length,
      tier_1: mergedTargets.filter((t) => t.validated_tier === "TIER_1").length,
      tier_2: mergedTargets.filter((t) => t.validated_tier === "TIER_2").length,
      tier_3: mergedTargets.filter((t) => t.validated_tier === "TIER_3").length,
      review_low: mergedTargets.filter((t) => t.validated_tier === "REVIEW_LOW").length,
      coverage_status:
        mergedTargets.length > 0
          ? "expanded_review_targets_present"
          : "missing_validated_targets",
      targets: mergedTargets
    };
  });

  const output = {
    ...base,
    generated_at: new Date().toISOString(),
    version: "v1-expanded-review",
    purpose:
      "Review-only expanded top-50 major-city target file for Black Dragon. Includes validated targets plus HIFLD expansion candidates where available.",
    policy: {
      ...base.policy,
      no_placeholders: true,
      no_hypothetical_leads: true,
      live_import_allowed: false,
      review_only_expansion: true,
      requires_signal_enrichment_before_client_action: true
    },
    expansion_merge: {
      source_file: "black_dragon_city_expansion_candidates.v1.json",
      added_review_targets: added,
      skipped_duplicates: skippedDuplicates,
      live_import_allowed: false
    },
    totals: {
      cities: nextCities.length,
      cities_with_targets: nextCities.filter((c) => c.total_targets > 0).length,
      cities_missing_targets: nextCities.filter((c) => c.total_targets === 0).length,
      targets: nextCities.reduce((sum, c) => sum + c.total_targets, 0),
      tier_1: nextCities.reduce((sum, c) => sum + c.tier_1, 0),
      tier_2: nextCities.reduce((sum, c) => sum + c.tier_2, 0),
      tier_3: nextCities.reduce((sum, c) => sum + c.tier_3, 0),
      review_low: nextCities.reduce((sum, c) => sum + (c.review_low || 0), 0)
    },
    cities: nextCities
  };

  writeJson(outPath, output);

  console.log("[MERGE EXPANSION] Added review targets:", added);
  console.log("[MERGE EXPANSION] Skipped duplicates:", skippedDuplicates);
  console.log("[MERGE EXPANSION] Cities with targets:", output.totals.cities_with_targets);
  console.log("[MERGE EXPANSION] Total targets:", output.totals.targets);
  console.log("[MERGE EXPANSION] Output:", outPath);
}

main();