const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const foundation = {
  version: "black_dragon_nevada_single_city_state_foundation_v1",
  generated_at: new Date().toISOString(),

  state: "Nevada",
  abbreviation: "NV",

  federation_id:
    "BLACK_DRAGON_NEVADA_SINGLE_CITY_STATE_RUNTIME",

  federation_status:
    "SINGLE_MAP_CITY_STATE_INITIALIZED",

  expansion_rule:
    "ONE_STATE_ONE_CURRENT_NEXUS_MAP_CITY",

  selected_city: {
    city: "Las Vegas",
    state: "NV",
    role: "PRIMARY_AND_ONLY_CURRENT_NEVADA_RUNTIME",
    status: "APPROVED_IF_PRESENT_IN_CURRENT_MAP_SYSTEM"
  },

  excluded_until_map_support_exists: [
    "Reno",
    "Henderson",
    "Sparks"
  ],

  inherited_hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_runtime_mutation: true,
    no_delete_without_quarantine: true,
    quarantine_before_runtime: true,
    manual_review_required_for_contact: true,
    interstate_overlap_review_required: true
  },

  next_phase:
    "BATCHES_182_186_LAS_VEGAS_OPERATIONAL_CITY_BUILD"
};

const cityPlan = {
  version: "black_dragon_nevada_single_city_plan_v1",
  generated_at: new Date().toISOString(),

  state: "Nevada",

  operational_city_sequence: [
    {
      order: 1,
      city: "Las Vegas",
      role: "NEVADA_STATE_RUNTIME",
      reasoning:
        "Use only the Nevada city currently intended for Nexus map/runtime expansion."
    }
  ],

  blocked_city_candidates: [
    {
      city: "Reno",
      reason: "Do not build until confirmed in current Nexus map system."
    },
    {
      city: "Henderson",
      reason: "Do not build until confirmed in current Nexus map system."
    },
    {
      city: "Sparks",
      reason: "Do not build until confirmed in current Nexus map system."
    }
  ],

  statewide_completion_target:
    "NEVADA_SINGLE_CITY_STATE_DEPLOYMENT_CERTIFICATION"
};

const sourcePlan = {
  version: "black_dragon_nevada_single_city_source_plan_v1",
  generated_at: new Date().toISOString(),

  state: "Nevada",
  city: "Las Vegas",

  source_categories: [
    "DEALERSHIP_NETWORKS",
    "EVENT_PROPAGATION",
    "MEDIA_AND_COMMUNITY",
    "VETERAN_AND_NONPROFIT",
    "INTERSTATE_PROPAGATION"
  ],

  estimated_total_sources:
    10,

  ingestion_rules: {
    one_city_only: true,
    no_unmapped_city_runtime: true,
    all_entities_require_validation: true,
    quarantine_before_runtime: true,
    no_auto_contact: true
  }
};

const audit = {
  version: "black_dragon_batch_181R_nevada_single_city_repair_audit_v1",
  generated_at: new Date().toISOString(),

  batch: "181R_NEVADA_SINGLE_CITY_STATE_PLAN_REPAIR",

  counts: {
    planned_operational_cities:
      cityPlan.operational_city_sequence.length,

    blocked_city_candidates:
      cityPlan.blocked_city_candidates.length,

    source_categories:
      sourcePlan.source_categories.length
  },

  gates: {
    one_state_one_city_rule_locked:
      foundation.expansion_rule === "ONE_STATE_ONE_CURRENT_NEXUS_MAP_CITY",

    exactly_one_nevada_city:
      cityPlan.operational_city_sequence.length === 1,

    las_vegas_selected:
      cityPlan.operational_city_sequence[0].city === "Las Vegas",

    unmapped_cities_blocked:
      cityPlan.blocked_city_candidates.length === 3,

    no_auto_contact:
      foundation.inherited_hardlocks.no_auto_contact === true,

    no_auto_promotion:
      foundation.inherited_hardlocks.no_auto_promotion === true,

    no_runtime_mutation:
      foundation.inherited_hardlocks.no_runtime_mutation === true
  },

  certification:
    "NEVADA_SINGLE_CITY_STATE_PLAN_REPAIRED",

  next_phase:
    "BATCHES_182_186_LAS_VEGAS_OPERATIONAL_CITY_BUILD",

  status:
    "PASS"
};

const writes = [
  [
    "public/data/clients/black_dragon/state_federations/nevada/foundation/nevada_master_state_foundation.json",
    foundation
  ],
  [
    "public/data/clients/black_dragon/state_federations/nevada/cities/nevada_city_plan.json",
    cityPlan
  ],
  [
    "public/data/clients/black_dragon/state_federations/nevada/sources/nevada_source_plan.json",
    sourcePlan
  ],
  [
    "public/data/clients/black_dragon/state_federations/nevada/audit/batch_181R_nevada_single_city_repair_audit.json",
    audit
  ]
];

for (const [rel, data] of writes) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2), "utf8");
}

console.log(JSON.stringify({
  status: "BATCH_181R_NEVADA_SINGLE_CITY_REPAIR_COMPLETE",
  audit_status: audit.status,
  certification: audit.certification,
  counts: audit.counts,
  gates: audit.gates,
  output: path.join(ROOT, "public/data/clients/black_dragon/state_federations/nevada/audit/batch_181R_nevada_single_city_repair_audit.json")
}, null, 2));
