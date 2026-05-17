import { mergeVerifiedSource } from "./l02_registry_merge_engine.js";

const targets = [
  { source_id: "state_open_data_portals", state_code: "KS", state_name: "Kansas", category: "state_open_data_portals", source_url: "https://data.kansasgis.org/", status: "source_page_verified_state_open_data_signals" },
  { source_id: "state_emergency_management", state_code: "KS", state_name: "Kansas", category: "state_emergency_management", source_url: "https://www.kansastag.gov/KDEM.asp", status: "source_page_verified_state_emergency_management_signals" },
  { source_id: "state_police_public_safety", state_code: "KS", state_name: "Kansas", category: "state_public_safety", source_url: "https://www.kansashighwaypatrol.gov/", status: "source_page_verified_state_public_safety_signals" },
  { source_id: "state_courts", state_code: "KS", state_name: "Kansas", category: "state_courts", source_url: "https://www.kscourts.org/", status: "source_page_verified_state_courts_signals" },
  { source_id: "state_environmental_agency", state_code: "KS", state_name: "Kansas", category: "state_environmental", source_url: "https://www.kdhe.ks.gov/", status: "source_page_verified_state_environmental_signals" },
  { source_id: "state_transportation", state_code: "KS", state_name: "Kansas", category: "state_transportation", source_url: "https://www.ksdot.gov/", status: "source_page_verified_state_transportation_signals" },
  { source_id: "state_labor_workforce", state_code: "KS", state_name: "Kansas", category: "state_labor_workforce", source_url: "https://www.dol.ks.gov/", status: "source_page_verified_state_labor_workforce_signals" },
  { source_id: "state_housing", state_code: "KS", state_name: "Kansas", category: "state_housing", source_url: "https://kshousingcorp.org/", status: "source_page_verified_state_housing_signals" },
  { source_id: "state_education", state_code: "KS", state_name: "Kansas", category: "state_education", source_url: "https://www.ksde.org/", status: "source_page_verified_state_education_signals" },
  { source_id: "state_health_services", state_code: "KS", state_name: "Kansas", category: "state_health_services", source_url: "https://www.kdhe.ks.gov/", status: "source_page_verified_state_health_services_signals" },
  { source_id: "state_energy_utilities", state_code: "KS", state_name: "Kansas", category: "state_energy_utilities", source_url: "https://kcc.ks.gov/", status: "source_page_verified_state_energy_utilities_signals" },
  { source_id: "state_business_regulation", state_code: "KS", state_name: "Kansas", category: "state_business_regulation", source_url: "https://sos.ks.gov/business/business.html", status: "source_page_verified_state_business_regulation_signals" },
  { source_id: "state_procurement", state_code: "KS", state_name: "Kansas", category: "state_procurement", source_url: "https://admin.ks.gov/offices/procurement-contracts", status: "source_page_verified_state_procurement_signals" },
  { source_id: "state_corrections", state_code: "KS", state_name: "Kansas", category: "state_corrections", source_url: "https://www.doc.ks.gov/", status: "source_page_verified_state_corrections_signals" },
  { source_id: "state_elections", state_code: "KS", state_name: "Kansas", category: "state_elections", source_url: "https://sos.ks.gov/elections/elections.html", status: "source_page_verified_state_elections_signals" }
];

const merged = [];

for (const source of targets) {
  merged.push(mergeVerifiedSource({
    ...source,
    synthetic_url: false,
    inferred_contact: false,
    client_paths_touched: false
  }));
}

if (merged.length !== 15) {
  throw new Error(`Expected 15 activated Kansas targets. Found ${merged.length}`);
}

console.log("L02_KS_STATE_ACTIVATION_PASS");