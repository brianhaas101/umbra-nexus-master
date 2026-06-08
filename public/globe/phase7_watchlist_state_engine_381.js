// BATCH_381_PHASE7_WATCHLIST_STATE_ENGINE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_381_WATCHLIST_STATE_ENGINE) return;

window.__UMBRA_BATCH_381_WATCHLIST_STATE_ENGINE = true;

const VALID_STATES = [
  "ACTIVE",
  "PAUSED",
  "ESCALATED",
  "CLOSED"
];

function getWatch(watchId){

  const watchlists =
    window.UmbraWatchlistRegistry?.watchlists || [];

  return watchlists.find(
    x => x.watch_id === watchId
  );
}

function updateWatchState(
  watchId,
  newState,
  note
){

  const watch =
    getWatch(watchId);

  if(!watch){
    return {
      id:"PHASE_7_WATCHLIST_STATE_UPDATE_V1",
      batch:381,
      status:"WATCH_NOT_FOUND"
    };
  }

  if(!VALID_STATES.includes(newState)){
    return {
      id:"PHASE_7_WATCHLIST_STATE_UPDATE_V1",
      batch:381,
      status:"INVALID_STATE"
    };
  }

  watch.state_history =
    watch.state_history || [];

  watch.state_history.push({
    from:watch.watch_status,
    to:newState,
    note:note || null,
    timestamp:new Date().toISOString()
  });

  watch.watch_status = newState;
  watch.updated_at = new Date().toISOString();

  return {
    id:"PHASE_7_WATCHLIST_STATE_UPDATE_V1",
    batch:381,
    runtime_visible:true,
    status:"UPDATED",
    watch_id:watchId,
    new_state:newState
  };
}

function getWatchlistStateSummary(){

  const watchlists =
    window.UmbraWatchlistRegistry?.watchlists || [];

  return {
    id:"PHASE_7_WATCHLIST_STATE_SUMMARY_V1",
    batch:381,
    runtime_visible:true,

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
      ).length,

    watch_count:
      watchlists.length
  };
}

window.UmbraUpdateWatchState =
  updateWatchState;

window.UmbraGetWatchlistStateSummary =
  getWatchlistStateSummary;

window.UmbraWatchlistStateEngine = {
  id:"PHASE_7_WATCHLIST_STATE_ENGINE_V1",
  batch:381,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  valid_states:VALID_STATES,
  activated_at:new Date().toISOString()
};

console.log(
  "[BATCH 381] Watchlist State Engine active",
  window.UmbraWatchlistStateEngine
);

})();
