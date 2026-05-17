const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const imported = read(
  "public/data/clients/black_dragon/bulk_order_layer/imports/long_beach_bulk_order_import.json"
);

const validated = read(
  "public/data/clients/black_dragon/bulk_order_layer/validated/long_beach_bulk_order_validated.json"
);

const dossiers = read(
  "public/data/clients/black_dragon/bulk_order_layer/dossiers/long_beach_bulk_order_ranked_dossiers.json"
);

const audit = {

  version:
    "black_dragon_batch_118_bulk_order_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "118_LONG_BEACH_HIGH_INTENT_BUYER_LAYER",

  counts: {

    imported:
      imported.total_imported,

    validated:
      validated.validated_count,

    dossiers:
      dossiers.total_dossiers,

    hot:
      dossiers.dossiers.filter(d => d.priority_tier === "HOT").length,

    warm:
      dossiers.dossiers.filter(d => d.priority_tier === "WARM").length,

    review:
      dossiers.dossiers.filter(d => d.priority_tier === "REVIEW").length
  },

  gates: {

    imported_10:
      imported.total_imported === 10,

    validated_10:
      validated.validated_count === 10,

    dossiers_match:
      dossiers.total_dossiers === 10,

    all_runtime_visible:
      dossiers.dossiers.every(d => d.runtime_visible === true),

    no_contact_ready:
      dossiers.dossiers.every(d => d.contact_ready === false)
  },

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/bulk_order_layer/audit/batch_118_bulk_order_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_118_BULK_ORDER_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
