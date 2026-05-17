const fs=require("fs");
const path=require("path");

const OUT="public/data/clients/black_dragon/national_state_expansion_audit.json";

function read(p,fallback=null){if(!fs.existsSync(p))return fallback;return JSON.parse(fs.readFileSync(p,"utf8"));}

const ca=read("public/data/clients/black_dragon/state_candidates/ca_review_shortlist.json",{total_review_candidates:0,targets:[]});
const tx=read("public/data/clients/black_dragon/state_candidates/tx_review_shortlist.json",{total_review_candidates:0,targets:[]});
const national=read("public/data/clients/black_dragon/national_verified_outreach_shortlist.json",{targets:[]});

const audit={
  version:"black_dragon_national_state_expansion_audit_v1",
  generated_at:new Date().toISOString(),
  states:{
    AZ:{verified_contacts:10,status:"VERIFIED_LAUNCH_BATCH"},
    CA:{review_candidates:ca.total_review_candidates,queue_targets:ca.targets.length,status:"CANDIDATE_AND_QUEUE_ACTIVE"},
    TX:{review_candidates:tx.total_review_candidates,queue_targets:tx.targets.length,status:tx.targets.length>0?"CANDIDATE_AND_QUEUE_ACTIVE":"REVIEW_REQUIRED"}
  },
  national_verified_targets:national.targets.length,
  next_required:[
    "Verify 9 more CA contacts.",
    "Verify first 10 TX contacts.",
    "Build FL connector.",
    "Build GA connector."
  ]
};

fs.mkdirSync(path.dirname(OUT),{recursive:true});
fs.writeFileSync(OUT,JSON.stringify(audit,null,2));
console.log("[NATIONAL EXPANSION AUDIT] COMPLETE");
console.log("[NATIONAL EXPANSION AUDIT] TX queue:",audit.states.TX.queue_targets);
