// public/globe/telemetry.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) return console.error("[telemetry] window.UmbraGlobe missing.");

  // ---- STATE (NO REASSIGN) ----
  G.hardenState?.();
  const st = G.state;

  function $(id) { return document.getElementById(id); }
  function setText(el, txt) { if (el) el.textContent = String(txt ?? ""); }

  function getLatLon(node) {
    const lat = Number(node?.lat ?? node?.latitude ?? node?.location?.lat ?? node?.location?.latitude);
    const lon = Number(
      node?.lon ?? node?.lng ?? node?.longitude ?? node?.long ??
      node?.location?.lon ?? node?.location?.lng ?? node?.location?.longitude
    );
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  }

  function fmtCoords(lat, lon) {
    const la = Number(lat);
    const lo = Number(lon);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) return "—";
    const latAbs = Math.abs(la).toFixed(1);
    const lonAbs = Math.abs(lo).toFixed(1);
    return `${latAbs}° ${la >= 0 ? "N" : "S"}   ${lonAbs}° ${lo >= 0 ? "E" : "W"}`;
  }

  // Explicit mesh types only (from nodes.founder.v1.js)
  function nodeType(nodeLike) {
    const raw = String(nodeLike?.userData?.type || nodeLike?.type || "").trim();
    const t = raw.toLowerCase();

    if (t === "citynode") return "city";
    if (t === "entitynode") return "entity";
    if (t === "leadnode") return "lead";

    return "unknown";
  }

  function inferTypeFromSchema(node) {
    if (!node || typeof node !== "object") return "unknown";

    const entId = String(node?.entity_id ?? node?.entityId ?? "").trim();
    if (entId) return "entity";

    if (Array.isArray(node?.leads) || Number.isFinite(Number(node?.nodes))) return "lead";

    const cityId = String(node?.city_id ?? node?.cityId ?? "").trim();
    if (cityId) return "city";

    return "unknown";
  }

  function cityDisplay(node) {
    const name = String(node?.name ?? node?.location?.city ?? node?.city ?? "—").trim();
    const region = String(node?.region ?? node?.location?.region ?? node?.location?.state ?? node?.state ?? "").trim();
    if (!name) return "—";
    return region ? `${name}, ${region}` : name;
  }

  function entityDisplay(node) {
    return String(node?.name ?? node?.title ?? "—").trim() || "—";
  }

  function nodesAreEnabled() {
    return (st?.nodesEnabled !== false) && (st?.citiesGroup ? st.citiesGroup.visible !== false : true);
  }

  function countForCity(cityId) {
    const id = String(cityId || "").trim();
    if (!id) return null;

    const map = st?.entitiesByCity;
    if (!map || typeof map.get !== "function") return null;

    const cityGroup = map.get(id);
    if (!cityGroup) return 0;

    const cached = cityGroup.userData?.entitiesSub?.userData?.entityMeshes;
    if (Array.isArray(cached)) return cached.length;

    const cached2 = cityGroup.userData?.entityMeshes;
    if (Array.isArray(cached2)) return cached2.length;

    return 0;
  }

  function currentVisibleCount() {
    if (!nodesAreEnabled()) return 0;

    const mode = String(st?.mode || "").toUpperCase();

    if (typeof G.getPickMeshes === "function") {
      const pick = G.getPickMeshes();
      if (Array.isArray(pick)) return pick.length;
    }

    if (mode === "CITY") {
      const c = countForCity(st?.activeCityId);
      if (typeof c === "number") return c;
      if (Array.isArray(st?.entityMeshes)) return st.entityMeshes.length;
      return 0;
    }

    if (Array.isArray(st?.cityMeshes) && st.cityMeshes.length) return st.cityMeshes.length;
    if (Array.isArray(st?.nodeMeshes) && st.nodeMeshes.length) return st.nodeMeshes.length;

    return 0;
  }

  const REQ = ["entity_id", "city_id", "name", "lat", "lon"];
  const OPT = ["intent", "activity", "behavior", "wealth", "influence", "pricing", "vehicle", "tags", "meta", "sources"];

  function hasField(n, key, nodeLike) {
    if (!n) return false;

    if (key === "entity_id") {
      const entId = String(
        n?.entity_id ?? n?.entityId ??
        nodeLike?.userData?.entityId ?? nodeLike?.userData?.entity_id ?? ""
      ).trim();
      return !!entId;
    }

    if (key === "city_id") {
      const cityId = String(
        n?.city_id ?? n?.cityId ??
        nodeLike?.userData?.cityId ?? nodeLike?.userData?.city_id ?? ""
      ).trim();
      return !!cityId;
    }

    if (key === "name") return !!String(n?.name ?? "").trim();
    if (key === "lat") return Number.isFinite(Number(n?.lat ?? n?.location?.lat));
    if (key === "lon") return Number.isFinite(Number(n?.lon ?? n?.location?.lon ?? n?.lng ?? n?.location?.lng));

    const v = n?.[key];
    if (v === null || v === undefined) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "string") return v.trim().length > 0;
    if (typeof v === "object") return true;
    return true;
  }

  function coverageForEntity(n, nodeLike) {
    let reqHave = 0;
    for (const k of REQ) if (hasField(n, k, nodeLike)) reqHave++;

    let optHave = 0;
    for (const k of OPT) if (hasField(n, k, nodeLike)) optHave++;

    const requiredOk = reqHave === REQ.length;

    const frac = OPT.length ? (optHave / OPT.length) : 0;
    const conf01 = requiredOk ? Math.max(0, Math.min(1, 0.65 + 0.35 * frac)) : 0;

    return { reqHave, reqTotal: REQ.length, optHave, optTotal: OPT.length, requiredOk, conf01 };
  }

  function pct01(x) {
    if (typeof x !== "number" || !Number.isFinite(x)) return "—";
    return `${Math.round(x * 100)}%`;
  }

  G.initTelemetry = function initTelemetry() {
    setText($("telemetryCoords"), "—");
    setText($("telemetryRegion"), "—");
    setText($("telemetryVectors"), "—");
    setText($("telemetrySelection"), "—");
    setText($("leadPanelTitle"), "Lead Dossier");

    setText($("telemetryNodes"), String(currentVisibleCount()));
    setText($("telemetryStatus"), nodesAreEnabled() ? "STANDBY" : "NODES OFF");

    console.log("[telemetry] ready");
  };

  G.updateTelemetryFromNode = function updateTelemetryFromNode(nodeLike) {
    const node = nodeLike?.userData?.node ? nodeLike.userData.node : nodeLike;

    const coordsEl = $("telemetryCoords");
    const regionEl = $("telemetryRegion");
    const nodesEl = $("telemetryNodes");
    const vectorsEl = $("telemetryVectors");
    const statusEl = $("telemetryStatus");
    const selectionEl = $("telemetrySelection");
    const titleEl = $("leadPanelTitle");

    const ll = getLatLon(node);
    setText(coordsEl, ll ? fmtCoords(ll.lat, ll.lon) : "—");

    let t = nodeType(nodeLike);
    if (t === "unknown") t = inferTypeFromSchema(node);

    let display = "—";
    if (t === "city") display = cityDisplay(node);
    else if (t === "entity") display = entityDisplay(node);
    else if (t === "lead") display = String(node?.city ?? node?.name ?? "—");
    else display = String(node?.name ?? node?.title ?? node?.city ?? "—");

    setText(regionEl, display);
    setText(selectionEl, display);

    if (t === "city") setText(titleEl, `City Dossier — ${display}`);
    else if (t === "entity") setText(titleEl, `Entity Dossier — ${display}`);
    else setText(titleEl, (display && display !== "—") ? display : "Lead Dossier");

    if (!nodesAreEnabled()) setText(statusEl, "NODES OFF");
    else setText(statusEl, st?.isFocused ? "NODE LOCKED" : "STANDBY");

    let vec = node?.vectors || "—";

    if (t === "city") {
      const cityId = String(
        node?.city_id ?? node?.cityId ??
        nodeLike?.userData?.cityId ?? nodeLike?.userData?.city_id ?? ""
      ).trim();
      const c = countForCity(cityId);
      vec = `Entities · ${typeof c === "number" ? c : "—"}`;
    }

    if (t === "entity") {
      const cov = coverageForEntity(node, nodeLike);
      vec = `Conf ${pct01(cov.conf01)} · Req ${cov.reqHave}/${cov.reqTotal} · Opt ${cov.optHave}/${cov.optTotal}`;
    }

    setText(vectorsEl, vec);

    let count = null;

    if (!nodesAreEnabled()) {
      count = 0;
    } else if (t === "city") {
      const cityId = String(
        node?.city_id ?? node?.cityId ??
        nodeLike?.userData?.cityId ?? nodeLike?.userData?.city_id ?? ""
      ).trim();
      const c = countForCity(cityId);
      if (typeof c === "number") count = c;
    } else if (t === "entity") {
      count = 1;
    } else if (t === "lead") {
      if (typeof node?.nodes === "number" && Number.isFinite(node.nodes)) count = node.nodes;
      else if (Array.isArray(node?.leads)) count = node.leads.length;
    }

    if (typeof count === "number") setText(nodesEl, count.toLocaleString());
    else setText(nodesEl, String(currentVisibleCount()));
  };
})();
