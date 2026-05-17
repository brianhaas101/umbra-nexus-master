const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const file = "public/data/intelligence/sources/L06_ASSET_INFRASTRUCTURE_INTELLIGENCE.sources.json";
const abs = path.join(ROOT, file);

function readJsonNoBom(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

const registry = readJsonNoBom(abs);
registry.sources = Array.isArray(registry.sources) ? registry.sources : [];

const additions = [
  ["L06_SRC_004_BUILDING_PERMIT_RECORDS", "Building Permit Records", 0.95, "building_permit_record", "building_permit_connector", "building_permit_parser", "ASSET_EXPANSION_SIGNAL", "building_permit_profile", "retain_with_building_permit_trace"],
  ["L06_SRC_005_FLEET_EQUIPMENT_RECORDS", "Fleet and Equipment Records", 0.94, "fleet_equipment_record", "fleet_equipment_connector", "fleet_equipment_parser", "ASSET_CAPACITY_SIGNAL", "fleet_equipment_profile", "retain_with_fleet_equipment_trace"],
  ["L06_SRC_006_INFRASTRUCTURE_GIS_LAYERS", "Infrastructure GIS Layers", 0.93, "infrastructure_gis_layer", "infrastructure_gis_connector", "infrastructure_gis_parser", "ASSET_INFRASTRUCTURE_SIGNAL", "infrastructure_gis_profile", "retain_with_infrastructure_gis_trace"],
  ["L06_SRC_007_UTILITY_SERVICE_AREAS", "Utility Service Areas", 0.92, "utility_service_area", "utility_service_connector", "utility_service_parser", "ASSET_SERVICE_AREA_SIGNAL", "utility_service_profile", "retain_with_utility_service_trace"],
  ["L06_SRC_008_TRANSPORTATION_NETWORKS", "Transportation Networks", 0.91, "transportation_network", "transportation_network_connector", "transportation_network_parser", "ASSET_LOGISTICS_SIGNAL", "transportation_network_profile", "retain_with_transportation_network_trace"],
  ["L06_SRC_009_WAREHOUSE_DISTRIBUTION_RECORDS", "Warehouse and Distribution Records", 0.90, "warehouse_distribution_record", "warehouse_distribution_connector", "warehouse_distribution_parser", "ASSET_LOGISTICS_SIGNAL", "warehouse_distribution_profile", "retain_with_warehouse_distribution_trace"],
  ["L06_SRC_010_PUBLIC_FACILITY_DIRECTORIES", "Public Facility Directories", 0.89, "public_facility_directory", "public_facility_connector", "public_facility_parser", "ASSET_LOCATION_SIGNAL", "public_facility_profile", "retain_with_public_facility_trace"],
  ["L06_SRC_011_SITE_EXPANSION_NOTICES", "Site Expansion Notices", 0.88, "site_expansion_notice", "site_expansion_connector", "site_expansion_parser", "ASSET_EXPANSION_SIGNAL", "site_expansion_profile", "retain_with_site_expansion_trace"],
  ["L06_SRC_012_ASSET_AUCTION_RECORDS", "Asset Auction Records", 0.87, "asset_auction_record", "asset_auction_connector", "asset_auction_parser", "ASSET_MOVEMENT_SIGNAL", "asset_auction_profile", "retain_with_asset_auction_trace"],
  ["L06_SRC_013_FACILITY_INSPECTION_RECORDS", "Facility Inspection Records", 0.86, "facility_inspection_record", "facility_inspection_connector", "facility_inspection_parser", "ASSET_CONDITION_SIGNAL", "facility_inspection_profile", "retain_with_facility_inspection_trace"],
  ["L06_SRC_014_ZONING_LAND_USE_RECORDS", "Zoning and Land Use Records", 0.85, "zoning_land_use_record", "zoning_land_use_connector", "zoning_land_use_parser", "ASSET_LOCATION_SIGNAL", "zoning_land_use_profile", "retain_with_zoning_land_use_trace"],
  ["L06_SRC_015_LOGISTICS_CAPACITY_INDICATORS", "Logistics Capacity Indicators", 0.84, "logistics_capacity_indicator", "logistics_capacity_connector", "logistics_capacity_parser", "ASSET_CAPACITY_SIGNAL", "logistics_capacity_profile", "retain_with_logistics_capacity_trace"]
];

const existing = new Set(registry.sources.map(s => s.source_id));

for (const [source_id, name, authority_score, type, connector_type, parser_strategy, signal_generation_type, dossier_contribution_type, evidence_retention_policy] of additions) {
  if (!existing.has(source_id)) {
    registry.sources.push({
      source_id,
      layer_id: "L06",
      name,
      authority_score,
      authority: "ASSET",
      type,
      coverage: "US_ASSET",
      acquisition_type: "public_asset_source",
      cadence: "daily",
      operational_status: "OPERATIONAL",
      connector_type,
      parser_strategy,
      normalizer_strategy: "asset_infrastructure_normalizer",
      lineage_tracking_enabled: true,
      evidence_retention_policy,
      signal_generation_type,
      dossier_contribution_type
    });
  }
}

registry.sources.sort((a, b) => a.source_id.localeCompare(b.source_id));
registry.generated_at = new Date().toISOString();

fs.writeFileSync(abs, JSON.stringify(registry, null, 2), "utf8");

console.log(JSON.stringify({
  status: "L06_SOURCE_REGISTRY_COMPLETED",
  sources: registry.sources.length,
  file
}, null, 2));
