const fs=require("fs");
const path=require("path");

const IN="public/data/clients/black_dragon/state_candidates/tx_review_shortlist.json";
const OUT="public/data/clients/black_dragon/state_candidates/tx_manual_verification_queue.json";

const input=JSON.parse(fs.readFileSync(IN,"utf8"));

const queue={
  version:"black_dragon_tx_manual_verification_queue_v1",
  generated_at:new Date().toISOString(),
  state:"TX",
  source:IN,
  rule:"Manual official-source verification required before any TX target becomes outreach-ready.",
  total_queue:input.targets.length,
  targets:input.targets.map((t,i)=>({
    queue_id:`TX-VERIFY-${String(i+1).padStart(3,"0")}`,
    agency_name:t.agency_name,
    state:"TX",
    source_url:t.source_url,
    review_score:t.review_score,
    verification_needed:[
      "official agency contact page",
      "training/professional standards/academy path if available",
      "valid phone routing path",
      "no guessed email"
    ],
    status:"NEEDS_MANUAL_VERIFICATION",
    verified_contact_patch_ready:false,
    notes:""
  }))
};

fs.mkdirSync(path.dirname(OUT),{recursive:true});
fs.writeFileSync(OUT,JSON.stringify(queue,null,2));
console.log("[TX VERIFY QUEUE] COMPLETE");
console.log("[TX VERIFY QUEUE] Targets:",queue.total_queue);
