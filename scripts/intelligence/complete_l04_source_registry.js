const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const file = "public/data/intelligence/sources/L04_PRIVATE_SECTOR_COMMERCIAL_INTELLIGENCE.sources.json";
const abs = path.join(ROOT, file);

function readJsonNoBom(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

const registry = readJsonNoBom(abs);
registry.sources = Array.isArray(registry.sources) ? registry.sources : [];

const additions = [
  ["L04_SRC_004_CORPORATE_FILINGS", "Corporate Filings", 0.95, "corporate_filings", "corporate_filings_connector", "corporate_filings_parser", "COMMERCIAL_ACTIVITY_SIGNAL", "corporate_filings_profile", "retain_with_corporate_filings_trace"],
  ["L04_SRC_005_INDUSTRY_ASSOCIATION_DATABASES", "Industry Association Databases", 0.94, "industry_association", "industry_association_connector", "industry_association_parser", "COMMERCIAL_PARTNERSHIP_SIGNAL", "industry_association_profile", "retain_with_industry_association_trace"],
  ["L04_SRC_006_COMMERCIAL_LICENSING_SYSTEMS", "Commercial Licensing Systems", 0.93, "commercial_licensing", "commercial_licensing_connector", "commercial_licensing_parser", "COMMERCIAL_ACTIVITY_SIGNAL", "commercial_licensing_profile", "retain_with_commercial_licensing_trace"],
  ["L04_SRC_007_BUSINESS_STAFFING_JOB_BOARDS", "Business Staffing and Job Boards", 0.92, "business_staffing", "business_staffing_connector", "business_staffing_parser", "COMMERCIAL_STAFFING_SIGNAL", "business_staffing_profile", "retain_with_business_staffing_trace"],
  ["L04_SRC_008_COMMERCIAL_REAL_ESTATE_MOVEMENT", "Commercial Real Estate Movement", 0.91, "commercial_real_estate", "commercial_real_estate_connector", "commercial_real_estate_parser", "COMMERCIAL_GROWTH_SIGNAL", "commercial_real_estate_profile", "retain_with_commercial_real_estate_trace"],
  ["L04_SRC_009_FRANCHISE_EXPANSION_NOTICES", "Franchise and Expansion Notices", 0.90, "franchise_expansion", "franchise_expansion_connector", "franchise_expansion_parser", "COMMERCIAL_GROWTH_SIGNAL", "franchise_expansion_profile", "retain_with_franchise_expansion_trace"],
  ["L04_SRC_010_COMMERCIAL_PERMIT_SYSTEMS", "Commercial Permit Systems", 0.89, "commercial_permits", "commercial_permits_connector", "commercial_permits_parser", "COMMERCIAL_GROWTH_SIGNAL", "commercial_permit_profile", "retain_with_commercial_permit_trace"],
  ["L04_SRC_011_SUPPLIER_MANUFACTURER_NETWORKS", "Supplier and Manufacturer Networks", 0.88, "supplier_manufacturer_networks", "supplier_manufacturer_connector", "supplier_manufacturer_parser", "COMMERCIAL_PARTNERSHIP_SIGNAL", "supplier_manufacturer_profile", "retain_with_supplier_manufacturer_trace"],
  ["L04_SRC_012_COMMERCIAL_EVENT_PARTICIPATION", "Commercial Event Participation", 0.87, "commercial_events", "commercial_event_connector", "commercial_event_parser", "COMMERCIAL_ACTIVITY_SIGNAL", "commercial_event_profile", "retain_with_commercial_event_trace"],
  ["L04_SRC_013_B2B_PARTNERSHIP_REFERENCES", "B2B Partnership References", 0.86, "b2b_partnerships", "b2b_partnership_connector", "b2b_partnership_parser", "COMMERCIAL_PARTNERSHIP_SIGNAL", "b2b_partnership_profile", "retain_with_b2b_partnership_trace"],
  ["L04_SRC_014_INDUSTRY_PUBLICATION_FEEDS", "Industry Publication Feeds", 0.85, "industry_publications", "industry_publication_connector", "industry_publication_parser", "COMMERCIAL_ACTIVITY_SIGNAL", "industry_publication_profile", "retain_with_industry_publication_trace"],
  ["L04_SRC_015_COMMERCIAL_OPERATIONAL_ADVISORIES", "Commercial Operational Advisories", 0.84, "commercial_operational_advisories", "commercial_advisory_connector", "commercial_advisory_parser", "COMMERCIAL_ACTIVITY_SIGNAL", "commercial_advisory_profile", "retain_with_commercial_advisory_trace"]
];

const existing = new Set(registry.sources.map(s => s.source_id));

for (const [source_id, name, authority_score, type, connector_type, parser_strategy, signal_generation_type, dossier_contribution_type, evidence_retention_policy] of additions) {
  if (!existing.has(source_id)) {
    registry.sources.push({
      source_id,
      layer_id: "L04",
      name,
      authority_score,
      authority: "COMMERCIAL",
      type,
      coverage: "US_COMMERCIAL",
      acquisition_type: "public_commercial_source",
      cadence: "daily",
      operational_status: "OPERATIONAL",
      connector_type,
      parser_strategy,
      normalizer_strategy: "commercial_intelligence_normalizer",
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
  status: "L04_SOURCE_REGISTRY_COMPLETED",
  sources: registry.sources.length,
  file
}, null, 2));
