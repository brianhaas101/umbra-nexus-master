const fs = require("fs");
const path = require("path");

const seedPath =
  "public/data/clients/black_dragon/education/operational/education_operational_seed_index.v1.json";

const outPath =
  "public/data/clients/black_dragon/education/source_discovery/source_discovery_operational_index.v1.json";

const seeds =
  JSON.parse(
    fs.readFileSync(path.resolve(seedPath), "utf8")
  );

const operational =
  (seeds.operational_seed_targets || []).map(seed => ({
    entity_id:
      seed.entity_id,

    organization_name:
      seed.organization_name,

    source_category:
      seed.source_category,

    entity_class:
      seed.entity_class,

    region:
      seed.region,

    country:
      seed.country,

    source_discovery_status:
      "SOURCE_DISCOVERY_PENDING",

    verification_status:
      "UNVERIFIED",

    outreach_status:
      "OUTREACH_BLOCKED",

    source_url:
      null,

    source_type:
      null,

    verified_contact_email:
      null,

    verified_contact_phone:
      null,

    verified_contact_name:
      null,

    verified_contact_role:
      null,

    discovery_attempts:
      0,

    source_confidence:
      0,

    contact_confidence:
      0,

    requires_manual_review:
      true,

    forbidden_actions: [
      "NO_OUTREACH",
      "NO_QUEUE_INSERTION",
      "NO_AUTOMATED_CONTACT",
      "NO_RESPONSE_GENERATION"
    ],

    next_action:
      "DISCOVER_REAL_PUBLIC_SOURCE",

    generated_at:
      new Date().toISOString()
  }));

const payload = {
  version:
    "black_dragon_source_discovery_operational_index_v1_batch_067",

  generated_at:
    new Date().toISOString(),

  totals: {
    operational_targets:
      operational.length,

    pending_discovery:
      operational.filter(x =>
        x.source_discovery_status === "SOURCE_DISCOVERY_PENDING"
      ).length,

    outreach_blocked:
      operational.filter(x =>
        x.outreach_status === "OUTREACH_BLOCKED"
      ).length
  },

  operational_targets:
    operational
};

fs.writeFileSync(
  path.resolve(outPath),
  JSON.stringify(payload, null, 2)
);

console.log(JSON.stringify({
  status:
    "SOURCE_DISCOVERY_OPERATIONAL_INDEX_CREATED",

  totals:
    payload.totals,

  output:
    outPath
}, null, 2));
