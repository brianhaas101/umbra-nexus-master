const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const targets = {
  version: "black_dragon_san_diego_live_validation_targets_v1",
  generated_at: new Date().toISOString(),

  city: "San Diego",
  state: "CA",

  validation_targets: [
    {
      validation_id: "BD_SD_HTTP_VALIDATE_001",
      organization_name: "Biggs Harley-Davidson",
      route_type: "DEALERSHIP_SITE",
      url: "https://www.biggshd.com/",
      priority: "HOT"
    },
    {
      validation_id: "BD_SD_HTTP_VALIDATE_002",
      organization_name: "San Diego Harley Owners Group",
      route_type: "RIDING_COMMUNITY_SITE",
      url: "https://www.sandiegohog.com/",
      priority: "HOT"
    },
    {
      validation_id: "BD_SD_HTTP_VALIDATE_003",
      organization_name: "Biltwell Inc.",
      route_type: "CUSTOM_BRAND_SITE",
      url: "https://www.biltwellinc.com/",
      priority: "HOT"
    },
    {
      validation_id: "BD_SD_HTTP_VALIDATE_004",
      organization_name: "San Diego Vintage Motorcycle Swap Meet",
      route_type: "EVENT_SITE",
      url: "https://www.socalcycleswap.com/",
      priority: "WARM"
    },
    {
      validation_id: "BD_SD_HTTP_VALIDATE_005",
      organization_name: "SoCal Motorcycle Meetup San Diego",
      route_type: "COMMUNITY_SITE",
      url: "https://www.meetup.com/",
      priority: "WARM"
    },
    {
      validation_id: "BD_SD_HTTP_VALIDATE_006",
      organization_name: "Cycle Gear San Diego",
      route_type: "GEAR_RETAIL_SITE",
      url: "https://www.cyclegear.com/stores",
      priority: "WARM"
    },
    {
      validation_id: "BD_SD_HTTP_VALIDATE_007",
      organization_name: "Veterans Motorcycle Association San Diego",
      route_type: "VETERAN_NETWORK_SITE",
      url: "https://www.vma-usa.org/",
      priority: "HOT"
    },
    {
      validation_id: "BD_SD_HTTP_VALIDATE_008",
      organization_name: "Born-Free Motorcycle Show",
      route_type: "EVENT_SITE",
      url: "https://bornfreeshow.com/",
      priority: "HOT"
    },
    {
      validation_id: "BD_SD_HTTP_VALIDATE_009",
      organization_name: "Law Tigers California",
      route_type: "AFFILIATE_SITE",
      url: "https://lawtigers.com/",
      priority: "WARM"
    },
    {
      validation_id: "BD_SD_HTTP_VALIDATE_010",
      organization_name: "San Diego Custom Bike Show",
      route_type: "EVENT_SITE",
      url: "https://www.eventbrite.com/",
      priority: "REVIEW"
    }
  ],

  validation_laws: {
    public_routes_only: true,
    no_form_submission: true,
    no_login: true,
    no_auto_contact: true,
    no_auto_promotion: true,
    no_runtime_delete: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/san_diego/manifests/live_validation_targets.json"
);

fs.writeFileSync(out, JSON.stringify(targets, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_VALIDATION_TARGETS_COMPLETE",
  validation_targets: targets.validation_targets.length,
  output: out
}, null, 2));
