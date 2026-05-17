const fs = require("fs");
const path = require("path");

const OUT = "public/data/clients/black_dragon/black_dragon_50_state_source_registry.json";

const states = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],
  ["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],
  ["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
  ["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],
  ["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],
  ["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],
  ["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
  ["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],
  ["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]
];

const verifiedSeed = {
  AZ: {
    status: "ACTIVE_TEMPLATE_STATE",
    note: "Arizona is the validated template state. Manual verified launch batch reached 10 call-ready agencies.",
    source_categories: [
      "state_agency_directory",
      "municipal_police_department_pages",
      "training_unit_pages",
      "official_phone_directories"
    ]
  },
  CA: {
    status: "SOURCE_CACHE_EXISTS_REVIEW_REQUIRED",
    source_categories: ["POST agency source"]
  },
  FL: {
    status: "SOURCE_CACHE_EXISTS_REVIEW_REQUIRED",
    source_categories: ["FDLE agency source"]
  },
  NY: {
    status: "SOURCE_CACHE_EXISTS_REVIEW_REQUIRED",
    source_categories: ["DCJS agency source"]
  }
};

const registry = {
  version: "black_dragon_50_state_source_registry_v1",
  generated_at: new Date().toISOString(),
  client_key: "black_dragon",
  rule: "No state may produce outreach-ready targets until official sources are verified and contact paths are manually confirmed.",
  national_goal: {
    phase_1: "10 verified contacts in AZ",
    phase_2: "10 verified contacts each in 5 priority states",
    phase_3: "verified source coverage for all 50 states",
    phase_4: "10+ verified contacts per state where source quality allows"
  },
  source_requirements_per_state: {
    required_minimum: [
      "official POST/training commission or state law enforcement agency directory",
      "official municipal/county police agency directory",
      "official agency phone/contact page",
      "official training/academy/professional standards page when available"
    ],
    forbidden: [
      "generic scraped emails as final contacts",
      "fake phone numbers",
      "courts/prosecutors unless explicitly relevant",
      "unverified third-party directories as final source of truth"
    ]
  },
  states: states.map(([code, name]) => ({
    state_code: code,
    state_name: name,
    status: verifiedSeed[code]?.status || "QUEUED_SOURCE_VERIFICATION",
    priority: ["AZ","CA","FL","NY","TX","GA","NC","OH","IL","PA"].includes(code) ? "HIGH" : "STANDARD",
    sources: [],
    source_categories: verifiedSeed[code]?.source_categories || [],
    verified_contacts_target: 10,
    verified_contacts_current: code === "AZ" ? 10 : 0,
    notes: verifiedSeed[code]?.note || ""
  }))
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[50 STATE REGISTRY] COMPLETE");
console.log("[50 STATE REGISTRY] States:", registry.states.length);
console.log("[50 STATE REGISTRY] Output:", OUT);
