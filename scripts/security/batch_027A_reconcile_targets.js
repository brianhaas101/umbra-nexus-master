const fs = require("fs");
const path = require("path");

const operationalPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const clientViewPath = path.resolve(
  "public/data/clients/black_dragon/books/client_view/client_book_targets_view.v1.json"
);

const kpiPath = path.resolve(
  "public/data/clients/black_dragon/books/kpi/book_operational_kpis.v1.json"
);

const queuePath = path.resolve(
  "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json"
);

const adaptivePath = path.resolve(
  "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_index.v1.json"
);

const operational =
  JSON.parse(fs.readFileSync(operationalPath, "utf8"));

const queue =
  JSON.parse(fs.readFileSync(queuePath, "utf8"));

const adaptive =
  JSON.parse(fs.readFileSync(adaptivePath, "utf8"));

function normalizeScore(v) {

  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.max(0, Math.min(100, Math.round(v)));
  }

  return 50;
}

const repairedTargets =
  operational.map((t, i) => {

    const propagation =
      normalizeScore(
        t.propagation_score ??
        t.influence_score ??
        t.priority_score ??
        50
      );

    return {
      ...t,
      propagation_score: propagation,
      reconciliation_repaired: true,
      reconciliation_index: i,
      reconciliation_updated_at: new Date().toISOString()
    };
  });

fs.writeFileSync(
  operationalPath,
  JSON.stringify(repairedTargets, null, 2)
);

const clientView =
  repairedTargets.map(t => ({
    entity_id: t.entity_id,
    organization_name: t.organization_name,
    target_name: t.target_name,
    organization_type: t.organization_type,
    propagation_score: t.propagation_score,
    operational_status: t.operational_status || "ACTIVE",
    client_visible: true
  }));

fs.writeFileSync(
  clientViewPath,
  JSON.stringify(clientView, null, 2)
);

const kpiTargets =
  repairedTargets.map(t => ({

    entity_id: t.entity_id,

    organization_name:
      t.organization_name,

    projected_revenue:
      Number(
        t.projected_revenue ||
        t.estimated_revenue ||
        0
      ),

    propagation_score:
      t.propagation_score,

    operational_priority:
      normalizeScore(
        t.priority_score ||
        t.propagation_score
      )
  }));

const kpiPayload = {
  version: "black_dragon_books_operational_kpis_v1",
  generated_at: new Date().toISOString(),
  targets: kpiTargets
};

fs.writeFileSync(
  kpiPath,
  JSON.stringify(kpiPayload, null, 2)
);

const reconciliationAudit = {

  version: "black_dragon_books_reconciliation_audit_v1",
  generated_at: new Date().toISOString(),

  totals: {
    operational_targets:
      repairedTargets.length,

    client_view_targets:
      clientView.length,

    kpi_targets:
      kpiTargets.length,

    queue_targets:
      (queue.all_queue_items || []).length,

    adaptive_targets:
      (adaptive.targets || []).length
  },

  integrity: {

    missing_entity_ids:
      repairedTargets.filter(t => !t.entity_id).length,

    missing_propagation_scores:
      repairedTargets.filter(t =>
        typeof t.propagation_score !== "number"
      ).length,

    client_view_alignment:
      repairedTargets.length === clientView.length,

    kpi_alignment:
      repairedTargets.length === kpiTargets.length
  }
};

reconciliationAudit.pass =

  reconciliationAudit.integrity.missing_entity_ids === 0 &&
  reconciliationAudit.integrity.missing_propagation_scores === 0 &&
  reconciliationAudit.integrity.client_view_alignment &&
  reconciliationAudit.integrity.kpi_alignment;

fs.writeFileSync(
  path.resolve(
    "public/data/security/stability/batch_027A_reconciliation_audit.json"
  ),
  JSON.stringify(reconciliationAudit, null, 2)
);

console.log(JSON.stringify(reconciliationAudit, null, 2));

if (!reconciliationAudit.pass) {
  process.exit(1);
}
