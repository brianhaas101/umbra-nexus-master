const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const dedupe = read(
  "public/data/clients/black_dragon/candidate_queue/san_diego/dedupe/san_diego_cross_city_dedupe.json"
);

const merged = dedupe.deduped_candidates.map((candidate, index) => {

  const bestScore =
    Number((
      candidate.estimated_influence_score * 0.55 +
      candidate.estimated_conversion_score * 0.45
    ).toFixed(2));

  return {
    city_runtime_entity_id:
      `BD_SD_RUNTIME_ENTITY_${String(index + 1).padStart(5, "0")}`,

    candidate_id:
      candidate.candidate_id,

    organization_name:
      candidate.organization_name,

    organization_type:
      candidate.organization_type,

    city:
      "San Diego",

    state:
      "CA",

    source_layers:
      [
        candidate.source_category,
        "SAN_DIEGO_DISCOVERY_IMPORT"
      ],

    source_records:
      candidate.source_lineage,

    source_layer_count:
      2,

    priority_tier:
      bestScore >= 8.9
        ? "HOT"
        : bestScore >= 8.25
          ? "WARM"
          : "REVIEW",

    best_score:
      bestScore,

    estimated_influence_score:
      candidate.estimated_influence_score,

    estimated_conversion_score:
      candidate.estimated_conversion_score,

    cross_city_duplicate_detected:
      candidate.cross_city_duplicate_detected,

    duplicate_resolution:
      candidate.duplicate_resolution,

    founder_review_required:
      candidate.founder_review_required,

    contact_ready:
      false,

    runtime_visible:
      true,

    city_map_visible:
      true,

    dossier_visible:
      true,

    automated_outreach_allowed:
      false,

    runtime_mutation_allowed:
      false
  };
});

const runtime = {
  version:
    "black_dragon_san_diego_runtime_merge_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "San Diego",

  state:
    "CA",

  runtime_status:
    "RUNTIME_VISIBLE_CONTACT_LOCKED",

  raw_layer_rows:
    dedupe.dedupe_candidate_count,

  deduped_city_entities:
    merged.length,

  contact_ready_entities:
    0,

  duplicate_review_entities:
    merged.filter(e => e.cross_city_duplicate_detected).length,

  merged_entities:
    merged
      .sort((a,b) => b.best_score - a.best_score)
      .map((entity, index) => ({
        ...entity,
        city_rank: index + 1
      })),

  inherited_laws: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_runtime_delete_without_quarantine: true,
    verified_route_required_for_contact_ready: true,
    cross_city_duplicates_require_founder_review: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/san_diego/merged/san_diego_merged_city_entities.json"
);

fs.writeFileSync(out, JSON.stringify(runtime, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_RUNTIME_MERGE_COMPLETE",
  runtime_entities: runtime.deduped_city_entities,
  duplicate_review_entities: runtime.duplicate_review_entities,
  output: out
}, null, 2));
