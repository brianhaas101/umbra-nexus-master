const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const permissions = {
  version: "black_dragon_client_permission_manifest_v1",
  generated_at: new Date().toISOString(),

  client_id: "black_dragon_omg_cert_v1",
  client_name: "Black Dragon",

  access_scope: {
    allowed_region: "SOUTHERN_CALIFORNIA",
    allowed_cities: [
      "Long Beach",
      "Los Angeles",
      "San Diego"
    ],
    allowed_modules: [
      "CITY_RUNTIME_VIEW",
      "CITY_NODE_CARDS",
      "CONTACT_REVIEW_VIEW",
      "DEAD_ROUTE_REVIEW_VIEW",
      "PROPAGATION_FEED_VIEW",
      "REGIONAL_OPPORTUNITY_FEED_VIEW",
      "FEDERATION_SUMMARY_VIEW"
    ]
  },

  forbidden_capabilities: [
    "FOUNDER_ADMIN_VIEW",
    "RAW_SYSTEM_REGISTRY_EDIT",
    "RUNTIME_MUTATION",
    "AUTO_CONTACT",
    "AUTO_PROMOTION",
    "AUTO_DELETE",
    "SCHEDULER_EDIT",
    "LOCK_OVERRIDE",
    "DATABASE_SOURCE_EDIT"
  ],

  client_capabilities: {
    can_view_targets: true,
    can_view_contact_routes: true,
    can_view_review_queues: true,
    can_view_propagation_paths: true,
    can_view_regional_scores: true,
    can_export_manual_review_list: true,

    can_auto_contact: false,
    can_auto_promote: false,
    can_delete_entities: false,
    can_mutate_runtime: false,
    can_override_review: false
  },

  hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_runtime_delete: true,
    founder_review_required_for_mutation: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/client_access/black_dragon/permissions/client_permission_manifest.json"
);

fs.writeFileSync(out, JSON.stringify(permissions, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BLACK_DRAGON_CLIENT_PERMISSION_MANIFEST_COMPLETE",
  allowed_cities: permissions.access_scope.allowed_cities.length,
  forbidden_capabilities: permissions.forbidden_capabilities.length,
  output: out
}, null, 2));
