const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const routerPath =
  path.join(
    ROOT,
    "public",
    "data",
    "clients",
    "black_dragon",
    "pipeline",
    "registries",
    "parser_execution_router.json"
  );

const router =
  JSON.parse(fs.readFileSync(routerPath, "utf8"));

const trace = {
  version:
    "black_dragon_acquisition_trace_logger_v1",

  generated_at:
    new Date().toISOString(),

  traces:
    router.routes.map(route => ({
      execution_id:
        route.execution_id,

      parser_assigned:
        route.parser_assigned,

      acquisition_started:
        true,

      acquisition_timestamp:
        new Date().toISOString(),

      trace_locked:
        true
    }))
};

const out =
  path.join(
    ROOT,
    "public",
    "data",
    "clients",
    "black_dragon",
    "pipeline",
    "logs",
    "acquisition_trace_log.json"
  );

fs.writeFileSync(out, JSON.stringify(trace, null, 2));

console.log(JSON.stringify({
  status:
    "ACQUISITION_TRACE_LOGGER_COMPLETE",

  traces:
    trace.traces.length,

  output: out
}, null, 2));
