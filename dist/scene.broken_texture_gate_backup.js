// public/scene.js
(function () {
  function boot() {
    if (String(location.href || "").startsWith("file://")) {
      console.error("[scene] Refusing to run from file://.");
      return;
    }

    const G = window.UmbraGlobe;
    if (!G || typeof G.initCore !== "function") {
      console.error("[scene] UmbraGlobe/initCore missing.");
      return;
    }

    G.hardenState?.();
    const st = G.state;
    if (!st || typeof st !== "object") {
      console.error("[scene] G.state missing.");
      return;
    }

    if (st._booted) return;
    st._booted = true;

    st._pendingCityMapClear = false;
    st._pendingCityMapClearReason = "";

    function stopRAF() {
      try {
        if (st._rafId) cancelAnimationFrame(st._rafId);
      } catch {}
      st._rafId = 0;
      st._rafRunning = false;
    }

    function startRAF(renderFn) {
      if (st._rafRunning) return;
      st._rafRunning = true;

      function tick(t) {
        if (!st._rafRunning) return;

        if (!st.renderer || !st.scene || !st.camera || !st.worldGroup) {
          stopRAF();
          console.error("[scene] Core missing during RAF; stopped loop.");
          return;
        }

        try {
          renderFn(t);
        } catch (e) {
          stopRAF();
          console.error("[scene] renderFrame error; stopped loop:", e);
          return;
        }

        st._rafId = requestAnimationFrame(tick);
      }

      st._rafId = requestAnimationFrame(tick);
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

    function clamp(rad, min, max) {
      const r = Number(rad);
      if (!Number.isFinite(r)) return 0;
      return Math.max(min, Math.min(max, r));
    }

    function textureBasisDiagnostic() {
      if (!window.THREE) return;
      if (typeof G.latLonToDir !== "function") return;

      const d = G.latLonToDir(0, 0).clone().normalize();

      const AX = new THREE.Vector3(1, 0, 0);
      const AZ = new THREE.Vector3(0, 0, 1);

      const dx = d.dot(AX);
      const dz = d.dot(AZ);

      let basis = "UNKNOWN";
      let suggestDeg = 0;

      if (Math.abs(dx) >= Math.abs(dz)) {
        if (dx >= 0) {
          basis = "+X";
          suggestDeg = 0;
        } else {
          basis = "-X";
          suggestDeg = 180;
        }
      } else {
        if (dz >= 0) {
          basis = "+Z";
          suggestDeg = 90;
        } else {
          basis = "-Z";
          suggestDeg = -90;
        }
      }

      console.log("[scene] latLonToDir(0,0) basis =", basis, "dir=", {
        x: Number(d.x.toFixed(6)),
        y: Number(d.y.toFixed(6)),
        z: Number(d.z.toFixed(6)),
      });

      console.log("[scene] If nodes geo math is OK but texture is offset, try UMBRA_TEX_LON_OFFSET_DEG =", suggestDeg);
    }

    function lockGeoLonOffset() {
      const raw = window.UMBRA_GEO_LON_OFFSET_DEG;
      const fallback = 0;
      const v = Number.isFinite(Number(raw)) ? Number(raw) : fallback;

      try {
        Object.defineProperty(window, "UMBRA_GEO_LON_OFFSET_DEG", {
          value: v,
          writable: false,
          configurable: false,
          enumerable: true,
        });
      } catch {
        window.UMBRA_GEO_LON_OFFSET_DEG = v;
      }

      try {
        G.lockLonOffsetDeg?.(v);
      } catch {
        try {
          st.lonOffsetDeg = v;
          st._lonOffsetLocked = true;
          st._lonOffsetLockedValue = v;
        } catch {}
      }

      console.log("[scene] lonOffsetDeg HARD LOCKED =", v);
    }

    function lockTextureLonOffset() {
      const v = Number(window.UMBRA_TEX_LON_OFFSET_DEG ?? 90);

      try {
        Object.defineProperty(window, "UMBRA_TEX_LON_OFFSET_DEG", {
          value: v,
          writable: false,
          configurable: false,
          enumerable: true,
        });
      } catch {
        window.UMBRA_TEX_LON_OFFSET_DEG = v;
      }

      try {
        G.lockTextureLonOffsetDeg?.(v);
      } catch {
        try {
          st.textureLonOffsetDeg = v;
          st._textureLonOffsetLocked = true;
          st._textureLonOffsetLockedValue = v;
        } catch {}
      }

      console.log("[scene] textureLonOffsetDeg HARD LOCKED =", v);
    }

    function setHomeOrientationOnce() {
      if (st.__homeSet) return;
      st.__homeSet = true;

      if (!window.THREE) return;
      if (typeof G.latLonToDir !== "function") return;

      const homeLat = Number.isFinite(Number(window.UMBRA_HOME_LAT)) ? Number(window.UMBRA_HOME_LAT) : 39.5;
      const homeLon = Number.isFinite(Number(window.UMBRA_HOME_LON)) ? Number(window.UMBRA_HOME_LON) : -98.35;

      const wg = st.worldGroup;
      if (!wg) return;

      st.velocity = st.velocity || { x: 0, y: 0 };
      st.velocity.x = 0;
      st.velocity.y = 0;
      st.isDragging = false;
      st.isFocused = false;
      st.focusQuat = null;
      st.allowAutoSpin = false;

      const homeDir = G.latLonToDir(homeLat, homeLon).clone().normalize();
      const front = new THREE.Vector3(0, 0, 1);
      const q = new THREE.Quaternion().setFromUnitVectors(homeDir, front);

      wg.quaternion.copy(q);
      wg.rotation.setFromQuaternion(wg.quaternion, "XYZ");
      wg.updateMatrixWorld(true);

      st.yaw = wrapPi(wg.rotation.y);
      const maxTilt = 0.78;
      st.pitch = clamp(wg.rotation.x, -maxTilt, maxTilt);

      console.log("[scene] HOME orientation set:", { homeLat, homeLon });

      try {
        G.applyTextureLonOffsetNow?.();
      } catch {}
    }

    function verifyRuntimeOrStop(stage) {
      const rep = G.verifyInvariants?.(stage) || { ok: true };
      if (!rep.ok) {
        stopRAF();
        console.error("[scene] integrity failure; stopped RAF.", rep);
        return false;
      }
      return true;
    }

    function callFirstAvailable(names, ...args) {
      for (const name of names) {
        const fn = G?.[name];
        if (typeof fn !== "function") continue;
        try {
          return fn(...args);
        } catch (e) {
          console.error(`[scene] ${name} failed`, e);
        }
      }
      return undefined;
    }

    function disposeActiveCityTexture() {
      const tex = st.activeCityTexture;
      if (!tex) return;
      const owned = !!(tex.userData && tex.userData.__umbraOwned === true);
      if (owned && typeof tex.dispose === "function") {
        try { tex.dispose(); } catch {}
      }
    }

    function clearActiveCityAssetState() {
      disposeActiveCityTexture();

      st.activeCityMeta = null;
      st.activeCityTexture = null;
      st.activeCityTileInfo = null;
      st.__lastCitySurfaceId = "";
      st.__cityProjectionCount = 0;
      st.__cityProjectionScale = 0;
      st._pendingCityMapClear = false;
      st._pendingCityMapClearReason = "";

      callFirstAvailable(
        [
          "clearCityMap",
          "clearActiveCityView",
          "clearCityView",
          "clearCitySurface",
          "resetCityView",
          "teardownCityView",
        ],
        "scene-clear"
      );
    }

    function requestPendingCityMapClear(reason) {
      st._pendingCityMapClear = true;
      st._pendingCityMapClearReason = String(reason || "pending-clear");
    }

    function processPendingCityMapClear() {
      if (!st._pendingCityMapClear) return;

      const maps = st.cityMap || null;
      const mode = String(st.mode || "").toUpperCase();

      if (!maps) {
        clearActiveCityAssetState();
        try { G.updateTelemetry?.(); } catch {}
        return;
      }

      if (mode === "CITY_MAP") {
        return;
      }

      const alpha = Number(maps.alpha);
      const targetAlpha = Number(maps.targetAlpha);
      const groupVisible = !!maps.group?.visible;

      const fadeComplete =
        (!Number.isFinite(alpha) || alpha <= 0.001) &&
        (!Number.isFinite(targetAlpha) || targetAlpha <= 0.001);

      if (!fadeComplete && groupVisible) {
        return;
      }

      const reason = String(st._pendingCityMapClearReason || "pending-clear");
      clearActiveCityAssetState();

      console.log("[scene] CITY MAP ASSET CLEARED", {
        reason,
        mode
      });

      try { G.updateTelemetry?.(); } catch {}
    }

    async function syncActiveCityAsset(reason) {
      const cid = String(st.activeCityId || "").trim();
      const mode = String(st.mode || "").toUpperCase();

      if (!cid || mode !== "CITY_MAP") {
        clearActiveCityAssetState();
        try { G.updateTelemetry?.(); } catch {}
        return false;
      }

      if (!(st.citiesById instanceof Map) || !st.citiesById.has(cid)) {
        console.error("[scene] syncActiveCityAsset invalid activeCityId", cid);
        clearActiveCityAssetState();
        return false;
      }

      if (typeof G.loadCityAsset !== "function") {
        console.warn("[scene] loadCityAsset missing; CITY_MAP mode will run without city surface.", { cityId: cid });
        return false;
      }

      st._cityLoadToken = Number(st._cityLoadToken || 0) + 1;
      const token = st._cityLoadToken;

      try {
        const loaded = await G.loadCityAsset(cid);

        if (token !== st._cityLoadToken) {
          console.warn("[scene] stale city asset load ignored", { cityId: cid, reason: "token-mismatch" });
          return false;
        }

        if (String(st.activeCityId || "").trim() !== cid || String(st.mode || "").toUpperCase() !== "CITY_MAP") {
          console.warn("[scene] stale city asset load ignored", { cityId: cid, reason: "active-city-changed" });
          return false;
        }

        if (!loaded || !loaded.meta || !loaded.tex) {
          console.error("[scene] city asset load returned empty result", { cityId: cid, reason: String(reason || "") });
          st.activeCityMeta = null;
          st.activeCityTexture = null;
          st.activeCityTileInfo = null;
          return false;
        }

        if (String(loaded.meta.city_id || "").trim() !== cid) {
          console.error("[scene] city asset meta mismatch", {
            expected: cid,
            got: String(loaded.meta.city_id || "").trim()
          });
          st.activeCityMeta = null;
          st.activeCityTexture = null;
          st.activeCityTileInfo = null;
          return false;
        }

        st._pendingCityMapClear = false;
        st._pendingCityMapClearReason = "";
        st.activeCityMeta = loaded.meta;
        st.activeCityTexture = loaded.tex;
        st.activeCityTileInfo = loaded.tileInfo || null;
        st.__lastCitySurfaceId = cid;

        callFirstAvailable(
          [
            "syncCityMapFromState",
            "syncActiveCityViewFromState",
            "syncCityViewFromState",
            "mountActiveCityView",
            "mountCityView",
            "updateActiveCitySurface",
            "updateCitySurfaceFromState",
            "renderActiveCityView",
            "renderCityView"
          ],
          {
            cityId: cid,
            reason: String(reason || "scene-sync"),
            meta: loaded.meta,
            texture: loaded.tex,
            tileInfo: loaded.tileInfo || null
          }
        );

        try { G.updateTelemetry?.(); } catch {}

        console.log("[scene] CITY MAP ASSET READY", {
          cityId: cid,
          reason: String(reason || ""),
          hasMeta: !!st.activeCityMeta,
          hasTexture: !!st.activeCityTexture
        });

        return true;
      } catch (e) {
        console.error("[scene] syncActiveCityAsset failed", {
          cityId: cid,
          reason: String(reason || ""),
          error: e
        });
        st.activeCityMeta = null;
        st.activeCityTexture = null;
        st.activeCityTileInfo = null;
        return false;
      }
    }

    function installCityStateBridge() {
      if (st._cityStateBridgeInstalled) return;
      st._cityStateBridgeInstalled = true;

      const originalSelectCityById =
        typeof G.selectCityById === "function" ? G.selectCityById.bind(G) : null;

      const originalExitCity =
        typeof G.exitCity === "function" ? G.exitCity.bind(G) : null;

      const originalEnterCityMap =
        typeof G.enterCityMap === "function" ? G.enterCityMap.bind(G) : null;

      const originalExitCityMap =
        typeof G.exitCityMap === "function" ? G.exitCityMap.bind(G) : null;

      G.selectCityById = function selectCityByIdBridged(cityId, source) {
        const cid = String(cityId || "").trim();
        st._cityLoadToken = Number(st._cityLoadToken || 0) + 1;
        clearActiveCityAssetState();

        const result = originalSelectCityById ? originalSelectCityById(cid, source) : null;

        try { G.updateTelemetry?.(); } catch {}
        return result;
      };

      G.enterCityMap = function enterCityMapBridged(cityId, source) {
        const cid = String(cityId || st.activeCityId || "").trim();
        st._pendingCityMapClear = false;
        st._pendingCityMapClearReason = "";

        const result = originalEnterCityMap ? originalEnterCityMap(cid, source) : false;

        Promise.resolve()
          .then(() => syncActiveCityAsset(`enterCityMap:${String(source || "unknown")}`))
          .catch((e) => {
            console.error("[scene] city map enter sync failed", e);
          });

        return result;
      };

      G.exitCityMap = function exitCityMapBridged(source) {
        const result = originalExitCityMap ? originalExitCityMap(source) : true;

        st._cityLoadToken = Number(st._cityLoadToken || 0) + 1;
        requestPendingCityMapClear(`exitCityMap:${String(source || "unknown")}`);

        try { G.updateTelemetry?.(); } catch {}

        return result;
      };

      G.exitCity = function exitCityBridged(source) {
        const result = originalExitCity ? originalExitCity(source) : true;

        st._cityLoadToken = Number(st._cityLoadToken || 0) + 1;
        requestPendingCityMapClear(`exitCity:${String(source || "unknown")}`);

        try { G.updateTelemetry?.(); } catch {}

        return result;
      };

      console.log("[scene] city state bridge installed");
    }

    const ok = G.initCore();
    if (!ok) {
      console.error("[scene] initCore failed.");
      return;
    }

    if (!st.scene || !st.worldGroup || st.worldGroup.parent !== st.scene) {
      console.error("[scene] worldGroup missing or unparented.");
      return;
    }

    textureBasisDiagnostic();
    lockGeoLonOffset();
    lockTextureLonOffset();

    if (typeof G.loadTextures !== "function") {
      console.error("[scene] loadTextures missing.");
      return;
    }

    G.loadTextures(
      {
        base: "/assets/earth_day_16k.jpg",
        night: "/assets/earthatnight2012.png",
        starfield: "/assets/starfield_8k.png",
      },
      (tex) => {
if (!window.UMBRA_DATA?.datasetHash) {
            console.log("[scene] client data gate active");
            const waitForData = setInterval(() => {
              if (window.UMBRA_DATA?.datasetHash) {
                clearInterval(waitForData);
                console.log("[scene] remote client data ready; continuing");
              }
            }, 100);
          }
        }
        try {
          G.buildLayers?.(tex);

          if (!st.globeMesh) {
            console.error("[scene] globeMesh missing.");
            return;
          }

          try {
            G.applyTextureLonOffsetNow?.();
          } catch {}

          function afterDataReady() {
            const payload = window.UMBRA_DATA || { cities: [], entities: [] };

            if (!payload?._src?.datasetHash && !payload?.datasetHash) {
              console.warn("[scene] datasetHash unavailable after populated gate; continuing only because populated data exists.");
            }

            if (typeof G.buildCityEntityHierarchy !== "function") {
              console.error("[scene] buildCityEntityHierarchy missing.");
              return;
            }

            G.applyScoring?.(payload);
            G.buildCityEntityHierarchy(payload);
            setHomeOrientationOnce();

            const dataCityCount = Array.isArray(payload?.cities) ? payload.cities.length : 0;
            const dataEntityCount = Array.isArray(payload?.entities) ? payload.entities.length : 0;
            const meshCityCount = Array.isArray(st.cityMeshes) ? st.cityMeshes.length : 0;
            const meshEntityCount = Array.isArray(st.entityMeshes) ? st.entityMeshes.length : 0;

            if (meshCityCount !== dataCityCount) {
              console.error("[scene] city count mismatch", { meshCityCount, dataCityCount });
              return;
            }

            if (meshEntityCount !== dataEntityCount) {
              console.error("[scene] entity count mismatch", { meshEntityCount, dataEntityCount });
              return;
            }

            installCityStateBridge();

            if (!verifyRuntimeOrStop("POST_HIERARCHY")) return;

            G.initInteraction?.();
            G.initUI?.();
            G.updateTelemetry?.();

            stopRAF();
            st._integrityTimer = 0;
            startRAF(renderFrame);

            console.log("[scene] BOOT COMPLETE");
          }

          function waitForPopulatedUmbraData() {
            const startedAt = Date.now();

            const tick = () => {
              const payload = window.UMBRA_DATA;

              if (
                payload &&
                Array.isArray(payload.cities) &&
                payload.cities.length > 0 &&
                Array.isArray(payload.entities) &&
                payload.entities.length > 0
              ) {
                console.log("[scene] populated UMBRA_DATA ready; continuing", {
                  cities: payload.cities.length,
                  entities: payload.entities.length
                });
                afterDataReady();
                return;
              }

              if (Date.now() - startedAt > 30000) {
                console.error("[scene] populated UMBRA_DATA wait timeout; refusing empty hierarchy build.");
                return;
              }

              requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
          }
          if (typeof G.loadDataV1 === "function") {
            G.loadDataV1({}, (ready) => {
              if (!ready) {
                console.error("[scene] Data load failed.");
                return;
              }
              waitForPopulatedUmbraData();
            });
          } else {
            window.UMBRA_DATA_READY = true;
            waitForPopulatedUmbraData();
          }
        } catch (e) {
          console.error("[scene] boot pipeline error:", e);
        }
      }
    );

    function renderFrame(t) {
      const last = st.lastTime || t;
      const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
      st.lastTime = t;

      const wg = st.worldGroup;
      if (!wg) return;

      if (!Number.isFinite(st.camera?.position?.z)) {
        stopRAF();
        console.error("[scene] camera position invalid; stopped RAF.");
        return;
      }

      const maxTilt = 0.78;

      if (!Number.isFinite(st.yaw)) st.yaw = wrapPi(wg.rotation.y || 0);
      if (!Number.isFinite(st.pitch)) st.pitch = clamp(wg.rotation.x || 0, -maxTilt, maxTilt);

      if (!st.isDragging && st.velocity) {
        const vx = Number(st.velocity.x || 0);
        const vy = Number(st.velocity.y || 0);

        st.yaw = wrapPi(st.yaw + vx * dt);
        st.pitch = clamp(st.pitch + vy * dt, -maxTilt, maxTilt);

        const d = G.consts?.DAMPING ?? 0.94;
        st.velocity.x *= d;
        st.velocity.y *= d;

        if (Math.abs(st.velocity.x) < 1e-6) st.velocity.x = 0;
        if (Math.abs(st.velocity.y) < 1e-6) st.velocity.y = 0;
      }

      wg.rotation.order = "XYZ";
      wg.rotation.x = st.pitch;
      wg.rotation.y = st.yaw;
      wg.rotation.z = 0;
      wg.updateMatrixWorld(true);

      const mode = String(st.mode || "").toUpperCase();

      if (mode !== "CITY_MAP") {
        const targetZoom = Number.isFinite(Number(st.targetZoom))
          ? Number(st.targetZoom)
          : Number(st.defaultZoom || 3.2);

        const z = Number(st.camera.position.z || targetZoom);
        st.camera.position.z = z + (targetZoom - z) * Math.min(1, dt * 10);
      }

      if (st.starfieldMesh) {
        st.starfieldMesh.position.copy(st.camera.position);
      }

      try { G.updateCityView?.(); } catch (e) { console.error("[scene] updateCityView failed", e); }
      try { G.tickCityView?.(dt); } catch (e) { console.error("[scene] tickCityView failed", e); }

      try { G.updateCityMap?.(); } catch (e) { console.error("[scene] updateCityMap failed", e); }
      try { G.tickCityMap?.(dt); } catch (e) { console.error("[scene] tickCityMap failed", e); }

      processPendingCityMapClear();

      st._integrityTimer = Number(st._integrityTimer || 0) + dt;
      if (st._integrityTimer >= 1.0) {
        st._integrityTimer = 0;
        verifyRuntimeOrStop("RUNTIME");
      }

      st.renderer.render(st.scene, st.camera);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();



















