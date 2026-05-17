const fs = require("fs");
const path = require("path");

const files = {
  renderer:
    "public/globe/clients/black_dragon/books/book_citymap_renderer.js",

  runtimeNodes:
    "public/data/clients/black_dragon/books/map/runtime/book_citymap_nodes.v1.json",

  injection:
    "public/data/clients/black_dragon/books/audits/book_citymap_renderer_injection_report.v1.json"
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function readText(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

const rendererText = readText(files.renderer);
const runtimeNodes = readJson(files.runtimeNodes);
const injection = readJson(files.injection);

const nodes = runtimeNodes.nodes || [];

const audit = {
  version: "black_dragon_books_batch_039_citymap_renderer_audit_v1",
  generated_at: new Date().toISOString(),

  runtime_integrity: {
    defines_global:
      rendererText.includes("window.BlackDragonBooksCityMapRenderer"),

    has_mount:
      rendererText.includes("function mount"),

    has_debug_state:
      rendererText.includes("getDebugState"),

    uses_umbra_scene:
      rendererText.includes("U.scene"),

    uses_three:
      rendererText.includes("window.THREE"),

    injects_userdata:
      rendererText.includes("black_dragon_book_target"),

    supports_pickable_nodes:
      rendererText.includes("entity_id")
  },

  node_integrity: {
    runtime_nodes_exist:
      nodes.length > 0,

    all_nodes_have_coords:
      nodes.filter(n =>
        typeof n.lat !== "number" ||
        typeof n.lon !== "number"
      ).length === 0,

    all_nodes_have_render_flags:
      nodes.filter(n =>
        !n.render ||
        n.render.visible_in_city_map !== true
      ).length === 0
  },

  injection_integrity: {
    html_checked:
      injection.report.length > 0,

    renderer_injected_everywhere:
      injection.report.every(r => r.has_renderer)
  }
};

audit.pass =
  Object.values(audit.runtime_integrity).every(Boolean) &&
  Object.values(audit.node_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/books/audits/batch_039_citymap_renderer_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
