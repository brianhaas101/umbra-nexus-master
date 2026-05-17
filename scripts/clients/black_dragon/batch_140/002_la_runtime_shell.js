const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const runtime = {
  version:
    "black_dragon_los_angeles_runtime_shell_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "Los Angeles",

  state:
    "CA",

  runtime_status:
    "SHELL_READY_ENTITY_IMPORT_PENDING",

  raw_layer_rows:
    0,

  deduped_city_entities:
    0,

  contact_ready_entities:
    0,

  merged_entities:
    [],

  inherited_laws: {
    no_placeholder_runtime_entities: true,
    no_auto_contact: true,
    no_auto_promotion: true,
    no_runtime_delete_without_quarantine: true,
    verified_route_required_for_contact_ready: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

fs.writeFileSync(out, JSON.stringify(runtime, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LOS_ANGELES_RUNTIME_SHELL_COMPLETE",
  runtime_status: runtime.runtime_status,
  output: out
}, null, 2));
