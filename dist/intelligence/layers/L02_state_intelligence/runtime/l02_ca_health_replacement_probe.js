const target = {
  source_id: "state_health_services",
  state_code: "CA",
  state_name: "California",
  url: "https://www.chhs.ca.gov/"
};

try {
  const res = await fetch(target.url, {
    headers: {
      "Accept": "text/html,application/json",
      "User-Agent": "UmbraNexus-L02-CA-Health-Replacement/1.0"
    }
  });

  const text = await res.text();

  console.log(JSON.stringify({
    probe_id: "L02_CA_HEALTH_REPLACEMENT_PROBE",
    promoted: false,
    registry_mutation: false,
    l01_mutation: false,
    client_paths_touched: false,
    result: {
      ...target,
      ok: res.ok,
      status: res.status,
      content_type: res.headers.get("content-type"),
      length: text.length,
      sample: text.slice(0, 300).replace(/\s+/g, " ")
    }
  }, null, 2));
} catch (err) {
  console.log(JSON.stringify({
    probe_id: "L02_CA_HEALTH_REPLACEMENT_PROBE",
    promoted: false,
    registry_mutation: false,
    l01_mutation: false,
    client_paths_touched: false,
    result: {
      ...target,
      ok: false,
      status: "FETCH_ERROR",
      error: String(err.message)
    }
  }, null, 2));
}
