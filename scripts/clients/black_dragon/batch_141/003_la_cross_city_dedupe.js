const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const lb = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"
);

const la = read(
  "public/data/clients/black_dragon/candidate_queue/los_angeles/validated/los_angeles_validated_candidates.json"
);

const lbNames = new Set(
  lb.merged_entities.map(e =>
    e.organization_name.toLowerCase()
  )
);

const dedupe = la.validated_candidates.map(candidate => {

  const duplicate =
    lbNames.has(candidate.organization_name.toLowerCase());

  return {
    ...candidate,

    cross_city_duplicate_detected:
      duplicate,

    duplicate_resolution:
      duplicate
        ? "KEEP_SEPARATE_CITY_CONTEXT"
        : "UNIQUE_ENTITY",

    runtime_merge_allowed:
      !duplicate,

    founder_review_required:
      duplicate
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/candidate_queue/los_angeles/dedupe/los_angeles_cross_city_dedupe.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_los_angeles_cross_city_dedupe_v1",

  generated_at:
    new Date().toISOString(),

  dedupe_candidate_count:
    dedupe.length,

  duplicate_count:
    dedupe.filter(d =>
      d.cross_city_duplicate_detected
    ).length,

  deduped_candidates:
    dedupe
}, null, 2), "utf8");

console.log(JSON.stringify({
  status:
    "LOS_ANGELES_CROSS_CITY_DEDUPE_COMPLETE",

  dedupe_candidate_count:
    dedupe.length,

  duplicate_count:
    dedupe.filter(d =>
      d.cross_city_duplicate_detected
    ).length,

  output:
    out
}, null, 2));
