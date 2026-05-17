const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = "C:/Dev/Nexus_MASTER";

const INPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_live_account.clean.json"
);

const OUTPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_pass3_expanded_targets.json"
);

function readJson(file) {
  let raw = fs.readFileSync(file, "utf8");
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  return JSON.parse(raw);
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function clean(v) {
  return String(v ?? "").replace(/\s+/g, " ").trim();
}

function hash8(value) {
  return crypto.createHash("md5").update(String(value)).digest("hex").slice(0, 8);
}

function stableEntityId(name, city, state) {
  return "bd_exp_" + hash8(`${name}|${city}|${state}`);
}

function makeDossier({ name, city, state, agencyClass, contactRole, angle, expectedValue }) {
  return {
    dossier_type: "black_dragon_agency_target",
    agency_class: agencyClass,
    priority_summary: `Relevant ${agencyClass.replace(/_/g, " ")} target for Black Dragon training outreach in ${city}, ${state}.`,
    recommended_contact: contactRole,
    outreach_angle: angle,
    confidence: 0.62,
    expected_value: expectedValue,
    live_outreach_allowed: false,
    verified: false,
    verification_status: "required",
    review_status: "client_dossier_review_required",
    recommended_next_step: "Verify public contact route, confirm the correct training or administrative contact, then prepare first outreach.",
    risk_notes: [
      "Expanded target generated from city-level coverage model. Verify official contact details before outreach."
    ]
  };
}

function targetTemplates(city, state) {
  return [
    {
      suffix: "Police Department",
      agencyClass: "police_department",
      contactRole: "training coordinator / command staff / public information officer",
      angle: "law enforcement motorcycle club culture training and officer awareness",
      expectedValue: "High-value first-wave opportunity."
    },
    {
      suffix: "County Sheriff Office",
      agencyClass: "sheriff_office",
      contactRole: "sheriff office administration / training coordinator / command staff",
      angle: "county-level public safety training and motorcycle club intelligence awareness",
      expectedValue: "High-value county training opportunity."
    },
    {
      suffix: "Municipal Court",
      agencyClass: "court_system",
      contactRole: "court administrator / clerk administration",
      angle: "court-adjacent education and justice-system awareness",
      expectedValue: "Viable second-wave opportunity."
    },
    {
      suffix: "City Prosecutor Office",
      agencyClass: "prosecutor_office",
      contactRole: "city prosecutor administration / public information contact",
      angle: "prosecutor education, case-awareness, and justice-system training support",
      expectedValue: "Viable justice-system routing opportunity."
    },
    {
      suffix: "Public Safety Department",
      agencyClass: "public_safety_agency",
      contactRole: "public safety director / training coordinator / command staff",
      angle: "multi-agency public safety training and interdepartmental awareness",
      expectedValue: "Strong institutional training opportunity."
    },
    {
      suffix: "Community College Police",
      agencyClass: "campus_police",
      contactRole: "campus police administration / training coordinator",
      angle: "campus safety training and motorcycle club culture awareness",
      expectedValue: "Niche but credible training opportunity."
    },
    {
      suffix: "Gang / Violent Crime Unit",
      agencyClass: "specialized_unit",
      contactRole: "unit supervisor / investigations commander / training coordinator",
      angle: "gang intelligence, motorcycle club dynamics, and street-level officer awareness",
      expectedValue: "High-relevance specialist opportunity."
    },
    {
      suffix: "Narcotics / Organized Crime Unit",
      agencyClass: "specialized_unit",
      contactRole: "unit supervisor / investigations commander / training coordinator",
      angle: "organized crime training with motorcycle club culture relevance",
      expectedValue: "High-relevance specialist opportunity."
    },
    {
      suffix: "Regional Task Force",
      agencyClass: "task_force",
      contactRole: "task force commander / operations contact / training coordinator",
      angle: "regional interagency training and threat-culture awareness",
      expectedValue: "Strong multi-agency leverage opportunity."
    },
    {
      suffix: "Law Enforcement Training Division",
      agencyClass: "training_division",
      contactRole: "training division coordinator / academy contact",
      angle: "direct training curriculum fit for law enforcement education",
      expectedValue: "Best-fit training buyer opportunity."
    }
  ];
}

function jitter(base, key, spread) {
  const h = parseInt(hash8(key), 16) / 0xffffffff;
  return Number((Number(base) + ((h - 0.5) * spread)).toFixed(6));
}

function makeExpandedTarget(shell, template) {
  const city = clean(shell.location?.city || shell.name);
  const state = clean(shell.location?.state || shell.location?.region);
  const name = `${city.toUpperCase()} ${template.suffix.toUpperCase()}`;
  const entity_id = stableEntityId(name, city, state);

  const lat = jitter(shell.location?.lat || shell.lat, entity_id + "|lat", 0.05);
  const lon = jitter(shell.location?.lon || shell.lon, entity_id + "|lon", 0.05);

  return {
    entity_id,
    entity_type: "entity",
    agency_name: name,
    name,
    city,
    state,
    lat,
    lon,
    location: {
      city,
      region: state,
      state,
      country: "US",
      lat,
      lon
    },
    scores: {
      umbraScore:
        template.agencyClass === "training_division" ? 86 :
        template.agencyClass === "task_force" ? 84 :
        template.agencyClass === "police_department" ? 82 :
        template.agencyClass === "sheriff_office" ? 80 :
        72,
      founderScore: null,
      confidence: 0.62
    },
    tags: [
      "black_dragon",
      "pass3_expanded",
      template.agencyClass,
      state.toLowerCase()
    ],
    sources: [
      {
        type: "modeled_expansion",
        name: "Black Dragon Pass 3 city coverage expansion",
        ref: `BD-P3-${entity_id}`,
        confidence: 0.62
      }
    ],
    black_dragon_dossier: makeDossier({
      name,
      city,
      state,
      agencyClass: template.agencyClass,
      contactRole: template.contactRole,
      angle: template.angle,
      expectedValue: template.expectedValue
    }),
    _live_account_source: "black_dragon_pass3_expanded_target",
    _pass3: {
      generated: true,
      verification_required: true,
      source_basis: "city_shell_coverage_model"
    }
  };
}

function key(row) {
  const loc = row.location || {};
  return [
    clean(row.name || row.agency_name).toUpperCase(),
    clean(row.city || loc.city).toUpperCase(),
    clean(row.state || loc.state || loc.region).toUpperCase()
  ].join("|");
}

function main() {
  console.log("[BD PASS 3 EXPAND] Starting...");

  if (!fs.existsSync(INPUT)) {
    console.error("[BD PASS 3 EXPAND] Missing input:", INPUT);
    process.exit(1);
  }

  const input = readJson(INPUT);
  const rows = Array.isArray(input.targets) ? input.targets : [];

  const cityShells = rows.filter(r =>
    r.entity_type === "city_shell" ||
    r._live_account_source === "satellite_city_shell"
  );

  const existingTargets = rows.filter(r =>
    r.black_dragon_dossier &&
    r._live_account_source !== "satellite_city_shell"
  );

  const seen = new Set(existingTargets.map(key));
  const expanded = [];

  for (const shell of cityShells) {
    const city = clean(shell.location?.city || shell.name);
    const state = clean(shell.location?.state || shell.location?.region);

    if (!city || !state) continue;

    for (const template of targetTemplates(city, state)) {
      const candidate = makeExpandedTarget(shell, template);
      const k = key(candidate);
      if (seen.has(k)) continue;
      seen.add(k);
      expanded.push(candidate);
    }
  }

  const allTargets = [
    ...cityShells,
    ...existingTargets,
    ...expanded
  ];

  const output = {
    source: "black_dragon_pass3_mass_expansion",
    generated_at: new Date().toISOString(),
    note: "Pass 3 expands Black Dragon coverage across all satellite city shells. Expanded targets are model-generated and require verification before live outreach.",
    city_shell_count: cityShells.length,
    existing_black_dragon_targets: existingTargets.length,
    expanded_targets: expanded.length,
    total_count: allTargets.length,
    verification_required_count: expanded.length,
    targets: allTargets
  };

  writeJson(OUTPUT, output);

  console.log("[BD PASS 3 EXPAND] City shells:", cityShells.length);
  console.log("[BD PASS 3 EXPAND] Existing BD targets:", existingTargets.length);
  console.log("[BD PASS 3 EXPAND] Expanded targets:", expanded.length);
  console.log("[BD PASS 3 EXPAND] Total:", allTargets.length);
  console.log("[BD PASS 3 EXPAND] Output:", OUTPUT);
}

main();
