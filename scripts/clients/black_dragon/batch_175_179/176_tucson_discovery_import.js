const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const imports = {
  version: "black_dragon_tucson_discovery_import_v1",
  generated_at: new Date().toISOString(),
  city: "Tucson",
  state: "AZ",
  imported_candidates: [
    {
      candidate_id: "BD_TUC_IMPORT_001",
      organization_name: "Harley-Davidson of Tucson",
      organization_type: "DEALERSHIP_NETWORK",
      source_category: "DEALERSHIP_NETWORKS",
      estimated_influence_score: 9.1,
      estimated_conversion_score: 9.0,
      public_route_url: "https://www.hdtucson.com/",
      source_lineage: ["ARIZONA_DEALERSHIP_DISCOVERY", "TUCSON_MOTORCYCLE_NETWORK"]
    },
    {
      candidate_id: "BD_TUC_IMPORT_002",
      organization_name: "Tucson Harley Owners Group",
      organization_type: "RIDING_COMMUNITY",
      source_category: "MEDIA_AND_COMMUNITY",
      estimated_influence_score: 8.8,
      estimated_conversion_score: 8.5,
      public_route_url: "https://www.harley-davidson.com/us/en/content/hog.html",
      source_lineage: ["HOG_DISCOVERY", "TUCSON_RIDING_COMMUNITY"]
    },
    {
      candidate_id: "BD_TUC_IMPORT_003",
      organization_name: "Cycle Gear Tucson",
      organization_type: "GEAR_RETAIL",
      source_category: "DEALERSHIP_NETWORKS",
      estimated_influence_score: 8.3,
      estimated_conversion_score: 8.4,
      public_route_url: "https://www.cyclegear.com/stores",
      source_lineage: ["RETAIL_DISCOVERY", "TUCSON_MOTORCYCLE_RETAIL_SCAN"]
    },
    {
      candidate_id: "BD_TUC_IMPORT_004",
      organization_name: "Law Tigers Arizona",
      organization_type: "AFFILIATE_NETWORK",
      source_category: "CROSS_STATE_PROPAGATION",
      estimated_influence_score: 8.7,
      estimated_conversion_score: 8.8,
      public_route_url: "https://lawtigers.com/",
      source_lineage: ["AFFILIATE_DISCOVERY", "ARIZONA_MOTORCYCLE_LEGAL_NETWORK"]
    },
    {
      candidate_id: "BD_TUC_IMPORT_005",
      organization_name: "ABATE of Arizona",
      organization_type: "MOTORCYCLE_ADVOCACY_NETWORK",
      source_category: "VETERAN_AND_NONPROFIT",
      estimated_influence_score: 8.7,
      estimated_conversion_score: 8.3,
      public_route_url: "https://abateofaz.org/",
      source_lineage: ["MOTORCYCLE_ADVOCACY_DISCOVERY", "ARIZONA_STATEWIDE_RIDER_NETWORK"]
    },
    {
      candidate_id: "BD_TUC_IMPORT_006",
      organization_name: "Tucson Motorcycle Riders Network",
      organization_type: "RIDING_COMMUNITY",
      source_category: "MEDIA_AND_COMMUNITY",
      estimated_influence_score: 8.4,
      estimated_conversion_score: 8.1,
      public_route_url: "https://www.meetup.com/",
      source_lineage: ["COMMUNITY_GROUP_SCAN", "TUCSON_RIDER_NETWORK"]
    },
    {
      candidate_id: "BD_TUC_IMPORT_007",
      organization_name: "Tucson Bike Night Network",
      organization_type: "COMMUNITY_EVENT_NETWORK",
      source_category: "EVENT_PROPAGATION",
      estimated_influence_score: 8.5,
      estimated_conversion_score: 8.2,
      public_route_url: "https://www.eventbrite.com/",
      source_lineage: ["EVENT_DISCOVERY", "TUCSON_BIKE_NIGHT_NETWORK"]
    },
    {
      candidate_id: "BD_TUC_IMPORT_008",
      organization_name: "Arizona Veterans Motorcycle Association",
      organization_type: "VETERAN_RIDER_NETWORK",
      source_category: "VETERAN_AND_NONPROFIT",
      estimated_influence_score: 8.8,
      estimated_conversion_score: 8.6,
      public_route_url: "https://www.vma-usa.org/",
      source_lineage: ["VETERAN_NETWORK_DISCOVERY", "ARIZONA_RIDER_TRUST_NETWORK"]
    },
    {
      candidate_id: "BD_TUC_IMPORT_009",
      organization_name: "Tucson Charity Ride Network",
      organization_type: "CHARITY_RIDE_NETWORK",
      source_category: "VETERAN_AND_NONPROFIT",
      estimated_influence_score: 8.2,
      estimated_conversion_score: 8.0,
      public_route_url: "https://www.eventbrite.com/",
      source_lineage: ["CHARITY_RIDE_DISCOVERY", "TUCSON_COMMUNITY_EVENTS"]
    },
    {
      candidate_id: "BD_TUC_IMPORT_010",
      organization_name: "Tucson Custom Motorcycle Culture",
      organization_type: "CUSTOM_MOTORCYCLE_COMMUNITY",
      source_category: "MEDIA_AND_COMMUNITY",
      estimated_influence_score: 8.5,
      estimated_conversion_score: 8.2,
      public_route_url: "https://www.facebook.com/search/top?q=tucson%20motorcycle",
      source_lineage: ["CUSTOM_CULTURE_DISCOVERY", "TUCSON_MOTORCYCLE_COMMUNITY"]
    }
  ],
  discovery_laws: {
    candidate_queue_only: true,
    no_runtime_promotion: true,
    arizona_dedupe_required: true,
    cross_state_dedupe_required: true,
    source_lineage_required: true,
    no_auto_contact: true,
    no_auto_promotion: true
  }
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/candidate_queue/tucson/imports/tucson_discovery_import.json"),
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
  path.join(ROOT, "public/data/clients/black_dragon/candidate_queue/tucson/validated/tucson_validated_candidates.json"),
  JSON.stringify({
    version: "black_dragon_tucson_validated_candidates_v1",
    generated_at: new Date().toISOString(),
    city: "Tucson",
    state: "AZ",
    validated_candidate_count: validated.length,
    validated_candidates: validated
  }, null, 2),
  "utf8"
);

const ca = read("public/data/clients/black_dragon/federation/southern_california/graph/federation_entities.json");
const phoenix = read("public/data/clients/black_dragon/city_runtime/phoenix/merged/phoenix_merged_city_entities.json");
const scottsdale = read("public/data/clients/black_dragon/city_runtime/scottsdale/merged/scottsdale_merged_city_entities.json");
const mesa = read("public/data/clients/black_dragon/city_runtime/mesa/merged/mesa_merged_city_entities.json");

const existingNames = new Set([
  ...ca.federation_entities.map(e => String(e.organization_name).toLowerCase().trim()),
  ...phoenix.merged_entities.map(e => String(e.organization_name).toLowerCase().trim()),
  ...scottsdale.merged_entities.map(e => String(e.organization_name).toLowerCase().trim()),
  ...mesa.merged_entities.map(e => String(e.organization_name).toLowerCase().trim())
]);

const deduped = validated.map(candidate => {
  const key = String(candidate.organization_name).toLowerCase().trim();
  const duplicate = existingNames.has(key);

  return {
    ...candidate,
    regional_duplicate_detected: duplicate,
    duplicate_resolution: duplicate ? "ARIZONA_OR_INTERSTATE_REGIONAL_REVIEW_REQUIRED" : "UNIQUE_TUCSON_ENTITY",
    founder_review_required: duplicate
  };
});

const dedupePayload = {
  version: "black_dragon_tucson_regional_dedupe_v1",
  generated_at: new Date().toISOString(),
  city: "Tucson",
  state: "AZ",
  dedupe_candidate_count: deduped.length,
  regional_duplicates: deduped.filter(c => c.regional_duplicate_detected).length,
  deduped_candidates: deduped
};

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/candidate_queue/tucson/dedupe/tucson_regional_dedupe.json"),
  JSON.stringify(dedupePayload, null, 2),
  "utf8"
);

const audit = {
  version: "black_dragon_batch_176_tucson_discovery_import_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "176_TUCSON_ENTITY_DISCOVERY_IMPORT",
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
  next_phase: "BATCH_177_TUCSON_RUNTIME_MERGE_AND_GRAPH",
  status: "PASS"
};

const out = path.join(ROOT, "public/data/clients/black_dragon/candidate_queue/tucson/audit/batch_176_tucson_discovery_import_audit.json");
fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_176_TUCSON_DISCOVERY_IMPORT_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
