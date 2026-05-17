const targets = [
  { source_id: "state_open_data_portals", state_code: "NY", state_name: "New York", url: "https://data.ny.gov/" },
  { source_id: "state_emergency_management", state_code: "NY", state_name: "New York", url: "https://www.dhses.ny.gov/" },
  { source_id: "state_police_public_safety", state_code: "NY", state_name: "New York", url: "https://troopers.ny.gov/" },

  { source_id: "state_open_data_portals", state_code: "TX", state_name: "Texas", url: "https://data.texas.gov/" },
  { source_id: "state_emergency_management", state_code: "TX", state_name: "Texas", url: "https://tdem.texas.gov/" },
  { source_id: "state_police_public_safety", state_code: "TX", state_name: "Texas", url: "https://www.dps.texas.gov/" },

  { source_id: "state_open_data_portals", state_code: "FL", state_name: "Florida", url: "https://data.florida.gov/" },
  { source_id: "state_emergency_management", state_code: "FL", state_name: "Florida", url: "https://www.floridadisaster.org/" },
  { source_id: "state_police_public_safety", state_code: "FL", state_name: "Florida", url: "https://www.flhsmv.gov/florida-highway-patrol/" }
];

async function probe(target) {
  try {
    const res = await fetch(target.url, {
      headers: {
        "Accept": "text/html,application/json",
        "User-Agent": "UmbraNexus-L02-National-Wave1/1.0"
      }
    });

    const text = await res.text();

    return {
      ...target,
      ok: res.ok,
      status: res.status,
      content_type: res.headers.get("content-type"),
      length: text.length,
      sample: text.slice(0, 240).replace(/\s+/g, " "),
      promoted: false,
      registry_mutation: false
    };
  } catch (err) {
    return {
      ...target,
      ok: false,
      status: "FETCH_ERROR",
      error: String(err.message),
      promoted: false,
      registry_mutation: false
    };
  }
}

const results = [];

for (const target of targets) {
  results.push(await probe(target));
}

console.log(JSON.stringify({
  probe_id: "L02_NATIONAL_WAVE1_DISCOVERY",
  states: ["NY", "TX", "FL"],
  categories: [
    "state_open_data_portals",
    "state_emergency_management",
    "state_police_public_safety"
  ],
  promoted: false,
  registry_mutation: false,
  l01_mutation: false,
  client_paths_touched: false,
  results
}, null, 2));
