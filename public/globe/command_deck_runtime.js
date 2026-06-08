(function () {
  "use strict";

  const G = window.UmbraCommandDeck =
    window.UmbraCommandDeck || {};

  let state = {
    mounted: false,
    activeModule: "WORLD",
    modules: {},
    last_error: null
  };

  const MODULE_ALIASES = {
    "ACCESS": "ACCESS",
    "PROFILE": "PROFILE",
    "ACCOUNT": "ACCOUNT",

    "LEADS ENGINE": "LEADS_ENGINE",
    "CLIENTS": "CLIENTS",
    "OPERATIONS": "OPERATIONS",
    "SAFEGUARDS": "SAFEGUARDS",

    "WORLD": "WORLD",

    "RUNTIME": "RUNTIME",
    "VALIDATION": "VALIDATION",
    "REPLAY": "REPLAY",
    "SATURATION": "SATURATION",
    "SHARDS": "SHARDS",

    "INTELLIGENCE": "INTELLIGENCE",
    "AUDITS": "AUDITS",
    "LOCKS": "LOCKS",
    "STATUS": "STATUS",
    "CERTIFICATIONS": "CERTIFICATIONS"
  };

  function normalize(text) {
    return String(text || "")
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  function getButtons() {
    return Array.from(document.querySelectorAll("button,a,div,li"))
      .filter(el => {
        const txt = normalize(el.textContent);

        return !!MODULE_ALIASES[txt];
      });
  }

  function clearActiveStates() {
    getButtons().forEach(el => {
      el.classList.remove("umbra-commanddeck-active");
      el.removeAttribute("data-umbra-active");
    });
  }

  function applyActiveState(moduleId) {
    clearActiveStates();

    getButtons().forEach(el => {
      const txt = normalize(el.textContent);

      if (MODULE_ALIASES[txt] === moduleId) {
        el.classList.add("umbra-commanddeck-active");
        el.setAttribute("data-umbra-active", "true");
      }
    });

    state.activeModule = moduleId;

    try {
      window.UMBRA_ACTIVE_MODULE = moduleId;
    } catch (err) {}
  }

  function ensureStyle() {
    if (document.getElementById("umbraCommandDeckStyle")) {
      return true;
    }

    const style = document.createElement("style");

    style.id = "umbraCommandDeckStyle";

    style.textContent = `
      .umbra-commanddeck-active,
      [data-umbra-active="true"] {
        outline: 1px solid rgba(255,140,42,0.85) !important;
        box-shadow:
          0 0 12px rgba(255,140,42,0.25),
          inset 0 0 8px rgba(255,140,42,0.12);
        border-radius: 8px;
        transition: all 140ms ease;
      }
    `;

    document.head.appendChild(style);

    return true;
  }

  function bindButton(el) {
    if (!el || el.__umbraBound) return false;

    const txt = normalize(el.textContent);
    const moduleId = MODULE_ALIASES[txt];

    if (!moduleId) return false;

    el.__umbraBound = true;

    el.style.cursor = "pointer";

    el.addEventListener("click", function () {
      applyActiveState(moduleId);

      console.info("[UmbraCommandDeck] active module", {
        module: moduleId
      });

      try {
        window.dispatchEvent(
          new CustomEvent("umbra:moduleChanged", {
            detail: {
              module: moduleId
            }
          })
        );
      } catch (err) {}
    });

    state.modules[moduleId] = true;

    return true;
  }

  function bindAll() {
    ensureStyle();

    const buttons = getButtons();

    buttons.forEach(bindButton);

    if (!state.activeModule) {
      state.activeModule = "WORLD";
    }

    applyActiveState(state.activeModule);

    state.mounted = true;

    return buttons.length;
  }

  function getDebugState() {
    return {
      version: "umbra_command_deck_runtime_v1",
      mounted: state.mounted,
      active_module: state.activeModule,
      modules_detected: Object.keys(state.modules),
      buttons_detected: getButtons().length,
      last_error: state.last_error
    };
  }

  G.bindAll = bindAll;
  G.applyActiveState = applyActiveState;
  G.getButtons = getButtons;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(bindAll, 1500);
  });

  if (document.readyState !== "loading") {
    setTimeout(bindAll, 1500);
  }
})();

// BATCH 613R: native command/search API
(function installNativeCommandSearchAPI613R() {
  const G = window.UmbraGlobe = window.UmbraGlobe || {};
  G.commands = G.commands || {};

  if (G.commands.__nativeCommandSearch613RInstalled) return;
  G.commands.__nativeCommandSearch613RInstalled = true;

  function norm(value) {
    return String(value || "").toLowerCase().trim();
  }

  function entities() {
    return Array.isArray(window.UMBRA_DATA?.entities) ? window.UMBRA_DATA.entities : [];
  }

  function cities() {
    return Array.isArray(window.UMBRA_DATA?.cities) ? window.UMBRA_DATA.cities : [];
  }

  function entityId(entity) {
    return entity?.entity_id || entity?.entityId || entity?.id || "";
  }

  function cityId(city) {
    return city?.city_id || city?.cityId || city?.id || "";
  }

  function entityCityId(entity) {
    return entity?.city_id || entity?.cityId || "";
  }

  function labelOf(item) {
    return [
      item?.name,
      item?.label,
      item?.city,
      item?.region,
      item?.country,
      item?.entity_type,
      item?.type,
      item?.status,
      item?.priority,
      item?.entity_id,
      item?.city_id,
      item?.id
    ].filter(Boolean).join(" ");
  }

  function scoreEntity(entity) {
    try {
      return G.intel?.pipeline?.scoreEntity?.(entity) || entity.intelligence || null;
    } catch {
      return entity.intelligence || null;
    }
  }

  function searchEntities(query, limit) {
    const q = norm(query);
    const n = Math.max(1, Number(limit || 20));

    return entities()
      .map(entity => {
        const haystack = norm(labelOf(entity));
        const matched = !q || haystack.includes(q);
        const intelligence = scoreEntity(entity);

        return {
          type: "entity",
          id: entityId(entity),
          cityId: entityCityId(entity),
          name: entity.name || entity.label || entityId(entity),
          score: intelligence?.score ?? 0,
          tier: intelligence?.tier || "DORMANT",
          matched,
          entity
        };
      })
      .filter(result => result.matched)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, n);
  }

  function searchCities(query, limit) {
    const q = norm(query);
    const n = Math.max(1, Number(limit || 20));

    return cities()
      .map(city => {
        const haystack = norm(labelOf(city));
        const matched = !q || haystack.includes(q);

        return {
          type: "city",
          id: cityId(city),
          name: city.name || city.label || city.city || cityId(city),
          city,
          matched
        };
      })
      .filter(result => result.matched)
      .slice(0, n);
  }

  function search(query, limit) {
    const n = Math.max(1, Number(limit || 20));
    return [
      ...searchEntities(query, n),
      ...searchCities(query, n)
    ].slice(0, n);
  }

  function topTargets(limit) {
    const n = Math.max(1, Number(limit || 10));
    const getTop = G.intel?.pipeline?.getTopEntities;

    if (typeof getTop === "function") {
      return getTop(n).map(entity => {
        const intelligence = entity.intelligence || scoreEntity(entity);
        return {
          type: "entity",
          id: entityId(entity),
          cityId: entityCityId(entity),
          name: entity.name || entity.label || entityId(entity),
          score: intelligence?.score ?? 0,
          tier: intelligence?.tier || "DORMANT",
          entity
        };
      });
    }

    return searchEntities("", n);
  }

  function focusEntity(id) {
    const target = entities().find(entity => entityId(entity) === id);
    if (!target) return { ok: false, reason: "entity_not_found", id };

    G.state = G.state || {};
    G.state.activeEntityId = entityId(target);
    G.state.activeCityId = entityCityId(target) || G.state.activeCityId || null;

    try {
      if (typeof G.openDossierForNode === "function") {
        G.openDossierForNode(target);
      } else if (typeof window.openDossierForNode === "function") {
        window.openDossierForNode(target);
      }
    } catch {}

    setTimeout(() => {
      try { G.injectDossierIntelligenceSummary610R?.("command_focus_entity"); } catch {}
    }, 120);

    return {
      ok: true,
      type: "entity",
      id: G.state.activeEntityId,
      cityId: G.state.activeCityId,
      entity: target
    };
  }

  function focusCity(id) {
    const target = cities().find(city => cityId(city) === id);
    if (!target) return { ok: false, reason: "city_not_found", id };

    G.state = G.state || {};
    G.state.activeCityId = cityId(target);

    if (typeof G.enterCityFocus === "function") {
      try { G.enterCityFocus(G.state.activeCityId, "command_search"); } catch {}
    } else if (typeof G.enterCityMap === "function") {
      try { G.enterCityMap(G.state.activeCityId, "command_search"); } catch {}
    }

    return {
      ok: true,
      type: "city",
      id: G.state.activeCityId,
      city: target
    };
  }

  G.commands.search = search;
  G.commands.searchEntities = searchEntities;
  G.commands.searchCities = searchCities;
  G.commands.topTargets = topTargets;
  G.commands.focusEntity = focusEntity;
  G.commands.focusCity = focusCity;

  G.commands.__nativeCommandSearch613R = {
    installed: true,
    entities: entities().length,
    cities: cities().length,
    commands: [
      "search",
      "searchEntities",
      "searchCities",
      "topTargets",
      "focusEntity",
      "focusCity"
    ]
  };

  console.log("[613R] native command/search API installed", G.commands.__nativeCommandSearch613R);
})();

// BATCH 613R-A: command focus dossier open-state repair
(function installCommandFocusDossierOpenState613RA() {
  const G = window.UmbraGlobe = window.UmbraGlobe || {};
  G.commands = G.commands || {};

  if (G.commands.__commandFocusDossierOpenState613RAInstalled) return;
  G.commands.__commandFocusDossierOpenState613RAInstalled = true;

  const previousFocusEntity = G.commands.focusEntity;

  G.commands.focusEntity = function focusEntityWithDossierOpenState613RA(id) {
    const result = typeof previousFocusEntity === "function"
      ? previousFocusEntity(id)
      : { ok: false, reason: "previous_focusEntity_missing", id };

    setTimeout(() => {
      const lead = document.getElementById("leadContent");
      const panel = document.getElementById("dossierPanel");

      if (result?.ok && lead && panel) {
        document.body.classList.add("dossier-open");

        try { G.injectDossierIntelligenceSummary610R?.("command_focus_entity_open_state"); } catch {}

        G.commands.__commandFocusDossierOpenState613RA = {
          installed: true,
          activeEntityId: G.state?.activeEntityId || null,
          dossierOpen: document.body.classList.contains("dossier-open"),
          leadContentLength: lead.innerHTML.length
        };
      }
    }, 180);

    return result;
  };

  G.commands.__commandFocusDossierOpenState613RA = {
    installed: true,
    wrapped: true
  };
})();

// BATCH 614R: visual command palette
(function installVisualCommandPalette614R() {
  const G = window.UmbraGlobe = window.UmbraGlobe || {};
  G.commands = G.commands || {};

  if (G.commands.__visualCommandPalette614RInstalled) return;
  G.commands.__visualCommandPalette614RInstalled = true;

  function ensurePalette() {
    let shell = document.getElementById("nexusCommandPalette614R");
    if (shell) return shell;

    shell = document.createElement("section");
    shell.id = "nexusCommandPalette614R";
    shell.className = "nexus-command-palette";
    shell.setAttribute("aria-hidden", "true");

    shell.innerHTML = [
      '<div class="nexus-command-backdrop" data-command-close="true"></div>',
      '<div class="nexus-command-box" role="dialog" aria-label="Nexus Command Palette">',
      '  <div class="nexus-command-title">NEXUS COMMAND</div>',
      '  <input id="nexusCommandInput614R" class="nexus-command-input" placeholder="Search Nexus..." autocomplete="off" />',
      '  <div id="nexusCommandResults614R" class="nexus-command-results"></div>',
      '  <div class="nexus-command-hint">Ctrl+K / Cmd+K to open • Esc to close</div>',
      '</div>'
    ].join("");

    document.body.appendChild(shell);

    if (!document.getElementById("nexusCommandPalette614RStyles")) {
      const style = document.createElement("style");
      style.id = "nexusCommandPalette614RStyles";
      style.textContent = [
        '#nexusCommandPalette614R{position:fixed;inset:0;z-index:999999;display:none;font-family:Inter,system-ui,Arial,sans-serif;}',
        '#nexusCommandPalette614R.is-open{display:block;}',
        '#nexusCommandPalette614R .nexus-command-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.58);backdrop-filter:blur(6px);}',
        '#nexusCommandPalette614R .nexus-command-box{position:absolute;top:12vh;left:50%;transform:translateX(-50%);width:min(720px,calc(100vw - 32px));background:rgba(8,10,14,.96);border:1px solid rgba(218,185,117,.45);box-shadow:0 24px 90px rgba(0,0,0,.65);border-radius:18px;overflow:hidden;color:#f4ead8;}',
        '#nexusCommandPalette614R .nexus-command-title{padding:14px 18px 8px;font-size:11px;letter-spacing:.22em;color:#d8b26a;text-transform:uppercase;}',
        '#nexusCommandPalette614R .nexus-command-input{width:100%;box-sizing:border-box;border:0;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#fff;font-size:20px;padding:18px;outline:none;}',
        '#nexusCommandPalette614R .nexus-command-results{max-height:52vh;overflow:auto;padding:8px;}',
        '#nexusCommandPalette614R .nexus-command-row{width:100%;display:grid;grid-template-columns:86px 1fr 86px;gap:12px;align-items:center;border:0;border-radius:12px;background:transparent;color:#f7f1e6;padding:12px;text-align:left;cursor:pointer;}',
        '#nexusCommandPalette614R .nexus-command-row:hover,#nexusCommandPalette614R .nexus-command-row.is-active{background:rgba(218,185,117,.16);}',
        '#nexusCommandPalette614R .command-type{font-size:10px;letter-spacing:.16em;color:#d8b26a;text-transform:uppercase;}',
        '#nexusCommandPalette614R .command-name{font-size:14px;line-height:1.25;}',
        '#nexusCommandPalette614R .command-meta{font-size:12px;color:#b8aa91;text-align:right;}',
        '#nexusCommandPalette614R .nexus-command-empty{padding:20px;color:#b8aa91;}',
        '#nexusCommandPalette614R .nexus-command-hint{padding:10px 16px 14px;color:#8f846f;font-size:11px;border-top:1px solid rgba(255,255,255,.06);}'
      ].join("");
      document.head.appendChild(style);
    }

    return shell;
  }

  function state() {
    const shell = ensurePalette();
    return {
      shell,
      input: shell.querySelector("#nexusCommandInput614R"),
      results: shell.querySelector("#nexusCommandResults614R")
    };
  }

  function resultLabel(item) {
    if (item.type === "entity") return item.name || item.id || "Entity";
    if (item.type === "city") return item.name || item.id || "City";
    return item.name || item.id || "Result";
  }

  function renderResults(query) {
    const s = state();
    const q = String(query || "").trim();

    let results = [];

    if (!q) {
      results = (G.commands.topTargets?.(8) || []).map(item => Object.assign({}, item, { type: "entity", commandKind: "target" }));
    } else {
      results = G.commands.search?.(q, 12) || [];
    }

    if (!results.length) {
      s.results.innerHTML = '<div class="nexus-command-empty">No results</div>';
      return results;
    }

    s.results.innerHTML = results.map((item, index) => {
      const type = item.commandKind === "target" ? "TARGET" : String(item.type || "RESULT").toUpperCase();
      const score = item.score != null ? String(item.score) : "";
      const tier = item.tier ? String(item.tier) : "";
      const meta = [score, tier].filter(Boolean).join(" ");
      const id = item.id || "";
      const cityId = item.cityId || "";

      return [
        '<button type="button" class="nexus-command-row' + (index === 0 ? ' is-active' : '') + '" data-index="' + String(index) + '" data-type="' + String(item.type || "") + '" data-id="' + String(id) + '" data-city-id="' + String(cityId) + '">',
        '  <span class="command-type">' + type + '</span>',
        '  <span class="command-name">' + String(resultLabel(item)) + '</span>',
        '  <span class="command-meta">' + meta + '</span>',
        '</button>'
      ].join("");
    }).join("");

    G.commands.__visualCommandPalette614R.lastResults = results;
    return results;
  }

  function openPalette(seed) {
    const s = state();
    s.shell.classList.add("is-open");
    s.shell.setAttribute("aria-hidden", "false");
    s.input.value = seed || "";
    renderResults(s.input.value);
    setTimeout(() => s.input.focus(), 0);

    G.commands.__visualCommandPalette614R = {
      installed: true,
      open: true,
      lastQuery: s.input.value,
      resultCount: (G.commands.__visualCommandPalette614R?.lastResults || []).length
    };
  }

  function closePalette() {
    const s = state();
    s.shell.classList.remove("is-open");
    s.shell.setAttribute("aria-hidden", "true");

    G.commands.__visualCommandPalette614R = Object.assign(
      {},
      G.commands.__visualCommandPalette614R || {},
      { installed: true, open: false }
    );
  }

  function executeResult(item) {
    if (!item) return { ok: false, reason: "missing_item" };

    if (item.type === "entity") {
      return G.commands.focusEntity?.(item.id);
    }

    if (item.type === "city") {
      return G.commands.focusCity?.(item.id);
    }

    return { ok: false, reason: "unsupported_type", item };
  }

  document.addEventListener("keydown", event => {
    const isCommandK = (event.ctrlKey || event.metaKey) && String(event.key || "").toLowerCase() === "k";
    if (isCommandK) {
      event.preventDefault();
      openPalette("");
      return;
    }

    if (event.key === "Escape") {
      closePalette();
      return;
    }

    if (event.key === "Enter") {
      const s = state();
      if (!s.shell.classList.contains("is-open")) return;

      const first = s.results.querySelector(".nexus-command-row.is-active") || s.results.querySelector(".nexus-command-row");
      if (!first) return;

      const idx = Number(first.getAttribute("data-index") || 0);
      const item = G.commands.__visualCommandPalette614R?.lastResults?.[idx];

      const result = executeResult(item);
      G.commands.__visualCommandPalette614R.lastExecute = result;

      closePalette();
    }
  }, true);

  document.addEventListener("input", event => {
    if (event.target?.id !== "nexusCommandInput614R") return;
    const query = event.target.value || "";
    const results = renderResults(query);
    G.commands.__visualCommandPalette614R = Object.assign(
      {},
      G.commands.__visualCommandPalette614R || {},
      {
        installed: true,
        open: true,
        lastQuery: query,
        resultCount: results.length
      }
    );
  }, true);

  document.addEventListener("click", event => {
    if (event.target?.getAttribute?.("data-command-close") === "true") {
      closePalette();
      return;
    }

    const row = event.target?.closest?.(".nexus-command-row");
    if (!row) return;

    const idx = Number(row.getAttribute("data-index") || 0);
    const item = G.commands.__visualCommandPalette614R?.lastResults?.[idx];

    const result = executeResult(item);
    G.commands.__visualCommandPalette614R.lastExecute = result;

    closePalette();
  }, true);

  G.commands.openPalette = openPalette;
  G.commands.closePalette = closePalette;
  G.commands.renderPaletteResults = renderResults;

  G.commands.__visualCommandPalette614R = {
    installed: true,
    open: false,
    lastResults: []
  };

  setTimeout(() => ensurePalette(), 300);
  console.log("[614R] visual command palette installed", G.commands.__visualCommandPalette614R);
})();

