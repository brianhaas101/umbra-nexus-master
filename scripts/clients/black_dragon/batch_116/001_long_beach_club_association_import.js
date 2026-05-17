const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const organizations = [
  {
    organization_registry_id: "BD_LB_CLUB_0001",
    city: "Long Beach",
    state: "CA",
    organization_name: "BMW Club of Southern California",
    organization_type: "RIDING_ASSOCIATION",
    source_url: "https://www.longbeachbmwmotorcycles.com/local-riding-groups/",
    source_title: "Local Riding Groups - Long Beach BMW Motorcycles",
    source_confidence: 0.95,
    audience_relevance_score: 8.75,
    mc_culture_relevance: 7.75,
    book_sale_relevance: 8.25,
    propagation_score: 8.25,
    rank_reason: "Established Southern California rider association visible through Long Beach BMW local riding groups.",
    contact_route_status: "SOURCE_ONLY_NOT_CONTACT_READY"
  },
  {
    organization_registry_id: "BD_LB_CLUB_0002",
    city: "Long Beach",
    state: "CA",
    organization_name: "Southern California Motorcycling Association",
    organization_type: "MOTORCYCLE_ASSOCIATION",
    source_url: "https://sc-ma.com/",
    source_title: "Southern California Motorcycling Association",
    source_confidence: 0.95,
    audience_relevance_score: 8.9,
    mc_culture_relevance: 8.2,
    book_sale_relevance: 8.35,
    propagation_score: 8.75,
    rank_reason: "Long-running Southern California ride association with affiliate and event network relevance.",
    contact_route_status: "SOURCE_ONLY_NOT_CONTACT_READY"
  },
  {
    organization_registry_id: "BD_LB_CLUB_0003",
    city: "Long Beach",
    state: "CA",
    organization_name: "Patriot Guard Riders",
    organization_type: "VETERAN_PUBLIC_SERVICE_RIDER_NETWORK",
    source_url: "https://patriotguard.org/",
    source_title: "Patriot Guard Riders",
    source_confidence: 0.95,
    audience_relevance_score: 8.6,
    mc_culture_relevance: 7.8,
    book_sale_relevance: 8.1,
    propagation_score: 8.5,
    rank_reason: "Public veteran and first-responder rider network with strong civic respect and rider community reach.",
    contact_route_status: "SOURCE_ONLY_NOT_CONTACT_READY"
  },
  {
    organization_registry_id: "BD_LB_CLUB_0004",
    city: "Long Beach",
    state: "CA",
    organization_name: "The Litas Los Angeles",
    organization_type: "WOMENS_MOTORCYCLE_COLLECTIVE",
    source_url: "https://thelitas.co/",
    source_title: "The Litas",
    source_confidence: 0.9,
    audience_relevance_score: 8.25,
    mc_culture_relevance: 7.5,
    book_sale_relevance: 7.75,
    propagation_score: 8.0,
    rank_reason: "Women’s motorcycle collective with local Los Angeles chapter reach near Long Beach.",
    contact_route_status: "SOURCE_ONLY_NOT_CONTACT_READY"
  },
  {
    organization_registry_id: "BD_LB_CLUB_0005",
    city: "Long Beach",
    state: "CA",
    organization_name: "BSA Owners Club of Southern California",
    organization_type: "CLASSIC_MOTORCYCLE_CLUB",
    source_url: "https://bsaocsc.org/",
    source_title: "BSA Owners Club of Southern California",
    source_confidence: 0.9,
    audience_relevance_score: 7.75,
    mc_culture_relevance: 7.5,
    book_sale_relevance: 7.25,
    propagation_score: 7.5,
    rank_reason: "Classic motorcycle club with Southern California rider community overlap.",
    contact_route_status: "SOURCE_ONLY_NOT_CONTACT_READY"
  },
  {
    organization_registry_id: "BD_LB_CLUB_0006",
    city: "Long Beach",
    state: "CA",
    organization_name: "Warrior Brotherhood Motorcycle Club",
    organization_type: "VETERAN_MOTORCYCLE_CLUB",
    source_url: "https://warriorbrotherhoodmc.com/",
    source_title: "Warrior Brotherhood MC",
    source_confidence: 0.9,
    audience_relevance_score: 8.7,
    mc_culture_relevance: 8.4,
    book_sale_relevance: 8.35,
    propagation_score: 8.35,
    rank_reason: "Veterans-helping-veterans motorcycle club with strong book-audience alignment.",
    contact_route_status: "SOURCE_ONLY_NOT_CONTACT_READY"
  },
  {
    organization_registry_id: "BD_LB_CLUB_0007",
    city: "Long Beach",
    state: "CA",
    organization_name: "Punishers LEMC Southland",
    organization_type: "LAW_ENFORCEMENT_MOTORCYCLE_CLUB",
    source_url: "https://www.riderclubs.com/motorcycle-clubs/united-states/california/long-beach",
    source_title: "RiderClubs Long Beach Motorcycle Clubs",
    source_confidence: 0.85,
    audience_relevance_score: 8.3,
    mc_culture_relevance: 8.0,
    book_sale_relevance: 8.1,
    propagation_score: 8.0,
    rank_reason: "Law-enforcement motorcycle club listing in Southern California; relevant to protocol and leadership book audience.",
    contact_route_status: "SOURCE_ONLY_NOT_CONTACT_READY"
  },
  {
    organization_registry_id: "BD_LB_CLUB_0008",
    city: "Long Beach",
    state: "CA",
    organization_name: "Full Throttle Long Beach Motorcycle Club",
    organization_type: "LOCAL_MOTORCYCLE_CLUB",
    source_url: "https://www.facebook.com/FullThrottleLongBeachMC/",
    source_title: "Full Throttle Long Beach Motorcycle Club",
    source_confidence: 0.8,
    audience_relevance_score: 8.1,
    mc_culture_relevance: 8.25,
    book_sale_relevance: 8.0,
    propagation_score: 7.75,
    rank_reason: "Local Long Beach motorcycle club public page; relevant local social layer.",
    contact_route_status: "SOURCE_ONLY_NOT_CONTACT_READY"
  },
  {
    organization_registry_id: "BD_LB_CLUB_0009",
    city: "Long Beach",
    state: "CA",
    organization_name: "Ruffians M.C.",
    organization_type: "MASONIC_MOTORCYCLE_CLUB",
    source_url: "https://www.facebook.com/RuffiansMc/",
    source_title: "Ruffians M.C.",
    source_confidence: 0.8,
    audience_relevance_score: 7.9,
    mc_culture_relevance: 8.0,
    book_sale_relevance: 7.85,
    propagation_score: 7.5,
    rank_reason: "Masonic-based motorcycle club public page; potential structured club/protocol audience fit.",
    contact_route_status: "SOURCE_ONLY_NOT_CONTACT_READY"
  },
  {
    organization_registry_id: "BD_LB_CLUB_0010",
    city: "Long Beach",
    state: "CA",
    organization_name: "RiderClubs Long Beach Motorcycle Clubs Directory",
    organization_type: "MOTORCYCLE_CLUB_DIRECTORY",
    source_url: "https://www.riderclubs.com/motorcycle-clubs/united-states/california/long-beach",
    source_title: "Motorcycle Clubs Near Long Beach, California",
    source_confidence: 0.85,
    audience_relevance_score: 8.0,
    mc_culture_relevance: 7.75,
    book_sale_relevance: 7.85,
    propagation_score: 8.1,
    rank_reason: "Directory source for identifying additional Long Beach/Southern California club targets.",
    contact_route_status: "SOURCE_ONLY_NOT_CONTACT_READY"
  }
];

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/club_association_layer/imports/long_beach_club_association_import.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_club_association_import_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_imported: organizations.length,
  organizations
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_CLUB_ASSOCIATION_IMPORT_COMPLETE",
  total_imported: organizations.length,
  output: out
}, null, 2));
