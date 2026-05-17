const fs = require("fs");
const path = require("path");

const operationalPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const queuePath = path.resolve(
  "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json"
);

const adaptivePath = path.resolve(
  "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_index.v1.json"
);

const responsesPath = path.resolve(
  "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/map/layers/book_propagation_map_layer.v1.json"
);

const operational = JSON.parse(fs.readFileSync(operationalPath, "utf8"));
const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
const adaptive = JSON.parse(fs.readFileSync(adaptivePath, "utf8"));
const responses = JSON.parse(fs.readFileSync(responsesPath, "utf8"));

const queueMap = new Map((queue.all_queue_items || []).map(q => [q.entity_id, q]));
const adaptiveMap = new Map((adaptive.targets || []).map(t => [t.entity_id, t]));
const responseMap = new Map((responses.responses || []).map(r => [r.entity_id, r]));

const regionCoords = {
  "ALABAMA": [-86.9023, 32.3182],
  "ALASKA": [-149.4937, 64.2008],
  "ARIZONA": [-111.0937, 34.0489],
  "ARKANSAS": [-92.3731, 34.9697],
  "CALIFORNIA": [-119.4179, 36.7783],
  "COLORADO": [-105.7821, 39.5501],
  "CONNECTICUT": [-73.0877, 41.6032],
  "FLORIDA": [-81.5158, 27.6648],
  "GEORGIA": [-82.9001, 32.1656],
  "IDAHO": [-114.7420, 44.0682],
  "ILLINOIS": [-89.3985, 40.6331],
  "INDIANA": [-86.1349, 40.2672],
  "IOWA": [-93.0977, 41.8780],
  "KANSAS": [-98.4842, 39.0119],
  "KENTUCKY": [-84.2700, 37.8393],
  "LOUISIANA": [-91.9623, 30.9843],
  "MICHIGAN": [-85.6024, 44.3148],
  "MISSOURI": [-91.8318, 37.9643],
  "NEW YORK": [-75.0000, 43.0000],
  "NORTH CAROLINA": [-79.0193, 35.7596],
  "OHIO": [-82.9071, 40.4173],
  "OKLAHOMA": [-97.5164, 35.4676],
  "OREGON": [-120.5542, 43.8041],
  "PENNSYLVANIA": [-77.1945, 41.2033],
  "SOUTH CAROLINA": [-81.1637, 33.8361],
  "TENNESSEE": [-86.5804, 35.5175],
  "TEXAS": [-99.9018, 31.9686],
  "UTAH": [-111.0937, 39.3210],
  "VIRGINIA": [-78.6569, 37.4316],
  "WASHINGTON": [-120.7401, 47.7511],
  "NATIONAL": [-98.5795, 39.8283]
};

function normalizeRegion(region) {
  return String(region || "NATIONAL").trim().toUpperCase();
}

function coordsFor(region) {
  return regionCoords[normalizeRegion(region)] || regionCoords.NATIONAL;
}

function intensity(score) {
  const n = Number(score || 0);
  if (n >= 85) return "CRITICAL";
  if (n >= 70) return "HIGH";
  if (n >= 50) return "MEDIUM";
  if (n > 0) return "LOW";
  return "NONE";
}

const features = operational.map(t => {
  const q = queueMap.get(t.entity_id);
  const a = adaptiveMap.get(t.entity_id);
  const r = responseMap.get(t.entity_id);

  const coords = coordsFor(t.region);

  const adaptiveScore = a ? Number(a.adaptive_priority_score || 0) : 0;
  const propagationScore = Number(t.propagation_score || 0);
  const queueScore = q ? Number(q.unified_priority_score || 0) : 0;

  const visualScore = Math.max(adaptiveScore, propagationScore, queueScore);

  return {
    type: "Feature",

    geometry: {
      type: "Point",
      coordinates: coords
    },

    properties: {
      entity_id: t.entity_id,
      client_id: "black_dragon",
      module: "book_sales_v2",

      organization_name: t.organization_name,
      target_name: t.target_name || "UNKNOWN_LEADER",
      leader_role: t.leader_role || "UNKNOWN",
      organization_type: t.organization_type || "UNKNOWN",

      region: t.region || "National",
      country: t.country || "USA",

      propagation_score: propagationScore,
      adaptive_priority_score: adaptiveScore,
      queue_priority_score: queueScore,
      visual_score: visualScore,
      visual_intensity: intensity(visualScore),

      queue_status: q ? q.queue_status : "UNKNOWN",
      recommended_action: q ? q.recommended_action : null,

      response_status: r ? r.response_status : null,
      response_classification: r ? r.response_classification : null,
      propagation_confidence: r ? r.propagation_confidence : null,

      map_layer: "BLACK_DRAGON_BOOK_PROPAGATION",
      client_visible: true
    }
  };
});

const layer = {
  version: "black_dragon_books_propagation_map_layer_v1",
  generated_at: new Date().toISOString(),

  type: "FeatureCollection",

  metadata: {
    client_id: "black_dragon",
    module: "book_sales_v2",
    layer_id: "BLACK_DRAGON_BOOK_PROPAGATION",
    description: "Map-ready propagation, outreach priority, and response visualization layer.",
    geometry_type: "Point",
    coordinate_order: "lon_lat",
    client_visible: true
  },

  totals: {
    features: features.length,
    critical: features.filter(f => f.properties.visual_intensity === "CRITICAL").length,
    high: features.filter(f => f.properties.visual_intensity === "HIGH").length,
    medium: features.filter(f => f.properties.visual_intensity === "MEDIUM").length,
    low: features.filter(f => f.properties.visual_intensity === "LOW").length,
    none: features.filter(f => f.properties.visual_intensity === "NONE").length,
    with_responses: features.filter(f => !!f.properties.response_status).length
  },

  features
};

fs.writeFileSync(outputPath, JSON.stringify(layer, null, 2));

console.log(JSON.stringify({
  status: "BOOK_PROPAGATION_MAP_LAYER_CREATED",
  totals: layer.totals,
  output: outputPath
}, null, 2));
