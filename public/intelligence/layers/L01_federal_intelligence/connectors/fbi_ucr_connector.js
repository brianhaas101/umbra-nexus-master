import { loadSecureEnv } from "../runtime/l01_secure_env_loader.js";
import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "fbi_ucr";
const ENDPOINT = "https://api.usa.gov/crime/fbi/cde/agencies";

export async function fetchRawRecords() {
  loadSecureEnv();

  const key = process.env.FBI_CDE_API_KEY || process.env.API_DATA_GOV_KEY;
  if (!key) throw new Error("API_DATA_GOV_KEY missing.");

  const url = new URL(ENDPOINT);
  url.searchParams.set("API_KEY", key);

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "UmbraNexus-L01-FBI-UCR/1.0"
    }
  });

  if (!response.ok) throw new Error(`FBI UCR failed: ${response.status}`);

  const payload = await response.json();

  return [
    makeRawEnvelope(
      Object.freeze({
        source_id: SOURCE_ID,
        source_name: "FBI UCR",
        canonical_url: "https://cde.ucr.cjis.gov/",
        access_method: "api_data_gov_authenticated"
      }),
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "fbi_ucr_agencies",
        payload
      }),
      "fbi_ucr_agencies"
    )
  ];
}
