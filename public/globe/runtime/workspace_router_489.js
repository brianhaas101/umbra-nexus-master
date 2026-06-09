(function(){

"use strict";

const MODULE_ID =
"NEXUS_WORKSPACE_ROUTER_489";

const state = {

  module:
  MODULE_ID,

  batch:
  489,

  status:
  "ACTIVE",

  activeCenter:
  null,

  activeRoute:
  null,

  activeModules:
  [],

  activeMounts:
  [],

  routes:
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

function emit(type,payload = {}){

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
      "umbra:workspace-router:event",
      { detail: event }
    )
  );

  return event;

}

function getActivationEngine(){

  return window.UmbraWorkspaceActivationEngine || null;

}

function getNavigationUI(){

  return window.UmbraUnifiedNavigationUI || null;

}

function resolveRoute(center){

  const engine =
  getActivationEngine();

  if(
    !engine ||
    typeof engine.activateCenter !== "function"
  ){

    emit(
      "ROUTE_FAILED",
      {
        center,
        reason:
        "WORKSPACE_ACTIVATION_ENGINE_UNAVAILABLE"
      }
    );

    return false;

  }

  const activated =
  engine.activateCenter(center);

  if(!activated){

    emit(
      "ROUTE_FAILED",
      {
        center,
        reason:
        "WORKSPACE_ACTIVATION_REJECTED"
      }
    );

    return false;

  }

  const modules =
  typeof engine.getActiveModules === "function"
    ? engine.getActiveModules()
    : [];

  const mounts =
  typeof engine.getActiveMounts === "function"
    ? engine.getActiveMounts()
    : [];

  const primaryMount =
  mounts.find(function(m){
    return m.type === "WORKSPACE";
  }) || mounts[0] || null;

  const route = {

    center,

    primaryModule:
    primaryMount ? primaryMount.module : null,

    primaryMount:
    primaryMount ? primaryMount.mount : null,

    surfaceType:
    primaryMount ? primaryMount.type : null,

    modules:
    clone(modules),

    mounts:
    clone(mounts),

    moduleCount:
    modules.length,

    mountCount:
    mounts.length,

    timestamp:
    new Date().toISOString()

  };

  state.activeCenter =
  center;

  state.activeRoute =
  route;

  state.activeModules =
  clone(modules);

  state.activeMounts =
  clone(mounts);

  state.routes.push(route);

  if(state.routes.length > 100){
    state.routes.shift();
  }

  emit(
    "ROUTE_RESOLVED",
    route
  );

  window.dispatchEvent(
    new CustomEvent(
      "umbra:workspace-route-resolved",
      {
        detail:
        route
      }
    )
  );

  return true;

}

function routeTo(center){

  return resolveRoute(center);

}

function routeCurrent(){

  const nav =
  getNavigationUI();

  let center =
  "COMMAND_CENTER";

  if(
    nav &&
    typeof nav.getActiveCenter === "function" &&
    nav.getActiveCenter()
  ){

    center =
    nav.getActiveCenter();

  }

  return routeTo(center);

}

function getActiveRoute(){

  return clone(
    state.activeRoute
  );

}

function getActiveCenter(){

  return state.activeCenter;

}

function getRoutes(){

  return clone(
    state.routes
  );

}

function getState(){

  return clone({

    module:
    MODULE_ID,

    batch:
    489,

    status:
    state.status,

    activationEngineAvailable:
    !!getActivationEngine(),

    navigationUIAvailable:
    !!getNavigationUI(),

    activeCenter:
    state.activeCenter,

    activeRoute:
    state.activeRoute,

    activeModules:
    state.activeModules,

    activeMounts:
    state.activeMounts,

    routeCount:
    state.routes.length,

    routes:
    state.routes,

    events:
    state.events,

    createdAt:
    state.createdAt

  });

}

window.UmbraWorkspaceRouter = {

  id:
  MODULE_ID,

  batch:
  489,

  routeTo,

  routeCurrent,

  resolveRoute,

  getActiveRoute,

  getActiveCenter,

  getRoutes,

  getState

};

routeCurrent();

console.log(
  MODULE_ID,
  getState()
);

})();
