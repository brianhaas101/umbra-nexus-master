(function(){

"use strict";

const MODULE_ID =
"NEXUS_WORKSPACE_ACTIVATION_ENGINE_487";

const REQUIRED_GLOBALS = {
  hubRuntime:
  "UmbraUnifiedHubRuntime",

  mountRegistry:
  "UmbraSurfaceMountRegistry"
};

const state = {

  module:
  MODULE_ID,

  batch:
  487,

  status:
  "ACTIVE",

  hubRuntimeAvailable:
  false,

  mountRegistryAvailable:
  false,

  activeCenter:
  null,

  activeModules:
  [],

  activeMounts:
  [],

  activations:
  [],

  events:
  [],

  createdAt:
  new Date().toISOString()

};

function clone(value){

  return JSON.parse(
    JSON.stringify(value)
  );

}

function emit(
  type,
  payload = {}
){

  const event = {

    type,

    payload,

    timestamp:
    new Date().toISOString()

  };

  state.events.push(event);

  if(state.events.length > 250){
    state.events.shift();
  }

  window.dispatchEvent(
    new CustomEvent(
      "umbra:workspace-activation:event",
      {
        detail:
        event
      }
    )
  );

  return event;

}

function getHubRuntime(){

  return window[
    REQUIRED_GLOBALS.hubRuntime
  ] || null;

}

function getMountRegistry(){

  return window[
    REQUIRED_GLOBALS.mountRegistry
  ] || null;

}

function refreshDependencies(){

  state.hubRuntimeAvailable =
  !!getHubRuntime();

  state.mountRegistryAvailable =
  !!getMountRegistry();

  emit(
    "DEPENDENCIES_REFRESHED",
    {
      hubRuntimeAvailable:
      state.hubRuntimeAvailable,

      mountRegistryAvailable:
      state.mountRegistryAvailable
    }
  );

  return {

    hubRuntimeAvailable:
    state.hubRuntimeAvailable,

    mountRegistryAvailable:
    state.mountRegistryAvailable

  };

}

function resolveCenterMounts(
  center
){

  const registry =
  getMountRegistry();

  if(
    !registry ||
    typeof registry.getMounts !== "function"
  ){

    return [];

  }

  const mounts =
  registry.getMounts(center);

  return Array.isArray(mounts)
    ? clone(mounts)
    : [];

}

function activateCenter(
  center
){

  refreshDependencies();

  const hub =
  getHubRuntime();

  if(
    !hub ||
    typeof hub.activateCenter !== "function"
  ){

    emit(
      "WORKSPACE_ACTIVATION_FAILED",
      {
        center,
        reason:
        "HUB_RUNTIME_UNAVAILABLE"
      }
    );

    return false;

  }

  const activated =
  hub.activateCenter(center);

  if(!activated){

    emit(
      "WORKSPACE_ACTIVATION_FAILED",
      {
        center,
        reason:
        "HUB_RUNTIME_REJECTED_CENTER"
      }
    );

    return false;

  }

  const activeModules =
  typeof hub.getActiveModules === "function"
    ? hub.getActiveModules()
    : [];

  const activeMounts =
  resolveCenterMounts(center);

  state.activeCenter =
  center;

  state.activeModules =
  Array.isArray(activeModules)
    ? clone(activeModules)
    : [];

  state.activeMounts =
  activeMounts;

  const activation = {

    center,

    modules:
    clone(state.activeModules),

    mounts:
    clone(state.activeMounts),

    moduleCount:
    state.activeModules.length,

    mountCount:
    state.activeMounts.length,

    timestamp:
    new Date().toISOString()

  };

  state.activations.push(activation);

  if(state.activations.length > 100){
    state.activations.shift();
  }

  emit(
    "WORKSPACE_CENTER_ACTIVATED",
    activation
  );

  window.dispatchEvent(
    new CustomEvent(
      "umbra:workspace:center-activated",
      {
        detail:
        activation
      }
    )
  );

  return true;

}

function activateCurrent(){

  const hub =
  getHubRuntime();

  let center =
  "COMMAND_CENTER";

  if(
    hub &&
    typeof hub.getActiveCenter === "function" &&
    hub.getActiveCenter()
  ){

    center =
    hub.getActiveCenter();

  }

  return activateCenter(center);

}

function getActiveCenter(){

  return state.activeCenter;

}

function getActiveModules(){

  return clone(
    state.activeModules
  );

}

function getActiveMounts(){

  return clone(
    state.activeMounts
  );

}

function getState(){

  return clone({

    module:
    MODULE_ID,

    batch:
    487,

    status:
    state.status,

    hubRuntimeAvailable:
    state.hubRuntimeAvailable,

    mountRegistryAvailable:
    state.mountRegistryAvailable,

    activeCenter:
    state.activeCenter,

    activeModules:
    state.activeModules,

    activeMounts:
    state.activeMounts,

    activeModuleCount:
    state.activeModules.length,

    activeMountCount:
    state.activeMounts.length,

    activations:
    state.activations,

    events:
    state.events,

    createdAt:
    state.createdAt

  });

}

window.UmbraWorkspaceActivationEngine = {

  id:
  MODULE_ID,

  batch:
  487,

  refreshDependencies,

  resolveCenterMounts,

  activateCenter,

  activateCurrent,

  getActiveCenter,

  getActiveModules,

  getActiveMounts,

  getState

};

refreshDependencies();

activateCurrent();

console.log(
  MODULE_ID,
  getState()
);

})();
