import fs from "node:fs";

const targets = JSON.parse(fs.readFileSync("C:/Dev/Nexus_MASTER/public/intelligence/layers/L02_state_intelligence/runtime/l02_wave1_targets.json", "utf8").replace(/^\uFEFF/, ""));

const failures = [];
const passes = [];

for (const target of targets) {
  try {
    const res = await fetch(target.url, {
      headers: {
        "Accept": "text/html,application/json",
        "User-Agent": "UmbraNexus-L02-Wave1-Activation/1.0"
      }
    });

    const text = await res.text();

    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    if (text.length < 1000) throw new Error(`PAYLOAD_TOO_SMALL_${text.length}`);

    passes.push({
      ...target,
      connector_active: true,
      normalizer_active: true,
      last_refresh: new Date().toISOString(),
      payload_length: text.length,
      client_paths_touched: false
    });
  } catch (err) {
    failures.push({
      ...target,
      connector_active: false,
      normalizer_active: false,
      status: `deferred_${String(err.message)}`,
      last_refresh: null,
      client_paths_touched: false
    });
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ passes, failures }, null, 2));
  throw new Error(`Wave1 activation blocked by ${failures.length} failures.`);
}

console.log(JSON.stringify({
  result: "L02_NATIONAL_WAVE1_ACTIVATION_PASS",
  active_sources_added: passes.length,
  passes
}, null, 2));
