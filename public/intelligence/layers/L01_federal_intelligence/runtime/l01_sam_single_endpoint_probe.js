const url = "https://api.sam.gov/opportunities/v2/search?limit=1";

const res = await fetch(url, {
  headers: {
    "Accept": "application/json",
    "User-Agent": "UmbraNexus-L01-SAM-Probe/1.0"
  }
});

const text = await res.text();

console.log(JSON.stringify({
  probe_id: "L01_SAM_SINGLE_ENDPOINT_PROBE",
  url,
  ok: res.ok,
  status: res.status,
  content_type: res.headers.get("content-type"),
  length: text.length,
  sample: text.slice(0, 400).replace(/\s+/g, " "),
  promoted: false,
  registry_mutation: false
}, null, 2));
