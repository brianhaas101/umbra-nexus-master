const fs = require("fs");
const path = require("path");

const approvedPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/approved/public_book_targets_approved.v1.json"
);

const normalizedPath = path.resolve(
  "public/data/clients/black_dragon/books/normalized/book_targets_scored.v2.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const approved = JSON.parse(fs.readFileSync(approvedPath, "utf8"));
const normalized = JSON.parse(fs.readFileSync(normalizedPath, "utf8"));

function clean(v) {
  return String(v || "")
    .trim()
    .toUpperCase();
}

const existing = new Set(
  normalized.map(t =>
    `${clean(t.organization_name)}::${clean(t.leader_role)}`
  )
);

const converted = approved.map((t, index) => {

  const normalizedSignals =
    Array.isArray(t.observed_signals)
      ? t.observed_signals
      : [];

  const entry = {
    entity_id:
      `BD_BOOK_OP_${String(index + 1).padStart(5, "0")}`,

    source_type: t.source_type || "MANUAL_RESEARCH",
    source_url: t.source_url || null,

    target_name:
      t.known_leader_name || "UNKNOWN_LEADER",

    organization_name:
      t.organization_name || "UNKNOWN_ORG",

    organization_type:
      t.organization_type_hint
        ? String(t.organization_type_hint)
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "_")
        : "MOTORCYCLE_CLUB",

    leader_role:
      t.known_leader_role
        ? String(t.known_leader_role)
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "_")
        : "UNKNOWN",

    country: t.country || "UNKNOWN",
    region: t.region || null,

    high_value_signals: normalizedSignals,

    why_target: [
      "Approved public-facing motorcycle organization",
      "Leadership role indicates influence potential",
      "Target passed public-intake validation"
    ],

    endorsement_likelihood: null,
    bulk_order_potential: null,
    member_purchase_multiplier: null,
    propagation_score: null,

    lead_temperature: "REVIEW",
    target_classification: "UNSCORED",

    outreach_status: "NOT_CONTACTED",

    operational_status: "ACTIVE",

    created_at: new Date().toISOString(),

    notes: t.notes || null
  };

  return entry;
});

const deduped = [];

for (const t of converted) {

  const key =
    `${clean(t.organization_name)}::${clean(t.leader_role)}`;

  if (!existing.has(key)) {
    existing.add(key);
    deduped.push(t);
  }
}

const merged = [
  ...normalized,
  ...deduped
];

fs.writeFileSync(
  outputPath,
  JSON.stringify(merged, null, 2)
);

console.log(JSON.stringify({
  status: "BOOK_OPERATIONAL_DATASET_BUILD_COMPLETE",
  normalized_existing: normalized.length,
  approved_converted: converted.length,
  deduped_added: deduped.length,
  operational_total: merged.length,
  output: outputPath
}, null, 2));
