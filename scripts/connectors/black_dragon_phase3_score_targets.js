const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const INPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/targets_master.json"
);

const OUTPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/scored_targets.json"
);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function has(name, pattern) {
  return pattern.test(clean(name));
}

function revenuePotential(target) {
  const name = clean(target.agency_name);

  let score = 45;

  if (has(name, /PHOENIX|TUCSON|MESA|GLENDALE|SCOTTSDALE|CHANDLER|TEMPE/i)) score += 20;
  if (has(name, /SHERIFF|COUNTY ATTORNEY|ATTORNEY GENERAL/i)) score += 18;
  if (has(name, /HIDTA|TASK FORCE|DRUG|GANG|VIOLENT/i)) score += 20;
  if (has(name, /SUPERIOR COURT|JUSTICE COURT|MUNICIPAL COURT/i)) score += 8;
  if (has(name, /TRIBAL POLICE|CAMPUS POLICE/i)) score += 6;

  return Math.min(score, 100);
}

function trainingFit(target) {
  const name = clean(target.agency_name);

  let score = 45;

  if (has(name, /POLICE|SHERIFF|TRIBAL POLICE|PUBLIC SAFETY|DPS/i)) score += 25;
  if (has(name, /HIDTA|TASK FORCE|DRUG|GANG|BORDER/i)) score += 28;
  if (has(name, /PROSECUTOR|ATTORNEY/i)) score += 14;
  if (has(name, /COURT/i)) score += 8;
  if (has(name, /CAMPUS POLICE/i)) score += 5;

  return Math.min(score, 100);
}

function actionability(target) {
  let score = 40;

  if (target.website) score += 25;
  if (target.contact_url) score += 20;
  if (target.city && target.city !== "AZ_STATEWIDE_REVIEW") score += 10;
  if (target.validated_tier === "TIER_1") score += 10;
  if (target.validated_tier === "TIER_2") score += 5;

  return Math.min(score, 100);
}

function strategicCredibility(target) {
  const name = clean(target.agency_name);

  let score = 40;

  if (has(name, /ATTORNEY GENERAL|HIDTA|TASK FORCE|SHERIFF/i)) score += 30;
  if (has(name, /PHOENIX|TUCSON|MESA|SCOTTSDALE|CHANDLER|GLENDALE/i)) score += 15;
  if (has(name, /COURT|PROSECUTOR|COUNTY ATTORNEY/i)) score += 10;

  return Math.min(score, 100);
}

function finalScore(target) {
  const revenue = revenuePotential(target);
  const training = trainingFit(target);
  const action = actionability(target);
  const credibility = strategicCredibility(target);

  const total =
    revenue * 0.4 +
    training * 0.3 +
    action * 0.2 +
    credibility * 0.1;

  return {
    revenue_potential: revenue,
    training_fit: training,
    actionability: action,
    strategic_credibility: credibility,
    final_score: Number(total.toFixed(2))
  };
}

function priorityBand(score) {
  if (score >= 85) return "PRIORITY_A";
  if (score >= 72) return "PRIORITY_B";
  if (score >= 60) return "PRIORITY_C";
  return "PRIORITY_REVIEW";
}

function outreachAngle(target) {
  const name = clean(target.agency_name);

  if (/HIDTA|TASK FORCE|DRUG|GANG|BORDER/i.test(name)) {
    return "advanced threat-awareness and enforcement intelligence training";
  }

  if (/SHERIFF|POLICE|PUBLIC SAFETY|DPS|TRIBAL POLICE/i.test(name)) {
    return "law-enforcement training, officer readiness, and public-safety education";
  }

  if (/PROSECUTOR|ATTORNEY/i.test(name)) {
    return "justice-system education, prosecution context, and public-safety coordination";
  }

  if (/COURT/i.test(name)) {
    return "court-adjacent education and justice-system awareness";
  }

  return "public-safety education and agency training alignment";
}

function main() {
  console.log("[BD PHASE 3 SCORE] Starting...");

  if (!fs.existsSync(INPUT)) {
    console.error("[BD PHASE 3 SCORE] Missing input: " + INPUT);
    process.exit(1);
  }

  const input = readJson(INPUT);
  const targets = Array.isArray(input.targets) ? input.targets : [];

  const scored = targets
    .map((target) => {
      const scores = finalScore(target);

      return {
        ...target,
        phase3_scores: scores,
        priority_band: priorityBand(scores.final_score),
        outreach_angle: outreachAngle(target),
        phase3_status: "scored_review_required"
      };
    })
    .sort((a, b) => b.phase3_scores.final_score - a.phase3_scores.final_score);

  const output = {
    source: "black_dragon_phase3_hybrid_scoring",
    generated_at: new Date().toISOString(),
    scoring_model: {
      revenue_potential: 0.4,
      training_fit: 0.3,
      actionability: 0.2,
      strategic_credibility: 0.1
    },
    total_scored_targets: scored.length,
    priority_counts: scored.reduce((acc, t) => {
      acc[t.priority_band] = (acc[t.priority_band] || 0) + 1;
      return acc;
    }, {}),
    targets: scored
  };

  writeJson(OUTPUT, output);

  console.log("[BD PHASE 3 SCORE] Scored:", scored.length);
  console.log("[BD PHASE 3 SCORE] Output:", OUTPUT);
  console.log("[BD PHASE 3 SCORE] Priority counts:", output.priority_counts);
}

main();
