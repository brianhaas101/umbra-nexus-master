const fs = require("fs");
const path = require("path");

const file =
  "public/globe/clients/black_dragon/books/book_layer_controls.js";

const txt = fs.readFileSync(path.resolve(file), "utf8");

const audit = {
  version: "umbra_batch_061_layer_controls_audit_v1",
  generated_at: new Date().toISOString(),
  checks: {
    version_present:
      txt.includes("batch_061"),
    exposes_set_layer_visible:
      txt.includes("G.setLayerVisible"),
    exposes_get_layer_visible:
      txt.includes("G.getLayerVisible"),
    targets_supported:
      txt.includes("BOOK_TARGETS"),
    clusters_supported:
      txt.includes("REGIONAL_CLUSTERS"),
    paths_supported:
      txt.includes("PROPAGATION_PATHS"),
    group_resolution_present:
      txt.includes("getTargetGroup") &&
      txt.includes("getClusterGroup") &&
      txt.includes("getPathGroup"),
    local_storage_present:
      txt.includes("localStorage"),
    debug_present:
      txt.includes("getDebugState")
  }
};

audit.pass = Object.values(audit.checks).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/audits/hub/batch_061_layer_controls_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
