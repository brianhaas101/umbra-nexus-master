const fs = require("fs");
const path = require("path");

const seedTargets = [

  // =====================================================
  // PUBLIC SAFETY / TRAINING
  // =====================================================

  {
    category: "LAW_ENFORCEMENT_TRAINING",
    organization_name: "State POST Academies",
    target_type: "TRAINING_AUTHORITY",
    source_type: "OFFICIAL_STATE_SOURCE"
  },

  {
    category: "LAW_ENFORCEMENT_TRAINING",
    organization_name: "Sheriff Associations",
    target_type: "ASSOCIATION",
    source_type: "OFFICIAL_ASSOCIATION_SOURCE"
  },

  {
    category: "LAW_ENFORCEMENT_TRAINING",
    organization_name: "Police Training Conferences",
    target_type: "CONFERENCE",
    source_type: "PUBLIC_EVENT_SOURCE"
  },

  // =====================================================
  // MOTORCYCLE / RIDER
  // =====================================================

  {
    category: "MOTORCYCLE_COMMUNITY",
    organization_name: "Motorcycle Dealerships",
    target_type: "DEALERSHIP",
    source_type: "PUBLIC_BUSINESS_SOURCE"
  },

  {
    category: "MOTORCYCLE_COMMUNITY",
    organization_name: "Rider Associations",
    target_type: "ASSOCIATION",
    source_type: "PUBLIC_ASSOCIATION_SOURCE"
  },

  {
    category: "MOTORCYCLE_COMMUNITY",
    organization_name: "Motorcycle Rally Organizers",
    target_type: "EVENT_ORGANIZER",
    source_type: "PUBLIC_EVENT_SOURCE"
  },

  // =====================================================
  // VETERAN ECOSYSTEM
  // =====================================================

  {
    category: "VETERAN_ECOSYSTEM",
    organization_name: "VFW Posts",
    target_type: "VETERAN_ORGANIZATION",
    source_type: "PUBLIC_VETERAN_SOURCE"
  },

  {
    category: "VETERAN_ECOSYSTEM",
    organization_name: "American Legion Posts",
    target_type: "VETERAN_ORGANIZATION",
    source_type: "PUBLIC_VETERAN_SOURCE"
  },

  {
    category: "VETERAN_ECOSYSTEM",
    organization_name: "Combat Veteran Motorcycle Associations",
    target_type: "VETERAN_RIDER_GROUP",
    source_type: "PUBLIC_ASSOCIATION_SOURCE"
  }

];

const majorCities = [

  "New York City, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "Austin, TX",
  "Atlanta, GA",
  "Miami, FL",
  "Denver, CO",
  "Seattle, WA",
  "Las Vegas, NV",
  "Portland, OR",
  "Nashville, TN",
  "Charlotte, NC",
  "Orlando, FL",
  "Detroit, MI"

];

const discoveryTasks = [];

let counter = 0;

for (const city of majorCities) {

  const cityParts = city.split(",");
  const cityName = cityParts[0].trim();
  const region = cityParts[1].trim();

  for (const seed of seedTargets) {

    counter++;

    discoveryTasks.push({

      discovery_task_id:
        `BD_REAL_DISCOVERY_${String(counter).padStart(6, "0")}`,

      client_id:
        "black_dragon",

      category:
        seed.category,

      organization_seed:
        seed.organization_name,

      target_type:
        seed.target_type,

      source_type:
        seed.source_type,

      city:
        cityName,

      region:
        region,

      country:
        "USA",

      search_query:
        `${seed.organization_name} ${cityName} ${region}`,

      discovery_status:
        "PENDING_REAL_SOURCE_DISCOVERY",

      requires_real_source:
        true,

      requires_real_contact:
        true,

      requires_manual_review:
        true,

      contact_ready:
        false,

      outreach_allowed:
        false
    });
  }
}

const payload = {

  version:
    "black_dragon_real_public_source_discovery_seed_queue_v1_batch_102",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  totals: {
    cities:
      majorCities.length,

    seed_targets:
      seedTargets.length,

    discoveryTasks:
      discoveryTasks.length,

    contact_ready:
      0,

    outreach_allowed:
      0
  },

  discoveryTasks
};

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/real_contact_expansion/seed_queues/national/real_public_source_discovery_seed_queue.v1.json"
  ),
  JSON.stringify(payload, null, 2)
);

console.log(JSON.stringify({
  status:
    "REAL_PUBLIC_SOURCE_DISCOVERY_SEEDING_COMPLETE",

  totals:
    payload.totals
}, null, 2));

