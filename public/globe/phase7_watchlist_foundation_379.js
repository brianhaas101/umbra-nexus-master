// BATCH_379_PHASE7_WATCHLIST_FOUNDATION
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_379_WATCHLIST_FOUNDATION) return;

window.__UMBRA_BATCH_379_WATCHLIST_FOUNDATION = true;

function buildWatchlistRegistry(){

  const missions =
    window.UmbraMissionRegistry?.missions || [];

  const watchlists = missions.map((mission,index) => {

    return {

      watch_id:
        "WATCH-" +
        String(index + 1).padStart(3,"0"),

      mission_id:
        mission.mission_id,

      candidate_id:
        mission.candidate_id,

      candidate_name:
        mission.candidate_name,

      watch_type:
        "CANDIDATE",

      watch_status:
        "ACTIVE",

      priority:
        mission.priority,

      priority_score:
        mission.priority_score,

      created_at:
        new Date().toISOString(),

      updated_at:
        new Date().toISOString(),

      alert_count:
        0,

      event_count:
        0

    };

  });

  const registry = {

    id:
      "PHASE_7_WATCHLIST_REGISTRY_V1",

    batch:
      379,

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

    watch_count:
      watchlists.length,

    watchlists

  };

  window.UmbraWatchlistRegistry =
    registry;

  return registry;
}

function getWatchlistMetrics(){

  const watchlists =
    window.UmbraWatchlistRegistry?.watchlists || [];

  return {

    id:
      "PHASE_7_WATCHLIST_METRICS_V1",

    batch:
      379,

    runtime_visible:
      true,

    watch_count:
      watchlists.length,

    active:
      watchlists.filter(
        x => x.watch_status === "ACTIVE"
      ).length,

    paused:
      watchlists.filter(
        x => x.watch_status === "PAUSED"
      ).length,

    escalated:
      watchlists.filter(
        x => x.watch_status === "ESCALATED"
      ).length,

    closed:
      watchlists.filter(
        x => x.watch_status === "CLOSED"
      ).length

  };
}

function getWatchById(watchId){

  const watch =
    (window.UmbraWatchlistRegistry?.watchlists || [])
      .find(x => x.watch_id === watchId);

  return {
    id:"PHASE_7_WATCH_LOOKUP_V1",
    batch:379,
    runtime_visible:true,
    status:watch ? "FOUND" : "NOT_FOUND",
    watch
  };
}

window.UmbraBuildWatchlistRegistry =
  buildWatchlistRegistry;

window.UmbraGetWatchlistMetrics =
  getWatchlistMetrics;

window.UmbraGetWatchById =
  getWatchById;

window.UmbraWatchlistFoundation = {

  id:
    "PHASE_7_WATCHLIST_FOUNDATION_V1",

  batch:
    379,

  phase:
    "PHASE 7",

  phase_name:
    "Intelligence Operations",

  status:
    "ACTIVE",

  runtime_visible:
    true,

  registry_function:
    "window.UmbraBuildWatchlistRegistry",

  metrics_function:
    "window.UmbraGetWatchlistMetrics",

  lookup_function:
    "window.UmbraGetWatchById",

  activated_at:
    new Date().toISOString()

};

console.log(
  "[BATCH 379] Watchlist Foundation active",
  window.UmbraWatchlistFoundation
);

})();
