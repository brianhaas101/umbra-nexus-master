const fs = require("fs");
const path = require("path");

const TARGETS = "public/data/clients/black_dragon/national_verified_outreach_shortlist.json";
const CACHE = "public/data/clients/black_dragon/geocode_cache.json";
const OUT = "public/data/clients/black_dragon/geographic_intelligence_layer.json";

function read(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }

const targets = read(TARGETS);
const cache = read(CACHE);
const lookup = new Map(cache.records.map(r => [r.key, r]));

const records = [];

for (const t of targets.targets || []) {
  const key = `${t.city || ""}|${t.state || ""}`.toUpperCase();
  const geo = lookup.get(key);

  records.push({
    entity_key: `${t.state}|${t.agency_name}`.toUpperCase(),
    agency_name: t.agency_name,
    city: t.city,
    state: t.state,
    geocode_status: geo ? "GEOCODED_CITY_CENTROID" : "MISSING_GEOCODE",
    lat: geo?.lat || null,
    lon: geo?.lon || null,
    geocode_confidence: geo?.confidence || 0,
    exact_agency_location: false,
    layer_id: "L07_GEOGRAPHIC_TERRITORY"
  });
}

const output = {
  version: "black_dragon_geographic_intelligence_layer_v1",
  generated_at: new Date().toISOString(),
  rule: "Geographic output uses city-centroid coordinates only unless exact agency coordinates are later verified.",
  total_records: records.length,
  geocoded: records.filter(r => r.geocode_status === "GEOCODED_CITY_CENTROID").length,
  missing: records.filter(r => r.geocode_status === "MISSING_GEOCODE").length,
  records
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[GEO INTEL] COMPLETE");
console.log("[GEO INTEL] Records:", output.total_records);
console.log("[GEO INTEL] Geocoded:", output.geocoded);
console.log("[GEO INTEL] Missing:", output.missing);
