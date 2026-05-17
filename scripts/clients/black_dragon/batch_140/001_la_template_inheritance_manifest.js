const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const longBeachTemplate = read(
  "public/data/clients/black_dragon/template_hardening/long_beach/template_export/long_beach_master_template_export.json"
);

const manifest = {
  version:
    "black_dragon_los_angeles_template_inheritance_manifest_v1",

  generated_at:
    new Date().toISOString(),

  source_template_city:
    "Long Beach",

  target_city:
    "Los Angeles",

  target_state:
    "CA",

  inheritance_status:
    "STRUCTURE_ALIGNED_ENTITY_IMPORT_PENDING",

  inherited_components:
    longBeachTemplate.export_components,

  inherited_hardlocks:
    longBeachTemplate.inherited_hardlocks,

  city_runtime_policy: {
    real_entities_required_before_visibility: true,
    no_placeholder_runtime_entities: true,
    no_auto_contact: true,
    no_auto_promotion: true,
    quarantine_before_runtime: true,
    manual_review_required_for_contact_ready: true
  },

  next_phase:
    "BATCH_141_LOS_ANGELES_ENTITY_DISCOVERY_IMPORT"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/template_alignment/los_angeles/exports/los_angeles_template_inheritance_manifest.json"
);

fs.writeFileSync(out, JSON.stringify(manifest, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LOS_ANGELES_TEMPLATE_INHERITANCE_MANIFEST_COMPLETE",
  inherited_components: manifest.inherited_components.length,
  inherited_hardlocks: manifest.inherited_hardlocks.length,
  output: out
}, null, 2));
