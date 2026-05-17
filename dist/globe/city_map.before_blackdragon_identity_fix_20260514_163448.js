// public/globe/city_map.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) return console.error("[city_map] window.UmbraGlobe missing.");
  if (!window.THREE) return console.error("[city_map] window.THREE missing.");

  console.log("[SIGNATURE] globe/city_map.js LOADED", new Date().toISOString());
  console.log("[CITY_MAP PATCH MARKER]", "DAY1_REGISTRY_LIVE");

  const CITY_MAP_NODE_CORE_RADIUS = 0.0042;
  const CITY_MAP_NODE_INNER_GLOW_RADIUS = 0.009;
  const CITY_MAP_NODE_OUTER_GLOW_RADIUS = 0.016;
  const CITY_MAP_NODE_FLARE_LENGTH = 0.018;
  const CITY_MAP_NODE_FLARE_THICKNESS = 0.0016;

  const CITY_MAP_PICK_RADIUS = 0.024;
  const CITY_MAP_NODE_Z = 0.02;
  const CITY_MAP_PICK_Z = 0.0;

  const CITY_MAP_MARKER_BASE_SCALE = 1.35;
  const CITY_MAP_MARKER_SELECTED_SCALE = 1.85;

  function str(v) {
    const s = String(v ?? "").trim();
    return s || "";
  }

  function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function clamp(v, a, b) {
    const n = Number(v);
    if (!Number.isFinite(n)) return a;
    return Math.max(a, Math.min(b, n));
  }

  function round(v, p = 6) {
    const n = Number(v);
    return Number.isFinite(n) ? Number(n.toFixed(p)) : null;
  }

  function safeRemove(obj) {
    if (!obj) return;
    try { obj.parent?.remove?.(obj); } catch {}
    try { G.disposeObject?.(obj); } catch {}
  }

  function setMaterialOpacity(root, opacity) {
    if (!root) return;
    const value = clamp(opacity, 0, 1);

    root.traverse?.((o) => {
      const mats = Array.isArray(o?.material) ? o.material : (o?.material ? [o.material] : []);
      for (const m of mats) {
        if (!m) continue;
        if ("opacity" in m) {
          const base = Number.isFinite(Number(m.userData?.__baseOpacity))
            ? Number(m.userData.__baseOpacity)
            : 1;

          if (m.userData?.__forceTransparent === true) {
            m.transparent = true;
          } else if (value >= 0.999) {
            m.transparent = false;
          } else {
            m.transparent = true;
          }

          m.opacity = clamp(base * value, 0, 1);
          m.needsUpdate = true;
        }
      }
    });
  }

  function storeBaseOpacity(mat, fallback) {
    if (!mat) return;
    mat.userData = mat.userData || {};
    if (!Number.isFinite(Number(mat.userData.__baseOpacity))) {
      const base = Number.isFinite(Number(mat.opacity)) ? Number(mat.opacity) : fallback;
      mat.userData.__baseOpacity = base;
    }
  }

  function hashString01(value) {
    const s = String(value ?? "");
    let h = 2166136261;

    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }

    return ((h >>> 0) % 10000) / 10000;
  }

  function buildNodeStyleVariant(entity) {
    const seed = hashString01(entity?.entity_id || "");

    const isBlackDragon =
      entity?.black_dragon_dossier ||
      entity?._live_account_source === "black_dragon_agency_target";

    const coreOpacity = isBlackDragon ? 1.0 : 0.82;
    const innerOpacity = isBlackDragon ? 0.72 : 0.38;
    const outerOpacity = isBlackDragon ? 0.28 : 0.11;
    const flareOpacity = isBlackDragon ? 0.55 : 0.24;
    const scaleJitter = 0.96 + (seed * 0.12);
    const flareRotation = seed * Math.PI;

    return {
      seed,
      isBlackDragon,
      coreOpacity,
      innerOpacity,
      outerOpacity,
      flareOpacity,
      scaleJitter,
      flareRotation
    };
  }

  function normalizeBounds(raw) {
    const north = num(raw?.north);
    const south = num(raw?.south);
    const east = num(raw?.east);
    const west = num(raw?.west);

    if (north === null || south === null || east === null || west === null) return null;
    if (!(north > south)) return null;
    if (!(east > west)) return null;

    return { north, south, east, west };
  }

  function ensureCityMapState() {
    const st = G.state || {};
    st.cityMap = st.cityMap || {
      group: null,
      surfaceMesh: null,
      frameMesh: null,
      nodeGroup: null,
      nodes: [],
      nodeMeshes: [],
      entityMeshes: [],
      pickMeshes: [],
      activeCityId: null,
      meta: null,
      texture: null,
      ready: false,
      alpha: 0,
      targetAlpha: 0,
      widthUnits: 1.6,
      heightUnits: 1.0,
      imageWidth: null,
      imageHeight: null,
      rasterBounds: null,
      rasterBoundsSource: "",
      lastBuildKey: "",
      lastSelectionEntityId: null,
      lastProjectionReport: [],
      zoom: 1,
      minZoom: 1,
      maxZoom: 2.8,
      panX: 0,
      panY: 0,
      panLimitX: 0,
      panLimitY: 0,
    };
    if (!Array.isArray(st.cityMap.nodes)) st.cityMap.nodes = [];
    if (!Array.isArray(st.cityMap.nodeMeshes)) st.cityMap.nodeMeshes = [];
    if (!Array.isArray(st.cityMap.entityMeshes)) st.cityMap.entityMeshes = [];
    if (!Array.isArray(st.cityMap.pickMeshes)) st.cityMap.pickMeshes = [];
    if (!Array.isArray(st.cityMapPickMeshes)) st.cityMapPickMeshes = [];
    if (!Array.isArray(st.pickMeshes)) st.pickMeshes = [];
    if (!Array.isArray(st.cityMap.lastProjectionReport)) st.cityMap.lastProjectionReport = [];
    return st.cityMap;
  }

  function ensureCityMapDebug() {
    G.debugCityMap = G.debugCityMap || {};

    if (typeof G.debugCityMap.enabled !== "boolean") {
      G.debugCityMap.enabled = true;
    }
    if (!Number.isFinite(Number(G.debugCityMap.sampleLimit))) {
      G.debugCityMap.sampleLimit = 12;
    }
    if (!Number.isFinite(Number(G.debugCityMap.runCounter))) {
      G.debugCityMap.runCounter = 0;
    }
    if (!G.debugCityMap.lastRun || typeof G.debugCityMap.lastRun !== "object") {
      G.debugCityMap.lastRun = null;
    }

    function classifyBounds(u, v) {
      const reasons = [];
      if (!Number.isFinite(u) || !Number.isFinite(v)) {
        reasons.push("NON_FINITE_UV");
        return reasons;
      }
      if (u < 0) reasons.push("WEST_OOB");
      if (u > 1) reasons.push("EAST_OOB");
      if (v < 0) reasons.push("NORTH_OOB");
      if (v > 1) reasons.push("SOUTH_OOB");
      return reasons;
    }

    function buildHeader(payload) {
      const cityMapState = payload?.cityMapState || {};
      const meta = payload?.cityMeta || {};
      const bounds = meta?.bounds || {};
      const projectionBounds = cityMapState?.rasterBounds || bounds;

      const planeWidth = num(cityMapState?.widthUnits);
      const planeHeight = num(cityMapState?.heightUnits);
      const planeAspect =
        Number.isFinite(planeWidth) && Number.isFinite(planeHeight) && planeHeight !== 0
          ? planeWidth / planeHeight
          : null;

      const imageWidth =
        num(cityMapState?.imageWidth) ??
        num(cityMapState?.texture?.image?.width) ??
        num(cityMapState?.image?.width) ??
        null;

      const imageHeight =
        num(cityMapState?.imageHeight) ??
        num(cityMapState?.texture?.image?.height) ??
        num(cityMapState?.image?.height) ??
        null;

      const imageAspect =
        Number.isFinite(imageWidth) && Number.isFinite(imageHeight) && imageHeight !== 0
          ? imageWidth / imageHeight
          : null;

      return {
        run: ++G.debugCityMap.runCounter,
        stage: str(payload?.stage || "UNKNOWN"),
        activeCityId: str(payload?.activeCityId || cityMapState?.cityId || meta?.city_id),
        metaCityId: str(meta?.city_id),
        bounds: {
          north: num(bounds.north),
          south: num(bounds.south),
          east: num(bounds.east),
          west: num(bounds.west)
        },
        projectionBounds: {
          north: num(projectionBounds?.north),
          south: num(projectionBounds?.south),
          east: num(projectionBounds?.east),
          west: num(projectionBounds?.west)
        },
        projectionBoundsSource: str(cityMapState?.rasterBoundsSource || "meta"),
        rotationDeg: num(meta?.rotation_deg),
        widthM: num(meta?.width_m),
        heightM: num(meta?.height_m),
        planeWidth: round(planeWidth),
        planeHeight: round(planeHeight),
        planeAspect: round(planeAspect),
        imageWidth: imageWidth,
        imageHeight: imageHeight,
        imageAspect: round(imageAspect),
        aspectDelta:
          Number.isFinite(planeAspect) && Number.isFinite(imageAspect)
            ? round(Math.abs(planeAspect - imageAspect))
            : null
      };
    }

    G.debugCityMap.begin = function beginCityMapAudit(payload) {
      if (!G.debugCityMap.enabled) return;

      const header = buildHeader(payload);

      G.debugCityMap.lastRun = {
        header,
        candidates: [],
        projected: [],
        summary: null
      };

      console.groupCollapsed(
        `%c[CITY_MAP AUDIT] BEGIN run=${header.run} stage=${header.stage} city=${header.activeCityId}`,
        "color:#ff4d4f;font-weight:bold;"
      );
      console.log("HEADER", header);
    };

    G.debugCityMap.candidates = function auditCandidates(info) {
      if (!G.debugCityMap.enabled || !G.debugCityMap.lastRun) return;

      const rows = Array.isArray(info?.rows) ? info.rows : [];
      const trimmed = rows.slice(0, G.debugCityMap.sampleLimit).map((e) => ({
        entity_id: str(e?.entity_id || e?.entityId),
        city_id: str(e?.city_id || e?.cityId),
        lat: round(num(e?.lat)),
        lon: round(num(e?.lon)),
        validCity: !!e?._debugValidCity,
        validLatLon: !!e?._debugValidLatLon
      }));

      G.debugCityMap.lastRun.candidates = trimmed;

      console.log("CANDIDATE_COUNTS", {
        totalReceived: num(info?.totalReceived),
        afterCityFilter: num(info?.afterCityFilter),
        afterLatLonFilter: num(info?.afterLatLonFilter),
        sampled: trimmed.length
      });

      console.table(trimmed);
    };

    G.debugCityMap.projectedRow = function auditProjectedRow(row) {
      if (!G.debugCityMap.enabled || !G.debugCityMap.lastRun) return;

      const u = num(row?.u);
      const v = num(row?.v);
      const derivedBoundsReason = classifyBounds(u, v);

      const item = {
        entity_id: str(row?.entity_id),
        city_id: str(row?.city_id),
        lat: round(num(row?.lat)),
        lon: round(num(row?.lon)),
        u: round(u),
        v: round(v),
        x: round(num(row?.x)),
        y: round(num(row?.y)),
        z: round(num(row?.z)),
        outOfBounds: !!row?.outOfBounds,
        boundsReason: Array.isArray(row?.boundsReason) && row.boundsReason.length
          ? row.boundsReason.join("|")
          : derivedBoundsReason.join("|")
      };

      if (G.debugCityMap.lastRun.projected.length < G.debugCityMap.sampleLimit) {
        G.debugCityMap.lastRun.projected.push(item);
      }
    };

    G.debugCityMap.end = function endCityMapAudit(info) {
      if (!G.debugCityMap.enabled || !G.debugCityMap.lastRun) return;

      const renderedNodeCount = num(info?.renderedNodeCount);
      const pickMeshCount = num(info?.pickMeshCount);

      const summary = {
        renderedNodeCount,
        pickMeshCount,
        skippedOutOfBounds: num(info?.skippedOutOfBounds),
        skippedInvalid: num(info?.skippedInvalid),
        parityOK:
          Number.isFinite(renderedNodeCount) &&
          Number.isFinite(pickMeshCount) &&
          renderedNodeCount === pickMeshCount
      };

      G.debugCityMap.lastRun.summary = summary;

      if (G.debugCityMap.lastRun.projected.length) {
        console.table(G.debugCityMap.lastRun.projected);
      }

      console.log("SUMMARY", summary);
      console.log("LAST_RUN", G.debugCityMap.lastRun);
      console.groupEnd();
    };

    return G.debugCityMap;
  }

  ensureCityMapDebug();

  function clearNodeGroup(group) {
    if (!group) return;
    while (group.children.length) {
      safeRemove(group.children[0]);
    }
  }

  function syncNodeRegistriesFromGroup() {
    const st = G.state || {};
    const maps = ensureCityMapState();
    const nodeGroup = maps.nodeGroup;

    if (!nodeGroup || !Array.isArray(nodeGroup.children)) {
      maps.nodes = [];
      maps.nodeMeshes = [];
      maps.entityMeshes = [];
      st.cityMapPickMeshes = Array.isArray(maps.pickMeshes) ? maps.pickMeshes : [];
      st.pickMeshes = Array.isArray(maps.pickMeshes) ? maps.pickMeshes : [];
      return;
    }

    const anchors = nodeGroup.children.filter((child) => {
      if (!child) return false;
      const entityId = str(child?.userData?.entity_id || child?.entity_id || "");
      if (entityId) return true;
      return String(child?.name || "").startsWith("entityNode:");
    });

    maps.nodes = anchors.slice();
    maps.nodeMeshes = [];
    maps.entityMeshes = [];

    const picks = [];
    for (const anchor of anchors) {
      const pickMesh =
        anchor?.children?.find?.((c) => c?.name === "pickMesh") || null;
      if (pickMesh) picks.push(pickMesh);
    }

    maps.pickMeshes = picks;
    st.cityMapPickMeshes = maps.pickMeshes;
    st.pickMeshes = maps.pickMeshes;
  }

  function validateMeta(meta, expectedCityId) {
    if (!meta || typeof meta !== "object") throw new Error("city meta missing");

    const cid = str(meta.city_id);
    const expect = str(expectedCityId);
    if (!cid || cid !== expect) {
      throw new Error(`city meta mismatch: expected ${expect}, got ${cid || "empty"}`);
    }

    const north = num(meta?.bounds?.north);
    const south = num(meta?.bounds?.south);
    const east = num(meta?.bounds?.east);
    const west = num(meta?.bounds?.west);

    if (north === null || south === null || east === null || west === null) {
      throw new Error("city meta missing bounds");
    }
    if (!(north > south)) throw new Error("city meta invalid bounds: north <= south");
    if (!(east > west)) throw new Error("city meta invalid bounds: east <= west");

    const width_m = num(meta.width_m);
    const height_m = num(meta.height_m);

    if (width_m === null || height_m === null || width_m <= 0 || height_m <= 0) {
      throw new Error("city meta invalid width_m/height_m");
    }

    return {
      city_id: cid,
      name: str(meta.name) || cid,
      center_lat: num(meta.center_lat),
      center_lon: num(meta.center_lon),
      bounds: { north, south, east, west },
      width_m,
      height_m,
      rotation_deg: Number.isFinite(Number(meta.rotation_deg)) ? Number(meta.rotation_deg) : 0,
      image: str(meta.image),
      tiles: meta.tiles || null,
    };
  }

  function resolveEntitiesForCity(cityId) {
    const st = G.state || {};
    const cid = str(cityId);
    if (!cid) return [];

    if (st.entitiesListByCity instanceof Map && st.entitiesListByCity.has(cid)) {
      const arr = st.entitiesListByCity.get(cid);
      const out = Array.isArray(arr) ? arr.filter(Boolean) : [];
      if (!out.length) {
        console.error("[city_map] NO ENTITIES RESOLVED", {
          cityId: cid,
          entitiesById: st.entitiesById?.size || 0,
          entitiesListByCity: st.entitiesListByCity?.size || 0,
          source: "entitiesListByCity"
        });
      }
      return out;
    }

    if (st.entitiesById instanceof Map) {
      const out = [];
      for (const entity of st.entitiesById.values()) {
        const entityCityId = str(entity?.city_id || entity?.cityId);
        if (entityCityId === cid) out.push(entity);
      }
      if (!out.length) {
        console.error("[city_map] NO ENTITIES RESOLVED", {
          cityId: cid,
          entitiesById: st.entitiesById?.size || 0,
          entitiesListByCity: st.entitiesListByCity?.size || 0,
          source: "entitiesById-scan"
        });
      }
      return out;
    }

    console.error("[city_map] NO ENTITIES RESOLVED", {
      cityId: cid,
      entitiesById: st.entitiesById?.size || 0,
      entitiesListByCity: st.entitiesListByCity?.size || 0,
      source: "none"
    });
    return [];
  }

  function getPlaneSizeForMeta(meta, imageWidth, imageHeight) {
    const maxWidth = 1.9;
    const maxHeight = 1.2;

    const hasTileAuthority =
      !!meta?.tiles &&
      typeof meta.tiles === "object" &&
      !!str(meta.tiles.url);

    const rasterAspect =
      Number.isFinite(Number(imageWidth)) &&
      Number.isFinite(Number(imageHeight)) &&
      Number(imageHeight) > 0
        ? Number(imageWidth) / Number(imageHeight)
        : null;

    const metaAspect =
      Number.isFinite(Number(meta?.width_m)) &&
      Number.isFinite(Number(meta?.height_m)) &&
      Number(meta.height_m) > 0
        ? Number(meta.width_m) / Number(meta.height_m)
        : null;

    const aspect =
      hasTileAuthority && Number.isFinite(rasterAspect) && rasterAspect > 0
        ? rasterAspect
        : (metaAspect || rasterAspect || 1);

    let widthUnits = maxWidth;
    let heightUnits = maxWidth / aspect;

    if (heightUnits > maxHeight) {
      heightUnits = maxHeight;
      widthUnits = maxHeight * aspect;
    }

    return {
      widthUnits,
      heightUnits,
      aspectSource:
        hasTileAuthority && Number.isFinite(rasterAspect) && rasterAspect > 0
          ? "raster"
          : "meta"
    };
  }

  function metersPerDegreeLon(latDeg) {
    const lat = Number(latDeg);
    if (!Number.isFinite(lat)) return null;
    return 111320 * Math.cos((lat * Math.PI) / 180);
  }

  function resolveRasterBounds(meta, maps, texture) {
    const metaBounds = normalizeBounds(meta?.bounds);
    if (!metaBounds) return { bounds: null, source: "invalid-meta" };

    const hasTileAuthority =
      !!meta?.tiles &&
      typeof meta.tiles === "object" &&
      !!str(meta.tiles.url);

    if (!hasTileAuthority) {
      return { bounds: metaBounds, source: "meta" };
    }

    const explicitCandidates = [
      texture?.userData?.rasterBounds,
      texture?.userData?.bounds,
      texture?.userData?.geoBounds,
      texture?.image?.userData?.rasterBounds,
      texture?.image?.userData?.bounds,
      maps?.texture?.userData?.rasterBounds,
      maps?.texture?.userData?.bounds,
      maps?.meta?.rasterBounds,
      maps?.meta?.raster_bounds,
      meta?.rasterBounds,
      meta?.raster_bounds,
      meta?.projection_bounds,
      meta?.projectionBounds
    ];

    for (const candidate of explicitCandidates) {
      const normalized = normalizeBounds(candidate);
      if (normalized) {
        return { bounds: normalized, source: "explicit" };
      }
    }

    const imageWidth = num(maps?.imageWidth);
    const imageHeight = num(maps?.imageHeight);
    const imageAspect =
      Number.isFinite(imageWidth) &&
      Number.isFinite(imageHeight) &&
      imageHeight > 0
        ? imageWidth / imageHeight
        : null;

    const metaAspect =
      Number.isFinite(Number(meta?.width_m)) &&
      Number.isFinite(Number(meta?.height_m)) &&
      Number(meta.height_m) > 0
        ? Number(meta.width_m) / Number(meta.height_m)
        : null;

    if (!(imageAspect > 0) || !(metaAspect > 0)) {
      return { bounds: metaBounds, source: "meta" };
    }

    const ratio = imageAspect / metaAspect;
    if (!Number.isFinite(ratio) || Math.abs(ratio - 1) < 0.0005) {
      return { bounds: metaBounds, source: "meta" };
    }

    const centerLat =
      num(meta?.center_lat) ??
      ((metaBounds.north + metaBounds.south) * 0.5);

    const widthM = num(meta?.width_m);
    const metersPerLon = metersPerDegreeLon(centerLat);

    if (!(widthM > 0) || !(metersPerLon > 0)) {
      return { bounds: metaBounds, source: "meta" };
    }

    const rasterWidthM = widthM * ratio;
    const deltaWidthM = rasterWidthM - widthM;
    const deltaLonDeg = deltaWidthM / metersPerLon / 2;

    if (!Number.isFinite(deltaLonDeg)) {
      return { bounds: metaBounds, source: "meta" };
    }

    return {
      bounds: {
        north: metaBounds.north,
        south: metaBounds.south,
        west: metaBounds.west,
        east: metaBounds.east + (deltaLonDeg * 2)
      },
      source: "derived:rasterAspect:eastOnly"
    };
  }

  function getProjectionBounds(meta, maps, texture) {
    const normalized = normalizeBounds(maps?.rasterBounds);
    if (normalized) return normalized;

    const resolved = resolveRasterBounds(meta, maps, texture);
    return normalizeBounds(resolved?.bounds) || normalizeBounds(meta?.bounds);
  }

  function cityLatLonToLocalXY(meta, widthUnits, heightUnits, lat, lon, boundsOverride) {
    const bounds = normalizeBounds(boundsOverride) || normalizeBounds(meta?.bounds);

    if (!bounds) {
      return {
        ok: false,
        x: 0,
        y: 0,
        nx: 0,
        ny: 0,
        reason: "invalid bounds",
        source: "latlon"
      };
    }

    const north = Number(bounds.north);
    const south = Number(bounds.south);
    const east = Number(bounds.east);
    const west = Number(bounds.west);

    const latN = Number(lat);
    const lonN = Number(lon);

    if (!Number.isFinite(latN) || !Number.isFinite(lonN)) {
      return {
        ok: false,
        x: 0,
        y: 0,
        nx: 0,
        ny: 0,
        reason: "invalid lat/lon",
        source: "latlon"
      };
    }

    const u = (lonN - west) / (east - west);
    const v = (north - latN) / (north - south);

    const inside = u >= 0 && u <= 1 && v >= 0 && v <= 1;

    const x = (u - 0.5) * widthUnits;
    const y = (0.5 - v) * heightUnits;

    return {
      ok: inside,
      x,
      y,
      nx: u,
      ny: v,
      reason: inside ? "" : "outside bounds",
      source: "latlon"
    };
  }

  function resolveMapOverride(entity, cityId, widthUnits, heightUnits) {
    const raw =
      entity?.city_map_override ??
      entity?.map_override ??
      entity?.cityMapOverride ??
      null;

    if (!raw || typeof raw !== "object") return null;

    const overrideCityId = str(raw.city_id || raw.cityId);
    if (overrideCityId && overrideCityId !== str(cityId)) return null;

    const nx = num(raw.nx);
    const ny = num(raw.ny);

    if (nx !== null && ny !== null) {
      const clampedNx = clamp(nx, 0, 1);
      const clampedNy = clamp(ny, 0, 1);

      return {
        ok: true,
        x: (clampedNx - 0.5) * widthUnits,
        y: (clampedNy - 0.5) * heightUnits,
        nx: clampedNx,
        ny: clampedNy,
        reason: "",
        source: "override:norm"
      };
    }

    const x = num(raw.x);
    const y = num(raw.y);

    if (x !== null && y !== null) {
      const halfW = widthUnits * 0.5;
      const halfH = heightUnits * 0.5;

      const clampedX = clamp(x, -halfW, halfW);
      const clampedY = clamp(y, -halfH, halfH);

      return {
        ok: true,
        x: clampedX,
        y: clampedY,
        nx: (clampedX / widthUnits) + 0.5,
        ny: (clampedY / heightUnits) + 0.5,
        reason: "",
        source: "override:xy"
      };
    }

    return null;
  }

  function projectEntityToMap(meta, widthUnits, heightUnits, entity, cityId, boundsOverride) {
    const override = resolveMapOverride(entity, cityId, widthUnits, heightUnits);
    if (override) return override;

    return cityLatLonToLocalXY(
      meta,
      widthUnits,
      heightUnits,
      entity?.lat,
      entity?.lon,
      boundsOverride
    );
  }

  function ensureCityMapGroup() {
    const st = G.state || {};
    const maps = ensureCityMapState();
    const scene = st.scene;

    if (!scene) return null;
    if (maps.group && maps.group.parent === scene) {
      return maps.group;
    }

    const group = new THREE.Group();
    group.name = "cityMapGroup";
    group.visible = false;
    group.position.set(0, 0, 0.16);

    const surfaceGeo = new THREE.PlaneGeometry(1.6, 1.0, 1, 1);
    const surfaceMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: false,
      opacity: 1.0,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    surfaceMat.userData = surfaceMat.userData || {};
    surfaceMat.userData.__forceTransparent = false;
    storeBaseOpacity(surfaceMat, 1.0);

    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceMesh.name = "cityMapSurface";
    surfaceMesh.position.set(0, 0, 0.002);
    surfaceMesh.renderOrder = 1;
    surfaceMesh.userData = surfaceMesh.userData || {};
    surfaceMesh.userData.type = "cityMapSurface";
    surfaceMesh.userData.nonPickable = true;
    surfaceMesh.raycast = function () {};
    group.add(surfaceMesh);

    const nodeGroup = new THREE.Group();
    nodeGroup.name = "cityMapNodeProjectionLayer";
    nodeGroup.position.set(0, 0, 0.025);
    nodeGroup.renderOrder = 1000;
    nodeGroup.userData = nodeGroup.userData || {};
    nodeGroup.userData.type = "cityMapNodeProjectionLayer";
    nodeGroup.userData.nonPickable = true;
    nodeGroup.raycast = function () {};
    group.add(nodeGroup);

    scene.add(group);

    maps.group = group;
    maps.frameMesh = null;
    maps.surfaceMesh = surfaceMesh;
    maps.nodeGroup = nodeGroup;
    maps.nodes = [];
    maps.nodeMeshes = [];
    maps.entityMeshes = [];
    maps.pickMeshes = [];
    maps.ready = false;
    maps.alpha = 0;
    maps.targetAlpha = 0;

    st.cityMapPickMeshes = maps.pickMeshes;
    st.pickMeshes = maps.pickMeshes;

    return group;
  }

  function applySurfaceGeometry(meta) {
    const maps = ensureCityMapState();
    const surface = maps.surfaceMesh;
    if (!surface) return;

    const size = getPlaneSizeForMeta(meta, maps.imageWidth, maps.imageHeight);
    maps.widthUnits = size.widthUnits;
    maps.heightUnits = size.heightUnits;

    try { surface.geometry?.dispose?.(); } catch {}
    surface.geometry = new THREE.PlaneGeometry(size.widthUnits, size.heightUnits, 1, 1);

    console.log("[city_map] SURFACE GEOMETRY", {
      widthUnits: Number(maps.widthUnits.toFixed(6)),
      heightUnits: Number(maps.heightUnits.toFixed(6)),
      imageWidth: maps.imageWidth,
      imageHeight: maps.imageHeight,
      aspectSource: size.aspectSource
    });
  }

  function applySurfaceTexture(texture) {
    const maps = ensureCityMapState();
    const surface = maps.surfaceMesh;
    if (!surface?.material) return;

    surface.material.map = texture || null;
    surface.material.color.setHex(0xffffff);
    surface.material.transparent = false;
    surface.material.opacity = 1.0;
    surface.material.depthWrite = false;
    surface.material.depthTest = false;
    surface.material.toneMapped = false;
    surface.material.needsUpdate = true;

    const img = texture?.image || null;
    maps.imageWidth = num(img?.width);
    maps.imageHeight = num(img?.height);

    const tex = surface.material.map;
    if (tex) {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;

      const activeCityId =
        str(maps.activeCityId) ||
        str(maps.meta?.city_id) ||
        str(G.state?.activeCityId);

      if (activeCityId === "city_53389926") {
        tex.repeat.set(0.78, 0.92);
        tex.offset.set(0.0, 0.04);
      } else {
        tex.repeat.set(1, 1);
        tex.offset.set(0, 0);
      }

      tex.needsUpdate = true;
    }
  }

  function applyCityMapRotation(meta) {
    const maps = ensureCityMapState();
    if (!maps.group) return;
    const deg = Number.isFinite(Number(meta.rotation_deg)) ? Number(meta.rotation_deg) : 0;
    maps.group.rotation.set(0, 0, (deg * Math.PI) / 180);
  }

  function fitCameraToCityMapPlane() {
    const st = G.state || {};
    const maps = ensureCityMapState();
    const cam = st.camera;
    if (!cam || !maps?.widthUnits || !maps?.heightUnits) return;

    const width = Number(maps.widthUnits);
    const height = Number(maps.heightUnits);
    if (!(width > 0) || !(height > 0)) return;

    const fov = (Number(cam.fov || 38) * Math.PI) / 180;
    const aspect = Number(cam.aspect || 1) || 1;

    const distY = (height * 0.5) / Math.tan(fov * 0.5);
    const distX = (width * 0.5) / (Math.tan(fov * 0.5) * aspect);
    const fitDist = Math.max(distX, distY);
    const margin = 1.25;
    const finalDist = fitDist * margin;

    const groupZ = Number(maps.group?.position?.z || 0);
    st.targetZoom = finalDist + groupZ;

    if (cam.position) {
      cam.position.set(0, 0, finalDist + groupZ);
    }

    maps.zoom = 1;
    maps.panX = 0;
    maps.panY = 0;
    maps.panLimitX = 0;
    maps.panLimitY = 0;

    cam.near = 0.01;
    cam.far = Math.max(100, (finalDist + groupZ) * 10);
    cam.updateProjectionMatrix?.();

    console.log("[city_map] CAMERA FIT", {
      width: Number(width.toFixed(4)),
      height: Number(height.toFixed(4)),
      finalDist: Number(finalDist.toFixed(4)),
      groupZ: Number(groupZ.toFixed(4))
    });
  }

  function clampCityMapPan() {
    const maps = ensureCityMapState();

    const halfW = Number(maps.widthUnits || 0) * 0.5;
    const halfH = Number(maps.heightUnits || 0) * 0.5;
    const zoom = clamp(Number(maps.zoom || 1), Number(maps.minZoom || 1), Number(maps.maxZoom || 2.8));

    const visibleHalfW = halfW / zoom;
    const visibleHalfH = halfH / zoom;

    maps.panLimitX = Math.max(0, halfW - visibleHalfW);
    maps.panLimitY = Math.max(0, halfH - visibleHalfH);

    maps.panX = clamp(Number(maps.panX || 0), -maps.panLimitX, maps.panLimitX);
    maps.panY = clamp(Number(maps.panY || 0), -maps.panLimitY, maps.panLimitY);
  }

  function updateCityMapCamera() {
    const st = G.state || {};
    const maps = ensureCityMapState();
    const cam = st.camera;

    if (!cam || !maps.group) return;

    const baseZ = Number(st.targetZoom || cam.position.z || 2.5);
    const zoom = clamp(Number(maps.zoom || 1), Number(maps.minZoom || 1), Number(maps.maxZoom || 2.8));
    const z = baseZ / zoom;

    clampCityMapPan();

    cam.position.set(Number(maps.panX || 0), Number(maps.panY || 0), z);
    cam.lookAt(Number(maps.panX || 0), Number(maps.panY || 0), 0);

    cam.updateMatrixWorld?.();
  }

  G.setCityMapZoom = function setCityMapZoom(delta) {
    const maps = ensureCityMapState();
    maps.zoom = clamp(
      Number(maps.zoom || 1) + Number(delta || 0),
      Number(maps.minZoom || 1),
      Number(maps.maxZoom || 2.8)
    );

    clampCityMapPan();
    updateCityMapCamera();
  };

  G.panCityMap = function panCityMap(dx, dy) {
    const maps = ensureCityMapState();
    const zoom = clamp(Number(maps.zoom || 1), Number(maps.minZoom || 1), Number(maps.maxZoom || 2.8));
    const panScale = 0.002 / zoom;

    maps.panX = Number(maps.panX || 0) - (Number(dx || 0) * panScale);
    maps.panY = Number(maps.panY || 0) + (Number(dy || 0) * panScale);

    clampCityMapPan();
    updateCityMapCamera();
  };

  function makeNodeCoreMaterial(opacity) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xfff1c2,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    mat.userData = mat.userData || {};
    mat.userData.__forceTransparent = true;
    storeBaseOpacity(mat, opacity);
    return mat;
  }

  function makeNodeInnerGlowMaterial(opacity) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffa347,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    mat.userData = mat.userData || {};
    mat.userData.__forceTransparent = true;
    storeBaseOpacity(mat, opacity);
    return mat;
  }

  function makeNodeOuterGlowMaterial(opacity) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff7a1a,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    mat.userData = mat.userData || {};
    mat.userData.__forceTransparent = true;
    storeBaseOpacity(mat, opacity);
    return mat;
  }

  function makeNodeFlareMaterial(opacity) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffd28a,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    mat.userData = mat.userData || {};
    mat.userData.__forceTransparent = true;
    storeBaseOpacity(mat, opacity);
    return mat;
  }

  function makePickMaterial() {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.001,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    mat.userData = mat.userData || {};
    mat.userData.__forceTransparent = true;
    storeBaseOpacity(mat, 0.001);
    return mat;
  }

  function buildAnchor(entity) {
    const anchor = new THREE.Group();
    anchor.name = `entityNode:${entity.entity_id}`;
    anchor.visible = true;
    anchor.frustumCulled = false;
    anchor.renderOrder = 1001;

    const variant = buildNodeStyleVariant(entity);

    const outerGlowGeo = new THREE.CircleGeometry(
      CITY_MAP_NODE_OUTER_GLOW_RADIUS * variant.scaleJitter,
      32
    );
    const outerGlowMat = makeNodeOuterGlowMaterial(variant.outerOpacity);
    const outerGlowNode = new THREE.Mesh(outerGlowGeo, outerGlowMat);
    outerGlowNode.name = "outerGlowNode";
    outerGlowNode.position.set(0, 0, CITY_MAP_NODE_Z - 0.0012);
    outerGlowNode.renderOrder = 1000;
    outerGlowNode.visible = true;
    outerGlowNode.frustumCulled = false;
    outerGlowNode.userData = {
      type: "cityMapOuterGlowNode",
      city_id: entity.city_id,
      entity_id: entity.entity_id,
      lat: Number(entity?.lat),
      lon: Number(entity?.lon),
      cityMap: true,
      nonPickable: true,
      baseOpacity: variant.outerOpacity
    };
    outerGlowNode.raycast = function () {};
    anchor.add(outerGlowNode);

    const innerGlowGeo = new THREE.CircleGeometry(
      CITY_MAP_NODE_INNER_GLOW_RADIUS * variant.scaleJitter,
      32
    );
    const innerGlowMat = makeNodeInnerGlowMaterial(variant.innerOpacity);
    const innerGlowNode = new THREE.Mesh(innerGlowGeo, innerGlowMat);
    innerGlowNode.name = "innerGlowNode";
    innerGlowNode.position.set(0, 0, CITY_MAP_NODE_Z - 0.0005);
    innerGlowNode.renderOrder = 1001;
    innerGlowNode.visible = true;
    innerGlowNode.frustumCulled = false;
    innerGlowNode.userData = {
      type: "cityMapInnerGlowNode",
      city_id: entity.city_id,
      entity_id: entity.entity_id,
      lat: Number(entity?.lat),
      lon: Number(entity?.lon),
      cityMap: true,
      nonPickable: true,
      baseOpacity: variant.innerOpacity
    };
    innerGlowNode.raycast = function () {};
    anchor.add(innerGlowNode);

    const flareMatA = makeNodeFlareMaterial(variant.flareOpacity);
    const flareGeoA = new THREE.PlaneGeometry(
      CITY_MAP_NODE_FLARE_LENGTH * variant.scaleJitter,
      CITY_MAP_NODE_FLARE_THICKNESS * variant.scaleJitter
    );
    const flareNodeA = new THREE.Mesh(flareGeoA, flareMatA);
    flareNodeA.name = "flareNodeA";
    flareNodeA.position.set(0, 0, CITY_MAP_NODE_Z - 0.0002);
    flareNodeA.rotation.z = variant.flareRotation;
    flareNodeA.renderOrder = 1001;
    flareNodeA.visible = true;
    flareNodeA.frustumCulled = false;
    flareNodeA.userData = {
      type: "cityMapFlareNode",
      city_id: entity.city_id,
      entity_id: entity.entity_id,
      lat: Number(entity?.lat),
      lon: Number(entity?.lon),
      cityMap: true,
      nonPickable: true,
      baseOpacity: variant.flareOpacity
    };
    flareNodeA.raycast = function () {};
    anchor.add(flareNodeA);

    const flareMatB = makeNodeFlareMaterial(variant.flareOpacity * 0.82);
    const flareGeoB = new THREE.PlaneGeometry(
      (CITY_MAP_NODE_FLARE_LENGTH * 0.72) * variant.scaleJitter,
      (CITY_MAP_NODE_FLARE_THICKNESS * 0.82) * variant.scaleJitter
    );
    const flareNodeB = new THREE.Mesh(flareGeoB, flareMatB);
    flareNodeB.name = "flareNodeB";
    flareNodeB.position.set(0, 0, CITY_MAP_NODE_Z - 0.0001);
    flareNodeB.rotation.z = variant.flareRotation + (Math.PI * 0.5);
    flareNodeB.renderOrder = 1001;
    flareNodeB.visible = true;
    flareNodeB.frustumCulled = false;
    flareNodeB.userData = {
      type: "cityMapFlareNode",
      city_id: entity.city_id,
      entity_id: entity.entity_id,
      lat: Number(entity?.lat),
      lon: Number(entity?.lon),
      cityMap: true,
      nonPickable: true,
      baseOpacity: variant.flareOpacity * 0.82
    };
    flareNodeB.raycast = function () {};
    anchor.add(flareNodeB);

    const coreGeo = new THREE.CircleGeometry(
      CITY_MAP_NODE_CORE_RADIUS * variant.scaleJitter,
      32
    );
    const coreMat = makeNodeCoreMaterial(variant.coreOpacity);
    const visibleNode = new THREE.Mesh(coreGeo, coreMat);
    visibleNode.name = "visibleNode";
    visibleNode.position.set(0, 0, CITY_MAP_NODE_Z);
    visibleNode.renderOrder = 1002;
    visibleNode.visible = true;
    visibleNode.frustumCulled = false;
    visibleNode.userData = {
      type: "cityMapVisibleNode",
      city_id: entity.city_id,
      entity_id: entity.entity_id,
      lat: Number(entity?.lat),
      lon: Number(entity?.lon),
      cityMap: true,
      nonPickable: true,
      baseOpacity: variant.coreOpacity
    };
    visibleNode.raycast = function () {};
    anchor.add(visibleNode);

    const pickGeo = new THREE.CircleGeometry(CITY_MAP_PICK_RADIUS, 20);
    const pickMat = makePickMaterial();
    const pickMesh = new THREE.Mesh(pickGeo, pickMat);
    pickMesh.name = "pickMesh";
    pickMesh.position.set(0, 0, CITY_MAP_PICK_Z);
    pickMesh.renderOrder = 1001;
    pickMesh.visible = true;
    pickMesh.frustumCulled = false;
    pickMesh.userData = {
      type: "entityNode",
      city_id: entity.city_id,
      entity_id: entity.entity_id,
      lat: Number(entity?.lat),
      lon: Number(entity?.lon),
      cityMap: true,
      node: entity,
      entity,
      sourceData: entity,
      black_dragon_dossier: entity?.black_dragon_dossier || null,
      _live_account_source: entity?._live_account_source || ""
    };
    anchor.add(pickMesh);

    anchor.userData = {
      type: "entityNodeAnchor",
      city_id: entity.city_id,
      entity_id: entity.entity_id,
      lat: Number(entity?.lat),
      lon: Number(entity?.lon),
      cityMap: true,
      node: entity,
      entity,
      sourceData: entity,
      black_dragon_dossier: entity?.black_dragon_dossier || null,
      _live_account_source: entity?._live_account_source || "",
      nodeVariant: variant
    };

    return { anchor, visibleNode, pickMesh };
  }

  function buildCityMapNodes(cityId, meta) {
    const st = G.state || {};
    const maps = ensureCityMapState();
    const nodeGroup = maps.nodeGroup;
    if (!nodeGroup) return false;

    ensureCityMapDebug();

    clearNodeGroup(nodeGroup);
    maps.nodes.length = 0;
    maps.nodeMeshes.length = 0;
    maps.entityMeshes.length = 0;
    maps.pickMeshes.length = 0;
    maps.lastProjectionReport = [];

    const DBG = G.debugCityMap;
    const projectionBounds = getProjectionBounds(meta, maps, maps.texture);

    const allEntities = resolveEntitiesForCity(cityId);

    const cityFiltered = allEntities.filter((e) => {
      const ok = str(e?.city_id || e?.cityId) === str(cityId);
      e._debugValidCity = ok;
      return ok;
    });

    const validEntitiesRaw = cityFiltered.filter((e) => {
      const lat = Number(e?.lat);
      const lon = Number(e?.lon);
      const ok = Number.isFinite(lat) && Number.isFinite(lon);
      e._debugValidLatLon = ok;
      return ok;
    });

    const blackDragonEntities = validEntitiesRaw.filter((e) => {
      const rank = e?.black_dragon_rank || {};
      const classification = String(rank.target_classification || "").toUpperCase();
      const band = String(rank.priority_band || "").toUpperCase();

      const isVerified = classification === "VERIFIED_TARGET";
      const isExpanded = classification === "EXPANDED_TARGET";
      const isHighPriority = band === "PRIORITY_A" || band === "PRIORITY_B";

      return isVerified || (isExpanded && isHighPriority);
    });

    const validEntities =
      window.UMBRA_CLIENT_KEY === "black_dragon" && blackDragonEntities.length
        ? blackDragonEntities
        : validEntitiesRaw;

    DBG?.begin({
      stage: "BUILD_CITY_MAP_NODES",
      activeCityId: cityId,
      cityMeta: meta,
      cityMapState: maps
    });

    DBG?.candidates({
      totalReceived: allEntities.length,
      afterCityFilter: cityFiltered.length,
      afterLatLonFilter: validEntitiesRaw.length,
      afterClientFilter: validEntities.length,
      rows: validEntities
    });

    let placed = 0;
    let outside = 0;
    let skippedInvalid = 0;

    for (const entity of validEntities) {
      const entityId = str(entity?.entity_id || entity?.entityId);
      if (!entityId) {
        skippedInvalid++;
        continue;
      }

      const proj = projectEntityToMap(
        meta,
        maps.widthUnits,
        maps.heightUnits,
        entity,
        cityId,
        projectionBounds
      );

      const boundsReason = [];
      if (!Number.isFinite(Number(proj?.nx)) || !Number.isFinite(Number(proj?.ny))) {
        boundsReason.push("NON_FINITE_UV");
      } else {
        if (Number(proj.nx) < 0) boundsReason.push("WEST_OOB");
        if (Number(proj.nx) > 1) boundsReason.push("EAST_OOB");
        if (Number(proj.ny) < 0) boundsReason.push("NORTH_OOB");
        if (Number(proj.ny) > 1) boundsReason.push("SOUTH_OOB");
      }

      const projectionRow = {
        cityId,
        entityId,
        lat: num(entity?.lat),
        lon: num(entity?.lon),
        ok: !!proj.ok,
        reason: str(proj.reason),
        source: str(proj.source || "unknown"),
        nx: proj.nx,
        ny: proj.ny
      };
      maps.lastProjectionReport.push(projectionRow);

      console.log("[city_map] PROJECTION", {
        cityId,
        entityId,
        lat: projectionRow.lat,
        lon: projectionRow.lon,
        ok: projectionRow.ok,
        reason: projectionRow.reason,
        source: projectionRow.source,
        nx: projectionRow.nx,
        ny: projectionRow.ny
      });

      if (!proj.ok) {
        outside++;
        console.warn("[city_map] entity outside bounds", {
          cityId,
          entityId,
          lat: entity?.lat,
          lon: entity?.lon,
          reason: proj.reason,
          nx: Number(proj.nx?.toFixed?.(6) || proj.nx),
          ny: Number(proj.ny?.toFixed?.(6) || proj.ny),
          source: str(proj.source || "latlon"),
        });

        DBG?.projectedRow({
          entity_id: entityId,
          city_id: str(entity?.city_id || entity?.cityId),
          lat: entity?.lat,
          lon: entity?.lon,
          u: proj.nx,
          v: proj.ny,
          x: null,
          y: null,
          z: null,
          outOfBounds: true,
          boundsReason
        });

        continue;
      }

      const built = buildAnchor(entity);
      const anchor = built.anchor;
      const visibleNode = built.visibleNode;
      const pickMesh = built.pickMesh;

      anchor.position.set(proj.x, proj.y, 0);
      anchor.scale.set(CITY_MAP_MARKER_BASE_SCALE, CITY_MAP_MARKER_BASE_SCALE, 1);
      anchor.visible = true;
      anchor.frustumCulled = false;
      anchor.renderOrder = 1001;

      anchor.userData = anchor.userData || {};
      anchor.userData.projectedX = proj.x;
      anchor.userData.projectedY = proj.y;
      anchor.userData.projectedZ = 0;
      anchor.userData.projectionOK = !!proj.ok;
      anchor.userData.projectionSource = str(proj.source || "unknown");
      anchor.userData.projectionNX = Number.isFinite(Number(proj.nx)) ? Number(proj.nx) : null;
      anchor.userData.projectionNY = Number.isFinite(Number(proj.ny)) ? Number(proj.ny) : null;

      visibleNode.userData = visibleNode.userData || {};
      visibleNode.userData.projectedX = proj.x;
      visibleNode.userData.projectedY = proj.y;
      visibleNode.userData.projectedZ = CITY_MAP_NODE_Z;
      visibleNode.userData.anchorX = proj.x;
      visibleNode.userData.anchorY = proj.y;
      visibleNode.userData.anchorZ = 0;
      visibleNode.userData.projectionOK = !!proj.ok;
      visibleNode.userData.projectionSource = str(proj.source || "unknown");
      visibleNode.userData.projectionNX = Number.isFinite(Number(proj.nx)) ? Number(proj.nx) : null;
      visibleNode.userData.projectionNY = Number.isFinite(Number(proj.ny)) ? Number(proj.ny) : null;

      pickMesh.userData = pickMesh.userData || {};
      pickMesh.userData.projectedX = proj.x;
      pickMesh.userData.projectedY = proj.y;
      pickMesh.userData.projectedZ = CITY_MAP_PICK_Z;
      pickMesh.userData.anchorX = proj.x;
      pickMesh.userData.anchorY = proj.y;
      pickMesh.userData.anchorZ = 0;
      pickMesh.userData.projectionOK = !!proj.ok;
      pickMesh.userData.projectionSource = str(proj.source || "unknown");
      pickMesh.userData.projectionNX = Number.isFinite(Number(proj.nx)) ? Number(proj.nx) : null;
      pickMesh.userData.projectionNY = Number.isFinite(Number(proj.ny)) ? Number(proj.ny) : null;

      anchor.traverse?.((o) => {
        o.visible = true;
        o.frustumCulled = false;
        if (o.name === "visibleNode") o.renderOrder = 1002;
        else if (o.name === "pickMesh") o.renderOrder = 1001;
        else o.renderOrder = 1001;

        if (o.material) {
          o.material.depthTest = false;
          o.material.depthWrite = false;
          o.material.needsUpdate = true;
        }
      });

      nodeGroup.add(anchor);
      maps.pickMeshes.push(pickMesh);

      DBG?.projectedRow({
        entity_id: entityId,
        city_id: str(entity?.city_id || entity?.cityId),
        lat: entity?.lat,
        lon: entity?.lon,
        u: proj.nx,
        v: proj.ny,
        x: proj.x,
        y: proj.y,
        z: 0,
        outOfBounds: false,
        boundsReason: []
      });

      placed++;
    }

    nodeGroup.visible = true;
    nodeGroup.frustumCulled = false;

    syncNodeRegistriesFromGroup();

    if (!maps.pickMeshes.length) {
      console.error("[city_map] PICK MESHES EMPTY AFTER BUILD", {
        cityId,
        entitiesResolved: validEntities.length,
        outsideBounds: outside
      });
    }

    console.log("[city_map] NODES BUILT", {
      cityId,
      placed,
      outsideBounds: outside,
      nodeAnchors: maps.nodes.length,
      nodeMeshes: maps.nodeMeshes.length,
      entityMeshes: maps.entityMeshes.length,
      pickMeshes: maps.pickMeshes.length
    });

    DBG?.end({
      renderedNodeCount: placed,
      pickMeshCount: Array.isArray(maps.pickMeshes) ? maps.pickMeshes.length : 0,
      skippedOutOfBounds: outside,
      skippedInvalid
    });

    return true;
  }

  function applySelectionHighlight(entityId) {
    const st = G.state || {};
    const maps = ensureCityMapState();
    const active = str(entityId);

    syncNodeRegistriesFromGroup();

    for (const pickMesh of maps.pickMeshes) {
      const eid = str(pickMesh?.userData?.entity_id);
      const anchor = pickMesh?.parent || null;
      const visibleNode = anchor?.children?.find?.((c) => c?.name === "visibleNode") || null;
      const innerGlowNode = anchor?.children?.find?.((c) => c?.name === "innerGlowNode") || null;
      const outerGlowNode = anchor?.children?.find?.((c) => c?.name === "outerGlowNode") || null;
      const flareNodeA = anchor?.children?.find?.((c) => c?.name === "flareNodeA") || null;
      const flareNodeB = anchor?.children?.find?.((c) => c?.name === "flareNodeB") || null;
      const selected = !!active && eid === active;

      const variant = anchor?.userData?.nodeVariant || {};

      if (anchor) {
        const targetScale = selected ? CITY_MAP_MARKER_SELECTED_SCALE : CITY_MAP_MARKER_BASE_SCALE;
        anchor.scale.set(targetScale, targetScale, 1);
        anchor.visible = true;
        anchor.frustumCulled = false;
        anchor.renderOrder = 1001;
      }

      if (visibleNode?.material) {
        visibleNode.material.color.setHex(selected ? 0xffffdf : 0xfff1c2);
        visibleNode.material.opacity = selected
          ? Math.min(1.0, (variant.coreOpacity || 0.9) * 1.18)
          : (variant.coreOpacity || 0.9);
        visibleNode.material.depthTest = false;
        visibleNode.material.depthWrite = false;
        visibleNode.material.needsUpdate = true;
      }

      if (innerGlowNode?.material) {
        innerGlowNode.material.color.setHex(selected ? 0xffcf82 : 0xffa347);
        innerGlowNode.material.opacity = selected
          ? Math.min(0.82, (variant.innerOpacity || 0.38) * 1.22)
          : (variant.innerOpacity || 0.38);
        innerGlowNode.material.depthTest = false;
        innerGlowNode.material.depthWrite = false;
        innerGlowNode.material.needsUpdate = true;
      }

      if (outerGlowNode?.material) {
        outerGlowNode.material.color.setHex(selected ? 0xffa347 : 0xff7a1a);
        outerGlowNode.material.opacity = selected
          ? Math.min(0.38, (variant.outerOpacity || 0.11) * 1.25)
          : (variant.outerOpacity || 0.11);
        outerGlowNode.material.depthTest = false;
        outerGlowNode.material.depthWrite = false;
        outerGlowNode.material.needsUpdate = true;
      }

      if (flareNodeA?.material) {
        flareNodeA.material.color.setHex(selected ? 0xffffe8 : 0xffd28a);
        flareNodeA.material.opacity = selected
          ? Math.min(0.28, (variant.flareOpacity || 0.12) * 1.35)
          : (variant.flareOpacity || 0.12);
        flareNodeA.material.depthTest = false;
        flareNodeA.material.depthWrite = false;
        flareNodeA.material.needsUpdate = true;
      }

      if (flareNodeB?.material) {
        flareNodeB.material.color.setHex(selected ? 0xffffe8 : 0xffd28a);
        flareNodeB.material.opacity = selected
          ? Math.min(0.22, ((variant.flareOpacity || 0.12) * 0.82) * 1.35)
          : ((variant.flareOpacity || 0.12) * 0.82);
        flareNodeB.material.depthTest = false;
        flareNodeB.material.depthWrite = false;
        flareNodeB.material.needsUpdate = true;
      }

      if (pickMesh?.material) {
        pickMesh.material.opacity = 0.001;
        pickMesh.material.depthTest = false;
        pickMesh.material.depthWrite = false;
        pickMesh.material.needsUpdate = true;
      }
    }

    maps.lastSelectionEntityId = active || null;
    st.activeEntityId = active || null;
  }

  G.setCityMapSelection = function setCityMapSelection(entityId) {
    applySelectionHighlight(entityId);
  };

  G.clearCityMapSelection = function clearCityMapSelection() {
    const st = G.state || {};
    applySelectionHighlight(null);

    // HARD CLEAR
    st.activeEntityId = null;
    st.selectedMesh = null;

    const maps = ensureCityMapState();
    maps.lastSelectionEntityId = null;
  };

  G.getCityMapProjectionReport = function getCityMapProjectionReport() {
    const maps = ensureCityMapState();
    return Array.isArray(maps.lastProjectionReport)
      ? maps.lastProjectionReport.slice()
      : [];
  };

  G.syncCityMapFromState = function syncCityMapFromState(payload) {
    const st = G.state || {};
    const maps = ensureCityMapState();
    ensureCityMapGroup();

    const cityId = str(payload?.cityId || st.activeCityId);
    const metaRaw = payload?.meta || st.activeCityMeta || null;
    const texture = payload?.texture || st.activeCityTexture || null;

    if (!cityId || !metaRaw || !texture) {
      console.warn("[city_map] sync skipped: missing city/meta/texture", {
        cityId,
        hasMeta: !!metaRaw,
        hasTexture: !!texture,
      });
      return false;
    }

    let meta;
    try {
      meta = validateMeta(metaRaw, cityId);
    } catch (e) {
      console.error("[city_map] invalid meta", e);
      return false;
    }

    maps.activeCityId = cityId;
    maps.meta = meta;
    maps.texture = texture;
    st.cityMeta = meta;
    st.activeCityMeta = meta;

    applySurfaceTexture(texture);

    const resolvedBounds = resolveRasterBounds(meta, maps, texture);
    maps.rasterBounds = normalizeBounds(resolvedBounds?.bounds);
    maps.rasterBoundsSource = str(resolvedBounds?.source || "meta");

    applySurfaceGeometry(meta);
    applyCityMapRotation(meta);
    buildCityMapNodes(cityId, meta);
    fitCameraToCityMapPlane();
    syncNodeRegistriesFromGroup();

    if (!maps.pickMeshes.length) {
      console.warn("[city_map] EMPTY BUILD → forcing rebuild", { cityId });
      buildCityMapNodes(cityId, meta);
      fitCameraToCityMapPlane();
      syncNodeRegistriesFromGroup();
    }

    maps.ready = true;
    maps.targetAlpha = String(st.mode || "").toUpperCase() === "CITY_MAP" ? 1 : 0;
    maps.alpha = maps.targetAlpha;
    if (maps.group) maps.group.visible = maps.targetAlpha > 0;
    if (maps.nodeGroup) maps.nodeGroup.visible = maps.targetAlpha > 0;

    maps.lastBuildKey = `${cityId}|${Number(meta.width_m)}|${Number(meta.height_m)}|${maps.pickMeshes.length}`;

    // HARD ENTRY SYNC
    const eid = String(st.activeEntityId || "").trim() || null;
    maps.lastSelectionEntityId = eid;
    applySelectionHighlight(eid);

    updateCityMapCamera();
    syncNodeRegistriesFromGroup();

    console.log("[city_map] READY", {
      cityId,
      widthUnits: Number(maps.widthUnits.toFixed(4)),
      heightUnits: Number(maps.heightUnits.toFixed(4)),
      nodes: maps.nodes.length,
      nodeMeshes: maps.nodeMeshes.length,
      entityMeshes: maps.entityMeshes.length,
      picks: maps.pickMeshes.length,
      rasterBounds: maps.rasterBounds,
      rasterBoundsSource: maps.rasterBoundsSource
    });

    return true;
  };

  G.clearCityMap = function clearCityMap(reason) {
    const st = G.state || {};
    const maps = ensureCityMapState();

    maps.ready = false;
    maps.activeCityId = null;
    maps.meta = null;
    maps.texture = null;
    maps.imageWidth = null;
    maps.imageHeight = null;
    maps.rasterBounds = null;
    maps.rasterBoundsSource = "";
    maps.lastBuildKey = "";
    maps.lastSelectionEntityId = null;
    maps.targetAlpha = 0;
    maps.alpha = 0;
    maps.lastProjectionReport.length = 0;
    maps.zoom = 1;
    maps.panX = 0;
    maps.panY = 0;
    maps.panLimitX = 0;
    maps.panLimitY = 0;

    // HARD CLEAR SELECTION STATE
    G.clearCityMapSelection?.();
    st.activeEntityId = null;
    st.selectedMesh = null;

    clearNodeGroup(maps.nodeGroup);
    maps.nodes.length = 0;
    maps.nodeMeshes.length = 0;
    maps.entityMeshes.length = 0;
    maps.pickMeshes.length = 0;
    st.cityMapPickMeshes = maps.pickMeshes;
    st.pickMeshes = [];
    st.cityMeta = null;
    st.activeCityMeta = null;

    if (maps.group) {
      maps.group.visible = false;
    }
    if (maps.nodeGroup) {
      maps.nodeGroup.visible = false;
    }

    if (maps.surfaceMesh?.material) {
      maps.surfaceMesh.material.map = null;
      maps.surfaceMesh.material.color.setHex(0x000000);
      maps.surfaceMesh.material.transparent = false;
      maps.surfaceMesh.material.opacity = 1.0;
      maps.surfaceMesh.material.depthWrite = false;
      maps.surfaceMesh.material.depthTest = false;
      maps.surfaceMesh.material.toneMapped = false;
      maps.surfaceMesh.material.needsUpdate = true;
    }

    console.log("[city_map] CLEARED", { reason: str(reason) || "unspecified" });
  };

  G.updateCityMap = function updateCityMap() {
    const st = G.state || {};
    const maps = ensureCityMapState();
    ensureCityMapGroup();
    syncNodeRegistriesFromGroup();

    const mode = String(st.mode || "").toUpperCase();

    if (mode === "CITY_MAP") {
      if (st.globeMesh) st.globeMesh.visible = false;
      if (st.veinsMesh) st.veinsMesh.visible = false;
      if (st.edgeGlowMesh) st.edgeGlowMesh.visible = false;
      if (st.outerHaloMesh) st.outerHaloMesh.visible = false;
      if (st.starfieldMesh) st.starfieldMesh.visible = false;

      if (st.scene) {
        st.scene.traverse((obj) => {
          if (!obj || !obj.isMesh) return;
          if (
            obj.name === "atmoMesh" ||
            obj.userData?.type === "atmosphere" ||
            obj.name === "cloudMesh" ||
            obj.name === "atmoHaloMesh" ||
            obj.userData?.type === "atmoHalo"
          ) {
            obj.visible = false;
          }
        });
      }
    }

    if (mode === "CITY_MAP" && maps.ready) {
      maps.targetAlpha = 1;
      maps.alpha = 1;
      if (maps.group) maps.group.visible = true;
      if (maps.nodeGroup) maps.nodeGroup.visible = true;
      return;
    }

    maps.targetAlpha = 0;
    if (mode !== "CITY_MAP" && maps.group) {
      maps.group.visible = maps.alpha > 0.001;
    }
  };

  G.tickCityMap = function tickCityMap(dt) {
    if (String(G.state?.mode || "").toUpperCase() === "CITY_MAP") {
      const st = G.state || {};

      if (st.globeMesh) st.globeMesh.visible = false;
      if (st.veinsMesh) st.veinsMesh.visible = false;
      if (st.edgeGlowMesh) st.edgeGlowMesh.visible = false;
      if (st.outerHaloMesh) st.outerHaloMesh.visible = false;
      if (st.starfieldMesh) st.starfieldMesh.visible = false;

      if (st.scene) {
        st.scene.traverse((obj) => {
          if (!obj || !obj.isMesh) return;
          if (
            obj.name === "atmoMesh" ||
            obj.userData?.type === "atmosphere" ||
            obj.name === "cloudMesh" ||
            obj.name === "atmoHaloMesh" ||
            obj.userData?.type === "atmoHalo"
          ) {
            obj.visible = false;
          }
        });
      }
    }

    const maps = ensureCityMapState();
    if (!maps.group) return;

    syncNodeRegistriesFromGroup();

    const mode = String(G.state?.mode || "").toUpperCase();

    if (mode === "CITY_MAP" && maps.ready) {
      maps.alpha = 1;
      maps.targetAlpha = 1;
      maps.group.visible = true;
      if (maps.nodeGroup) maps.nodeGroup.visible = true;

      setMaterialOpacity(maps.surfaceMesh, 1);
      if (maps.nodeGroup) {
        setMaterialOpacity(maps.nodeGroup, 1);
      }

      maps.group.scale.set(1, 1, 1);
      return;
    }

    const speed = Math.max(0.01, Math.min(1, Number(dt || 0.016) * 7));
    const target = maps.targetAlpha;
    const next = maps.alpha + (target - maps.alpha) * speed;

    maps.alpha = Math.abs(target - next) < 0.001 ? target : next;

    if (maps.alpha <= 0.001 && target <= 0) {
      maps.group.visible = false;
      return;
    }

    maps.group.visible = true;

    setMaterialOpacity(maps.surfaceMesh, maps.alpha);
    if (maps.nodeGroup) {
      setMaterialOpacity(maps.nodeGroup, 1);
    }

    const s = 0.975 + (maps.alpha * 0.025);
    maps.group.scale.set(s, s, 1);
  };

  G.projectEntityToCityMap = function projectEntityToCityMap(entity) {
    const maps = ensureCityMapState();
    if (!maps.meta || !maps.ready) return null;

    const projectionBounds = getProjectionBounds(maps.meta, maps, maps.texture);

    return projectEntityToMap(
      maps.meta,
      maps.widthUnits,
      maps.heightUnits,
      entity,
      maps.meta.city_id,
      projectionBounds
    );
  };

  G.projectCityMapLatLon = function projectCityMapLatLon(lat, lon, metaOverride) {
    const maps = ensureCityMapState();
    const meta = metaOverride || maps.meta || G.state?.cityMeta || null;
    if (!meta || !maps.ready) return null;

    const projectionBounds = getProjectionBounds(meta, maps, maps.texture);
    const result = cityLatLonToLocalXY(
      meta,
      maps.widthUnits,
      maps.heightUnits,
      lat,
      lon,
      projectionBounds
    );

    return {
      x: result.x,
      y: result.y,
      nx: result.nx,
      ny: result.ny,
      withinBounds: result.ok === true,
      reason: result.reason || "",
      source: result.source || "latlon"
    };
  };

  G.createCityMapNode = function createCityMapNode(payload) {
    const entity = {
      entity_id: str(payload?.entity_id),
      city_id: str(payload?.city_id),
      lat: num(payload?.lat),
      lon: num(payload?.lon)
    };

    if (!entity.entity_id || !entity.city_id) return null;

    const built = buildAnchor(entity);
    const anchor = built.anchor;

    anchor.userData = Object.assign({}, anchor.userData || {}, {
      industry_id: str(payload?.industry_id || ""),
      organization_type: str(payload?.organization_type || ""),
      precision: str(payload?.precision || ""),
      umbra_score: num(payload?.umbra_score),
      node_label: str(payload?.node_label || entity.entity_id),
      node_priority: num(payload?.node_priority),
      dossier_ready: payload?.dossier_ready === true
    });

    built.visibleNode.userData = Object.assign({}, built.visibleNode.userData || {}, anchor.userData);
    built.pickMesh.userData = Object.assign({}, built.pickMesh.userData || {}, anchor.userData);

    return anchor;
  };

  G.registerCityMapPick = function registerCityMapPick({ mesh, entity_id, city_id, industry_id }) {
    const maps = ensureCityMapState();
    const nodeGroup = maps.nodeGroup;
    if (!mesh || !nodeGroup) return null;

    const anchor = mesh;
    const pickMesh =
      anchor?.children?.find?.((c) => c?.name === "pickMesh") ||
      null;
    const visibleNode =
      anchor?.children?.find?.((c) => c?.name === "visibleNode") ||
      null;

    if (!pickMesh) return null;

    if (!anchor.parent) {
      nodeGroup.add(anchor);
    }

    anchor.userData = Object.assign({}, anchor.userData || {}, {
      entity_id: str(entity_id || anchor.userData?.entity_id),
      city_id: str(city_id || anchor.userData?.city_id),
      industry_id: str(industry_id || anchor.userData?.industry_id || "")
    });

    if (visibleNode) {
      visibleNode.userData = Object.assign({}, visibleNode.userData || {}, {
        entity_id: str(entity_id || visibleNode.userData?.entity_id || anchor.userData?.entity_id),
        city_id: str(city_id || visibleNode.userData?.city_id || anchor.userData?.city_id),
        industry_id: str(industry_id || visibleNode.userData?.industry_id || "")
      });
    }

    pickMesh.userData = Object.assign({}, pickMesh.userData || {}, {
      entity_id: str(entity_id || pickMesh.userData?.entity_id),
      city_id: str(city_id || pickMesh.userData?.city_id),
      industry_id: str(industry_id || pickMesh.userData?.industry_id || ""),
      type: "entityNode",
      cityMap: true
    });

    syncNodeRegistriesFromGroup();

    if (!maps.pickMeshes.includes(pickMesh)) {
      maps.pickMeshes.push(pickMesh);
    }

    syncNodeRegistriesFromGroup();

    return pickMesh;
  };
})();