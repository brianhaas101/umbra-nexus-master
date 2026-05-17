export function classifyPayload({ url, status, contentType, text, target }) {
  const body = String(text || "");
  const lower = body.toLowerCase();
  let score = 0;
  const reasons = [];

  if (status >= 200 && status < 300) {
    score += 25;
    reasons.push("http_ok");
  }

  if (body.length >= 1000) {
    score += 20;
    reasons.push("payload_size_ok");
  }

  if (String(contentType || "").includes("html") || String(contentType || "").includes("json")) {
    score += 10;
    reasons.push("content_type_usable");
  }

  if (
    lower.includes("access denied") ||
    lower.includes("just a moment") ||
    lower.includes("captcha") ||
    lower.includes("incapsula") ||
    lower.includes("akamai") ||
    lower.includes("forbidden")
  ) {
    return Object.freeze({
      verified: false,
      score: 0,
      classification: "blocked_or_challenge_page",
      reasons: Object.freeze(["blocked_or_challenge_page"])
    });
  }

  const stateName = String(target.state_name || "").toLowerCase();
  const stateCode = String(target.state_code || "").toLowerCase();

  if (lower.includes(stateName) || lower.includes(`state of ${stateName}`) || lower.includes(stateCode)) {
    score += 15;
    reasons.push("state_identity_present");
  }

  const categoryTerms = {
    state_open_data_portals: ["open data", "dataset", "data portal", "arcgis", "socrata"],
    state_emergency_management: ["emergency", "disaster", "preparedness", "homeland security"],
    state_police_public_safety: ["public safety", "state police", "highway patrol", "trooper", "law enforcement"],
    state_courts: ["court", "judicial", "judiciary", "case"],
    state_environmental_agency: ["environment", "environmental", "air quality", "water"],
    state_transportation: ["transportation", "highway", "roads", "traffic"],
    state_labor_workforce: ["labor", "workforce", "employment", "unemployment", "jobs"],
    state_housing: ["housing", "community development", "homelessness", "affordable"],
    state_education: ["education", "school", "students", "department of education"],
    state_health_services: ["health", "human services", "public health", "medicaid"],
    state_energy_utilities: ["energy", "utilities", "electric", "power"],
    state_business_regulation: ["business", "license", "consumer", "regulation"],
    state_procurement: ["procurement", "purchasing", "contracts", "vendor"],
    state_corrections: ["corrections", "prison", "offender", "inmate"],
    state_elections: ["election", "voter", "ballot", "secretary of state"]
  };

  const terms = categoryTerms[target.category] || [];
  const matchedTerms = terms.filter(term => lower.includes(term));

  if (matchedTerms.length > 0) {
    score += 30;
    reasons.push(`category_terms:${matchedTerms.join(",")}`);
  }

  const verified = score >= 70;

  return Object.freeze({
    verified,
    score,
    classification: verified ? "verified_official_candidate" : "deferred_low_confidence",
    reasons: Object.freeze(reasons)
  });
}

export async function probeCandidate(target, url) {
  try {
    const res = await fetch(url, {
      headers: {
        "Accept": "text/html,application/json",
        "User-Agent": "UmbraNexus-L02-ProbeScore/1.0"
      }
    });

    const text = await res.text();
    const score = classifyPayload({
      url,
      status: res.status,
      contentType: res.headers.get("content-type"),
      text,
      target
    });

    return Object.freeze({
      target_id: target.target_id,
      state_code: target.state_code,
      state_name: target.state_name,
      category: target.category,
      url,
      ok: res.ok,
      status: res.status,
      content_type: res.headers.get("content-type"),
      payload_length: text.length,
      ...score,
      sample: text.slice(0, 180).replace(/\s+/g, " "),
      promoted: false,
      registry_mutation: false,
      l01_mutation: false,
      client_paths_touched: false
    });
  } catch (err) {
    return Object.freeze({
      target_id: target.target_id,
      state_code: target.state_code,
      state_name: target.state_name,
      category: target.category,
      url,
      ok: false,
      status: "FETCH_ERROR",
      score: 0,
      verified: false,
      classification: "fetch_error",
      error: String(err.message),
      promoted: false,
      registry_mutation: false,
      l01_mutation: false,
      client_paths_touched: false
    });
  }
}

if (import.meta.url === `file://${process.argv[1].replaceAll("\\", "/")}`) {
  console.log("L02_PROBE_AND_SCORE_EXECUTOR_PASS");
}
