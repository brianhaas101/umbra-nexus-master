const fs = require("fs");
const path = require("path");

const files = {
  controls:
    "public/data/clients/black_dragon/books/map/controls/citymap_layer_controls.v1.json",

  renderer:
    "public/globe/clients/black_dragon/books/book_layer_controls.js",

  injection:
    "public/data/clients/black_dragon/books/map/controls/book_layer_controls_injection_report.v1.json"
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function readText(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

const controls = readJson(files.controls);
const renderer = readText(files.renderer);
const injection = readJson(files.injection);

const audit = {
  version: "black_dragon_books_batch_044_layer_controls_audit_v1",
  generated_at: new Date().toISOString(),

  controls_integrity: {
    controls_exist:
      !!controls,

    client_scope_black_dragon:
      controls.client_id === "black_dragon",

    has_three_layers:
      Array.isArray(controls.layers) &&
      controls.layers.length === 3,

    has_targets_layer:
      controls.layers.some(l => l.layer_id === "BOOK_TARGETS"),

    has_clusters_layer:
      controls.layers.some(l => l.layer_id === "REGIONAL_CLUSTERS"),

    has_paths_layer:
      controls.layers.some(l => l.layer_id === "PROPAGATION_PATHS")
  },

  renderer_integrity: {
    renderer_global:
      renderer.includes("window.BlackDragonBooksLayerControls"),

    has_load:
      renderer.includes("async function load"),

    has_render:
      renderer.includes("function render"),

    has_set_layer_visible:
      renderer.includes("setLayerVisible"),

    uses_local_storage:
      renderer.includes("localStorage"),

    uses_renderer_groups:
      renderer.includes("getGroupFromRenderer"),

    has_debug_state:
      renderer.includes("getDebugState")
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    injected_everywhere:
      injection.report.every(r => r.has_layer_controls)
  }
};

audit.pass =
  Object.values(audit.controls_integrity).every(Boolean) &&
  Object.values(audit.renderer_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/books/audits/batch_044_layer_controls_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
