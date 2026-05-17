const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const targetsPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_major_city_targets.v1.json"
);

const outPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_top50_coverage_report.v1.json"
);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function main() {
  console.log("[COVERAGE REPORT] Starting...");

  const data = readJson(targetsPath);
  const cities = Array.isArray(data.cities) ? data.cities : [];

  const reportCities = cities.map((city) => {
    const targets = Array.isArray(city.targets) ? city.targets : [];
    const missingTargets = targets.length === 0;
    const missingContacts = targets.filter((t) => !t.contact_url).length;

    let ingestionStatus = "complete_initial";
    if (missingTargets) ingestionStatus = "needs_entity_ingestion";
    else if (missingContacts > 0) ingestionStatus = "needs_contact_enrichment";
    else if (targets.some((t) => !t.required_next_sources || t.required_next_sources.length > 0)) {
      ingestionStatus = "needs_signal_enrichment";
    }

    return {
      rank: city.rank,
      city_id: city.city_id,
      city: city.city,
      state: city.state,
      total_targets: city.total_targets,
      tier_1: city.tier_1,
      tier_2: city.tier_2,
      tier_3: city.tier_3,
      missing_contact_urls: missingContacts,
      coverage_status: city.coverage_status,
      ingestion_status: ingestionStatus,
      next_needed_sources: missingTargets
        ? ["hifld_expansion", "official_agency_sites", "state_post_boards", "local_public_safety_budgets"]
        : ["official_agency_sites", "fbi_doj_press_releases", "local_public_safety_budgets", "state_post_boards"]
    };
  });

  const output = {
    client_id: data.client_id,
    version: "v1",
    generated_at: new Date().toISOString(),
    source_file: "black_dragon_major_city_targets.v1.json",
    totals: {
      cities: reportCities.length,
      cities_with_targets: reportCities.filter((c) => c.total_targets > 0).length,
      cities_missing_targets: reportCities.filter((c) => c.total_targets === 0).length,
      total_targets: reportCities.reduce((sum, c) => sum + c.total_targets, 0),
      tier_1: reportCities.reduce((sum, c) => sum + c.tier_1, 0),
      tier_2: reportCities.reduce((sum, c) => sum + c.tier_2, 0),
      tier_3: reportCities.reduce((sum, c) => sum + c.tier_3, 0),
      cities_needing_contact_enrichment: reportCities.filter((c) => c.missing_contact_urls > 0).length
    },
    missing_city_list: reportCities
      .filter((c) => c.total_targets === 0)
      .map((c) => ({
        rank: c.rank,
        city: c.city,
        state: c.state,
        ingestion_status: c.ingestion_status,
        next_needed_sources: c.next_needed_sources
      })),
    cities: reportCities
  };

  writeJson(outPath, output);

  console.log("[COVERAGE REPORT] Cities:", output.totals.cities);
  console.log("[COVERAGE REPORT] Cities with targets:", output.totals.cities_with_targets);
  console.log("[COVERAGE REPORT] Cities missing targets:", output.totals.cities_missing_targets);
  console.log("[COVERAGE REPORT] Output:", outPath);
}

main();