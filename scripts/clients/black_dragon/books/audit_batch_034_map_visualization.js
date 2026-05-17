const fs = require("fs");
const path = require("path");

const layerPath = path.resolve(
  "public/data/clients/black_dragon/books/map/layers/book_propagation_map_layer.v1.json"
);

const snapshotPath = path.resolve(
  "public/data/clients/black_dragon/books/map/snapshots/book_propagation_map_snapshot.v1.json"
);

const layer = JSON.parse(fs.readFileSync(layerPath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

const features = layer.features || [];

const audit = {
  version: "black_dragon_books_batch_034_map_visualization_audit_v1",
  generated_at: new Date().toISOString(),

  totals: layer.totals,

  layer_integrity: {
    is_feature_collection: layer.type === "FeatureCollection",
    client_black_dragon: layer.metadata.client_id === "black_dragon",
    module_books_v2: layer.metadata.module === "book_sales_v2",
    client_visible: layer.metadata.client_visible === true,
    features_exist: features.length > 0
  },

  feature_integrity: {
    missing_entity_ids:
      features.filter(f => !f.properties.entity_id).length,

    invalid_geometry:
      features.filter(f =>
        !f.geometry ||
        f.geometry.type !== "Point" ||
        !Array.isArray(f.geometry.coordinates) ||
        f.geometry.coordinates.length !== 2 ||
        typeof f.geometry.coordinates[0] !== "number" ||
        typeof f.geometry.coordinates[1] !== "number"
      ).length,

    missing_visual_scores:
      features.filter(f =>
        typeof f.properties.visual_score !== "number"
      ).length,

    missing_visual_intensity:
      features.filter(f => !f.properties.visual_intensity).length,

    non_client_visible:
      features.filter(f => f.properties.client_visible !== true).length,

    wrong_client_scope:
      features.filter(f => f.properties.client_id !== "black_dragon").length
  },

  snapshot_integrity: {
    snapshot_exists: !!snapshot,
    has_top_regions: Array.isArray(snapshot.top_regions),
    has_top_map_targets: Array.isArray(snapshot.top_map_targets),
    totals_match: snapshot.totals.features === layer.totals.features
  }
};

audit.pass =
  Object.values(audit.layer_integrity).every(Boolean) &&
  audit.feature_integrity.missing_entity_ids === 0 &&
  audit.feature_integrity.invalid_geometry === 0 &&
  audit.feature_integrity.missing_visual_scores === 0 &&
  audit.feature_integrity.missing_visual_intensity === 0 &&
  audit.feature_integrity.non_client_visible === 0 &&
  audit.feature_integrity.wrong_client_scope === 0 &&
  Object.values(audit.snapshot_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/audits/batch_034_map_visualization_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
