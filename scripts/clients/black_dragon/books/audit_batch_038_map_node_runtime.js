const fs = require("fs");
const path = require("path");

const files = {
  sourceLayer: "public/data/clients/black_dragon/books/map/layers/book_propagation_map_layer.v1.json",
  runtimeNodes: "public/data/clients/black_dragon/books/map/runtime/book_citymap_nodes.v1.json",
  runtimeModule: "public/globe/clients/black_dragon/books/book_map_nodes_runtime.js",
  injectionReport: "public/data/clients/black_dragon/books/map/runtime/book_map_nodes_runtime_injection_report.v1.json"
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function readText(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

const layer = readJson(files.sourceLayer);
const runtime = readJson(files.runtimeNodes);
const moduleText = readText(files.runtimeModule);
const injection = readJson(files.injectionReport);

const nodes = runtime.nodes || [];

const audit = {
  version: "black_dragon_books_batch_038_map_node_runtime_audit_v1",
  generated_at: new Date().toISOString(),

  totals: runtime.totals,

  node_integrity: {
    source_features_exist: (layer.features || []).length > 0,
    runtime_nodes_exist: nodes.length > 0,
    source_runtime_count_match: nodes.length === (layer.features || []).length,

    missing_node_ids: nodes.filter(n => !n.node_id).length,
    missing_entity_ids: nodes.filter(n => !n.entity_id).length,
    invalid_coords: nodes.filter(n =>
      typeof n.lon !== "number" ||
      typeof n.lat !== "number" ||
      !Number.isFinite(n.lon) ||
      !Number.isFinite(n.lat)
    ).length,
    non_pickable: nodes.filter(n => !n.render || n.render.pickable !== true).length,
    not_citymap_visible: nodes.filter(n => !n.render || n.render.visible_in_city_map !== true).length
  },

  runtime_integrity: {
    module_defines_global:
      moduleText.includes("window.BlackDragonBooksMapNodes"),

    has_load:
      moduleText.includes("function load"),

    has_get_nodes:
      moduleText.includes("getNodes"),

    has_visible_nodes:
      moduleText.includes("getVisibleNodes"),

    injects_into_umbra_data:
      moduleText.includes("black_dragon_books_map_nodes")
  },

  injection_integrity: {
    entrypoints_checked: injection.report.length > 0,
    all_checked_have_runtime:
      injection.report.length > 0 &&
      injection.report.every(r => r.has_book_map_nodes_runtime)
  }
};

audit.pass =
  Object.values(audit.node_integrity).filter(v => typeof v === "boolean").every(Boolean) &&
  audit.node_integrity.missing_node_ids === 0 &&
  audit.node_integrity.missing_entity_ids === 0 &&
  audit.node_integrity.invalid_coords === 0 &&
  audit.node_integrity.non_pickable === 0 &&
  audit.node_integrity.not_citymap_visible === 0 &&
  Object.values(audit.runtime_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/audits/batch_038_map_node_runtime_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
