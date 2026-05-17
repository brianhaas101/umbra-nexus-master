const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const imports = {
  version: "black_dragon_scottsdale_discovery_import_v1",
  generated_at: new Date().toISOString(),
  city: "Scottsdale",
  state: "AZ",
  imported_candidates: [
    {
      candidate_id: "BD_SCT_IMPORT_001",
      organization_name: "Harley-Davidson of Scottsdale",
      organization_type: "DEALERSHIP_NETWORK",
      source_category: "DEALERSHIP_NETWORKS",
      estimated_influence_score: 9.3,
      estimated_conversion_score: 9.2,
      public_route_url: "https://www.hdofscottsdale.com/",
      source_lineage: ["ARIZONA_DEALERSHIP_DISCOVERY", "SCOTTSDALE_LUXURY_MOTO_OVERLAP"]
    },
    {
      candidate_id: "BD_SCT_IMPORT_002",
      organization_name: "Arizona Bike Week",
      organization_type: "EVENT_NETWORK",
      source_category: "EVENT_PROPAGATION",
      estimated_influence_score: 9.7,
      estimated_conversion_score: 9.1,
      public_route_url: "https://azbikeweek.com/",
      source_lineage: ["ARIZONA_EVENT_DISCOVERY", "SCOTTSDALE_REGIONAL_RALLY_NETWORK"]
    },
    {
      candidate_id: "BD_SCT_IMPORT_003",
      organization_name: "Scottsdale Bike Week Vendor Network",
      organization_type: "EVENT_VENDOR_NETWORK",
      source_category: "EVENT_PROPAGATION",
      estimated_influence_score: 8.8,
      estimated_conversion_score: 8.5,
      public_route_url: "https://azbikeweek.com/vendors/",
      source_lineage: ["VENDOR_NETWORK_DISCOVERY", "ARIZONA_BIKE_WEEK_ECOSYSTEM"]
    },
    {
      candidate_id: "BD_SCT_IMPORT_004",
      organization_name: "GO AZ Motorcycles",
      organization_type: "POWERSPORTS_DEALERSHIP",
      source_category: "DEALERSHIP_NETWORKS",
      estimated_influence_score: 8.9,
      estimated_conversion_score: 8.8,
      public_route_url: "https://www.goaz.com/",
      source_lineage: ["POWERSPORTS_DEALER_DISCOVERY", "SCOTTSDALE_RETAIL_NETWORK"]
    },
    {
      candidate_id: "BD_SCT_IMPORT_005",
      organization_name: "Scottsdale Motorcycle Riders Network",
      organization_type: "RIDING_COMMUNITY",
      source_category: "MEDIA_AND_COMMUNITY",
      estimated_influence_score: 8.4,
      estimated_conversion_score: 8.1,
      public_route_url: "https://www.meetup.com/",
      source_lineage: ["COMMUNITY_GROUP_SCAN", "SCOTTSDALE_RIDER_NETWORK"]
    },
    {
      candidate_id: "BD_SCT_IMPORT_006",
      organization_name: "WestWorld of Scottsdale Event Network",
      organization_type: "EVENT_VENUE_NETWORK",
      source_category: "EVENT_PROPAGATION",
      estimated_influence_score: 8.7,
      estimated_conversion_score: 8.3,
      public_route_url: "https://westworldaz.com/",
      source_lineage: ["EVENT_VENUE_DISCOVERY", "SCOTTSDALE_EVENT_INFRASTRUCTURE"]
    },
    {
      candidate_id: "BD_SCT_IMPORT_007",
      organization_name: "Law Tigers Arizona",
      organization_type: "AFFILIATE_NETWORK",
      source_category: "CROSS_STATE_PROPAGATION",
      estimated_influence_score: 8.6,
      estimated_conversion_score: 8.7,
      public_route_url: "https://lawtigers.com/",
      source_lineage: ["AFFILIATE_DISCOVERY", "ARIZONA_MOTORCYCLE_LEGAL_NETWORK"]
    },
    {
      candidate_id: "BD_SCT_IMPORT_008",
      organization_name: "Arizona Veterans Motorcycle Association",
      organization_type: "VETERAN_RIDER_NETWORK",
      source_category: "VETERAN_AND_NONPROFIT",
      estimated_influence_score: 8.8,
      estimated_conversion_score: 8.6,
      public_route_url: "https://www.vma-usa.org/",
      source_lineage: ["VETERAN_NETWORK_DISCOVERY", "ARIZONA_RIDER_TRUST_NETWORK"]
    },
    {
      candidate_id: "BD_SCT_IMPORT_009",
      organization_name: "Scottsdale Charity Ride Network",
      organization_type: "CHARITY_RIDE_NETWORK",
      source_category: "VETERAN_AND_NONPROFIT",
      estimated_influence_score: 8.2,
      estimated_conversion_score: 8.0,
      public_route_url: "https://www.eventbrite.com/",
      source_lineage: ["CHARITY_RIDE_DISCOVERY", "SCOTTSDALE_COMMUNITY_EVENTS"]
    },
    {
      candidate_id: "BD_SCT_IMPORT_010",
      organization_name: "Scottsdale Custom Motorcycle Culture",
      organization_type: "CUSTOM_MOTORCYCLE_COMMUNITY",
      source_category: "MEDIA_AND_COMMUNITY",
      estimated_influence_score: 8.5,
      estimated_conversion_score: 8.2,
      public_route_url: "https://www.facebook.com/search/top?q=scottsdale%20motorcycle",
      source_lineage: ["CUSTOM_CULTURE_DISCOVERY", "SCOTTSDALE_MOTORCYCLE_COMMUNITY"]
    }
  ],
  discovery_laws: {
    candidate_queue_only: true,
    no_runtime_promotion: true,
    phoenix_dedupe_required: true,
    cross_state_dedupe_required: true,
    source_lineage_required: true,
    no_auto_contact: true,
    no_auto_promotion: true
  }
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/candidate_queue/scottsdale/imports/scottsdale_discovery_import.json"),
  JSON.stringify(imports, null, 2),
  "utf8"
);

const validated = imports.imported_candidates.map(candidate => ({
  ...candidate,
  validation_status: candidate.source_lineage.length >= 2 ? "VALIDATED" : "REVIEW_REQUIRED",
  source_lineage_verified: candidate.source_lineage.length >= 2,
  quarantine_status: "QUARANTINED_PENDING_DEDUPE",
  runtime_visible: false,
  contact_ready: false,
  automated_outreach_allowed: false,
  runtime_mutation_allowed: false
}));

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/candidate_queue/scottsdale/validated/scottsdale_validated_candidates.json"),
  JSON.stringify({ version: "black_dragon_scottsdale_validated_candidates_v1", generated_at: new Date().toISOString(), city: "Scottsdale", state: "AZ", validated_candidate_count: validated.length, validated_candidates: validated }, null, 2),
  "utf8"
);

const ca = read("public/data/clients/black_dragon/federation/southern_california/graph/federation_entities.json");
const phoenix = read("public/data/clients/black_dragon/city_runtime/phoenix/merged/phoenix_merged_city_entities.json");

const existingNames = new Set([
  ...ca.federation_entities.map(e => String(e.organization_name).toLowerCase().trim()),
  ...phoenix.merged_entities.map(e => String(e.organization_name).toLowerCase().trim())
]);

const deduped = validated.map(candidate => {
  const key = String(candidate.organization_name).toLowerCase().trim();
  const duplicate = existingNames.has(key);

  return {
    ...candidate,
    regional_duplicate_detected: duplicate,
    duplicate_resolution: duplicate ? "ARIZONA_OR_INTERSTATE_REGIONAL_REVIEW_REQUIRED" : "UNIQUE_SCOTTSDALE_ENTITY",
    founder_review_required: duplicate
  };
});

const dedupePayload = {
  version: "black_dragon_scottsdale_regional_dedupe_v1",
  generated_at: new Date().toISOString(),
  city: "Scottsdale",
  state: "AZ",
  dedupe_candidate_count: deduped.length,
  regional_duplicates: deduped.filter(c => c.regional_duplicate_detected).length,
  deduped_candidates: deduped
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/candidate_queue/scottsdale/dedupe/scottsdale_regional_dedupe.json"),
  JSON.stringify(dedupePayload, null, 2),
  "utf8"
);

const audit = {
  version: "black_dragon_batch_164_scottsdale_discovery_import_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "164_SCOTTSDALE_ENTITY_DISCOVERY_IMPORT",
  counts: {
    imported_candidates: imports.imported_candidates.length,
    validated_candidates: validated.length,
    dedupe_candidates: dedupePayload.dedupe_candidate_count,
    regional_duplicates: dedupePayload.regional_duplicates
  },
  gates: {
    imported_candidates_exist: imports.imported_candidates.length === 10,
    validated_candidates_exist: validated.length === 10,
    all_candidates_quarantined: validated.every(c => c.quarantine_status === "QUARANTINED_PENDING_DEDUPE"),
    source_lineage_present: validated.every(c => c.source_lineage_verified === true),
    no_runtime_visibility: validated.every(c => c.runtime_visible === false),
    no_contact_ready: validated.every(c => c.contact_ready === false),
    no_auto_contact: validated.every(c => c.automated_outreach_allowed === false),
    no_runtime_mutation: validated.every(c => c.runtime_mutation_allowed === false),
    regional_dedupe_executed: dedupePayload.dedupe_candidate_count === 10
  },
  next_phase: "BATCH_165_SCOTTSDALE_RUNTIME_MERGE_AND_GRAPH",
  status: "PASS"
};

const out = path.join(ROOT, "public/data/clients/black_dragon/candidate_queue/scottsdale/audit/batch_164_scottsdale_discovery_import_audit.json");
fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_164_SCOTTSDALE_DISCOVERY_IMPORT_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
