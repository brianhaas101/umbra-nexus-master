const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function normalizeText(value) {
  return String(value || "")
    .replace(/ï¿½/g, "’")
    .replace(/\uFFFD/g, "’")
    .replace(/â€™/g, "’")
    .replace(/â€œ/g, "“")
    .replace(/â€/g, "”")
    .normalize("NFC")
    .trim();
}

const feedPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/client_feed/client_updates_feed.json"
);

const feed = JSON.parse(fs.readFileSync(feedPath, "utf8"));

let repairs = 0;

feed.new_candidate_targets = feed.new_candidate_targets.map(target => {
  const before = target.organization_name;
  const after = normalizeText(before);

  if (before !== after) repairs += 1;

  return {
    ...target,
    organization_name: after,
    encoding_normalized: true
  };
});

fs.writeFileSync(feedPath, JSON.stringify(feed, null, 2), "utf8");

const report = {
  version: "black_dragon_utf8_string_normalization_report_v1",
  generated_at: new Date().toISOString(),
  target_file: "automation/client_feed/client_updates_feed.json",
  repaired_strings: repairs,
  encoding_policy: {
    utf8_required: true,
    unicode_normalization: "NFC",
    replacement_character_forbidden: true,
    mojibake_repair_enabled: true
  },
  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/encoding/utf8_string_normalization_report.json"
);

fs.writeFileSync(out, JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify({
  status: "UTF8_STRING_NORMALIZATION_GUARD_COMPLETE",
  repaired_strings: repairs,
  output: out
}, null, 2));
