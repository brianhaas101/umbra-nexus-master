# NEXUS MASTER RUNTIME AUDIT 473B

Generated: 2026-06-08T15:50:06

## Summary

- Build passed: True
- Branch: usage: git [-v | --version] [-h | --help] [-C <path>] [-c <name>=<value>]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--no-lazy-fetch]
           [--no-optional-locks] [--no-advice] [--bare] [--git-dir=<path>]
           [--work-tree=<path>] [--namespace=<name>] [--config-env=<name>=<envvar>]
           <command> [<args>]

These are common Git commands used in various situations:

start a working area (see also: git help tutorial)
   clone      Clone a repository into a new directory
   init       Create an empty Git repository or reinitialize an existing one

work on the current change (see also: git help everyday)
   add        Add file contents to the index
   mv         Move or rename a file, a directory, or a symlink
   restore    Restore working tree files
   rm         Remove files from the working tree and from the index

examine the history and state (see also: git help revisions)
   bisect     Use binary search to find the commit that introduced a bug
   diff       Show changes between commits, commit and working tree, etc
   grep       Print lines matching a pattern
   log        Show commit logs
   show       Show various types of objects
   status     Show the working tree status

grow, mark and tweak your common history
   backfill   Download missing objects in a partial clone
   branch     List, create, or delete branches
   commit     Record changes to the repository
   history    EXPERIMENTAL: Rewrite history
   merge      Join two or more development histories together
   rebase     Reapply commits on top of another base tip
   reset      Set `HEAD` or the index to a known state
   switch     Switch branches
   tag        Create, list, delete or verify tags

collaborate (see also: git help workflows)
   fetch      Download objects and refs from another repository
   pull       Fetch from and integrate with another repository or a local branch
   push       Update remote refs along with associated objects

'git help -a' and 'git help -g' list available subcommands and some
concept guides. See 'git help <command>' or 'git help <concept>'
to read about a specific subcommand or concept.
See 'git help git' for an overview of the system.
- Script tags in root index: 237
- Public globe JS files: 337
- Public data JSON files: 16565
- Phase files: 177
- Phase 9 files: 9
- Phase 10 files: 12
- Runtime bridge files: 28
- Source intelligence files: 109
- Public intelligence files: 14777
- Security files: 11
- Performance files: 11
- Client data files: 1707
- City tile files: 7393
- Unique window globals: 1012
- Event producer files: 27
- Event consumer files: 495
- Runtime reference files: 1233
- Capability checks: 24 / 24

## Capability Checks

- [PASS] root_index_exists
- [PASS] has_script_tags
- [PASS] phase9_foundation_exists
- [PASS] phase9_governance_certification_exists
- [PASS] phase9_continuity_certification_exists
- [PASS] phase10_runtime_certification_exists
- [PASS] phase10_intelligence_certification_exists
- [PASS] phase10_operational_certification_exists
- [PASS] globe_core_exists
- [PASS] city_map_exists
- [PASS] command_deck_exists
- [PASS] founder_dashboard_exists
- [PASS] dossier_open_bridge_exists
- [PASS] dossier_mount_restore_exists
- [PASS] city_click_bridge_exists
- [PASS] intel_loader_bridge_exists
- [PASS] intel_alias_bridge_exists
- [PASS] security_guard_exists
- [PASS] access_control_exists
- [PASS] performance_mode_exists
- [PASS] public_intelligence_data_exists
- [PASS] src_intelligence_exists
- [PASS] client_data_exists
- [PASS] black_dragon_client_data_exists

## Risk Flags

- Root index has a large number of script tags. Audit legacy and duplicate runtime loading before major UI changes.

## Phase 9 Files

- public\globe\phase9_continuity_controls_439.js
- public\globe\phase9_continuity_state_engine_438.js
- public\globe\phase9_continuity_systems_foundation_436.js
- public\globe\phase9_continuity_workspace_437.js
- public\globe\phase9_foundation_431.js
- public\globe\phase9_governance_certification_435.js
- public\globe\phase9_governance_controls_434.js
- public\globe\phase9_governance_state_engine_433.js
- public\globe\phase9_governance_workspace_432.js

## Phase 10 Files

- public\globe\runtime\phase10_intelligence_bridge_foundation_466.js
- public\globe\runtime\phase10_intelligence_data_flow_467.js
- public\globe\runtime\phase10_intelligence_runtime_audit_468.js
- public\globe\runtime\phase10_intelligence_runtime_certification_470.js
- public\globe\runtime\phase10_intelligence_runtime_layer_467.js
- public\globe\runtime\phase10_intelligence_source_connector_469.js
- public\globe\runtime\phase10_operational_execution_certification_472.js
- public\globe\runtime\phase10_runtime_attachment_engine_463.js
- public\globe\runtime\phase10_runtime_certification_465.js
- public\globe\runtime\phase10_runtime_control_layer_464.js
- public\globe\runtime\phase10_runtime_orchestration_foundation_461.js
- public\globe\runtime\phase10_runtime_registry_workspace_462.js

## Runtime Bridge Files

- public\globe\runtime\black_dragon_books_boot_loader.js
- public\globe\runtime\city_click_tilemap_bridge.js
- public\globe\runtime\city_map_back_control.js
- public\globe\runtime\city_map_node_registry_repair.js
- public\globe\runtime\city_map_node_registry_repair.js.before_batch_581R_20260603_204623.bak
- public\globe\runtime\core_boot_state_repair.js
- public\globe\runtime\dossier_mount_restore.css
- public\globe\runtime\dossier_mount_restore.js
- public\globe\runtime\dossier_open_bridge.css
- public\globe\runtime\dossier_open_bridge.js
- public\globe\runtime\founder_runtime_bridge.wave_001.v1.json
- public\globe\runtime\intel_loader_bridge.js
- public\globe\runtime\intel_loader_bridge.js.before_batch_588R_20260603_211137.bak
- public\globe\runtime\intel_runtime_alias_bridge.js
- public\globe\runtime\phase10_intelligence_bridge_foundation_466.js
- public\globe\runtime\phase10_intelligence_data_flow_467.js
- public\globe\runtime\phase10_intelligence_runtime_audit_468.js
- public\globe\runtime\phase10_intelligence_runtime_certification_470.js
- public\globe\runtime\phase10_intelligence_runtime_layer_467.js
- public\globe\runtime\phase10_intelligence_source_connector_469.js
- public\globe\runtime\phase10_operational_execution_certification_472.js
- public\globe\runtime\phase10_runtime_attachment_engine_463.js
- public\globe\runtime\phase10_runtime_certification_465.js
- public\globe\runtime\phase10_runtime_control_layer_464.js
- public\globe\runtime\phase10_runtime_orchestration_foundation_461.js
- public\globe\runtime\phase10_runtime_registry_workspace_462.js
- public\globe\runtime\runtime_health_bridge.js
- public\globe\runtime\world_pick_cache_repair.js

## Window Globals

- __BD_RESPONSE_CAPTURE_PATCHED__ (4)
- __UMBRA_BATCH_287_SOURCE_EXPORT_REHYDRATION (2)
- __UMBRA_BATCH_288_SOURCE_COMPLETION_VALIDATOR (2)
- __UMBRA_BATCH_289_DOSSIER_VALIDATION_LAYER (2)
- __UMBRA_BATCH_290_PRODUCTION_PROMOTION_ENGINE (2)
- __UMBRA_BATCH_291_PRODUCTION_PROMOTION_AUDIT_HUB_SYNC (2)
- __UMBRA_BATCH_292_WAVE001_CERTIFICATION (2)
- __UMBRA_BATCH_292B_WAVE001_CERTIFICATION_REPAIR (1)
- __UMBRA_BATCH_292C_PROMOTION_PERSISTENCE (2)
- __UMBRA_BATCH_293_WAVE002_EXPANSION (2)
- __UMBRA_BATCH_293B_WAVE002_RUNTIME_REPAIR (1)
- __UMBRA_BATCH_293C_WAVE002_STANDALONE (1)
- __UMBRA_BATCH_293D_WAVE002_FORCE_LOADED (1)
- __UMBRA_BATCH_294_WAVE002_VALIDATION (1)
- __UMBRA_BATCH_295_WAVE002_BULK_PROCESSING (1)
- __UMBRA_BATCH_296_WAVE002_SOURCE_ATTACHMENT (1)
- __UMBRA_BATCH_297_WAVE002_DOSSIER_VALIDATION (1)
- __UMBRA_BATCH_298_WAVE002_PROMOTION (1)
- __UMBRA_BATCH_300_DOSSIER_FOUNDATION (2)
- __UMBRA_BATCH_301_DOSSIER_SOURCE_LAYER (2)
- __UMBRA_BATCH_302_DOSSIER_TIMELINE_LAYER (2)
- __UMBRA_BATCH_303_DOSSIER_NOTES_LAYER (2)
- __UMBRA_BATCH_304_DOSSIER_ACTIONS_LAYER (2)
- __UMBRA_BATCH_305_DOSSIER_EXPORT_LAYER (2)
- __UMBRA_BATCH_306_DOSSIER_UI_PANEL (2)
- __UMBRA_BATCH_307_DOSSIER_SECTION_DETAIL_RENDERER (2)
- __UMBRA_BATCH_308_DOSSIER_SELECTION_BRIDGE (2)
- __UMBRA_BATCH_309_ENTITY_CLICK_DOSSIER_BRIDGE (2)
- __UMBRA_BATCH_309_SELECTION_HOOK_INSTALLED (2)
- __UMBRA_BATCH_310_DOSSIER_PERSISTENCE (2)
- __UMBRA_BATCH_311_DOSSIER_REGISTRY_INTEGRITY (2)
- __UMBRA_BATCH_312_DOSSIER_SEARCH_FILTER (2)
- __UMBRA_BATCH_313_DOSSIER_METRICS_DASHBOARD (2)
- __UMBRA_BATCH_314_DOSSIER_METRICS_UI_CARD (2)
- __UMBRA_BATCH_315_DOSSIER_BULK_BUILDER (2)
- __UMBRA_BATCH_316_DOSSIER_CERTIFICATION (2)
- __UMBRA_BATCH_317_DOSSIER_REGISTRY_TABLE (2)
- __UMBRA_BATCH_318_DOSSIER_RELATIONSHIP_GRAPH (2)
- __UMBRA_BATCH_319_RELATIONSHIP_GRAPH_UI (2)
- __UMBRA_BATCH_320_PHASE4_MIDPOINT_CERTIFICATION (2)
- __UMBRA_BATCH_321_EXECUTIVE_DOSSIER_WORKFLOWS (2)
- __UMBRA_BATCH_322_EXEC_WORKFLOW_UI (2)
- __UMBRA_BATCH_323_EXEC_WORKFLOW_ACTIONS (2)
- __UMBRA_BATCH_324_EXEC_WORKFLOW_STATE_UI (2)
- __UMBRA_BATCH_325_EXEC_WORKFLOW_METRICS (2)
- __UMBRA_BATCH_326_EXEC_APPROVAL_REGISTRY (2)
- __UMBRA_BATCH_327_EXEC_DECISION_TIMELINE (2)
- __UMBRA_BATCH_328_EXEC_ACTIVITY_FEED (2)
- __UMBRA_BATCH_329_EXECUTIVE_DASHBOARD (2)
- __UMBRA_BATCH_330_PHASE4_EXEC_CERTIFICATION (2)
- __UMBRA_BATCH_331_PHASE4_FINAL_LOCK (2)
- __UMBRA_BATCH_332_PHASE4_FINAL_AUDIT (2)
- __UMBRA_BATCH_333_PHASE4_FINAL_LOCK (2)
- __UMBRA_BATCH_334_COMMAND_SURFACE (2)
- __UMBRA_BATCH_334B_COMMAND_SURFACE (2)
- __UMBRA_BATCH_335_HEADER_NAV (2)
- __UMBRA_BATCH_336_LEFT_COMMAND_RAIL (2)
- __UMBRA_BATCH_337_RIGHT_INTELLIGENCE_RAIL (2)
- __UMBRA_BATCH_338_BOTTOM_DOCK (2)
- __UMBRA_BATCH_339_WORKSPACE_VIEW_MANAGER (2)
- __UMBRA_BATCH_340_COMMAND_SURFACE_CERT (2)
- __UMBRA_BATCH_341_RENDER_ALIGNMENT (2)
- __UMBRA_BATCH_342_COMMAND_CARDS (2)
- __UMBRA_BATCH_343_ACTIVITY_FEED (2)
- __UMBRA_BATCH_344_QUICK_ACTIONS (2)
- __UMBRA_BATCH_345_RELATIONSHIP_WORKSPACE (2)
- __UMBRA_BATCH_346_DOSSIER_WORKSPACE (2)
- __UMBRA_BATCH_347_EXECUTIVE_WORKSPACE (2)
- __UMBRA_BATCH_348_ROUTER_HOOKS_INSTALLED (2)
- __UMBRA_BATCH_348_WORKSPACE_ROUTER (2)
- __UMBRA_BATCH_349_VISUAL_CERTIFICATION (2)
- __UMBRA_BATCH_350_RENDER_MATCHING_PASS2 (2)
- __UMBRA_BATCH_351_RESIZE_HOOK (2)
- __UMBRA_BATCH_351_RESPONSIVE_FIT (2)
- __UMBRA_BATCH_352_POLISH_PASS3 (2)
- __UMBRA_BATCH_353_VISUAL_RUNTIME_AUDIT (2)
- __UMBRA_BATCH_353B_VISUAL_AUDIT_REPAIR (2)
- __UMBRA_BATCH_354_AUDIT_HARDENING (2)
- __UMBRA_BATCH_354C_AUDIT_HARDENING (2)
- __UMBRA_BATCH_355_FINAL_CERTIFICATION (2)
- __UMBRA_BATCH_355B_FINAL_CERTIFICATION (2)
- __UMBRA_BATCH_356_INTELLIGENCE_PRESENTATION (2)
- __UMBRA_BATCH_356B_INTELLIGENCE_PRESENTATION (2)
- __UMBRA_BATCH_357_INTELLIGENCE_CARD_WORKSPACE (2)
- __UMBRA_BATCH_358_INTEL_DETAIL_DRAWER (2)
- __UMBRA_BATCH_359_CROSS_WORKSPACE_CONTEXT (2)
- __UMBRA_BATCH_360_PRESENTATION_CHECKPOINT (2)
- __UMBRA_BATCH_361_INTELLIGENCE_SUMMARY (2)
- __UMBRA_BATCH_362_SUMMARY_DRAWER (2)
- __UMBRA_BATCH_362B_SUMMARY_DRAWER (2)
- __UMBRA_BATCH_363_PRIORITY_QUEUE (2)
- __UMBRA_BATCH_364_PRIORITY_QUEUE_WORKSPACE (2)
- __UMBRA_BATCH_365_PRIORITY_ACTION_STATES (2)
- __UMBRA_BATCH_365B_PRIORITY_STATE_PATCH (2)
- __UMBRA_BATCH_366_PRIORITY_CONTROLS (2)
- __UMBRA_BATCH_366B_PRIORITY_CONTROLS (2)
- __UMBRA_BATCH_367_PRIORITY_CONTROL_CERT (2)
- __UMBRA_BATCH_368_OPERATOR_DECISION_FEED (2)
- __UMBRA_BATCH_369_OPERATOR_DECISION_FEED_CERT (2)
- __UMBRA_BATCH_370_PRESENTATION_METRICS (2)
- __UMBRA_BATCH_371_METRICS_CERT (2)
- __UMBRA_BATCH_371B_METRICS_DECISION_PATCH (2)
- __UMBRA_BATCH_372_FINAL_PRESENTATION_AUDIT (2)
- __UMBRA_BATCH_372B_FINAL_AUDIT_PATCH (2)
- __UMBRA_BATCH_372C_FINAL_AUDIT_REBUILD (2)
- __UMBRA_BATCH_372D_DECISION_LOCK (2)
- __UMBRA_BATCH_373_FINAL_CERTIFICATION (2)
- __UMBRA_BATCH_374_OPERATIONS_FOUNDATION (2)
- __UMBRA_BATCH_375_MISSION_WORKSPACE (2)
- __UMBRA_BATCH_376_MISSION_STATE_ENGINE (2)
- __UMBRA_BATCH_377_MISSION_CONTROLS (2)
- __UMBRA_BATCH_378_MISSION_CONTROL_CERT (2)
- __UMBRA_BATCH_379_WATCHLIST_FOUNDATION (2)
- __UMBRA_BATCH_380_WATCHLIST_WORKSPACE (2)
- __UMBRA_BATCH_381_WATCHLIST_STATE_ENGINE (2)
- __UMBRA_BATCH_382_WATCHLIST_CONTROLS (2)
- __UMBRA_BATCH_383_WATCHLIST_CERT (2)
- __UMBRA_BATCH_384_ALERT_FOUNDATION (2)
- __UMBRA_BATCH_385_ALERT_WORKSPACE (2)
- __UMBRA_BATCH_386_ALERT_STATE_ENGINE (2)
- __UMBRA_BATCH_387_ALERT_CONTROLS (2)
- __UMBRA_BATCH_388_ALERT_CERTIFICATION (2)
- __UMBRA_BATCH_389_TASKING_FOUNDATION (2)
- __UMBRA_BATCH_390_TASK_WORKSPACE (2)
- __UMBRA_BATCH_391_TASK_STATE_ENGINE (2)
- __UMBRA_BATCH_392_TASK_CONTROLS (2)
- __UMBRA_BATCH_393_TASK_CERTIFICATION (2)
- __UMBRA_BATCH_394_OPERATIONS_DASHBOARD (2)
- __UMBRA_BATCH_395_OPS_DASHBOARD_WORKSPACE (2)
- __UMBRA_BATCH_396_OPS_CERTIFICATION (2)
- __UMBRA_BATCH_397_FINAL_OPS_AUDIT (2)
- __UMBRA_BATCH_398_FINAL_CERTIFICATION (2)
- __UMBRA_BATCH_398B_FINAL_CERTIFICATION (2)
- __UMBRA_BATCH_399_AUTONOMOUS_FOUNDATION (2)
- __UMBRA_BATCH_400_AUTOMATION_EVALUATOR (2)
- __UMBRA_BATCH_401_EXECUTION_QUEUE (2)
- __UMBRA_BATCH_402_QUEUE_WORKSPACE (2)
- __UMBRA_BATCH_403_QUEUE_STATE_ENGINE (2)
- __UMBRA_BATCH_404_AUTOMATION_QUEUE_CONTROLS (2)
- __UMBRA_BATCH_405_AUTOMATION_QUEUE_CERTIFICATION (2)
- __UMBRA_BATCH_406_EXECUTION_ENGINE (2)
- __UMBRA_BATCH_407_EXECUTION_LOG_WORKSPACE (2)
- __UMBRA_BATCH_408_AUTOMATION_EXECUTION_CERTIFICATION (2)
- __UMBRA_BATCH_409_AUTONOMOUS_ACTIONS (2)
- __UMBRA_BATCH_410_ACTION_WORKSPACE (2)
- __UMBRA_BATCH_411_ACTION_STATE_ENGINE (2)
- __UMBRA_BATCH_412_ACTION_CONTROLS (2)
- __UMBRA_BATCH_413_ACTION_CERTIFICATION (2)
- __UMBRA_BATCH_414_ACTION_ORCHESTRATION (2)
- __UMBRA_BATCH_415_ORCHESTRATION_WORKSPACE (2)
- __UMBRA_BATCH_416_ORCHESTRATION_STATE_ENGINE (2)
- __UMBRA_BATCH_417_ORCHESTRATION_CONTROLS (2)
- __UMBRA_BATCH_418_ORCHESTRATION_CERTIFICATION (2)
- __UMBRA_BATCH_418B_ORCHESTRATION_CERTIFICATION_FIX (2)
- __UMBRA_BATCH_419_WORKFLOW_FOUNDATION (2)
- __UMBRA_BATCH_420_WORKFLOW_WORKSPACE (2)
- __UMBRA_BATCH_421_WORKFLOW_STATE_ENGINE (2)
- __UMBRA_BATCH_422_WORKFLOW_CONTROLS (2)
- __UMBRA_BATCH_423_WORKFLOW_CERTIFICATION (2)
- __UMBRA_BATCH_423B_WORKFLOW_CERTIFICATION_FIX (2)
- __UMBRA_BATCH_424_DIRECTIVE_FOUNDATION (2)
- __UMBRA_BATCH_425_DIRECTIVE_WORKSPACE (2)
- __UMBRA_BATCH_426_DIRECTIVE_STATE_ENGINE (2)
- __UMBRA_BATCH_427_DIRECTIVE_CONTROLS (2)
- __UMBRA_BATCH_428_DIRECTIVE_CERTIFICATION (2)
- __UMBRA_BATCH_428B_DIRECTIVE_CERTIFICATION_FIX (2)
- __UMBRA_BATCH_429_MASTER_AUTONOMY_AUDIT (2)
- __UMBRA_BATCH_429B_MASTER_AUTONOMY_AUDIT_FIX (2)
- __UMBRA_BATCH_430_FINAL_CERTIFICATION (2)
- __UMBRA_BATCH_430B_FINAL_CERTIFICATION_FIX (2)
- __UMBRA_BUILD__ (4)
- __UMBRA_DATA_V1_INSTALLED__ (1)
- __UMBRA_MANUAL_SOURCE_REFERENCE_WRITER_BATCH_284 (2)
- __UMBRA_PERSISTENT_SOURCE_WRITER_BATCH_286 (2)
- __UMBRA_PHASE_3_CITY_SATURATION_BATCH_274 (2)
- __UMBRA_PHASE_3_HUB_ACTION_SELECTION_BRIDGE_BATCH_283 (2)
- __UMBRA_PHASE_3_HUB_ACTION_SELECTION_OBSERVER (3)
- __UMBRA_PHASE_3_HUB_CONTROLS_DRILLDOWN_BATCH_282 (2)
- __UMBRA_PHASE_3_HUB_VISUAL_TRANSFER_BATCH_281 (2)
- __UMBRA_PHASE_3_REPLACEMENT_WAVE_001_BATCH_275 (2)
- __UMBRA_PHASE_3_SOURCE_ATTACHMENT_INTAKE_BATCH_280 (2)
- __UMBRA_PHASE_3_SOURCE_EVIDENCE_PACKET_BATCH_279 (2)
- __UMBRA_PHASE_3_SOURCE_VALIDATION_BATCH_278 (2)
- __UMBRA_PHASE_3_VERIFICATION_PIPELINE_BATCH_277 (2)
- __UMBRA_SOURCE_VALIDATION_RECALC_BATCH_285 (2)
- addEventListener (54)
- BLACK_DRAGON_LAST_RESPONSE_RECORD (5)
- BLACK_DRAGON_SELECTED_DOSSIER (1)
- BlackDragon (2)
- BlackDragonBooks (1)
- BlackDragonBooksCityMapRenderer (8)
- BlackDragonBooksClusterRenderer (7)
- BlackDragonBooksDashboard (8)
- BlackDragonBooksDossierSync (5)
- BlackDragonBooksLayerControls (5)
- BlackDragonBooksMapNodes (8)
- BlackDragonBooksPathRenderer (7)
- BlackDragonBooksQueueActions (5)
- BlackDragonBooksQueueUI (18)
- BlackDragonBooksResponsePersistence (3)
- BlackDragonBooksResponseStore (10)
- BlackDragonBooksResponseUI (12)
- BlackDragonBooksResponseWorkflow (5)
- BlackDragonBooksSelectionBus (15)
- BlackDragonBooksSignals (1)
- BlackDragonSignals (2)
- bootLawEnforcementCityMapIntegration (1)
- cityMap (2)
- cityMapNodeRegistry (1)
- devicePixelRatio (9)
- dispatchEvent (43)
- EffectComposer (1)
- ensureDossierOpenState591R (1)
- ensureNativeDossierMount606R (1)
- fetch (1)
- FOUNDER_MODE_STATE (3)
- FOUNDER_RUNTIME (2)
- innerHeight (5)
- innerWidth (5)
- IntelLoaderBridge (2)
- IntelRuntimeAliasBridge (2)
- localStorage (5)
- location (1)
- MutationObserver (3)
- Nexus (10)
- NexusCore (1)
- openDossierForNode (4)
- renderCityOpsWorkspace (1)
- renderFounderContext (3)
- renderFounderWorkspace (4)
- RenderPass (1)
- setFounderMode (2)
- THREE (94)
- THREEEffectComposer (1)
- Umbra (20)
- UMBRA_ACCESS_CLIENT (1)
- UMBRA_ACCESS_ROLE (1)
- UMBRA_ACTIVE_CLIENT (2)
- UMBRA_ACTIVE_MODULE (3)
- UMBRA_ACTIVE_USER (1)
- UMBRA_BLACK_DRAGON_BOOKS_QUEUE (1)
- UMBRA_CLIENT_KEY (23)
- UMBRA_DATA (65)
- UMBRA_DATA_READY (4)
- UMBRA_GLOBE (10)
- UMBRA_MODE (1)
- UMBRA_PRIVATE_PRIMARY_API_KEY (1)
- UMBRA_PRIVATE_PRIMARY_BEARER_TOKEN (1)
- UMBRA_PRIVATE_PRIMARY_ENDPOINT (1)
- UMBRA_RUNTIME (10)

## Recent Git Log

usage: git [-v | --version] [-h | --help] [-C <path>] [-c <name>=<value>]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--no-lazy-fetch]
           [--no-optional-locks] [--no-advice] [--bare] [--git-dir=<path>]
           [--work-tree=<path>] [--namespace=<name>] [--config-env=<name>=<envvar>]
           <command> [<args>]

These are common Git commands used in various situations:

start a working area (see also: git help tutorial)
   clone      Clone a repository into a new directory
   init       Create an empty Git repository or reinitialize an existing one

work on the current change (see also: git help everyday)
   add        Add file contents to the index
   mv         Move or rename a file, a directory, or a symlink
   restore    Restore working tree files
   rm         Remove files from the working tree and from the index

examine the history and state (see also: git help revisions)
   bisect     Use binary search to find the commit that introduced a bug
   diff       Show changes between commits, commit and working tree, etc
   grep       Print lines matching a pattern
   log        Show commit logs
   show       Show various types of objects
   status     Show the working tree status

grow, mark and tweak your common history
   backfill   Download missing objects in a partial clone
   branch     List, create, or delete branches
   commit     Record changes to the repository
   history    EXPERIMENTAL: Rewrite history
   merge      Join two or more development histories together
   rebase     Reapply commits on top of another base tip
   reset      Set `HEAD` or the index to a known state
   switch     Switch branches
   tag        Create, list, delete or verify tags

collaborate (see also: git help workflows)
   fetch      Download objects and refs from another repository
   pull       Fetch from and integrate with another repository or a local branch
   push       Update remote refs along with associated objects

'git help -a' and 'git help -g' list available subcommands and some
concept guides. See 'git help <command>' or 'git help <concept>'
to read about a specific subcommand or concept.
See 'git help git' for an overview of the system.

## Build Output Tail


> nexus@1.0.0 build
> vite build

node.exe : [33mThe CJS build of Vite's Node API is deprecated. See 
https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.[39m
At line:1 char:1
+ & "C:\nvm4w\nodejs/node.exe" "C:\nvm4w\nodejs/node_modules/npm/bin/np ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ([33mThe CJS bu...e details.[39m:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32mΓ£ô[39m 23 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mindex.html                [39m[1m[2m24.22 kB[22m[1m[22m[2m Γöé gzip: 4.66 kB[22m
[2mdist/[22m[36massets/index-BgUC979d.js  [39m[1m[2m21.26 kB[22m[1m[22m[2m Γöé gzip: 3.89 kB[22m
[32mΓ£ô built in 1m 11s[39m

