(function(){

"use strict";

const MODULE_ID =
"UNIFIED_HUB_SHELL_483";

const NAVIGATION = [

  "COMMAND_CENTER",

  "INTELLIGENCE_CENTER",

  "DOSSIER_CENTER",

  "OPERATIONS_CENTER",

  "AUTOMATION_CENTER",

  "GOVERNANCE_CENTER",

  "RUNTIME_CENTER",

  "SYSTEM_SETTINGS"

];

let activeCenter =
"COMMAND_CENTER";

const state = {

  module:
  MODULE_ID,

  batch:
  483,

  status:
  "ACTIVE",

  navigation:
  [...NAVIGATION],

  activeCenter,

  createdAt:
  new Date().toISOString(),

  events: []

};

function emit(
  event,
  payload = {}
){

  state.events.push({

    timestamp:
    new Date().toISOString(),

    event,

    payload

  });

  if(
    state.events.length > 250
  ){
    state.events.shift();
  }

  return true;
}

function getCenters(){

  return [...NAVIGATION];

}

function getNavigation(){

  return [...NAVIGATION];

}

function getActiveCenter(){

  return activeCenter;

}

function setActiveCenter(
  center
){

  if(
    !NAVIGATION.includes(center)
  ){
    return false;
  }

  activeCenter = center;

  state.activeCenter =
  center;

  emit(
    "CENTER_CHANGED",
    { center }
  );

  window.dispatchEvent(
    new CustomEvent(
      "umbra:hub:center-change",
      {
        detail: {
          center
        }
      }
    )
  );

  return true;
}

function getState(){

  return JSON.parse(
    JSON.stringify(state)
  );

}

emit(
  "UNIFIED_HUB_INITIALIZED",
  {
    defaultCenter:
    activeCenter
  }
);

window.UmbraUnifiedHubShell = {

  id:
  MODULE_ID,

  batch:
  483,

  getCenters,

  getNavigation,

  getActiveCenter,

  setActiveCenter,

  getState

};

console.log(
  MODULE_ID,
  getState()
);

})();
