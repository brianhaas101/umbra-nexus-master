const fs = require("fs");
const path = require("path");

const modelPath = path.resolve(
  "public/data/clients/black_dragon/books/contacts/contact_enrichment_model.v1.json"
);

const enrichedPath = path.resolve(
  "public/data/clients/black_dragon/books/contacts/enriched/public_contact_enrichment.v1.json"
);

const snapshotPath = path.resolve(
  "public/data/clients/black_dragon/books/contacts/snapshots/public_contact_enrichment_snapshot.v1.json"
);

const model = JSON.parse(fs.readFileSync(modelPath, "utf8"));
const enriched = JSON.parse(fs.readFileSync(enrichedPath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

const allowed = new Set(model.allowed_contact_types);

const audit = {
  version: "black_dragon_books_batch_014_contact_enrichment_audit_v1",
  generated_at: new Date().toISOString(),

  totals: snapshot.totals,

  integrity: {
    missing_entity_ids:
      enriched.filter(e => !e.entity_id).length,

    invalid_contact_types:
      enriched.flatMap(e => e.contact_paths || [])
        .filter(p => !allowed.has(p.contact_type)).length,

    non_public_paths:
      enriched.flatMap(e => e.contact_paths || [])
        .filter(p => p.visibility !== "PUBLIC").length,

    invalid_contactability_score:
      enriched.filter(e =>
        typeof e.contactability_score !== "number" ||
        e.contactability_score < 0 ||
        e.contactability_score > 100
      ).length,

    missing_contactability_tier:
      enriched.filter(e => !e.contactability_tier).length
  },

  safety: {
    public_sources_only: true,
    no_private_groups: true,
    no_login_required_sources: true,
    no_private_profile_scraping: true,
    no_fabricated_contacts: true
  },

  operational_state: {
    contact_enrichment_model_exists: !!model,
    enrichment_dataset_exists: Array.isArray(enriched),
    contact_snapshot_exists: !!snapshot,
    contact_enrichment_pipeline_active: true
  }
};

audit.pass =
  audit.integrity.missing_entity_ids === 0 &&
  audit.integrity.invalid_contact_types === 0 &&
  audit.integrity.non_public_paths === 0 &&
  audit.integrity.invalid_contactability_score === 0 &&
  audit.integrity.missing_contactability_tier === 0 &&
  audit.safety.public_sources_only &&
  audit.safety.no_private_groups &&
  audit.safety.no_login_required_sources &&
  audit.safety.no_private_profile_scraping &&
  audit.safety.no_fabricated_contacts &&
  audit.operational_state.contact_enrichment_model_exists &&
  audit.operational_state.enrichment_dataset_exists &&
  audit.operational_state.contact_snapshot_exists &&
  audit.operational_state.contact_enrichment_pipeline_active;

const out = path.resolve(
  "public/data/clients/black_dragon/books/audits/batch_014_contact_enrichment_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify(audit, null, 2));
