// public/globe/ui.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) return console.error("[ui] window.UmbraGlobe missing.");
  if (!window.THREE) return console.error("[ui] window.THREE missing.");

  console.log("[SIGNATURE] globe/ui.js LOADED", new Date().toISOString());

  function $(id) { return document.getElementById(id); }
  function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function removeNode(node) {
    if (!node) return;
    try { node.remove(); } catch {}
    try { node.parentNode?.removeChild?.(node); } catch {}
  }

  function hideNode(node) {
    if (!node) return;
    try { node.style.display = "none"; } catch {}
    try { node.style.visibility = "hidden"; } catch {}
    try { node.style.opacity = "0"; } catch {}
    try { node.setAttribute("aria-hidden", "true"); } catch {}
  }

  const VIEW_KEYS = ["hub", "profile", "account"];
  const HUB_KEYS = ["leads", "clients", "operations", "safeguards"];

  const VIEW_META = {
    hub: { title: "UMBRA HUB", status: "SECURE" },
    profile: { title: "PROFILE", status: "FOUNDER CONTEXT" },
    account: { title: "ACCOUNT", status: "WORKSPACE READY" }
  };

  const HUB_META = {
    leads: {
      title: "Leads Engine",
      copy: "City-first target acquisition, entity visibility, dossier access, and deterministic sequencing."
    },
    clients: {
      title: "Clients",
      copy: "Client-facing target portfolios, account segmentation, and retained relationship visibility."
    },
    operations: {
      title: "Operations",
      copy: "Operational posture, execution flow, internal throughput, and delivery-state awareness."
    },
    safeguards: {
      title: "Safeguards",
      copy: "Integrity controls, source traceability, reversible interaction state, and authority locking."
    }
  };

  const ROLES = Object.freeze({
    FOUNDER: "FOUNDER",
    CLIENT: "CLIENT",
    DEMO: "DEMO"
  });

  const STORE_KEY = "__UMBRA_USERS_V2__";

  function nowISO() {
    return new Date().toISOString();
  }

  function makeUserId(prefix = "user") {
    return `${prefix}_` + Math.random().toString(36).slice(2, 10);
  }

  function normalizeRole(role) {
    const value = String(role || "").trim();

    if (value === ROLES.FOUNDER || value.toLowerCase() === "admin" || value.toLowerCase() === "founder") {
      return ROLES.FOUNDER;
    }

    if (value === ROLES.CLIENT || value.toLowerCase() === "client") {
      return ROLES.CLIENT;
    }

    if (value === ROLES.DEMO || value.toLowerCase() === "demo") {
      return ROLES.DEMO;
    }

    return ROLES.CLIENT;
  }

  function isFounder(user) {
    return normalizeRole(user?.profile?.role) === ROLES.FOUNDER;
  }

  function isClient(user) {
    return normalizeRole(user?.profile?.role) === ROLES.CLIENT;
  }

  function isDemo(user) {
    return normalizeRole(user?.profile?.role) === ROLES.DEMO;
  }

  function canUseFounderControls(user) {
    return isFounder(user);
  }

  function requireFounder(actionName) {
    const user = getActiveUser();

    if (!canUseFounderControls(user)) {
      console.warn(`[user] ${actionName || "ACTION"} BLOCKED (not founder)`);
      return false;
    }

    return true;
  }

  function createPermissionSet(role) {
    const normalizedRole = normalizeRole(role);
    const founder = normalizedRole === ROLES.FOUNDER;

    return {
      can_create_users: founder,
      can_switch_users: founder,
      can_edit_roles: founder,
      can_view_founder_tools: founder,
      can_export_data: founder,
      can_reset_local_store: founder,
      can_apply_client_presets: founder,
      can_view_all_clients: founder
    };
  }

  function ensureUIState() {
    G.state = G.state || {};

    const existing = (G.state.ui && typeof G.state.ui === "object") ? G.state.ui : null;
    const view = VIEW_KEYS.includes(existing?.view) ? existing.view : "hub";
    const hubSection = HUB_KEYS.includes(existing?.hubSection) ? existing.hubSection : "leads";
    const initialized = !!existing?.initialized;

    if (existing) {
      existing.view = view;
      existing.hubSection = hubSection;
      existing.initialized = initialized;
      return existing;
    }

    const uiState = { view, hubSection, initialized };

    try {
      Object.defineProperty(G.state, "ui", {
        value: uiState,
        writable: false,
        configurable: false,
        enumerable: true
      });
    } catch {
      G.state.ui = uiState;
    }

    return G.state.ui;
  }

  function removeThemeUI() {
    const selectors = [
      "#themeMenu", "#themeControls", "#themePanel",
      ".theme-menu", ".theme-controls", ".theme-panel"
    ];
    selectors.forEach((sel) => document.querySelectorAll(sel).forEach(removeNode));
  }

  function removeVisibleToggleRow() {
    document.querySelectorAll(".layer-toggles").forEach(removeNode);
  }

  function hideCityListUI() {
    ["cityList", "cityListSection"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = "";
        hideNode(el);
      }
    });
  }

  function setNodesVisible(on) {
    G.state.nodesEnabled = !!on;
  }

  function installUISanitizer() {
    if (G.state?._uiSanitizerInstalled) return;
    G.state._uiSanitizerInstalled = true;

    const run = () => {
      removeThemeUI();
      removeVisibleToggleRow();
      hideCityListUI();
    };

    run();
    setTimeout(run, 100);
    setTimeout(run, 300);

    try {
      const observer = new MutationObserver(run);
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        try { observer.disconnect(); } catch {}
      }, 3000);
    } catch {}
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = String(value || "â€”");
  }

  function updateHubMeta(ui) {
    const meta = HUB_META[ui.hubSection] || HUB_META.leads;
    setText("hubModuleTitle", meta.title);
    setText("hubModuleCopy", meta.copy);
  }

  function updateSystemStatus(ui) {
    const meta = VIEW_META[ui.view] || VIEW_META.hub;
    setText("systemStatusValue", meta.status);
  }

  function setLogoStateForView(ui) {
    const logo = window.UmbraLogo;
    if (!logo || typeof logo.setState !== "function") return;

    if (ui.view === "hub") {
      logo.setState("active");
      return;
    }

    if (ui.view === "profile") {
      logo.setState("focus");
      return;
    }

    logo.setState("idle");
  }

  function validateDatasetAttr(nodes, attrName, label) {
    for (const node of nodes) {
      if (!node?.dataset || !String(node.dataset[attrName] || "").trim()) {
        console.error(`[ui] MISSING data-${attrName.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())} on ${label}`, node);
      }
    }
  }

  function validateUIStructure() {
    const uiViews = $all(".ui-view");
    const contextViews = $all(".context-view");
    const navViews = $all(".nav-link[data-view]");
    const deckViews = $all(".btn-ghost[data-view]");
    const hubItems = $all(".hub-item[data-hub-section]");

    if (!uiViews.length) console.error("[ui] NO .ui-view ELEMENTS FOUND");
    if (!contextViews.length) console.error("[ui] NO .context-view ELEMENTS FOUND");
    if (!navViews.length) console.error("[ui] NO .nav-link[data-view] ELEMENTS FOUND");
    if (!deckViews.length) console.error("[ui] NO .btn-ghost[data-view] ELEMENTS FOUND");
    if (!hubItems.length) console.error("[ui] NO .hub-item[data-hub-section] ELEMENTS FOUND");

    validateDatasetAttr(uiViews, "viewPanel", ".ui-view");
    validateDatasetAttr(contextViews, "contextView", ".context-view");
    validateDatasetAttr(navViews, "view", ".nav-link[data-view]");
    validateDatasetAttr(deckViews, "view", ".btn-ghost[data-view]");
    validateDatasetAttr(hubItems, "hubSection", ".hub-item[data-hub-section]");
  }

  function applyViewState() {
    const ui = ensureUIState();
    const viewMeta = VIEW_META[ui.view] || VIEW_META.hub;

    validateUIStructure();

    setText("centerPanelTitle", viewMeta.title);
    updateSystemStatus(ui);
    updateHubMeta(ui);

    $all(".ui-view").forEach((view) => {
      const panel = String(view?.dataset?.viewPanel || "").trim();
      const active = panel === ui.view;
      view.hidden = !active;
      view.classList.toggle("is-active", active);
    });

    $all(".context-view").forEach((view) => {
      const panel = String(view?.dataset?.contextView || "").trim();
      const active = panel === ui.view;
      view.hidden = !active;
      view.classList.toggle("is-active", active);
    });

    $all(".nav-link[data-view]").forEach((el) => {
      const active = String(el?.dataset?.view || "").trim() === ui.view;
      el.classList.toggle("active", active);
    });

    $all(".btn-ghost[data-view]").forEach((el) => {
      const active = String(el?.dataset?.view || "").trim() === ui.view;
      el.classList.toggle("active", active);
    });

    $all(".hub-item[data-hub-section]").forEach((el) => {
      const active = ui.view === "hub" && String(el?.dataset?.hubSection || "").trim() === ui.hubSection;
      el.classList.toggle("active", active);
    });

    setLogoStateForView(ui);
  }

  G.setUIView = function (view) {
    const ui = ensureUIState();
    if (!VIEW_KEYS.includes(view)) {
      console.error("[ui] INVALID VIEW", view);
      return false;
    }

    const from = ui.view;
    ui.view = view;

    console.log("[ui] VIEW CHANGE", { from, to: view });
    applyViewState();

    return true;
  };

  G.setHubSection = function (section) {
    const ui = ensureUIState();
    if (!HUB_KEYS.includes(section)) {
      console.error("[ui] INVALID HUB SECTION", section);
      return false;
    }

    const fromSection = ui.hubSection;
    const fromView = ui.view;

    ui.hubSection = section;
    ui.view = "hub";

    console.log("[ui] HUB CHANGE", {
      fromSection,
      toSection: section,
      fromView,
      toView: "hub"
    });

    applyViewState();
    return true;
  };

  function bindNav() {
    if (G.state?._uiNavBound) return;
    G.state._uiNavBound = true;

    document.addEventListener("click", (e) => {
      const v = e.target?.closest?.("[data-view]");
      if (v) {
        e.preventDefault();
        G.setUIView?.(String(v.dataset.view || "").trim());
        return;
      }

      const h = e.target?.closest?.("[data-hub-section]");
      if (h) {
        e.preventDefault();
        G.setHubSection?.(String(h.dataset.hubSection || "").trim());
      }
    });
  }

  /* =========================================================
     MULTI-USER STORE (LOCAL V2 / FOUNDER LOCKED)
  ========================================================= */
    function createDefaultUser(user_id, role = ROLES.CLIENT) {
    const normalizedRole = normalizeRole(role);

    return {
      profile: {
        user_id,
        name: normalizedRole === ROLES.FOUNDER ? "Founder" : "New User",
        email: "",
        company: "",
        role: normalizedRole,
        created_at: nowISO(),
        last_active: nowISO()
      },

      permissions: createPermissionSet(normalizedRole),

      account: {
        workspace: "Umbra Nexus",
        license: normalizedRole === ROLES.FOUNDER ? "Founder Access" : "Client Workspace",
        security: normalizedRole === ROLES.FOUNDER ? "Full Control" : "Restricted",
        routing: "Locked",
        created_at: nowISO(),
        last_active: nowISO()
      },

      client_config: {},
      config: {},

      state: {
        selectedCity: null,
        selectedEntity: null,
        pinnedEntities: [],
        viewHistory: []
      },

      meta: {
        created_at: nowISO(),
        locked: normalizedRole === ROLES.FOUNDER
      }
    };
  }

  function normalizeUser(user_id, user) {
    const fallback = createDefaultUser(user_id);

    const role = normalizeRole(user?.profile?.role);

    return {
      profile: {
        ...fallback.profile,
        ...(user?.profile || {}),
        role,
        user_id
      },

      permissions: createPermissionSet(role),

      account: {
        ...fallback.account,
        ...(user?.account || {})
      },

      client_config: {
        ...(user?.client_config || user?.config || {})
      },

      config: {
        ...(user?.client_config || user?.config || {})
      },

      state: {
        ...fallback.state,
        ...(user?.state || {}),
        pinnedEntities: Array.isArray(user?.state?.pinnedEntities)
          ? user.state.pinnedEntities
          : [],
        viewHistory: Array.isArray(user?.state?.viewHistory)
          ? user.state.viewHistory
          : []
      },

      meta: {
        ...fallback.meta,
        ...(user?.meta || {})
      }
    };
  }

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveStore(store) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
      console.log("[store] SAVED", store);
      return true;
    } catch (e) {
      console.error("[store] SAVE FAILED", e);
      return false;
    }
  }

  function ensureFounderAccount(store) {
    if (!store.users) store.users = {};

    if (!store.users[(window.UMBRA_CLIENT_KEY === "black_dragon" ? "client_black_dragon" : "founder_001")]) {
      store.users[(window.UMBRA_CLIENT_KEY === "black_dragon" ? "client_black_dragon" : "founder_001")] = createDefaultUser((window.UMBRA_CLIENT_KEY === "black_dragon" ? "client_black_dragon" : "founder_001"), ROLES.FOUNDER);
    }

    return store;
  }

    function ensureStore() {
    let store = loadStore();

    if (!store || typeof store !== "object" || !store.users) {
    const founder = createDefaultUser((window.UMBRA_CLIENT_KEY === "black_dragon" ? "client_black_dragon" : "founder_001"), ROLES.FOUNDER);

    store = {
      active_user: (window.UMBRA_CLIENT_KEY === "black_dragon" ? "client_black_dragon" : (window.UMBRA_CLIENT_KEY === "black_dragon" ? "client_black_dragon" : "founder_001")),
      users: {
        founder_001: founder
      }
    };
    }

    store = ensureFounderAccount(store);

    Object.keys(store.users).forEach((id) => {
    store.users[id] = normalizeUser(id, store.users[id]);
    });

    if (!store.active_user || !store.users[store.active_user]) {
    store.active_user = (window.UMBRA_CLIENT_KEY === "black_dragon" ? "client_black_dragon" : "founder_001");
    }

    if (!G.state._userStoreInitialized) {
    saveStore(store);
    G.state._userStoreInitialized = true;
    }

    return store;
    }

  function getActiveUserId() {
    return ensureStore().active_user;
  }

  function getActiveUser() {
    const store = ensureStore();
    return store.users[store.active_user];
  }

  function updateProfileField(field, value) {
    const store = ensureStore();
    const user = store.users[store.active_user];

    if (field === "role") {
      if (!requireFounder("ROLE CHANGE")) return;
      user.profile.role = normalizeRole(value);
      user.permissions = createPermissionSet(user.profile.role);
    } else {
      user.profile[field] = value;
    }

    user.profile.last_active = nowISO();
    saveStore(store);
  }

  function updateAccountField(field, value) {
    const store = ensureStore();
    const user = store.users[store.active_user];

    user.account[field] = value;
    user.account.last_active = nowISO();

    saveStore(store);
  }

  function createUser(role = ROLES.CLIENT) {
    if (!requireFounder("CREATE USER")) return null;

    const store = ensureStore();
    const user_id = makeUserId(role === ROLES.CLIENT ? "client" : "user");

    store.users[user_id] = createDefaultUser(user_id, role);

    saveStore(store);

    bindProfileInputs();
    bindAccountInputs();
    renderClientConfigPanel();
    refreshUserSelector();
    applyAdminVisibility();

    console.log("[user] CREATED", user_id, role);
    return user_id;
  }

 function switchUser(user_id) {
  const store = ensureStore();
  const current = store.users[store.active_user];

  if (!store.users[user_id]) {
    console.error("[user] SWITCH FAILED:", user_id);
    return false;
  }

  const currentIsFounder = isFounder(current);
  const returningToFounder = user_id === (window.UMBRA_CLIENT_KEY === "black_dragon" ? "client_black_dragon" : "founder_001");

  if (!currentIsFounder && !returningToFounder) {
    console.warn("[user] SWITCH USER BLOCKED (not founder)");
    return false;
  }

  store.active_user = user_id;

  saveStore(store);

  applyActiveUserRuntimeContext();
  bindProfileInputs();
  bindAccountInputs();
  renderClientConfigPanel();
  refreshUserSelector();
  applyAdminVisibility();

  console.log("[user] SWITCHED", user_id);
  return true;
}

  function getUserState() {
  return getActiveUser().state;
}

  function setSelectedCity(city_id) {
    const store = ensureStore();
    const user = store.users[store.active_user];

    user.state.selectedCity = city_id || null;
    user.state.viewHistory.unshift({
      type: "city",
      id: city_id || null,
      at: nowISO()
    });

    user.state.viewHistory = user.state.viewHistory.slice(0, 50);
    saveStore(store);
  }

  function setSelectedEntity(entity_id) {
    const store = ensureStore();
    const user = store.users[store.active_user];

    user.state.selectedEntity = entity_id || null;
    user.state.viewHistory.unshift({
      type: "entity",
      id: entity_id || null,
      at: nowISO()
    });

    user.state.viewHistory = user.state.viewHistory.slice(0, 50);
    saveStore(store);
  }

  function pinEntity(entity_id) {
    if (!entity_id) return false;

    const store = ensureStore();
    const user = store.users[store.active_user];

    if (!user.state.pinnedEntities.includes(entity_id)) {
      user.state.pinnedEntities.push(entity_id);
    }

    saveStore(store);
    return true;
  }

  function unpinEntity(entity_id) {
    if (!entity_id) return false;

    const store = ensureStore();
    const user = store.users[store.active_user];

    user.state.pinnedEntities = user.state.pinnedEntities.filter((id) => id !== entity_id);

    saveStore(store);
    return true;
  }

  function bindProfileInputs() {
    const user = getActiveUser();

    const map = {
      profileName: "name",
      profileEmail: "email",
      profileCompany: "company",
      profileRole: "role"
    };

    Object.entries(map).forEach(([id, field]) => {
      const el = document.getElementById(id);
      if (!el) return;

      el.value = user.profile[field] || "";

      if (field === "role") {
        el.disabled = !isFounder(user);
      }

      el.oninput = (e) => {
        updateProfileField(field, e.target.value);
      };
    });
  }

  function bindAccountInputs() {
    const user = getActiveUser();

    const map = {
      accountWorkspace: "workspace",
      accountLicense: "license",
      accountSecurity: "security",
      accountRouting: "routing"
    };

    Object.entries(map).forEach(([id, field]) => {
      const el = document.getElementById(id);
      if (!el) return;

      el.value = user.account[field] || "";

      el.oninput = (e) => {
        updateAccountField(field, e.target.value);
      };
    });
  }

  function renderClientConfigPanel() {
    const runtimeCfg = window.UmbraGlobe?.state?.clientConfig;
    const runtimeSignals = window.UmbraGlobe?.state?.clientSignals;
    const user = getActiveUser();

    const cfg =
      runtimeCfg && runtimeCfg.client_id
        ? {
            industry: "Law Enforcement / Public Safety Training",

            useCase:
              runtimeCfg.objective?.primary_outcome ||
              runtimeCfg.offer?.product_name ||
              "",

            operationalScope:
              runtimeCfg.target_profile?.geography?.scope ||
              "National",

            targetTypes:
              runtimeCfg.target_profile?.target_organization_types || [],

            prioritySignals:
              runtimeSignals?.top_signals
                ? Object.values(runtimeSignals.top_signals).map(
                    (signal) => signal.label
                  )
                : [],

            primaryRegions:
              runtimeCfg.target_profile?.geography?.tier_1_states || [
                "United States"
              ]
          }
        : user?.client_config || {};

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (!el) return;

      if (Array.isArray(value)) {
        el.innerHTML = value.length
          ? value.map((x) => `<div>â€¢ ${String(x)}</div>`).join("")
          : "â€”";
        return;
      }

      el.textContent = String(value || "â€”");
    };

    set("clientConfigIndustry", cfg.industry);
    set("clientConfigUseCase", cfg.useCase);
    set("clientConfigScope", cfg.operationalScope);
    set("clientConfigTargets", cfg.targetTypes);
    set("clientConfigSignals", cfg.prioritySignals);
    set("clientConfigRegions", cfg.primaryRegions);
  }

  function refreshUserSelector() {
    const select = document.getElementById("userSelect");
    if (!select) return;

    const store = ensureStore();
    select.innerHTML = "";

    Object.entries(store.users).forEach(([user_id, user]) => {
      const opt = document.createElement("option");
      opt.value = user_id;

      const role = normalizeRole(user.profile?.role);
      const name = user.profile?.name || user_id;

      opt.textContent = `${name} â€” ${role}`;

      if (user_id === store.active_user) {
        opt.selected = true;
      }

      select.appendChild(opt);
    });
  }

  function applyAdminVisibility() {
    const user = getActiveUser();
    const founder = isFounder(user);

    const panel = document.getElementById("adminPanel");
    const select = document.getElementById("userSelect");
    const create = document.getElementById("userCreate");
    const presetSelect = document.getElementById("clientPresetSelect");
    const presetButton = document.getElementById("applyClientPreset");

    if (panel) panel.hidden = !founder;
    if (select) select.disabled = !founder;
    if (create) create.disabled = !founder;
    if (presetSelect) presetSelect.disabled = !founder;
    if (presetButton) presetButton.disabled = !founder;
  }

  function createBlackDragonClientAccount() {
    if (!requireFounder("CREATE BLACK DRAGON CLIENT")) return null;

    const store = ensureStore();
    const user_id = "client_black_dragon";

    store.users[user_id] = normalizeUser(user_id, {
      profile: {
        user_id,
        name: "Black Dragon",
        email: "client@blackdragon.local",
        company: "Black Dragon Training Group",
        role: ROLES.CLIENT,
        created_at: nowISO(),
        last_active: nowISO()
      },

      permissions: createPermissionSet(ROLES.CLIENT),

      account: {
        workspace: "Black Dragon Law Enforcement Training Expansion",
        license: "Active Client Workspace",
        security: "Client-Restricted / No Founder Access",
        routing: "Agency Target Acquisition Pipeline",
        created_at: nowISO(),
        last_active: nowISO()
      },

      client_config: {
        industry: "Law Enforcement / Public Safety Training",
        useCase: "Motorcycle club culture training and agency outreach",
        operationalScope: "Multi-state agency targeting",
        targetTypes: [
          "Police Departments",
          "Sheriff Offices",
          "Public Safety Agencies",
          "Task Forces",
          "Prosecutors",
          "Courts"
        ],
        prioritySignals: [
          "Training fit",
          "Agency size",
          "Operational relevance",
          "Contact actionability",
          "Strategic credibility"
        ],
        primaryRegions: [
          "Arizona",
          "California",
          "Florida",
          "New York",
          "Texas",
          "Multi-state expansion"
        ]
      },

      state: {
        selectedCity: null,
        selectedEntity: null,
        pinnedEntities: [],
        viewHistory: []
      },

      meta: {
        created_at: nowISO(),
        locked: false,
        production_client: true,
        demo: false
      }
    });

    saveStore(store);

    bindProfileInputs();
    bindAccountInputs();
    renderClientConfigPanel();
    refreshUserSelector();
    applyAdminVisibility();

    console.log("[user] BLACK DRAGON CLIENT READY", user_id);
    return store.users[user_id];
  }

  function createDemoUser(preset = {}) {
    if (!requireFounder("CREATE DEMO USER")) return null;

    const store = ensureStore();
    const now = Date.now();
    const user_id = makeUserId("demo");

    store.users[user_id] = normalizeUser(user_id, {
      profile: {
        user_id,
        name: preset.name || "Nexus Demo",
        email: preset.email || "",
        company: preset.company || "",
        role: ROLES.DEMO,
        created_at: nowISO(),
        last_active: nowISO()
      },

      permissions: createPermissionSet(ROLES.DEMO),

      account: {
        workspace: preset.workspace || "Umbra Nexus Demo",
        license: "Temporary Demo Access",
        security: "Demo-Restricted",
        routing: "Limited Dataset Scope",
        created_at: nowISO(),
        last_active: nowISO()
      },

      client_config: preset.client_config || {
        industry: preset.industry || "Demo",
        useCase: preset.useCase || "Temporary Nexus evaluation",
        operationalScope: preset.operationalScope || "Limited demo scope",
        targetTypes: preset.targetTypes || [],
        prioritySignals: preset.prioritySignals || [],
        primaryRegions: preset.primaryRegions || []
      },

      state: {
        selectedCity: null,
        selectedEntity: null,
        pinnedEntities: [],
        viewHistory: []
      },

      meta: {
        created_at: nowISO(),
        locked: false,
        demo: true,
        expires_at: now + ((preset.days || 5) * 24 * 60 * 60 * 1000),
        allowed_city_ids: preset.allowed_city_ids || [],
        max_entities: preset.max_entities || 40
      }
    });

    saveStore(store);

    bindProfileInputs();
    bindAccountInputs();
    renderClientConfigPanel();
    refreshUserSelector();
    applyAdminVisibility();

    console.log("[user] DEMO CREATED", user_id);
    return store.users[user_id];
  }
    function initUserUI() {
    const select = document.getElementById("userSelect");
    const createBtn = document.getElementById("userCreate");

    if (select) {
      select.onchange = (e) => {
        switchUser(e.target.value);
      };
    }

    if (createBtn) {
      createBtn.onclick = () => {
        createUser(ROLES.CLIENT);
      };
    }

    refreshUserSelector();
  }

  function bindClientConfigUI() {
    const select = document.getElementById("clientPresetSelect");
    const button = document.getElementById("applyClientPreset");

    if (!select || !button) return;

    button.onclick = () => {
      if (!requireFounder("APPLY CLIENT PRESET")) return;

      const preset = select.value;
      if (!preset) return;

      if (window.UmbraClientConfig?.applyPreset) {
        window.UmbraClientConfig.applyPreset(preset);
        renderClientConfigPanel();
      }
    };
  }

  function recordSelectionFromState() {
    const cityId =
      G.state?.activeCityId ||
      G.state?.activeCity?.city_id ||
      G.state?.selectedCityId ||
      null;

    const entityId =
      G.state?.activeEntityId ||
      G.state?.selectedEntityId ||
      G.state?.selection?.entity_id ||
      null;

    if (cityId) setSelectedCity(cityId);
    if (entityId) setSelectedEntity(entityId);
  }

  function checkDemoExpiration(user = getActiveUser()) {
    if (!isDemo(user)) return false;

    const expiresAt = Number(user?.meta?.expires_at || 0);
    if (!expiresAt) return false;

    if (Date.now() <= expiresAt) return false;

    console.warn("[demo] ACCESS EXPIRED", user.profile?.user_id);

    const root = document.body;
    if (root) {
      root.innerHTML = `
        <main style="min-height:100vh;display:grid;place-items:center;background:#050609;color:#f2efe7;font-family:system-ui;">
          <section style="max-width:560px;padding:32px;border:1px solid rgba(201,164,92,.28);border-radius:20px;background:rgba(12,14,18,.92);">
            <p style="color:#c9a45c;letter-spacing:.14em;text-transform:uppercase;font-size:12px;">Umbra Nexus Demo</p>
            <h1>Demo Access Expired</h1>
            <p style="color:#aaa;line-height:1.55;">Your temporary Nexus demo period has ended. Request continued access to move into a pilot or full account.</p>
            <a href="/request-demo.html" style="color:#c9a45c;">Request Continued Access</a>
          </section>
        </main>
      `;
    }

    return true;
  }

  function getUserStoreDebug() {
    return ensureStore();
  }

  function resetUserStore() {
    if (!requireFounder("RESET STORE")) return ensureStore();

    localStorage.removeItem(STORE_KEY);
    console.warn("[store] RESET", STORE_KEY);

    const store = ensureStore();

    bindProfileInputs();
    bindAccountInputs();
    refreshUserSelector();
    applyAdminVisibility();

    return store;
  }

  function exportUserStore() {
    if (!requireFounder("EXPORT STORE")) return null;
    return JSON.stringify(ensureStore(), null, 2);
  }

  function getRoleDebug() {
    const store = ensureStore();

    return {
      active_user: store.active_user,
      users: Object.entries(store.users).map(([user_id, user]) => ({
        user_id,
        name: user.profile?.name,
        role: normalizeRole(user.profile?.role),
        isFounder: isFounder(user),
        isClient: isClient(user),
        isDemo: isDemo(user),
        permissions: user.permissions || {},
        meta: user.meta || {}
      }))
    };
  }

  function applyActiveUserRuntimeContext() {
    const user = getActiveUser();

    G.state.activeUser = user;
    G.state.activeUserId = user?.profile?.user_id || getActiveUserId();
    G.state.activeUserRole = normalizeRole(user?.profile?.role);

    if (user?.client_config) {
      G.state.clientConfig = user.client_config;
      G.state.activeClientConfig = user.client_config;
    }

    if (isDemo(user)) {
      G.state.demoScope = {
        expires_at: user?.meta?.expires_at || null,
        allowed_city_ids: user?.meta?.allowed_city_ids || [],
        max_entities: user?.meta?.max_entities || 40
      };
    } else {
      G.state.demoScope = null;
    }

    return user;
  }

  window.UmbraUsers = {
    ROLES,
    createUser,
    createBlackDragonClientAccount,
    createDemoUser,
    switchUser,
    getStore: getUserStoreDebug,
    getActiveUser,
    getActiveUserId,
    getUserState,
    setSelectedCity,
    setSelectedEntity,
    pinEntity,
    unpinEntity,
    recordSelectionFromState,
    resetStore: resetUserStore,
    exportStore: exportUserStore,
    getRoleDebug,
    isFounder,
    isClient,
    isDemo,
    normalizeRole
  };

  G.initUI = function () {
    if (!document.body) {
      console.error("[ui] INIT FAILED: document.body missing");
      return;
    }

    installUISanitizer();

    const ui = ensureUIState();

    bindNav();
    setNodesVisible(true);
    applyViewState();
    ensureStore();

    const activeUser = applyActiveUserRuntimeContext();

    if (checkDemoExpiration(activeUser)) return;

    const userState = getUserState();

    if (userState.selectedCity && typeof G.setSelectedCity === "function") {
      G.setSelectedCity(userState.selectedCity);
    }

    if (userState.selectedEntity && typeof G.setSelectedEntity === "function") {
      G.setSelectedEntity(userState.selectedEntity);
    }

    bindProfileInputs();
    bindAccountInputs();
    renderClientConfigPanel();
    initUserUI();
    bindClientConfigUI();
    applyAdminVisibility();

    ui.initialized = true;

    console.log("[ui] INIT COMPLETE", {
      view: ui.view,
      hubSection: ui.hubSection,
      activeUser: getActiveUserId(),
      activeRole: normalizeRole(getActiveUser()?.profile?.role)
    });
  };
})();