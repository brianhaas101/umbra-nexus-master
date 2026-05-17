const targets = [
  {
    source_id: "fema_grants",
    urls: [
      "https://www.fema.gov/grants",
      "https://www.fema.gov/openfema-data-page"
    ]
  },
  {
    source_id: "bja_grant_systems",
    urls: [
      "https://bja.ojp.gov/funding",
      "https://bja.ojp.gov/funding/current"
    ]
  }
];

async function probeUrl(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "text/html,application/json",
        "User-Agent": "UmbraNexus-L01-Source-Probe/1.0"
      }
    });

    const text = await res.text();

    return {
      url,
      ok: res.ok,
      status: res.status,
      content_type: res.headers.get("content-type"),
      length: text.length,
      has_fema: text.toLowerCase().includes("fema"),
      has_bja: text.toLowerCase().includes("bureau of justice assistance") || text.toLowerCase().includes("bja"),
      has_grants: text.toLowerCase().includes("grant"),
      sample: text.slice(0, 300).replace(/\s+/g, " ")
    };
  } catch (err) {
    return {
      url,
      ok: false,
      status: "FETCH_ERROR",
      error: String(err.message)
    };
  }
}

const results = [];

for (const target of targets) {
  for (const url of target.urls) {
    const result = await probeUrl(url);
    results.push({
      source_id: target.source_id,
      ...result
    });
  }
}

console.log(JSON.stringify({
  probe_id: "L01_FEMA_BJA_SOURCE_DISCOVERY",
  promoted: false,
  registry_mutation: false,
  results
}, null, 2));
