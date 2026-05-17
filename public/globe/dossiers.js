// public/globe/dossiers.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) return console.error("[dossiers] window.UmbraGlobe missing.");

  try { G.hardenState?.(); } catch {}
  const st = (G.state && typeof G.state === "object") ? G.state : null;
  if (!st) return console.error("[dossiers] G.state missing/unusable (core must load first).");

  if (!st._dossierState || typeof st._dossierState !== "object") {
    st._dossierState = {
      open: false,
      type: null,
      entityId: null,
      cityId: null,
      title: null
    };
  }

  function $(id) { return document.getElementById(id); }

  function getMount() {
    return $("leadContent") || $("dossierPanel") || null;
  }

  function setPanelTitle(text) {
    const el = $("leadPanelTitle");
    if (el) el.textContent = String(text || "Lead Dossier");
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function fmt(v) {
    if (v === null || v === undefined) return "—";
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    const s = String(v).trim();
    return s ? s : "—";
  }

  function isObj(x) { return x && typeof x === "object"; }
  function isFiniteNum(x) { return typeof x === "number" && Number.isFinite(x); }

  function coordsLine(n) {
    const lat = Number(n?.lat ?? n?.location?.lat);
    const lon = Number(n?.lon ?? n?.location?.lon ?? n?.lng ?? n?.location?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return "—";
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }

  function locLine(n) {
    const city = n?.location?.city ?? n?.city ?? n?.name ?? "";
    const region = n?.location?.region ?? n?.region ?? n?.location?.state ?? n?.state ?? "";
    const country = n?.location?.country ?? n?.country ?? "";
    const parts = [city, region, country].map((x) => String(x || "").trim()).filter(Boolean);
    return parts.length ? parts.join(", ") : "—";
  }

  function titleCase(s) {
    return String(s || "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function unwrapNode(nodeOrMesh) {
    if (nodeOrMesh?.userData?.node) return nodeOrMesh.userData.node;
    if (nodeOrMesh?.userData && isObj(nodeOrMesh.userData) && nodeOrMesh.userData.entity) return nodeOrMesh.userData.entity;
    return nodeOrMesh;
  }

  function readType(nodeOrMesh) {
    const raw = String(
      nodeOrMesh?.userData?.type ??
      nodeOrMesh?.type ??
      nodeOrMesh?.entity_type ??
      nodeOrMesh?.kind ??
      ""
    ).toLowerCase();

    if (raw === "citynode") return "city";
    if (raw === "entitynode") return "entity";
    if (raw === "leadnode") return "lead";

    if (raw === "person") return "person";
    if (raw === "asset" || raw === "property" || raw === "parcel") return "asset";
    if (raw === "business" || raw === "company") return "business";

    return "entity";
  }

  function readCityId(nodeOrMesh, node) {
    return String(
      node?.city_id ??
      node?.cityId ??
      nodeOrMesh?.userData?.cityId ??
      nodeOrMesh?.userData?.city_id ??
      ""
    ).trim() || "";
  }

  function readEntityId(nodeOrMesh, node) {
    return String(
      node?.entity_id ??
      node?.entityId ??
      nodeOrMesh?.userData?.entityId ??
      nodeOrMesh?.userData?.entity_id ??
      ""
    ).trim() || "";
  }

  function readMode() {
    return String(window.UMBRA_MODE || st?.dataMode || "demo").toLowerCase();
  }

  function setDossierState(next) {
    st._dossierState = {
      open: !!next?.open,
      type: next?.type ?? null,
      entityId: next?.entityId ?? null,
      cityId: next?.cityId ?? null,
      title: next?.title ?? null
    };
  }

  function clearDossierState() {
    setDossierState({
      open: false,
      type: null,
      entityId: null,
      cityId: null,
      title: null
    });
  }

  function getEntitiesListByCity(cityId) {
    const id = String(cityId || "").trim();
    if (!id) return [];

    const m = st?.entitiesListByCity;
    if (m && typeof m.get === "function") {
      const arr = m.get(id);
      return Array.isArray(arr) ? arr : [];
    }

    const byId = st?.entitiesById;
    if (byId && typeof byId.forEach === "function") {
      const out = [];
      byId.forEach((e) => {
        const cid = String(e?.city_id ?? e?.cityId ?? "").trim();
        if (cid === id) out.push(e);
      });
      out.sort((a, b) =>
        String(a?.entity_id ?? a?.entityId ?? a?.id ?? "").localeCompare(
          String(b?.entity_id ?? b?.entityId ?? b?.id ?? "")
        )
      );
      return out;
    }

    return [];
  }

  function resolveEntityData(nodeOrMesh) {
    const n = unwrapNode(nodeOrMesh);
    const entId = readEntityId(nodeOrMesh, n);
    if (!entId) return null;

    const byId = st?.entitiesById;
    if (byId && typeof byId.get === "function") {
      const e = byId.get(entId);
      if (e) return e;
    }
    return null;
  }

  function resolveCityData(nodeOrMesh) {
    const n = unwrapNode(nodeOrMesh);
    const cityId = readCityId(nodeOrMesh, n);
    if (!cityId) return null;

    const byId = st?.citiesById;
    if (byId && typeof byId.get === "function") {
      const c = byId.get(cityId);
      if (c) return c;
    }
    return null;
  }

  function resolveCanonicalEntityBundle(nodeOrMesh) {
    const raw = unwrapNode(nodeOrMesh);
    const entityId = readEntityId(nodeOrMesh, raw);
    const cityIdFromNode = readCityId(nodeOrMesh, raw);

    const errors = [];
    if (!entityId) errors.push("Missing Entity ID (cannot reconcile to unique dossier).");
    if (!cityIdFromNode) errors.push("Missing City ID (cannot reconcile entity to a city parent).");

    const entity = entityId && st?.entitiesById instanceof Map ? st.entitiesById.get(entityId) : null;
    if (!entityId) {
      return {
        ok: false,
        raw,
        entity: null,
        entityId,
        cityId: cityIdFromNode,
        canonicalCity: null,
        errors
      };
    }

    if (!entity) {
      errors.push("Entity ID did not resolve in canonical entity map.");
      return {
        ok: false,
        raw,
        entity: null,
        entityId,
        cityId: cityIdFromNode,
        canonicalCity: null,
        errors
      };
    }

    const canonicalCityId = String(entity?.city_id ?? entity?.cityId ?? "").trim();
    if (!canonicalCityId) {
      errors.push("Canonical entity is missing city_id.");
      return {
        ok: false,
        raw,
        entity,
        entityId,
        cityId: cityIdFromNode,
        canonicalCity: null,
        errors
      };
    }

    if (cityIdFromNode && canonicalCityId !== cityIdFromNode) {
      errors.push("Entity city_id does not match canonical city assignment.");
    }

    const canonicalCity = canonicalCityId && st?.citiesById instanceof Map
      ? st.citiesById.get(canonicalCityId)
      : null;

    if (!canonicalCity) {
      errors.push("Canonical entity references a missing city.");
    }

    return {
      ok: errors.length === 0,
      raw,
      entity,
      entityId,
      cityId: canonicalCityId || cityIdFromNode,
      canonicalCity,
      errors
    };
  }

  function resolveCanonicalCityBundle(nodeOrMesh) {
    const raw = unwrapNode(nodeOrMesh);
    const cityId = readCityId(nodeOrMesh, raw);
    const errors = [];

    if (!cityId) errors.push("Missing City ID (cannot reconcile to hierarchy).");

    const city = cityId && st?.citiesById instanceof Map ? st.citiesById.get(cityId) : null;
    if (cityId && !city) errors.push("City ID did not resolve in canonical city map.");

    return {
      ok: errors.length === 0,
      raw,
      city,
      cityId,
      errors
    };
  }

  function countEntitiesForCity(cityId) {
    const id = String(cityId || "").trim();
    if (!id) return 0;
    const list = getEntitiesListByCity(id);
    return Array.isArray(list) ? list.length : 0;
  }

  function normalizeScore100(x) {
    let s = Number(x);
    if (!Number.isFinite(s)) return null;
    if (s <= 1.00001) s = s * 100;
    return Number.isFinite(s) ? s : null;
  }

  function entityScore100(e) {
    return normalizeScore100(e?.scores?.umbraScore ?? e?.umbraScore ?? e?.score);
  }

  function cityScore100ByEntities(cityId) {
    const list = getEntitiesListByCity(cityId);
    if (!Array.isArray(list) || !list.length) return null;

    let sum = 0;
    let n = 0;
    for (const e of list) {
      const s = entityScore100(e);
      if (s === null) continue;
      sum += s;
      n++;
    }
    if (!n) return null;
    return sum / n;
  }

  function computeCityRanks() {
    const byId = st?.citiesById;
    const out = new Map();
    if (!(byId instanceof Map) || byId.size === 0) return out;

    const arr = Array.from(byId.values()).slice();

    function scoreForCity(city) {
      const cid = String(city?.city_id || city?.cityId || "").trim();
      if (!cid) return 0;

      const byEnt = cityScore100ByEntities(cid);
      if (byEnt !== null) return byEnt;

      const byNode = normalizeScore100(city?.scores?.umbraScore ?? city?.umbraScore ?? city?.score);
      if (byNode !== null) return byNode;

      return 0;
    }

    arr.sort((a, b) => {
      const da = scoreForCity(a);
      const db = scoreForCity(b);
      if (db !== da) return db - da;
      const ida = String(a?.city_id || a?.cityId || "");
      const idb = String(b?.city_id || b?.cityId || "");
      return ida.localeCompare(idb);
    });

    for (let i = 0; i < arr.length; i++) {
      const c = arr[i];
      const id = String(c?.city_id || c?.cityId || "").trim();
      if (id) out.set(id, { rank: i + 1, of: arr.length });
    }

    return out;
  }

  const REQUIRED_ENTITY_FIELDS = ["entity_id", "city_id", "name_or_title", "lat", "lon"];
  const OPTIONAL_INTEL_FIELDS = ["intent", "activity", "behavior", "wealth", "influence", "vehicle", "pricing", "tags", "meta", "sources"];

  function hasField(n, key) {
    if (!n) return false;
    if (key === "lat") return Number.isFinite(Number(n?.lat ?? n?.location?.lat));
    if (key === "lon") return Number.isFinite(Number(n?.lon ?? n?.location?.lon ?? n?.lng ?? n?.location?.lng));
    return n[key] !== null && n[key] !== undefined;
  }

  function computeCoverageAndConfidence(n, nodeOrMesh) {
    const entId = readEntityId(nodeOrMesh, n);
    const cityId = readCityId(nodeOrMesh, n);
    const nameOrTitle = !!String(n?.name || n?.title || "").trim();

    const canonicalEntity = entId && st?.entitiesById instanceof Map ? st.entitiesById.get(entId) : null;
    const canonicalCity = cityId && st?.citiesById instanceof Map ? st.citiesById.get(cityId) : null;
    const canonicalCityId = String(canonicalEntity?.city_id ?? canonicalEntity?.cityId ?? "").trim();

    const requiredPresent = {
      entity_id: !!entId,
      city_id: !!cityId,
      name_or_title: nameOrTitle,
      lat: Number.isFinite(Number(n?.lat ?? n?.location?.lat)),
      lon: Number.isFinite(Number(n?.lon ?? n?.location?.lon ?? n?.lng ?? n?.location?.lng))
    };

    const requiredTotal = REQUIRED_ENTITY_FIELDS.length;
    const requiredHave = Object.values(requiredPresent).filter(Boolean).length;

    let optionalHave = 0;
    for (const f of OPTIONAL_INTEL_FIELDS) if (hasField(n, f)) optionalHave++;

    const optionalTotal = OPTIONAL_INTEL_FIELDS.length;
    const canonicalOk = !!canonicalEntity && !!canonicalCity && canonicalCityId === cityId;
    const requiredOk = Object.values(requiredPresent).every(Boolean) && canonicalOk;

    const coverage = {
      required: { have: requiredHave, total: requiredTotal, ok: requiredOk },
      optional: { have: optionalHave, total: optionalTotal },
      canonical: {
        entity_resolved: !!canonicalEntity,
        city_resolved: !!canonicalCity,
        city_match: !!canonicalEntity && !!canonicalCity && canonicalCityId === cityId
      }
    };

    if (!requiredOk) {
      return { coverage, confidence01: 0, disposition: canonicalOk ? "REJECT_MISSING_REQUIRED" : "REJECT_CANONICAL_MISMATCH" };
    }

    const frac = optionalTotal ? (optionalHave / optionalTotal) : 0;
    const confidence01 = Math.max(0, Math.min(1, 0.65 + 0.35 * frac));
    return { coverage, confidence01, disposition: "ACCEPT" };
  }

  function pct01(x) {
    if (!isFiniteNum(x)) return "—";
    return `${Math.round(x * 100)}%`;
  }

  function row(k, v) {
    return `
      <div class="d-row">
        <div class="d-k">${esc(k)}</div>
        <div class="d-v">${esc(fmt(v))}</div>
      </div>
    `;
  }

  function hr() { return `<div class="d-hr"></div>`; }
  function pill(text) { return `<span class="d-tag">${esc(text)}</span>`; }
  function sectionTitle(text) { return `<div class="panel-section-label">${esc(text)}</div>`; }

  function headerBlock(title, sub, badges = []) {
    return `
      <div class="d-head">
        <div>
          <div class="d-title">${esc(title)}</div>
          <div class="d-sub">${esc(sub)}</div>
        </div>
      </div>
    `;
  }

  function renderBlackDragonDossier(n) {
  const bd = n?.black_dragon_dossier;
  if (!bd || typeof bd !== "object") return "";

  const risks = Array.isArray(bd.risk_notes) ? bd.risk_notes : [];

  return `
    ${hr()}
    ${sectionTitle("Black Dragon Target Intelligence")}
    <div class="d-grid">
      ${row("Agency Class", titleCase(bd.agency_class || "—"))}
      ${row("Expected Value", bd.expected_value || "—")}
      ${row("Recommended Contact", bd.recommended_contact || "—")}
      ${row("Outreach Angle", bd.outreach_angle || "—")}
      ${row("Confidence", Number.isFinite(Number(bd.confidence)) ? `${Math.round(Number(bd.confidence) * 100)}%` : "—")}
      ${row("Review Status", titleCase(bd.review_status || "—"))}
      ${row("Live Outreach", bd.live_outreach_allowed ? "Allowed" : "Review Required")}
    </div>

    ${hr()}
    ${sectionTitle("Priority Summary")}
    <div class="d-v">${esc(bd.priority_summary || "—")}</div>

    ${hr()}
    ${sectionTitle("Recommended Next Step")}
    <div class="d-v">${esc(bd.recommended_next_step || "—")}</div>

    ${hr()}
    ${sectionTitle("Risk Notes")}
    <div class="d-v">
      ${
        risks.length
          ? risks.map((x) => `• ${esc(x)}`).join("<br/>")
          : "—"
      }
    </div>
  `;
}

  function renderSources(sources) {
    const list = Array.isArray(sources) ? sources : [];
    if (!list.length) return `<div class="d-v">—</div>`;

    const items = list.slice(0, 14).map((s) => {
      if (!s) return "";
      if (typeof s === "string") return `<div class="d-v">${esc(s)}</div>`;

      const label = String(s.label || s.name || s.type || "Source").trim() || "Source";
      const ref = String(s.url || s.ref || s.id || "").trim();
      const mode = String(s.mode || "").trim();
      const ts = String(s.loadedAt || s.date || "").trim();

      const meta = [ref, mode, ts].filter(Boolean).join(" · ");
      return `<div class="d-v">${pill(label)} ${esc(meta || "—")}</div>`;
    }).join("");

    return `<div class="d-grid">${items}</div>`;
  }

  function renderIntegrityBlock(lines) {
    const list = Array.isArray(lines) ? lines.filter(Boolean) : [];
    if (!list.length) return "";
    return `
      ${hr()}
      ${sectionTitle("Integrity")}
      <div class="d-v">
        ${list.map((x) => `• ${esc(x)}`).join("<br/>")}
      </div>
    `;
  }

  function renderRejectBlock(title, lines) {
    const integrity = Array.isArray(lines) ? lines.filter(Boolean) : [];
    return `
      <div class="dossier-wrap">
        ${headerBlock(title || "Integrity Failure", "DOSSIER REJECTED", ["REJECTED"])}
        ${renderIntegrityBlock(integrity.length ? integrity : ["Unknown dossier resolution failure."])}
      </div>
    `;
  }

  function buildDecisionBlock(n, score100, confidence01) {
    let verdict = "REVIEW";
    if (score100 >= 80 && confidence01 >= 0.75) verdict = "HIGH VALUE";
    else if (score100 >= 60) verdict = "MODERATE";
    else verdict = "LOW VALUE";

    const action =
      verdict === "HIGH VALUE"
        ? "PURSUE"
        : verdict === "MODERATE"
          ? "EVALUATE"
          : "DEPRIORITIZE";

    const why = Array.isArray(n?.rationale) ? n.rationale.slice(0, 2) : [];
    return { verdict, action, why };
  }

  function formatAttributes(attrs) {
    if (!attrs || typeof attrs !== "object") return [];

    const map = {
      priorityBand: (v) => `Priority: ${v === "high" ? "High-value target" : titleCase(v)}`,
      serviceability: (v) => `Serviceability: ${titleCase(v)}`,
      surface: (v) => `Surface: ${titleCase(v)}`
    };

    return Object.entries(attrs)
      .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
      .map(([k, v]) => {
        const fn = map[k];
        return fn ? fn(v) : `${titleCase(k)}: ${titleCase(v)}`;
      });
  }

  function formatTags(tags) {
    if (!Array.isArray(tags) || !tags.length) return "";
    return tags.map((t) => `<span class="d-tag">${esc(String(t).toUpperCase())}</span>`).join(" ");
  }

  function formatSupportingIntel(n) {
    const intelFields = ["intent", "activity", "behavior", "wealth", "influence", "pricing", "vehicle"];
    return intelFields
      .filter((f) => n?.[f] !== null && n?.[f] !== undefined && String(n[f]).trim() !== "")
      .map((f) => titleCase(f));
  }

  function typeLabel(kind, n) {
    const raw = String(n?.entity_type || kind || "entity").toLowerCase();
    if (raw === "person") return "PERSON";
    if (raw === "asset") return "ASSET";
    if (raw === "business") return "BUSINESS";
    return "ENTITY";
  }

  function renderCity(nodeOrMesh) {
    const bundle = resolveCanonicalCityBundle(nodeOrMesh);
    const raw = bundle.raw;
    const n = bundle.city || raw;

    const cityId = bundle.cityId;
    const count = countEntitiesForCity(cityId);

    const title = n?.name || n?.location?.city || n?.city || "City";
    const sub = `CITY · ${locLine(n)}`;

    const mode = readMode();
    const badges = [mode === "real" ? "REAL DATA" : "DEMO", "CITY"];

    const vectors = fmt(n?.vectors ?? n?.node?.vectors);
    const ranks = computeCityRanks();
    const r = cityId ? (ranks.get(cityId) || null) : null;

    const macroState = "—";
    const macroRoC = "—";

    const integrity = bundle.errors.slice();

    return `
      <div class="dossier-wrap">
        ${headerBlock(title, sub, badges)}

        ${hr()}
        ${sectionTitle("Executive Summary")}
        <div class="d-v">
          Structural city node with ${Number(count || 0).toLocaleString()} mapped entities.
          ${
            r
              ? `<br/><br/><b>Position:</b> Ranked ${r.rank} of ${r.of} within active dataset.`
              : ""
          }
        </div>

        ${hr()}
        ${sectionTitle("City Macro Context")}
        <div class="d-grid">
          ${row("City ID", cityId || "—")}
          ${row("City Rank", r ? `${r.rank} / ${r.of}` : "—")}
          ${row("Region", locLine(n))}
          ${row("Coords", coordsLine(n))}
          ${row("Entities", Number(count || 0).toLocaleString())}
          ${row("Macro State (0.6)", macroState)}
          ${row("Rate of Change (0.4)", macroRoC)}
          ${row("Mode", mode.toUpperCase())}
        </div>

        ${renderIntegrityBlock(integrity)}

        ${hr()}
        ${sectionTitle("Vectors")}
        <div class="d-grid">
          ${row("Vectors", vectors)}
        </div>

        ${hr()}
        ${sectionTitle("Compliance & Sources")}
        <div class="d-grid">
          ${row("Source Mode", mode === "real" ? "REAL" : "DEMO")}
          ${row("_src.loadedFrom", n?._src?.loadedFrom ?? "—")}
          ${row("_src.loadedAt", n?._src?.loadedAt ?? "—")}
        </div>
        ${renderSources(n?.sources || n?.node?.sources)}
      </div>
    `;
  }

  function renderEntity(nodeOrMesh) {
    const kind = readType(nodeOrMesh);
    const bundle = resolveCanonicalEntityBundle(nodeOrMesh);
    const raw = bundle.raw;
    const n = bundle.entity;

    const cityId = bundle.cityId;
    const entId = bundle.entityId;

    const integrity = bundle.errors.slice();

    if (!bundle.ok || !n) {
      return renderRejectBlock("Dossier Integrity Failure", [
        ...integrity,
        "No fallback rendering allowed.",
        "All dossiers must resolve via entitiesById map."
      ]);
    }

    const title =
      n?.name ||
      n?.title ||
      (kind === "business" ? "Business" : kind === "person" ? "Person" : "Entity");

    const sub = `ENTITY · ${locLine(n)}`;

    const mode = readMode();
    const typeBadge = typeLabel(kind, n);
    const badges = [mode === "real" ? "REAL DATA" : "DEMO", typeBadge];

    const score100 = normalizeScore100(n?.scores?.umbraScore ?? n?.umbraScore ?? n?.score);
    const founderScore = normalizeScore100(n?.scores?.founderScore);
    const { coverage, confidence01: computedConfidence, disposition } = computeCoverageAndConfidence(n, n);

    const realConfidence = Number.isFinite(Number(n?.scores?.confidence))
      ? Number(n.scores.confidence)
      : null;

    const confidence01 = realConfidence !== null ? realConfidence : computedConfidence;
    const decision = buildDecisionBlock(n, score100, confidence01);
    const rationale = Array.isArray(n?.rationale) ? n.rationale : [];
    const attributes = formatAttributes(n?.attributes);
    const tagsHtml = formatTags(n?.tags);
    const supportingIntel = formatSupportingIntel(n);

    if (disposition !== "ACCEPT") {
      if (disposition === "REJECT_CANONICAL_MISMATCH") {
        integrity.push("Hard reject: canonical entity/city resolution failed.");
      } else {
        integrity.push("Hard reject: missing required identity/geo fields.");
      }
    }

    return `
      <div class="dossier-wrap">
        ${headerBlock(title, sub, badges)}

        ${hr()}
        ${sectionTitle("Decision")}
        <div class="d-v" style="font-size: 1.05em;">
          <b style="font-size: 1.25em;">${esc(decision.verdict)} TARGET</b><br/><br/>
          <b>Confidence:</b> ${esc(pct01(confidence01))}<br/>
          <b>Recommendation:</b> ${esc(decision.action)}
        </div>

        ${hr()}
        ${sectionTitle("Why This Target")}
        <div class="d-v">
          ${
            decision.why.length
              ? decision.why.map((x) => `• ${esc(x)}`).join("<br/>")
              : (supportingIntel.length
                  ? supportingIntel.map((x) => `• ${esc(x)}`).join("<br/>")
                  : "• Insufficient supporting signals identified")
          }
        </div>

        ${hr()}
        ${sectionTitle("Key Signals")}
        <div class="d-grid">
          ${row("Score", score100 === null ? "—" : `${Math.round(score100)} / 100`)}
          ${row("Confidence", pct01(confidence01))}
          ${row("Type", typeBadge)}
          ${row("Location", locLine(n))}
        </div>

        ${hr()}
        ${sectionTitle("Detailed Rationale")}
        <div class="d-v">
          ${
            rationale.length
              ? rationale.map((x) => `• ${esc(x)}`).join("<br/>")
              : "—"
          }
        </div>

        ${renderBlackDragonDossier(n)}

        ${hr()}
        ${sectionTitle("Attributes")}
        <div class="d-v">
          ${
            attributes.length
              ? attributes.map((x) => `• ${esc(x)}`).join("<br/>")
              : "—"
          }
        </div>

        ${hr()}
        ${sectionTitle("Tags")}
        <div class="d-v">${tagsHtml || "—"}</div>

        ${hr()}
        ${sectionTitle("Supporting Intelligence")}
        <div class="d-v">
          ${
            supportingIntel.length
              ? supportingIntel.map((x) => `• ${esc(x)}`).join("<br/>")
              : "—"
          }
        </div>

        ${renderIntegrityBlock(integrity)}
        
                ${hr()}
        ${sectionTitle("Target Control")}
        <div class="d-v">
          <button id="pinEntityBtn" class="user-create" type="button">
            PIN TARGET
          </button>
        </div>

        ${hr()}
        ${sectionTitle("Reference")}
        <div class="d-grid">
          ${row("Entity ID", entId || "—")}
          ${row("City ID", cityId || "—")}
          ${row("Source Mode", mode === "real" ? "REAL" : "DEMO")}
          ${row("_src.loadedFrom", n?._src?.loadedFrom ?? "—")}
          ${row("_src.loadedAt", n?._src?.loadedAt ?? "—")}
          ${row("Inference", "None (view-only; observed data only)")}
        </div>

        ${hr()}
        ${sectionTitle("Sources")}
        ${renderSources(n?.sources)}
      </div>
    `;
  }

  function renderLegacyCluster(nodeOrMesh) {
    const n = unwrapNode(nodeOrMesh);
    const title = n?.city || n?.name || "Cluster";
    const sub = `CLUSTER · ${locLine(n)}`;

    const mode = readMode();
    const badges = [mode === "real" ? "REAL DATA" : "DEMO", "LEGACY"];

    const leads = Array.isArray(n?.leads) ? n.leads : [];
    const leadCount =
      (typeof n?.nodes === "number" && Number.isFinite(n.nodes)) ? n.nodes :
      leads.length;

    const preview = leads.slice(0, 10).map((l) => `<div class="d-v">• ${esc(l?.name || "Unknown")}</div>`).join("");

    return `
      <div class="dossier-wrap">
        ${headerBlock(title, sub, badges)}

        ${hr()}
        ${sectionTitle("Executive Summary")}
        <div class="d-v">
          Legacy cluster view. This is not the v1 entity dossier contract; use entity nodes for auditable dossiers.
        </div>

        ${hr()}
        ${sectionTitle("Summary")}
        <div class="d-grid">
          ${row("Coords", coordsLine(n))}
          ${row("Leads", Number(leadCount || 0).toLocaleString())}
          ${row("Vectors", n?.vectors || "—")}
        </div>

        ${hr()}
        ${sectionTitle("Lead Preview")}
        <div class="d-grid">
          ${preview || `<div class="d-v">No leads embedded.</div>`}
        </div>
      </div>
    `;
  }

  G.openDossier = function openDossier(nodeOrMesh) {
    const mount = getMount();
    if (!mount) return console.warn("[dossiers] No dossier mount found (#leadContent or #dossierPanel).");

    const t = readType(nodeOrMesh);
    let html = "";
    let title = "Lead Dossier";
    let entityId = null;
    let cityId = null;

    if (t === "city") {
      const bundle = resolveCanonicalCityBundle(nodeOrMesh);
      html = renderCity(nodeOrMesh);
      title = bundle.city?.name || bundle.raw?.name || bundle.raw?.location?.city || bundle.raw?.city || "Lead Dossier";
      cityId = bundle.cityId || null;
    } else if (t === "lead") {
      html = renderLegacyCluster(nodeOrMesh);
      const raw = unwrapNode(nodeOrMesh);
      title = raw?.city || raw?.name || "Lead Dossier";
    } else {
      const bundle = resolveCanonicalEntityBundle(nodeOrMesh);
      entityId = bundle.entityId || null;
      cityId = bundle.cityId || null;

      if (!entityId) {
        html = renderRejectBlock("Dossier Integrity Failure", [
          "Missing entity_id on node.",
          "Cannot open dossier without canonical ID."
        ]);
      } else {
        html = renderEntity(nodeOrMesh);
      }

      title =
        bundle.entity?.name ||
        bundle.entity?.title ||
        bundle.raw?.name ||
        bundle.raw?.title ||
        "Lead Dossier";
    }

    mount.innerHTML = html;
    setPanelTitle(title);

        try {
      const btn = document.getElementById("pinEntityBtn");
      if (btn && entityId) {
        const user = window.UmbraUsers?.getActiveUser?.();
        const pinned = user?.state?.pinnedEntities || [];

        const isPinned = pinned.includes(entityId);

        btn.textContent = isPinned ? "UNPIN TARGET" : "PIN TARGET";

        btn.onclick = () => {
          if (isPinned) {
            window.UmbraUsers?.unpinEntity?.(entityId);
          } else {
            window.UmbraUsers?.pinEntity?.(entityId);
          }

          window.UmbraGlobe?.updatePinnedVisuals?.();
          G.openDossier(nodeOrMesh);
        };
      }
    } catch (e) {
      console.warn("[dossier] pin control failed", e);
    }

    setDossierState({
      open: true,
      type: t,
      entityId,
      cityId,
      title
    });

    // HARD SYNC: ensure dossier matches active selection
    try {
      const activeId = String(st.activeEntityId || "").trim();
      const dossierId = String(entityId || "").trim();

      if (activeId && dossierId && activeId !== dossierId) {
        console.error("[dossiers] ENTITY MISMATCH AFTER RENDER", {
          activeEntityId: activeId,
          dossierEntityId: dossierId
        });

        // force correction
        st.activeEntityId = dossierId;
      }
    } catch {}
  };

  G.openDossierForNode = function openDossierForNode(nodeOrMesh) {
    G.openDossier(nodeOrMesh);
  };

  G.getOpenDossierState = function getOpenDossierState() {
    return { ...st._dossierState };
  };

  G.clearDossier = function clearDossier() {
    const mount = getMount();
    if (mount) mount.innerHTML = `<div class="dossier-wrap"><div class="d-v">No selection.</div></div>`;
    setPanelTitle("Lead Dossier");
    clearDossierState();
  };

  function bindCloseOnce() {
    if (st._dossierCloseBound) return;
    st._dossierCloseBound = true;

    document.addEventListener("click", (e) => {
      const btn = e.target?.closest?.('[data-umbra-action="close-dossier"]');
      if (!btn) return;
      G.clearDossier?.();
    });
  }

  bindCloseOnce();
  G.clearDossier();

  console.log("[dossiers] ready (v1: DATA-first maps, canonical resolution, no inference).");
})();