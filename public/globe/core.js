window.UmbraGlobe = window.UmbraGlobe || {};
// public/globe/core.js
(function () {
  const KEY = "UmbraGlobe";

  let REF = null;
  try {
    const existing = window[KEY];
    if (existing && typeof existing === "object") REF = existing;
  } catch {}
  if (!REF) REF = {};

  (function lockUmbraGlobeRef() {
    const desc = Object.getOwnPropertyDescriptor(window, KEY);
    if (desc && desc.configurable === false) return;

    try {
      Object.defineProperty(window, KEY, {
        configurable: false,
        enumerable: true,
        get() { return REF; },
        set(v) {
          console.error("[LOCK] BLOCKED overwrite of window.UmbraGlobe:", v);
        },
      });
    } catch (e) {
      console.error("[core] FAILED to lock window.UmbraGlobe. Must be fixed.", e);
    }
  })();

  const G = window.UmbraGlobe;
  console.log("[SIGNATURE] globe/core.js LOADED", new Date().toISOString());

  function isObj(x) { return x && typeof x === "object"; }

  function deepMergeFillMissing(dst, src) {
    if (!isObj(dst) || !isObj(src)) return dst;
    for (const k of Object.keys(src)) {
      const v = src[k];
      const cur = dst[k];
      if (cur === undefined) {
        dst[k] = v;
        continue;
      }
      if (isObj(cur) && !Array.isArray(cur) && isObj(v) && !Array.isArray(v)) {
        deepMergeFillMissing(cur, v);
      }
    }
    return dst;
  }

  function hydrateState(dst, defaults) {
    if (!isObj(dst)) dst = {};
    for (const k of Object.keys(defaults)) {
      const dv = defaults[k];
      const cur = dst[k];

      if (cur === undefined) {
        dst[k] = (isObj(dv) && !Array.isArray(dv)) ? hydrateState({}, dv) : dv;
        continue;
      }

      if (isObj(dv) && !Array.isArray(dv) && isObj(cur) && !Array.isArray(cur)) {
        hydrateState(cur, dv);
      }
    }
    return dst;
  }

  const STATE_DEFAULTS = {
    container: null,
    debugBox: null,
    scene: null,
    camera: null,
    renderer: null,

    worldGroup: null,

    earthRadius: 1.0,

    globeMesh: null,
    veinsMesh: null,
    starfieldMesh: null,

    // glow system
    edgeGlowMesh: null,
    outerHaloMesh: null,
    sunSheenMesh: null,
    atmoHaloMesh: null,

    // light refs
    sunLight: null,
    rimLight: null,

    citiesGroup: null,
    entitiesGroup: null,

    entitiesByCity: null,
    citiesById: null,
    entitiesById: null,
    entitiesListByCity: null,
    cityMeshes: [],
    entityMeshes: [],
    pickMeshes: [],
    cityMapPickMeshes: [],

    nodesEnabled: true,
    starfieldEnabled: true,
    veinsEnabled: true,

    mode: "WORLD", // WORLD | CITY_FOCUS | CITY_MAP
    activeCityId: null,
    activeEntityId: null,

    activeCityMeta: null,
    activeCityTexture: null,
    activeCityTileInfo: null,

    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    clickCandidate: false,
    isFocused: false,
    focusQuat: null,

    yaw: 0,
    pitch: 0,
    allowAutoSpin: false,

    targetZoom: 3.2,
    defaultZoom: 3.2,
    focusedZoom: 1.3,
    cityMapZoom: 0.96,

    textureLonOffsetDeg: 0,
    lonOffsetDeg: 0,

    lastTime: 0,

    _coreInited: false,
    _resizeBound: false,
    _onResize: null,

    _booted: false,
    _rafId: 0,
    _rafRunning: false,

    _lonOffsetLocked: false,
    _lonOffsetLockedValue: 0,
    _textureLonOffsetLocked: false,
    _textureLonOffsetLockedValue: 0,

    _integrity: { lastStage: null, lastOk: true, issues: [] },
  };

  (function lockStateReference() {
    const backing = hydrateState(isObj(G.state) ? G.state : {}, STATE_DEFAULTS);

    const desc = Object.getOwnPropertyDescriptor(G, "state");
    if (desc && desc.configurable === false && typeof desc.get === "function") {
      try { hydrateState(G.state, STATE_DEFAULTS); } catch {}
      return;
    }

    try {
      Object.defineProperty(G, "state", {
        configurable: false,
        enumerable: true,
        get() { return backing; },
        set(v) {
          if (v === backing) return;

          if (isObj(v)) {
            console.warn("[core] REFUSING state reference replacement. Merging instead.", v);
            hydrateState(backing, STATE_DEFAULTS);
            deepMergeFillMissing(backing, v);
            return;
          }

          console.warn("[core] REFUSING state replacement (non-object). Ignored.", v);
        },
      });
    } catch (e) {
      console.error("[core] FAILED to lock UmbraGlobe.state. Must be fixed.", e);
      G.state = backing;
    }
  })();

  G.hardenState = function hardenState() {
    try { hydrateState(G.state, STATE_DEFAULTS); } catch {}

    if (G.state.entitiesByCity && !(G.state.entitiesByCity instanceof Map)) {
      try {
        const m = new Map();
        if (isObj(G.state.entitiesByCity)) {
          for (const key of Object.keys(G.state.entitiesByCity)) m.set(key, G.state.entitiesByCity[key]);
        }
        G.state.entitiesByCity = m;
      } catch { G.state.entitiesByCity = new Map(); }
    }
    if (!G.state.entitiesByCity) G.state.entitiesByCity = new Map();

    if (G.state.citiesById && !(G.state.citiesById instanceof Map)) G.state.citiesById = new Map();
    if (G.state.entitiesById && !(G.state.entitiesById instanceof Map)) G.state.entitiesById = new Map();
    if (G.state.entitiesListByCity && !(G.state.entitiesListByCity instanceof Map)) G.state.entitiesListByCity = new Map();

    if (!Array.isArray(G.state.cityMeshes)) G.state.cityMeshes = [];
    if (!Array.isArray(G.state.entityMeshes)) G.state.entityMeshes = [];
    if (!Array.isArray(G.state.pickMeshes)) G.state.pickMeshes = [];

Object.defineProperty(G.state, "pickMeshes", {
  configurable: true,
  get() {
    const mode = String(this.mode || "").toUpperCase();

    if ((mode === "WORLD" || mode === "") && Array.isArray(this.cityMeshes)) {
      return this.cityMeshes.filter(Boolean).filter((m) => m.visible !== false);
    }

    return this._pickMeshes || [];
  },
  set(v) {
    this._pickMeshes = Array.isArray(v) ? v : [];
  }
});
    if (!Array.isArray(G.state.cityMapPickMeshes)) G.state.cityMapPickMeshes = [];

    return G.state;
  };

  G.hardenState();

  G.consts = hydrateState(G.consts || {}, {
    ROT_SPEED: 0.003,
    DAMPING: 0.94,
    MAX_CLICK_MOVE: 5,
  });

  G.util = hydrateState(G.util || {}, {
    log: (...a) => console.log("[UMBRA]", ...a),
    warn: (...a) => console.warn("[UMBRA]", ...a),
    err: (...a) => console.error("[UMBRA]", ...a),
    setDebug: (msg) => {
      if (G.state.debugBox) G.state.debugBox.textContent = String(msg || "");
    },
  });

  G.lockLonOffsetDeg = function lockLonOffsetDeg(v) {
    const st = G.state;
    const n = Number(v);
    const next = Number.isFinite(n) ? n : 0;

    if (st._lonOffsetLocked) {
      st.lonOffsetDeg = st._lonOffsetLockedValue;
      return st._lonOffsetLockedValue;
    }
    st._lonOffsetLocked = true;
    st._lonOffsetLockedValue = next;
    st.lonOffsetDeg = next;
    return next;
  };

  G.lockTextureLonOffsetDeg = function lockTextureLonOffsetDeg(v) {
    const st = G.state;
    const n = Number(v);
    const next = Number.isFinite(n) ? n : 0;

    if (st._textureLonOffsetLocked) {
      st.textureLonOffsetDeg = st._textureLonOffsetLockedValue;
      return st._textureLonOffsetLockedValue;
    }
    st._textureLonOffsetLocked = true;
    st._textureLonOffsetLockedValue = next;
    st.textureLonOffsetDeg = next;
    return next;
  };

  G.disposeObject = function disposeObject(root) {
    if (!root) return;
    try {
      root.traverse?.((o) => {
        if (!o) return;

        if (o.geometry && typeof o.geometry.dispose === "function") {
          try { o.geometry.dispose(); } catch {}
        }

        const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
        for (const m of mats) {
          if (!m) continue;

          for (const k of Object.keys(m)) {
            const vv = m[k];
            if (vv && vv.isTexture && typeof vv.dispose === "function") {
              const owned = !!(vv.userData && vv.userData.__umbraOwned === true);
              if (owned) { try { vv.dispose(); } catch {} }
            }
          }
          if (typeof m.dispose === "function") { try { m.dispose(); } catch {} }
        }
      });
    } catch (e) {
      console.warn("[core] disposeObject error:", e);
    }
  };

  G.ensureWorldGroup = function ensureWorldGroup(sceneOverride) {
    const scn = sceneOverride || G.state.scene;
    if (!scn || !window.THREE) return null;

    if (G.state.worldGroup && G.state.worldGroup.isGroup === true) {
      const wg = G.state.worldGroup;
      if (wg.parent !== scn) {
        try { wg.parent?.remove?.(wg); } catch {}
        scn.add(wg);
      }
      wg.name = "worldGroup";
      wg.userData = wg.userData || {};
      wg.userData.__umbraWorldGroup = true;

      try {
        const extras = (scn.children || []).filter((c) => {
          if (!c || c === wg || c.isGroup !== true) return false;
          const marked = !!(c.userData && c.userData.__umbraWorldGroup === true);
          const named = String(c.name || "") === "worldGroup";
          return marked || named;
        });
        for (const ex of extras) {
          try { ex.parent?.remove?.(ex); } catch {}
          try { G.disposeObject?.(ex); } catch {}
        }
      } catch {}

      return wg;
    }

    let adopt = null;
    try {
      const candidates = (scn.children || [])
        .filter((c) => c && c.isGroup === true)
        .filter((c) => (c.userData && c.userData.__umbraWorldGroup === true) || String(c.name || "") === "worldGroup");
      if (candidates.length) {
        candidates.sort((a, b) => {
          const am = !!(a.userData && a.userData.__umbraWorldGroup === true);
          const bm = !!(b.userData && b.userData.__umbraWorldGroup === true);
          if (am !== bm) return bm - am;
          return String(a.uuid).localeCompare(String(b.uuid));
        });
        adopt = candidates[0] || null;
        for (let i = 1; i < candidates.length; i++) {
          const ex = candidates[i];
          try { ex.parent?.remove?.(ex); } catch {}
          try { G.disposeObject?.(ex); } catch {}
        }
      }
    } catch {}

    if (adopt) {
      adopt.name = "worldGroup";
      adopt.userData = adopt.userData || {};
      adopt.userData.__umbraWorldGroup = true;
      if (adopt.parent !== scn) {
        try { adopt.parent?.remove?.(adopt); } catch {}
        scn.add(adopt);
      }
      G.state.worldGroup = adopt;
      return adopt;
    }

    const wg = new THREE.Group();
    wg.name = "worldGroup";
    wg.userData = wg.userData || {};
    wg.userData.__umbraWorldGroup = true;
    wg.position.set(0, 0, 0);
    wg.rotation.set(0, 0, 0);
    wg.scale.set(1, 1, 1);
    scn.add(wg);
    G.state.worldGroup = wg;
    return wg;
  };

  G.ensureWorldWeld = function ensureWorldWeld() {
    const scn = G.state.scene;
    if (!scn) return false;

    const wg = G.ensureWorldGroup(scn);
    if (!wg) return false;

    function normalizeChild(o, name) {
      if (!o) return;
      o.name = String(name || o.name || "");
      o.userData = o.userData || {};
      o.userData.__umbraNoRotate = true;
      o.position.set(0, 0, 0);
      o.rotation.set(0, 0, 0);
      o.scale.set(1, 1, 1);
    }

    if (G.state.globeMesh && G.state.globeMesh.parent !== wg) {
      try { G.state.globeMesh.parent?.remove?.(G.state.globeMesh); } catch {}
      wg.add(G.state.globeMesh);
    }
    normalizeChild(G.state.globeMesh, "globeMesh");

    if (G.state.veinsMesh && G.state.veinsMesh.parent !== wg) {
      try { G.state.veinsMesh.parent?.remove?.(G.state.veinsMesh); } catch {}
      wg.add(G.state.veinsMesh);
    }
    normalizeChild(G.state.veinsMesh, "veinsMesh");

    if (G.state.edgeGlowMesh && G.state.edgeGlowMesh.parent !== wg) {
      try { G.state.edgeGlowMesh.parent?.remove?.(G.state.edgeGlowMesh); } catch {}
      wg.add(G.state.edgeGlowMesh);
    }
    normalizeChild(G.state.edgeGlowMesh, "edgeGlowMesh");

    if (G.state.outerHaloMesh && G.state.outerHaloMesh.parent !== wg) {
      try { G.state.outerHaloMesh.parent?.remove?.(G.state.outerHaloMesh); } catch {}
      wg.add(G.state.outerHaloMesh);
    }
    normalizeChild(G.state.outerHaloMesh, "outerHaloMesh");

    if (G.state.sunSheenMesh && G.state.sunSheenMesh.parent !== wg) {
      try { G.state.sunSheenMesh.parent?.remove?.(G.state.sunSheenMesh); } catch {}
      wg.add(G.state.sunSheenMesh);
    }
    normalizeChild(G.state.sunSheenMesh, "sunSheenMesh");

    if (G.state.atmoHaloMesh && G.state.atmoHaloMesh.parent !== wg) {
      try { G.state.atmoHaloMesh.parent?.remove?.(G.state.atmoHaloMesh); } catch {}
      wg.add(G.state.atmoHaloMesh);
    }
    normalizeChild(G.state.atmoHaloMesh, "atmoHaloMesh");

    if (G.state.citiesGroup && G.state.citiesGroup.parent !== wg) {
      try { G.state.citiesGroup.parent?.remove?.(G.state.citiesGroup); } catch {}
      wg.add(G.state.citiesGroup);
    }
    normalizeChild(G.state.citiesGroup, "citiesGroup");

    if (G.state.entitiesGroup && G.state.entitiesGroup.parent !== wg) {
      try { G.state.entitiesGroup.parent?.remove?.(G.state.entitiesGroup); } catch {}
      wg.add(G.state.entitiesGroup);
    }
    normalizeChild(G.state.entitiesGroup, "entitiesGroup");

    if (G.state.starfieldMesh && G.state.starfieldMesh.parent !== scn) {
      try { G.state.starfieldMesh.parent?.remove?.(G.state.starfieldMesh); } catch {}
      scn.add(G.state.starfieldMesh);
    }

    return true;
  };

  G.getPickMeshes = function getPickMeshes() {
    const st = G.state;
    if (st.nodesEnabled === false) return [];

    const mode = String(st.mode || "").toUpperCase();
    const activeCityId = String(st.activeCityId || "").trim();

    if (mode === "WORLD" || mode === "") {
      return Array.isArray(st.cityMeshes)
        ? st.cityMeshes.filter(Boolean).filter((m) => m.visible !== false)
        : [];
    }

    if (mode === "CITY_FOCUS") {
      if (!activeCityId) return [];
      const active = typeof G.findCityMeshById === "function" ? G.findCityMeshById(activeCityId) : null;
      return active && active.visible !== false ? [active] : [];
    }

    if (mode === "CITY_MAP") {
      return Array.isArray(st.cityMapPickMeshes)
        ? st.cityMapPickMeshes.filter(Boolean).filter((m) => m.visible !== false)
        : [];
    }

    return [];
  };

  G.enforceModeVisibility = function enforceModeVisibility() {
    const st = G.state;
    const mode = String(st.mode || "WORLD").toUpperCase();

    const isWorld = mode === "WORLD";
    const isCity = mode === "CITY_FOCUS";
    const isCityMap = mode === "CITY_MAP";

    if (st.globeMesh) {
      st.globeMesh.visible = !isCityMap;
    }

    if (st.veinsMesh) {
      st.veinsMesh.visible = !isCityMap;
    }

    if (st.edgeGlowMesh) {
      st.edgeGlowMesh.visible = (isWorld || isCity);
    }

    if (st.outerHaloMesh) {
      st.outerHaloMesh.visible = (isWorld || isCity);
    }

    if (st.starfieldMesh) {
      st.starfieldMesh.visible = isWorld;
    }

    if (st.sunSheenMesh) {
      st.sunSheenMesh.visible = isWorld;
    }

    if (st.atmoHaloMesh) {
      st.atmoHaloMesh.visible = isWorld;
    }

    if (st.scene) {
      st.scene.traverse((obj) => {
        if (!obj || !obj.isMesh) return;
        if (
          obj.name === "atmoMesh" ||
          obj.userData?.type === "atmosphere" ||
          obj.name === "cloudMesh"
        ) {
          obj.visible = !isCityMap;
        }
      });
    }

    console.log("[core] MODE VISIBILITY LOCK", {
      mode,
      globeVisible: !!st.globeMesh?.visible,
      edgeGlowVisible: !!st.edgeGlowMesh?.visible,
      starfieldVisible: !!st.starfieldMesh?.visible,
      sunSheenVisible: !!st.sunSheenMesh?.visible,
      atmoHaloVisible: !!st.atmoHaloMesh?.visible
    });
  };

  function highlightCitySelection(activeCityId) {
    const meshes = Array.isArray(G.state.cityMeshes) ? G.state.cityMeshes : [];
    for (const mesh of meshes) {
      if (!mesh?.material) continue;
      const cid = String(mesh?.userData?.city_id || mesh?.userData?.cityId || "").trim();
      const active = !!activeCityId && cid === activeCityId;

      if (active) {
        if (typeof mesh.material.color?.setHex === "function") mesh.material.color.setHex(0x67a8ff);
        if ("opacity" in mesh.material) mesh.material.opacity = 0.95;
      } else {
        if (typeof mesh.material.color?.setHex === "function") mesh.material.color.setHex(0xffa347);
        if ("opacity" in mesh.material) mesh.material.opacity = 0.18;
      }
      mesh.material.needsUpdate = true;
    }
  }

  function highlightEntitySelection(activeEntityId, activeCityId) {
    const meshes = Array.isArray(G.state.entityMeshes) ? G.state.entityMeshes : [];
    for (const mesh of meshes) {
      if (!mesh?.material) continue;
      const eid = String(mesh?.userData?.entity_id || mesh?.userData?.entityId || "").trim();
      const cid = String(mesh?.userData?.city_id || mesh?.userData?.cityId || "").trim();
      const sameCity = !!activeCityId && cid === activeCityId;
      const active = !!activeEntityId && eid === activeEntityId;

      if (!sameCity) {
        mesh.scale.set(1, 1, 1);
        continue;
      }

      if (active) {
        if (typeof mesh.material.color?.setHex === "function") mesh.material.color.setHex(0x67a8ff);
        if ("opacity" in mesh.material) mesh.material.opacity = 1.0;
        mesh.scale.set(2.15, 2.15, 2.15);
      } else {
        const score100 = Number(mesh?.userData?.score100 || 0);
        const baseColor = score100 >= 80 ? 0x8fd3ff : score100 >= 60 ? 0x5aa9ff : 0x3f74d9;
        if (typeof mesh.material.color?.setHex === "function") mesh.material.color.setHex(baseColor);
        if ("opacity" in mesh.material) mesh.material.opacity = score100 >= 80 ? 0.92 : score100 >= 60 ? 0.84 : 0.78;
        mesh.scale.set(1.9, 1.9, 1.9);
      }
      mesh.material.needsUpdate = true;
    }
  }

  function clearGlobeSelection() {
    highlightCitySelection(null);
    highlightEntitySelection(null, null);
  }

  
  function registryHas(registry, id) {
    const key = String(id || "").trim();
    if (!key || !registry) return false;
    if (registry instanceof Map) return registry.has(key);
    if (typeof registry === "object") return Object.prototype.hasOwnProperty.call(registry, key);
    return false;
  }

  function registryGet(registry, id) {
    const key = String(id || "").trim();
    if (!key || !registry) return null;
    if (registry instanceof Map) return registry.get(key) || null;
    if (typeof registry === "object") return registry[key] || null;
    return null;
  }

  function hasCityRegistryEntry(cityId) {
    return registryHas(G.state?.citiesById, cityId);
  }

  function hasEntityRegistryEntry(entityId) {
    return registryHas(G.state?.entitiesById, entityId);
  }

  function getVisibleEntityCountForCity(cityId) {
    const cid = String(cityId || "").trim();
    return (Array.isArray(G.state.entityMeshes) ? G.state.entityMeshes : []).filter((m) => {
      const meshCityId = String(m?.userData?.city_id || m?.userData?.cityId || "").trim();
      return meshCityId === cid && m.visible;
    }).length;
  }

  function hasCityRegistryEntry(cityId) {
    const cid = String(cityId || "").trim();
    const registry = G.state?.citiesById;
    if (!cid || !registry) return false;

    if (registry instanceof Map) return registry.has(cid);

    if (typeof registry === "object") {
      return Object.prototype.hasOwnProperty.call(registry, cid);
    }

    return false;
  }

  function getCityRegistryEntry(cityId) {
    const cid = String(cityId || "").trim();
    const registry = G.state?.citiesById;
    if (!cid || !registry) return null;

    if (registry instanceof Map) return registry.get(cid) || null;

    if (typeof registry === "object") {
      return registry[cid] || null;
    }

    return null;
  }
  G.selectCityById = function selectCityById(cityId, source) {
    const st = G.state;
    const cid = String(cityId || "").trim();
    if (!cid) {
      console.error("[core] selectCityById missing cityId");
      return null;
    }

    if (!hasCityRegistryEntry(cid)) {
      console.error("[core] selectCityById invalid cityId", cid, {
        registryType: st.citiesById instanceof Map ? "Map" : typeof st.citiesById,
        registryCount: st.citiesById instanceof Map
          ? st.citiesById.size
          : (st.citiesById && typeof st.citiesById === "object" ? Object.keys(st.citiesById).length : 0)
      });
      return null;
    }

    st.mode = "CITY_FOCUS";
    st.activeCityId = cid;
    st.activeEntityId = null;
    st.selectedMesh = null;
    st.isFocused = false;
    st.focusQuat = null;

    if (typeof st.focusedZoom === "number") {
      st.targetZoom = st.focusedZoom;
    }

    try { G.clearCityMapSelection?.(); } catch {}
    G.enforceModeVisibility();
    try { G.refreshPickMeshesCache?.(); } catch {}

    highlightCitySelection(cid);
    highlightEntitySelection(null, cid);

    const cityMesh = typeof G.findCityMeshById === "function" ? G.findCityMeshById(cid) : null;

    try { G.updateTelemetry?.(); } catch {}
    try { G.refreshCityList?.(); } catch {}

    console.log("[core] CITY_FOCUS ENTER", {
      cityId: cid,
      source: String(source || ""),
      visibleEntities: getVisibleEntityCountForCity(cid),
    });

    return cityMesh;
  };

  G.enterCityMap = function enterCityMap(cityId, source) {
    const st = G.state;
    const cid = String(cityId || st.activeCityId || "").trim();
    if (!cid) {
      console.error("[core] enterCityMap missing cityId");
      return false;
    }

    if (!hasCityRegistryEntry(cid)) {
      console.error("[core] enterCityMap invalid cityId", cid, {
        registryType: st.citiesById instanceof Map ? "Map" : typeof st.citiesById,
        registryCount: st.citiesById instanceof Map
          ? st.citiesById.size
          : (st.citiesById && typeof st.citiesById === "object" ? Object.keys(st.citiesById).length : 0)
      });
      return false;
    }

    st.mode = "CITY_MAP";
    st.activeCityId = cid;
    st.activeEntityId = null;
    st.selectedMesh = null;
    st.isFocused = false;
    st.focusQuat = null;

    if (typeof st.cityMapZoom === "number") {
      st.targetZoom = st.cityMapZoom;
    }

    try { G.clearDossier?.(); } catch {}
    try { G.clearCityMapSelection?.(); } catch {}
    G.enforceModeVisibility();
    try { G.refreshPickMeshesCache?.(); } catch {}
    try { G.updateTelemetry?.(); } catch {}
    try { G.refreshCityList?.(); } catch {}

    console.log("[core] CITY_MAP ENTER", {
      cityId: cid,
      source: String(source || ""),
    });

    return true;
  };

  G.exitCityMap = function exitCityMap(source) {
    if (
      String(source || "") === "empty-click" &&
      Number.isFinite(Number(G.state?._cityMapEnteredAtMs)) &&
      performance.now() - Number(G.state._cityMapEnteredAtMs) < 650
    ) {
      console.log("[Batch561R] suppressed immediate empty-click CITY_MAP exit");
      return false;
    }
    const st = G.state;
    const cid = String(st.activeCityId || "").trim();
    if (!cid) {
      console.warn("[core] exitCityMap called with no activeCityId");
      st.mode = "WORLD";
      G.enforceModeVisibility();
      return true;
    }

    st.mode = "CITY_FOCUS";
    st.activeEntityId = null;
    st.selectedMesh = null;
    st.isFocused = false;
    st.focusQuat = null;

    if (typeof st.focusedZoom === "number") {
      st.targetZoom = st.focusedZoom;
    }

    try { G.clearCityMapSelection?.(); } catch {}
    try { G.clearDossier?.(); } catch {}
    G.enforceModeVisibility();
    try { G.refreshPickMeshesCache?.(); } catch {}
    try { G.updateTelemetry?.(); } catch {}
    try { G.refreshCityList?.(); } catch {}

    console.log("[core] CITY_MAP EXIT", {
      cityId: cid,
      source: String(source || ""),
    });

    return true;
  };

  G.exitCity = function exitCity(source) {
    const st = G.state;

    st.mode = "WORLD";
    st.activeCityId = null;
    st.activeEntityId = null;
    st.selectedMesh = null;
    st.isFocused = false;
    st.focusQuat = null;

    if (typeof st.defaultZoom === "number") {
      st.targetZoom = st.defaultZoom;
    }

    try { G.clearCityMapSelection?.(); } catch {}
    G.enforceModeVisibility();
    try { G.refreshPickMeshesCache?.(); } catch {}

    clearGlobeSelection();

    try { G.updateTelemetry?.(); } catch {}
    try { G.refreshCityList?.(); } catch {}

    console.log("[core] CITY EXIT", {
      source: String(source || ""),
    });
    return true;
  };

  G.theme = hydrateState(G.theme || {}, {
    colors: { black: 0x030507, gold: 0xffc45a, ember: 0xff8a2a },
    globe: { baseColor: 0x030507, emissive: 0xff8a2a, emissiveIntensity: 1.55 },
    grid: { enabled: true, color: 0xffc45a, opacity: 0.10 },
    starfield: { enabled: true, opacity: 0.90 },
  });

  function hardMerge(dst, src) {
    if (!isObj(src)) return dst;
    for (const k of Object.keys(src)) {
      const v = src[k];
      if (isObj(v) && !Array.isArray(v)) dst[k] = hardMerge(isObj(dst[k]) ? dst[k] : {}, v);
      else dst[k] = v;
    }
    return dst;
  }

  G.setTheme = function setTheme(partial) {
    G.theme = hardMerge(G.theme || {}, partial || {});
    G.applyTheme?.();
  };

  G.applyTheme = function applyTheme() {
    const T = G.theme || {};
    const Tg = T.globe || {};
    const Tgrid = T.grid || {};
    const Tsf = T.starfield || {};

    if (G.state.starfieldMesh) {
      G.state.starfieldMesh.visible = typeof Tsf.enabled === "boolean" ? Tsf.enabled : true;
      if (G.state.starfieldMesh.material && typeof Tsf.opacity === "number") {
        G.state.starfieldMesh.material.opacity = Math.max(0, Math.min(1, Tsf.opacity));
        G.state.starfieldMesh.material.needsUpdate = true;
      }
    }

    if (G.state.veinsMesh) {
      G.state.veinsMesh.visible = typeof Tgrid.enabled === "boolean" ? Tgrid.enabled : true;
      if (G.state.veinsMesh.material && typeof Tgrid.opacity === "number") {
        G.state.veinsMesh.material.opacity = Math.max(0, Math.min(0.6, Tgrid.opacity));
        G.state.veinsMesh.material.needsUpdate = true;
      }
    }

    if (G.state.globeMesh?.material) {
      const m = G.state.globeMesh.material;
      if (typeof Tg.emissiveIntensity === "number") m.emissiveIntensity = Tg.emissiveIntensity;
      m.needsUpdate = true;
    }
  };

  // Helper for whichever file owns the main render loop.
  G.renderFrame = function renderFrame(deltaTime) {
    try {
      G.updateSunSheen?.();
      G.updateAtmoHalo?.();
    } catch (e) {
      console.warn("[core] updateSunSheen/updateAtmoHalo failed:", e);
    }

    if (typeof G.renderScene === "function") {
      return G.renderScene(deltaTime);
    }
    if (G.state.renderer && G.state.scene && G.state.camera) {
      return G.state.renderer.render(G.state.scene, G.state.camera);
    }
  };

  G.initCore = function initCore() {
    if (String(location.href || "").startsWith("file://")) {
      G.util.err("Refusing to run from file://. Start a server in /public and open http://localhost:8000/.");
      G.util.setDebug("HTTP REQUIRED.");
      return false;
    }

    const container = document.getElementById("globeContainer");
    const debugBox = document.getElementById("debugMsg");
    G.state.container = container;
    G.state.debugBox = debugBox;

    if (!container || !window.THREE) {
      G.util.err("Missing #globeContainer or THREE.");
      G.util.setDebug("THREE OFFLINE.");
      return false;
    }

    G.hardenState();

    if (G.state._coreInited && G.state.scene && G.state.camera && G.state.renderer) {
      G.ensureWorldGroup(G.state.scene);
      G.ensureWorldWeld();

      try {
        G.ensureSunSheen?.();
        G.setSunSheen?.({
          color: 0xffa24a,
          opacity: 0.58,
          rimPower: 1.72,
          specPower: 68.0,
          specStrength: 0.30,
          hemisphereClamp: 0.09
        });
        G.updateSunSheen?.();

        G.ensureAtmoHalo?.();
        G.setAtmoHalo?.({
          color: 0xffb45c,
          opacity: 0.16,
          fresnelPower: 2.15,
          falloff: 1.08,
          lightWrap: 0.44
        });
        G.updateAtmoHalo?.();
      } catch (e) {
        console.warn("[core] sun sheen / atmo halo re-entry init failed:", e);
      }

      try {
        const el = G.state.renderer.domElement;
        if (el && el.parentNode !== container) {
          container.innerHTML = "";
          container.appendChild(el);
        }
      } catch {}

      try {
        if (typeof G.initPostFX === "function") {
          G.initPostFX();
        }
      } catch (e) {
        console.error("[core] initPostFX failed during re-entry:", e);
      }

      G.enforceModeVisibility();
      return true;
    }

    const rect = container.getBoundingClientRect();
    const w = Math.max(2, rect.width || 800);
    const h = Math.max(2, rect.height || 600);

    const scene = new THREE.Scene();

    const tz = Number.isFinite(Number(G.state.targetZoom)) ? Number(G.state.targetZoom) : 3.2;
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.05, 1000);
    camera.position.set(0, 0, tz);

    let renderer = null;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
    } catch (primaryRendererError) {
      console.warn("[core] primary WebGLRenderer failed; retrying low-cost renderer.", primaryRendererError);

      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: "default"
        });
      } catch (fallbackRendererError) {
        console.warn("[core] fallback WebGLRenderer failed; mounting fallback surface.", fallbackRendererError);

        if (window.UmbraWebGLFallback && typeof window.UmbraWebGLFallback.mountFallback === "function") {
          window.UmbraWebGLFallback.mountFallback();
        }

        G.state.renderer = null;
        G.state.scene = null;
        G.state.camera = null;
        G.state.worldGroup = null;
        G.state._coreInited = false;
        return false;
      }
    }
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(w, h, false);

    if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if (THREE.sRGBEncoding !== undefined) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }

    if ("physicallyCorrectLights" in renderer) {
      renderer.physicallyCorrectLights = true;
    }

    if (THREE.ACESFilmicToneMapping !== undefined) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.42;
    }

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x1b120a, 0.18);
    ambient.name = "umbraAmbientLight";
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffd2a0, 1.55);
    sun.name = "umbraSunLight";
    sun.position.set(5.2, 2.4, 3.1);
    sun.castShadow = false;
    scene.add(sun);

    if (sun.target) {
      sun.target.position.set(0, 0, 0);
      scene.add(sun.target);
    }

    const rim = new THREE.DirectionalLight(0xff8a2a, 0.62);
    rim.name = "umbraRimLight";
    rim.position.set(-4.0, -1.5, -2.75);
    rim.castShadow = false;
    scene.add(rim);

    G.state.scene = scene;
    G.state.camera = camera;
    G.state.renderer = renderer;
    G.state.sunLight = sun;
    G.state.rimLight = rim;

    G.ensureWorldGroup(scene);
    G.ensureWorldWeld();

    try {
      G.ensureSunSheen?.();
      G.setSunSheen?.({
        color: 0xffa24a,
        opacity: 0.58,
        rimPower: 1.72,
        specPower: 68.0,
        specStrength: 0.30,
        hemisphereClamp: 0.09
      });
      G.updateSunSheen?.();

      G.ensureAtmoHalo?.();
      G.setAtmoHalo?.({
        color: 0xffb45c,
        opacity: 0.16,
        fresnelPower: 2.15,
        falloff: 1.08,
        lightWrap: 0.44
      });
      G.updateAtmoHalo?.();
    } catch (e) {
      console.warn("[core] sun sheen / atmo halo init failed:", e);
    }

    try {
      if (typeof G.initPostFX === "function") {
        G.initPostFX();
      } else {
        console.warn("[core] initPostFX missing");
      }
    } catch (e) {
      console.error("[core] initPostFX failed:", e);
    }

    if (!G.state._resizeBound) {
      G.state._resizeBound = true;
      G.state._onResize = function onResize() {
        if (!G.state.renderer || !G.state.camera || !G.state.container) return;
        const r = G.state.container.getBoundingClientRect();
        const ww = Math.max(2, r.width);
        const hh = Math.max(2, r.height);
        G.state.camera.aspect = ww / hh;
        G.state.camera.updateProjectionMatrix();
        G.state.renderer.setSize(ww, hh, false);

        try {
          if (typeof G.resizePostFX === "function") {
            G.resizePostFX(ww, hh);
          }
        } catch (e) {
          console.warn("[core] resizePostFX failed:", e);
        }
      };
      window.addEventListener("resize", G.state._onResize);
    }

    G.enforceModeVisibility();

    G.state._coreInited = true;
    return true;
  };
})();







