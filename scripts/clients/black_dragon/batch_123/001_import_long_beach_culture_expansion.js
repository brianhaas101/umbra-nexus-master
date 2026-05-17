const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const organizations = [

  // =====================================================
  // PODCAST / YOUTUBE
  // =====================================================

  {
    organization_registry_id: "BD_LB_CULTURE_0001",
    city: "Long Beach",
    state: "CA",
    organization_name: "Lowbrow Customs Garage Podcast",
    organization_type: "MOTORCYCLE_PODCAST",
    culture_group: "PODCAST_YOUTUBE",
    source_url: "https://www.lowbrowcustoms.com/blogs/motorcycle-how-to-guides",
    audience_relevance_score: 8.75,
    propagation_score: 8.75,
    book_sale_relevance: 8.5,
    influencer_trust_score: 8.5,
    rank_reason: "Strong custom-bike audience and recurring rider engagement."
  },

  {
    organization_registry_id: "BD_LB_CULTURE_0002",
    city: "Long Beach",
    state: "CA",
    organization_name: "Biltwell YouTube Community",
    organization_type: "MOTORCYCLE_YOUTUBE_NETWORK",
    culture_group: "PODCAST_YOUTUBE",
    source_url: "https://www.youtube.com/@BiltwellInc",
    audience_relevance_score: 9.0,
    propagation_score: 9.0,
    book_sale_relevance: 8.75,
    influencer_trust_score: 8.75,
    rank_reason: "Large custom motorcycle audience and visual rider culture overlap."
  },

  {
    organization_registry_id: "BD_LB_CULTURE_0003",
    city: "Long Beach",
    state: "CA",
    organization_name: "CycleDrag Motorcycle YouTube",
    organization_type: "MOTORCYCLE_CONTENT_CREATOR",
    culture_group: "PODCAST_YOUTUBE",
    source_url: "https://www.youtube.com/@CycleDrag",
    audience_relevance_score: 8.75,
    propagation_score: 8.75,
    book_sale_relevance: 8.5,
    influencer_trust_score: 8.5,
    rank_reason: "Large motorcycle content ecosystem and rider engagement."
  },

  // =====================================================
  // TATTOO / BARBER / CULTURE ANCHORS
  // =====================================================

  {
    organization_registry_id: "BD_LB_CULTURE_0004",
    city: "Long Beach",
    state: "CA",
    organization_name: "Outer Limits Tattoo",
    organization_type: "BIKER_CULTURE_TATTOO_SHOP",
    culture_group: "TATTOO_BARBER_ANCHORS",
    source_url: "https://outerlimitstattoo.com/",
    audience_relevance_score: 8.5,
    propagation_score: 8.0,
    book_sale_relevance: 8.25,
    influencer_trust_score: 8.0,
    rank_reason: "Historic biker-adjacent tattoo culture anchor with repeat community traffic."
  },

  {
    organization_registry_id: "BD_LB_CULTURE_0005",
    city: "Long Beach",
    state: "CA",
    organization_name: "The Barber Shop Club Long Beach",
    organization_type: "RIDER_LIFESTYLE_BARBER_NETWORK",
    culture_group: "TATTOO_BARBER_ANCHORS",
    source_url: "https://thebarbershopclub.com/",
    audience_relevance_score: 7.75,
    propagation_score: 7.75,
    book_sale_relevance: 7.75,
    influencer_trust_score: 7.75,
    rank_reason: "Lifestyle grooming anchor with repeat male community overlap."
  },

  // =====================================================
  // CHARITY / FUNDRAISER
  // =====================================================

  {
    organization_registry_id: "BD_LB_CULTURE_0006",
    city: "Long Beach",
    state: "CA",
    organization_name: "Love Ride Foundation Network",
    organization_type: "MOTORCYCLE_CHARITY_EVENT",
    culture_group: "CHARITY_FUNDRAISER",
    source_url: "https://loveride.org/",
    audience_relevance_score: 8.75,
    propagation_score: 8.75,
    book_sale_relevance: 8.5,
    influencer_trust_score: 8.25,
    rank_reason: "Large motorcycle charity ecosystem with recurring rider participation."
  },

  {
    organization_registry_id: "BD_LB_CULTURE_0007",
    city: "Long Beach",
    state: "CA",
    organization_name: "Bikers Against Child Abuse California",
    organization_type: "MOTORCYCLE_NONPROFIT_NETWORK",
    culture_group: "CHARITY_FUNDRAISER",
    source_url: "https://bacaworld.org/",
    audience_relevance_score: 8.5,
    propagation_score: 8.25,
    book_sale_relevance: 8.25,
    influencer_trust_score: 8.5,
    rank_reason: "Strong biker trust network with high community legitimacy."
  },

  // =====================================================
  // CONTENT CREATOR / INFLUENCER
  // =====================================================

  {
    organization_registry_id: "BD_LB_CULTURE_0008",
    city: "Long Beach",
    state: "CA",
    organization_name: "Dice Magazine",
    organization_type: "MOTORCYCLE_CULTURE_CREATOR",
    culture_group: "CREATOR_INFLUENCER",
    source_url: "https://dicemagazine.com/",
    audience_relevance_score: 8.75,
    propagation_score: 8.75,
    book_sale_relevance: 8.5,
    influencer_trust_score: 8.75,
    rank_reason: "Trusted custom-bike culture publication with strong niche influence."
  },

  {
    organization_registry_id: "BD_LB_CULTURE_0009",
    city: "Long Beach",
    state: "CA",
    organization_name: "ChopCult Community",
    organization_type: "CUSTOM_MOTORCYCLE_COMMUNITY_PLATFORM",
    culture_group: "CREATOR_INFLUENCER",
    source_url: "https://www.chopcult.com/",
    audience_relevance_score: 9.0,
    propagation_score: 9.0,
    book_sale_relevance: 8.75,
    influencer_trust_score: 8.75,
    rank_reason: "One of the strongest custom motorcycle online communities."
  },

  {
    organization_registry_id: "BD_LB_CULTURE_0010",
    city: "Long Beach",
    state: "CA",
    organization_name: "The Fast Life Garage",
    organization_type: "MOTORCYCLE_INFLUENCER_BRAND",
    culture_group: "CREATOR_INFLUENCER",
    source_url: "https://www.tflbike.com/",
    audience_relevance_score: 8.5,
    propagation_score: 8.75,
    book_sale_relevance: 8.25,
    influencer_trust_score: 8.5,
    rank_reason: "Strong motorcycle lifestyle/influencer overlap and event visibility."
  }

];

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/culture_expansion_layer/imports/long_beach_culture_expansion_import.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_culture_expansion_import_v1",
  generated_at: new Date().toISOString(),
  total_imported: organizations.length,
  organizations
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_CULTURE_EXPANSION_IMPORT_COMPLETE",
  total_imported: organizations.length,
  output: out
}, null, 2));
