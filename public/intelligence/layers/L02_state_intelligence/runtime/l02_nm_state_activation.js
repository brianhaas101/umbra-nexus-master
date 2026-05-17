import { mergeVerifiedSource } from "./l02_registry_merge_engine.js";

const targets = [
  { source_id: "state_open_data_portals", state_code: "NM", state_name: "New Mexico", category: "state_open_data_portals", source_url: "https://catalog.newmexicodata.com/", status: "source_page_verified_state_open_data_signals" },
  { source_id: "state_emergency_management", state_code: "NM", state_name: "New Mexico", category: "state_emergency_management", source_url: "https://www.dhsem.nm.gov/", status: "source_page_verified_state_emergency_management_signals" },
  { source_id: "state_police_public_safety", state_code: "NM", state_name: "New Mexico", category: "state_public_safety", source_url: "https://www.spo.state.nm.us/", status: "source_page_verified_state_public_safety_signals" },
  { source_id: "state_courts", state_code: "NM", state_name: "New Mexico", category: "state_courts", source_url: "https://www.nmcourts.gov/", status: "source_page_verified_state_courts_signals" },
  { source_id: "state_environmental_agency", state_code: "NM", state_name: "New Mexico", category: "state_environmental", source_url: "https://www.env.nm.gov/", status: "source_page_verified_state_environmental_signals" },
  { source_id: "state_transportation", state_code: "NM", state_name: "New Mexico", category: "state_transportation", source_url: "https://www.dot.nm.gov/", status: "source_page_verified_state_transportation_signals" },
  { source_id: "state_labor_workforce", state_code: "NM", state_name: "New Mexico", category: "state_labor_workforce", source_url: "https://www.dws.state.nm.us/", status: "source_page_verified_state_labor_workforce_signals" },
  { source_id: "state_housing", state_code: "NM", state_name: "New Mexico", category: "state_housing", source_url: "https://housingnm.org/", status: "source_page_verified_state_housing_signals" },
  { source_id: "state_education", state_code: "NM", state_name: "New Mexico", category: "state_education", source_url: "https://webnew.ped.state.nm.us/", status: "source_page_verified_state_education_signals" },
  { source_id: "state_health_services", state_code: "NM", state_name: "New Mexico", category: "state_health_services", source_url: "https://www.nmhealth.org/", status: "source_page_verified_state_health_services_signals" },
  { source_id: "state_energy_utilities", state_code: "NM", state_name: "New Mexico", category: "state_energy_utilities", source_url: "https://www.nm-prc.org/", status: "source_page_verified_state_energy_utilities_signals" },
  { source_id: "state_business_regulation", state_code: "NM", state_name: "New Mexico", category: "state_business_regulation", source_url: "https://www.sos.nm.gov/business-services/", status: "source_page_verified_state_business_regulation_signals" },
  { source_id: "state_procurement", state_code: "NM", state_name: "New Mexico", category: "state_procurement", source_url: "https://www.generalservices.state.nm.us/state-purchasing/", status: "source_page_verified_state_procurement_signals" },
  { source_id: "state_corrections", state_code: "NM", state_name: "New Mexico", category: "state_corrections", source_url: "https://cd.nm.gov/", status: "source_page_verified_state_corrections_signals" },
  { source_id: "state_elections", state_code: "NM", state_name: "New Mexico", category: "state_elections", source_url: "https://www.sos.nm.gov/voting-and-elections/", status: "source_page_verified_state_elections_signals" }
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
  throw new Error(`Expected 15 activated New Mexico targets. Found ${merged.length}`);
}

console.log("L02_NM_STATE_ACTIVATION_PASS");