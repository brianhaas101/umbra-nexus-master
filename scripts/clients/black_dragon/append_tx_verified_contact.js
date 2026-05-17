const fs=require("fs");
const path=require("path");

const PATCH="public/data/clients/black_dragon/state_candidates/tx_verified_contact_patch.json";
const QUEUE="public/data/clients/black_dragon/state_candidates/tx_manual_verification_queue.json";
const OUT="public/data/clients/black_dragon/state_candidates/tx_verified_contacts.json";

function read(p,f=null){if(!fs.existsSync(p))return f;return JSON.parse(fs.readFileSync(p,"utf8"));}
function write(p,d){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2));}
function clean(v){return v==null?"":String(v).trim();}
function validPhone(v){const d=clean(v).replace(/\D/g,"");return d.length===10 && !/^(\d)\1{9}$/.test(d) && !["9999999999","0000000000"].includes(d);}

function errors(p){
  const e=[];
  if(!clean(p.queue_id))e.push("missing queue_id");
  if(!clean(p.agency_name))e.push("missing agency_name");
  if(clean(p.state)!=="TX")e.push("state must be TX");
  if(!clean(p.city))e.push("missing city");
  if(!clean(p.verified_contact?.department))e.push("missing department");
  if(!validPhone(p.verified_contact?.phone))e.push("invalid phone");
  if(!clean(p.verified_contact?.source_url))e.push("missing source_url");
  if(!clean(p.contact_path?.primary_route))e.push("missing primary_route");
  if(p.validation?.phone_valid!==true)e.push("phone_valid must be true");
  if(p.validation?.role_valid!==true)e.push("role_valid must be true");
  if(p.validation?.source_verified!==true)e.push("source_verified must be true");
  if(p.validation?.meets_strict_contact_rules!==true)e.push("meets_strict_contact_rules must be true");
  return e;
}

const patch=read(PATCH,null);
if(!patch){console.error("[TX APPEND] Missing patch");process.exit(1);}

const queue=read(QUEUE,{targets:[]});
const match=(queue.targets||[]).find(t=>t.queue_id===patch.queue_id);
if(!match){console.error("[TX APPEND] queue_id not found",patch.queue_id);process.exit(1);}
if(match.agency_name!==patch.agency_name){console.error("[TX APPEND] agency mismatch");console.error(match.agency_name);console.error(patch.agency_name);process.exit(1);}

const err=errors(patch);
if(err.length){console.error("[TX APPEND] BLOCKED");err.forEach(x=>console.error("-",x));process.exit(1);}

const store=read(OUT,{version:"black_dragon_tx_verified_contacts_v1",generated_at:new Date().toISOString(),state:"TX",contacts:[]});
const idx=store.contacts.findIndex(c=>c.queue_id===patch.queue_id||c.agency_name===patch.agency_name);
if(idx>=0){store.contacts[idx]=patch;console.log("[TX APPEND] UPDATED:",patch.agency_name);}
else{store.contacts.push(patch);console.log("[TX APPEND] ADDED:",patch.agency_name);}
store.updated_at=new Date().toISOString();
write(OUT,store);
console.log("[TX APPEND] Total TX verified:",store.contacts.length);
