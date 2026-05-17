import { mergeVerifiedSource } from "./l02_registry_merge_engine.js";

const targets = [
  {
    source_id: "state_emergency_management",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_emergency_management",
    source_url: "https://ema.alabama.gov/",
    status: "source_page_verified_state_emergency_management_signals"
  },
  {
    source_id: "state_police_public_safety",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_public_safety",
    source_url: "https://www.alea.gov/",
    status: "source_page_verified_state_public_safety_signals"
  },
  {
    source_id: "state_courts",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_courts",
    source_url: "https://judicial.alabama.gov/",
    status: "source_page_verified_state_courts_signals"
  },
  {
    source_id: "state_environmental_agency",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_environmental",
    source_url: "https://adem.alabama.gov/",
    status: "source_page_verified_state_environmental_signals"
  },
  {
    source_id: "state_transportation",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_transportation",
    source_url: "https://www.dot.state.al.us/",
    status: "source_page_verified_state_transportation_signals"
  },
  {
    source_id: "state_labor_workforce",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_labor_workforce",
    source_url: "https://adol.alabama.gov/",
    status: "source_page_verified_state_labor_workforce_signals"
  },
  {
    source_id: "state_housing",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_housing",
    source_url: "https://www.ahfa.com/",
    status: "source_page_verified_state_housing_signals"
  },
  {
    source_id: "state_education",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_education",
    source_url: "https://www.alabamaachieves.org/",
    status: "source_page_verified_state_education_signals"
  },
  {
    source_id: "state_health_services",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_health_services",
    source_url: "https://www.alabamapublichealth.gov/",
    status: "source_page_verified_state_health_services_signals"
  },
  {
    source_id: "state_energy_utilities",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_energy_utilities",
    source_url: "https://psc.alabama.gov/",
    status: "source_page_verified_state_energy_utilities_signals"
  },
  {
    source_id: "state_business_regulation",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_business_regulation",
    source_url: "https://www.sos.alabama.gov/",
    status: "source_page_verified_state_business_regulation_signals"
  },
  {
    source_id: "state_procurement",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_procurement",
    source_url: "https://procurement.alabama.gov/",
    status: "source_page_verified_state_procurement_signals"
  },
  {
    source_id: "state_corrections",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_corrections",
    source_url: "https://doc.alabama.gov/",
    status: "source_page_verified_state_corrections_signals"
  },
  {
    source_id: "state_elections",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_elections",
    source_url: "https://www.sos.alabama.gov/alabama-votes",
    status: "source_page_verified_state_elections_signals"
  }
];

const deferred = [
  {
    source_id: "state_open_data_portals",
    state_code: "AL",
    state_name: "Alabama",
    category: "state_open_data_portals",
    source_url: "https://data.alabama.gov/",
    status: "deferred_external_verification_502",
    connector_active: false,
    normalizer_active: false,
    synthetic_url: false,
    inferred_contact: false,
    client_paths_touched: false
  }
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

const result = {
  state_code: "AL",
  state_name: "Alabama",
  activated_targets: merged.length,
  deferred_targets: deferred.length,
  required_targets: 15,
  complete: merged.length === 15,
  deferred,
  client_paths_touched: false
};

if (merged.length !== 14) {
  throw new Error(`Expected 14 activated Alabama targets. Found ${merged.length}`);
}

console.log("L02_AL_STATE_ACTIVATION_PARTIAL_PASS");