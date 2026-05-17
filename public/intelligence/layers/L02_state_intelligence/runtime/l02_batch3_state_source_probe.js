const targets = [
  {
    source_id: "state_labor_workforce",
    state_code: "CA",
    state_name: "California",
    url: "https://www.edd.ca.gov/"
  },
  {
    source_id: "state_housing",
    state_code: "CA",
    state_name: "California",
    url: "https://www.hcd.ca.gov/"
  },
  {
    source_id: "state_education",
    state_code: "CA",
    state_name: "California",
    url: "https://www.cde.ca.gov/"
  }
];

async function probe(target) {
  try {
    const res = await fetch(target.url, {
      headers: {
        "Accept": "text/html,application/json",
        "User-Agent": "UmbraNexus-L02-State-Batch3-Discovery/1.0"
      }
    });

    const text = await res.text();

    return {
      source_id: target.source_id,
      state_code: target.state_code,
      state_name: target.state_name,
      url: target.url,
      ok: res.ok,
      status: res.status,
      content_type: res.headers.get("content-type"),
      length: text.length,
      sample: text.slice(0, 300).replace(/\s+/g, " "),
      promoted: false,
      registry_mutation: false
    };
  } catch (err) {
    return {
      source_id: target.source_id,
      state_code: target.state_code,
      state_name: target.state_name,
      url: target.url,
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
  probe_id: "L02_BATCH3_STATE_SOURCE_DISCOVERY",
  promoted: false,
  registry_mutation: false,
  l01_mutation: false,
  client_paths_touched: false,
  results
}, null, 2));
