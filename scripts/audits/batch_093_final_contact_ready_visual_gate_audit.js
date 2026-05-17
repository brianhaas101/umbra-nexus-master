const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function exists(file) {
  return fs.existsSync(path.resolve(file));
}

const files = {
  classification:
    "public/data/clients/black_dragon/authentication/classification/authentication_gap_classification.v1.json",

  quarantine:
    "public/data/clients/black_dragon/authentication/quarantine/active/quarantined_synthetic_entities.v1.json",

  verifiedRuntime:
    "public/data/clients/black_dragon/authentication/verified_runtime/verified_runtime_candidates.v1.json",

  sourceDiscovery:
    "public/data/clients/black_dragon/authentication/source_discovery/queues/verified_source_discovery_queue.v1.json",

  visualManifest:
    "public/data/clients/black_dragon/authentication/source_discovery/visual/visual_contact_review_manifest.v1.json",

  sourceImports:
    "public/data/clients/black_dragon/authentication/source_import/validated/validated_source_imports.v1.json",

  contactRoutes:
    "public/data/clients/black_dragon/authentication/contact_validation/validated/validated_contact_routes.v1.json",

  promotionEligible:
    "public/data/clients/black_dragon/authentication/promotion/eligible/contact_ready_targets.v1.json",

  promotionBlocked:
    "public/data/clients/black_dragon/authentication/promotion/blocked/blocked_promotion_candidates.v1.json",

  manualReview:
    "public/data/clients/black_dragon/authentication/promotion/manual_review_import_template.v1.json"
};

const data = Object.fromEntries(
  Object.entries(files).map(([key, file]) => [
    key,
    exists(file) ? readJson(file) : null
  ])
);

const visualRows =
  data.visualManifest?.visual_review_rows || [];

const contactReady =
  data.promotionEligible?.contact_ready_targets || [];

const blocked =
  data.promotionBlocked?.blocked_promotion_candidates || [];

const quarantined =
  data.quarantine?.quarantined_entities || [];

const verifiedCandidates =
  data.verifiedRuntime?.verified_runtime_candidates || [];

const audit = {
  version:
    "umbra_batch_093_final_contact_ready_visual_gate_audit_v1",

  generated_at:
    new Date().toISOString(),

  file_integrity:
    Object.fromEntries(
      Object.entries(files).map(([key, file]) => [key, exists(file)])
    ),

  population_integrity: {
    original_total:
      data.classification?.totals?.total_entities || 0,

    quarantined:
      data.quarantine?.totals?.quarantined_entities || 0,

    retained_candidates:
      data.verifiedRuntime?.totals?.verified_runtime_candidates || 0,

    visual_rows:
      data.visualManifest?.totals?.visual_rows || 0,

    blocked_candidates:
      data.promotionBlocked?.totals?.blocked || 0,

    contact_ready:
      data.promotionEligible?.totals?.eligible || 0
  },

  visual_gate_integrity: {
    visual_manifest_present:
      !!data.visualManifest,

    all_visual_rows_pending_or_reviewed:
      visualRows.every(x =>
        ["PENDING", "APPROVED", "REJECTED"].includes(x.reviewer_decision)
      ),

    all_rows_have_names:
      visualRows.every(x => !!x.organization_name),

    all_rows_have_region:
      visualRows.every(x => !!x.region),

    all_rows_have_contact_flags:
      visualRows.every(x =>
        typeof x.contact_ready === "boolean" &&
        typeof x.outreach_allowed === "boolean"
      ),

    visual_review_required_before_client_access:
      data.visualManifest?.access_policy ===
      "BLACK_DRAGON_CLIENT_ACCESS_BLOCKED_UNTIL_VISUAL_REVIEW_COMPLETE"
  },

  contact_ready_integrity: {
    no_contact_ready_without_source:
      contactReady.every(x => !!x.source_url),

    no_contact_ready_without_contact_route:
      contactReady.every(x =>
        !!x.contact_route ||
        !!x.contact_email ||
        !!x.contact_phone ||
        !!x.contact_page_url
      ),

    no_contact_ready_without_manual_review:
      contactReady.every(x =>
        x.manual_review &&
        x.manual_review.reviewer_decision === "APPROVED" &&
        x.manual_review.manual_review_pass === true
      ),

    all_contact_ready_outreach_allowed:
      contactReady.every(x =>
        x.contact_ready === true &&
        x.outreach_allowed === true
      )
  },

  blocked_integrity: {
    all_blocked_not_contact_ready:
      blocked.every(x => x.contact_ready === false),

    all_blocked_not_outreach_allowed:
      blocked.every(x => x.outreach_allowed === false),

    all_quarantined_hidden_from_contact:
      quarantined.every(x =>
        x.visible_in_contact_workflows === false &&
        x.visible_in_outreach_workflows === false
      ),

    all_verified_candidates_not_auto_promoted:
      verifiedCandidates.every(x =>
        x.contact_ready === false &&
        x.outreach_allowed === false
      )
  },

  final_access_gate: {
    client_access_allowed:
      false,

    reason:
      "Client access remains blocked until source validation, contact-route validation, and manual visual review produce approved contact-ready targets.",

    required_before_access: [
      "validated_source_imports",
      "validated_contact_routes",
      "manual_review_approvals",
      "final_contact_ready_targets",
      "founder_visual_confirmation"
    ]
  }
};

audit.pass =
  Object.values(audit.file_integrity).every(Boolean) &&
  audit.population_integrity.original_total === 1334 &&
  audit.population_integrity.quarantined === 697 &&
  audit.population_integrity.retained_candidates === 637 &&
  audit.population_integrity.visual_rows === 637 &&
  audit.population_integrity.blocked_candidates === 637 &&
  audit.population_integrity.contact_ready === 0 &&
  audit.visual_gate_integrity.visual_manifest_present &&
  audit.visual_gate_integrity.all_visual_rows_pending_or_reviewed &&
  audit.visual_gate_integrity.all_rows_have_names &&
  audit.visual_gate_integrity.all_rows_have_region &&
  audit.visual_gate_integrity.all_rows_have_contact_flags &&
  audit.visual_gate_integrity.visual_review_required_before_client_access &&
  audit.contact_ready_integrity.no_contact_ready_without_source &&
  audit.contact_ready_integrity.no_contact_ready_without_contact_route &&
  audit.contact_ready_integrity.no_contact_ready_without_manual_review &&
  audit.contact_ready_integrity.all_contact_ready_outreach_allowed &&
  audit.blocked_integrity.all_blocked_not_contact_ready &&
  audit.blocked_integrity.all_blocked_not_outreach_allowed &&
  audit.blocked_integrity.all_quarantined_hidden_from_contact &&
  audit.blocked_integrity.all_verified_candidates_not_auto_promoted &&
  audit.final_access_gate.client_access_allowed === false;

const visualGate = {
  version:
    "black_dragon_final_visual_review_gate_v1_batch_093",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  client_access_allowed:
    false,

  contact_ready_targets:
    contactReady.length,

  pending_visual_review:
    visualRows.filter(x => x.reviewer_decision === "PENDING").length,

  blocked_candidates:
    blocked.length,

  quarantined_entities:
    quarantined.length,

  founder_required_action:
    "Complete visual review and approve only entities with official source, verified contact route, and exact organization/region match.",

  hard_blocks: [
    "NO_BLACK_DRAGON_ACCESS",
    "NO_UNVERIFIED_CONTACTS",
    "NO_SYNTHETIC_PLACEHOLDER_CONTACTS",
    "NO_AUTO_PROMOTION",
    "NO_OUTREACH_WITHOUT_MANUAL_APPROVAL"
  ]
};

const checkpoint = {
  checkpoint:
    "BLACK_DRAGON_FINAL_CONTACT_READY_VISUAL_GATE",

  generated_at:
    new Date().toISOString(),

  pass:
    audit.pass,

  client_access_allowed:
    false,

  summary: {
    original_total:
      audit.population_integrity.original_total,

    quarantined:
      audit.population_integrity.quarantined,

    retained_candidates:
      audit.population_integrity.retained_candidates,

    visual_rows:
      audit.population_integrity.visual_rows,

    blocked_candidates:
      audit.population_integrity.blocked_candidates,

    contact_ready:
      audit.population_integrity.contact_ready
  },

  next_required_phase:
    "REAL_SOURCE_AND_CONTACT_IMPORT_PLUS_MANUAL_VISUAL_APPROVAL"
};

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/final_contact_ready/audit/batch_093_final_contact_ready_visual_gate_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/final_contact_ready/visual/final_visual_review_gate.v1.json"
  ),
  JSON.stringify(visualGate, null, 2)
);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/final_contact_ready/checkpoint/batch_093_final_contact_ready_checkpoint.json"
  ),
  JSON.stringify(checkpoint, null, 2)
);

console.log(JSON.stringify({
  status:
    "BATCH_093_FINAL_CONTACT_READY_VISUAL_GATE_COMPLETE",

  pass:
    audit.pass,

  client_access_allowed:
    false,

  summary:
    checkpoint.summary,

  checkpoint:
    "public/data/clients/black_dragon/authentication/final_contact_ready/checkpoint/batch_093_final_contact_ready_checkpoint.json"
}, null, 2));

if (!audit.pass) process.exit(1);
