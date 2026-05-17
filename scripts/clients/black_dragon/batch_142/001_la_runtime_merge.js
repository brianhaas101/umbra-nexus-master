const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const dedupe = read(
  "public/data/clients/black_dragon/candidate_queue/los_angeles/dedupe/los_angeles_cross_city_dedupe.json"
);

const promoted = dedupe.deduped_candidates.map((candidate, index) => {
  const score =
    Number((
      candidate.estimated_influence_score * 0.55 +
      candidate.estimated_conversion_score * 0.45
    ).toFixed(2));

  return {
    city_runtime_entity_id:
      `BD_LA_RUNTIME_ENTITY_${String(index + 1).padStart(5, "0")}`,

    candidate_id:
      candidate.candidate_id,

    organization_name:
      candidate.organization_name,

    organization_type:
      candidate.organization_type,

    organization_types:
      [candidate.organization_type],

    city:
      "Los Angeles",

    state:
      "CA",

    source_layers:
      [
        candidate.source_category,
        "LOS_ANGELES_DISCOVERY_IMPORT"
      ],

    source_records:
      candidate.source_lineage.map((source, sourceIndex) => ({
        source_record_id:
          `BD_LA_SOURCE_RECORD_${String(index + 1).padStart(5, "0")}_${String(sourceIndex + 1).padStart(3, "0")}`,

        source_name:
          source,

        source_category:
          candidate.source_category,

        source_lineage_type:
          "DISCOVERY_SOURCE"
      })),

    source_layer_count:
      2,

    priority_tier:
      score >= 8.9
        ? "HOT"
        : score >= 8.25
          ? "WARM"
          : "REVIEW",

    best_score:
      score,

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

    contact_route_type:
      null,

    public_contact_url:
      null,

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
    "black_dragon_los_angeles_merged_city_entities_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "Los Angeles",

  state:
    "CA",

  runtime_status:
    "RUNTIME_VISIBLE_CONTACT_LOCKED",

  raw_layer_rows:
    dedupe.dedupe_candidate_count,

  deduped_city_entities:
    promoted.length,

  contact_ready_entities:
    promoted.filter(e => e.contact_ready).length,

  duplicate_review_entities:
    promoted.filter(e => e.cross_city_duplicate_detected).length,

  merged_entities:
    promoted.sort((a, b) => b.best_score - a.best_score)
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
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

fs.writeFileSync(out, JSON.stringify(runtime, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LOS_ANGELES_RUNTIME_MERGE_COMPLETE",
  runtime_entities: runtime.deduped_city_entities,
  contact_ready_entities: runtime.contact_ready_entities,
  duplicate_review_entities: runtime.duplicate_review_entities,
  output: out
}, null, 2));
