(function(){

"use strict";

const MODULE_ID = "NEXUS_HOME_VIEW_REGISTRY_D4A";

const HOME_VIEW = {
  center: "HOME_CENTER",

  zones: {
    header: [
      "brand",
      "executiveCommand",
      "profile",
      "account"
    ],

    leftRail: [
      "command",
      "intelligence",
      "dossiers",
      "operations",
      "automation",
      "governance",
      "runtime",
      "settings"
    ],

    centerStage: [
      "globe",
      "cityLabels",
      "entityLabels",
      "signalRoutes"
    ],

    rightRail: [
      "runtime",
      "validation",
      "coverage",
      "pipeline",
      "alerts"
    ],

    homeWorkspace: [
      "reviewQueue",
      "recentActivity",
      "topTargets",
      "quickActions"
    ],

    bottomDock: [
      "home",
      "cityView",
      "dashboard",
      "dossiers",
      "operations",
      "intelligence",
      "automation",
      "governance"
    ]
  },

  rules: {
    noWorkspacePanelsOnGlobe: true,
    noCityPanelsOnHome: true,
    noDossierPanelsOnHome: true,
    noGovernancePanelsOnHome: true,
    noOperationsPanelsOnHome: true,
    noPageScrollOnHome: true
  }
};

const state = {
  module: MODULE_ID,
  phase: "UX_D4A",
  status: "ACTIVE",
  mode: "HOME_VIEW_REGISTRY",
  createdAt: new Date().toISOString()
};

function clone(value){
  return JSON.parse(JSON.stringify(value));
}

function getRegistry(){
  return clone(HOME_VIEW);
}

function getAllowedPanels(){
  return clone(
    Object.values(HOME_VIEW.zones).flat()
  );
}

function validatePanel(panelName){
  const allowed = getAllowedPanels();

  return {
    panel: panelName,
    allowedOnHome: allowed.includes(panelName),
    center: HOME_VIEW.center
  };
}

function getState(){
  return clone(state);
}

window.UmbraHomeViewRegistryD4A = {
  id: MODULE_ID,
  phase: "UX_D4A",
  getRegistry,
  getAllowedPanels,
  validatePanel,
  getState
};

console.log(MODULE_ID,getState());

})();
