const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function validUrl(value) {
  if (!value || typeof value !== "string") return false;
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

function validEmail(value) {
  if (!value) return false;
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value).trim());
}

function validPhone(value) {
  if (!value) return false;
  return /^\+?1?[\s().-]*\d{3}[\s().-]*\d{3}[\s().-]*\d{4}$/.test(String(value).trim());
}

function hasPlaceholder(value) {
  return /example\.com|test\.com|fake|placeholder|sample|unknown|tbd/i.test(String(value || ""));
}

function validContactRoute(value, type) {
  if (!value || hasPlaceholder(value)) return false;
  if (type === "EMAIL") return validEmail(value);
  if (type === "PHONE") return validPhone(value);
  if (type === "CONTACT_PAGE") return validUrl(value);
  if (type === "PUBLIC_ROLE_FORM") return validUrl(value);
  return false;
}

const input = readJson(
  "public/data/clients/black_dragon/real_contact_expansion/imports/real_contact_expansion_import_template.v1.json"
);

const imports = input.real_contact_imports || [];

const staged = [];
const rejected = [];

for (const [index, item] of imports.entries()) {
  const checks = {
    organization_name_present: !!item.organization_name && !hasPlaceholder(item.organization_name),
    organization_type_present: !!item.organization_type && !hasPlaceholder(item.organization_type),
    city_present: !!item.city && !hasPlaceholder(item.city),
    region_present: !!item.region && !hasPlaceholder(item.region),
    country_present: !!item.country,
    source_url_valid: validUrl(item.source_url),
    contact_route_valid: validContactRoute(item.contact_route, item.contact_route_type),
    lat_valid: typeof item.lat === "number" && item.lat >= -90 && item.lat <= 90,
    lon_valid: typeof item.lon === "number" && item.lon >= -180 && item.lon <= 180,
    no_generated_or_placeholder_fields: !hasPlaceholder(JSON.stringify(item))
  };

  const pass = Object.values(checks).every(Boolean);

  const record = {
    entity_id: item.entity_id || `BD_REAL_CONTACT_${String(index + 1).padStart(6, "0")}`,
    client_id: "black_dragon",
    module: "book_sales_real_contact_expansion_v1",
    organization_name: item.organization_name,
    organization_type: item.organization_type,
    contact_person_or_role: item.contact_person_or_role || null,
    contact_role_public: !!item.contact_person_or_role,
    city: item.city,
    region: item.region,
    country: item.country || "USA",
    lat: item.lat,
    lon: item.lon,
    source_url: item.source_url,
    contact_route: item.contact_route,
    contact_route_type: item.contact_route_type,
    validation_checks: checks,
    intake_status: pass ? "STAGED_FOR_FOUNDER_REVIEW" : "REJECTED_IMPORT_FAILED_VALIDATION",
    contact_ready: false,
    outreach_allowed: false,
    manual_review_required: true,
    visual_review_required: true,
    created_at: new Date().toISOString()
  };

  if (pass) staged.push(record);
  else rejected.push(record);
}

const stagedPayload = {
  version: "black_dragon_real_contact_expansion_staged_v1_batch_101",
  generated_at: new Date().toISOString(),
  client_id: "black_dragon",
  totals: {
    imported: imports.length,
    staged: staged.length,
    rejected: rejected.length,
    contact_ready: 0,
    outreach_allowed: 0
  },
  staged_real_contacts: staged
};

const rejectedPayload = {
  version: "black_dragon_real_contact_expansion_rejected_v1_batch_101",
  generated_at: new Date().toISOString(),
  client_id: "black_dragon",
  totals: stagedPayload.totals,
  rejected_real_contacts: rejected
};

const mapPayload = {
  version: "black_dragon_real_contact_expansion_city_map_nodes_v1_batch_101",
  generated_at: new Date().toISOString(),
  client_id: "black_dragon",
  layer_id: "BLACK_DRAGON_REAL_CONTACT_EXPANSION_REVIEW",
  totals: {
    map_nodes: staged.length,
    contact_ready: 0,
    outreach_allowed: 0
  },
  nodes: staged.map((x, index) => ({
    node_id: `BD_REAL_CONTACT_MAP_NODE_${String(index + 1).padStart(6, "0")}`,
    entity_id: x.entity_id,
    client_id: "black_dragon",
    label: x.organization_name,
    organization_name: x.organization_name,
    organization_type: x.organization_type,
    city: x.city,
    region: x.region,
    country: x.country,
    lat: x.lat,
    lon: x.lon,
    source_url: x.source_url,
    contact_route_type: x.contact_route_type,
    contact_ready: false,
    outreach_allowed: false,
    render: {
      layer_id: "BLACK_DRAGON_REAL_CONTACT_EXPANSION_REVIEW",
      node_type: "REAL_CONTACT_REVIEW_NODE",
      visible_in_world: true,
      visible_in_city_map: true,
      pickable: true,
      verified_target: false,
      contact_ready: false,
      pulse_enabled: false,
      halo_enabled: false
    }
  }))
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/real_contact_expansion/staged/staged_real_contacts.v1.json"),
  JSON.stringify(stagedPayload, null, 2)
);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/real_contact_expansion/staged/rejected_real_contacts.v1.json"),
  JSON.stringify(rejectedPayload, null, 2)
);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/real_contact_expansion/map/real_contact_expansion_city_map_nodes.v1.json"),
  JSON.stringify(mapPayload, null, 2)
);

console.log(JSON.stringify({
  status: "REAL_CONTACT_EXPANSION_INTAKE_COMPLETE",
  totals: stagedPayload.totals,
  map: mapPayload.totals
}, null, 2));
