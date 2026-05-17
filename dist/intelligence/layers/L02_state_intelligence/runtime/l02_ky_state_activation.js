import { mergeVerifiedSource } from "./l02_registry_merge_engine.js";

const targets = [
  { source_id: "state_open_data_portals", state_code: "KY", state_name: "Kentucky", category: "state_open_data_portals", source_url: "https://opengisdata.ky.gov/", status: "source_page_verified_state_open_data_signals" },
  { source_id: "state_emergency_management", state_code: "KY", state_name: "Kentucky", category: "state_emergency_management", source_url: "https://kyem.ky.gov/", status: "source_page_verified_state_emergency_management_signals" },
  { source_id: "state_police_public_safety", state_code: "KY", state_name: "Kentucky", category: "state_public_safety", source_url: "https://kentuckystatepolice.org/", status: "source_page_verified_state_public_safety_signals" },
  { source_id: "state_courts", state_code: "KY", state_name: "Kentucky", category: "state_courts", source_url: "https://kycourts.gov/", status: "source_page_verified_state_courts_signals" },
  { source_id: "state_environmental_agency", state_code: "KY", state_name: "Kentucky", category: "state_environmental", source_url: "https://eec.ky.gov/Environmental-Protection/Pages/default.aspx", status: "source_page_verified_state_environmental_signals" },
  { source_id: "state_transportation", state_code: "KY", state_name: "Kentucky", category: "state_transportation", source_url: "https://transportation.ky.gov/", status: "source_page_verified_state_transportation_signals" },
  { source_id: "state_labor_workforce", state_code: "KY", state_name: "Kentucky", category: "state_labor_workforce", source_url: "https://kcc.ky.gov/", status: "source_page_verified_state_labor_workforce_signals" },
  { source_id: "state_housing", state_code: "KY", state_name: "Kentucky", category: "state_housing", source_url: "https://www.kyhousing.org/", status: "source_page_verified_state_housing_signals" },
  { source_id: "state_education", state_code: "KY", state_name: "Kentucky", category: "state_education", source_url: "https://education.ky.gov/", status: "source_page_verified_state_education_signals" },
  { source_id: "state_health_services", state_code: "KY", state_name: "Kentucky", category: "state_health_services", source_url: "https://www.chfs.ky.gov/", status: "source_page_verified_state_health_services_signals" },
  { source_id: "state_energy_utilities", state_code: "KY", state_name: "Kentucky", category: "state_energy_utilities", source_url: "https://psc.ky.gov/", status: "source_page_verified_state_energy_utilities_signals" },
  { source_id: "state_business_regulation", state_code: "KY", state_name: "Kentucky", category: "state_business_regulation", source_url: "https://sos.ky.gov/bus/Pages/default.aspx", status: "source_page_verified_state_business_regulation_signals" },
  { source_id: "state_procurement", state_code: "KY", state_name: "Kentucky", category: "state_procurement", source_url: "https://finance.ky.gov/services/eprocurement/Pages/default.aspx", status: "source_page_verified_state_procurement_signals" },
  { source_id: "state_corrections", state_code: "KY", state_name: "Kentucky", category: "state_corrections", source_url: "https://corrections.ky.gov/", status: "source_page_verified_state_corrections_signals" },
  { source_id: "state_elections", state_code: "KY", state_name: "Kentucky", category: "state_elections", source_url: "https://elect.ky.gov/", status: "source_page_verified_state_elections_signals" }
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
  throw new Error(`Expected 15 activated Kentucky targets. Found ${merged.length}`);
}

console.log("L02_KY_STATE_ACTIVATION_PASS");