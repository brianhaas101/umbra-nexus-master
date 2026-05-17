const fs=require("fs");
const path=require("path");

const IN="public/data/clients/black_dragon/state_candidates/tx_candidate_agencies.json";
const OUT="public/data/clients/black_dragon/state_candidates/tx_review_shortlist.json";

function decode(v){
  return String(v||"")
    .replace(/&#039;/g,"'")
    .replace(/&amp;/g,"&")
    .replace(/\s+/g," ")
    .trim();
}

function bad(name){
  const n=String(name||"").toUpperCase();
  if(!n)return true;
  if(n.includes("TEST SITE"))return true;
  if(n.includes("ONLINE"))return true;
  if(n.includes("PRIVATE SECURITY"))return true;
  if(n.includes("FIRE ACADEMY"))return true;
  return false;
}

function score(name){
  const n=String(name||"").toUpperCase();
  let s=0;
  if(n.includes("POLICE ACADEMY"))s+=70;
  if(n.includes("POLICE DEPARTMENT"))s+=60;
  if(n.includes("SHERIFF"))s+=55;
  if(n.includes("LAW ENFORCEMENT ACADEMY"))s+=50;
  if(n.includes("TRAINING"))s+=20;
  if(n.includes("HOUSTON"))s+=25;
  if(n.includes("DALLAS"))s+=25;
  if(n.includes("AUSTIN"))s+=20;
  if(n.includes("SAN ANTONIO"))s+=20;
  if(n.includes("FORT WORTH"))s+=20;
  return s;
}

const input=JSON.parse(fs.readFileSync(IN,"utf8"));
const seen=new Set();
const cleaned=[];

for(const c of input.candidates||[]){
  const agency_name=decode(c.agency_name);
  if(bad(agency_name))continue;
  const key=agency_name.toUpperCase();
  if(seen.has(key))continue;
  seen.add(key);
  cleaned.push({...c,agency_name,review_score:score(agency_name),manual_verification_required:true,outreach_allowed:false});
}

cleaned.sort((a,b)=>b.review_score-a.review_score||a.agency_name.localeCompare(b.agency_name));

const out={
  version:"black_dragon_tx_review_shortlist_v2",
  generated_at:new Date().toISOString(),
  state:"TX",
  total_input:(input.candidates||[]).length,
  total_review_candidates:cleaned.length,
  top_review_batch_size:25,
  rule:"Review shortlist only. No outreach-ready contacts.",
  targets:cleaned.slice(0,25),
  all_review_candidates:cleaned
};

fs.mkdirSync(path.dirname(OUT),{recursive:true});
fs.writeFileSync(OUT,JSON.stringify(out,null,2));
console.log("[TX REVIEW V2] COMPLETE");
console.log("[TX REVIEW V2] Clean:",out.total_review_candidates);
console.log("[TX REVIEW V2] Top:",out.targets.length);
