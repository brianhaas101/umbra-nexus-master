const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const classification = readJson(
  "public/data/clients/black_dragon/authentication/classification/authentication_gap_classification.v1.json"
);

const records =
  classification.classified_entities || [];

const quarantined = [];
const retained = [];

for (const entity of records) {

  const synthetic =
    entity.authentication_gap_classification ===
    "SYNTHETIC_EXPANSION_PLACEHOLDER";

  if (synthetic) {

    quarantined.push({
      ...entity,

      quarantine_status:
        "QUARANTINED",

      quarantine_reason:
        "SYNTHETIC_PLACEHOLDER_REQUIRES_REAL_WORLD_REPLACEMENT",

      visible_in_contact_workflows:
        false,

      visible_in_outreach_workflows:
        false,

      visible_in_verified_runtime:
        false,

      eligible_for_promotion:
        false,

      preserved_for_intelligence_graph_only:
        true,

      replacement_required:
        true,

      replacement_requirements: [
        "official_public_source",
        "real_organization_name",
        "real_region_match",
        "real_contact_route",
        "manual_review"
      ]
    });

  } else {

    retained.push({
      ...entity,

      quarantine_status:
        "NOT_QUARANTINED",

      visible_in_contact_workflows:
        false,

      visible_in_outreach_workflows:
        false,

      visible_in_verified_runtime:
        true,

      eligible_for_promotion:
        false
    });
  }
}

const quarantinePayload = {
  version:
    "black_dragon_quarantined_synthetic_entities_v1_batch_088",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  quarantine_policy:
    "SYNTHETIC_PLACEHOLDERS_CANNOT_APPEAR_AS_REAL_CONTACTABLE_ORGANIZATIONS",

  totals: {
    quarantined_entities:
      quarantined.length,

    retained_entities:
      retained.length,

    total_processed:
      quarantined.length + retained.length
  },

  quarantined_entities:
    quarantined
};

const verifiedRuntime = {
  version:
    "black_dragon_verified_runtime_candidates_v1_batch_088",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  runtime_policy:
    "ONLY_NON_SYNTHETIC_ENTITIES_ALLOWED_IN_VERIFIED_RUNTIME_PIPELINE",

  totals: {
    verified_runtime_candidates:
      retained.length,

    outreach_allowed:
      retained.filter(x => x.outreach_allowed === true).length,

    contact_ready:
      retained.filter(x => x.contact_ready === true).length
  },

  verified_runtime_candidates:
    retained
};

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/quarantine/active/quarantined_synthetic_entities.v1.json"
  ),
  JSON.stringify(quarantinePayload, null, 2)
);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/verified_runtime/verified_runtime_candidates.v1.json"
  ),
  JSON.stringify(verifiedRuntime, null, 2)
);

console.log(JSON.stringify({
  status:
    "SYNTHETIC_PLACEHOLDERS_QUARANTINED",

  totals: {
    quarantined_entities:
      quarantined.length,

    retained_entities:
      retained.length,

    total_processed:
      quarantined.length + retained.length
  }
}, null, 2));
