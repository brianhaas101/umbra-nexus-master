const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const federation = read(
  "public/data/clients/black_dragon/federation/southern_california/graph/federation_entities.json"
);

function classifyRole(entity) {
  const type = String(entity.organization_type || "").toUpperCase();
  const name = String(entity.organization_name || "").toUpperCase();

  if (
    type.includes("EVENT") ||
    name.includes("SHOW") ||
    name.includes("SWAP")
  ) {
    return "EVENT_PROPAGATION_ROLE";
  }

  if (
    type.includes("DEALERSHIP") ||
    type.includes("RETAIL") ||
    name.includes("HARLEY") ||
    name.includes("CYCLE GEAR")
  ) {
    return "PHYSICAL_CONVERSION_ROLE";
  }

  if (
    type.includes("VETERAN") ||
    type.includes("LEMC") ||
    name.includes("VETERAN")
  ) {
    return "TRUSTED_COMMUNITY_REFERRAL_ROLE";
  }

  if (
    type.includes("MEDIA") ||
    type.includes("BRAND") ||
    name.includes("MAGAZINE") ||
    name.includes("BILTWELL") ||
    name.includes("ROLAND")
  ) {
    return "MEDIA_AND_BRAND_AMPLIFICATION_ROLE";
  }

  if (
    type.includes("COMMUNITY") ||
    type.includes("RIDING") ||
    type.includes("VENUE")
  ) {
    return "COMMUNITY_PROPAGATION_ROLE";
  }

  return "GENERAL_ECOSYSTEM_ROLE";
}

const roles = federation.federation_entities.map((entity, index) => ({
  propagation_role_id:
    `BD_SOCAL_ROLE_${String(index + 1).padStart(5, "0")}`,

  organization_name:
    entity.organization_name,

  city:
    entity.federation_city,

  city_rank:
    entity.city_rank,

  best_score:
    entity.best_score,

  organization_type:
    entity.organization_type,

  propagation_role:
    classifyRole(entity),

  likely_value:
    classifyRole(entity) === "EVENT_PROPAGATION_ROLE"
      ? "audience gathering and timing leverage"
      : classifyRole(entity) === "PHYSICAL_CONVERSION_ROLE"
        ? "book placement and physical conversion"
        : classifyRole(entity) === "TRUSTED_COMMUNITY_REFERRAL_ROLE"
          ? "trust-based group referral"
          : classifyRole(entity) === "MEDIA_AND_BRAND_AMPLIFICATION_ROLE"
            ? "digital/media amplification"
            : classifyRole(entity) === "COMMUNITY_PROPAGATION_ROLE"
              ? "localized word-of-mouth spread"
              : "ecosystem context",

  automated_outreach_allowed:
    false,

  runtime_mutation_allowed:
    false
}));

const payload = {
  version:
    "black_dragon_southern_california_propagation_role_registry_v1",

  generated_at:
    new Date().toISOString(),

  role_count:
    roles.length,

  role_summary: {
    event_roles:
      roles.filter(r => r.propagation_role === "EVENT_PROPAGATION_ROLE").length,

    physical_conversion_roles:
      roles.filter(r => r.propagation_role === "PHYSICAL_CONVERSION_ROLE").length,

    trusted_referral_roles:
      roles.filter(r => r.propagation_role === "TRUSTED_COMMUNITY_REFERRAL_ROLE").length,

    media_brand_roles:
      roles.filter(r => r.propagation_role === "MEDIA_AND_BRAND_AMPLIFICATION_ROLE").length,

    community_roles:
      roles.filter(r => r.propagation_role === "COMMUNITY_PROPAGATION_ROLE").length
  },

  roles
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/propagation/roles/propagation_role_registry.json"
);

fs.writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");

console.log(JSON.stringify({
  status: "PROPAGATION_ROLE_REGISTRY_COMPLETE",
  role_count: payload.role_count,
  role_summary: payload.role_summary,
  output: out
}, null, 2));
