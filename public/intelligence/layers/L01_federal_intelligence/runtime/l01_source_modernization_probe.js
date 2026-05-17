const targets = [
  { source_id: "doj_announcements", url: "https://www.justice.gov/news/rss" },
  { source_id: "fbi_press_releases", url: "https://www.fbi.gov/news/press-releases" },
  { source_id: "fbi_field_offices", url: "https://www.fbi.gov/contact-us/field-offices" },
  { source_id: "fbi_ucr", url: "https://api.usa.gov/crime/fbi/cde/agencies" },
  { source_id: "sam_gov", url: "https://api.sam.gov/prod/opportunities/v2/search?limit=1" }
];

async function probe(target) {
  try {
    const res = await fetch(target.url, {
      headers: {
        "Accept": "application/rss+xml,application/json,text/html",
        "User-Agent": "UmbraNexus-L01-Modernization-Probe/1.0"
      }
    });

    const text = await res.text();

    return {
      source_id: target.source_id,
      url: target.url,
      ok: res.ok,
      status: res.status,
      content_type: res.headers.get("content-type"),
      length: text.length,
      sample: text.slice(0, 240).replace(/\s+/g, " ")
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
  probe_id: "L01_SOURCE_MODERNIZATION_DISCOVERY",
  registry_mutation: false,
  promoted: false,
  results
}, null, 2));
