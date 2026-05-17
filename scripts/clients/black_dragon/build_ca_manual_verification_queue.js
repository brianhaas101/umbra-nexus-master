const fs = require("fs");
const path = require("path");

const IN_PATH = "public/data/clients/black_dragon/state_candidates/ca_review_shortlist.json";
const OUT_PATH = "public/data/clients/black_dragon/state_candidates/ca_manual_verification_queue.json";

const input = JSON.parse(fs.readFileSync(IN_PATH, "utf8"));

const queue = {
  version: "black_dragon_ca_manual_verification_queue_v1",
  generated_at: new Date().toISOString(),
  state: "CA",
  source: IN_PATH,
  rule: "Manual official-source verification required before any CA target becomes outreach-ready.",
  total_queue: input.targets.length,
  targets: input.targets.map((t, i) => ({
    queue_id: `CA-VERIFY-${String(i + 1).padStart(3, "0")}`,
    agency_name: t.agency_name,
    state: "CA",
    source_url: t.source_url,
    review_score: t.review_score,
    verification_needed: [
      "official agency contact page",
      "training/professional standards/academy path if available",
      "valid phone routing path",
      "no guessed email"
    ],
    status: "NEEDS_MANUAL_VERIFICATION",
    verified_contact_patch_ready: false,
    notes: ""
  }))
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(queue, null, 2));

console.log("[CA VERIFY QUEUE] COMPLETE");
console.log("[CA VERIFY QUEUE] Targets:", queue.total_queue);
console.log("[CA VERIFY QUEUE] Output:", OUT_PATH);
