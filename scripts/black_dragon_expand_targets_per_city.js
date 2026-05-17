const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "hifld_local_law_enforcement_locations";

const cityTargetsPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_major_city_targets.v1.json"
);

const hifldPriorityPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.priority_review.json`
);

const outPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_city_expansion_candidates.v1.json"
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

function key(city, state) {
  return `${clean(city).toUpperCase()}|${clean(state).toUpperCase()}`;
}

function badAgency(name) {
  return /school|university|college|hospital|medical|airport|transit|railroad|campus|seminary|detention|jail|correction/i.test(name);
}

function goodAgency(name) {
  return /police department|police bureau|sheriff|department of public safety/i.test(name);
}

function sizeTier(size) {
  const n = Number(size || 0);
  if (n >= 1000) return "TIER_1";
  if (n >= 300) return "TIER_2";
  if (n >= 100) return "TIER_3";
  return "REVIEW_LOW";
}

function main() {
  console.log("[CITY EXPANSION] Starting...");

  const cityFile = readJson(cityTargetsPath);
  const hifld = readJson(hifldPriorityPath);

  const top50 = Array.isArray(cityFile.cities) ? cityFile.cities : [];
  const candidates = Array.isArray(hifld.candidates) ? hifld.candidates : [];

  const cityMap = new Map(top50.map((c) => [key(c.city, c.state), c]));

  const grouped = {};

  for (const city of top50) {
    grouped[city.city_id] = {
      rank: city.rank,
      city_id: city.city_id,
      city: city.city,
      state: city.state,
      existing_targets: city.total_targets || 0,
      expansion_candidates: []
    };
  }

  candidates.forEach((candidate) => {
    const cityKey = key(candidate.city, candidate.state);
    const cityShell = cityMap.get(cityKey);
    if (!cityShell) return;

    const agencyName = clean(candidate.agency_name);
    if (!agencyName) return;
    if (badAgency(agencyName)) return;
    if (!goodAgency(agencyName)) return;

    const size = Number(candidate.agency_size_estimate || 0);
    const tier = sizeTier(size);

    grouped[cityShell.city_id].expansion_candidates.push({
      candidate_id: candidate.candidate_id,
      source_id: SOURCE_ID,
      agency_name: agencyName,
      agency_type: candidate.agency_type,
      city: candidate.city,
      state: candidate.state,
      county: candidate.county,
      lat: candidate.lat,
      lon: candidate.lon,
      address: candidate.address,
      phone: candidate.phone || "",
      website: candidate.website || "",
      contact_url: candidate.website || "",
      agency_size_estimate: size,
      priority_score: candidate.priority_score,
      recommended_tier: tier,
      review_status: "expansion_review_required",
      import_allowed: false,
      source_name: candidate.source_name,
      source_url: candidate.source_url,
      notes: [
        "Real HIFLD-derived expansion candidate.",
        "Not live-import approved yet.",
        "Requires website/contact verification before client action."
      ]
    });
  });

  for (const city of Object.values(grouped)) {
    city.expansion_candidates.sort((a, b) => {
      const rank = { TIER_1: 1, TIER_2: 2, TIER_3: 3, REVIEW_LOW: 4 };
      return (rank[a.recommended_tier] || 99) - (rank[b.recommended_tier] || 99)
        || Number(b.priority_score || 0) - Number(a.priority_score || 0);
    });

    city.expansion_candidate_count = city.expansion_candidates.length;
    city.has_expansion_candidates = city.expansion_candidate_count > 0;
  }

  const cityList = Object.values(grouped).sort((a, b) => a.rank - b.rank);

  const output = {
    client_id: "black_dragon_omg_cert_v1",
    version: "v1",
    generated_at: new Date().toISOString(),
    source_file: "hifld_local_law_enforcement_locations.priority_review.json",
    target_file: "black_dragon_major_city_targets.v1.json",
    policy: {
      no_placeholders: true,
      no_hypothetical_leads: true,
      live_import_allowed: false,
      requires_manual_review_before_merge: true
    },
    totals: {
      cities: cityList.length,
      cities_with_expansion_candidates: cityList.filter((c) => c.expansion_candidate_count > 0).length,
      cities_without_expansion_candidates: cityList.filter((c) => c.expansion_candidate_count === 0).length,
      expansion_candidates: cityList.reduce((sum, c) => sum + c.expansion_candidate_count, 0)
    },
    cities: cityList
  };

  writeJson(outPath, output);

  console.log("[CITY EXPANSION] Cities:", output.totals.cities);
  console.log("[CITY EXPANSION] Cities with candidates:", output.totals.cities_with_expansion_candidates);
  console.log("[CITY EXPANSION] Candidates:", output.totals.expansion_candidates);
  console.log("[CITY EXPANSION] Output:", outPath);
}

main();