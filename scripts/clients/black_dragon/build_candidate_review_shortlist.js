const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const INPUT_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_candidates.json"
);

const OUTPUT_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_candidate_review_shortlist.json"
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function isUsefulCandidate(candidate) {
  if (!candidate) return false;

  const hasEmail = Boolean(candidate.email);
  const hasPhone = Boolean(candidate.phone);
  const nonGenericEmail = hasEmail && candidate.email_is_generic === false;

  return nonGenericEmail || hasPhone;
}

function getBestCandidates(candidates, limit = 5) {
  return (candidates || [])
    .filter(isUsefulCandidate)
    .sort((a, b) => {
      const scoreA = Number(a.candidate_score || 0);
      const scoreB = Number(b.candidate_score || 0);
      return scoreB - scoreA;
    })
    .slice(0, limit)
    .map((candidate, index) => ({
      review_rank: index + 1,
      candidate_class: candidate.candidate_class || "REVIEW",
      candidate_score: candidate.candidate_score || 0,
      email: candidate.email || null,
      email_is_generic: candidate.email_is_generic,
      phone: candidate.phone || null,
      source_url: candidate.source_url || null,
      context: candidate.context || "",
      review_decision: "PENDING",
      promote_to_override: false,
      reviewer_notes: ""
    }));
}

function classifyAgencyReview(target, candidates) {
  const strong = candidates.some(c => c.candidate_class === "STRONG_REVIEW");
  const hasDirectEmail = candidates.some(c => c.email && c.email_is_generic === false);
  const hasPhone = candidates.some(c => c.phone);

  if (strong) return "STRONG_REVIEW";
  if (hasDirectEmail && hasPhone) return "HIGH_REVIEW";
  if (hasDirectEmail) return "EMAIL_REVIEW";
  if (hasPhone) return "PHONE_REVIEW";
  return "MANUAL_RESEARCH_REQUIRED";
}

function main() {
  const input = readJson(INPUT_PATH);
  const targets = input.targets || [];

  const reviewTargets = targets
    .map(target => {
      const bestCandidates = getBestCandidates(target.candidates || [], 5);

      return {
        master_id: target.master_id,
        authority_target_id: target.authority_target_id,
        agency_name: target.agency_name,
        city: target.city,
        state: target.state,
        country: target.country || "US",
        agency_type: target.agency_type,
        priority_band: target.priority_band,
        score: target.score,
        website: target.website,
        contact_url: target.contact_url,
        review_status: classifyAgencyReview(target, bestCandidates),
        recommended_next_action:
          bestCandidates.length > 0
            ? "REVIEW_TOP_CANDIDATES"
            : "MANUAL_RESEARCH_REQUIRED",
        candidates_to_review: bestCandidates
      };
    })
    .filter(target => target.candidates_to_review.length > 0)
    .sort((a, b) => {
      const order = {
        STRONG_REVIEW: 1,
        HIGH_REVIEW: 2,
        EMAIL_REVIEW: 3,
        PHONE_REVIEW: 4,
        MANUAL_RESEARCH_REQUIRED: 5
      };

      const statusA = order[a.review_status] || 99;
      const statusB = order[b.review_status] || 99;

      if (statusA !== statusB) return statusA - statusB;

      return Number(b.score || 0) - Number(a.score || 0);
    });

  const output = {
    version: "black_dragon_contact_candidate_review_shortlist_v1",
    generated_at: new Date().toISOString(),
    source: "contact_candidates.json",
    input_agencies: targets.length,
    agencies_with_review_candidates: reviewTargets.length,
    total_candidates_to_review: reviewTargets.reduce(
      (sum, target) => sum + target.candidates_to_review.length,
      0
    ),
    review_status_counts: reviewTargets.reduce((acc, target) => {
      acc[target.review_status] = (acc[target.review_status] || 0) + 1;
      return acc;
    }, {}),
    instructions: {
      goal: "Review only top ranked candidates instead of all raw candidates.",
      promote_rule: "Only set promote_to_override true when contact is verified as correct, non-generic, and usable for outreach.",
      strict_ready_rule: "READY requires non-generic email, phone number, complete agency identity, and valid role."
    },
    targets: reviewTargets
  };

  writeJson(OUTPUT_PATH, output);

  console.log("[REVIEW SHORTLIST] COMPLETE");
  console.log("[REVIEW SHORTLIST] Agencies:", output.agencies_with_review_candidates);
  console.log("[REVIEW SHORTLIST] Candidates to review:", output.total_candidates_to_review);
  console.log("[REVIEW SHORTLIST] Status counts:", output.review_status_counts);
}

main();