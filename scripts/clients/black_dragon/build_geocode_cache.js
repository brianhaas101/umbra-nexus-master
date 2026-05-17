const fs = require("fs");
const path = require("path");

const OUT = "public/data/clients/black_dragon/geocode_cache.json";

const records = [
  ["Phoenix","AZ",33.4484,-112.0740],
  ["Mesa","AZ",33.4152,-111.8315],
  ["Chandler","AZ",33.3062,-111.8413],
  ["Glendale","AZ",33.5387,-112.1860],
  ["Tempe","AZ",33.4255,-111.9400],
  ["Tucson","AZ",32.2226,-110.9747],
  ["Flagstaff","AZ",35.1983,-111.6513],
  ["Scottsdale","AZ",33.4942,-111.9261],
  ["Surprise","AZ",33.6292,-112.3679],
  ["Yuma","AZ",32.6927,-114.6277],
  ["San Diego","CA",32.7157,-117.1611]
];

const cache = {
  version: "black_dragon_geocode_cache_v1",
  generated_at: new Date().toISOString(),
  rule: "These are city-centroid coordinates for operational visualization only, not exact agency building coordinates.",
  precision: "CITY_CENTROID",
  records: records.map(([city,state,lat,lon]) => ({
    key: `${city}|${state}`.toUpperCase(),
    city,
    state,
    lat,
    lon,
    confidence: 0.75,
    geocode_type: "CITY_CENTROID",
    exact_agency_location: false
  }))
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(cache, null, 2));

console.log("[GEOCODE CACHE] COMPLETE");
console.log("[GEOCODE CACHE] Records:", cache.records.length);
