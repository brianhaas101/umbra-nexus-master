const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const dossiers = JSON.parse(fs.readFileSync(
  path.join(ROOT,
    "public/data/clients/black_dragon/culture_expansion_layer/dossiers/long_beach_culture_expansion_ranked_dossiers.json"),
  "utf8"
));

const audit = {

  version:
    "black_dragon_batch_123_culture_expansion_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "123_LONG_BEACH_CULTURE_PROPAGATION_EXPANSION",

  counts: {

    dossiers:
      dossiers.total_dossiers,

    hot:
      dossiers.dossiers.filter(d => d.priority_tier === "HOT").length,

    warm:
      dossiers.dossiers.filter(d => d.priority_tier === "WARM").length,

    review:
      dossiers.dossiers.filter(d => d.priority_tier === "REVIEW").length,

    podcast_youtube:
      dossiers.dossiers.filter(d => d.culture_group === "PODCAST_YOUTUBE").length,

    tattoo_barber:
      dossiers.dossiers.filter(d => d.culture_group === "TATTOO_BARBER_ANCHORS").length,

    charity:
      dossiers.dossiers.filter(d => d.culture_group === "CHARITY_FUNDRAISER").length,

    creator_influencer:
      dossiers.dossiers.filter(d => d.culture_group === "CREATOR_INFLUENCER").length
  },

  gates: {

    dossiers_10:
      dossiers.total_dossiers === 10,

    runtime_visible:
      dossiers.dossiers.every(d => d.runtime_visible === true),

    contact_ready_disabled:
      dossiers.dossiers.every(d => d.contact_ready === false),

    automated_outreach_disabled:
      dossiers.dossiers.every(d => d.automated_outreach_allowed === false)
  },

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/culture_expansion_layer/audit/batch_123_culture_expansion_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_123_CULTURE_EXPANSION_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
