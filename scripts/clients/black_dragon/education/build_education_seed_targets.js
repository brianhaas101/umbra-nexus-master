const fs = require("fs");
const path = require("path");

const registryPath =
  "public/data/clients/black_dragon/education/sources/education_source_registry.v1.json";

const outPath =
  "public/data/clients/black_dragon/education/seed_targets/education_seed_targets.v1.json";

const registry =
  JSON.parse(fs.readFileSync(path.resolve(registryPath), "utf8"));

const categories =
  registry.source_categories || [];

const stateMarkets = [
  { state: "Alabama", abbr: "AL" },
  { state: "Alaska", abbr: "AK" },
  { state: "Arizona", abbr: "AZ" },
  { state: "Arkansas", abbr: "AR" },
  { state: "California", abbr: "CA" },
  { state: "Colorado", abbr: "CO" },
  { state: "Connecticut", abbr: "CT" },
  { state: "Delaware", abbr: "DE" },
  { state: "Florida", abbr: "FL" },
  { state: "Georgia", abbr: "GA" },
  { state: "Hawaii", abbr: "HI" },
  { state: "Idaho", abbr: "ID" },
  { state: "Illinois", abbr: "IL" },
  { state: "Indiana", abbr: "IN" },
  { state: "Iowa", abbr: "IA" },
  { state: "Kansas", abbr: "KS" },
  { state: "Kentucky", abbr: "KY" },
  { state: "Louisiana", abbr: "LA" },
  { state: "Maine", abbr: "ME" },
  { state: "Maryland", abbr: "MD" },
  { state: "Massachusetts", abbr: "MA" },
  { state: "Michigan", abbr: "MI" },
  { state: "Minnesota", abbr: "MN" },
  { state: "Mississippi", abbr: "MS" },
  { state: "Missouri", abbr: "MO" },
  { state: "Montana", abbr: "MT" },
  { state: "Nebraska", abbr: "NE" },
  { state: "Nevada", abbr: "NV" },
  { state: "New Hampshire", abbr: "NH" },
  { state: "New Jersey", abbr: "NJ" },
  { state: "New Mexico", abbr: "NM" },
  { state: "New York", abbr: "NY" },
  { state: "North Carolina", abbr: "NC" },
  { state: "North Dakota", abbr: "ND" },
  { state: "Ohio", abbr: "OH" },
  { state: "Oklahoma", abbr: "OK" },
  { state: "Oregon", abbr: "OR" },
  { state: "Pennsylvania", abbr: "PA" },
  { state: "Rhode Island", abbr: "RI" },
  { state: "South Carolina", abbr: "SC" },
  { state: "South Dakota", abbr: "SD" },
  { state: "Tennessee", abbr: "TN" },
  { state: "Texas", abbr: "TX" },
  { state: "Utah", abbr: "UT" },
  { state: "Vermont", abbr: "VT" },
  { state: "Virginia", abbr: "VA" },
  { state: "Washington", abbr: "WA" },
  { state: "West Virginia", abbr: "WV" },
  { state: "Wisconsin", abbr: "WI" },
  { state: "Wyoming", abbr: "WY" }
];

function categoryLabel(category, state) {
  const clean = String(category)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

  return `${state} ${clean}`;
}

function seedIntent(category) {
  if (category.includes("POST") || category.includes("ACADEMY")) {
    return "institutional_training_adoption";
  }

  if (category.includes("COLLEGE") || category.includes("PROGRAM")) {
    return "curriculum_reference_or_bulk_book_adoption";
  }

  if (category.includes("RIDER") || category.includes("MSF")) {
    return "public_rider_education_distribution";
  }

  if (category.includes("VETERAN")) {
    return "veteran_leadership_and_transition_distribution";
  }

  return "educational_distribution_review";
}

const seeds = [];

for (const market of stateMarkets) {
  for (const cat of categories) {
    seeds.push({
      seed_id:
        `BD_EDU_SEED_${String(seeds.length + 1).padStart(5, "0")}`,

      client_id:
        "black_dragon",

      module:
        "education_expansion_v1",

      entity_class:
        cat.entity_class,

      source_category:
        cat.category,

      institution_type:
        cat.institution_type,

      organization_name:
        categoryLabel(cat.category, market.state),

      target_name:
        categoryLabel(cat.category, market.state),

      region:
        market.state,

      state_abbr:
        market.abbr,

      country:
        "USA",

      source_status:
        "SEED_UNVERIFIED",

      verification_status:
        "NEEDS_SOURCE_DISCOVERY",

      contact_status:
        "NO_CONTACT_ATTACHED",

      outreach_allowed:
        false,

      reason_outreach_blocked:
        "Seed target requires source discovery and contact verification before outreach.",

      seed_intent:
        seedIntent(cat.category),

      supports_bulk_orders:
        !!cat.supports_bulk_orders,

      supports_curriculum_adoption:
        !!cat.supports_curriculum_adoption,

      supports_instructor_propagation:
        !!cat.supports_instructor_propagation,

      supports_certification_relationships:
        !!cat.supports_certification_relationships,

      priority_weight:
        cat.priority_weight,

      generated_from_source_id:
        cat.source_id,

      generated_at:
        new Date().toISOString()
    });
  }
}

const payload = {
  version:
    "black_dragon_education_seed_targets_v1_batch_066",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  module:
    "education_expansion_v1",

  totals: {
    states:
      stateMarkets.length,

    source_categories:
      categories.length,

    seed_targets:
      seeds.length,

    outreach_allowed:
      seeds.filter(x => x.outreach_allowed).length,

    blocked_until_verified:
      seeds.filter(x => !x.outreach_allowed).length
  },

  seed_targets:
    seeds
};

fs.writeFileSync(
  path.resolve(outPath),
  JSON.stringify(payload, null, 2)
);

console.log(JSON.stringify({
  status:
    "EDUCATION_SEED_TARGETS_CREATED",

  totals:
    payload.totals,

  output:
    outPath
}, null, 2));
