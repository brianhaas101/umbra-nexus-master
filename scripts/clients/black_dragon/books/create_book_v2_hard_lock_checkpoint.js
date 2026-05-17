const fs = require("fs");
const path = require("path");

const auditPath = path.resolve(
  "public/data/clients/black_dragon/books/audits/book_v2_final_readiness_audit.json"
);

const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));

const checkpoint = {
  version: "black_dragon_books_v2_hard_lock_checkpoint_v1",
  checkpoint_id: "BLACK_DRAGON_BOOK_SALES_V2_HARD_LOCK",
  generated_at: new Date().toISOString(),

  pass: audit.pass,

  locked_scope: {
    client: "black_dragon",
    phase: "book_sales_v2",
    active_business_model: "motorcycle_club_influence_book_sales",
    expansion_allowed: false,
    course_sales_phase_frozen: true
  },

  completed_capabilities: {
    mc_leader_identification: true,
    organization_type_normalization: true,
    public_target_intake_review: true,
    approved_target_integration: true,
    propagation_scoring: true,
    hot_warm_review_classification: true,
    book_outreach_generation: true,
    outreach_tracking: true,
    client_view_data: true,
    kpi_revenue_estimation: true,
    propagation_chain_tracking: true
  },

  required_next_phase_after_lock: {
    next_phase: "client_ui_connection_or_real_target_population",
    blocked_until_pass_true: true
  },

  audit_summary: {
    totals: audit.totals,
    integrity: audit.integrity,
    business_logic: audit.business_logic
  }
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/checkpoints/black_dragon_books_v2_hard_lock_checkpoint.json"),
  JSON.stringify(checkpoint, null, 2)
);

console.log(JSON.stringify({
  status: checkpoint.pass
    ? "BLACK_DRAGON_BOOK_SALES_V2_HARD_LOCK_CREATED"
    : "BLACK_DRAGON_BOOK_SALES_V2_HARD_LOCK_FAILED",
  checkpoint: "public/data/clients/black_dragon/books/checkpoints/black_dragon_books_v2_hard_lock_checkpoint.json",
  pass: checkpoint.pass
}, null, 2));

if (!checkpoint.pass) process.exit(1);
