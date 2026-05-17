const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const quarantined = readJson(
  "public/data/clients/black_dragon/authentication/quarantine/active/quarantined_synthetic_entities.v1.json"
);

const verifiedRuntime = readJson(
  "public/data/clients/black_dragon/authentication/verified_runtime/verified_runtime_candidates.v1.json"
);

const q =
  quarantined.quarantined_entities || [];

const v =
  verifiedRuntime.verified_runtime_candidates || [];

const audit = {
  version:
    "umbra_batch_088_quarantine_synthetic_placeholder_audit_v1",

  generated_at:
    new Date().toISOString(),

  quarantine_integrity: {
    quarantined_count:
      quarantined.totals.quarantined_entities,

    all_quarantined:
      q.every(x =>
        x.quarantine_status === "QUARANTINED"
      ),

    all_hidden_from_contact_workflows:
      q.every(x =>
        x.visible_in_contact_workflows === false
      ),

    all_hidden_from_outreach_workflows:
      q.every(x =>
        x.visible_in_outreach_workflows === false
      ),

    all_hidden_from_verified_runtime:
      q.every(x =>
        x.visible_in_verified_runtime === false
      ),

    all_preserved_for_graph_only:
      q.every(x =>
        x.preserved_for_intelligence_graph_only === true
      ),

    all_require_replacement:
      q.every(x =>
        x.replacement_required === true
      )
  },

  verified_runtime_integrity: {
    retained_count:
      verifiedRuntime.totals.verified_runtime_candidates,

    all_non_quarantined:
      v.every(x =>
        x.quarantine_status === "NOT_QUARANTINED"
      ),

    all_visible_in_verified_runtime:
      v.every(x =>
        x.visible_in_verified_runtime === true
      ),

    outreach_allowed_zero:
      verifiedRuntime.totals.outreach_allowed === 0,

    contact_ready_zero:
      verifiedRuntime.totals.contact_ready === 0
  },

  count_integrity: {
    total_processed:
      quarantined.totals.total_processed,

    total_matches_original:
      quarantined.totals.total_processed === 1334
  }
};

audit.pass =
  audit.quarantine_integrity.quarantined_count > 0 &&
  audit.quarantine_integrity.all_quarantined &&
  audit.quarantine_integrity.all_hidden_from_contact_workflows &&
  audit.quarantine_integrity.all_hidden_from_outreach_workflows &&
  audit.quarantine_integrity.all_hidden_from_verified_runtime &&
  audit.quarantine_integrity.all_preserved_for_graph_only &&
  audit.quarantine_integrity.all_require_replacement &&
  audit.verified_runtime_integrity.retained_count > 0 &&
  audit.verified_runtime_integrity.all_non_quarantined &&
  audit.verified_runtime_integrity.all_visible_in_verified_runtime &&
  audit.verified_runtime_integrity.outreach_allowed_zero &&
  audit.verified_runtime_integrity.contact_ready_zero &&
  audit.count_integrity.total_processed === 1334 &&
  audit.count_integrity.total_matches_original;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/quarantine/audit/batch_088_quarantine_synthetic_placeholder_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
