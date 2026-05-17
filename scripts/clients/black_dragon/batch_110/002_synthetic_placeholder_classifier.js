const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const inputPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/placeholder_purge/inputs/normalized_city_inventory_for_purge.json"
);

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const syntheticPatterns = [
  /luxury auto cluster/i,
  /executive fleet operator/i,
  /high-net-worth vehicle owner/i,
  /performance service buyer/i,
  /collector garage network/i,
  /example public/i,
  /sample motorcycle/i,
  /private client/i,
  /executive residence/i,
  /creative warehouse/i,
  /office tower/i,
  /rental hub/i,
  /showroom/i,
  /buyer\s+—/i,
  /operator\s+—/i,
  /owner\s+—/i,
  /cluster\s+—/i,
  /network\s+—/i
];

const nonBlackDragonVerticalPatterns = [
  /porsche/i,
  /bmw/i,
  /automotive museum/i,
  /luxury rental/i,
  /vehicle/i,
  /collector garage/i,
  /performance service/i
];

const allowedRealPatterns = [
  /police department/i,
  /sheriff/i,
  /department of public safety/i,
  /public safety/i,
  /gang/i,
  /violent crime/i,
  /narcotics/i,
  /organized crime/i,
  /regional task force/i,
  /municipal court/i,
  /prosecutor/i,
  /district attorney/i,
  /commission on post/i,
  /\bpost\b/i,
  /academy/i,
  /training/i,
  /criminal justice/i,
  /corrections/i,
  /department of corrections/i,
  /highway patrol/i,
  /state police/i,
  /campus police/i,
  /university police/i,
  /community college police/i,
  /fbi/i,
  /cops office/i,
  /safe streets/i,
  /motorcycle club/i,
  /motorcyclists/i,
  /\bmc\b/i,
  /bikers/i,
  /abate/i,
  /coalition/i,
  /confederation/i
];

const rows = input.rows.map(row => {
  const name = row.normalized_name || "";
  const state = row.normalized_state || "";
  const reasons = [];

  const syntheticHit = syntheticPatterns.some(rx => rx.test(name));
  const nonVerticalHit = nonBlackDragonVerticalPatterns.some(rx => rx.test(name));
  const allowedHit = allowedRealPatterns.some(rx => rx.test(name));

  if (!name) {
    reasons.push("MISSING_NAME");
  }

  if (syntheticHit) {
    reasons.push("SYNTHETIC_GENERATED_PATTERN");
  }

  if (nonVerticalHit) {
    reasons.push("NON_BLACK_DRAGON_VERTICAL");
  }

  if (/national/i.test(state) && !allowedHit) {
    reasons.push("NATIONAL_BUCKET_WITHOUT_ALLOWED_REAL_PATTERN");
  }

  if (!allowedHit && !syntheticHit) {
    reasons.push("UNVERIFIED_REALITY_REVIEW_REQUIRED");
  }

  let classification = "REVIEW_REQUIRED";

  if (syntheticHit || nonVerticalHit || reasons.includes("MISSING_NAME")) {
    classification = "QUARANTINE_PLACEHOLDER_OR_NONREAL";
  } else if (allowedHit) {
    classification = "REAL_LEANING_KEEP_FOR_EXPANSION_REVIEW";
  }

  return {
    ...row,
    purge_classification: classification,
    purge_reasons: reasons,
    allowed_real_pattern_match: allowedHit,
    synthetic_pattern_match: syntheticHit,
    non_vertical_pattern_match: nonVerticalHit
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/placeholder_purge/exports/classified_city_inventory.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_synthetic_placeholder_classifier_v1",
  generated_at: new Date().toISOString(),
  total_rows: rows.length,
  rows
}, null, 2));

console.log(JSON.stringify({
  status: "SYNTHETIC_PLACEHOLDER_CLASSIFIER_COMPLETE",
  total_rows: rows.length,
  keep: rows.filter(r => r.purge_classification === "REAL_LEANING_KEEP_FOR_EXPANSION_REVIEW").length,
  quarantine: rows.filter(r => r.purge_classification === "QUARANTINE_PLACEHOLDER_OR_NONREAL").length,
  review: rows.filter(r => r.purge_classification === "REVIEW_REQUIRED").length,
  output: out
}, null, 2));
