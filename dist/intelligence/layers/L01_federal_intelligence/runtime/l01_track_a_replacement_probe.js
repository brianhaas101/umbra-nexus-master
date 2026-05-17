const targets = [
  { source_id: "cisa_advisories", url: "https://www.cisa.gov/news-events/cybersecurity-advisories" },
  { source_id: "grants_gov_opportunities", url: "https://www.grants.gov/search-grants" },
  { source_id: "ojp_awards", url: "https://ojp.gov/funding/awards" },
  { source_id: "data_gov_crime_catalog", url: "https://catalog.data.gov/dataset/?q=crime" },
  { source_id: "fema_open_data", url: "https://www.fema.gov/openfema-data-page" }
];

async function probe(target) {
  try {
    const response = await fetch(target.url, {
      headers: {
        "Accept": "text/html,application/json,application/rss+xml",
        "User-Agent": "UmbraNexus-L01-Replacement-Probe/1.0"
      }
    });

    const text = await response.text();

    return {
      source_id: target.source_id,
      url: target.url,
      ok: response.ok,
      status: response.status,
      content_type: response.headers.get("content-type"),
      length: text.length,
      sample: text.slice(0, 260).replace(/\s+/g, " ")
    };
  } catch (err) {
    return {
      source_id: target.source_id,
      url: target.url,
      ok: false,
      status: "FETCH_ERROR",
      error: String(err.message)
    };
  }
}

const results = [];

for (const target of targets) {
  results.push(await probe(target));
}

console.log(JSON.stringify({
  probe_id: "L01_TRACK_A_REPLACEMENT_SOURCE_DISCOVERY",
  promoted: false,
  registry_mutation: false,
  results
}, null, 2));
