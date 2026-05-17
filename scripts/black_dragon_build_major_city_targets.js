const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "hifld_local_law_enforcement_locations";

const inputPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.validated_targets.json`
);

const outPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_major_city_targets.v1.json"
);

// Top 50 by 2024 U.S. Census city estimates.
const TOP_50_CITIES = [
  { rank: 1, city: "New York", state: "NY", lat: 40.7128, lon: -74.0060 },
  { rank: 2, city: "Los Angeles", state: "CA", lat: 34.0522, lon: -118.2437 },
  { rank: 3, city: "Chicago", state: "IL", lat: 41.8781, lon: -87.6298 },
  { rank: 4, city: "Houston", state: "TX", lat: 29.7604, lon: -95.3698 },
  { rank: 5, city: "Phoenix", state: "AZ", lat: 33.4484, lon: -112.0740 },
  { rank: 6, city: "Philadelphia", state: "PA", lat: 39.9526, lon: -75.1652 },
  { rank: 7, city: "San Antonio", state: "TX", lat: 29.4241, lon: -98.4936 },
  { rank: 8, city: "San Diego", state: "CA", lat: 32.7157, lon: -117.1611 },
  { rank: 9, city: "Dallas", state: "TX", lat: 32.7767, lon: -96.7970 },
  { rank: 10, city: "Fort Worth", state: "TX", lat: 32.7555, lon: -97.3308 },
  { rank: 11, city: "Jacksonville", state: "FL", lat: 30.3322, lon: -81.6557 },
  { rank: 12, city: "Austin", state: "TX", lat: 30.2672, lon: -97.7431 },
  { rank: 13, city: "San Jose", state: "CA", lat: 37.3382, lon: -121.8863 },
  { rank: 14, city: "Columbus", state: "OH", lat: 39.9612, lon: -82.9988 },
  { rank: 15, city: "Charlotte", state: "NC", lat: 35.2271, lon: -80.8431 },
  { rank: 16, city: "Indianapolis", state: "IN", lat: 39.7684, lon: -86.1581 },
  { rank: 17, city: "San Francisco", state: "CA", lat: 37.7749, lon: -122.4194 },
  { rank: 18, city: "Seattle", state: "WA", lat: 47.6062, lon: -122.3321 },
  { rank: 19, city: "Denver", state: "CO", lat: 39.7392, lon: -104.9903 },
  { rank: 20, city: "Oklahoma City", state: "OK", lat: 35.4676, lon: -97.5164 },
  { rank: 21, city: "Nashville", state: "TN", lat: 36.1627, lon: -86.7816 },
  { rank: 22, city: "El Paso", state: "TX", lat: 31.7619, lon: -106.4850 },
  { rank: 23, city: "Washington", state: "DC", lat: 38.9072, lon: -77.0369 },
  { rank: 24, city: "Las Vegas", state: "NV", lat: 36.1699, lon: -115.1398 },
  { rank: 25, city: "Boston", state: "MA", lat: 42.3601, lon: -71.0589 },
  { rank: 26, city: "Detroit", state: "MI", lat: 42.3314, lon: -83.0458 },
  { rank: 27, city: "Louisville", state: "KY", lat: 38.2527, lon: -85.7585 },
  { rank: 28, city: "Memphis", state: "TN", lat: 35.1495, lon: -90.0490 },
  { rank: 29, city: "Portland", state: "OR", lat: 45.5152, lon: -122.6784 },
  { rank: 30, city: "Baltimore", state: "MD", lat: 39.2904, lon: -76.6122 },
  { rank: 31, city: "Milwaukee", state: "WI", lat: 43.0389, lon: -87.9065 },
  { rank: 32, city: "Albuquerque", state: "NM", lat: 35.0844, lon: -106.6504 },
  { rank: 33, city: "Tucson", state: "AZ", lat: 32.2226, lon: -110.9747 },
  { rank: 34, city: "Fresno", state: "CA", lat: 36.7378, lon: -119.7871 },
  { rank: 35, city: "Sacramento", state: "CA", lat: 38.5816, lon: -121.4944 },
  { rank: 36, city: "Mesa", state: "AZ", lat: 33.4152, lon: -111.8315 },
  { rank: 37, city: "Kansas City", state: "MO", lat: 39.0997, lon: -94.5786 },
  { rank: 38, city: "Atlanta", state: "GA", lat: 33.7490, lon: -84.3880 },
  { rank: 39, city: "Omaha", state: "NE", lat: 41.2565, lon: -95.9345 },
  { rank: 40, city: "Colorado Springs", state: "CO", lat: 38.8339, lon: -104.8214 },
  { rank: 41, city: "Raleigh", state: "NC", lat: 35.7796, lon: -78.6382 },
  { rank: 42, city: "Miami", state: "FL", lat: 25.7617, lon: -80.1918 },
  { rank: 43, city: "Virginia Beach", state: "VA", lat: 36.8529, lon: -75.9780 },
  { rank: 44, city: "Long Beach", state: "CA", lat: 33.7701, lon: -118.1937 },
  { rank: 45, city: "Oakland", state: "CA", lat: 37.8044, lon: -122.2711 },
  { rank: 46, city: "Minneapolis", state: "MN", lat: 44.9778, lon: -93.2650 },
  { rank: 47, city: "Bakersfield", state: "CA", lat: 35.3733, lon: -119.0187 },
  { rank: 48, city: "Tulsa", state: "OK", lat: 36.1540, lon: -95.9928 },
  { rank: 49, city: "Tampa", state: "FL", lat: 27.9506, lon: -82.4572 },
  { rank: 50, city: "Arlington", state: "TX", lat: 32.7357, lon: -97.1081 }
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function cityId(city, state) {
  return `city_${String(state).toLowerCase()}_${String(city)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")}`;
}

function cityKey(city, state) {
  return `${String(city).toUpperCase()}|${String(state).toUpperCase()}`;
}

function emptyCityShell(item) {
  return {
    rank: item.rank,
    city_id: cityId(item.city, item.state),
    city: item.city,
    state: item.state,
    country: "US",
    lat: item.lat,
    lon: item.lon,
    total_targets: 0,
    tier_1: 0,
    tier_2: 0,
    tier_3: 0,
    coverage_status: "missing_validated_targets",
    targets: []
  };
}

function main() {
  const input = readJson(inputPath);
  const targets = Array.isArray(input.targets) ? input.targets : [];

  const usable = targets.filter((t) =>
    ["TIER_1", "TIER_2", "TIER_3"].includes(t.validated_tier)
  );

  const cities = {};

  TOP_50_CITIES.forEach((city) => {
    cities[cityKey(city.city, city.state)] = emptyCityShell(city);
  });

  usable.forEach((target) => {
    const key = cityKey(target.city, target.state);

    // Do not add non-top-50 cities to this canonical file.
    if (!cities[key]) return;

    cities[key].total_targets += 1;
    cities[key].coverage_status = "has_validated_targets";

    if (target.validated_tier === "TIER_1") cities[key].tier_1 += 1;
    if (target.validated_tier === "TIER_2") cities[key].tier_2 += 1;
    if (target.validated_tier === "TIER_3") cities[key].tier_3 += 1;

    cities[key].targets.push({
      target_id: target.authority_target_id,
      agency_name: target.agency_name,
      authority_type: target.authority_type,
      agency_size_estimate: target.agency_size_estimate,
      validated_tier: target.validated_tier,
      actionability: target.actionability,
      city: target.city,
      state: target.state,
      county: target.county,
      lat: target.lat,
      lon: target.lon,
      contact_url: target.contact_url || "",
      source_name: target.source_name,
      source_url: target.source_url,
      review_status: target.review_status,
      required_next_sources: target.required_next_sources || []
    });
  });

  const cityList = Object.values(cities).sort((a, b) => a.rank - b.rank);

  const output = {
    client_id: "black_dragon_omg_cert_v1",
    version: "v1",
    generated_at: new Date().toISOString(),
    source_ids: [SOURCE_ID],
    city_standard: {
      required_city_count: 50,
      basis: "Top 50 U.S. cities by 2024 Census city population estimates",
      missing_city_policy:
        "Cities remain present with empty targets and coverage_status=missing_validated_targets until verified sources populate them."
    },
    purpose:
      "Canonical top-50 major-city target file for Black Dragon. Built from validated real-world source data only.",
    policy: {
      no_placeholders: true,
      no_hypothetical_leads: true,
      city_shells_are_not_leads: true,
      live_import_allowed: false,
      requires_signal_enrichment_before_client_action: true
    },
    totals: {
      cities: cityList.length,
      cities_with_targets: cityList.filter((c) => c.total_targets > 0).length,
      cities_missing_targets: cityList.filter((c) => c.total_targets === 0).length,
      targets: cityList.reduce((sum, c) => sum + c.total_targets, 0),
      tier_1: cityList.reduce((sum, c) => sum + c.tier_1, 0),
      tier_2: cityList.reduce((sum, c) => sum + c.tier_2, 0),
      tier_3: cityList.reduce((sum, c) => sum + c.tier_3, 0)
    },
    cities: cityList
  };

  writeJson(outPath, output);

  console.log("[MAJOR CITY TARGETS] Built.");
  console.log("Cities:", output.totals.cities);
  console.log("Cities with targets:", output.totals.cities_with_targets);
  console.log("Cities missing targets:", output.totals.cities_missing_targets);
  console.log("Targets:", output.totals.targets);
  console.log("Output:", outPath);
}

main();