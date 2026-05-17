const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const exportManifest = {
  version:
    "black_dragon_long_beach_master_template_export_v1",

  generated_at:
    new Date().toISOString(),

  template_city:
    "Long Beach",

  template_state:
    "CA",

  export_components: [

    "ENTITY_RUNTIME",
    "MERGE_AND_DEDUPE",
    "CONTACT_ROUTE_EVIDENCE",
    "LIVE_VALIDATION",
    "FRESHNESS_ENGINE",
    "DEAD_ROUTE_SUPPRESSION",
    "RELATIONSHIP_GRAPH",
    "GRAPH_INFLUENCE_SCORING",
    "PROPAGATION_PATHS",
    "GRAPH_UI_SURFACE",
    "CLIENT_PROPAGATION_FEED",
    "AUTONOMOUS_REFRESH_FOUNDATION"
  ],

  inherited_hardlocks: [
    "NO_AUTO_CONTACT",
    "NO_AUTO_PROMOTION",
    "NO_RUNTIME_DELETION",
    "QUARANTINE_REQUIRED_BEFORE_DISABLE",
    "MANUAL_REVIEW_REQUIRED_FOR_CONTACT"
  ],

  safe_to_clone:
    true,

  intended_next_targets: [
    "Los Angeles",
    "San Diego",
    "Orange County",
    "Phoenix",
    "Las Vegas"
  ]
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/template_hardening/long_beach/template_export/long_beach_master_template_export.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(exportManifest, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "MASTER_TEMPLATE_EXPORT_COMPLETE",

  export_components:
    exportManifest.export_components.length,

  safe_to_clone:
    exportManifest.safe_to_clone,

  output:
    out
}, null, 2));
