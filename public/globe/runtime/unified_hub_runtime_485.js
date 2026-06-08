(function(){

"use strict";

const MODULE_ID =
"NEXUS_UNIFIED_HUB_RUNTIME_485";

const REQUIRED_GLOBALS = {
  hubShell: "UmbraUnifiedHubShell",
  centerRegistry: "UmbraCenterBindingRegistry"
};

const runtimeState = {

  module:
  MODULE_ID,

  batch:
  485,

  status:
  "ACTIVE",

  activeCenter:
  null,

  activeModules:
  [],

  registryAvailable:
  false,

  shellAvailable:
  false,

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

  runtimeState.events.push(event);

  if(runtimeState.events.length > 250){
    runtimeState.events.shift();
  }

  window.dispatchEvent(
    new CustomEvent(
      "umbra:hub-runtime:event",
      { detail: event }
    )
  );

  return event;

}

function getShell(){

  return window[
    REQUIRED_GLOBALS.hubShell
  ] || null;

}

function getRegistryGlobal(){

  return window[
    REQUIRED_GLOBALS.centerRegistry
  ] || null;

}

function refreshDependencies(){

  runtimeState.shellAvailable =
  !!getShell();

  runtimeState.registryAvailable =
  !!getRegistryGlobal();

  emit(
    "DEPENDENCIES_REFRESHED",
    {
      shellAvailable:
      runtimeState.shellAvailable,

      registryAvailable:
      runtimeState.registryAvailable
    }
  );

  return {
    shellAvailable:
    runtimeState.shellAvailable,

    registryAvailable:
    runtimeState.registryAvailable
  };

}

function getRegistry(){

  const registry =
  getRegistryGlobal();

  if(
    !registry ||
    typeof registry.getRegistry !== "function"
  ){
    return {};
  }

  return registry.getRegistry();

}

function getActiveCenter(){

  return runtimeState.activeCenter;

}

function getActiveModules(){

  return clone(
    runtimeState.activeModules
  );

}

function activateCenter(
  center
){

  refreshDependencies();

  const shell =
  getShell();

  const registry =
  getRegistryGlobal();

  if(
    !shell ||
    typeof shell.setActiveCenter !== "function"
  ){

    emit(
      "ACTIVATION_FAILED",
      {
        center,
        reason:
        "HUB_SHELL_UNAVAILABLE"
      }
    );

    return false;

  }

  if(
    !registry ||
    typeof registry.getCenter !== "function"
  ){

    emit(
      "ACTIVATION_FAILED",
      {
        center,
        reason:
        "CENTER_REGISTRY_UNAVAILABLE"
      }
    );

    return false;

  }

  const shellAccepted =
  shell.setActiveCenter(center);

  if(!shellAccepted){

    emit(
      "ACTIVATION_FAILED",
      {
        center,
        reason:
        "CENTER_REJECTED_BY_SHELL"
      }
    );

    return false;

  }

  const modules =
  registry.getCenter(center);

  runtimeState.activeCenter =
  center;

  runtimeState.activeModules =
  Array.isArray(modules)
    ? [...modules]
    : [];

  const activation = {

    center,

    modules:
    [...runtimeState.activeModules],

    moduleCount:
    runtimeState.activeModules.length,

    timestamp:
    new Date().toISOString()

  };

  runtimeState.activations.push(activation);

  if(runtimeState.activations.length > 100){
    runtimeState.activations.shift();
  }

  emit(
    "CENTER_ACTIVATED",
    activation
  );

  window.dispatchEvent(
    new CustomEvent(
      "umbra:hub:center-activated",
      {
        detail:
        activation
      }
    )
  );

  return true;

}

function activateDefault(){

  const shell =
  getShell();

  let defaultCenter =
  "COMMAND_CENTER";

  if(
    shell &&
    typeof shell.getActiveCenter === "function"
  ){
    defaultCenter =
    shell.getActiveCenter() || defaultCenter;
  }

  return activateCenter(
    defaultCenter
  );

}

function getState(){

  return clone({
    module:
    MODULE_ID,

    batch:
    485,

    status:
    runtimeState.status,

    shellAvailable:
    runtimeState.shellAvailable,

    registryAvailable:
    runtimeState.registryAvailable,

    activeCenter:
    runtimeState.activeCenter,

    activeModules:
    runtimeState.activeModules,

    activeModuleCount:
    runtimeState.activeModules.length,

    activations:
    runtimeState.activations,

    events:
    runtimeState.events,

    createdAt:
    runtimeState.createdAt
  });

}

window.UmbraUnifiedHubRuntime = {

  id:
  MODULE_ID,

  batch:
  485,

  refreshDependencies,

  activateCenter,

  activateDefault,

  getRegistry,

  getActiveCenter,

  getActiveModules,

  getState

};

refreshDependencies();

activateDefault();

console.log(
  MODULE_ID,
  getState()
);

})();
