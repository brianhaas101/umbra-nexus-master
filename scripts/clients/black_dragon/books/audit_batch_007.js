const fs = require("fs");
const path = require("path");

const messagesPath = path.resolve(
  "public/data/clients/black_dragon/books/outreach/generated/book_outreach_messages.v1.json"
);

const shortlistPath = path.resolve(
  "public/data/clients/black_dragon/books/outreach/generated/book_hot_outreach_shortlist.v1.json"
);

const messages = JSON.parse(fs.readFileSync(messagesPath, "utf8"));
const shortlist = JSON.parse(fs.readFileSync(shortlistPath, "utf8"));

const audit = {
  version: "black_dragon_books_batch_007_audit_v1",
  generated_at: new Date().toISOString(),

  totals: {
    generated_messages: messages.length,
    hot_shortlist_messages: shortlist.total_hot_messages
  },

  template_usage: messages.reduce((acc, m) => {
    acc[m.template_key] = (acc[m.template_key] || 0) + 1;
    return acc;
  }, {}),

  integrity: {
    missing_message_ids: messages.filter(m => !m.message_id).length,
    missing_entity_ids: messages.filter(m => !m.entity_id).length,
    missing_subjects: messages.filter(m => !m.subject).length,
    missing_bodies: messages.filter(m => !m.body).length,
    missing_template_key: messages.filter(m => !m.template_key).length,
    unreplaced_tokens: messages.filter(m =>
      String(m.subject).includes("{{") ||
      String(m.body).includes("{{")
    ).length
  },

  operational_state: {
    messages_generated: messages.length > 0,
    shortlist_generated: Array.isArray(shortlist.messages),
    outreach_engine_active: true
  }
};

audit.pass =
  audit.integrity.missing_message_ids === 0 &&
  audit.integrity.missing_entity_ids === 0 &&
  audit.integrity.missing_subjects === 0 &&
  audit.integrity.missing_bodies === 0 &&
  audit.integrity.missing_template_key === 0 &&
  audit.integrity.unreplaced_tokens === 0 &&
  audit.operational_state.messages_generated &&
  audit.operational_state.shortlist_generated &&
  audit.operational_state.outreach_engine_active;

const out = path.resolve(
  "public/data/clients/black_dragon/books/audits/batch_007_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify(audit, null, 2));
