const fs = require("fs");
const path = require("path");

const files = {
  paths:
    "public/data/clients/black_dragon/books/map/paths/book_propagation_paths.v1.json",

  renderer:
    "public/globe/clients/black_dragon/books/book_path_renderer.js",

  injection:
    "public/data/clients/black_dragon/books/map/paths/book_path_renderer_injection_report.v1.json"
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function readText(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

const paths = readJson(files.paths);
const renderer = readText(files.renderer);
const injection = readJson(files.injection);

const audit = {
  version: "black_dragon_books_batch_043_propagation_paths_audit_v1",
  generated_at: new Date().toISOString(),

  data_integrity: {
    paths_exist:
      Array.isArray(paths.paths) && paths.paths.length > 0,

    every_path_has_source:
      paths.paths.every(p => !!p.source_cluster_id && !!p.source_region),

    every_path_has_target:
      paths.paths.every(p => !!p.target_cluster_id && !!p.target_region),

    every_path_has_coords:
      paths.paths.every(p =>
        typeof p.source_lon === "number" &&
        typeof p.source_lat === "number" &&
        typeof p.target_lon === "number" &&
        typeof p.target_lat === "number"
      ),

    every_path_has_strength:
      paths.paths.every(p => typeof p.path_strength === "number"),

    every_path_client_scoped:
      paths.paths.every(p => p.client_id === "black_dragon")
  },

  renderer_integrity: {
    renderer_global:
      renderer.includes("window.BlackDragonBooksPathRenderer"),

    has_load:
      renderer.includes("async function load"),

    has_mount:
      renderer.includes("async function mount"),

    has_curve_builder:
      renderer.includes("buildCurve"),

    has_path_mesh:
      renderer.includes("buildPathMesh"),

    has_scene_resolver:
      renderer.includes("resolveScene"),

    has_pulse_loop:
      renderer.includes("startPulseLoop"),

    has_debug_state:
      renderer.includes("getDebugState"),

    marks_path_userdata:
      renderer.includes("black_dragon_book_propagation_path")
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    injected_everywhere:
      injection.report.every(r => r.has_path_renderer)
  }
};

audit.pass =
  Object.values(audit.data_integrity).every(Boolean) &&
  Object.values(audit.renderer_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/books/audits/batch_043_propagation_paths_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
