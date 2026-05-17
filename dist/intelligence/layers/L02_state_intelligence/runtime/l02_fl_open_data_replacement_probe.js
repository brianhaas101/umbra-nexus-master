const targets = [
  {
    source_id: "state_open_data_portals",
    state_code: "FL",
    state_name: "Florida",
    url: "https://openmyflorida.opendata.arcgis.com/"
  },
  {
    source_id: "state_open_data_portals",
    state_code: "FL",
    state_name: "Florida",
    url: "https://gis-fdot.opendata.arcgis.com/"
  }
];

async function probe(target) {
  try {
    const res = await fetch(target.url, {
      headers: {
        "Accept": "text/html,application/json",
        "User-Agent": "UmbraNexus-L02-FL-OpenData-Replacement/1.0"
      }
    });

    const text = await res.text();

    return {
      ...target,
      ok: res.ok,
      status: res.status,
      content_type: res.headers.get("content-type"),
      length: text.length,
      sample: text.slice(0, 260).replace(/\s+/g, " "),
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
for (const target of targets) results.push(await probe(target));

console.log(JSON.stringify({
  probe_id: "L02_FL_OPEN_DATA_REPLACEMENT_DISCOVERY",
  promoted: false,
  registry_mutation: false,
  l01_mutation: false,
  client_paths_touched: false,
  results
}, null, 2));
