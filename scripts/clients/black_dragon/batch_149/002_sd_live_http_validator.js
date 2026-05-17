const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const targets = read(
  "public/data/clients/black_dragon/automation/live_validation/san_diego/manifests/live_validation_targets.json"
);

function validate(target) {
  return new Promise(resolve => {

    const started = Date.now();

    const mod =
      target.url.startsWith("https")
        ? https
        : http;

    const req = mod.request(
      target.url,
      {
        method: "HEAD",
        timeout: 10000,
        headers: {
          "User-Agent": "UmbraNexusValidationBot/1.0"
        }
      },
      (res) => {

        const code = res.statusCode;

        resolve({
          validation_id: target.validation_id,
          organization_name: target.organization_name,
          route_type: target.route_type,
          url: target.url,

          checked_at:
            new Date().toISOString(),

          status_code:
            code,

          fetch_status:
            code >= 200 && code < 400
              ? "VALID"
              : code === 405
                ? "SAFE_GET_REVIEW_REQUIRED"
                : "REVIEW_REQUIRED",

          redirect_detected:
            !!res.headers.location,

          response_time_ms:
            Date.now() - started,

          automated_outreach_allowed:
            false,

          runtime_mutation_allowed:
            false
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();

      resolve({
        validation_id: target.validation_id,
        organization_name: target.organization_name,
        route_type: target.route_type,
        url: target.url,

        checked_at:
          new Date().toISOString(),

        fetch_status:
          "TIMEOUT",

        response_time_ms:
          Date.now() - started,

        automated_outreach_allowed:
          false,

        runtime_mutation_allowed:
          false
      });
    });

    req.on("error", err => {

      resolve({
        validation_id: target.validation_id,
        organization_name: target.organization_name,
        route_type: target.route_type,
        url: target.url,

        checked_at:
          new Date().toISOString(),

        fetch_status:
          "ERROR",

        error:
          err.message,

        response_time_ms:
          Date.now() - started,

        automated_outreach_allowed:
          false,

        runtime_mutation_allowed:
          false
      });
    });

    req.end();
  });
}

(async () => {

  const results = [];

  for (const target of targets.validation_targets) {

    const result = await validate(target);

    results.push(result);

    await new Promise(r => setTimeout(r, 2000));
  }

  const payload = {
    version:
      "black_dragon_san_diego_live_http_validation_results_v1",

    generated_at:
      new Date().toISOString(),

    validation_count:
      results.length,

    validation_results:
      results
  };

  const out = path.join(
    ROOT,
    "public/data/clients/black_dragon/automation/live_validation/san_diego/results/live_http_validation_results.json"
  );

  fs.writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");

  console.log(JSON.stringify({
    status: "SAN_DIEGO_LIVE_HTTP_VALIDATION_COMPLETE",
    validation_count: payload.validation_count,
    valid_routes:
      results.filter(r => r.fetch_status === "VALID").length,
    review_routes:
      results.filter(r => r.fetch_status !== "VALID").length,
    output: out
  }, null, 2));
})();
