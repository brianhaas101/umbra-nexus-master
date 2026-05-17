const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const targets = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/manifests/live_validation_targets.json"
);

function validateUrl(target) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const mod = target.url.startsWith("https") ? https : http;

    const request = mod.request(
      target.url,
      {
        method: "HEAD",
        timeout: 10000,
        headers: {
          "User-Agent": "UmbraNexusValidationBot/1.0"
        }
      },
      (response) => {
        const status = response.statusCode;

        resolve({
          validation_id: target.validation_id,
          organization_name: target.organization_name,
          route_type: target.route_type,
          url: target.url,
          checked_at: new Date().toISOString(),
          status_code: status,
          response_headers: Object.keys(response.headers || {}).length,
          fetch_status:
            status >= 200 && status < 400
              ? "VALID"
              : status === 405
                ? "SAFE_GET_REVIEW_REQUIRED"
                : "REVIEW_REQUIRED",
          redirect_detected: !!response.headers.location,
          response_time_ms: Date.now() - startedAt,
          freshness_update_allowed: true,
          runtime_mutation_allowed: false,
          contact_ready_promotion_allowed: false,
          automated_outreach_allowed: false
        });
      }
    );

    request.on("timeout", () => {
      request.destroy();

      resolve({
        validation_id: target.validation_id,
        organization_name: target.organization_name,
        route_type: target.route_type,
        url: target.url,
        checked_at: new Date().toISOString(),
        fetch_status: "TIMEOUT",
        response_time_ms: Date.now() - startedAt,
        freshness_update_allowed: false,
        runtime_mutation_allowed: false,
        contact_ready_promotion_allowed: false,
        automated_outreach_allowed: false
      });
    });

    request.on("error", (err) => {
      resolve({
        validation_id: target.validation_id,
        organization_name: target.organization_name,
        route_type: target.route_type,
        url: target.url,
        checked_at: new Date().toISOString(),
        fetch_status: "ERROR",
        error: err.message,
        response_time_ms: Date.now() - startedAt,
        freshness_update_allowed: false,
        runtime_mutation_allowed: false,
        contact_ready_promotion_allowed: false,
        automated_outreach_allowed: false
      });
    });

    request.end();
  });
}

(async () => {
  const results = [];

  for (const target of targets.validation_targets) {
    const result = await validateUrl(target);
    results.push(result);

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const out = path.join(
    ROOT,
    "public/data/clients/black_dragon/automation/live_validation/los_angeles/results/live_http_validation_results.json"
  );

  fs.writeFileSync(out, JSON.stringify({
    version: "black_dragon_los_angeles_live_http_validation_results_v1",
    generated_at: new Date().toISOString(),
    validation_count: results.length,
    validation_results: results
  }, null, 2), "utf8");

  console.log(JSON.stringify({
    status: "LOS_ANGELES_LIVE_HTTP_VALIDATION_COMPLETE",
    validation_count: results.length,
    valid_routes: results.filter(r => r.fetch_status === "VALID").length,
    review_routes: results.filter(r => r.fetch_status !== "VALID").length,
    output: out
  }, null, 2));
})();
