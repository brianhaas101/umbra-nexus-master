const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();

const INPUT_CONTACT =
path.join(ROOT,
"public/data/intelligence/outputs/L10_contact_score_refinement.json");

const INPUT_CONFIDENCE =
path.join(ROOT,
"public/data/intelligence/outputs/L10_communication_confidence_weighting.json");

const OUT =
path.join(ROOT,
"public/data/intelligence/outputs/L10_fallback_route_scoring.json");

function read(file){
 return JSON.parse(fs.readFileSync(file,"utf8"));
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

const contacts = read(INPUT_CONTACT);
const confidence = read(INPUT_CONFIDENCE);

const confidenceMap = new Map();

for(const c of confidence){
 confidenceMap.set(c.entity_id,c);
}

const out = contacts.map((entity,index)=>{

 const conf =
  confidenceMap.get(entity.entity_id) || {};

 const email =
  entity.contact?.email || null;

 const phone =
  entity.contact?.phone || null;

 const role =
  entity.contact?.role || null;

 let fallback_routes = [];

 if(email){
  fallback_routes.push("email");
 }

 if(phone){
  fallback_routes.push("phone");
 }

 if(role){
  fallback_routes.push("role_chain");
 }

 if(fallback_routes.length === 0){
  fallback_routes.push("manual_research");
 }

 const route_score =
  clamp(
   (
    (email ? 35 : 0) +
    (phone ? 30 : 0) +
    (role ? 20 : 0) +
    ((conf.communication_confidence || 0) * 15)
   ),
   0,
   100
  );

 return {

  layer_id: "L10",

  entity_id: entity.entity_id,

  agency:
   entity.agency ||
   null,

  city:
   entity.city ||
   null,

  fallback_route_score:
   Number(route_score.toFixed(2)),

  communication_confidence:
   conf.communication_confidence || 0,

  fallback_routes,

  primary_route:
   fallback_routes[0],

  route_class:
   route_score >= 80
    ? "DIRECT"
    : route_score >= 55
      ? "PARTIAL"
      : "RESEARCH_REQUIRED",

  signals: [
   {
    signal_id:
     "sig_" + hash(entity.entity_id + "_fallback_route"),

    layer_id:"L10",

    signal_type:
     "fallback_route_scoring",

    value:
     Number(route_score.toFixed(2)),

    confidence:
     conf.communication_confidence || 0
   }
  ],

  evidence:[
   {
    evidence_id:
     "ev_" + hash(entity.entity_id + "_fallback_route"),

    layer_id:"L10",

    evidence_type:
     "derived_fallback_route",

    source:
     "L10_fallback_route_scoring"
   }
  ],

  score_components:[
   {
    component:"email_route",
    value: email ? 35 : 0
   },
   {
    component:"phone_route",
    value: phone ? 30 : 0
   },
   {
    component:"role_route",
    value: role ? 20 : 0
   },
   {
    component:"confidence_weight",
    value:
     Number(
      ((conf.communication_confidence || 0) * 15).toFixed(2)
     )
   }
  ],

  _source:
   "L10_fallback_route_scoring",

  _version:
   "nexus_L10_fallback_route_scoring_v1"
 };

});

fs.writeFileSync(
 OUT,
 JSON.stringify(out,null,2)
);

console.log(
 "[L10 FALLBACK ROUTE SCORING] COMPLETE",
 out.length
);

console.log(
 "[L10 FALLBACK ROUTE SCORING] OUTPUT",
 OUT
);
