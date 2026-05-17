const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const source =
  "public/data/clients/black_dragon/authentication/queues/entity_authentication_queue.v1.json";

const payload = readJson(source);
const tasks = payload.authentication_tasks || [];

const syntheticPatterns = [
  /^Example\s+/i,
  /^Sample\s+/i,
  /^High-Net-Worth Vehicle Owner/i,
  /^Executive Fleet Operator/i,
  /^Performance Service Buyer/i,
  /^Luxury Auto Cluster/i,
  /^Collector Garage Network/i,
  /^Downtown Civic Corridor/i,
  /^Brickell Office Tower/i,
  /^Coconut Grove Private Client/i,
  /^Little Havana Executive Residence/i,
  /^Midway LAX Luxury Rental Hub/i,
  /^[A-Za-z\s]+$/i
];

const genericCityOnlyBlocklist = new Set([
  "Albuquerque", "Arlington", "Atlanta", "Austin", "Baltimore",
  "Boston", "Charlotte", "Chicago", "Colorado Springs", "Columbus",
  "Dallas", "Denver", "Detroit", "El Paso", "Fort Worth",
  "Fresno", "Houston", "Indianapolis", "Jacksonville", "Kansas City",
  "Las Vegas", "Long Beach", "Los Angeles", "Louisville", "Memphis",
  "Mesa", "Miami", "Milwaukee", "Minneapolis", "Nashville",
  "New Orleans", "New York", "Oakland", "Oklahoma City", "Omaha",
  "Philadelphia", "Phoenix", "Portland", "Raleigh", "Sacramento",
  "San Antonio", "San Diego", "San Francisco", "San Jose", "Seattle",
  "Tampa", "Tucson", "Tulsa", "Virginia Beach", "Washington"
]);

function isSyntheticPlaceholder(task) {
  const name = String(task.organization_name || "").trim();

  if (!name) return true;

  if (genericCityOnlyBlocklist.has(name)) return true;

  return syntheticPatterns.some(pattern => pattern.test(name)) &&
    task.authentication_status !== "PUBLIC_SOURCE_FOUND";
}

function hasPublicSource(task) {
  return task.authentication_status === "PUBLIC_SOURCE_FOUND" ||
    task.public_source_present === true ||
    !!task.original_source_url;
}

function classify(task) {
  const synthetic = isSyntheticPlaceholder(task);
  const publicSource = hasPublicSource(task);

  if (synthetic) {
    return {
      classification: "SYNTHETIC_EXPANSION_PLACEHOLDER",
      action: "QUARANTINE_PENDING_REAL_ENTITY_REPLACEMENT",
      contact_ready: false
    };
  }

  if (!publicSource) {
    return {
      classification: "AUTHENTICATION_PENDING",
      action: "DISCOVER_OFFICIAL_PUBLIC_SOURCE",
      contact_ready: false
    };
  }

  if (
    publicSource &&
    task.contact_status !== "CONTACT_ROUTE_VERIFIED"
  ) {
    return {
      classification: "CONTACT_ROUTE_REQUIRED",
      action: "VERIFY_PUBLIC_CONTACT_ROUTE",
      contact_ready: false
    };
  }

  if (
    publicSource &&
    task.contact_status === "CONTACT_ROUTE_VERIFIED"
  ) {
    return {
      classification: "VERIFIED_PUBLIC_SOURCE_FOUND",
      action: "MANUAL_REVIEW_BEFORE_PROMOTION",
      contact_ready: false
    };
  }

  return {
    classification: "REJECT_REQUIRES_REAL_ENTITY",
    action: "REJECT_OR_REPLACE_WITH_AUTHENTIC_ENTITY",
    contact_ready: false
  };
}

const classified = tasks.map(task => {
  const result = classify(task);

  return {
    ...task,

    authentication_gap_classification:
      result.classification,

    authentication_gap_action:
      result.action,

    contact_ready:
      false,

    outreach_allowed:
      false,

    final_contact_status:
      "BLOCKED_PENDING_AUTHENTICATION",

    strict_authentication_policy: {
      requires_official_public_source: true,
      requires_exact_organization_match: true,
      requires_exact_region_match: true,
      requires_verified_contact_route: true,
      requires_manual_review: true,
      generated_contacts_forbidden: true
    }
  };
});

const groups = {
  verified_public_source_found:
    classified.filter(x =>
      x.authentication_gap_classification === "VERIFIED_PUBLIC_SOURCE_FOUND"
    ),

  contact_route_required:
    classified.filter(x =>
      x.authentication_gap_classification === "CONTACT_ROUTE_REQUIRED"
    ),

  authentication_pending:
    classified.filter(x =>
      x.authentication_gap_classification === "AUTHENTICATION_PENDING"
    ),

  synthetic_expansion_placeholders:
    classified.filter(x =>
      x.authentication_gap_classification === "SYNTHETIC_EXPANSION_PLACEHOLDER"
    ),

  reject_requires_real_entity:
    classified.filter(x =>
      x.authentication_gap_classification === "REJECT_REQUIRES_REAL_ENTITY"
    )
};

const output = {
  version:
    "black_dragon_authentication_gap_classification_v1_batch_087",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  module:
    "authentication_gap_classification_v1",

  strict_policy:
    "NO_CONTACT_READY_WITHOUT_OFFICIAL_SOURCE_CONTACT_ROUTE_AND_MANUAL_REVIEW",

  totals: {
    total_entities:
      classified.length,

    verified_public_source_found:
      groups.verified_public_source_found.length,

    contact_route_required:
      groups.contact_route_required.length,

    authentication_pending:
      groups.authentication_pending.length,

    synthetic_expansion_placeholders:
      groups.synthetic_expansion_placeholders.length,

    reject_requires_real_entity:
      groups.reject_requires_real_entity.length,

    contact_ready:
      classified.filter(x => x.contact_ready === true).length,

    outreach_allowed:
      classified.filter(x => x.outreach_allowed === true).length
  },

  classified_entities:
    classified
};

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/classification/authentication_gap_classification.v1.json"
  ),
  JSON.stringify(output, null, 2)
);

for (const [key, records] of Object.entries(groups)) {
  fs.writeFileSync(
    path.resolve(
      `public/data/clients/black_dragon/authentication/classification/queues/${key}.v1.json`
    ),
    JSON.stringify({
      version: `black_dragon_${key}_queue_v1_batch_087`,
      generated_at: new Date().toISOString(),
      count: records.length,
      records
    }, null, 2)
  );
}

console.log(JSON.stringify({
  status:
    "AUTHENTICATION_GAP_CLASSIFICATION_COMPLETE",

  totals:
    output.totals,

  outputs: [
    "public/data/clients/black_dragon/authentication/classification/authentication_gap_classification.v1.json",
    "public/data/clients/black_dragon/authentication/classification/queues/*.v1.json"
  ]
}, null, 2));
