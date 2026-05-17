import { mergeVerifiedSource } from "./l02_registry_merge_engine.js";

const targets = [
  { source_id: "state_open_data_portals", state_code: "MA", state_name: "Massachusetts", category: "state_open_data_portals", source_url: "https://www.mass.gov/info-details/open-data-and-public-records", status: "source_page_verified_state_open_data_signals" },
  { source_id: "state_emergency_management", state_code: "MA", state_name: "Massachusetts", category: "state_emergency_management", source_url: "https://www.mass.gov/orgs/massachusetts-emergency-management-agency", status: "source_page_verified_state_emergency_management_signals" },
  { source_id: "state_police_public_safety", state_code: "MA", state_name: "Massachusetts", category: "state_public_safety", source_url: "https://www.mass.gov/orgs/massachusetts-state-police", status: "source_page_verified_state_public_safety_signals" },
  { source_id: "state_courts", state_code: "MA", state_name: "Massachusetts", category: "state_courts", source_url: "https://www.mass.gov/orgs/massachusetts-court-system", status: "source_page_verified_state_courts_signals" },
  { source_id: "state_environmental_agency", state_code: "MA", state_name: "Massachusetts", category: "state_environmental", source_url: "https://www.mass.gov/orgs/massachusetts-department-of-environmental-protection", status: "source_page_verified_state_environmental_signals" },
  { source_id: "state_transportation", state_code: "MA", state_name: "Massachusetts", category: "state_transportation", source_url: "https://www.mass.gov/orgs/massachusetts-department-of-transportation", status: "source_page_verified_state_transportation_signals" },
  { source_id: "state_labor_workforce", state_code: "MA", state_name: "Massachusetts", category: "state_labor_workforce", source_url: "https://www.mass.gov/orgs/executive-office-of-labor-and-workforce-development", status: "source_page_verified_state_labor_workforce_signals" },
  { source_id: "state_housing", state_code: "MA", state_name: "Massachusetts", category: "state_housing", source_url: "https://www.mass.gov/orgs/executive-office-of-housing-and-livable-communities", status: "source_page_verified_state_housing_signals" },
  { source_id: "state_education", state_code: "MA", state_name: "Massachusetts", category: "state_education", source_url: "https://www.doe.mass.edu/", status: "source_page_verified_state_education_signals" },
  { source_id: "state_health_services", state_code: "MA", state_name: "Massachusetts", category: "state_health_services", source_url: "https://www.mass.gov/orgs/department-of-public-health", status: "source_page_verified_state_health_services_signals" },
  { source_id: "state_energy_utilities", state_code: "MA", state_name: "Massachusetts", category: "state_energy_utilities", source_url: "https://www.mass.gov/orgs/department-of-public-utilities", status: "source_page_verified_state_energy_utilities_signals" },
  { source_id: "state_business_regulation", state_code: "MA", state_name: "Massachusetts", category: "state_business_regulation", source_url: "https://www.sec.state.ma.us/divisions/corporations/corporations.htm", status: "source_page_verified_state_business_regulation_signals" },
  { source_id: "state_procurement", state_code: "MA", state_name: "Massachusetts", category: "state_procurement", source_url: "https://www.mass.gov/orgs/operational-services-division", status: "source_page_verified_state_procurement_signals" },
  { source_id: "state_corrections", state_code: "MA", state_name: "Massachusetts", category: "state_corrections", source_url: "https://www.mass.gov/orgs/massachusetts-department-of-correction", status: "source_page_verified_state_corrections_signals" },
  { source_id: "state_elections", state_code: "MA", state_name: "Massachusetts", category: "state_elections", source_url: "https://www.sec.state.ma.us/divisions/elections/elections-and-voting.htm", status: "source_page_verified_state_elections_signals" }
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
  throw new Error(`Expected 15 activated Massachusetts targets. Found ${merged.length}`);
}

console.log("L02_MA_STATE_ACTIVATION_PASS");