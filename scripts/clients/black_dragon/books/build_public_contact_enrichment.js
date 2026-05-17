const fs = require("fs");
const path = require("path");

const operationalPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const modelPath = path.resolve(
  "public/data/clients/black_dragon/books/contacts/contact_enrichment_model.v1.json"
);

const rawContactsPath = path.resolve(
  "public/data/clients/black_dragon/books/contacts/raw/public_contact_paths_raw.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/contacts/enriched/public_contact_enrichment.v1.json"
);

const targets = JSON.parse(fs.readFileSync(operationalPath, "utf8"));
const model = JSON.parse(fs.readFileSync(modelPath, "utf8"));
const rawContacts = JSON.parse(fs.readFileSync(rawContactsPath, "utf8"));

const allowed = new Set(model.allowed_contact_types);
const weights = model.contactability_score_weights;

const contactByEntity = new Map(
  rawContacts.map(c => [c.entity_id, c])
);

function safePublicPath(pathItem) {
  if (!pathItem) return false;

  if (!allowed.has(pathItem.contact_type)) return false;

  if (pathItem.visibility !== "PUBLIC") return false;

  if (!pathItem.value) return false;

  return true;
}

function scoreContactability(paths) {
  const uniqueTypes = new Set();

  for (const p of paths) {
    if (safePublicPath(p)) {
      uniqueTypes.add(p.contact_type);
    }
  }

  let score = 0;

  for (const type of uniqueTypes) {
    score += weights[type] || 0;
  }

  return Math.max(0, Math.min(100, score));
}

function tierFromScore(score) {
  const t = model.contactability_thresholds;

  if (score >= t.HIGH) return "HIGH";
  if (score >= t.MEDIUM) return "MEDIUM";
  if (score >= t.LOW) return "LOW";
  return "NONE";
}

const enriched = targets.map(t => {
  const raw = contactByEntity.get(t.entity_id);

  const paths =
    raw && Array.isArray(raw.contact_paths)
      ? raw.contact_paths.filter(safePublicPath)
      : [];

  const contactability_score = scoreContactability(paths);

  const contactability_tier =
    tierFromScore(contactability_score);

  return {
    entity_id: t.entity_id,
    organization_name: t.organization_name,
    target_name: t.target_name || "UNKNOWN_LEADER",
    leader_role: t.leader_role || "UNKNOWN",
    organization_type: t.organization_type || "UNKNOWN",

    lead_temperature: t.lead_temperature || "REVIEW",
    propagation_score: t.propagation_score || 0,

    contact_paths: paths,

    contactability_score,
    contactability_tier,

    has_public_email:
      paths.some(p => p.contact_type === "PUBLIC_EMAIL"),

    has_public_phone:
      paths.some(p => p.contact_type === "PUBLIC_PHONE"),

    has_public_form:
      paths.some(p => p.contact_type === "PUBLIC_CONTACT_FORM"),

    has_social_route:
      paths.some(p =>
        [
          "PUBLIC_FACEBOOK_PAGE",
          "PUBLIC_INSTAGRAM_PAGE",
          "PUBLIC_YOUTUBE_CHANNEL",
          "PUBLIC_PODCAST_PAGE"
        ].includes(p.contact_type)
      ),

    contact_enrichment_status:
      paths.length > 0
        ? "PUBLIC_CONTACT_PATH_FOUND"
        : "NO_PUBLIC_CONTACT_PATH_YET",

    updated_at: new Date().toISOString()
  };
});

fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2));

console.log(JSON.stringify({
  status: "PUBLIC_CONTACT_ENRICHMENT_COMPLETE",
  targets: enriched.length,
  with_contact_paths: enriched.filter(e => e.contact_paths.length > 0).length,
  high_contactability: enriched.filter(e => e.contactability_tier === "HIGH").length,
  medium_contactability: enriched.filter(e => e.contactability_tier === "MEDIUM").length,
  low_contactability: enriched.filter(e => e.contactability_tier === "LOW").length,
  none_contactability: enriched.filter(e => e.contactability_tier === "NONE").length,
  output: outputPath
}, null, 2));
