const fs = require("fs");
const path = require("path");

const REG = "public/data/clients/black_dragon/black_dragon_50_state_source_registry.json";
const OUT = "public/data/clients/black_dragon/state_candidates/tx_candidate_agencies.json";
const CACHE = "public/data/clients/black_dragon/source_cache/states/tx";

function cleanText(v){
  return String(v||"")
    .replace(/<script[\s\S]*?<\/script>/gi," ")
    .replace(/<style[\s\S]*?<\/style>/gi," ")
    .replace(/<[^>]+>/g,"\n")
    .replace(/&nbsp;/gi," ")
    .replace(/&amp;/gi,"&")
    .replace(/\r/g,"\n")
    .replace(/[ \t]+/g," ")
    .replace(/\n+/g,"\n")
    .trim();
}

function allowed(name){
  const n=String(name||"").toUpperCase();
  if(n.length<8||n.length>120)return false;
  if(n.includes("ONLINE")||n.includes("ACADEMY ONLY"))return false;
  return n.includes("POLICE")||n.includes("SHERIFF")||n.includes("PUBLIC SAFETY")||n.includes("CONSTABLE");
}

async function main(){
  const reg=JSON.parse(fs.readFileSync(REG,"utf8"));
  const tx=reg.states.find(s=>s.state_code==="TX");
  const candidates=[];
  const seen=new Set();
  const reports=[];

  fs.mkdirSync(CACHE,{recursive:true});

  for(const src of tx.sources||[]){
    const report={source_url:src.url,status:null,candidates:0,error:null};
    try{
      const res=await fetch(src.url,{headers:{"User-Agent":"Umbra-Nexus-TX-Connector/1.0"}});
      report.status=res.status;
      const html=await res.text();
      fs.writeFileSync(path.join(CACHE,src.type+".html"),html);

      if(!res.ok){ report.error="HTTP "+res.status; reports.push(report); continue; }

      const lines=cleanText(html).split("\n").map(x=>x.trim()).filter(Boolean);

      for(const line of lines){
        const name=line.replace(/\s+/g," ").trim();
        if(!allowed(name))continue;
        const key=name.toUpperCase();
        if(seen.has(key))continue;
        seen.add(key);

        candidates.push({
          state:"TX",
          agency_name:name,
          source_url:src.url,
          source_type:src.type,
          status:"CANDIDATE_REVIEW_REQUIRED",
          contact_status:"NOT_VERIFIED",
          outreach_allowed:false,
          notes:"Extracted from official TCOLE training provider region page. Manual verification required before contact use."
        });
        report.candidates++;
      }
    }catch(e){
      report.error=e.message;
    }
    reports.push(report);
  }

  const out={
    version:"black_dragon_tx_candidate_agencies_v1",
    generated_at:new Date().toISOString(),
    state:"TX",
    source:"TCOLE training provider region pages",
    total_sources:(tx.sources||[]).length,
    total_candidates:candidates.length,
    reports,
    candidates
  };

  fs.mkdirSync(path.dirname(OUT),{recursive:true});
  fs.writeFileSync(OUT,JSON.stringify(out,null,2));

  console.log("[TX CONNECTOR] COMPLETE");
  console.log("[TX CONNECTOR] Sources:",out.total_sources);
  console.log("[TX CONNECTOR] Candidates:",out.total_candidates);
}
main().catch(e=>{console.error("[TX CONNECTOR] FAILED",e);process.exit(1);});
