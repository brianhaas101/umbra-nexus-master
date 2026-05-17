const fs = require("fs");
const path = require("path");

const files = {
  clusters:
    "public/data/clients/black_dragon/books/map/clusters/book_regional_influence_clusters.v1.json",

  renderer:
    "public/globe/clients/black_dragon/books/book_cluster_renderer.js",

  injection:
    "public/data/clients/black_dragon/books/map/clusters/book_cluster_renderer_injection_report.v1.json"
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function readText(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

const clusters = readJson(files.clusters);
const renderer = readText(files.renderer);
const injection = readJson(files.injection);

const audit = {
  version: "black_dragon_books_batch_042_regional_cluster_audit_v1",
  generated_at: new Date().toISOString(),

  data_integrity: {
    clusters_exist:
      Array.isArray(clusters.clusters) && clusters.clusters.length > 0,

    target_total_positive:
      clusters.totals.targets > 0,

    every_cluster_has_region:
      clusters.clusters.every(c => !!c.region),

    every_cluster_has_coords:
      clusters.clusters.every(c =>
        typeof c.lon === "number" &&
        typeof c.lat === "number"
      ),

    every_cluster_has_entities:
      clusters.clusters.every(c =>
        Array.isArray(c.entity_ids) &&
        c.entity_ids.length > 0
      )
  },

  renderer_integrity: {
    renderer_global:
      renderer.includes("window.BlackDragonBooksClusterRenderer"),

    has_load:
      renderer.includes("async function load"),

    has_mount:
      renderer.includes("async function mount"),

    has_cluster_mesh:
      renderer.includes("buildClusterMesh"),

    has_scene_resolver:
      renderer.includes("resolveScene"),

    has_debug_state:
      renderer.includes("getDebugState"),

    marks_cluster_userdata:
      renderer.includes("black_dragon_book_cluster")
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    injected_everywhere:
      injection.report.every(r => r.has_cluster_renderer)
  }
};

audit.pass =
  Object.values(audit.data_integrity).every(Boolean) &&
  Object.values(audit.renderer_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/books/audits/batch_042_regional_cluster_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
