const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const lock = {

  version:
    "black_dragon_automated_outreach_hardlock_v1",

  generated_at:
    new Date().toISOString(),

  policy: {

    automated_email_forbidden:
      true,

    automated_sms_forbidden:
      true,

    automated_dm_forbidden:
      true,

    automated_submission_forbidden:
      true,

    automated_campaigns_forbidden:
      true,

    founder_manual_approval_required:
      true
  },

  enforcement_status:
    "HARDLOCK_ACTIVE"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/audit/013_automated_outreach_hardlock.json"
);

fs.writeFileSync(out, JSON.stringify(lock, null, 2));

console.log(JSON.stringify({
  status:
    "AUTOMATED_OUTREACH_HARDLOCK_COMPLETE",

  enforcement_status:
    lock.enforcement_status,

  output:
    out

}, null, 2));
