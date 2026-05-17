import { loadSecureEnv } from "./l01_secure_env_loader.js";

loadSecureEnv();

const key = process.env.API_DATA_GOV_KEY || process.env.FBI_CDE_API_KEY;

if (!key) {
  throw new Error("API key missing.");
}

const candidates = [
  "https://api.usa.gov/crime/fbi/cde/agencies",
  "https://api.usa.gov/crime/fbi/cde/agencies?",
  "https://api.usa.gov/crime/fbi/cde/agencies?API_KEY=",
  "https://api.usa.gov/crime/fbi/cde/agencies/all",
  "https://api.usa.gov/crime/fbi/cde/estimates/states",
  "https://api.usa.gov/crime/fbi/cde/arrest/agencies"
];

async function probe(url) {
  const finalUrl = new URL(url);
  finalUrl.searchParams.set("API_KEY", key);

  try {
    const res = await fetch(finalUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "UmbraNexus-L01-FBI-CDE-Probe/1.0"
      }
    });

    const text = await res.text();

    return {
      url: finalUrl.toString().replace(key, "REDACTED"),
      ok: res.ok,
      status: res.status,
      content_type: res.headers.get("content-type"),
      length: text.length,
      sample: text.slice(0, 220).replace(/\s+/g, " ")
    };
  } catch (err) {
    return {
      url: finalUrl.toString().replace(key, "REDACTED"),
      ok: false,
      status: "FETCH_ERROR",
      error: String(err.message)
    };
  }
}

const results = [];

for (const url of candidates) {
  results.push(await probe(url));
}

console.log(JSON.stringify({
  probe_id: "L01_FBI_CDE_ENDPOINT_DISCOVERY",
  promoted: false,
  registry_mutation: false,
  results
}, null, 2));
