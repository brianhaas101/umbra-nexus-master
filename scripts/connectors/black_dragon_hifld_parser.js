// scripts/connectors/black_dragon_hifld_parser.js
// Parses cached HIFLD GeoJSON into reviewed candidate entities.
// Does NOT write to leads_master.json.

const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "hifld_local_law_enforcement_locations";

const geojsonPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.geojson`
);

const outPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.candidates.json`
);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function getProp(props, names) {
  for (const name of names) {
    if (props[name] !== undefined && props[name] !== null && clean(props[name]) !== "") {
      return props[name];
    }
  }
  return "";
}

function getCoords(feature) {
  const coords = feature?.geometry?.coordinates;

  if (Array.isArray(coords) && coords.length >= 2) {
    return {
      lon: Number(coords[0]),
      lat: Number(coords[1])
    };
  }

  return { lat: null, lon: null };
}

function classifyAgencyType(name) {
  const t = name.toLowerCase();

  if (t.includes("sheriff")) return "sheriff_office";
  if (t.includes("police")) return "police_department";
  if (t.includes("marshal")) return "law_enforcement";
  if (t.includes("public safety")) return "public_safety";
  if (t.includes("department of public safety")) return "state_law_enforcement";

  return "law_enforcement";
}

function keepCandidate(name) {
  const t = name.toLowerCase();

  if (!name) return false;

  return (
    t.includes("police") ||
    t.includes("sheriff") ||
    t.includes("public safety") ||
    t.includes("marshal")
  );
}

function main() {
  console.log("[HIFLD PARSER] Starting...");

  if (!fs.existsSync(geojsonPath)) {
    throw new Error(`Missing GeoJSON cache: ${geojsonPath}`);
  }

  const geojson = readJson(geojsonPath);
  const features = Array.isArray(geojson.features) ? geojson.features : [];

  const sampleFields = features[0]?.properties
    ? Object.keys(features[0].properties)
    : [];

  const candidates = features
    .map((feature, index) => {
      const props = feature.properties || {};
      const coords = getCoords(feature);

      const agencyName = clean(getProp(props, [
        "NAME",
        "Name",
        "name",
        "AGENCY",
        "Agency",
        "agency",
        "FACILITY",
        "Facility",
        "facility"
      ]));

      const city = clean(getProp(props, [
        "CITY",
        "City",
        "city",
        "LOCALITY",
        "Locality"
      ]));

      const state = clean(getProp(props, [
        "STATE",
        "State",
        "state",
        "ST"
      ])).toUpperCase();

      const address = clean(getProp(props, [
        "ADDRESS",
        "Address",
        "address",
        "ADDR",
        "addr"
      ]));

      if (!keepCandidate(agencyName)) return null;

      return {
        candidate_id: `HIFLD-CAND-${String(index + 1).padStart(5, "0")}`,
        source_id: SOURCE_ID,
        source_name: "HIFLD Local Law Enforcement Locations",
        source_url: "https://catalog.data.gov/dataset/local-law-enforcement-locations",
        agency_name: agencyName,
        agency_type: classifyAgencyType(agencyName),
        city,
        state,
        country: "US",
        lat: coords.lat,
        lon: coords.lon,
        address,
        confidence: 0.78,
        import_status: "candidate_review_required",
        notes: [
          "Candidate extracted from official HIFLD cached GeoJSON.",
          "Requires review/enrichment before writing to black_dragon_leads_master.json."
        ],
        raw_properties: props
      };
    })
    .filter(Boolean);

  const output = {
    source_id: SOURCE_ID,
    generated_at: new Date().toISOString(),
    input_feature_count: features.length,
    candidate_count: candidates.length,
    sample_fields: sampleFields,
    candidates
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log("[HIFLD PARSER] Input features:", features.length);
  console.log("[HIFLD PARSER] Candidates:", candidates.length);
  console.log("[HIFLD PARSER] Sample fields:", sampleFields.join(", "));
  console.log("[HIFLD PARSER] Output:", outPath);
}

main();