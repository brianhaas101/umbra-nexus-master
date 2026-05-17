const fs = require("fs");
const path = require("path");

const inputPath = path.resolve(
  "public/data/clients/black_dragon/books/ingestion/raw_book_targets_intake.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/normalized/book_targets_normalized.v1.json"
);

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const tier1Countries = new Set([
  "USA",
  "UNITED STATES",
  "UNITED STATES OF AMERICA",
  "CANADA",
  "AUSTRALIA",
  "UNITED KINGDOM",
  "UK",
  "GERMANY",
  "SOUTH AFRICA",
  "NETHERLANDS",
  "SWEDEN",
  "NEW ZEALAND",
  "BRAZIL"
]);

const orgTypeMap = [
  { match: ["council", "coalition", "confederation"], value: "COUNCIL" },
  { match: ["ministry", "christian"], value: "MOTORCYCLE_MINISTRY" },
  { match: ["women", "women's", "female"], value: "WOMENS_MC" },
  { match: ["veteran", "veterans", "vets"], value: "VETERANS_MC" },
  { match: ["police", "law enforcement", "first responder"], value: "POLICE_MC" },
  { match: ["charity", "baca", "patriot guard"], value: "CHARITY_MC" },
  { match: ["rights", "advocacy", "ama"], value: "MOTORCYCLE_RIGHTS_ORG" },
  { match: ["riding club", "rc"], value: "RIDING_CLUB" },
  { match: ["specialty", "ruff ryders"], value: "SPECIALTY_GROUP" },
  { match: ["motorcycle club", "mc"], value: "MOTORCYCLE_CLUB" }
];

const roleMap = [
  { match: ["president", "national president"], value: "PRESIDENT" },
  { match: ["vice president", "vp"], value: "VICE_PRESIDENT" },
  { match: ["sergeant at arms", "saa"], value: "SERGEANT_AT_ARMS" },
  { match: ["public relations", "pro"], value: "PUBLIC_RELATIONS_OFFICER" },
  { match: ["chaplain"], value: "CHAPLAIN" },
  { match: ["road captain"], value: "ROAD_CAPTAIN" },
  { match: ["chairman", "chair"], value: "CHAIRMAN" },
  { match: ["commander"], value: "COMMANDER" },
  { match: ["director"], value: "DIRECTOR" },
  { match: ["board"], value: "BOARD_MEMBER" }
];

const highSignalMap = [
  { match: ["prospect program", "prospect class", "new member education"], value: "prospect_program" },
  { match: ["church meetings", "church", "formal meetings"], value: "church_meetings" },
  { match: ["officer training", "leadership training"], value: "officer_training" },
  { match: ["education focus", "member education"], value: "education_focus" },
  { match: ["protocol", "bylaws"], value: "protocol_discussions" },
  { match: ["leadership development"], value: "leadership_development" },
  { match: ["club growth", "new prospects", "new members"], value: "club_growth" },
  { match: ["council involvement", "coalition involvement"], value: "council_involvement" },
  { match: ["book recommendation", "required reading"], value: "book_recommendation_history" },
  { match: ["member education"], value: "member_education" }
];

const supportingSignalMap = [
  { match: ["active social media"], value: "active_social_media" },
  { match: ["event activity", "runs", "events"], value: "event_activity" },
  { match: ["community presence"], value: "community_presence" },
  { match: ["officer visibility"], value: "officer_visibility" },
  { match: ["motorcycle ministry activity"], value: "motorcycle_ministry_activity" },
  { match: ["charity activity"], value: "charity_activity" },
  { match: ["regional mc presence"], value: "regional_mc_presence" }
];

function lower(value) {
  return String(value || "").trim().toLowerCase();
}

function mapFromText(text, mappings, fallback) {
  const t = lower(text);
  for (const item of mappings) {
    if (item.match.some(m => t.includes(m))) return item.value;
  }
  return fallback;
}

function mapSignals(rawSignals, mappings) {
  const joined = Array.isArray(rawSignals)
    ? rawSignals.map(lower)
    : [];

  const found = [];

  for (const item of mappings) {
    if (joined.some(s => item.match.some(m => s.includes(m)))) {
      found.push(item.value);
    }
  }

  return [...new Set(found)];
}

function countryTier(country) {
  const c = String(country || "").trim().toUpperCase();
  return tier1Countries.has(c) ? "TIER_1" : "TIER_2";
}

function whyTarget(t) {
  const why = [];

  if (t.leader_role !== "UNKNOWN") {
    why.push("Leadership role has endorsement authority");
  }

  if (t.high_value_signals.includes("prospect_program")) {
    why.push("Organization appears to support prospect or new-member education");
  }

  if (t.high_value_signals.includes("church_meetings")) {
    why.push("Formal meeting structure indicates protocol and process alignment");
  }

  if (t.high_value_signals.includes("council_involvement")) {
    why.push("Council-level involvement can create downstream purchase influence");
  }

  if (t.high_value_signals.includes("education_focus") || t.high_value_signals.includes("member_education")) {
    why.push("Signals indicate interest in education and member development");
  }

  if (why.length < 2 && t.supporting_signals.length > 0) {
    why.push("Public activity indicates the organization is active and reachable");
  }

  if (why.length < 2) {
    why.push("Target requires review before outreach");
  }

  return why.slice(0, 3);
}

const normalized = raw.map((r, index) => {
  const orgType = mapFromText(
    `${r.organization_type_hint || ""} ${r.organization_name || ""}`,
    orgTypeMap,
    "MOTORCYCLE_CLUB"
  );

  const role = mapFromText(
    r.known_leader_role,
    roleMap,
    "UNKNOWN"
  );

  const high = mapSignals(r.observed_signals, highSignalMap);
  const supporting = mapSignals(r.observed_signals, supportingSignalMap);

  const target = {
    entity_id: `BD_BOOK_NORM_${String(index + 1).padStart(4, "0")}`,
    source_raw_id: r.raw_id || null,

    target_name: r.known_leader_name || "UNKNOWN_LEADER",
    organization_name: r.organization_name,
    organization_type: orgType,

    leader_role: role,

    country: r.country || "UNKNOWN",
    region: r.region || null,
    country_tier: countryTier(r.country),

    public_url: r.public_url || null,
    social_url: r.social_url || null,
    contact_method: r.contact_method || null,

    high_value_signals: high,
    supporting_signals: supporting,

    why_target: [],
    endorsement_likelihood: null,
    bulk_order_potential: null,
    member_purchase_multiplier: null,
    propagation_score: null,

    lead_temperature: "REVIEW",
    target_classification: "UNSCORED",

    outreach_status: "NOT_CONTACTED",
    notes: r.notes || null
  };

  target.why_target = whyTarget(target);

  return target;
});

fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2));

console.log(JSON.stringify({
  status: "BOOK_TARGET_NORMALIZATION_COMPLETE",
  input_count: raw.length,
  output_count: normalized.length,
  output: outputPath
}, null, 2));
