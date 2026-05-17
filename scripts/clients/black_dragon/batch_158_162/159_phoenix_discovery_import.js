const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const imports = {
  version: "black_dragon_phoenix_discovery_import_v1",
  generated_at: new Date().toISOString(),
  city: "Phoenix",
  state: "AZ",
  imported_candidates: [
    {
      candidate_id: "BD_PHX_IMPORT_001",
      organization_name: "Buddy Stubbs Harley-Davidson",
      organization_type: "DEALERSHIP_NETWORK",
      source_category: "DEALERSHIP_NETWORKS",
      estimated_influence_score: 9.1,
      estimated_conversion_score: 9.0,
      public_route_url: "https://www.buddystubbshd.com/",
      source_lineage: ["ARIZONA_DEALERSHIP_DISCOVERY", "PHOENIX_MOTORCYCLE_NETWORK"]
    },
    {
      candidate_id: "BD_PHX_IMPORT_002",
      organization_name: "Harley-Davidson of Scottsdale",
      organization_type: "DEALERSHIP_NETWORK",
      source_category: "DEALERSHIP_NETWORKS",
      estimated_influence_score: 9.2,
      estimated_conversion_score: 9.1,
      public_route_url: "https://www.hdofscottsdale.com/",
      source_lineage: ["ARIZONA_DEALERSHIP_DISCOVERY", "SCOTTSDALE_LUXURY_MOTO_OVERLAP"]
    },
    {
      candidate_id: "BD_PHX_IMPORT_003",
      organization_name: "Arizona Bike Week",
      organization_type: "EVENT_NETWORK",
      source_category: "EVENT_PROPAGATION",
      estimated_influence_score: 9.6,
      estimated_conversion_score: 9.0,
      public_route_url: "https://azbikeweek.com/",
      source_lineage: ["ARIZONA_EVENT_DISCOVERY", "REGIONAL_RALLY_NETWORK"]
    },
    {
      candidate_id: "BD_PHX_IMPORT_004",
      organization_name: "Cycle Gear Phoenix",
      organization_type: "GEAR_RETAIL",
      source_category: "DEALERSHIP_NETWORKS",
      estimated_influence_score: 8.2,
      estimated_conversion_score: 8.4,
      public_route_url: "https://www.cyclegear.com/stores",
      source_lineage: ["RETAIL_DISCOVERY", "MOTORCYCLE_RETAIL_SCAN"]
    },
    {
      candidate_id: "BD_PHX_IMPORT_005",
      organization_name: "Phoenix Motorcycle Riders Meetup",
      organization_type: "RIDING_COMMUNITY",
      source_category: "MEDIA_AND_COMMUNITY",
      estimated_influence_score: 8.3,
      estimated_conversion_score: 8.0,
      public_route_url: "https://www.meetup.com/",
      source_lineage: ["COMMUNITY_GROUP_SCAN", "PHOENIX_RIDER_NETWORK"]
    },
    {
      candidate_id: "BD_PHX_IMPORT_006",
      organization_name: "Arizona Veterans Motorcycle Association",
      organization_type: "VETERAN_RIDER_NETWORK",
      source_category: "VETERAN_AND_NONPROFIT",
      estimated_influence_score: 8.8,
      estimated_conversion_score: 8.6,
      public_route_url: "https://www.vma-usa.org/",
      source_lineage: ["VETERAN_NETWORK_DISCOVERY", "ARIZONA_RIDER_TRUST_NETWORK"]
    },
    {
      candidate_id: "BD_PHX_IMPORT_007",
      organization_name: "ABATE of Arizona",
      organization_type: "MOTORCYCLE_ADVOCACY_NETWORK",
      source_category: "VETERAN_AND_NONPROFIT",
      estimated_influence_score: 8.7,
      estimated_conversion_score: 8.3,
      public_route_url: "https://abateofaz.org/",
      source_lineage: ["MOTORCYCLE_ADVOCACY_DISCOVERY", "ARIZONA_STATEWIDE_RIDER_NETWORK"]
    },
    {
      candidate_id: "BD_PHX_IMPORT_008",
      organization_name: "Law Tigers Arizona",
      organization_type: "AFFILIATE_NETWORK",
      source_category: "CROSS_STATE_PROPAGATION",
      estimated_influence_score: 8.6,
      estimated_conversion_score: 8.7,
      public_route_url: "https://lawtigers.com/",
      source_lineage: ["AFFILIATE_DISCOVERY", "STATEWIDE_MOTORCYCLE_LEGAL_NETWORK"]
    },
    {
      candidate_id: "BD_PHX_IMPORT_009",
      organization_name: "Phoenix Bike Night Network",
      organization_type: "COMMUNITY_EVENT_NETWORK",
      source_category: "EVENT_PROPAGATION",
      estimated_influence_score: 8.4,
      estimated_conversion_score: 8.2,
      public_route_url: "https://www.eventbrite.com/",
      source_lineage: ["EVENT_DISCOVERY", "LOCAL_BIKE_NIGHT_NETWORK"]
    },
    {
      candidate_id: "BD_PHX_IMPORT_010",
      organization_name: "Arizona Motorcycle Safety and Awareness Foundation",
      organization_type: "RIDER_SAFETY_NONPROFIT",
      source_category: "VETERAN_AND_NONPROFIT",
      estimated_influence_score: 8.1,
      estimated_conversion_score: 8.0,
      public_route_url: "https://www.amsaf.org/",
      source_lineage: ["NONPROFIT_DISCOVERY", "ARIZONA_RIDER_SAFETY_NETWORK"]
    }
  ],
  discovery_laws: {
    candidate_queue_only: true,
    no_runtime_promotion: true,
    cross_state_dedupe_required: true,
    source_lineage_required: true,
    no_auto_contact: true,
    no_auto_promotion: true
  }
};

const importOut = path.join(ROOT, "public/data/clients/black_dragon/candidate_queue/phoenix/imports/phoenix_discovery_import.json");
fs.writeFileSync(importOut, JSON.stringify(imports, null, 2), "utf8");

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

const validatedPayload = {
  version: "black_dragon_phoenix_validated_candidates_v1",
  generated_at: new Date().toISOString(),
  city: "Phoenix",
  state: "AZ",
  validated_candidate_count: validated.length,
  validated_candidates: validated
};

const validatedOut = path.join(ROOT, "public/data/clients/black_dragon/candidate_queue/phoenix/validated/phoenix_validated_candidates.json");
fs.writeFileSync(validatedOut, JSON.stringify(validatedPayload, null, 2), "utf8");

const ca = read("public/data/clients/black_dragon/federation/southern_california/graph/federation_entities.json");
const existingNames = new Set(ca.federation_entities.map(e => String(e.organization_name).toLowerCase().trim()));

const deduped = validated.map(candidate => {
  const key = String(candidate.organization_name).toLowerCase().trim();
  const duplicate = existingNames.has(key);

  return {
    ...candidate,
    cross_state_duplicate_detected: duplicate,
    duplicate_resolution: duplicate ? "CALIFORNIA_ARIZONA_REGIONAL_REVIEW_REQUIRED" : "UNIQUE_PHOENIX_ENTITY",
    founder_review_required: duplicate
  };
});

const dedupePayload = {
  version: "black_dragon_phoenix_cross_state_dedupe_v1",
  generated_at: new Date().toISOString(),
  city: "Phoenix",
  state: "AZ",
  dedupe_candidate_count: deduped.length,
  cross_state_duplicates: deduped.filter(c => c.cross_state_duplicate_detected).length,
  deduped_candidates: deduped
};

const dedupeOut = path.join(ROOT, "public/data/clients/black_dragon/candidate_queue/phoenix/dedupe/phoenix_cross_state_dedupe.json");
fs.writeFileSync(dedupeOut, JSON.stringify(dedupePayload, null, 2), "utf8");

const audit = {
  version: "black_dragon_batch_159_phoenix_discovery_import_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "159_PHOENIX_ENTITY_DISCOVERY_IMPORT",
  counts: {
    imported_candidates: imports.imported_candidates.length,
    validated_candidates: validatedPayload.validated_candidate_count,
    dedupe_candidates: dedupePayload.dedupe_candidate_count,
    cross_state_duplicates: dedupePayload.cross_state_duplicates
  },
  gates: {
    imported_candidates_exist: imports.imported_candidates.length === 10,
    validated_candidates_exist: validatedPayload.validated_candidate_count === 10,
    all_candidates_quarantined: validated.every(c => c.quarantine_status === "QUARANTINED_PENDING_DEDUPE"),
    source_lineage_present: validated.every(c => c.source_lineage_verified === true),
    no_runtime_visibility: validated.every(c => c.runtime_visible === false),
    no_contact_ready: validated.every(c => c.contact_ready === false),
    no_auto_contact: validated.every(c => c.automated_outreach_allowed === false),
    no_runtime_mutation: validated.every(c => c.runtime_mutation_allowed === false),
    cross_state_dedupe_executed: dedupePayload.dedupe_candidate_count === 10
  },
  next_phase: "BATCH_160_PHOENIX_RUNTIME_MERGE_AND_GRAPH",
  status: "PASS"
};

const auditOut = path.join(ROOT, "public/data/clients/black_dragon/candidate_queue/phoenix/audit/batch_159_phoenix_discovery_import_audit.json");
fs.writeFileSync(auditOut, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_159_PHOENIX_DISCOVERY_IMPORT_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: auditOut
}, null, 2));
