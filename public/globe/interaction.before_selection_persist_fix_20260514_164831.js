// public/globe/interaction.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) return console.error("[interaction] window.UmbraGlobe missing.");
  if (!window.THREE) return console.error("[interaction] window.THREE missing (three.js not loaded).");

  console.log("[SIGNATURE] globe/interaction.js LOADED", new Date().toISOString());

  function $(id) { return document.getElementById(id); }

  function clamp(n, a, b) {
    const x = Number(n);
    if (!Number.isFinite(x)) return a;
    return Math.max(a, Math.min(b, x));
  }

  function wrapPi(rad) {
    const twoPi = Math.PI * 2;
    let r = Number(rad);
    if (!Number.isFinite(r)) r = 0;
    r = r % twoPi;
    if (r > Math.PI) r -= twoPi;
    if (r < -Math.PI) r += twoPi;
    return r;
  }

  function setStatus(msg) {
    const el = $("telemetryStatus");
    if (el) el.textContent = String(msg || "STANDBY");
  }

  function ensurePickAPI() {
    if (typeof G.getPickMeshes !== "function") {
      G.getPickMeshes = function () {
        return Array.isArray(G.state?.pickMeshes) ? G.state.pickMeshes : [];
      };
    }
  }

  function ensureSelectionState() {
    const st = G.state;
    if (!st.selection || typeof st.selection !== "object") {
      st.selection = Object.create(null);
    }
  }

  function ensureVelocity() {
    if (!G.state.velocity || typeof G.state.velocity !== "object") {
      G.state.velocity = { x: 0, y: 0 };
    } else {
      if (!Number.isFinite(Number(G.state.velocity.x))) G.state.velocity.x = 0;
      if (!Number.isFinite(Number(G.state.velocity.y))) G.state.velocity.y = 0;
    }
  }

  function ensureYawPitchState() {
    const st = G.state;
    const wg = st?.worldGroup;
    if (!wg) return false;

    const maxTilt = 0.78;
    if (!Number.isFinite(st.yaw)) st.yaw = wrapPi(wg.rotation.y || 0);
    if (!Number.isFinite(st.pitch)) st.pitch = clamp(wg.rotation.x || 0, -maxTilt, maxTilt);
    return true;
  }

  function dirToLatLonDeg(dir) {
    const d = dir.clone().normalize();
    const lat = Math.asin(d.y) * 180 / Math.PI;
    const lon = Math.atan2(d.x, d.z) * 180 / Math.PI;
    return { lat, lon };
  }

  function commitSelection(meshOrNull) {
    ensureSelectionState();

    const st = G.state;
    const sel = st.selection;

    st.selectedMesh = meshOrNull || null;

    sel.time = Date.now();
    sel.meshName = meshOrNull ? String(meshOrNull.name || "") : "";
    sel.city_id = null;
    sel.entity_id = null;

    sel.data = { lat: null, lon: null };
    sel.fromPos = { lat: null, lon: null };
    sel.worldDir = { x: null, y: null, z: null };
    sel.worldPos = { x: null, y: null, z: null };

    if (!meshOrNull) return sel;

    const ud = meshOrNull.userData || Object.create(null);

    const cid = String(ud.city_id || ud.cityId || "").trim();
    const eid = String(ud.entity_id || ud.entityId || "").trim();
    sel.city_id = cid || null;
    sel.entity_id = eid || null;

    const latData = Number(ud.lat ?? ud.latitude);
    const lonData = Number(ud.lon ?? ud.longitude);
    sel.data.lat = Number.isFinite(latData) ? latData : null;
    sel.data.lon = Number.isFinite(lonData) ? lonData : null;

    try {
      const p = meshOrNull.getWorldPosition(new THREE.Vector3());
      const dir = p.clone().normalize();

      sel.worldPos = { x: p.x, y: p.y, z: p.z };
      sel.worldDir = { x: dir.x, y: dir.y, z: dir.z };

      const ll = dirToLatLonDeg(dir);
      sel.fromPos = { lat: ll.lat, lon: ll.lon };
    } catch {}

    return sel;
  }

  function getPointer(evt) {
    const e = evt?.touches?.[0] || evt?.changedTouches?.[0] || evt;
    return {
      x: Number(e?.clientX ?? 0),
      y: Number(e?.clientY ?? 0),
      pointerId: (typeof evt?.pointerId === "number") ? evt.pointerId : null,
    };
  }

  function getCanvasRect() {
    const el = G.state?.renderer?.domElement;
    if (!el || typeof el.getBoundingClientRect !== "function") return null;
    return el.getBoundingClientRect();
  }

  function toNDC(px, py) {
    const r = getCanvasRect();
    if (!r || !r.width || !r.height) return null;

    const x = ((px - r.left) / r.width) * 2 - 1;
    const y = -(((py - r.top) / r.height) * 2 - 1);
    return { x, y };
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function isCityMesh(m) {
    const t = String(m?.userData?.type || "").toLowerCase();
    return t === "citynode" || t === "leadnode";
  }

  function isEntityMesh(m) {
    const t = String(m?.userData?.type || "").toLowerCase();
    return t === "entitynode";
  }

  function getMeshCityId(mesh) {
    return String(mesh?.userData?.city_id || mesh?.userData?.cityId || "").trim();
  }

  function getMeshEntityId(mesh) {
    return String(mesh?.userData?.entity_id || mesh?.userData?.entityId || "").trim();
  }

  function tracePick(label, mesh) {
    const ud = mesh?.userData || {};
    console.log("[interaction][TRACE]", label, {
      mode: String(G.state?.mode || ""),
      meshName: String(mesh?.name || ""),
      type: String(ud.type || ""),
      city_id: String(ud.city_id || ud.cityId || ""),
      entity_id: String(ud.entity_id || ud.entityId || ""),
      activeCityId: String(G.state?.activeCityId || ""),
      activeEntityId: String(G.state?.activeEntityId || ""),
    });
  }

  function validatePickedMesh(mesh) {
    if (!mesh) return false;

    const st = G.state;
    const cityId = getMeshCityId(mesh);
    const entityId = getMeshEntityId(mesh);

    if (isEntityMesh(mesh)) {
      if (!entityId) {
        console.error("[interaction] entity mesh missing entity_id", mesh);
        return false;
      }
      if (!(st.entitiesById instanceof Map) || !st.entitiesById.has(entityId)) {
        console.error("[interaction] INVALID ENTITY ID ON PICK", entityId, mesh);
        return false;
      }

      const entity = st.entitiesById.get(entityId);
      const canonicalCityId = String(entity?.city_id || entity?.cityId || "").trim();
      if (!canonicalCityId) {
        console.error("[interaction] picked entity has no canonical city_id", entityId, entity);
        return false;
      }

      if (cityId && canonicalCityId && cityId !== canonicalCityId) {
        console.error("[interaction] entity mesh city mismatch", {
          meshCityId: cityId,
          canonicalCityId,
          entityId,
        });
        return false;
      }

      return true;
    }

    if (isCityMesh(mesh)) {
      if (!cityId) {
        console.error("[interaction] city mesh missing city_id", mesh);
        return false;
      }
      if (!(st.citiesById instanceof Map) || !st.citiesById.has(cityId)) {
        console.error("[interaction] INVALID CITY ID ON PICK", cityId, mesh);
        return false;
      }
      return true;
    }

    if (entityId) {
      if (!(st.entitiesById instanceof Map) || !st.entitiesById.has(entityId)) {
        console.error("[interaction] unknown mesh contains invalid entity_id", entityId, mesh);
        return false;
      }
      return true;
    }

    if (cityId) {
      if (!(st.citiesById instanceof Map) || !st.citiesById.has(cityId)) {
        console.error("[interaction] unknown mesh contains invalid city_id", cityId, mesh);
        return false;
      }
      return true;
    }

    console.error("[interaction] picked mesh has no resolvable ID", mesh);
    return false;
  }

  function enforceVisibilityFallback() {
    const st = G.state;
    if (!st) return;

    const mode = String(st.mode || "").toUpperCase();
    const cityMeshes = Array.isArray(st.cityMeshes) ? st.cityMeshes : [];
    const entityMeshes = Array.isArray(st.entityMeshes) ? st.entityMeshes : [];
    const cityMapMeshes = Array.isArray(st.cityMapPickMeshes) ? st.cityMapPickMeshes : [];
    const activeCityId = String(st.activeCityId || "").trim();

    if (mode === "WORLD" || mode === "") {
      for (const m of cityMeshes) {
        if (m) m.visible = true;
      }
      for (const m of entityMeshes) {
        if (m) m.visible = false;
      }
      for (const m of cityMapMeshes) {
        if (m) m.visible = false;
      }
      return;
    }

    if (mode === "CITY_FOCUS") {
      for (const m of cityMeshes) {
        if (!m) continue;
        const meshCityId = getMeshCityId(m);
        m.visible = !!activeCityId && meshCityId === activeCityId;
      }

      for (const m of entityMeshes) {
        if (!m) continue;
        const meshCityId = getMeshCityId(m);
        const active = !!activeCityId && meshCityId === activeCityId;
        m.visible = active;
        m.scale.set(active ? 1.35 : 1, active ? 1.35 : 1, active ? 1.35 : 1);
      }

      for (const m of cityMapMeshes) {
        if (m) m.visible = false;
      }
      return;
    }

    if (mode === "CITY_MAP") {
      for (const m of cityMeshes) {
        if (m) m.visible = false;
      }
      for (const m of entityMeshes) {
        if (m) m.visible = false;
      }
      for (const m of cityMapMeshes) {
        if (m) m.visible = true;
      }
    }
  }

  function getPickables() {
    ensurePickAPI();

    try { G.enforceModeVisibility?.(); } catch {}
    enforceVisibilityFallback();

    const mode = String(G.state?.mode || "").toUpperCase();

    let arr = [];
    if (mode === "CITY_MAP") {
      arr = Array.isArray(G.state?.cityMapPickMeshes) ? G.state.cityMapPickMeshes : [];
    } else {
      arr = G.getPickMeshes();
    }

    return Array.isArray(arr) ? arr.filter(Boolean).filter((m) => m.visible !== false) : [];
  }

  function nearestProjectedPick(clientX, clientY, radiusPxOverride) {
    const pickables = getPickables();
    const cam = G.state?.camera;
    if (!pickables.length || !cam) return null;

    const rect = getCanvasRect();
    if (!rect) return null;

    let best = null;
    let bestDist2 = Infinity;

    for (const obj of pickables) {
      if (!obj?.visible) continue;

      try {
        const wp = obj.getWorldPosition(new THREE.Vector3());
        const sp = wp.clone().project(cam);

        if (sp.z > 1 || sp.z < -1) continue;
        if (sp.z < 0) continue;

        const sx = rect.left + ((sp.x + 1) * 0.5) * rect.width;
        const sy = rect.top + ((1 - (sp.y + 1) * 0.5)) * rect.height;

        const dx = clientX - sx;
        const dy = clientY - sy;
        const d2 = dx * dx + dy * dy;

        if (d2 < bestDist2) {
          bestDist2 = d2;
          best = obj;
        }
      } catch {}
    }

    const mode = String(G.state?.mode || "").toUpperCase();
    const maxRadiusPx = Number.isFinite(Number(radiusPxOverride))
      ? Number(radiusPxOverride)
      : (mode === "CITY_MAP" ? 28 : 28);

    if (best && bestDist2 <= maxRadiusPx * maxRadiusPx) return best;
    return null;
  }

  function resolvePickedTarget(obj) {
    let cur = obj || null;
    while (cur) {
      const ud = cur.userData || {};
      const type = String(ud.type || "").toLowerCase();

      if (
        ud.entity_id ||
        ud.entityId ||
        ud.city_id ||
        ud.cityId ||
        type === "entitynode" ||
        type === "citynode" ||
        type === "leadnode"
      ) {
        return cur;
      }

      cur = cur.parent || null;
    }
    return null;
  }

  function pickAt(clientX, clientY) {
    const ndc = toNDC(clientX, clientY);
    if (!ndc) return null;
    if (!G.state?.camera) return null;

    try { G.state?.worldGroup?.updateMatrixWorld?.(true); } catch {}
    try { G.state?.scene?.updateMatrixWorld?.(true); } catch {}
    try { G.state?.camera?.updateMatrixWorld?.(true); } catch {}

    const mode = String(G.state?.mode || "").toUpperCase();
    const pickables = getPickables();
    if (!pickables.length) return null;

    if (mode === "CITY_MAP") {
      const projectedFirst = nearestProjectedPick(clientX, clientY, 28);
      if (projectedFirst && validatePickedMesh(projectedFirst)) return projectedFirst;
    }

    mouse.set(ndc.x, ndc.y);
    raycaster.setFromCamera(mouse, G.state.camera);

    const hits = raycaster.intersectObjects(pickables, true);
    if (hits && hits.length) {
      hits.sort((a, b) => {
        const da = Number(a?.distance ?? 1e9);
        const db = Number(b?.distance ?? 1e9);
        if (da !== db) return da - db;

        const ak = String(a?.object?.userData?.entity_id || a?.object?.userData?.city_id || a?.object?.name || "");
        const bk = String(b?.object?.userData?.entity_id || b?.object?.userData?.city_id || b?.object?.name || "");
        return ak.localeCompare(bk);
      });

      const candidate = resolvePickedTarget(hits[0]?.object || null);
      if (candidate && validatePickedMesh(candidate)) return candidate;
      return null;
    }

    if (mode === "CITY_MAP") return null;

    const projected = nearestProjectedPick(clientX, clientY);
    if (projected && validatePickedMesh(projected)) return projected;
    return null;
  }

  function getDeterministicFocusDir(meshOrNull) {
    if (!meshOrNull) return null;

    try {
      const lp = meshOrNull.position;
      if (
        lp &&
        Number.isFinite(Number(lp.x)) &&
        Number.isFinite(Number(lp.y)) &&
        Number.isFinite(Number(lp.z))
      ) {
        const lenSq = (lp.x * lp.x) + (lp.y * lp.y) + (lp.z * lp.z);
        if (lenSq > 1e-12) {
          return new THREE.Vector3(lp.x, lp.y, lp.z).normalize();
        }
      }
    } catch {}

    try {
      const dir = meshOrNull?.userData?.dir;
      if (
        dir &&
        Number.isFinite(Number(dir.x)) &&
        Number.isFinite(Number(dir.y)) &&
        Number.isFinite(Number(dir.z))
      ) {
        return dir.clone().normalize();
      }
    } catch {}

    return null;
  }

  function setFocused(meshOrNull) {
    if (!meshOrNull) {
      G.state.isFocused = false;
      G.state.focusQuat = null;
      G.state.activeEntityId = null;
      setStatus("STANDBY");
      return;
    }

    if (G.state?.nodesEnabled === false) return;
    if (!validatePickedMesh(meshOrNull)) return;

    const mode = String(G.state?.mode || "").toUpperCase();
    const eid = getMeshEntityId(meshOrNull);

    if (mode === "CITY_MAP") {
      G.state.isFocused = false;
      G.state.focusQuat = null;
      G.state.selectedMesh = meshOrNull;
      G.state.activeEntityId = eid || null;
      commitSelection(meshOrNull);

      try { G.setCityMapSelection?.(eid || null); } catch {}
      try { G.updateTelemetryFromNode?.(meshOrNull); } catch {}
      if (eid) {
        try { G.openDossierForNode?.(meshOrNull); } catch {}
      }
      try { G.refreshCityList?.(); } catch {}

      const activeAfterOpen = String(G.state.activeEntityId || "").trim();
      if (!eid) {
        console.error("[interaction] CITY_MAP focus missing entity_id", meshOrNull);
      } else if (activeAfterOpen !== eid) {
        console.error("[interaction] CITY_MAP SELECTION MISMATCH", {
          expectedEntityId: eid,
          activeEntityId: activeAfterOpen,
        });
      }

      tracePick("FOCUS", meshOrNull);
      setStatus("CITY MAP NODE LOCKED");
      return;
    }

    if (typeof G.state.focusedZoom === "number") {
      G.state.targetZoom = G.state.focusedZoom;
    }

    const dir = getDeterministicFocusDir(meshOrNull);
    if (!dir) {
      console.error("[interaction] focus target missing deterministic direction", meshOrNull);
      return;
    }

    const d = dir.clone().normalize();
    const solvedYaw = -Math.atan2(d.x, d.z);
    const solvedPitch = Math.atan2(d.y, Math.sqrt(d.x * d.x + d.z * d.z));
    const maxTilt = 0.55;

    G.state.isFocused = true;
    G.state.focusQuat = null;
    G.state.yaw = wrapPi(solvedYaw);
    G.state.pitch = clamp(solvedPitch, -maxTilt, MAX_TILT);

    G.state.activeEntityId = eid || null;

    try { G.updateTelemetryFromNode?.(meshOrNull); } catch {}
    if (eid) {
      try { G.openDossierForNode?.(meshOrNull); } catch {}
    }

    const activeAfterOpen = String(G.state.activeEntityId || "").trim();
    if (eid && activeAfterOpen && eid !== activeAfterOpen) {
      console.error("[interaction] DOSSIER MISMATCH", {
        expectedEntityId: eid,
        activeEntityId: activeAfterOpen,
      });
    }

    try { G.refreshCityList?.(); } catch {}

    tracePick("FOCUS", meshOrNull);
    setStatus(eid ? "NODE LOCKED" : "CITY LOCKED");
  }

  G.focusNode = function focusNode(mesh) {
    try { setFocused(mesh); } catch {}
  };

  G.clearSelectionToWorld = function clearSelectionToWorld() {
    commitSelection(null);

    try { G.clearCityMapSelection?.(); } catch {}
    try { G.exitCity?.("clearSelectionToWorld"); } catch {}
    try { G.clearDossier?.(); } catch {}
    try { G.updateTelemetryFromNode?.(null); } catch {}
    try { G.refreshCityList?.(); } catch {}
    try { G.enforceModeVisibility?.(); } catch {}
    enforceVisibilityFallback();

    if (typeof G.state.defaultZoom === "number") {
      G.state.targetZoom = G.state.defaultZoom;
    }

    setStatus("STANDBY");
  };

  function clearSelectionStep(reason) {
    const mode = String(G.state?.mode || "").toUpperCase();

    commitSelection(null);

    if (mode === "CITY_MAP") {
      const hasActiveEntity = !!String(G.state.activeEntityId || "").trim();

      if (hasActiveEntity) {
        G.state.selectedMesh = null;
        G.state.activeEntityId = null;
        try { G.clearCityMapSelection?.(); } catch {}
        try { G.clearDossier?.(); } catch {}
        try { G.updateTelemetryFromNode?.(null); } catch {}
        try { G.enforceModeVisibility?.(); } catch {}
        enforceVisibilityFallback();
        setStatus("CITY MAP");
        return;
      }

      try { G.exitCityMap?.("empty-click"); } catch {}
      setStatus("CITY FOCUS");
      return;
    }

    if (mode === "CITY_FOCUS") {
      G.clearSelectionToWorld?.();
      return;
    }

    G.clearSelectionToWorld?.();
  }

  const DRAG_ROT_X = 0.0022;
  const DRAG_ROT_Y = 0.0016;
  const VEL_FROM_DRAG = 0.85;
  const MAX_VEL = 2.2;
  const MAX_TILT = 0.78;
  const CLICK_DEBOUNCE_MS = 80;

  function onDown(evt) {
    if (!G.state) return;

    const el = G.state?.renderer?.domElement;
    const p = getPointer(evt);

    try {
      if (el && typeof evt?.pointerId === "number" && el.setPointerCapture) {
        el.setPointerCapture(evt.pointerId);
        G.state._activePointerId = evt.pointerId;
      }
    } catch {}

    ensureYawPitchState();
    ensureVelocity();

    G.state.isDragging = true;
    G.state.clickCandidate = true;
    G.state.prevMouse = { x: p.x, y: p.y };
    G.state._dragStart = { x: p.x, y: p.y };
    G.state._lastMoveTS = performance.now();
    G.state._lastYawVel = 0;
    G.state._lastPitchVel = 0;
  }

  function onMove(evt) {
    if (!G.state?.isDragging) return;

    const p = getPointer(evt);
    const prev = G.state.prevMouse || p;

    let dx = p.x - prev.x;
    let dy = p.y - prev.y;

    dx = clamp(dx, -80, 80);
    dy = clamp(dy, -80, 80);

    G.state.prevMouse = { x: p.x, y: p.y };

    if (Math.abs(dx) + Math.abs(dy) > 5) {
      G.state.clickCandidate = false;
    }

    if (!G.state?.worldGroup) return;

    if (String(G.state?.mode || "").toUpperCase() === "CITY_MAP") {
      G.panCityMap?.(dx, dy);
      return;
    }

    if (G.state.isFocused) {
      G.state.isFocused = false;
      G.state.focusQuat = null;
      setStatus("STANDBY");
    }

    ensureYawPitchState();

    const yawDelta = dx * DRAG_ROT_X;
    const pitchDelta = dy * DRAG_ROT_Y;

    G.state.yaw = wrapPi((G.state.yaw ?? 0) + yawDelta);
    G.state.pitch = clamp((G.state.pitch ?? 0) + pitchDelta, -MAX_TILT, MAX_TILT);

    const now = performance.now();
    const prevTS = Number(G.state._lastMoveTS) || now;
    const dt = Math.max(1e-3, (now - prevTS) / 1000);
    G.state._lastMoveTS = now;

    G.state._lastYawVel = yawDelta / dt;
    G.state._lastPitchVel = pitchDelta / dt;
  }

  function onUp(evt) {
    if (!G.state) return;

    const el = G.state?.renderer?.domElement;

    try {
      if (el && typeof G.state._activePointerId === "number" && el.releasePointerCapture) {
        el.releasePointerCapture(G.state._activePointerId);
      }
    } catch {}
    G.state._activePointerId = null;

    const wasClick = !!G.state.clickCandidate;
    const wasDragging = !!G.state.isDragging;

    G.state.isDragging = false;
    G.state.clickCandidate = false;

    if (wasDragging && !wasClick) {
      if (String(G.state?.mode || "").toUpperCase() === "CITY_MAP") {
        return;
      }

      ensureVelocity();

      const rawX = Number(G.state._lastYawVel) || 0;
      const rawY = Number(G.state._lastPitchVel) || 0;

      G.state.velocity.x = clamp(rawX * VEL_FROM_DRAG, -MAX_VEL, MAX_VEL);
      G.state.velocity.y = clamp(rawY * VEL_FROM_DRAG, -MAX_VEL, MAX_VEL);

      G.state._lastYawVel = 0;
      G.state._lastPitchVel = 0;
      return;
    }

    if (!wasClick) return;

    const now = performance.now();
    const lastClickTS = Number(G.state._lastClickTS) || 0;
    if (now - lastClickTS < CLICK_DEBOUNCE_MS) return;
    G.state._lastClickTS = now;

    const p = getPointer(evt);
    const picked = pickAt(p.x, p.y);

    if (!picked) {
      tracePick("EMPTY", null);
      clearSelectionStep("empty-click");
      return;
    }

    if (!validatePickedMesh(picked)) {
      console.error("[interaction] rejecting invalid pick", picked);
      return;
    }
tracePick("PICK", picked);
commitSelection(picked);
try { window.UmbraUsers?.recordSelectionFromState?.(); } catch {}


    if (isCityMesh(picked)) {
      const cid = getMeshCityId(picked);
      if (!cid) return;

      const mode = String(G.state.mode || "").toUpperCase();
      const activeCityId = String(G.state.activeCityId || "").trim();

      G.state.activeEntityId = null;
      G.state.selectedMesh = null;
      G.state.isFocused = false;
      G.state.focusQuat = null;

      if (mode === "WORLD") {
        let cityMesh = null;
        try {
          cityMesh = G.selectCityById?.(cid, "node") || null;
        } catch (e) {
          console.error("[interaction] selectCityById threw", e);
        }
        if (!cityMesh && typeof G.findCityMeshById === "function") cityMesh = G.findCityMeshById(cid);
        if (!cityMesh) cityMesh = picked;
        setFocused(cityMesh);
        return;
      }
      if (mode === "CITY_FOCUS" && activeCityId === cid) {
        const assetUrl = `/assets/cities/${cid}/meta.json`;

        if (window.UMBRA_CLIENT_KEY === "black_dragon") {
          fetch(assetUrl, { method: "HEAD", cache: "no-store" })
            .then((r) => {
              if (!r.ok) {
                console.warn("[interaction] CITY_MAP BLOCKED: missing city asset", {
                  cityId: cid,
                  assetUrl,
                  status: r.status
                });
                setStatus("CITY FOCUS");
                try { G.enforceModeVisibility?.(); } catch {}
                enforceVisibilityFallback();
                return;
              }

              const entered = !!G.enterCityMap?.(cid, "city-second-click");
              if (!entered) {
                console.error("[interaction] failed to enter CITY_MAP", { cityId: cid });
                return;
              }
              setStatus("CITY MAP");
            })
            .catch((e) => {
              console.warn("[interaction] CITY_MAP BLOCKED: asset check failed", {
                cityId: cid,
                assetUrl,
                error: String(e?.message || e)
              });
              setStatus("CITY FOCUS");
              try { G.enforceModeVisibility?.(); } catch {}
              enforceVisibilityFallback();
            });

          return;
        }

        const entered = !!G.enterCityMap?.(cid, "city-second-click");
        if (!entered) {
          console.error("[interaction] failed to enter CITY_MAP", { cityId: cid });
          return;
        }
        setStatus("CITY MAP");
        return;
      }

      if (mode === "CITY_FOCUS" && activeCityId !== cid) {
        let cityMesh = null;
        try {
          cityMesh = G.selectCityById?.(cid, "node-refocus") || null;
        } catch (e) {
          console.error("[interaction] selectCityById refocus threw", e);
        }
        if (!cityMesh && typeof G.findCityMeshById === "function") cityMesh = G.findCityMeshById(cid);
        if (!cityMesh) cityMesh = picked;
        setFocused(cityMesh);
        return;
      }

      return;
    }

    if (isEntityMesh(picked)) {
      if (String(G.state.mode || "").toUpperCase() === "CITY_MAP") {
        const eid = getMeshEntityId(picked);
        G.state.selectedMesh = picked;
        G.state.activeEntityId = eid || null;
        commitSelection(picked);
        try { window.UmbraUsers?.recordSelectionFromState?.(); } catch {}

        try { G.setCityMapSelection?.(eid || null); } catch {}
      }

      setFocused(picked);
      return;
    }

    setFocused(picked);
  }

  function onWheel(evt) {
    evt.preventDefault();

    const st = G.state;
    if (!st || !st.camera) return;

    const mode = String(st.mode || "").toUpperCase();
    if (mode === "CITY_MAP") {
      const delta = Number(evt.deltaY || 0);

      G.setCityMapZoom?.(delta * -0.0015);

      const cm = G.state?.cityMap || {};
      const zoom = Number(cm.zoom || 1);
      const minZoom = Number(cm.minZoom || 1);
      const hasActiveEntity = !!String(G.state.activeEntityId || "").trim();

      if (zoom <= minZoom + 0.0005 && !hasActiveEntity) {
        try { G.exitCityMap?.("zoom-out"); } catch {}
        setStatus("CITY FOCUS");
        return;
      }

      return;
    }

    const delta = Number(evt.deltaY || 0);
    const ZOOM_SPEED = 0.0025;

    let next = Number.isFinite(Number(st.targetZoom))
      ? Number(st.targetZoom)
      : Number(st.camera.position.z);

    next += delta * ZOOM_SPEED;

    const MIN_ZOOM = 0.55;
    const MAX_ZOOM = 6.0;

    next = clamp(next, MIN_ZOOM, MAX_ZOOM);

    st.targetZoom = next;
  }

  G.initInteraction = function initInteraction() {
    if (G.state?._interactionBound) return;
    G.state._interactionBound = true;

    ensurePickAPI();
    ensureSelectionState();
    ensureVelocity();
    ensureYawPitchState();

    const el = G.state?.renderer?.domElement;
    if (!el) return console.error("[interaction] renderer.domElement missing");

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    console.log("[interaction] READY");
  };
})();