// BATCH_384_PHASE7_ALERT_FOUNDATION
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_384_ALERT_FOUNDATION) return;

window.__UMBRA_BATCH_384_ALERT_FOUNDATION = true;

function buildAlertRegistry(){

  const watchlists =
    window.UmbraWatchlistRegistry?.watchlists || [];

  const alerts = watchlists.map((watch,index) => {

    const isEscalated =
      watch.watch_status === "ESCALATED";

    return {

      alert_id:
        "ALERT-" +
        String(index + 1).padStart(3,"0"),

      watch_id:
        watch.watch_id,

      candidate_id:
        watch.candidate_id,

      candidate_name:
        watch.candidate_name,

      alert_type:
        isEscalated
          ? "ESCALATION"
          : "MONITORING",

      severity:
        isEscalated
          ? "HIGH"
          : "LOW",

      alert_status:
        "OPEN",

      source_watch_status:
        watch.watch_status,

      created_at:
        new Date().toISOString(),

      updated_at:
        new Date().toISOString(),

      acknowledged:
        false,

      resolved:
        false

    };

  });

  const registry = {

    id:
      "PHASE_7_ALERT_REGISTRY_V1",

    batch:
      384,

    phase:
      "PHASE 7",

    phase_name:
      "Intelligence Operations",

    generated_at:
      new Date().toISOString(),

    runtime_visible:
      true,

    status:
      "ACTIVE",

    alert_count:
      alerts.length,

    alerts

  };

  window.UmbraAlertRegistry =
    registry;

  return registry;
}

function getAlertMetrics(){

  const alerts =
    window.UmbraAlertRegistry?.alerts || [];

  return {

    id:
      "PHASE_7_ALERT_METRICS_V1",

    batch:
      384,

    runtime_visible:
      true,

    alert_count:
      alerts.length,

    open:
      alerts.filter(
        x => x.alert_status === "OPEN"
      ).length,

    acknowledged:
      alerts.filter(
        x => x.acknowledged
      ).length,

    resolved:
      alerts.filter(
        x => x.resolved
      ).length,

    high_severity:
      alerts.filter(
        x => x.severity === "HIGH"
      ).length

  };
}

function getAlertById(alertId){

  const alert =
    (window.UmbraAlertRegistry?.alerts || [])
      .find(x => x.alert_id === alertId);

  return {
    id:"PHASE_7_ALERT_LOOKUP_V1",
    batch:384,
    runtime_visible:true,
    status:alert ? "FOUND" : "NOT_FOUND",
    alert
  };
}

window.UmbraBuildAlertRegistry =
  buildAlertRegistry;

window.UmbraGetAlertMetrics =
  getAlertMetrics;

window.UmbraGetAlertById =
  getAlertById;

window.UmbraAlertFoundation = {

  id:
    "PHASE_7_ALERT_FOUNDATION_V1",

  batch:
    384,

  phase:
    "PHASE 7",

  phase_name:
    "Intelligence Operations",

  status:
    "ACTIVE",

  runtime_visible:
    true,

  registry_function:
    "window.UmbraBuildAlertRegistry",

  metrics_function:
    "window.UmbraGetAlertMetrics",

  lookup_function:
    "window.UmbraGetAlertById",

  activated_at:
    new Date().toISOString()

};

console.log(
  "[BATCH 384] Alert Foundation active",
  window.UmbraAlertFoundation
);

})();
