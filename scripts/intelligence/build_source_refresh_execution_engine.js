const fs = require("fs");
const path = require("path");

const QUEUE = "public/data/intelligence/runtime/live_ingestion_execution_queue.json";
const HEALTH = "public/data/intelligence/runtime/connector_health_monitor.json";
const OUT = "public/data/intelligence/runtime/source_refresh_execution_engine.json";

const queue = JSON.parse(fs.readFileSync(QUEUE, "utf8"));
const health = JSON.parse(fs.readFileSync(HEALTH, "utf8"));

const healthMap = new Map((health.connectors || []).map(c => [c.layer_id, c]));

const jobs = (queue.jobs || []).map(job => {
  const h = healthMap.get(job.layer_id);
  return {
    job_id: job.job_id,
    layer_id: job.layer_id,
    execution_order: job.execution_order,
    connector_health: h?.health_status || "UNKNOWN",
    live_pull_enabled: h?.live_pull_enabled === true,
    refresh_status: h?.live_pull_enabled ? "READY_FOR_LIVE_REFRESH" : "STUB_ONLY_NOT_LIVE",
    output_path: `public/data/intelligence/outputs/${job.layer_id}.normalized.json`
  };
});

const engine = {
  version: "nexus_source_refresh_execution_engine_v1",
  generated_at: new Date().toISOString(),
  rule: "Refresh engine coordinates live pulls only after connectors are explicitly enabled.",
  total_jobs: jobs.length,
  live_jobs: jobs.filter(j => j.live_pull_enabled).length,
  stub_jobs: jobs.filter(j => !j.live_pull_enabled).length,
  jobs
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(engine, null, 2));

console.log("[SOURCE REFRESH ENGINE] COMPLETE", "jobs:", engine.total_jobs, "live:", engine.live_jobs);
