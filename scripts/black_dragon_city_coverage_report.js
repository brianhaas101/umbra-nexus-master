const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const inputPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_major_city_targets.v1.json"
);

const outPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_city_coverage_report.v1.json"
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

function cityPriority(city) {
  if (city.total_targets >= 5) return "covered";
  if (city.total_targets >= 1) return "partial";
  return "missing";
}

function main() {
  console.log("[CITY COVERAGE] Starting...");

  const input = readJson(inputPath);
  const cities = Array.isArray(input.cities) ? input.cities : [];

  const reportCities = cities.map((city) => {
    const targets = Array.isArray(city.targets) ? city.targets : [];
    const missingContact = targets.filter((t) => !clean(t.contact_url)).length;

    return {
      rank: city.rank,
      city_id: city.city_id,
      city: city.city,
      state: city.state,
      total_targets: city.total_targets,
      tier_1: city.tier_1,
      tier_2: city.tier_2,
      tier_3: city.tier_3,
      coverage_status: city.coverage_status,
      coverage_level: cityPriority(city),
      contact_missing_count: missingContact,
      needs_source_ingestion: city.total_targets === 0,
      recommended_next_sources:
        city.total_targets === 0
          ? [
              "official_agency_sites",
              "state_post_boards",
              "local_public_safety_budgets",
              "fbi_doj_press_releases"
            ]
          : targets.some((t) => !clean(t.contact_url))
            ? [
                "agency_websites.json",
                "official_agency_sites"
              ]
            : []
    };
  });

  const output = {
    client_id: input.client_id,
    version: "v1",
    generated_at: new Date().toISOString(),
    source_file: "black_dragon_major_city_targets.v1.json",
    totals: {
      required_cities: 50,
      cities_present: cities.length,
      covered: reportCities.filter((c) => c.coverage_level === "covered").length,
      partial: reportCities.filter((c) => c.coverage_level === "partial").length,
      missing: reportCities.filter((c) => c.coverage_level === "missing").length,
      total_targets: reportCities.reduce((sum, c) => sum + Number(c.total_targets || 0), 0),
      cities_needing_source_ingestion: reportCities.filter((c) => c.needs_source_ingestion).length
    },
    missing_cities: reportCities.filter((c) => c.needs_source_ingestion),
    partial_cities: reportCities.filter((c) => c.coverage_level === "partial"),
    cities: reportCities
  };

  writeJson(outPath, output);

  console.log("[CITY COVERAGE] Cities present:", output.totals.cities_present);
  console.log("[CITY COVERAGE] Missing:", output.totals.missing);
  console.log("[CITY COVERAGE] Partial:", output.totals.partial);
  console.log("[CITY COVERAGE] Covered:", output.totals.covered);
  console.log("[CITY COVERAGE] Output:", outPath);
}

main();