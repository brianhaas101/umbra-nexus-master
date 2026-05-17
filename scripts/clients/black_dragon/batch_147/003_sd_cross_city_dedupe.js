const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const validated = read(
  "public/data/clients/black_dragon/candidate_queue/san_diego/validated/san_diego_validated_candidates.json"
);

const longBeach = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"
);

const losAngeles = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

const existingNames = new Set([
  ...longBeach.merged_entities.map(e => e.organization_name.toLowerCase()),
  ...losAngeles.merged_entities.map(e => e.organization_name.toLowerCase())
]);

const deduped = validated.validated_candidates.map(candidate => {
  const duplicate = existingNames.has(candidate.organization_name.toLowerCase());

  return {
    ...candidate,

    cross_city_duplicate_detected:
      duplicate,

    duplicate_resolution:
      duplicate
        ? "REGIONAL_ENTITY_REVIEW_REQUIRED"
        : "UNIQUE_SAN_DIEGO_ENTITY",

    founder_review_required:
      duplicate
  };
});

const payload = {
  version: "black_dragon_san_diego_cross_city_dedupe_v1",
  generated_at: new Date().toISOString(),

  city: "San Diego",
  state: "CA",

  dedupe_candidate_count: deduped.length,

  cross_city_duplicates:
    deduped.filter(c => c.cross_city_duplicate_detected).length,

  deduped_candidates:
    deduped
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/candidate_queue/san_diego/dedupe/san_diego_cross_city_dedupe.json"
);

fs.writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_CROSS_CITY_DEDUPE_COMPLETE",
  dedupe_candidate_count: payload.dedupe_candidate_count,
  cross_city_duplicates: payload.cross_city_duplicates,
  output: out
}, null, 2));
