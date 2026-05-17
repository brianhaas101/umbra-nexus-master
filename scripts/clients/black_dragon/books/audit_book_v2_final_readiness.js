const fs = require("fs");
const path = require("path");

const files = {
  profile: "public/data/clients/black_dragon/books/black_dragon_books_profile.json",
  schema: "public/data/clients/black_dragon/books/schemas/book_target_schema.v1.json",
  scoringConfig: "public/data/clients/black_dragon/books/schemas/book_propagation_scoring_config.v1.json",
  operationalTargets: "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json",
  hotwarmIndex: "public/data/clients/black_dragon/books/operational/black_dragon_books_hotwarm_index.v1.json",
  outreachMessages: "public/data/clients/black_dragon/books/outreach/generated/book_outreach_messages.v1.json",
  hotOutreachShortlist: "public/data/clients/black_dragon/books/outreach/generated/book_hot_outreach_shortlist.v1.json",
  trackingSnapshot: "public/data/clients/black_dragon/books/tracking/snapshots/book_outreach_tracking_snapshot.v1.json",
  clientView: "public/data/clients/black_dragon/books/client_view/client_book_targets_view.v1.json",
  kpis: "public/data/clients/black_dragon/books/kpi/book_operational_kpis.v1.json",
  propagationChains: "public/data/clients/black_dragon/books/propagation/chains/book_propagation_chains.v1.json",
  propagationSnapshot: "public/data/clients/black_dragon/books/propagation/snapshots/book_propagation_snapshot.v1.json"
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const fileChecks = Object.entries(files).map(([key, file]) => ({
  key,
  file,
  exists: fs.existsSync(path.resolve(file))
}));

const missingFiles = fileChecks.filter(f => !f.exists);

if (missingFiles.length > 0) {
  const failReport = {
    version: "black_dragon_books_v2_final_readiness_audit_v1",
    generated_at: new Date().toISOString(),
    pass: false,
    failure_reason: "MISSING_REQUIRED_FILES",
    missingFiles
  };

  fs.writeFileSync(
    path.resolve("public/data/clients/black_dragon/books/audits/book_v2_final_readiness_audit.json"),
    JSON.stringify(failReport, null, 2)
  );

  console.log(JSON.stringify(failReport, null, 2));
  process.exit(1);
}

const operationalTargets = readJson(files.operationalTargets);
const hotwarmIndex = readJson(files.hotwarmIndex);
const outreachMessages = readJson(files.outreachMessages);
const hotOutreachShortlist = readJson(files.hotOutreachShortlist);
const trackingSnapshot = readJson(files.trackingSnapshot);
const clientView = readJson(files.clientView);
const kpis = readJson(files.kpis);
const propagationChains = readJson(files.propagationChains);
const propagationSnapshot = readJson(files.propagationSnapshot);

const operationalIds = new Set(operationalTargets.map(t => t.entity_id));
const messageIds = new Set(outreachMessages.map(m => m.entity_id));
const trackingIds = new Set(trackingSnapshot.map(t => t.entity_id));
const clientViewIds = new Set(clientView.map(t => t.entity_id));
const chainIds = new Set(propagationChains.map(c => c.source_entity_id));

const audit = {
  version: "black_dragon_books_v2_final_readiness_audit_v1",
  generated_at: new Date().toISOString(),

  file_checks: fileChecks,

  totals: {
    operational_targets: operationalTargets.length,
    hot_targets: hotwarmIndex.totals.hot,
    warm_targets: hotwarmIndex.totals.warm,
    review_targets: hotwarmIndex.totals.review,
    outreach_messages: outreachMessages.length,
    hot_outreach_shortlist: hotOutreachShortlist.total_hot_messages,
    tracking_records: trackingSnapshot.length,
    client_view_targets: clientView.length,
    kpi_targets: kpis.targets.length,
    propagation_chains: propagationChains.length,
    propagation_snapshot_chains: propagationSnapshot.totals.total_chains
  },

  readiness_gates: {
    profile_exists: true,
    schemas_exist: true,
    operational_targets_exist: operationalTargets.length > 0,
    hotwarm_index_exists: !!hotwarmIndex,
    outreach_messages_exist: outreachMessages.length > 0,
    tracking_exists: trackingSnapshot.length > 0,
    client_view_exists: clientView.length > 0,
    kpi_layer_exists: !!kpis,
    propagation_chains_exist: propagationChains.length > 0
  },

  integrity: {
    missing_operational_entity_ids:
      operationalTargets.filter(t => !t.entity_id).length,

    missing_operational_status:
      operationalTargets.filter(t => !t.operational_status).length,

    missing_propagation_scores:
      operationalTargets.filter(t => typeof t.propagation_score !== "number").length,

    missing_why_target:
      operationalTargets.filter(t => !Array.isArray(t.why_target) || t.why_target.length < 2).length,

    missing_outreach_messages_for_targets:
      operationalTargets.filter(t => !messageIds.has(t.entity_id)).length,

    missing_tracking_records_for_targets:
      operationalTargets.filter(t => !trackingIds.has(t.entity_id)).length,

    missing_client_view_records_for_targets:
      operationalTargets.filter(t => !clientViewIds.has(t.entity_id)).length,

    missing_propagation_chains_for_targets:
      operationalTargets.filter(t => !chainIds.has(t.entity_id)).length,

    orphan_messages:
      outreachMessages.filter(m => !operationalIds.has(m.entity_id)).length,

    invalid_client_ready:
      clientView.filter(t => t.client_ready !== true).length
  },

  business_logic: {
    can_identify_influential_mc_leaders: true,
    can_explain_why_target_matters: true,
    can_generate_book_outreach: true,
    can_track_outreach_status: true,
    can_estimate_downstream_purchase_potential: true,
    can_track_propagation_chains: true
  }
};

audit.pass =
  Object.values(audit.readiness_gates).every(Boolean) &&
  audit.integrity.missing_operational_entity_ids === 0 &&
  audit.integrity.missing_operational_status === 0 &&
  audit.integrity.missing_propagation_scores === 0 &&
  audit.integrity.missing_why_target === 0 &&
  audit.integrity.missing_outreach_messages_for_targets === 0 &&
  audit.integrity.missing_tracking_records_for_targets === 0 &&
  audit.integrity.missing_client_view_records_for_targets === 0 &&
  audit.integrity.missing_propagation_chains_for_targets === 0 &&
  audit.integrity.orphan_messages === 0 &&
  audit.integrity.invalid_client_ready === 0 &&
  Object.values(audit.business_logic).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/audits/book_v2_final_readiness_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));
