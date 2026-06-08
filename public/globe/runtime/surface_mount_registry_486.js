(function(){

"use strict";

const MODULE_ID =
"NEXUS_SURFACE_MOUNT_REGISTRY_486";

const REGISTRY = {

COMMAND_CENTER: [

{
module:
"phase5_executive_workspace_347",

mount:
"#umbra-workspace-root",

type:
"WORKSPACE"
},

{
module:
"phase5_left_command_rail_336",

mount:
"#umbra-left-rail",

type:
"RAIL"
},

{
module:
"phase5_workspace_command_cards_342",

mount:
"#umbra-command-cards",

type:
"PANEL"
}

],

INTELLIGENCE_CENTER: [

{
module:
"phase6_intelligence_card_workspace_357",

mount:
"#umbra-workspace-root",

type:
"WORKSPACE"
},

{
module:
"phase6_intelligence_detail_drawer_358",

mount:
"#umbra-right-drawer",

type:
"DRAWER"
},

{
module:
"phase6_intelligence_priority_queue_363",

mount:
"#umbra-priority-queue",

type:
"QUEUE"
}

],

DOSSIER_CENTER: [

{
module:
"phase5_dossier_workspace_346",

mount:
"#umbra-workspace-root",

type:
"WORKSPACE"
},

{
module:
"phase4_dossier_ui_panel_306",

mount:
"#umbra-dossier-panel",

type:
"PANEL"
}

],

OPERATIONS_CENTER: [

{
module:
"phase6_priority_queue_workspace_364",

mount:
"#umbra-workspace-root",

type:
"WORKSPACE"
}

],

AUTOMATION_CENTER: [

{
module:
"phase8_action_orchestration_workspace_415",

mount:
"#umbra-workspace-root",

type:
"WORKSPACE"
}

],

GOVERNANCE_CENTER: [

{
module:
"phase9_governance_workspace_432",

mount:
"#umbra-workspace-root",

type:
"WORKSPACE"
}

],

RUNTIME_CENTER: [

{
module:
"phase10_runtime_registry_workspace_462",

mount:
"#umbra-workspace-root",

type:
"WORKSPACE"
}

],

SYSTEM_SETTINGS: [

{
module:
"phase5_workspace_view_manager_339",

mount:
"#umbra-settings-root",

type:
"SETTINGS"
}

]

};

function getRegistry(){

return JSON.parse(
JSON.stringify(REGISTRY)
);

}

function getCenter(center){

return REGISTRY[center] || [];

}

function getMounts(center){

return getCenter(center);

}

function getState(){

return {

module:
MODULE_ID,

batch:
486,

status:
"ACTIVE",

centers:
Object.keys(REGISTRY).length,

registry:
getRegistry()

};

}

window.UmbraSurfaceMountRegistry = {

getRegistry,

getCenter,

getMounts,

getState

};

console.log(
MODULE_ID,
getState()
);

})();
