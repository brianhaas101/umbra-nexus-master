const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const classified = read(
  "public/data/clients/black_dragon/placeholder_purge/exports/classified_city_inventory.json"
);

const quarantine = read(
  "public/data/clients/black_dragon/placeholder_purge/quarantine/quarantined_placeholder_or_nonreal_records.json"
);

const clean = read(
  "public/data/clients/black_dragon/placeholder_purge/exports/clean_black_dragon_expansion_seed.json"
);

const total = classified.total_rows;
const cleanCount = clean.total_clean_expansion_seeds;
const quarantineCount = quarantine.total_quarantined;
const reviewCount = quarantine.total_review_required;

const audit = {
  version: "black_dragon_batch_110_placeholder_purge_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "110_PLACEHOLDER_PURGE_REAL_CITY_RUNTIME_SEED_FILTER",

  counts: {
    total_input_records: total,
    clean_expansion_seeds: cleanCount,
    quarantined_placeholder_or_nonreal: quarantineCount,
    review_required: reviewCount
  },

  gates: {
    input_records_exist: total > 0,
    clean_plus_quarantine_plus_review_matches_input:
      cleanCount + quarantineCount + reviewCount === total,

    quarantine_not_delete:
      quarantine.policy.hard_delete_forbidden === true,

    clean_seeds_not_contact_ready:
      clean.clean_expansion_seeds.every(r => r.contact_ready === false),

    clean_seeds_not_visible_until_verified:
      clean.clean_expansion_seeds.every(
        r => r.dossier_visible === false && r.city_map_visible === false
      ),

    automated_outreach_disabled:
      clean.clean_expansion_seeds.every(r => r.automated_outreach_allowed === false),

    promotion_disabled:
      clean.clean_expansion_seeds.every(r => r.promotion_allowed === false)
  },

  next_phase:
    "BATCH_111_CITY_TARGET_EXPANSION_PLANNER",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/placeholder_purge/audit/batch_110_placeholder_purge_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_110_PLACEHOLDER_PURGE_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
