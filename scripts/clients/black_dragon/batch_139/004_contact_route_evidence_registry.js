const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"
);

const evidence = runtime.merged_entities
.filter(entity => entity.contact_ready === true)
.map(entity => ({
  organization_name:
    entity.organization_name,

  priority_tier:
    entity.priority_tier,

  best_score:
    entity.best_score,

  source_layer_count:
    entity.source_layer_count,

  contact_route_type:
    entity.contact_route_type,

  public_contact_url:
    entity.public_contact_url,

  contact_route_evidence:
    entity.public_contact_url
      ? "PUBLICALLY_DISCOVERABLE_ROUTE_PRESENT"
      : "REVIEW_REQUIRED",

  manual_review_required:
    true,

  auto_contact_allowed:
    false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/template_hardening/long_beach/contact_evidence/contact_route_evidence_registry.json"
);

fs.writeFileSync(
  out,
  JSON.stringify({
    version:
      "black_dragon_contact_route_evidence_registry_v1",

    generated_at:
      new Date().toISOString(),

    evidence_records:
      evidence.length,

    evidence
  }, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "CONTACT_ROUTE_EVIDENCE_REGISTRY_COMPLETE",

  evidence_records:
    evidence.length,

  output:
    out
}, null, 2));
