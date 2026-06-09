(function(){

"use strict";

const MODULE_ID =
"NEXUS_CONTEXT_SWITCHING_ENGINE_494";

const state = {

  module:
  MODULE_ID,

  batch:
  494,

  status:
  "ACTIVE",

  mode:
  "SAFE_CONTEXT_TRANSFER",

  operatorFlowAvailable:
  false,

  persistenceAvailable:
  false,

  activeContext:
  null,

  previousContext:
  null,

  contextStack:
  [],

  switchHistory:
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

  if(state.events.length > 300){
    state.events.shift();
  }

  window.dispatchEvent(
    new CustomEvent(
      "umbra:context-switching:event",
      {
        detail:
        event
      }
    )
  );

  return event;

}

function getOperatorFlow(){
  return window.UmbraOperatorFlowEngine || null;
}

function getPersistence(){
  return window.UmbraWorkspacePersistence || null;
}

function refreshDependencies(){

  state.operatorFlowAvailable =
  !!getOperatorFlow();

  state.persistenceAvailable =
  !!getPersistence();

  emit(
    "DEPENDENCIES_REFRESHED",
    {
      operatorFlowAvailable:
      state.operatorFlowAvailable,

      persistenceAvailable:
      state.persistenceAvailable
    }
  );

  return {
    operatorFlowAvailable:
    state.operatorFlowAvailable,

    persistenceAvailable:
    state.persistenceAvailable
  };

}

function normalizeContext(center){

  if(!center){
    return null;
  }

  return String(center).trim();

}

function recordSwitch(previous,active,reason,result){

  const record = {

    previous:
    previous || null,

    active:
    active || null,

    reason:
    reason || "MANUAL",

    result:
    result || {},

    timestamp:
    new Date().toISOString()

  };

  state.switchHistory.push(record);

  if(state.switchHistory.length > 150){
    state.switchHistory.shift();
  }

  return record;

}

function saveBeforeSwitch(center){

  const persistence =
  getPersistence();

  if(
    persistence &&
    typeof persistence.saveWorkspace === "function"
  ){

    return persistence.saveWorkspace(
      "CONTEXT_SWITCH_TO_" + center
    );

  }

  return false;

}

function routeToContext(center){

  const operatorFlow =
  getOperatorFlow();

  if(
    operatorFlow &&
    typeof operatorFlow.routeTo === "function"
  ){

    return operatorFlow.routeTo(center);

  }

  return false;

}

function pushContext(center){

  const normalized =
  normalizeContext(center);

  if(!normalized){

    emit(
      "CONTEXT_PUSH_REJECTED",
      {
        reason:
        "INVALID_CONTEXT"
      }
    );

    return false;

  }

  state.contextStack.push(normalized);

  emit(
    "CONTEXT_PUSHED",
    {
      center:
      normalized,

      depth:
      state.contextStack.length
    }
  );

  return true;

}

function switchContext(center,reason){

  refreshDependencies();

  const normalized =
  normalizeContext(center);

  if(!normalized){

    emit(
      "CONTEXT_SWITCH_REJECTED",
      {
        reason:
        "INVALID_CONTEXT",

        center:
        center || null
      }
    );

    return false;

  }

  const previous =
  state.activeContext;

  const saved =
  saveBeforeSwitch(normalized);

  state.previousContext =
  previous;

  state.activeContext =
  normalized;

  pushContext(normalized);

  const routed =
  routeToContext(normalized);

  const result = {
    ok:
    true,

    saved:
    !!saved,

    routed:
    !!routed,

    active:
    state.activeContext,

    previous:
    state.previousContext
  };

  const record =
  recordSwitch(
    previous,
    normalized,
    reason || "MANUAL_CONTEXT_SWITCH",
    result
  );

  emit(
    "CONTEXT_SWITCHED",
    {
      previous:
      previous,

      active:
      normalized,

      saved:
      !!saved,

      routed:
      !!routed,

      record:
      record
    }
  );

  window.dispatchEvent(
    new CustomEvent(
      "umbra:context-switched",
      {
        detail:
        {
          previous:
          previous,

          active:
          normalized,

          saved:
          !!saved,

          routed:
          !!routed,

          record:
          record
        }
      }
    )
  );

  return true;

}

function popContext(){

  refreshDependencies();

  if(state.contextStack.length < 2){

    emit(
      "CONTEXT_POP_REJECTED",
      {
        reason:
        "INSUFFICIENT_CONTEXT_DEPTH",

        depth:
        state.contextStack.length
      }
    );

    return false;

  }

  const current =
  state.contextStack.pop();

  const target =
  state.contextStack[
    state.contextStack.length - 1
  ];

  state.contextStack.pop();

  const switched =
  switchContext(
    target,
    "POP_CONTEXT"
  );

  emit(
    "CONTEXT_POPPED",
    {
      from:
      current,

      to:
      target,

      switched:
      !!switched
    }
  );

  return !!switched;

}

function clearContextStack(){

  state.contextStack = [];

  emit(
    "CONTEXT_STACK_CLEARED",
    {
      depth:
      0
    }
  );

  return true;

}

function restorePersistedContext(){

  refreshDependencies();

  const persistence =
  getPersistence();

  if(
    !persistence ||
    typeof persistence.loadSnapshot !== "function"
  ){

    emit(
      "PERSISTED_CONTEXT_RESTORE_SKIPPED",
      {
        reason:
        "PERSISTENCE_UNAVAILABLE"
      }
    );

    return false;

  }

  const snapshot =
  persistence.loadSnapshot();

  if(
    !snapshot ||
    !snapshot.activeCenter
  ){

    emit(
      "PERSISTED_CONTEXT_RESTORE_SKIPPED",
      {
        reason:
        "NO_ACTIVE_CENTER_IN_SNAPSHOT"
      }
    );

    return false;

  }

  const restored =
  switchContext(
    snapshot.activeCenter,
    "RESTORE_PERSISTED_CONTEXT"
  );

  emit(
    "PERSISTED_CONTEXT_RESTORED",
    {
      activeCenter:
      snapshot.activeCenter,

      restored:
      !!restored
    }
  );

  return !!restored;

}

function getActiveContext(){
  return state.activeContext;
}

function getPreviousContext(){
  return state.previousContext;
}

function getContextStack(){
  return clone(state.contextStack);
}

function getSwitchHistory(){
  return clone(state.switchHistory);
}

function getState(){

  return clone({

    module:
    MODULE_ID,

    batch:
    494,

    status:
    state.status,

    mode:
    state.mode,

    operatorFlowAvailable:
    state.operatorFlowAvailable,

    persistenceAvailable:
    state.persistenceAvailable,

    activeContext:
    state.activeContext,

    previousContext:
    state.previousContext,

    contextStack:
    state.contextStack,

    contextStackDepth:
    state.contextStack.length,

    switchHistory:
    state.switchHistory,

    switchHistoryCount:
    state.switchHistory.length,

    events:
    state.events,

    createdAt:
    state.createdAt

  });

}

window.UmbraContextSwitchingEngine = {

  id:
  MODULE_ID,

  batch:
  494,

  refreshDependencies,

  switchContext,

  pushContext,

  popContext,

  clearContextStack,

  restorePersistedContext,

  getActiveContext,

  getPreviousContext,

  getContextStack,

  getSwitchHistory,

  getState

};

refreshDependencies();

if(state.activeContext === null){
  state.activeContext =
  "HOME_CENTER";

  pushContext(
    state.activeContext
  );
}

restorePersistedContext();

console.log(
  MODULE_ID,
  getState()
);

})();
