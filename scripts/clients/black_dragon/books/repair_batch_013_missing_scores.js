const fs = require("fs");
const path = require("path");

const file = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const targets = JSON.parse(fs.readFileSync(file, "utf8"));

const roleWeights = {
  PRESIDENT: 25,
  VICE_PRESIDENT: 18,
  SERGEANT_AT_ARMS: 20,
  PUBLIC_RELATIONS_OFFICER: 16,
  CHAPLAIN: 12,
  ROAD_CAPTAIN: 10,
  CHAIRMAN: 28,
  COMMANDER: 24,
  DIRECTOR: 18,
  BOARD_MEMBER: 14,
  UNKNOWN: 4
};

const orgWeights = {
  MOTORCYCLE_CLUB: 18,
  RIDING_CLUB: 10,
  WOMENS_MC: 12,
  VETERANS_MC: 15,
  CHRISTIAN_MC: 14,
  POLICE_MC: 20,
  CHARITY_MC: 11,
  COUNCIL: 30,
  COALITION: 26,
  MOTORCYCLE_MINISTRY: 16,
  MOTORCYCLE_RIGHTS_ORG: 22,
  SPECIALTY_GROUP: 12
};

const signalWeights = {
  prospect_program: 16,
  church_meetings: 12,
  officer_training: 18,
  education_focus: 15,
  protocol_discussions: 14,
  leadership_development: 15,
  club_growth: 12,
  council_involvement: 22,
  book_recommendation_history: 30,
  member_education: 18,
  active_social_media: 5,
  event_activity: 4,
  community_presence: 4,
  officer_visibility: 5,
  motorcycle_ministry_activity: 3,
  charity_activity: 3,
  regional_mc_presence: 6
};

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeOrgType(v) {
  const s = String(v || "").toUpperCase();

  if (s.includes("CONFEDERATION") || s.includes("COUNCIL")) return "COUNCIL";
  if (s.includes("MINISTRY") || s.includes("CHRISTIAN")) return "MOTORCYCLE_MINISTRY";
  if (s.includes("VETERAN")) return "VETERANS_MC";
  if (s.includes("CHARITY") || s.includes("BACA")) return "CHARITY_MC";
  if (s.includes("RIGHTS") || s.includes("AMA")) return "MOTORCYCLE_RIGHTS_ORG";
  if (s.includes("SPECIALTY") || s.includes("MASONIC")) return "SPECIALTY_GROUP";
  if (s.includes("RIDING")) return "RIDING_CLUB";
  if (s.includes("WOMEN")) return "WOMENS_MC";

  return "MOTORCYCLE_CLUB";
}

function normalizeRole(v) {
  const s = String(v || "").toUpperCase();

  if (s.includes("PRESIDENT")) return "PRESIDENT";
  if (s.includes("VICE")) return "VICE_PRESIDENT";
  if (s.includes("SERGEANT")) return "SERGEANT_AT_ARMS";
  if (s.includes("PUBLIC") || s === "PRO") return "PUBLIC_RELATIONS_OFFICER";
  if (s.includes("CHAPLAIN")) return "CHAPLAIN";
  if (s.includes("ROAD")) return "ROAD_CAPTAIN";
  if (s.includes("CHAIR")) return "CHAIRMAN";
  if (s.includes("COMMANDER")) return "COMMANDER";
  if (s.includes("DIRECTOR")) return "DIRECTOR";
  if (s.includes("BOARD")) return "BOARD_MEMBER";

  return "UNKNOWN";
}

function normalizeSignals(signals) {
  return (signals || []).map(s =>
    String(s || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
  );
}

let repaired = 0;

targets.forEach(t => {
  t.organization_type = normalizeOrgType(t.organization_type);
  t.leader_role = normalizeRole(t.leader_role);

  const highSignals = normalizeSignals(t.high_value_signals);
  const supportingSignals = normalizeSignals(t.supporting_signals);

  t.high_value_signals = highSignals;
  t.supporting_signals = supportingSignals;

  if (typeof t.propagation_score !== "number") {
    const roleScore = roleWeights[t.leader_role] || 4;
    const orgScore = orgWeights[t.organization_type] || 10;
    const highSignalScore = highSignals.reduce((a, s) => a + (signalWeights[s] || 0), 0);
    const supportingSignalScore = supportingSignals.reduce((a, s) => a + (signalWeights[s] || 0), 0);

    const total = clamp(roleScore + orgScore + highSignalScore + supportingSignalScore);

    t.propagation_score = total;
    t.endorsement_likelihood = clamp(total * 0.92);
    t.bulk_order_potential = clamp(total * 0.84);
    t.member_purchase_multiplier = clamp(total * 0.95);

    if (total >= 85) {
      t.lead_temperature = "HOT";
      t.target_classification = "HIGH_PROPAGATION";
    } else if (total >= 65) {
      t.lead_temperature = "WARM";
      t.target_classification = "MEDIUM_PROPAGATION";
    } else {
      t.lead_temperature = "REVIEW";
      t.target_classification = "LOW_PROPAGATION";
    }

    t._score_trace = {
      roleScore,
      orgScore,
      highSignalScore,
      supportingSignalScore,
      total
    };

    repaired++;
  }

  if (!t.operational_status) {
    t.operational_status = "ACTIVE";
  }
});

fs.writeFileSync(file, JSON.stringify(targets, null, 2));

console.log(JSON.stringify({
  status: "BATCH_013_SCORE_REPAIR_COMPLETE",
  repaired,
  total_targets: targets.length,
  output: file
}, null, 2));
