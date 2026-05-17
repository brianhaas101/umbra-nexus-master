const fs = require("fs");
const path = require("path");

const inputPath = path.resolve(
  "public/data/clients/black_dragon/books/contacts/enriched/public_contact_enrichment.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/contacts/snapshots/public_contact_enrichment_snapshot.v1.json"
);

const enriched = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const snapshot = {
  version: "black_dragon_books_contact_enrichment_snapshot_v1",
  generated_at: new Date().toISOString(),

  totals: {
    total_targets: enriched.length,
    with_contact_paths:
      enriched.filter(e => e.contact_paths.length > 0).length,

    high:
      enriched.filter(e => e.contactability_tier === "HIGH").length,

    medium:
      enriched.filter(e => e.contactability_tier === "MEDIUM").length,

    low:
      enriched.filter(e => e.contactability_tier === "LOW").length,

    none:
      enriched.filter(e => e.contactability_tier === "NONE").length,

    public_email:
      enriched.filter(e => e.has_public_email).length,

    public_phone:
      enriched.filter(e => e.has_public_phone).length,

    public_form:
      enriched.filter(e => e.has_public_form).length,

    social_route:
      enriched.filter(e => e.has_social_route).length
  },

  best_contactable_targets:
    enriched
      .filter(e => e.contactability_score > 0)
      .sort((a,b) => b.contactability_score - a.contactability_score)
      .slice(0, 25)
      .map(e => ({
        entity_id: e.entity_id,
        organization_name: e.organization_name,
        leader_role: e.leader_role,
        lead_temperature: e.lead_temperature,
        propagation_score: e.propagation_score,
        contactability_score: e.contactability_score,
        contactability_tier: e.contactability_tier
      }))
};

fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

console.log(JSON.stringify({
  status: "PUBLIC_CONTACT_ENRICHMENT_SNAPSHOT_COMPLETE",
  totals: snapshot.totals,
  output: outputPath
}, null, 2));
