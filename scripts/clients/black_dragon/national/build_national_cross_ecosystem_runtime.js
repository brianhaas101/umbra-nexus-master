const fs = require("fs");
const path = require("path");

const majorMarkets = [
  ["New York", "NY", 40.7128, -74.0060],
  ["Los Angeles", "CA", 34.0522, -118.2437],
  ["Chicago", "IL", 41.8781, -87.6298],
  ["Houston", "TX", 29.7604, -95.3698],
  ["Phoenix", "AZ", 33.4484, -112.0740],
  ["Philadelphia", "PA", 39.9526, -75.1652],
  ["San Antonio", "TX", 29.4241, -98.4936],
  ["San Diego", "CA", 32.7157, -117.1611],
  ["Dallas", "TX", 32.7767, -96.7970],
  ["San Jose", "CA", 37.3382, -121.8863],
  ["Austin", "TX", 30.2672, -97.7431],
  ["Jacksonville", "FL", 30.3322, -81.6557],
  ["Fort Worth", "TX", 32.7555, -97.3308],
  ["Columbus", "OH", 39.9612, -82.9988],
  ["Charlotte", "NC", 35.2271, -80.8431],
  ["San Francisco", "CA", 37.7749, -122.4194],
  ["Indianapolis", "IN", 39.7684, -86.1581],
  ["Seattle", "WA", 47.6062, -122.3321],
  ["Denver", "CO", 39.7392, -104.9903],
  ["Washington", "DC", 38.9072, -77.0369],
  ["Boston", "MA", 42.3601, -71.0589],
  ["El Paso", "TX", 31.7619, -106.4850],
  ["Nashville", "TN", 36.1627, -86.7816],
  ["Detroit", "MI", 42.3314, -83.0458],
  ["Oklahoma City", "OK", 35.4676, -97.5164],
  ["Portland", "OR", 45.5152, -122.6784],
  ["Las Vegas", "NV", 36.1699, -115.1398],
  ["Memphis", "TN", 35.1495, -90.0490],
  ["Louisville", "KY", 38.2527, -85.7585],
  ["Baltimore", "MD", 39.2904, -76.6122],
  ["Milwaukee", "WI", 43.0389, -87.9065],
  ["Albuquerque", "NM", 35.0844, -106.6504],
  ["Tucson", "AZ", 32.2226, -110.9747],
  ["Fresno", "CA", 36.7378, -119.7871],
  ["Sacramento", "CA", 38.5816, -121.4944],
  ["Mesa", "AZ", 33.4152, -111.8315],
  ["Kansas City", "MO", 39.0997, -94.5786],
  ["Atlanta", "GA", 33.7490, -84.3880],
  ["Omaha", "NE", 41.2565, -95.9345],
  ["Raleigh", "NC", 35.7796, -78.6382],
  ["Miami", "FL", 25.7617, -80.1918],
  ["Virginia Beach", "VA", 36.8529, -75.9780],
  ["Oakland", "CA", 37.8044, -122.2712],
  ["Minneapolis", "MN", 44.9778, -93.2650],
  ["Tulsa", "OK", 36.1540, -95.9928],
  ["Arlington", "TX", 32.7357, -97.1081],
  ["Tampa", "FL", 27.9506, -82.4572],
  ["New Orleans", "LA", 29.9511, -90.0715],
  ["Wichita", "KS", 37.6872, -97.3301],
  ["Cleveland", "OH", 41.4993, -81.6944]
];

const ecosystems = [
  {
    ecosystem: "EDUCATION",
    entity_class: "EDUCATION_NODE",
    source_categories: [
      "STATE_POST_ACADEMY",
      "REGIONAL_POLICE_ACADEMY",
      "CRIMINAL_JUSTICE_COLLEGE",
      "PUBLIC_SAFETY_INSTITUTE"
    ],
    base_weight: 0.94
  },
  {
    ecosystem: "VETERAN",
    entity_class: "VETERAN_NODE",
    source_categories: [
      "VFW_POST",
      "AMERICAN_LEGION_POST",
      "VETERAN_RIDING_ASSOCIATION",
      "COMBAT_VETERAN_MOTORCYCLE_GROUP"
    ],
    base_weight: 0.92
  },
  {
    ecosystem: "LAW_ENFORCEMENT_MOTOR",
    entity_class: "MOTOR_UNIT_NODE",
    source_categories: [
      "POLICE_MOTOR_UNIT",
      "SHERIFF_MOTOR_DIVISION",
      "MOTORCYCLE_OFFICER_ASSOCIATION",
      "GANG_INTELLIGENCE_TRAINING_UNIT"
    ],
    base_weight: 0.96
  },
  {
    ecosystem: "DISTRIBUTION",
    entity_class: "DEALERSHIP_NODE",
    source_categories: [
      "HARLEY_DAVIDSON_DEALERSHIP",
      "INDIAN_MOTORCYCLE_DEALERSHIP",
      "INDEPENDENT_MOTORCYCLE_DEALERSHIP",
      "CUSTOM_MOTORCYCLE_SHOP"
    ],
    base_weight: 0.95
  },
  {
    ecosystem: "EVENT_INFRASTRUCTURE",
    entity_class: "EVENT_NODE",
    source_categories: [
      "MAJOR_RALLY_ECOSYSTEM",
      "REGIONAL_RALLY_CIRCUIT",
      "EVENT_PROMOTER",
      "VENDOR_ROW_OPERATOR"
    ],
    base_weight: 0.97
  }
];

const runtimeEntities = [];

for (const [city, state, lat, lon] of majorMarkets) {
  for (const eco of ecosystems) {
    for (const category of eco.source_categories) {
      const id = String(runtimeEntities.length + 1).padStart(6, "0");

      runtimeEntities.push({
        entity_id: `BD_NAT_ECO_${id}`,
        client_id: "black_dragon",
        module: "national_ecosystem_expansion_v1",

        organization_name: `${city} ${category.replace(/_/g, " ")}`,
        target_name: `${city} ${category.replace(/_/g, " ")}`,

        city,
        region: state,
        country: "USA",

        lat,
        lon,

        ecosystem: eco.ecosystem,
        entity_class: eco.entity_class,
        source_category: category,

        source_status: "NATIONAL_SEED_UNVERIFIED",
        verification_status: "NEEDS_PUBLIC_SOURCE_DISCOVERY",
        contact_status: "NO_CONTACT_ATTACHED",
        outreach_allowed: false,

        reason_outreach_blocked:
          "National ecosystem entity requires verified public source and verified contact route before outreach.",

        base_priority_weight: eco.base_weight,
        national_priority_score: Math.round(eco.base_weight * 100),

        next_action: "DISCOVER_PUBLIC_SOURCE",

        forbidden_actions: [
          "NO_OUTREACH",
          "NO_AUTO_CONTACT",
          "NO_RESPONSE_GENERATION",
          "NO_QUEUE_INSERTION_UNTIL_VERIFIED"
        ],

        generated_at: new Date().toISOString()
      });
    }
  }
}

const byCity = majorMarkets.map(([city, state, lat, lon]) => {
  const entities = runtimeEntities.filter(e => e.city === city && e.region === state);

  return {
    city_id: `BD_NAT_CITY_${city.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_${state}`,
    city,
    region: state,
    country: "USA",
    lat,
    lon,
    ecosystems: ecosystems.map(e => e.ecosystem),
    entity_count: entities.length,
    outreach_allowed: entities.filter(e => e.outreach_allowed).length,
    discovery_required: entities.filter(e => e.verification_status === "NEEDS_PUBLIC_SOURCE_DISCOVERY").length
  };
});

const payload = {
  version: "black_dragon_national_cross_ecosystem_runtime_v1_batch_077",
  generated_at: new Date().toISOString(),
  client_id: "black_dragon",
  module: "national_ecosystem_expansion_v1",

  totals: {
    national_cities: majorMarkets.length,
    ecosystems: ecosystems.length,
    runtime_entities: runtimeEntities.length,
    outreach_allowed: runtimeEntities.filter(e => e.outreach_allowed).length,
    blocked_until_verified: runtimeEntities.filter(e => !e.outreach_allowed).length
  },

  city_index: byCity,
  runtime_entities: runtimeEntities
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/national/runtime/national_cross_ecosystem_runtime.v1.json"),
  JSON.stringify(payload, null, 2)
);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/national/cities/national_city_ecosystem_index.v1.json"),
  JSON.stringify({
    version: "black_dragon_national_city_ecosystem_index_v1_batch_077",
    generated_at: new Date().toISOString(),
    totals: payload.totals,
    cities: byCity
  }, null, 2)
);

console.log(JSON.stringify({
  status: "NATIONAL_CROSS_ECOSYSTEM_RUNTIME_CREATED",
  totals: payload.totals,
  outputs: [
    "public/data/clients/black_dragon/national/runtime/national_cross_ecosystem_runtime.v1.json",
    "public/data/clients/black_dragon/national/cities/national_city_ecosystem_index.v1.json"
  ]
}, null, 2));
