// public/globe/integrity.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) return console.error("[integrity] window.UmbraGlobe missing.");

  const QUIET_RUNTIME = true; // 🔒 LOCK: suppress routine pass spam

  function shouldLog(stage, ok) {
    if (!QUIET_RUNTIME) return true;

    const s = String(stage || "").toUpperCase();

    if (!ok) return true;

    return (
      s.includes("FINAL") ||
      s.includes("LOCK") ||
      s.includes("POST") ||
      s.includes("BOOT")
    );
  }

  function countWorldGroups(scene) {
    const scn = scene || null;
    if (!scn) return { total: 0, marked: 0, named: 0, list: [] };

    const groups = (scn.children || []).filter((c) => c && c.isGroup === true);
    const list = [];
    let marked = 0;
    let named = 0;

    for (const g of groups) {
      const isMarked = !!(g.userData && g.userData.__umbraWorldGroup === true);
      const isNamed = String(g.name || "") === "worldGroup";
      if (isMarked) marked++;
      if (isNamed) named++;
      if (isMarked || isNamed) list.push(g);
    }

    return { total: list.length, marked, named, list };
  }

  function isDescendantOf(obj, ancestor) {
    let o = obj || null;
    const a = ancestor || null;
    while (o) {
      if (o === a) return true;
      o = o.parent || null;
    }
    return false;
  }

  function failIf(condition, arr, msg) {
    if (condition) arr.push(String(msg));
  }

  function warnIf(condition, arr, msg) {
    if (condition) arr.push(String(msg));
  }

  function getId(x) {
    return String(x ?? "").trim();
  }

  function arrayOrEmpty(x) {
    return Array.isArray(x) ? x : [];
  }

  function collectDuplicateIds(items, keyName) {
    const seen = new Set();
    const dupes = [];
    for (const item of arrayOrEmpty(items)) {
      const id = getId(item?.[keyName]);
      if (!id) continue;
      if (seen.has(id)) dupes.push(id);
      else seen.add(id);
    }
    return dupes;
  }

  function safePickCount() {
    if (typeof G.getPickMeshes !== "function") return 0;
    try {
      const p = G.getPickMeshes();
      return Array.isArray(p) ? p.length : 0;
    } catch {
      return 0;
    }
  }

  function collectPickMeshes() {
    if (typeof G.getPickMeshes !== "function") return [];
    try {
      const p = G.getPickMeshes();
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }

  function parentName(obj) {
    return obj?.parent?.name || obj?.parent?.type || null;
  }

  function validateCityMeshes(st, errors, warnings) {
    const cityMeshes = Array.isArray(st?.cityMeshes) ? st.cityMeshes : [];
    const citiesGroup = st?.citiesGroup || null;
    const citiesById = st?.citiesById instanceof Map ? st.citiesById : null;

    for (let i = 0; i < cityMeshes.length; i++) {
      const mesh = cityMeshes[i];
      const cityId = getId(mesh?.userData?.city_id || mesh?.userData?.cityId);

      failIf(!mesh, errors, `CITY_MESH_NULL_AT_INDEX:${i}`);
      if (!mesh) continue;

      failIf(!cityId, errors, `CITY_MESH_MISSING_ID:${mesh?.name || i}`);
      failIf(!citiesById || !citiesById.has(cityId), errors, `CITY_MESH_UNKNOWN_CITY_ID:${cityId || mesh?.name || i}`);
      failIf(mesh.parent !== citiesGroup, errors, `CITY_MESH_WRONG_PARENT:${cityId || mesh?.name || i}->${parentName(mesh)}`);

      failIf(
        !!st?.globeMesh && isDescendantOf(mesh, st.globeMesh),
        errors,
        `CITY_MESH_ATTACHED_TO_GLOBE:${cityId || mesh?.name || i}`
      );

      const type = getId(mesh?.userData?.type);
      warnIf(type !== "cityNode", warnings, `CITY_MESH_UNEXPECTED_TYPE:${cityId || mesh?.name || i}:${type || "NONE"}`);
    }
  }

  function validateEntityMeshes(st, errors, warnings) {
    const entityMeshes = Array.isArray(st?.entityMeshes) ? st.entityMeshes : [];
    const entitiesGroup = st?.entitiesGroup || null;
    const entitiesById = st?.entitiesById instanceof Map ? st.entitiesById : null;
    const citiesById = st?.citiesById instanceof Map ? st.citiesById : null;

    for (let i = 0; i < entityMeshes.length; i++) {
      const mesh = entityMeshes[i];
      const entityId = getId(mesh?.userData?.entity_id || mesh?.userData?.entityId);
      const cityId = getId(mesh?.userData?.city_id || mesh?.userData?.cityId);

      failIf(!mesh, errors, `ENTITY_MESH_NULL_AT_INDEX:${i}`);
      if (!mesh) continue;

      failIf(!entityId, errors, `ENTITY_MESH_MISSING_ENTITY_ID:${mesh?.name || i}`);
      failIf(!cityId, errors, `ENTITY_MESH_MISSING_CITY_ID:${entityId || mesh?.name || i}`);
      failIf(!entitiesById || !entitiesById.has(entityId), errors, `ENTITY_MESH_UNKNOWN_ENTITY_ID:${entityId || mesh?.name || i}`);
      failIf(!citiesById || !citiesById.has(cityId), errors, `ENTITY_MESH_UNKNOWN_CITY_ID:${entityId || mesh?.name || i}->${cityId}`);
      failIf(mesh.parent !== entitiesGroup, errors, `ENTITY_MESH_WRONG_PARENT:${entityId || mesh?.name || i}->${parentName(mesh)}`);

      failIf(
        !!st?.globeMesh && isDescendantOf(mesh, st.globeMesh),
        errors,
        `ENTITY_MESH_ATTACHED_TO_GLOBE:${entityId || mesh?.name || i}`
      );

      const canonical = entitiesById?.get(entityId) || null;
      const canonicalCityId = getId(canonical?.city_id);
      failIf(
        !!canonical && canonicalCityId !== cityId,
        errors,
        `ENTITY_MESH_CITY_MISMATCH:${entityId}->mesh:${cityId || "NONE"} canonical:${canonicalCityId || "NONE"}`
      );

      const type = getId(mesh?.userData?.type);
      warnIf(type !== "entityNode", warnings, `ENTITY_MESH_UNEXPECTED_TYPE:${entityId || mesh?.name || i}:${type || "NONE"}`);
    }
  }

  function validateEntitiesByCity(st, errors) {
    const entitiesListByCity = st?.entitiesListByCity instanceof Map ? st.entitiesListByCity : null;
    const citiesById = st?.citiesById instanceof Map ? st.citiesById : null;
    const entitiesById = st?.entitiesById instanceof Map ? st.entitiesById : null;
    if (!entitiesListByCity || !citiesById || !entitiesById) return;

    for (const [cityId, list] of entitiesListByCity.entries()) {
      failIf(!citiesById.has(cityId), errors, `ENTITY_LIST_INVALID_CITY_BUCKET:${cityId}`);

      for (const entity of arrayOrEmpty(list)) {
        const entityId = getId(entity?.entity_id);
        const entityCityId = getId(entity?.city_id);

        failIf(!entityId, errors, `ENTITY_LIST_MEMBER_MISSING_ID:${cityId}`);
        failIf(!entitiesById.has(entityId), errors, `ENTITY_LIST_MEMBER_UNKNOWN_ENTITY:${cityId}->${entityId}`);
        failIf(entityCityId !== cityId, errors, `ENTITY_LIST_MEMBER_CITY_MISMATCH:${entityId}->${entityCityId} expected:${cityId}`);
      }
    }
  }

  function validateActiveState(st, errors) {
    const mode = String(st?.mode || "WORLD").toUpperCase();
    const activeCityId = getId(st?.activeCityId);
    const activeEntityId = getId(st?.activeEntityId);
    const citiesById = st?.citiesById instanceof Map ? st.citiesById : null;
    const entitiesById = st?.entitiesById instanceof Map ? st.entitiesById : null;

    if (activeCityId) {
      failIf(!citiesById || !citiesById.has(activeCityId), errors, `ACTIVE_CITY_ID_INVALID:${activeCityId}`);
    }

    if (activeEntityId) {
      failIf(!entitiesById || !entitiesById.has(activeEntityId), errors, `ACTIVE_ENTITY_ID_INVALID:${activeEntityId}`);
    }

    if (mode === "WORLD") {
      failIf(!!activeEntityId, errors, `WORLD_MODE_SHOULD_NOT_HAVE_ACTIVE_ENTITY:${activeEntityId}`);
    }

    if (mode === "CITY") {
      failIf(!activeCityId, errors, "CITY_MODE_MISSING_ACTIVE_CITY_ID");

      if (activeEntityId && entitiesById && entitiesById.has(activeEntityId)) {
        const entity = entitiesById.get(activeEntityId);
        const entityCityId = getId(entity?.city_id);
        failIf(entityCityId !== activeCityId, errors, `CITY_MODE_ACTIVE_ENTITY_CITY_MISMATCH:${activeEntityId}->${entityCityId} expected:${activeCityId}`);
      }
    }
  }

  function validatePickMeshes(st, errors, warnings) {
    const mode = String(st?.mode || "WORLD").toUpperCase();
    const activeCityId = getId(st?.activeCityId);
    const picks = collectPickMeshes();
    const cityMeshes = Array.isArray(st?.cityMeshes) ? st.cityMeshes : [];
    const entityMeshes = Array.isArray(st?.entityMeshes) ? st.entityMeshes : [];

    if (mode === "WORLD") {
      failIf(cityMeshes.length > 0 && picks.length === 0 && st?.nodesEnabled !== false, errors, "WORLD_MODE_NO_PICK_MESHES");

      for (const mesh of picks) {
        const type = getId(mesh?.userData?.type);
        warnIf(type !== "cityNode", warnings, `WORLD_PICK_UNEXPECTED_TYPE:${type || "NONE"}`);
      }
      return;
    }

    if (mode === "CITY") {
      const visibleEntities = entityMeshes.filter((m) => {
        const cityId = getId(m?.userData?.city_id || m?.userData?.cityId);
        return cityId === activeCityId && m?.visible !== false;
      });

      failIf(!!activeCityId && visibleEntities.length > 0 && picks.length === 0 && st?.nodesEnabled !== false, errors, "CITY_MODE_NO_PICK_MESHES");

      for (const mesh of picks) {
        const type = getId(mesh?.userData?.type);
        const cityId = getId(mesh?.userData?.city_id || mesh?.userData?.cityId);
        warnIf(type !== "entityNode", warnings, `CITY_PICK_UNEXPECTED_TYPE:${type || "NONE"}`);
        failIf(cityId !== activeCityId, errors, `CITY_PICK_WRONG_CITY:${cityId || "NONE"} expected:${activeCityId || "NONE"}`);
      }
    }
  }

  G.verifyInvariants = function verifyInvariants(stageLabel) {
    const stage = String(stageLabel || "UNLABELED").trim() || "UNLABELED";

    if (typeof G.hardenState === "function") {
      try { G.hardenState(); } catch {}
    }

    const st = (G.state && typeof G.state === "object") ? G.state : null;
    const errors = [];
    const warnings = [];

    const scene = st?.scene || null;
    const wg = st?.worldGroup || null;
    const data = window.UMBRA_DATA || null;

    const dataCities = arrayOrEmpty(data?.cities);
    const dataEntities = arrayOrEmpty(data?.entities);

    const cityMeshes = Array.isArray(st?.cityMeshes) ? st.cityMeshes : [];
    const entityMeshes = Array.isArray(st?.entityMeshes) ? st.entityMeshes : [];

    const worldGroups = countWorldGroups(scene);

    failIf(!st, errors, "STATE_MISSING");
    failIf(!scene, errors, "SCENE_MISSING");
    failIf(!wg, errors, "WORLD_GROUP_MISSING");
    failIf(scene && worldGroups.total === 0, errors, "NO_WORLD_GROUP_IN_SCENE");
    failIf(scene && worldGroups.total > 1, errors, `MULTIPLE_WORLD_GROUPS:${worldGroups.total}`);
    failIf(!!wg && !!scene && wg.parent !== scene, errors, `WORLD_GROUP_WRONG_PARENT:${parentName(wg)}`);
    failIf(!!wg && String(wg?.name || "") !== "worldGroup", errors, `WORLD_GROUP_NAME_INVALID:${String(wg?.name || "")}`);
    failIf(!!wg && !(wg?.userData && wg.userData.__umbraWorldGroup === true), errors, "WORLD_GROUP_MARKER_MISSING");

    const dupCityIds = collectDuplicateIds(dataCities, "city_id");
    const dupEntityIds = collectDuplicateIds(dataEntities, "entity_id");

    failIf(dupCityIds.length > 0, errors, `DUPLICATE_CITY_IDS:${dupCityIds.join(",")}`);
    failIf(dupEntityIds.length > 0, errors, `DUPLICATE_ENTITY_IDS:${dupEntityIds.join(",")}`);

    failIf(dataCities.length > 0 && cityMeshes.length === 0, errors, "DATA_CITIES_PRESENT_BUT_NO_CITY_MESHES");
    failIf(dataEntities.length > 0 && entityMeshes.length === 0, errors, "DATA_ENTITIES_PRESENT_BUT_NO_ENTITY_MESHES");

    failIf(
      dataCities.length > 0 && cityMeshes.length > 0 && cityMeshes.length !== dataCities.length,
      errors,
      `CITY_MESH_COUNT_MISMATCH:data=${dataCities.length},meshes=${cityMeshes.length}`
    );

    failIf(
      dataEntities.length > 0 && entityMeshes.length > 0 && entityMeshes.length !== dataEntities.length,
      errors,
      `ENTITY_MESH_COUNT_MISMATCH:data=${dataEntities.length},meshes=${entityMeshes.length}`
    );

    failIf(!!st?.citiesGroup && !!wg && st.citiesGroup.parent !== wg, errors, `CITIES_GROUP_WRONG_PARENT:${parentName(st.citiesGroup)}`);
    failIf(!!st?.entitiesGroup && !!wg && st.entitiesGroup.parent !== wg, errors, `ENTITIES_GROUP_WRONG_PARENT:${parentName(st.entitiesGroup)}`);

    validateCityMeshes(st, errors, warnings);
    validateEntityMeshes(st, errors, warnings);
    validateEntitiesByCity(st, errors);
    validateActiveState(st, errors);
    validatePickMeshes(st, errors, warnings);

    const ok = errors.length === 0;

    const report = {
      ok,
      stage,
      errors,
      warnings,
      counts: {
        dataCities: dataCities.length,
        dataEntities: dataEntities.length,
        cityMeshes: cityMeshes.length,
        entityMeshes: entityMeshes.length,
        pick: safePickCount(),
        worldGroups: worldGroups.total
      },
      state: {
        mode: String(st?.mode || "WORLD").toUpperCase(),
        activeCityId: getId(st?.activeCityId) || null,
        activeEntityId: getId(st?.activeEntityId) || null,
        nodesEnabled: !!st?.nodesEnabled
      },
      source: {
        datasetHash: String(data?._src?.datasetHash || ""),
        loadedFrom: String(data?._src?.loadedFrom || "")
      },
      time: new Date().toISOString()
    };

    if (st && typeof st === "object") st.lastIntegrityReport = report;

    if (shouldLog(stage, ok)) {
      console.log("[TRACE integrity]", {
        stage,
        datasetHash: report.source.datasetHash || null,
        cities: dataCities.length,
        entities: dataEntities.length,
        cityMeshes: cityMeshes.length,
        entityMeshes: entityMeshes.length,
        pick: report.counts.pick,
        worldGroups: report.counts.worldGroups,
        activeCityId: report.state.activeCityId,
        activeEntityId: report.state.activeEntityId
      });

      if (!ok) console.error("[integrity] FAIL", report);
      else console.log("[integrity] PASS", report);
    }

    return report;
  };
})();