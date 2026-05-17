const fs = require("fs");
const path = require("path");

const INPUT_PATH = path.join(__dirname, "../../../public/data/clients/black_dragon/scored_targets.json");
const READY_PATH = path.join(__dirname, "../../../public/data/clients/black_dragon/ready_targets.json");
const ENRICH_PATH = path.join(__dirname, "../../../public/data/clients/black_dragon/enrichment_queue.json");

function isGenericEmail(email) {
  if (!email) return true;
  return /info@|admin@|contact@|support@/i.test(email);
}

function isContactReady(target) {
  return (
    target.contact &&
    target.contact.email &&
    target.contact.phone &&
    !isGenericEmail(target.contact.email) &&
    target.agency_name &&
    target.score
  );
}

function buildJustification(target) {
  return `Target selected due to score ${target.score} with classification ${target.target_classification}. Agency shows relevance for MC-related enforcement training and operational exposure.`;
}

function buildRoles() {
  return [
    "Training Division Commander",
    "Lieutenant (Training)",
    "Sergeant (Special Units)"
  ];
}

function buildAngle() {
  return "Position training around real-world MC encounters, officer safety risk, and escalation pattern recognition.";
}

function process() {
   const parsed = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));

const raw = Array.isArray(parsed)
  ? parsed
  : parsed.targets || parsed.data || parsed.entities || [];

  const ready = [];
  const enrich = [];

  raw.forEach(target => {
    const output = {
      entity_id: target.entity_id,
      agency_name: target.agency_name,
      priority: target.priority || target.target_classification,
      score: target.score,
      justification: buildJustification(target),
      target_roles: buildRoles(),
      outreach_angle: buildAngle(),
      contact: target.contact || null
    };

    if (isContactReady(target)) {
      output.status = "READY";
      ready.push(output);
    } else {
      output.status = "NEEDS_ENRICHMENT";
      enrich.push(output);
    }
  });

  fs.writeFileSync(READY_PATH, JSON.stringify(ready, null, 2));
  fs.writeFileSync(ENRICH_PATH, JSON.stringify(enrich, null, 2));

  console.log("[OUTPUT] READY:", ready.length);
  console.log("[OUTPUT] ENRICH:", enrich.length);
}

process();