(function () {
  const MODULE_ID = "PHASE_10_RUNTIME_REGISTRY_WORKSPACE_462";

  const knownRuntimeKeys = [
    "UmbraCore",
    "UmbraCityMap",
    "cityMap",
    "UmbraCommandDeck",
    "UmbraFounderDashboard",
    "UmbraIntelligencePanel",
    "UmbraPhase10RuntimeOrchestration"
  ];

  const registryState = {
    phase: 10,
    batch: 462,
    module: MODULE_ID,
    status: "ACTIVE",
    created_at: new Date().toISOString(),
    known_keys: knownRuntimeKeys.slice(),
    detected: {},
    missing: [],
    events: [],
    metrics: {
      known_keys: knownRuntimeKeys.length,
      detected_count: 0,
      missing_count: 0
    }
  };

  function snapshotValue(key) {
    const value = window[key];

    return {
      key,
      detected: !!value,
      type: typeof value,
      has_get_state:
        !!value && typeof value.getState === "function",
      has_rescan:
        !!value && typeof value.rescanTargets === "function",
      has_emit:
        !!value && typeof value.emit === "function"
    };
  }

  function emit(type, payload) {
    const event = {
      type,
      payload: payload || {},
      timestamp: new Date().toISOString()
    };

    registryState.events.push(event);

    window.dispatchEvent(
      new CustomEvent("umbra:phase10:registry-event", {
        detail: event
      })
    );

    if (
      window.UmbraPhase10RuntimeOrchestration &&
      typeof window.UmbraPhase10RuntimeOrchestration.emit === "function"
    ) {
      window.UmbraPhase10RuntimeOrchestration.emit(
        "runtime_registry_workspace_event",
        event
      );
    }

    return event;
  }

  function scan() {
    registryState.detected = {};
    registryState.missing = [];

    knownRuntimeKeys.forEach((key) => {
      const snapshot = snapshotValue(key);

      if (snapshot.detected) {
        registryState.detected[key] = snapshot;
      } else {
        registryState.missing.push(key);
      }
    });

    registryState.metrics = {
      known_keys: knownRuntimeKeys.length,
      detected_count: Object.keys(registryState.detected).length,
      missing_count: registryState.missing.length
    };

    emit("runtime_registry_scan_complete", {
      metrics: registryState.metrics,
      missing: registryState.missing
    });

    return getState();
  }

  function getState() {
    return JSON.parse(JSON.stringify(registryState));
  }

  function registerKey(key) {
    if (!key || knownRuntimeKeys.includes(key)) {
      return getState();
    }

    knownRuntimeKeys.push(key);
    registryState.known_keys = knownRuntimeKeys.slice();

    emit("runtime_registry_key_registered", { key });

    return scan();
  }

  window.UmbraPhase10RuntimeRegistryWorkspace = {
    id: MODULE_ID,
    batch: 462,
    scan,
    getState,
    registerKey
  };

  scan();

  console.log(MODULE_ID, getState());
})();
