// BATCH_386_PHASE7_ALERT_STATE_ENGINE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_386_ALERT_STATE_ENGINE) return;

window.__UMBRA_BATCH_386_ALERT_STATE_ENGINE = true;

const VALID_STATES = [
  "OPEN",
  "ACKNOWLEDGED",
  "RESOLVED",
  "DISMISSED"
];

function getAlert(alertId){

  const alerts =
    window.UmbraAlertRegistry?.alerts || [];

  return alerts.find(
    x => x.alert_id === alertId
  );
}

function updateAlertState(
  alertId,
  newState,
  note
){

  const alert =
    getAlert(alertId);

  if(!alert){
    return {
      id:"PHASE_7_ALERT_STATE_UPDATE_V1",
      batch:386,
      status:"ALERT_NOT_FOUND"
    };
  }

  if(!VALID_STATES.includes(newState)){
    return {
      id:"PHASE_7_ALERT_STATE_UPDATE_V1",
      batch:386,
      status:"INVALID_STATE"
    };
  }

  alert.state_history =
    alert.state_history || [];

  alert.state_history.push({
    from:alert.alert_status,
    to:newState,
    note:note || null,
    timestamp:new Date().toISOString()
  });

  alert.alert_status = newState;
  alert.updated_at = new Date().toISOString();

  alert.acknowledged =
    newState === "ACKNOWLEDGED" ||
    alert.acknowledged === true;

  alert.resolved =
    newState === "RESOLVED" ||
    alert.resolved === true;

  return {
    id:"PHASE_7_ALERT_STATE_UPDATE_V1",
    batch:386,
    runtime_visible:true,
    status:"UPDATED",
    alert_id:alertId,
    new_state:newState
  };
}

function getAlertStateSummary(){

  const alerts =
    window.UmbraAlertRegistry?.alerts || [];

  return {
    id:"PHASE_7_ALERT_STATE_SUMMARY_V1",
    batch:386,
    runtime_visible:true,

    open:
      alerts.filter(
        x => x.alert_status === "OPEN"
      ).length,

    acknowledged:
      alerts.filter(
        x => x.alert_status === "ACKNOWLEDGED"
      ).length,

    resolved:
      alerts.filter(
        x => x.alert_status === "RESOLVED"
      ).length,

    dismissed:
      alerts.filter(
        x => x.alert_status === "DISMISSED"
      ).length,

    alert_count:
      alerts.length
  };
}

window.UmbraUpdateAlertState =
  updateAlertState;

window.UmbraGetAlertStateSummary =
  getAlertStateSummary;

window.UmbraAlertStateEngine = {
  id:"PHASE_7_ALERT_STATE_ENGINE_V1",
  batch:386,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  valid_states:VALID_STATES,
  activated_at:new Date().toISOString()
};

console.log(
  "[BATCH 386] Alert State Engine active",
  window.UmbraAlertStateEngine
);

})();
