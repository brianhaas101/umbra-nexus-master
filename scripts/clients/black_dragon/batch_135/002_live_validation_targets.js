const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const targets = {
  version:
    "black_dragon_live_validation_targets_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "Long Beach",

  state:
    "CA",

  validation_targets: [

    {
      validation_id: "BD_HTTP_VALIDATE_001",
      organization_name: "Born-Free Motorcycle Show",
      route_type: "PUBLIC_EVENT_SITE",
      url: "https://bornfreeshow.com/",
      priority: "HOT"
    },

    {
      validation_id: "BD_HTTP_VALIDATE_002",
      organization_name: "Harley-Davidson of Long Beach",
      route_type: "DEALERSHIP_SITE",
      url: "https://www.hdoflongbeach.com/",
      priority: "HOT"
    },

    {
      validation_id: "BD_HTTP_VALIDATE_003",
      organization_name: "Cycle Source Magazine",
      route_type: "PUBLIC_MEDIA_SITE",
      url: "https://cyclesource.com/",
      priority: "HOT"
    },

    {
      validation_id: "BD_HTTP_VALIDATE_004",
      organization_name: "Hot Bike Magazine",
      route_type: "PUBLIC_MEDIA_SITE",
      url: "https://hotbike.com/",
      priority: "HOT"
    },

    {
      validation_id: "BD_HTTP_VALIDATE_005",
      organization_name: "Biker Trash Network",
      route_type: "PUBLIC_COMMUNITY_SITE",
      url: "https://bikertrashnetwork.com/",
      priority: "HOT"
    },

    {
      validation_id: "BD_HTTP_VALIDATE_006",
      organization_name: "Roland Sands Design",
      route_type: "CUSTOM_BRAND_SITE",
      url: "https://rolandsands.com/",
      priority: "HOT"
    },

    {
      validation_id: "BD_HTTP_VALIDATE_007",
      organization_name: "Patriot Guard Riders",
      route_type: "VETERAN_NETWORK_SITE",
      url: "https://www.patriotguard.org/",
      priority: "WARM"
    },

    {
      validation_id: "BD_HTTP_VALIDATE_008",
      organization_name: "CVMA",
      route_type: "VETERAN_MC_SITE",
      url: "https://combatvet.org/",
      priority: "WARM"
    }
  ],

  execution_rules: {
    public_routes_only: true,
    robots_policy_required: true,
    timeout_handling_required: true,
    redirect_tracking_required: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/manifests/live_validation_targets.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(targets, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "LIVE_VALIDATION_TARGETS_COMPLETE",

  validation_targets:
    targets.validation_targets.length,

  output:
    out
}, null, 2));
