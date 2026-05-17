const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const targets = {
  version: "black_dragon_los_angeles_live_validation_targets_v1",
  generated_at: new Date().toISOString(),
  city: "Los Angeles",
  state: "CA",
  validation_targets: [
    {
      validation_id: "BD_LA_HTTP_VALIDATE_001",
      organization_name: "Bartels' Harley-Davidson",
      route_type: "DEALERSHIP_SITE",
      url: "https://www.bartelsharley.com/",
      priority: "WARM"
    },
    {
      validation_id: "BD_LA_HTTP_VALIDATE_002",
      organization_name: "Deus Ex Machina Los Angeles",
      route_type: "MOTORCYCLE_CULTURE_SITE",
      url: "https://deuscustoms.com/",
      priority: "HOT"
    },
    {
      validation_id: "BD_LA_HTTP_VALIDATE_003",
      organization_name: "Born-Free Motorcycle Show Los Angeles Community",
      route_type: "EVENT_COMMUNITY_SITE",
      url: "https://bornfreeshow.com/",
      priority: "HOT"
    },
    {
      validation_id: "BD_LA_HTTP_VALIDATE_004",
      organization_name: "Bike Shed Moto Co Los Angeles",
      route_type: "MOTORCYCLE_COMMUNITY_SITE",
      url: "https://bikeshedmoto.com/",
      priority: "HOT"
    },
    {
      validation_id: "BD_LA_HTTP_VALIDATE_005",
      organization_name: "Roland Sands Design",
      route_type: "CUSTOM_BRAND_SITE",
      url: "https://rolandsands.com/",
      priority: "HOT"
    },
    {
      validation_id: "BD_LA_HTTP_VALIDATE_006",
      organization_name: "The Congregation Show",
      route_type: "MOTORCYCLE_EVENT_SITE",
      url: "https://thecongregationshow.com/",
      priority: "WARM"
    },
    {
      validation_id: "BD_LA_HTTP_VALIDATE_007",
      organization_name: "Biltwell Inc.",
      route_type: "MOTORCYCLE_BRAND_SITE",
      url: "https://www.biltwellinc.com/",
      priority: "WARM"
    },
    {
      validation_id: "BD_LA_HTTP_VALIDATE_008",
      organization_name: "Los Angeles Motorcycle Riders Meetup",
      route_type: "RIDING_COMMUNITY_SITE",
      url: "https://www.meetup.com/topics/motorcycle-riding/us/ca/los_angeles/",
      priority: "REVIEW"
    },
    {
      validation_id: "BD_LA_HTTP_VALIDATE_009",
      organization_name: "Cycle Gear Los Angeles",
      route_type: "GEAR_RETAIL_SITE",
      url: "https://www.cyclegear.com/stores",
      priority: "WARM"
    },
    {
      validation_id: "BD_LA_HTTP_VALIDATE_010",
      organization_name: "ChopCult Los Angeles Community",
      route_type: "DIGITAL_COMMUNITY_SITE",
      url: "https://www.chopcult.com/",
      priority: "WARM"
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
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/manifests/live_validation_targets.json"
);

fs.writeFileSync(out, JSON.stringify(targets, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LOS_ANGELES_LIVE_VALIDATION_TARGETS_COMPLETE",
  validation_targets: targets.validation_targets.length,
  output: out
}, null, 2));
