const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const runtimePath = path.join(
  ROOT,
  "public/data/clients/black_dragon/runtime_index/exports/client_runtime_target_index.json"
);

const runtime = JSON.parse(
  fs.readFileSync(runtimePath, "utf8")
);

const manifest =
  runtime.runtime_targets.map(row => ({

    organization_name:
      row.organization_name,

    city:
      row.city,

    state:
      row.state,

    verified_source_status:
      row.verified_source_status,

    verified_contact_route_status:
      row.verified_contact_route_status,

    dossier_visible:
      row.dossier_visible,

    city_map_visible:
      row.city_map_visible,

    engagement_state:
      row.engagement_state
  }));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/runtime_index/exports/visible_organization_manifest.json"
);

fs.writeFileSync(out, JSON.stringify({

  version:
    "black_dragon_visible_organization_manifest_v1",

  generated_at:
    new Date().toISOString(),

  total_visible_organizations:
    manifest.length,

  organizations:
    manifest

}, null, 2));

console.log(JSON.stringify({

  status:
    "VISIBLE_ORGANIZATION_MANIFEST_COMPLETE",

  total_visible_organizations:
    manifest.length,

  output:
    out

}, null, 2));
