const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/L07_geographic_normalization.registry.json";

const registry = {
  version: "nexus_L07_geographic_normalization_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L07_GEOGRAPHIC_TERRITORY",
  normalization_rules: {
    lat_lon_required: true,
    jurisdiction_required: true,
    boundary_reference_required: true,
    geospatial_projection_consistency_required: true,
    source_trace_required: true,
    cluster_linking_supported: true
  },
  normalized_fields: [
    "entity_id",
    "city",
    "county",
    "state",
    "country",
    "latitude",
    "longitude",
    "geocode_type",
    "boundary_type",
    "territory_cluster",
    "movement_corridor",
    "response_radius",
    "infrastructure_overlap",
    "population_density",
    "source_category",
    "confidence_score",
    "freshness_score"
  ],
  blocked_conditions: [
    "missing_lat_lon",
    "missing_jurisdiction",
    "missing_source_trace",
    "invalid_projection_reference",
    "unresolved_cluster_assignment"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L07 NORMALIZATION REGISTRY] COMPLETE", registry.normalized_fields.length);
