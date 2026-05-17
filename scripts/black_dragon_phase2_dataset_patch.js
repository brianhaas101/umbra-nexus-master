const fs = require("fs");
const path = require("path");

const file = path.resolve(
  "C:/Dev/Nexus_MASTER/public/data/clients/black_dragon/black_dragon_leads_master.json"
);

const backup = file.replace(".json", `.backup_${Date.now()}.json`);

const cityMap = {
  AZ: { city: "Phoenix", city_id: "city_az_phoenix", lat: 33.4484, lon: -112.074 },
  CA: { city: "Los Angeles", city_id: "city_ca_los_angeles", lat: 34.0522, lon: -118.2437 },
  TX: { city: "Houston", city_id: "city_tx_houston", lat: 29.7604, lon: -95.3698 },
  NM: { city: "Albuquerque", city_id: "city_nm_albuquerque", lat: 35.0844, lon: -106.6504 },
  OR: { city: "Portland", city_id: "city_or_portland", lat: 45.5152, lon: -122.6784 },
  VA: { city: "Washington Metro", city_id: "city_va_dc_metro", lat: 38.9072, lon: -77.0369 },
  DC: { city: "Washington", city_id: "city_dc_washington", lat: 38.9072, lon: -77.0369 },
  US: { city: "National", city_id: "city_us_national", lat: 39.8283, lon: -98.5795 }
};

function textOf(lead) {
  return [
    lead.agency_name,
    lead.agency_type,
    lead.title,
    lead.source_text,
    ...(lead.signals_summary || [])
  ].join(" ").toLowerCase();
}

function detectSignals(lead) {
  const t = textOf(lead);

  return {
    recent_omg_incident: /outlaw motorcycle|omg|bandidos|hells angels|outlaws motorcycle|rico|racketeering|organized crime crackdown|gang indictment|federal charges/i.test(t),
    task_force_participation: /task force|multi-agency|federal partners|safe streets|joint enforcement|violent crime initiative/i.test(t),
    grant_funding: /grant|funding|cops office|project safe neighborhoods/i.test(t),
    new_or_expanded_unit: /unit|bureau|division|specialized|organized crime|gang enforcement/i.test(t),
    training_demand: /mandatory training|certification requirement|training program expansion|continuing education requirement|reimbursable training/i.test(t),
    law_enforcement_training_authority: /post commission|training division|academy director|training coordinator|training commander|in-service training/i.test(t),
    gang_unit_match: /gang unit|gang enforcement|gang task force|gang violence/i.test(t),
    large_agency: Number(lead.agency_size || 0) >= 300,
    tier_1_state: ["AZ", "CA", "TX", "OR"].includes(lead.state),
    decision_maker_match: /commander|coordinator|program manager|training lead|director/i.test(t),
    association_channel: /iacp|association/i.test(t),
    institutional_buyer: /post|academy|commission|library|criminal justice program|training videos|reimbursable/i.test(t)
  };
}

function outreachAngle(lead, signals) {
  if (signals.recent_omg_incident) {
    return "Reference recent OMG / gang enforcement pressure and position the course as fast, specialized, online training for investigators and command staff.";
  }

  if (signals.law_enforcement_training_authority || signals.training_demand) {
    return "Frame the certification as a scalable online training asset for POST, academy, in-service, or professional development requirements.";
  }

  if (signals.task_force_participation) {
    return "Position the course as standardized training for multi-agency task force members handling gang, organized crime, or violent crime investigations.";
  }

  if (signals.association_channel) {
    return "Position as a training partnership, conference education, or member-resource opportunity for agencies dealing with gang violence.";
  }

  return "Lead with specialized OMG knowledge, low-friction online delivery, and relevance to law enforcement training needs.";
}

const raw = fs.readFileSync(file, "utf8");
const leads = JSON.parse(raw);

fs.writeFileSync(backup, raw);

const updated = leads.map((lead) => {
  const geo = cityMap[lead.state] || cityMap.US;
  const signals = detectSignals(lead);

  return {
    ...lead,
    city: lead.city || geo.city,
    city_id: lead.city_id || geo.city_id,
    lat: lead.lat || geo.lat,
    lon: lead.lon || geo.lon,
    contact_url: lead.contact_url || lead.source_url || "",
    source_refs: lead.source_refs || [
      {
        source_name: lead.source_name || "",
        source_url: lead.source_url || "",
        source_date: lead.source_date || "",
        source_type: "public_source"
      }
    ],
    signals,
    recommended_outreach_angle:
      lead.recommended_outreach_angle || outreachAngle(lead, signals)
  };
});

fs.writeFileSync(file, JSON.stringify(updated, null, 2));

console.log("Black Dragon dataset patched.");
console.log("Backup:", backup);
console.log("Updated:", file);
console.log("Records:", updated.length);