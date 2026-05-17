const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const imported = read(
  "public/data/clients/black_dragon/retail_channels/imports/long_beach_retail_channel_import.json"
);

const validated = read(
  "public/data/clients/black_dragon/retail_channels/validated/long_beach_retail_channels_validated.json"
);

const dossiers = read(
  "public/data/clients/black_dragon/retail_channels/dossiers/long_beach_retail_channel_ranked_dossiers.json"
);

const audit = {

  version:
    "black_dragon_batch_115_retail_channel_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "115_LONG_BEACH_RETAIL_AND_PHYSICAL_CHANNELS",

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
  "public/data/clients/black_dragon/retail_channels/audit/batch_115_retail_channel_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_115_RETAIL_CHANNEL_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
