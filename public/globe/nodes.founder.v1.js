// public/globe/nodes.founder.v1.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) return console.error("[nodes.founder.v1] window.UmbraGlobe missing.");
  if (!window.THREE) return console.error("[nodes.founder.v1] window.THREE missing.");

  console.log("[SIGNATURE] globe/nodes.founder.v1.js LOADED", new Date().toISOString());

  if (!G.state || typeof G.state !== "object") {
    console.error("[nodes.founder.v1] G.state missing.");
    return;
  }

  if (typeof G.state.nodesEnabled !== "boolean") G.state.nodesEnabled = true;

  (function lockLatLonMath() {
    function latLonToDir(latDeg, lonDeg) {
      const lat = Number(latDeg);
      const lon = Number(lonDeg);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        console.error("[nodes] INVALID LAT/LON", latDeg, lonDeg);
        return new THREE.Vector3(0, 0, 1);
      }

      const lonOffsetDeg = Number(
        G.state?._lonOffsetLocked
          ? G.state._lonOffsetLockedValue
          : (G.state?.lonOffsetDeg ?? 0)
      );
      const lockedLon = Number.isFinite(lonOffsetDeg) ? lonOffsetDeg : 0;

      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lon + lockedLon) * Math.PI) / 180;

      const sinPhi = Math.sin(phi);
      const x = sinPhi * Math.sin(theta);
      const z = sinPhi * Math.cos(theta);
      const y = Math.cos(phi);

      return new THREE.Vector3(x, y, z).normalize();
    }

    try {
      Object.defineProperty(G, "latLonToDir", {
        value: latLonToDir,
        writable: false,
        configurable: false,
        enumerable: true
      });
    } catch {
      G.latLonToDir = latLonToDir;
    }
  })();

  function ensureHierarchyGroups() {
    const st = G.state;
    const wg = st?.worldGroup;
    const scn = st?.scene;

    if (!wg) {
      console.error("[nodes] worldGroup missing.");
      return null;
    }

    if (scn && wg.parent !== scn) {
      console.error("[nodes] worldGroup parent mismatch", {
        hasScene: !!scn,
        worldGroupParent: wg.parent?.name || null,
        expectedParent: scn?.name || "scene"
      });
      return null;
    }

    if (!st.citiesGroup) {
      const cg = new THREE.Group();
      cg.name = "citiesGroup";
      st.citiesGroup = cg;
      wg.add(cg);
    } else if (st.citiesGroup.parent !== wg) {
      try { st.citiesGroup.parent?.remove?.(st.citiesGroup); } catch {}
      wg.add(st.citiesGroup);
    }

    if (!st.entitiesGroup) {
      const eg = new THREE.Group();
      eg.name = "entitiesGroup";
      st.entitiesGroup = eg;
      wg.add(eg);
    } else if (st.entitiesGroup.parent !== wg) {
      try { st.entitiesGroup.parent?.remove?.(st.entitiesGroup); } catch {}
      wg.add(st.entitiesGroup);
    }

    return wg;
  }

  function clearGroup(group) {
    if (!group) return;
    while (group.children.length) {
      const child = group.children[0];
      group.remove(child);
      try { child.geometry?.dispose?.(); } catch {}
      try {
        if (Array.isArray(child.material)) {
          for (const m of child.material) m?.dispose?.();
        } else {
          child.material?.dispose?.();
        }
      } catch {}
    }
  }

  function wrapLon180(lon) {
    let x = Number(lon);
    x = ((x + 180) % 360 + 360) % 360 - 180;
    if (x === 180) x = -180;
    return x;
  }

  function placeOnGlobe(mesh, lat, lon, radiusScalar) {
    const rawLat = Number(lat);
    const rawLon = wrapLon180(Number(lon));
    const dir = G.latLonToDir(rawLat, rawLon).clone().normalize();

    mesh.userData.lat = rawLat;
    mesh.userData.lon = rawLon;
    mesh.userData.dir = Object.freeze(dir.clone());

    mesh.position.copy(dir).multiplyScalar(radiusScalar);
  }

  function normalizeScore100(v, fallback = 50) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    if (n <= 1.00001) return Math.max(0, Math.min(100, n * 100));
    return Math.max(0, Math.min(100, n));
  }

  function clamp01(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  function readEntityScore(entity) {
    return normalizeScore100(entity?.scores?.umbraScore, 50);
  }

  function citySort(a, b) {
    const an = String(a?.name || "").localeCompare(String(b?.name || ""));
    if (an !== 0) return an;
    return String(a?.city_id || "").localeCompare(String(b?.city_id || ""));
  }

  function entitySort(a, b) {
    return String(a?.entity_id || "").localeCompare(String(b?.entity_id || ""));
  }

  const CITY_LABEL_ASSET_IDS = new Set([
    "city_756cb4ea", "city_6cabf985", "city_7eb25064", "city_a324d561",
    "city_a7350aab", "city_95b0c3ba", "city_5090c3c6", "city_4c180874",
    "city_328b326a", "city_85e83faa", "city_5abab5f6", "city_39d61699",
    "city_6536761e", "city_990961e3", "city_47b59fac", "city_c94decbe",
    "city_0a922e63", "city_1ae44e4f", "city_7e936870",
    "city_828fab47", "city_f03b8f57", "city_0a31d438", "city_1f98af58",
    "city_8e6f63cf", "city_c79509a4", "city_7d043dae", "city_53389926",
    "city_3fad7905", "city_1fd1b37f", "city_154a8fe9", "city_b5ad2562",
    "city_3d50f2fd", "city_8f664c09", "city_a2cbee70", "city_127606b4",
    "city_01f3a5ed", "city_8635d5db", "city_ab77b2a8", "city_16f77904",
    "city_47748120", "city_c27d5d7f", "city_dd17b133", "city_d2941d41",
    "city_759cd460", "city_b7ea02a9", "city_af6fd06c", "city_b903b4d0",
    "city_936b7d90", "city_29cb8e76", "city_5fedc010"
  ]);

  function shortCityLabel(city) {
    return String(city?.name || city?.location?.city || city?.city || "")
      .replace(/,\s*[A-Z]{2}$/i, "")
      .trim();
  }

  function makeCityLabelSprite(city) {
    const label = shortCityLabel(city);
    if (!label) return null;

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 72;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(5, 8, 10, 0.72)";
    ctx.strokeStyle = "rgba(255, 180, 92, 0.72)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(10, 10, 236, 46, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = "700 18px Arial";
    ctx.fillStyle = "rgba(255, 218, 175, 0.96)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label.toUpperCase(), 128, 34, 218);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;

    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      depthTest: false,
      toneMapped: false
    });

    const sprite = new THREE.Sprite(mat);
    sprite.name = `cityLabel:${city.city_id}`;
    sprite.scale.set(0.09, 0.026, 1);
    sprite.position.set(0, 0.032, 0);
    sprite.renderOrder = 30;

    // Important: do NOT put city_id on the label itself.
    // This forces picking to resolve to the parent city node, not the floating label sprite.
    sprite.userData = {
      type: "cityLabel",
      pickable: false,
      node: city,
      sourceData: city
    };

    return sprite;
  }

  function makeCityMesh(city, radius) {
    const geo = new THREE.SphereGeometry(radius * 0.55, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffa347,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = `cityNode:${city.city_id}`;

    mesh.userData = {
      type: "cityNode",
      city_id: city.city_id,
      cityId: city.city_id,
      node: city,
      sourceData: city
    };

    if (CITY_LABEL_ASSET_IDS.has(String(city.city_id || "").trim())) {
      const labelSprite = makeCityLabelSprite(city);
      if (labelSprite) mesh.add(labelSprite);
    }

    return mesh;
  }

  function makeEntityMesh(entity, radius) {
    if (!entity.entity_id) {
      console.error("[nodes] MISSING entity_id", entity);
      return null;
    }

    const score100 = readEntityScore(entity);
    const score01 = clamp01(score100 / 100);

    const geo = new THREE.SphereGeometry(radius, 8, 8);
    const mat = new THREE.MeshBasicMaterial({
      color: score100 >= 80 ? 0x8fd3ff : score100 >= 60 ? 0x5aa9ff : 0x3f74d9,
      transparent: true,
      opacity: score100 >= 80 ? 1.0 : score100 >= 60 ? 0.95 : 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = `entityNode:${entity.entity_id}`;
    mesh.visible = false;
    mesh.scale.set(0.85, 0.85, 0.85);

    mesh.userData = {
      type: "entityNode",
      entity_id: entity.entity_id,
      entityId: entity.entity_id,
      city_id: entity.city_id,
      cityId: entity.city_id,
      entity_type: entity.entity_type || "entity",
      score: score01,
      score100,
      node: entity,
      entity,
      sourceData: entity
    };

    return mesh;
  }

  function buildIndexes(cities, entities) {
    const citiesById = new Map();
    const entitiesById = new Map();
    const entitiesListByCity = new Map();

    for (const city of cities) {
      const cityId = String(city?.city_id || "").trim();
      if (!cityId) continue;

      if (citiesById.has(cityId)) {
        console.error("[nodes] DUPLICATE city_id", cityId, city);
        continue;
      }

      citiesById.set(cityId, city);
      if (!entitiesListByCity.has(cityId)) entitiesListByCity.set(cityId, []);
    }

    for (const entity of entities) {
      const entityId = String(entity?.entity_id || "").trim();
      const cityId = String(entity?.city_id || "").trim();
      if (!entityId || !cityId) continue;

      if (!citiesById.has(cityId)) {
        console.error("[nodes] ENTITY REFERENCES INVALID CITY", {
          entityId,
          cityId,
          entity
        });
        continue;
      }

      if (entitiesById.has(entityId)) {
        console.error("[nodes] DUPLICATE entity_id", entityId, entity);
        continue;
      }

      entitiesById.set(entityId, entity);
      if (!entitiesListByCity.has(cityId)) entitiesListByCity.set(cityId, []);
      entitiesListByCity.get(cityId).push(entity);
    }

    for (const arr of entitiesListByCity.values()) {
      arr.sort(entitySort);
    }

    G.state.citiesById = citiesById;
    G.state.entitiesById = entitiesById;
    G.state.entitiesListByCity = entitiesListByCity;
  }

  function applyCityMeshMetadata(mesh, city) {
    mesh.userData.city_id = city.city_id || null;
    mesh.userData.cityId = city.city_id || null;
    mesh.userData.node = city;
    mesh.userData.sourceData = city;
  }

  function updateCityLabelScales() {
    const st = G.state || {};
    const mode = String(st.mode || "WORLD").toUpperCase();
    const cityMeshes = Array.isArray(st.cityMeshes) ? st.cityMeshes : [];

    const camZ = Number(st.camera?.position?.z || st.targetZoom || st.defaultZoom || 4);
    const defaultZoom = Number(st.defaultZoom || 4);

    const zoomRatio = defaultZoom > 0 ? camZ / defaultZoom : 1;

    const sx = Math.max(0.035, Math.min(0.09, 0.09 * zoomRatio));
    const sy = Math.max(0.010, Math.min(0.026, 0.026 * zoomRatio));

    for (const cityMesh of cityMeshes) {
      if (!cityMesh) continue;

      const label = cityMesh.children?.find?.((c) => c?.userData?.type === "cityLabel");
      if (!label) continue;

      label.visible = mode === "WORLD" || mode === "CITY_FOCUS";
      label.scale.set(sx, sy, 1);
    }
  }

  function applyEntityMeshMetadata(mesh, entity) {
    mesh.userData.entity_id = entity.entity_id || null;
    mesh.userData.entityId = entity.entity_id || null;
    mesh.userData.city_id = entity.city_id || null;
    mesh.userData.cityId = entity.city_id || null;
    mesh.userData.node = entity;
    mesh.userData.entity = entity;
    mesh.userData.sourceData = entity;
    mesh.userData.entity_type = entity.entity_type || "entity";
    mesh.userData.score100 = readEntityScore(entity);
    mesh.userData.score = clamp01(mesh.userData.score100 / 100);
  }

  function validateMeshIdentity(mesh, kind) {
    if (!mesh?.userData) return false;

    if (kind === "city") {
      const cityId = String(mesh.userData.city_id || mesh.userData.cityId || "").trim();
      if (!cityId) {
        console.error("[nodes] city mesh missing city_id", mesh);
        return false;
      }
      if (!(G.state.citiesById instanceof Map) || !G.state.citiesById.has(cityId)) {
        console.error("[nodes] city mesh references unknown city_id", cityId, mesh);
        return false;
      }
      return true;
    }

    if (kind === "entity") {
      const entityId = String(mesh.userData.entity_id || mesh.userData.entityId || "").trim();
      const cityId = String(mesh.userData.city_id || mesh.userData.cityId || "").trim();

      if (!entityId || !cityId) {
        console.error("[nodes] entity mesh missing ids", mesh);
        return false;
      }
      if (!(G.state.entitiesById instanceof Map) || !G.state.entitiesById.has(entityId)) {
        console.error("[nodes] entity mesh references unknown entity_id", entityId, mesh);
        return false;
      }
      if (!(G.state.citiesById instanceof Map) || !G.state.citiesById.has(cityId)) {
        console.error("[nodes] entity mesh references unknown city_id", cityId, mesh);
        return false;
      }

      const canonical = G.state.entitiesById.get(entityId);
      const canonicalCityId = String(canonical?.city_id || "").trim();
      if (canonicalCityId !== cityId) {
        console.error("[nodes] entity mesh city mismatch", {
          entityId,
          meshCityId: cityId,
          canonicalCityId
        });
        return false;
      }

      return true;
    }

    return false;
  }

  G.findCityMeshById = function findCityMeshById(cityId) {
    const cid = String(cityId || "").trim();
    if (!cid) return null;
    const arr = Array.isArray(G.state.cityMeshes) ? G.state.cityMeshes : [];
    return arr.find((m) => String(m?.userData?.city_id || "").trim() === cid) || null;
  };

  G.refreshPickMeshesCache = function refreshPickMeshesCache() {
    const st = G.state;
    if (!st) return;

    const mode = String(st.mode || "WORLD").toUpperCase();
    const activeCityId = String(st.activeCityId || "").trim();

    const cityMeshes = Array.isArray(st.cityMeshes) ? st.cityMeshes : [];
    const entityMeshes = Array.isArray(st.entityMeshes) ? st.entityMeshes : [];

    if (mode === "WORLD") {
      st.pickMeshes = cityMeshes.filter((m) => m && m.visible !== false);
      return;
    }

    if (mode === "CITY_FOCUS" && activeCityId) {
      st.pickMeshes = cityMeshes.filter((m) => {
        const cid = String(m?.userData?.city_id || "").trim();
        return cid === activeCityId && m.visible !== false;
      });
      return;
    }

    if (mode === "CITY_MAP") {
      return;
    }

    st.pickMeshes = cityMeshes.filter((m) => m && m.visible !== false);
  };

  G.enforceModeVisibility = function enforceModeVisibility() {
    const st = G.state;
    const mode = String(st.mode || "WORLD").toUpperCase();
    const activeCityId = String(st.activeCityId || "").trim();

    const cityMeshes = Array.isArray(st.cityMeshes) ? st.cityMeshes : [];
    const entityMeshes = Array.isArray(st.entityMeshes) ? st.entityMeshes : [];
    const showGlobePresentation = mode !== "CITY_MAP";

    updateCityLabelScales();

    if (st.globeMesh) st.globeMesh.visible = showGlobePresentation;
    if (st.veinsMesh) st.veinsMesh.visible = showGlobePresentation;

    if (st.scene) {
      st.scene.traverse((obj) => {
        if (!obj || !obj.isMesh) return;
        if (obj.name === "atmoMesh" || obj.userData?.type === "atmosphere") {
          obj.visible = showGlobePresentation;
        }
      });
    }

    if (mode === "WORLD") {
      for (const mesh of cityMeshes) {
        if (mesh) mesh.visible = true;
      }

      for (const mesh of entityMeshes) {
        if (!mesh) continue;
        mesh.visible = false;
        mesh.scale.set(0.85, 0.85, 0.85);
      }

      return G.refreshPickMeshesCache?.();
    }

    if (mode === "CITY_FOCUS" && activeCityId) {
      for (const mesh of cityMeshes) {
        if (!mesh) continue;
        const cid = String(mesh?.userData?.city_id || "").trim();
        mesh.visible = cid === activeCityId;
      }

      for (const mesh of entityMeshes) {
        if (!mesh) continue;
        const cid = String(mesh?.userData?.city_id || "").trim();
        const active = cid === activeCityId;

        mesh.visible = active;
        mesh.scale.set(active ? 1.35 : 1, active ? 1.35 : 1, active ? 1.35 : 1);
      }

      return G.refreshPickMeshesCache?.();
    }

    if (mode === "CITY_MAP") {
      for (const mesh of cityMeshes) {
        if (mesh) mesh.visible = false;
      }

      for (const mesh of entityMeshes) {
        if (!mesh) continue;
        mesh.visible = false;
        mesh.scale.set(0.85, 0.85, 0.85);
      }

      return;
    }

    for (const mesh of cityMeshes) {
      if (mesh) mesh.visible = true;
    }

    for (const mesh of entityMeshes) {
      if (!mesh) continue;
      mesh.visible = false;
      mesh.scale.set(0.85, 0.85, 0.85);
    }

    G.refreshPickMeshesCache?.();
  };

  G.buildCityEntityHierarchy = function buildCityEntityHierarchy(payload) {
    const wg = ensureHierarchyGroups();
    if (!wg) return;

    clearGroup(G.state.citiesGroup);
    clearGroup(G.state.entitiesGroup);

    G.state.cityMeshes = [];
    G.state.entityMeshes = [];
    G.state.entitiesByCity = new Map();
    G.state.pickMeshes = [];

    const cities = Array.isArray(payload?.cities) ? payload.cities.slice() : [];
    const entities = Array.isArray(payload?.entities) ? payload.entities.slice() : [];

    cities.sort(citySort);
    entities.sort(entitySort);

    buildIndexes(cities, entities);

    const canonicalCities = Array.from(G.state.citiesById?.values?.() || []).sort(citySort);
    const canonicalEntities = Array.from(G.state.entitiesById?.values?.() || []).sort(entitySort);

    const earthR = Number(G.state?.earthRadius ?? 1.0);
    const cityR = earthR * 1.025;
    const entityR = earthR * 1.06;

    for (const city of canonicalCities) {
      const cityId = String(city?.city_id || "").trim();
      const lat = Number(city?.lat);
      const lon = Number(city?.lon);

      if (!cityId) {
        console.error("[nodes] INVALID city (missing city_id)", city);
        continue;
      }
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        console.error("[nodes] INVALID city coords", city);
        continue;
      }

      const mesh = makeCityMesh(city, 0.014);
      placeOnGlobe(mesh, lat, lon, cityR);
      applyCityMeshMetadata(mesh, city);

      if (!validateMeshIdentity(mesh, "city")) continue;

      G.state.citiesGroup.add(mesh);
      G.state.cityMeshes.push(mesh);

      if (!G.state.entitiesByCity.has(cityId)) {
        G.state.entitiesByCity.set(cityId, []);
      }
    }

    for (const entity of canonicalEntities) {
      const entityId = String(entity?.entity_id || "").trim();
      const cityId = String(entity?.city_id || "").trim();
      const lat = Number(entity?.lat);
      const lon = Number(entity?.lon);

      if (!entityId || !cityId) {
        console.error("[nodes] INVALID entity ids", entity);
        continue;
      }
      if (!G.state.citiesById.has(cityId)) {
        console.error("[nodes] ENTITY REFERENCES INVALID CITY", {
          entityId,
          cityId,
          entity
        });
        continue;
      }
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        console.error("[nodes] INVALID entity coords", entity);
        continue;
      }

      const score100 = readEntityScore(entity);
      const scoreRadius = score100 >= 80 ? 0.0105 : score100 >= 60 ? 0.009 : 0.0076;

      const mesh = makeEntityMesh(entity, scoreRadius);
      if (!mesh) continue;

      placeOnGlobe(mesh, lat, lon, entityR);
      applyEntityMeshMetadata(mesh, entity);

      if (!validateMeshIdentity(mesh, "entity")) continue;

      G.state.entitiesGroup.add(mesh);
      G.state.entityMeshes.push(mesh);

      if (!G.state.entitiesByCity.has(cityId)) G.state.entitiesByCity.set(cityId, []);
      G.state.entitiesByCity.get(cityId).push(mesh);
    }

    for (const arr of G.state.entitiesByCity.values()) {
      arr.sort((a, b) => {
        const ae = String(a?.userData?.entity_id || "");
        const be = String(b?.userData?.entity_id || "");
        return ae.localeCompare(be);
      });
    }

    G.enforceModeVisibility?.();
    G.refreshPickMeshesCache?.();

        G.updatePinnedVisuals?.();

      G.updatePinnedVisuals = function updatePinnedVisuals() {
    try {
      const user = window.UmbraUsers?.getActiveUser?.();
      const pinned = user?.state?.pinnedEntities || [];

      const meshes = Array.isArray(G.state.entityMeshes) ? G.state.entityMeshes : [];

      for (const mesh of meshes) {
        if (!mesh) continue;

        const id = String(mesh.userData?.entity_id || "");
        const isPinned = pinned.includes(id);

        if (isPinned) {
          mesh.scale.set(1.25, 1.25, 1.25);

          if (mesh.material) {
            mesh.material.color.setHex(0xffb45c);
            mesh.material.opacity = 1.0;
          }
        } else {
         mesh.scale.set(0.85, 0.85, 0.85);

          const score100 = Number(mesh.userData?.score100 || 50);

          if (mesh.material) {
            mesh.material.color.setHex(
              score100 >= 80 ? 0x8fd3ff :
              score100 >= 60 ? 0x5aa9ff :
              0x3f74d9
            );

            mesh.material.opacity =
              score100 >= 80 ? 0.92 :
              score100 >= 60 ? 0.84 :
              0.78;
          }
        }
      }
    } catch (e) {
      console.warn("[nodes] pinned visuals update failed", e);
    }
  };

    if (!(G.state.entitiesById instanceof Map) || G.state.entitiesById.size === 0) {
      const rebuilt = new Map();

      for (const entity of entities) {
        const entityId = String(entity?.entity_id || "").trim();
        if (!entityId) continue;
        rebuilt.set(entityId, entity);
      }

      G.state.entitiesById = rebuilt;
      console.warn("[nodes] REBUILT entitiesById", rebuilt.size);
    }

    console.log("[nodes] HIERARCHY READY", {
      cities: G.state.cityMeshes.length,
      entities: G.state.entityMeshes.length,
      entitiesById: G.state.entitiesById instanceof Map ? G.state.entitiesById.size : 0
    });
  };
})();