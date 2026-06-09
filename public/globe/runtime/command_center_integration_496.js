(function(){

"use strict";

const MODULE_ID =
"NEXUS_COMMAND_CENTER_INTEGRATION_496";

const state = {

  module:
  MODULE_ID,

  batch:
  496,

  status:
  "ACTIVE",

  mode:
  "SAFE_COMMAND_CENTER_BRIDGE",

  searchCommandAvailable:
  false,

  contextSwitchingAvailable:
  false,

  operatorFlowAvailable:
  false,

  commandCenterActive:
  false,

  mounted:
  false,

  mountSelector:
  "#umbra-command-center",

  lastCommand:
  null,

  lastResult:
  null,

  commandCenterHistory:
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
      "umbra:command-center:event",
      {
        detail:
        event
      }
    )
  );

  return event;

}

function getSearchCommand(){
  return window.UmbraUnifiedSearchCommand || null;
}

function getContextSwitching(){
  return window.UmbraContextSwitchingEngine || null;
}

function getOperatorFlow(){
  return window.UmbraOperatorFlowEngine || null;
}

function refreshDependencies(){

  state.searchCommandAvailable =
  !!getSearchCommand();

  state.contextSwitchingAvailable =
  !!getContextSwitching();

  state.operatorFlowAvailable =
  !!getOperatorFlow();

  emit(
    "DEPENDENCIES_REFRESHED",
    {
      searchCommandAvailable:
      state.searchCommandAvailable,

      contextSwitchingAvailable:
      state.contextSwitchingAvailable,

      operatorFlowAvailable:
      state.operatorFlowAvailable
    }
  );

  return {
    searchCommandAvailable:
    state.searchCommandAvailable,

    contextSwitchingAvailable:
    state.contextSwitchingAvailable,

    operatorFlowAvailable:
    state.operatorFlowAvailable
  };

}

function resolveMount(){

  try{
    return document.querySelector(
      state.mountSelector
    );
  }catch(error){
    return null;
  }

}

function ensureMount(){

  let mount =
  resolveMount();

  if(mount){
    state.mounted = true;
    return mount;
  }

  mount =
  document.createElement("div");

  mount.id =
  "umbra-command-center";

  mount.setAttribute(
    "data-umbra-command-center",
    "true"
  );

  mount.setAttribute(
    "data-created-by",
    MODULE_ID
  );

  mount.style.display =
  "none";

  document.body.appendChild(mount);

  state.mounted = true;

  emit(
    "COMMAND_CENTER_MOUNT_CREATED",
    {
      selector:
      state.mountSelector
    }
  );

  return mount;

}

function rememberCommand(command,result){

  const record = {

    command:
    clone(command),

    result:
    clone(result),

    timestamp:
    new Date().toISOString()

  };

  state.commandCenterHistory.push(record);

  if(state.commandCenterHistory.length > 150){
    state.commandCenterHistory.shift();
  }

  return record;

}

function openCommandCenter(){

  refreshDependencies();

  const mount =
  ensureMount();

  state.commandCenterActive =
  true;

  if(mount){

    mount.style.display =
    "block";

    mount.setAttribute(
      "data-command-center-active",
      "true"
    );

  }

  emit(
    "COMMAND_CENTER_OPENED",
    {
      mounted:
      !!mount
    }
  );

  window.dispatchEvent(
    new CustomEvent(
      "umbra:command-center-opened",
      {
        detail:
        getState()
      }
    )
  );

  return true;

}

function closeCommandCenter(){

  const mount =
  resolveMount();

  state.commandCenterActive =
  false;

  if(mount){

    mount.style.display =
    "none";

    mount.setAttribute(
      "data-command-center-active",
      "false"
    );

  }

  emit(
    "COMMAND_CENTER_CLOSED",
    {}
  );

  window.dispatchEvent(
    new CustomEvent(
      "umbra:command-center-closed",
      {
        detail:
        getState()
      }
    )
  );

  return true;

}

function toggleCommandCenter(){

  if(state.commandCenterActive){
    return closeCommandCenter();
  }

  return openCommandCenter();

}

function executeCommand(input){

  refreshDependencies();

  const searchCommand =
  getSearchCommand();

  if(
    !searchCommand ||
    typeof searchCommand.command !== "function"
  ){

    const failed = {
      ok:
      false,

      reason:
      "UNIFIED_SEARCH_COMMAND_UNAVAILABLE"
    };

    state.lastCommand =
    input;

    state.lastResult =
    failed;

    rememberCommand(input,failed);

    emit(
      "COMMAND_CENTER_EXECUTION_FAILED",
      {
        command:
        input,

        result:
        failed
      }
    );

    return clone(failed);

  }

  const result =
  searchCommand.command(input);

  state.lastCommand =
  input;

  state.lastResult =
  clone(result);

  const record =
  rememberCommand(input,result);

  emit(
    result && result.ok
      ? "COMMAND_CENTER_EXECUTED"
      : "COMMAND_CENTER_REJECTED",
    {
      command:
      input,

      result:
      result,

      record:
      record
    }
  );

  window.dispatchEvent(
    new CustomEvent(
      "umbra:command-center-executed",
      {
        detail:
        {
          command:
          input,

          result:
          result,

          record:
          record
        }
      }
    )
  );

  return clone(result);

}

function searchCommandCenter(query){

  refreshDependencies();

  const searchCommand =
  getSearchCommand();

  if(
    !searchCommand ||
    typeof searchCommand.search !== "function"
  ){

    const failed = {
      ok:
      false,

      reason:
      "UNIFIED_SEARCH_COMMAND_UNAVAILABLE"
    };

    emit(
      "COMMAND_CENTER_SEARCH_FAILED",
      {
        query,
        result:
        failed
      }
    );

    return failed;

  }

  const results =
  searchCommand.search(query);

  emit(
    "COMMAND_CENTER_SEARCH_COMPLETED",
    {
      query,
      resultCount:
      Array.isArray(results) ? results.length : 0
    }
  );

  return clone(results);

}

function resolveCommandCenterInput(input){

  refreshDependencies();

  const searchCommand =
  getSearchCommand();

  if(
    !searchCommand ||
    typeof searchCommand.resolveCommand !== "function"
  ){
    return null;
  }

  const command =
  searchCommand.resolveCommand(input);

  emit(
    "COMMAND_CENTER_INPUT_RESOLVED",
    {
      input,
      command
    }
  );

  return clone(command);

}

function activateCommandCenter(){

  const contextSwitching =
  getContextSwitching();

  if(
    contextSwitching &&
    typeof contextSwitching.switchContext === "function"
  ){

    contextSwitching.switchContext(
      "COMMAND_CENTER",
      "COMMAND_CENTER_ACTIVATION"
    );

  }

  openCommandCenter();

  emit(
    "COMMAND_CENTER_ACTIVATED",
    {
      center:
      "COMMAND_CENTER"
    }
  );

  return true;

}

function bindKeyboard(){

  if(state.keyboardBound){
    return true;
  }

  window.addEventListener(
    "keydown",
    function(event){

      if(
        event.ctrlKey &&
        event.shiftKey &&
        String(event.key).toLowerCase() === "k"
      ){

        event.preventDefault();
        toggleCommandCenter();

      }

    }
  );

  state.keyboardBound =
  true;

  emit(
    "COMMAND_CENTER_KEYBOARD_BOUND",
    {
      shortcut:
      "Ctrl+Shift+K"
    }
  );

  return true;

}

function bindCommandEvents(){

  if(state.commandEventsBound){
    return true;
  }

  window.addEventListener(
    "umbra:command-executed",
    function(event){

      emit(
        "COMMAND_CENTER_OBSERVED_COMMAND",
        event.detail || {}
      );

    }
  );

  state.commandEventsBound =
  true;

  emit(
    "COMMAND_CENTER_EVENTS_BOUND",
    {
      commandExecuted:
      true
    }
  );

  return true;

}

function getCommandCenterHistory(){
  return clone(state.commandCenterHistory);
}

function getState(){

  return clone({

    module:
    MODULE_ID,

    batch:
    496,

    status:
    state.status,

    mode:
    state.mode,

    searchCommandAvailable:
    state.searchCommandAvailable,

    contextSwitchingAvailable:
    state.contextSwitchingAvailable,

    operatorFlowAvailable:
    state.operatorFlowAvailable,

    commandCenterActive:
    state.commandCenterActive,

    mounted:
    state.mounted,

    mountSelector:
    state.mountSelector,

    keyboardBound:
    !!state.keyboardBound,

    commandEventsBound:
    !!state.commandEventsBound,

    lastCommand:
    state.lastCommand,

    lastResult:
    state.lastResult,

    commandCenterHistory:
    state.commandCenterHistory,

    commandCenterHistoryCount:
    state.commandCenterHistory.length,

    events:
    state.events,

    createdAt:
    state.createdAt

  });

}

window.UmbraCommandCenterIntegration = {

  id:
  MODULE_ID,

  batch:
  496,

  refreshDependencies,

  ensureMount,

  openCommandCenter,

  closeCommandCenter,

  toggleCommandCenter,

  activateCommandCenter,

  executeCommand,

  searchCommandCenter,

  resolveCommandCenterInput,

  bindKeyboard,

  bindCommandEvents,

  getCommandCenterHistory,

  getState

};

refreshDependencies();

ensureMount();

bindKeyboard();

bindCommandEvents();

console.log(
  MODULE_ID,
  getState()
);

})();
