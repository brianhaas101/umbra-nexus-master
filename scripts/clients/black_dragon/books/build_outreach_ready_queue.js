const fs = require("fs");
const path = require("path");

const priorityPath = path.resolve(
  "public/data/clients/black_dragon/books/priority/contactability_weighted_priority_index.v1.json"
);

const messagesPath = path.resolve(
  "public/data/clients/black_dragon/books/outreach/generated/book_outreach_messages.v1.json"
);

const contactsPath = path.resolve(
  "public/data/clients/black_dragon/books/contacts/enriched/public_contact_enrichment.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json"
);

const priority = JSON.parse(fs.readFileSync(priorityPath, "utf8"));
const messages = JSON.parse(fs.readFileSync(messagesPath, "utf8"));
const contacts = JSON.parse(fs.readFileSync(contactsPath, "utf8"));

const messageMap = new Map(messages.map(m => [m.entity_id, m]));
const contactMap = new Map(contacts.map(c => [c.entity_id, c]));

function isReachable(contact) {
  if (!contact) return false;

  return (
    contact.has_public_email ||
    contact.has_public_phone ||
    contact.has_public_form ||
    contact.has_social_route ||
    contact.contact_paths.length > 0
  );
}

function bestRoute(contact) {
  if (!contact || !Array.isArray(contact.contact_paths)) return null;

  const rank = [
    "PUBLIC_EMAIL",
    "PUBLIC_CONTACT_FORM",
    "PUBLIC_PHONE",
    "PUBLIC_WEBSITE",
    "PUBLIC_FACEBOOK_PAGE",
    "PUBLIC_INSTAGRAM_PAGE",
    "PUBLIC_YOUTUBE_CHANNEL",
    "PUBLIC_PODCAST_PAGE",
    "PUBLIC_EVENT_PAGE"
  ];

  for (const type of rank) {
    const found = contact.contact_paths.find(p => p.contact_type === type);
    if (found) return found;
  }

  return contact.contact_paths[0] || null;
}

const queue = priority.targets
  .map(p => {
    const message = messageMap.get(p.entity_id);
    const contact = contactMap.get(p.entity_id);
    const route = bestRoute(contact);

    return {
      queue_id: `BD_BOOK_QUEUE_${p.entity_id}`,
      entity_id: p.entity_id,

      organization_name: p.organization_name,
      target_name: p.target_name || "UNKNOWN_LEADER",
      leader_role: p.leader_role || "UNKNOWN",
      organization_type: p.organization_type || "UNKNOWN",

      lead_temperature: p.lead_temperature,
      propagation_score: p.propagation_score,
      contactability_score: p.contactability_score,
      unified_priority_score: p.unified_priority_score,
      unified_priority_tier: p.unified_priority_tier,

      readiness_state: p.readiness_state,
      recommended_action: p.recommended_action,

      reachable: isReachable(contact),

      best_contact_route: route,

      message_id: message ? message.message_id : null,
      message_subject: message ? message.subject : null,
      message_body: message ? message.body : null,
      template_key: message ? message.template_key : null,

      outreach_status: p.outreach_status || "NOT_CONTACTED",

      queue_status:
        isReachable(contact) && message
          ? "READY"
          : "NEEDS_CONTACT_ENRICHMENT",

      generated_at: new Date().toISOString()
    };
  })
  .sort((a,b) => {
    if (a.queue_status === "READY" && b.queue_status !== "READY") return -1;
    if (a.queue_status !== "READY" && b.queue_status === "READY") return 1;

    return (b.unified_priority_score || 0) - (a.unified_priority_score || 0);
  });

const payload = {
  version: "black_dragon_books_outreach_ready_queue_v1",
  generated_at: new Date().toISOString(),

  totals: {
    total_queue_items: queue.length,
    ready: queue.filter(q => q.queue_status === "READY").length,
    needs_contact_enrichment: queue.filter(q => q.queue_status === "NEEDS_CONTACT_ENRICHMENT").length,
    critical: queue.filter(q => q.unified_priority_tier === "CRITICAL").length,
    high: queue.filter(q => q.unified_priority_tier === "HIGH").length,
    medium: queue.filter(q => q.unified_priority_tier === "MEDIUM").length,
    low: queue.filter(q => q.unified_priority_tier === "LOW").length
  },

  ready_queue:
    queue.filter(q => q.queue_status === "READY"),

  enrichment_queue:
    queue.filter(q => q.queue_status === "NEEDS_CONTACT_ENRICHMENT"),

  all_queue_items: queue
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

console.log(JSON.stringify({
  status: "OUTREACH_READY_QUEUE_BUILD_COMPLETE",
  totals: payload.totals,
  output: outputPath
}, null, 2));
