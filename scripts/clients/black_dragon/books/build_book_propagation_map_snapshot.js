const fs = require("fs");
const path = require("path");

const layerPath = path.resolve(
  "public/data/clients/black_dragon/books/map/layers/book_propagation_map_layer.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/map/snapshots/book_propagation_map_snapshot.v1.json"
);

const layer = JSON.parse(fs.readFileSync(layerPath, "utf8"));

const byRegion = layer.features.reduce((acc, f) => {
  const region = f.properties.region || "National";

  if (!acc[region]) {
    acc[region] = {
      region,
      targets: 0,
      max_visual_score: 0,
      responses: 0
    };
  }

  acc[region].targets++;
  acc[region].max_visual_score = Math.max(
    acc[region].max_visual_score,
    Number(f.properties.visual_score || 0)
  );

  if (f.properties.response_status) {
    acc[region].responses++;
  }

  return acc;
}, {});

const snapshot = {
  version: "black_dragon_books_propagation_map_snapshot_v1",
  generated_at: new Date().toISOString(),

  totals: layer.totals,

  top_regions:
    Object.values(byRegion)
      .sort((a,b) => b.max_visual_score - a.max_visual_score)
      .slice(0, 15),

  top_map_targets:
    layer.features
      .slice()
      .sort((a,b) => b.properties.visual_score - a.properties.visual_score)
      .slice(0, 15)
      .map(f => ({
        entity_id: f.properties.entity_id,
        organization_name: f.properties.organization_name,
        region: f.properties.region,
        visual_score: f.properties.visual_score,
        visual_intensity: f.properties.visual_intensity,
        recommended_action: f.properties.recommended_action,
        response_status: f.properties.response_status
      }))
};

fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

console.log(JSON.stringify({
  status: "BOOK_PROPAGATION_MAP_SNAPSHOT_CREATED",
  totals: snapshot.totals,
  output: outputPath
}, null, 2));
