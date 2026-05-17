const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const hardenedRoutes = {
  version:
    "black_dragon_long_beach_hardened_routes_v1",

  generated_at:
    new Date().toISOString(),

  hardened_routes: [

    {
      organization_name:
        "Harley-Davidson of Long Beach",

      previous_status:
        "DNS_FAILURE",

      hardened_validation_strategy:
        "MANUAL_ROUTE_REPLACEMENT_REQUIRED",

      suggested_alternate_routes: [
        "https://www.harley-davidson.com/us/en/index.html",
        "https://www.yelp.com/search?find_desc=Harley+Davidson+Long+Beach"
      ],

      route_confidence:
        "REVIEW_REQUIRED",

      auto_contact_allowed:
        false
    },

    {
      organization_name:
        "Biker Trash Network",

      previous_status:
        "HTTP_405",

      hardened_validation_strategy:
        "SAFE_GET_FALLBACK",

      retry_method:
        "SAFE_GET",

      route_confidence:
        "MEDIUM",

      auto_contact_allowed:
        false
    },

    {
      organization_name:
        "CVMA",

      previous_status:
        "HTTP_405",

      hardened_validation_strategy:
        "SAFE_GET_FALLBACK",

      retry_method:
        "SAFE_GET",

      route_confidence:
        "MEDIUM",

      auto_contact_allowed:
        false
    }
  ],

  hardening_rules: {
    safe_get_allowed: true,
    form_submission_forbidden: true,
    login_forbidden: true,
    runtime_mutation_forbidden: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/template_hardening/long_beach/routes/hardened_route_registry.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(hardenedRoutes, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "HARDENED_ROUTE_REGISTRY_COMPLETE",

  hardened_routes:
    hardenedRoutes.hardened_routes.length,

  output:
    out
}, null, 2));
