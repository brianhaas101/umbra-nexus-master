// public/globe/client_config.v1.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) return console.error("[client_config] window.UmbraGlobe missing.");

  console.log("[SIGNATURE] globe/client_config.v1.js LOADED", new Date().toISOString());

  const PRESETS = {
    black_dragon: {
      profile: {
        name: "Black Dragon",
        email: "",
        company: "Black Dragon Biker TV",
        role: "Law Enforcement Training Specialist"
      },
      account: {
        workspace: "National Training Command",
        license: "Pilot Deployment",
        security: "Law Enforcement Grade",
        routing: "Multi-Agency Network"
      },
      config: {
        industry: "Law Enforcement Training",
        useCase: "National training sales targeting law enforcement agencies",
        operationalScope: "National",
        targetTypes: [
          "Law enforcement agencies",
          "Gang units",
          "Sheriff departments",
          "Private security firms"
        ],
        prioritySignals: [
          "Training budget",
          "Department size",
          "Gang activity indicators",
          "Regional urgency",
          "Command-level accessibility"
        ],
        primaryRegions: [
          "United States",
          "Major metro areas",
          "High-activity enforcement regions"
        ]
      }
    }
  };

  function nowISO() {
    return new Date().toISOString();
  }

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    if (typeof value === "string") {
      return value
        .split(/\n|,/)
        .map((x) => String(x || "").trim())
        .filter(Boolean);
    }
    return [];
  }

  function asString(value, fallback = "") {
    if (value === null || value === undefined) return fallback;
    return String(value).trim();
  }

  function getStore() {
    if (!window.UmbraUsers || typeof window.UmbraUsers.getStore !== "function") {
      console.error("[client_config] UmbraUsers store unavailable.");
      return null;
    }

    return window.UmbraUsers.getStore();
  }

  function saveStore(store) {
    try {
      localStorage.setItem("__UMBRA_USERS_V2__", JSON.stringify(store));
      console.log("[client_config] STORE SAVED", store);
      return true;
    } catch (e) {
      console.error("[client_config] STORE SAVE FAILED", e);
      return false;
    }
  }

  function getActiveUserRecord(store) {
    if (!store || !store.active_user || !store.users) return null;
    return store.users[store.active_user] || null;
  }

  function applyPreset(presetKey) {
    const preset = PRESETS[presetKey];

    if (!preset) {
      console.error("[client_config] Unknown preset:", presetKey);
      return false;
    }

    const store = getStore();
    const user = getActiveUserRecord(store);

    if (!store || !user) {
      console.error("[client_config] No active user available.");
      return false;
    }

    user.profile = {
      ...(user.profile || {}),
      ...preset.profile,
      last_active: nowISO()
    };

    user.account = {
      ...(user.account || {}),
      ...preset.account,
      last_active: nowISO()
    };

    user.client_config = {
      ...(user.client_config || {}),
      ...preset.config,
      intakeMode: "preset",
      rawIntake: {
        preset: presetKey,
        profile: { ...preset.profile },
        account: { ...preset.account },
        config: { ...preset.config }
      },
      preservedContext: {
        coreObjective: preset.config.useCase || "",
        targetLandscape: {
          primaryTargets: Array.isArray(preset.config.targetTypes) ? preset.config.targetTypes : [],
          secondaryTargets: [],
          edgeOpportunities: []
        },
        decisionMakers: [],
        offerStructure: "",
        highValueSignals: Array.isArray(preset.config.prioritySignals) ? preset.config.prioritySignals : [],
        negativeSignals: [],
        opportunityFlexibility: "",
        limitations: "",
        additionalContext: ""
      },
      preset: presetKey,
      configured_at: nowISO()
    };

    user.config = user.client_config;

    user.state = {
      ...(user.state || {}),
      selectedCity: user.state?.selectedCity || null,
      selectedEntity: user.state?.selectedEntity || null,
      pinnedEntities: Array.isArray(user.state?.pinnedEntities) ? user.state.pinnedEntities : [],
      viewHistory: Array.isArray(user.state?.viewHistory) ? user.state.viewHistory : []
    };

    saveStore(store);

    try {
  window.UmbraUsers?.getActiveUser?.();
} catch {}

try {
  if (
    presetKey === "black_dragon" &&
    window.UmbraIntel?.adapters?.blackDragonClientPresetBridge
  ) {
    window.UmbraIntel.adapters.blackDragonClientPresetBridge.applyPreset();
  }
} catch (e) {
  console.error("[client_config] Failed to sync runtime client preset.", e);
}

try {
  window.UmbraGlobe?.initUI?.();
} catch (e) {
  console.error("[client_config] Failed to refresh UI after preset apply.", e);
}

console.log("[client_config] PRESET APPLIED", {
  preset: presetKey,
  activeUser: store.active_user,
  profile: user.profile,
  account: user.account,
  config: user.client_config,
  runtimeClient: window.UmbraGlobe?.state?.activeClient || null
});

    return true;
  }

  function applyCustomConfig(config) {
    const safeConfig = config && typeof config === "object" ? config : {};

    const store = getStore();
    const user = getActiveUserRecord(store);

    if (!store || !user) {
      console.error("[client_config] No active user available.");
      return false;
    }

    user.profile = {
      ...(user.profile || {}),
      name: safeConfig.name ?? user.profile?.name ?? "",
      email: safeConfig.email ?? user.profile?.email ?? "",
      company: safeConfig.company ?? user.profile?.company ?? "",
      role: safeConfig.role ?? user.profile?.role ?? "",
      last_active: nowISO()
    };

    user.account = {
      ...(user.account || {}),
      workspace: safeConfig.workspace ?? user.account?.workspace ?? "",
      license: safeConfig.license ?? user.account?.license ?? "",
      security: safeConfig.security ?? user.account?.security ?? "",
      routing: safeConfig.routing ?? user.account?.routing ?? "",
      last_active: nowISO()
    };

    const rawIntake = {
      ...(safeConfig.rawIntake || {}),
      identity: {
        name: safeConfig.name ?? "",
        email: safeConfig.email ?? "",
        company: safeConfig.company ?? "",
        role: safeConfig.role ?? ""
      },
      coreObjective: safeConfig.coreObjective ?? safeConfig.useCase ?? "",
      perfectOutcome: safeConfig.perfectOutcome ?? "",
      targetLandscape: {
        allTargets: asArray(safeConfig.allTargets),
        primaryTargets: asArray(safeConfig.primaryTargets),
        secondaryTargets: asArray(safeConfig.secondaryTargets),
        edgeOpportunities: asArray(safeConfig.edgeOpportunities)
      },
      decisionMakers: asArray(safeConfig.decisionMakers),
      geographicModel: {
        operationalScope: safeConfig.operationalScope ?? "",
        primaryRegions: asArray(safeConfig.primaryRegions),
        expansionRegions: asArray(safeConfig.expansionRegions)
      },
      offer: {
        description: safeConfig.offerDescription ?? safeConfig.offer ?? "",
        transformation: safeConfig.transformation ?? "",
        dealValue: safeConfig.dealValue ?? "",
        salesCycle: safeConfig.salesCycle ?? "",
        differentiation: safeConfig.differentiation ?? ""
      },
      signalField: {
        allSignals: asArray(safeConfig.allSignals),
        operationalSignals: asArray(safeConfig.operationalSignals),
        financialSignals: asArray(safeConfig.financialSignals),
        behavioralSignals: asArray(safeConfig.behavioralSignals),
        environmentalSignals: asArray(safeConfig.environmentalSignals),
        realWorldSignalDescription: safeConfig.realWorldSignalDescription ?? ""
      },
      negativeSignals: {
        weakTargetTraits: asArray(safeConfig.weakTargetTraits),
        stillWorthPursuingWhen: safeConfig.stillWorthPursuingWhen ?? ""
      },
      opportunityFlexibility: safeConfig.opportunityFlexibility ?? "",
      priorityLogic: safeConfig.priorityLogic ?? "",
      tradeoffs: safeConfig.tradeoffs ?? "",
      limitations: safeConfig.limitations ?? "",
      missingInputs: safeConfig.missingInputs ?? "",
      additionalContext: safeConfig.additionalContext ?? ""
    };

    user.client_config = {
      ...(user.client_config || {}),

      industry: asString(safeConfig.industry),
      useCase: asString(safeConfig.useCase ?? rawIntake.coreObjective),
      operationalScope: asString(safeConfig.operationalScope),

      targetTypes: asArray(safeConfig.targetTypes),
      primaryTargets: asArray(safeConfig.primaryTargets),
      secondaryTargets: asArray(safeConfig.secondaryTargets),
      edgeOpportunities: asArray(safeConfig.edgeOpportunities),

      prioritySignals: asArray(safeConfig.prioritySignals),
      allSignals: asArray(safeConfig.allSignals),
      negativeSignals: asArray(safeConfig.weakTargetTraits),

      primaryRegions: asArray(safeConfig.primaryRegions),
      expansionRegions: asArray(safeConfig.expansionRegions),

      decisionMakers: asArray(safeConfig.decisionMakers),
      offerDescription: asString(safeConfig.offerDescription ?? safeConfig.offer),
      dealValue: asString(safeConfig.dealValue),
      salesCycle: asString(safeConfig.salesCycle),
      differentiation: asString(safeConfig.differentiation),

      rawIntake,
      preservedContext: {
        coreObjective: rawIntake.coreObjective,
        perfectOutcome: rawIntake.perfectOutcome,
        targetLandscape: rawIntake.targetLandscape,
        decisionMakers: rawIntake.decisionMakers,
        geographicModel: rawIntake.geographicModel,
        offer: rawIntake.offer,
        signalField: rawIntake.signalField,
        negativeSignals: rawIntake.negativeSignals,
        opportunityFlexibility: rawIntake.opportunityFlexibility,
        priorityLogic: rawIntake.priorityLogic,
        tradeoffs: rawIntake.tradeoffs,
        limitations: rawIntake.limitations,
        missingInputs: rawIntake.missingInputs,
        additionalContext: rawIntake.additionalContext
      },

      intakeMode: "open_configuration",
      preset: "custom",
      configured_at: nowISO()
    };

    user.config = user.client_config;

    saveStore(store);

    try { window.UmbraGlobe?.initUI?.(); } catch {}

    console.log("[client_config] CUSTOM CONFIG APPLIED", user);
    return true;
  }

  window.UmbraClientConfig = {
    presets: PRESETS,
    applyPreset,
    applyCustomConfig
  };
})();