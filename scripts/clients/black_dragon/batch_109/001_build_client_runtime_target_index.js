const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function tryRead(rel) {

  const full = path.join(ROOT, rel);

  if (!fs.existsSync(full)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(full, "utf8"));
}

const visibility =
  tryRead(
    "public/data/clients/black_dragon/manual_outreach/audit/map_dossier_contact_visibility_index.json"
  );

const workflow =
  tryRead(
    "public/data/clients/black_dragon/manual_outreach/approvals/client_manual_contact_workflow.json"
  );

const runtime = [];

if (visibility && workflow) {

  workflow.client_contact_workflow.forEach((row, index) => {

    runtime.push({

      runtime_target_id:
        `BD_RUNTIME_TARGET_${String(index + 1).padStart(5, "0")}`,

      entity_id:
        row.verified_contact_route_id,

      organization_name:
        row.organization_name,

      city:
        "UNSPECIFIED_CITY",

      state:
        "UNSPECIFIED_STATE",

      country:
        "USA",

      organization_type:
        row.official_contact_route_type,

      target_temperature:
        "REVIEW",

      verified_source_status:
        "VERIFIED_PUBLIC_SOURCE",

      verified_contact_route_status:
        "VERIFIED_CONTACT_ROUTE",

      dossier_visible:
        row.dossier_visible_to_client,

      city_map_visible:
        row.city_map_node_visible_to_client,

      contact_ready:
        row.client_authorized_for_manual_contact,

      assigned_sales_rep:
        row.assigned_client_user_id,

      assigned_sales_role:
        row.assigned_sales_role,

      engagement_state:
        "NO_CONTACT_ACTIVITY",

      automated_outreach_allowed:
        row.automated_contact_allowed,

      founder_integrity_lock:
        row.founder_integrity_lock,

      promotion_allowed:
        row.promotion_allowed,

      operational_stage:
        "CLIENT_RUNTIME_VISIBLE"
    });
  });
}

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/runtime_index/exports/client_runtime_target_index.json"
);

fs.writeFileSync(out, JSON.stringify({

  version:
    "black_dragon_client_runtime_target_index_v1",

  generated_at:
    new Date().toISOString(),

  total_runtime_targets:
    runtime.length,

  runtime_targets:
    runtime

}, null, 2));

console.log(JSON.stringify({

  status:
    "CLIENT_RUNTIME_TARGET_INDEX_BUILD_COMPLETE",

  total_runtime_targets:
    runtime.length,

  output:
    out

}, null, 2));
