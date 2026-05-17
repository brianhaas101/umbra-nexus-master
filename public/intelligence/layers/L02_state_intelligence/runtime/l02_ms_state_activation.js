import { mergeVerifiedSource } from "./l02_registry_merge_engine.js";

const targets = [
  { source_id: "state_open_data_portals", state_code: "MS", state_name: "Mississippi", category: "state_open_data_portals", source_url: "https://opendata.gis.ms.gov/", status: "source_page_verified_state_open_data_signals" },
  { source_id: "state_emergency_management", state_code: "MS", state_name: "Mississippi", category: "state_emergency_management", source_url: "https://www.msema.org/", status: "source_page_verified_state_emergency_management_signals" },
  { source_id: "state_police_public_safety", state_code: "MS", state_name: "Mississippi", category: "state_public_safety", source_url: "https://www.dps.ms.gov/", status: "source_page_verified_state_public_safety_signals" },
  { source_id: "state_courts", state_code: "MS", state_name: "Mississippi", category: "state_courts", source_url: "https://courts.ms.gov/", status: "source_page_verified_state_courts_signals" },
  { source_id: "state_environmental_agency", state_code: "MS", state_name: "Mississippi", category: "state_environmental", source_url: "https://www.mdeq.ms.gov/", status: "source_page_verified_state_environmental_signals" },
  { source_id: "state_transportation", state_code: "MS", state_name: "Mississippi", category: "state_transportation", source_url: "https://mdot.ms.gov/", status: "source_page_verified_state_transportation_signals" },
  { source_id: "state_labor_workforce", state_code: "MS", state_name: "Mississippi", category: "state_labor_workforce", source_url: "https://mdes.ms.gov/", status: "source_page_verified_state_labor_workforce_signals" },
  { source_id: "state_housing", state_code: "MS", state_name: "Mississippi", category: "state_housing", source_url: "https://www.mshomecorp.com/", status: "source_page_verified_state_housing_signals" },
  { source_id: "state_education", state_code: "MS", state_name: "Mississippi", category: "state_education", source_url: "https://www.mdek12.org/", status: "source_page_verified_state_education_signals" },
  { source_id: "state_health_services", state_code: "MS", state_name: "Mississippi", category: "state_health_services", source_url: "https://msdh.ms.gov/", status: "source_page_verified_state_health_services_signals" },
  { source_id: "state_energy_utilities", state_code: "MS", state_name: "Mississippi", category: "state_energy_utilities", source_url: "https://www.psc.ms.gov/", status: "source_page_verified_state_energy_utilities_signals" },
  { source_id: "state_business_regulation", state_code: "MS", state_name: "Mississippi", category: "state_business_regulation", source_url: "https://www.sos.ms.gov/business-services", status: "source_page_verified_state_business_regulation_signals" },
  { source_id: "state_procurement", state_code: "MS", state_name: "Mississippi", category: "state_procurement", source_url: "https://www.dfa.ms.gov/dfa-offices/mmrs/state-purchasing", status: "source_page_verified_state_procurement_signals" },
  { source_id: "state_corrections", state_code: "MS", state_name: "Mississippi", category: "state_corrections", source_url: "https://www.mdoc.ms.gov/", status: "source_page_verified_state_corrections_signals" },
  { source_id: "state_elections", state_code: "MS", state_name: "Mississippi", category: "state_elections", source_url: "https://www.sos.ms.gov/elections-voting", status: "source_page_verified_state_elections_signals" }
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
  throw new Error(`Expected 15 activated Mississippi targets. Found ${merged.length}`);
}

console.log("L02_MS_STATE_ACTIVATION_PASS");