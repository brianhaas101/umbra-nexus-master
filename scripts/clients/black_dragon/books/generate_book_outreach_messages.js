const fs = require("fs");
const path = require("path");

const targetsPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const templatesPath = path.resolve(
  "public/data/clients/black_dragon/books/outreach/book_endorsement_templates.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/outreach/generated/book_outreach_messages.v1.json"
);

const targets = JSON.parse(fs.readFileSync(targetsPath, "utf8"));
const templates = JSON.parse(fs.readFileSync(templatesPath, "utf8")).templates;

function chooseTemplate(target) {
  const orgType = target.organization_type || "";
  const signals = target.high_value_signals || [];

  if (
    orgType === "COUNCIL" ||
    orgType === "COALITION" ||
    signals.includes("council_involvement")
  ) {
    return "COUNCIL_MULTIPLIER";
  }

  if (
    signals.includes("prospect_program") ||
    signals.includes("member_education") ||
    signals.includes("education_focus")
  ) {
    return "PROSPECT_EDUCATION";
  }

  return "LEADERSHIP_ENDORSEMENT";
}

function render(text, target) {
  return String(text || "")
    .replaceAll("{{ORGANIZATION_NAME}}", target.organization_name || "your organization")
    .replaceAll("{{LEADER_ROLE}}", target.leader_role || "leader");
}

const messages = targets.map(target => {
  const templateKey = chooseTemplate(target);
  const template = templates[templateKey];

  const message = {
    message_id: `BD_BOOK_MSG_${target.entity_id}`,
    entity_id: target.entity_id,

    organization_name: target.organization_name,
    target_name: target.target_name || "UNKNOWN_LEADER",
    leader_role: target.leader_role || "UNKNOWN",

    lead_temperature: target.lead_temperature,
    propagation_score: target.propagation_score,

    template_key: templateKey,
    subject: render(template.subject, target),
    body: render(template.body, target),

    why_target: target.why_target || [],

    outreach_status: target.outreach_status || "NOT_CONTACTED",

    generated_at: new Date().toISOString()
  };

  return message;
});

fs.writeFileSync(outputPath, JSON.stringify(messages, null, 2));

console.log(JSON.stringify({
  status: "BOOK_OUTREACH_MESSAGES_GENERATED",
  targets: targets.length,
  messages: messages.length,
  output: outputPath
}, null, 2));
