const fs = require("fs");
const path = require("path");

const inputPath =
  "public/data/clients/black_dragon/education/seed_targets/education_seed_targets.v1.json";

const outputPath =
  "public/data/clients/black_dragon/education/operational/education_operational_seed_index.v1.json";

const payload =
  JSON.parse(fs.readFileSync(path.resolve(inputPath), "utf8"));

const seeds =
  payload.seed_targets || [];

const operational = seeds.map((seed, index) => ({
  entity_id:
    `BD_EDU_OP_${String(index + 1).padStart(5, "0")}`,

  ...seed,

  operational_status:
    "SEED_REVIEW_REQUIRED",

  operational_priority_score:
    Math.round(Number(seed.priority_weight || 0) * 100),

  operational_priority_tier:
    Number(seed.priority_weight || 0) >= 0.95
      ? "HIGH_INSTITUTIONAL"
      : Number(seed.priority_weight || 0) >= 0.9
        ? "INSTITUTIONAL"
        : "REVIEW",

  next_action:
    "DISCOVER_PUBLIC_SOURCE",

  required_before_outreach: [
    "verify_real_organization",
    "attach_public_source",
    "verify_contact_route",
    "confirm_outreach_relevance"
  ]
}));

const out = {
  version:
    "black_dragon_education_operational_seed_index_v1_batch_066",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  module:
    "education_expansion_v1",

  totals: {
    operational_seed_targets:
      operational.length,

    outreach_allowed:
      operational.filter(x => x.outreach_allowed).length,

    review_required:
      operational.filter(x => x.operational_status === "SEED_REVIEW_REQUIRED").length,

    high_institutional:
      operational.filter(x => x.operational_priority_tier === "HIGH_INSTITUTIONAL").length,

    institutional:
      operational.filter(x => x.operational_priority_tier === "INSTITUTIONAL").length,

    review:
      operational.filter(x => x.operational_priority_tier === "REVIEW").length
  },

  operational_seed_targets:
    operational
};

fs.writeFileSync(
  path.resolve(outputPath),
  JSON.stringify(out, null, 2)
);

console.log(JSON.stringify({
  status:
    "EDUCATION_OPERATIONAL_SEED_INDEX_CREATED",

  totals:
    out.totals,

  output:
    outputPath
}, null, 2));
