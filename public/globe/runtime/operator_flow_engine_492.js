(function(){

"use strict";

const MODULE_ID =
"NEXUS_OPERATOR_FLOW_ENGINE_492";

const state = {

  module:
  MODULE_ID,

  batch:
  492,

  status:
  "ACTIVE",

  mode:
  "SAFE_ACTION_DISPATCH",

  routerAvailable:
  false,

  orchestratorAvailable:
  false,

  mountManagerAvailable:
  false,

  navigationAvailable:
  false,

  activeCenter:
  null,

  activeFlow:
  null,

  flowHistory:
  [],

  actionHistory:
  [],

  registeredActions:
  {},

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

  if(state.events.length > 300){
    state.events.shift();
  }

  window.dispatchEvent(
    new CustomEvent(
      "umbra:operator-flow:event",
      {
        detail:
        event
      }
    )
  );

  return event;

}

function getRouter(){
  return window.UmbraWorkspaceRouter || null;
}

function getOrchestrator(){
  return window.UmbraSurfaceOrchestrator || null;
}

function getMountManager(){
  return window.UmbraWorkspaceMountManager || null;
}

function getNavigation(){
  return window.UmbraUnifiedNavigationUI || null;
}

function refreshDependencies(){

  state.routerAvailable =
  !!getRouter();

  state.orchestratorAvailable =
  !!getOrchestrator();

  state.mountManagerAvailable =
  !!getMountManager();

  state.navigationAvailable =
  !!getNavigation();

  emit(
    "DEPENDENCIES_REFRESHED",
    {
      routerAvailable:
      state.routerAvailable,

      orchestratorAvailable:
      state.orchestratorAvailable,

      mountManagerAvailable:
      state.mountManagerAvailable,

      navigationAvailable:
      state.navigationAvailable
    }
  );

  return {
    routerAvailable:
    state.routerAvailable,

    orchestratorAvailable:
    state.orchestratorAvailable,

    mountManagerAvailable:
    state.mountManagerAvailable,

    navigationAvailable:
    state.navigationAvailable
  };

}

function normalizeAction(action){

  if(typeof action === "string"){
    return {
      type:
      action,
      center:
      null,
      payload:
      {}
    };
  }

  action =
  action || {};

  return {

    type:
    action.type || "UNKNOWN_ACTION",

    center:
    action.center || action.targetCenter || null,

    payload:
    action.payload || {},

    source:
    action.source || "OPERATOR",

    requestedAt:
    new Date().toISOString()

  };

}

function rememberAction(action,result){

  const record = {
    action:
    clone(action),

    result:
    clone(result),

    timestamp:
    new Date().toISOString()
  };

  state.actionHistory.push(record);

  if(state.actionHistory.length > 150){
    state.actionHistory.shift();
  }

  return record;

}

function rememberFlow(flow){

  state.activeFlow =
  clone(flow);

  state.flowHistory.push(clone(flow));

  if(state.flowHistory.length > 100){
    state.flowHistory.shift();
  }

  window.dispatchEvent(
    new CustomEvent(
      "umbra:operator-flow-resolved",
      {
        detail:
        clone(flow)
      }
    )
  );

  return flow;

}

function resolveActiveCenter(){

  const orchestrator =
  getOrchestrator();

  if(
    orchestrator &&
    typeof orchestrator.getActiveCenter === "function"
  ){
    return orchestrator.getActiveCenter();
  }

  const router =
  getRouter();

  if(
    router &&
    typeof router.getActiveCenter === "function"
  ){
    return router.getActiveCenter();
  }

  const navigation =
  getNavigation();

  if(
    navigation &&
    typeof navigation.getActiveCenter === "function"
  ){
    return navigation.getActiveCenter();
  }

  return state.activeCenter;

}

function buildFlow(action,result){

  const router =
  getRouter();

  const orchestrator =
  getOrchestrator();

  const mountManager =
  getMountManager();

  const route =
  router &&
  typeof router.getActiveRoute === "function"
    ? router.getActiveRoute()
    : null;

  const surfaces =
  orchestrator &&
  typeof orchestrator.getActiveSurfaces === "function"
    ? orchestrator.getActiveSurfaces()
    : [];

  const mounts =
  mountManager &&
  typeof mountManager.getMountTargets === "function"
    ? mountManager.getMountTargets()
    : [];

  const flow = {

    id:
    [
      "FLOW",
      Date.now(),
      Math.random().toString(36).slice(2,8)
    ].join("_"),

    module:
    MODULE_ID,

    batch:
    492,

    action:
    clone(action),

    result:
    clone(result),

    center:
    resolveActiveCenter(),

    route:
    clone(route),

    surfaces:
    clone(surfaces || []),

    mounts:
    clone(mounts || []),

    surfaceCount:
    Array.isArray(surfaces) ? surfaces.length : 0,

    mountTargetCount:
    Array.isArray(mounts) ? mounts.length : 0,

    timestamp:
    new Date().toISOString()

  };

  state.activeCenter =
  flow.center;

  return rememberFlow(flow);

}

function routeTo(center){

  refreshDependencies();

  const action =
  normalizeAction({
    type:
    "ROUTE_TO_CENTER",

    center:
    center,

    source:
    "OPERATOR_FLOW_ENGINE"
  });

  const orchestrator =
  getOrchestrator();

  const mountManager =
  getMountManager();

  if(
    !orchestrator ||
    typeof orchestrator.orchestrateRoute !== "function"
  ){

    const failed = {
      ok:
      false,

      reason:
      "SURFACE_ORCHESTRATOR_UNAVAILABLE"
    };

    rememberAction(action,failed);

    emit(
      "OPERATOR_FLOW_FAILED",
      {
        action,
        result:
        failed
      }
    );

    return false;

  }

  const routed =
  orchestrator.orchestrateRoute(center);

  if(
    routed &&
    mountManager &&
    typeof mountManager.inspectCurrent === "function"
  ){
    mountManager.inspectCurrent();
  }

  const result = {
    ok:
    !!routed,

    center:
    center,

    routed:
    !!routed,

    inspected:
    !!(
      routed &&
      mountManager &&
      typeof mountManager.inspectCurrent === "function"
    )
  };

  rememberAction(action,result);

  buildFlow(action,result);

  emit(
    routed
      ? "OPERATOR_FLOW_ROUTED"
      : "OPERATOR_FLOW_REJECTED",
    {
      action,
      result
    }
  );

  return !!routed;

}

function inspectRoute(center){

  refreshDependencies();

  const action =
  normalizeAction({
    type:
    "INSPECT_ROUTE",

    center:
    center,

    source:
    "OPERATOR_FLOW_ENGINE"
  });

  const mountManager =
  getMountManager();

  if(
    !mountManager ||
    typeof mountManager.inspectRoute !== "function"
  ){

    const failed = {
      ok:
      false,

      reason:
      "WORKSPACE_MOUNT_MANAGER_UNAVAILABLE"
    };

    rememberAction(action,failed);

    emit(
      "OPERATOR_FLOW_FAILED",
      {
        action,
        result:
        failed
      }
    );

    return false;

  }

  const inspected =
  mountManager.inspectRoute(center);

  const result = {
    ok:
    !!inspected,

    center:
    center,

    inspected:
    !!inspected
  };

  rememberAction(action,result);

  buildFlow(action,result);

  emit(
    inspected
      ? "OPERATOR_FLOW_INSPECTED"
      : "OPERATOR_FLOW_REJECTED",
    {
      action,
      result
    }
  );

  return !!inspected;

}

function createFlow(center){

  refreshDependencies();

  const targetCenter =
  center || resolveActiveCenter();

  const action =
  normalizeAction({
    type:
    "CREATE_FLOW",

    center:
    targetCenter,

    source:
    "OPERATOR_FLOW_ENGINE"
  });

  const result = {
    ok:
    true,

    center:
    targetCenter
  };

  rememberAction(action,result);

  const flow =
  buildFlow(action,result);

  emit(
    "OPERATOR_FLOW_CREATED",
    flow
  );

  return clone(flow);

}

function registerActionHandler(type,handler){

  if(
    !type ||
    typeof handler !== "function"
  ){
    return false;
  }

  state.registeredActions[type] =
  handler;

  emit(
    "ACTION_HANDLER_REGISTERED",
    {
      type
    }
  );

  return true;

}

function unregisterActionHandler(type){

  if(!type){
    return false;
  }

  if(state.registeredActions[type]){
    delete state.registeredActions[type];

    emit(
      "ACTION_HANDLER_UNREGISTERED",
      {
        type
      }
    );

    return true;
  }

  return false;

}

function dispatchAction(actionInput){

  refreshDependencies();

  const action =
  normalizeAction(actionInput);

  let result = {
    ok:
    false,

    reason:
    "UNHANDLED_ACTION"
  };

  if(action.type === "ROUTE_TO_CENTER"){
    return routeTo(action.center);
  }

  if(action.type === "INSPECT_ROUTE"){
    return inspectRoute(action.center);
  }

  if(action.type === "CREATE_FLOW"){
    return createFlow(action.center);
  }

  const handler =
  state.registeredActions[action.type];

  if(typeof handler === "function"){

    try{

      const handlerResult =
      handler(
        clone(action),
        {
          routeTo,
          inspectRoute,
          createFlow,
          getState
        }
      );

      result = {
        ok:
        true,

        handler:
        action.type,

        value:
        handlerResult || null
      };

    }catch(error){

      result = {
        ok:
        false,

        reason:
        "ACTION_HANDLER_ERROR",

        message:
        error && error.message
          ? error.message
          : String(error)
      };

    }

  }

  rememberAction(action,result);

  buildFlow(action,result);

  emit(
    result.ok
      ? "OPERATOR_ACTION_DISPATCHED"
      : "OPERATOR_ACTION_REJECTED",
    {
      action,
      result
    }
  );

  return clone(result);

}

function getActionHistory(){
  return clone(state.actionHistory);
}

function getFlowHistory(){
  return clone(state.flowHistory);
}

function getRegisteredActions(){
  return Object.keys(state.registeredActions);
}

function getActiveFlow(){
  return clone(state.activeFlow);
}

function getState(){

  return clone({

    module:
    MODULE_ID,

    batch:
    492,

    status:
    state.status,

    mode:
    state.mode,

    routerAvailable:
    state.routerAvailable,

    orchestratorAvailable:
    state.orchestratorAvailable,

    mountManagerAvailable:
    state.mountManagerAvailable,

    navigationAvailable:
    state.navigationAvailable,

    activeCenter:
    state.activeCenter,

    activeFlow:
    state.activeFlow,

    flowHistory:
    state.flowHistory,

    flowHistoryCount:
    state.flowHistory.length,

    actionHistory:
    state.actionHistory,

    actionHistoryCount:
    state.actionHistory.length,

    registeredActions:
    getRegisteredActions(),

    registeredActionCount:
    getRegisteredActions().length,

    events:
    state.events,

    createdAt:
    state.createdAt

  });

}

window.UmbraOperatorFlowEngine = {

  id:
  MODULE_ID,

  batch:
  492,

  refreshDependencies,

  createFlow,

  routeTo,

  inspectRoute,

  dispatchAction,

  registerActionHandler,

  unregisterActionHandler,

  getRegisteredActions,

  getActionHistory,

  getFlowHistory,

  getActiveFlow,

  getState

};

refreshDependencies();

createFlow();

console.log(
  MODULE_ID,
  getState()
);

})();
