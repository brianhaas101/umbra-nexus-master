// public/globe/telemetry.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) return console.error("[telemetry] UmbraGlobe missing");

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = String(value ?? "—");
  }

  function formatCoords(lat, lon) {
    if (typeof lat !== "number" || typeof lon !== "number") return "—";
    const latAbs = Math.abs(lat).toFixed(1);
    const lonAbs = Math.abs(lon).toFixed(1);
    return `${latAbs}° ${lat >= 0 ? "N" : "S"}   ${lonAbs}° ${lon >= 0 ? "E" : "W"}`;
  }

  function entityLat(entity) {
    const lat = Number(entity?.lat);
    return Number.isFinite(lat) ? lat : null;
  }

  function entityLon(entity) {
    const lon = Number(entity?.lon);
    return Number.isFinite(lon) ? lon : null;
  }

  function cityLat(city) {
    const lat = Number(city?.lat);
    return Number.isFinite(lat) ? lat : null;
  }

  function cityLon(city) {
    const lon = Number(city?.lon);
    return Number.isFinite(lon) ? lon : null;
  }

  function safeGetEntity(st, id) {
    if (!id || !(st.entitiesById instanceof Map)) return null;
    return st.entitiesById.get(id) || null;
  }

  function safeGetCity(st, id) {
    if (!id || !(st.citiesById instanceof Map)) return null;
    return st.citiesById.get(id) || null;
  }

  function getIntegrityStatus(st) {
    const report = st?.lastIntegrityReport;
    if (!report) return "UNKNOWN";
    return report.ok ? "STABLE" : "ERROR";
  }

  function getEntityType(entity) {
    const t = String(entity?.entity_type || "").trim().toUpperCase();
    return t || "ENTITY";
  }

  function getCityEntityCount(st, cityId) {
    if (!cityId) return 0;
    const list = st?.entitiesListByCity instanceof Map
      ? st.entitiesListByCity.get(cityId)
      : null;
    return Array.isArray(list) ? list.length : 0;
  }

  G.updateTelemetry = function updateTelemetry() {
    const st = G.state;
    if (!st) return;

    const mode = String(st.mode || "WORLD").toUpperCase();
    const activeCityId = String(st.activeCityId || "").trim() || null;
    const activeEntityId = String(st.activeEntityId || "").trim() || null;

    const city = safeGetCity(st, activeCityId);
    const entity = safeGetEntity(st, activeEntityId);

    const data = window.UMBRA_DATA || {};
    const datasetHash = data?._src?.datasetHash || "—";

    setText("telemetryStatus", getIntegrityStatus(st));
    setText("telemetryMode", mode);
    setText("telemetryDataset", datasetHash);

    if (entity) {
      setText("telemetrySelection", entity.name || entity.entity_id || "ENTITY");
      setText("telemetryCoords", formatCoords(entityLat(entity), entityLon(entity)));
      setText("telemetryRegion", city?.name || city?.city_id || entity.city_id || "—");
      setText("telemetryNodes", String(getCityEntityCount(st, entity.city_id || activeCityId)));
      setText("telemetryVectors", getEntityType(entity));
      return;
    }

    if (city) {
      setText("telemetrySelection", city.name || city.city_id || "CITY");
      setText("telemetryCoords", formatCoords(cityLat(city), cityLon(city)));
      setText("telemetryRegion", city.region || city.country || "—");
      setText("telemetryNodes", String(getCityEntityCount(st, city.city_id || activeCityId)));
      setText("telemetryVectors", "CITY");
      return;
    }

    setText("telemetrySelection", "GLOBAL");
    setText("telemetryCoords", "—");
    setText("telemetryRegion", "WORLD");
    setText("telemetryNodes", String(Array.isArray(st.cityMeshes) ? st.cityMeshes.length : 0));
    setText("telemetryVectors", "—");
  };

  G.updateTelemetryFromNode = function updateTelemetryFromNode() {
    G.updateTelemetry?.();
  };
})();