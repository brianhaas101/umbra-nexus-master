const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const organizations = [

  {
    organization_registry_id: "BD_LB_RETAIL_0001",
    city: "Long Beach",
    state: "CA",
    organization_name: "Long Beach BMW Motorcycles",
    organization_type: "MOTORCYCLE_DEALERSHIP",
    source_url: "https://www.longbeachbmwmotorcycles.com/",
    source_title: "Long Beach BMW Motorcycles",
    source_confidence: 0.95,
    audience_relevance_score: 9.0,
    mc_culture_relevance: 8.0,
    book_sale_relevance: 8.5,
    physical_conversion_score: 9.0,
    rank_reason: "Major motorcycle dealership and rider congregation point.",
    contact_route_status: "PUBLIC_BUSINESS_ROUTE_ONLY"
  },

  {
    organization_registry_id: "BD_LB_RETAIL_0002",
    city: "Long Beach",
    state: "CA",
    organization_name: "Harley-Davidson of Long Beach",
    organization_type: "MOTORCYCLE_DEALERSHIP",
    source_url: "https://www.hdoflongbeach.com/",
    source_title: "Harley-Davidson of Long Beach",
    source_confidence: 0.95,
    audience_relevance_score: 9.5,
    mc_culture_relevance: 9.25,
    book_sale_relevance: 9.0,
    physical_conversion_score: 9.5,
    rank_reason: "Strong biker culture dealership with recurring rider traffic.",
    contact_route_status: "PUBLIC_BUSINESS_ROUTE_ONLY"
  },

  {
    organization_registry_id: "BD_LB_RETAIL_0003",
    city: "Long Beach",
    state: "CA",
    organization_name: "Del Amo Motorsports Long Beach",
    organization_type: "MOTORCYCLE_DEALERSHIP",
    source_url: "https://www.delamomotorsports.com/",
    source_title: "Del Amo Motorsports",
    source_confidence: 0.95,
    audience_relevance_score: 8.75,
    mc_culture_relevance: 7.75,
    book_sale_relevance: 8.0,
    physical_conversion_score: 8.75,
    rank_reason: "High motorcycle traffic retail environment.",
    contact_route_status: "PUBLIC_BUSINESS_ROUTE_ONLY"
  },

  {
    organization_registry_id: "BD_LB_RETAIL_0004",
    city: "Long Beach",
    state: "CA",
    organization_name: "Roland Sands Design",
    organization_type: "CUSTOM_MOTORCYCLE_BRAND",
    source_url: "https://rolandsands.com/",
    source_title: "Roland Sands Design",
    source_confidence: 0.95,
    audience_relevance_score: 9.25,
    mc_culture_relevance: 9.5,
    book_sale_relevance: 8.75,
    physical_conversion_score: 8.5,
    rank_reason: "High influence custom motorcycle culture brand.",
    contact_route_status: "PUBLIC_BUSINESS_ROUTE_ONLY"
  },

  {
    organization_registry_id: "BD_LB_RETAIL_0005",
    city: "Long Beach",
    state: "CA",
    organization_name: "J&S Custom Cycles",
    organization_type: "CUSTOM_MOTORCYCLE_SHOP",
    source_url: "https://www.jscustomcycles.com/",
    source_title: "J&S Custom Cycles",
    source_confidence: 0.9,
    audience_relevance_score: 8.75,
    mc_culture_relevance: 8.75,
    book_sale_relevance: 8.0,
    physical_conversion_score: 8.25,
    rank_reason: "Independent custom motorcycle builder/shop with rider-network overlap.",
    contact_route_status: "PUBLIC_BUSINESS_ROUTE_ONLY"
  },

  {
    organization_registry_id: "BD_LB_RETAIL_0006",
    city: "Long Beach",
    state: "CA",
    organization_name: "Cycle Gear Long Beach",
    organization_type: "MOTORCYCLE_GEAR_STORE",
    source_url: "https://www.cyclegear.com/stores/cycle-gear-long-beach-california-store-16",
    source_title: "Cycle Gear Long Beach",
    source_confidence: 0.95,
    audience_relevance_score: 8.5,
    mc_culture_relevance: 7.5,
    book_sale_relevance: 8.0,
    physical_conversion_score: 8.75,
    rank_reason: "High rider foot traffic and repeat customer base.",
    contact_route_status: "PUBLIC_BUSINESS_ROUTE_ONLY"
  },

  {
    organization_registry_id: "BD_LB_RETAIL_0007",
    city: "Long Beach",
    state: "CA",
    organization_name: "Belmont Shore Motorcycle Parking Corridor",
    organization_type: "RIDER_GATHERING_ZONE",
    source_url: "https://www.longbeach.gov/",
    source_title: "City of Long Beach",
    source_confidence: 0.8,
    audience_relevance_score: 7.75,
    mc_culture_relevance: 7.5,
    book_sale_relevance: 7.25,
    physical_conversion_score: 8.0,
    rank_reason: "Public rider congregation and local meetup corridor.",
    contact_route_status: "NO_CONTACT_ROUTE"
  },

  {
    organization_registry_id: "BD_LB_RETAIL_0008",
    city: "Long Beach",
    state: "CA",
    organization_name: "Outer Limits Tattoo Long Beach",
    organization_type: "BIKER_CULTURE_TATTOO_SHOP",
    source_url: "https://outerlimitstattoo.com/",
    source_title: "Outer Limits Tattoo",
    source_confidence: 0.9,
    audience_relevance_score: 8.25,
    mc_culture_relevance: 8.5,
    book_sale_relevance: 7.75,
    physical_conversion_score: 7.75,
    rank_reason: "Longstanding tattoo/counterculture crossover environment.",
    contact_route_status: "PUBLIC_BUSINESS_ROUTE_ONLY"
  },

  {
    organization_registry_id: "BD_LB_RETAIL_0009",
    city: "Long Beach",
    state: "CA",
    organization_name: "Shoreline Village Event Vendor Network",
    organization_type: "EVENT_VENDOR_ZONE",
    source_url: "https://shorelinevillage.com/",
    source_title: "Shoreline Village",
    source_confidence: 0.85,
    audience_relevance_score: 7.75,
    mc_culture_relevance: 7.0,
    book_sale_relevance: 7.25,
    physical_conversion_score: 8.0,
    rank_reason: "Potential physical event/vendor placement ecosystem.",
    contact_route_status: "PUBLIC_BUSINESS_ROUTE_ONLY"
  },

  {
    organization_registry_id: "BD_LB_RETAIL_0010",
    city: "Long Beach",
    state: "CA",
    organization_name: "Signal Hill Printing & Signs",
    organization_type: "PRINT_AND_PROMO_VENDOR",
    source_url: "https://www.signarama.com/",
    source_title: "Signarama",
    source_confidence: 0.8,
    audience_relevance_score: 6.75,
    mc_culture_relevance: 5.75,
    book_sale_relevance: 6.5,
    physical_conversion_score: 7.5,
    rank_reason: "Potential flyer/poster/banner infrastructure provider.",
    contact_route_status: "PUBLIC_BUSINESS_ROUTE_ONLY"
  }
];

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/retail_channels/imports/long_beach_retail_channel_import.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_retail_channel_import_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_imported: organizations.length,
  organizations
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_RETAIL_CHANNEL_IMPORT_COMPLETE",
  total_imported: organizations.length,
  output: out
}, null, 2));
