const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();

const OUTPUT_DIR =
path.join(ROOT,"public/data/intelligence/outputs");

const CONTACT_INPUT =
path.join(
 ROOT,
 "public/data/intelligence/outputs/L10_contact_score_refinement.json"
);

const CONFIDENCE_INPUT =
path.join(
 ROOT,
 "public/data/intelligence/outputs/L10_communication_confidence_weighting.json"
);

const FALLBACK_INPUT =
path.join(
 ROOT,
 "public/data/intelligence/outputs/L10_fallback_route_scoring.json"
);

const OUT =
path.join(
 ROOT,
 "public/data/intelligence/outputs/L10_outreach_readiness_synthesis.json"
);

function read(file){
 if(!fs.existsSync(file)){
  throw new Error("Missing input: " + file);
 }

 return JSON.parse(
  fs.readFileSync(file,"utf8")
 );
}

function hash(v){
 return crypto
  .createHash("sha256")
  .update(String(v))
  .digest("hex")
  .slice(0,16);
}

function clamp(n,min,max){
 return Math.max(min,Math.min(max,n));
}

function mapByEntity(arr){
 const map = new Map();

 for(const item of arr){
  map.set(item.entity_id,item);
 }

 return map;
}

fs.mkdirSync(OUTPUT_DIR,{recursive:true});

const contact =
 read(CONTACT_INPUT);

const confidence =
 read(CONFIDENCE_INPUT);

const fallback =
 read(FALLBACK_INPUT);

const confidenceMap =
 mapByEntity(confidence);

const fallbackMap =
 mapByEntity(fallback);

const synthesis = contact.map(entity=>{

 const conf =
  confidenceMap.get(entity.entity_id) || {};

 const fb =
  fallbackMap.get(entity.entity_id) || {};

 const contactScore =
  Number(entity.contact_score || 0);

 const communicationConfidence =
  Number(conf.communication_confidence || 0);

 const fallbackScore =
  Number(fb.fallback_route_score || 0);

 const readinessScore =
  clamp(
   (
    (contactScore * 0.55) +
    (communicationConfidence * 100 * 0.25) +
    (fallbackScore * 0.20)
   ),
   0,
   100
  );

 const outreachReady =
  readinessScore >= 60;

 return {

  layer_id:"L10",

  entity_id:
   entity.entity_id,

  agency:
   entity.agency || null,

  city:
   entity.city || null,

  outreach_ready:
   outreachReady,

  outreach_readiness_score:
   Number(readinessScore.toFixed(2)),

  outreach_class:
   readinessScore >= 85
    ? "HIGH_PRIORITY"
    : readinessScore >= 60
      ? "READY"
      : readinessScore >= 40
        ? "PARTIAL"
        : "RESEARCH_REQUIRED",

  contact_score:
   contactScore,

  communication_confidence:
   Number(
    communicationConfidence.toFixed(4)
   ),

  fallback_route_score:
   fallbackScore,

  primary_route:
   fb.primary_route || null,

  fallback_routes:
   fb.fallback_routes || [],

  contact:
   entity.contact || {},

  signals:[
   ...(entity.signals || []),
   ...(conf.signals || []),
   ...(fb.signals || []),
   {
    signal_id:
     "sig_" + hash(entity.entity_id + "_outreach_readiness"),

    layer_id:"L10",

    signal_type:
     "outreach_readiness_synthesis",

    value:
     Number(readinessScore.toFixed(2)),

    confidence:
     Number(
      communicationConfidence.toFixed(4)
     )
   }
  ],

  evidence:[
   ...(entity.evidence || []),
   ...(conf.evidence || []),
   ...(fb.evidence || []),
   {
    evidence_id:
     "ev_" + hash(entity.entity_id + "_outreach_readiness"),

    layer_id:"L10",

    evidence_type:
     "derived_outreach_readiness",

    source:
     "L10_outreach_readiness_synthesis"
   }
  ],

  score_components:[
   {
    component:"contact_score",
    value:
     Number((contactScore * 0.55).toFixed(2))
   },
   {
    component:"communication_confidence",
    value:
     Number(
      (communicationConfidence * 100 * 0.25).toFixed(2)
     )
   },
   {
    component:"fallback_route_score",
    value:
     Number((fallbackScore * 0.20).toFixed(2))
   }
  ],

  _source:
   "L10_outreach_readiness_synthesis",

  _version:
   "nexus_L10_outreach_readiness_synthesis_v2"
 };

});

synthesis.sort((a,b)=>{

 if(
  b.outreach_readiness_score !==
  a.outreach_readiness_score
 ){
  return (
   b.outreach_readiness_score -
   a.outreach_readiness_score
  );
 }

 return String(a.entity_id)
  .localeCompare(String(b.entity_id));
});

fs.writeFileSync(
 OUT,
 JSON.stringify(synthesis,null,2)
);

console.log(
 "[L10 OUTREACH READINESS SYNTHESIS] COMPLETE",
 synthesis.length
);

console.log(
 "[L10 OUTREACH READINESS SYNTHESIS] OUTPUT",
 OUT
);
