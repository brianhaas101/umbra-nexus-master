const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const classifiedPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/placeholder_purge/exports/classified_city_inventory.json"
);

const classified = JSON.parse(fs.readFileSync(classifiedPath, "utf8"));

const quarantine = classified.rows.filter(
  r => r.purge_classification === "QUARANTINE_PLACEHOLDER_OR_NONREAL"
);

const review = classified.rows.filter(
  r => r.purge_classification === "REVIEW_REQUIRED"
);

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/placeholder_purge/quarantine/quarantined_placeholder_or_nonreal_records.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_placeholder_quarantine_v1",
  generated_at: new Date().toISOString(),
  policy: {
    hard_delete_forbidden: true,
    quarantine_required: true,
    lineage_retained: true,
    usable_for_expansion: false
  },
  total_quarantined: quarantine.length,
  total_review_required: review.length,
  quarantined_records: quarantine,
  review_required_records: review
}, null, 2));

console.log(JSON.stringify({
  status: "PLACEHOLDER_QUARANTINE_EXPORT_COMPLETE",
  total_quarantined: quarantine.length,
  total_review_required: review.length,
  output: out
}, null, 2));
