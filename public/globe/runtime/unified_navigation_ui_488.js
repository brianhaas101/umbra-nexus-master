(function(){

"use strict";

const MODULE_ID =
"NEXUS_UNIFIED_NAVIGATION_UI_488";

const CENTERS = [

  {
    id:
    "COMMAND_CENTER",

    label:
    "Command",

    category:
    "PRIMARY"
  },

  {
    id:
    "INTELLIGENCE_CENTER",

    label:
    "Intelligence",

    category:
    "PRIMARY"
  },

  {
    id:
    "DOSSIER_CENTER",

    label:
    "Dossiers",

    category:
    "PRIMARY"
  },

  {
    id:
    "OPERATIONS_CENTER",

    label:
    "Operations",

    category:
    "PRIMARY"
  },

  {
    id:
    "AUTOMATION_CENTER",

    label:
    "Automation",

    category:
    "PRIMARY"
  },

  {
    id:
    "GOVERNANCE_CENTER",

    label:
    "Governance",

    category:
    "PRIMARY"
  },

  {
    id:
    "RUNTIME_CENTER",

    label:
    "Runtime",

    category:
    "ADVANCED"
  },

  {
    id:
    "SYSTEM_SETTINGS",

    label:
    "Settings",

    category:
    "ADVANCED"
  }

];

const state = {

  module:
  MODULE_ID,

  batch:
  488,

  status:
  "ACTIVE",

  mounted:
  false,

  mountId:
  "umbra-unified-navigation-ui-488",

  activeCenter:
  "COMMAND_CENTER",

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
      "umbra:navigation-ui:event",
      {
        detail:
        event
      }
    )
  );

  return event;

}

function getActivationEngine(){

  return window.UmbraWorkspaceActivationEngine || null;

}

function ensureMount(){

  let mount =
  document.getElementById(
    state.mountId
  );

  if(mount){
    return mount;
  }

  mount =
  document.createElement("div");

  mount.id =
  state.mountId;

  mount.setAttribute(
    "data-umbra-module",
    MODULE_ID
  );

  mount.style.position =
  "fixed";

  mount.style.left =
  "18px";

  mount.style.top =
  "88px";

  mount.style.zIndex =
  "9999";

  mount.style.display =
  "flex";

  mount.style.flexDirection =
  "column";

  mount.style.gap =
  "8px";

  mount.style.padding =
  "10px";

  mount.style.border =
  "1px solid rgba(180, 150, 90, 0.32)";

  mount.style.borderRadius =
  "14px";

  mount.style.background =
  "rgba(8, 10, 14, 0.74)";

  mount.style.backdropFilter =
  "blur(10px)";

  mount.style.boxShadow =
  "0 0 28px rgba(0,0,0,0.35)";

  mount.style.pointerEvents =
  "auto";

  document.body.appendChild(
    mount
  );

  return mount;

}

function buttonStyle(
  active,
  category
){

  return [
    "width: 156px",
    "min-height: 34px",
    "border-radius: 10px",
    "border: 1px solid " +
      (
        active
          ? "rgba(230,190,110,0.95)"
          : "rgba(160,150,130,0.25)"
      ),
    "background: " +
      (
        active
          ? "rgba(210,160,70,0.28)"
          : "rgba(255,255,255,0.045)"
      ),
    "color: " +
      (
        active
          ? "rgba(255,235,190,0.98)"
          : "rgba(220,220,210,0.72)"
      ),
    "font-family: Inter, system-ui, sans-serif",
    "font-size: 11px",
    "letter-spacing: 0.08em",
    "text-transform: uppercase",
    "cursor: pointer",
    "transition: all 120ms ease",
    "text-align: left",
    "padding: 8px 10px",
    "box-sizing: border-box",
    category === "ADVANCED"
      ? "opacity: 0.72"
      : "opacity: 1"
  ].join(";");

}

function render(){

  const mount =
  ensureMount();

  mount.innerHTML = "";

  const title =
  document.createElement("div");

  title.textContent =
  "NEXUS";

  title.style.fontFamily =
  "Inter, system-ui, sans-serif";

  title.style.fontSize =
  "11px";

  title.style.letterSpacing =
  "0.22em";

  title.style.color =
  "rgba(235,205,145,0.96)";

  title.style.padding =
  "2px 4px 8px";

  title.style.borderBottom =
  "1px solid rgba(180,150,90,0.18)";

  mount.appendChild(title);

  CENTERS.forEach(function(center){

    if(
      center.category === "ADVANCED" &&
      !mount.querySelector("[data-divider='advanced']")
    ){

      const divider =
      document.createElement("div");

      divider.setAttribute(
        "data-divider",
        "advanced"
      );

      divider.style.height =
      "1px";

      divider.style.margin =
      "6px 0";

      divider.style.background =
      "rgba(180,150,90,0.16)";

      mount.appendChild(divider);

    }

    const button =
    document.createElement("button");

    button.textContent =
    center.label;

    button.setAttribute(
      "data-center",
      center.id
    );

    button.setAttribute(
      "data-category",
      center.category
    );

    button.style.cssText =
    buttonStyle(
      center.id === state.activeCenter,
      center.category
    );

    button.addEventListener(
      "click",
      function(){

        activateCenter(
          center.id
        );

      }
    );

    mount.appendChild(
      button
    );

  });

  state.mounted =
  true;

  emit(
    "NAVIGATION_RENDERED",
    {
      activeCenter:
      state.activeCenter
    }
  );

  return true;

}

function activateCenter(
  center
){

  const engine =
  getActivationEngine();

  if(
    !engine ||
    typeof engine.activateCenter !== "function"
  ){

    emit(
      "NAVIGATION_ACTIVATION_FAILED",
      {
        center,
        reason:
        "WORKSPACE_ACTIVATION_ENGINE_UNAVAILABLE"
      }
    );

    return false;

  }

  const ok =
  engine.activateCenter(center);

  if(!ok){

    emit(
      "NAVIGATION_ACTIVATION_FAILED",
      {
        center,
        reason:
        "WORKSPACE_ACTIVATION_ENGINE_REJECTED"
      }
    );

    return false;

  }

  state.activeCenter =
  center;

  emit(
    "NAVIGATION_CENTER_SELECTED",
    {
      center
    }
  );

  render();

  return true;

}

function getCenters(){

  return clone(CENTERS);

}

function getActiveCenter(){

  return state.activeCenter;

}

function getState(){

  const engine =
  getActivationEngine();

  return clone({

    module:
    MODULE_ID,

    batch:
    488,

    status:
    state.status,

    mounted:
    state.mounted,

    mountId:
    state.mountId,

    activeCenter:
    state.activeCenter,

    activationEngineAvailable:
    !!engine,

    engineState:
    engine && typeof engine.getState === "function"
      ? engine.getState()
      : null,

    centers:
    CENTERS,

    events:
    state.events,

    createdAt:
    state.createdAt

  });

}

window.UmbraUnifiedNavigationUI = {

  id:
  MODULE_ID,

  batch:
  488,

  render,

  activateCenter,

  getCenters,

  getActiveCenter,

  getState

};

function boot(){

  const engine =
  getActivationEngine();

  if(
    engine &&
    typeof engine.getActiveCenter === "function" &&
    engine.getActiveCenter()
  ){

    state.activeCenter =
    engine.getActiveCenter();

  }

  render();

  emit(
    "NAVIGATION_UI_BOOTED",
    {
      activeCenter:
      state.activeCenter
    }
  );

}

if(document.readyState === "loading"){

  document.addEventListener(
    "DOMContentLoaded",
    boot
  );

}else{

  boot();

}

console.log(
  MODULE_ID,
  getState()
);

})();
