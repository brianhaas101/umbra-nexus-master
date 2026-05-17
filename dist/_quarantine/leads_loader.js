// public/leads_loader.js
// Founder v1 loader (hardened):
// - Loads leads_master.json (fallback: ./leads_master.json, ./leads.json)
// - Produces deterministic entities keyed by entity_id and parented by city_id
// - ENFORCES: city_id derived ONLY from canonical city key (structural parent contract)
// - ENFORCES: entity_id globally unique by namespacing with city_id (deterministic)
//
// Exposes:
//   window.UMBRA_LEADS_RAW   (clean leads, each with city_id + entity_id)
//   window.UMBRA_LEADS       (legacy city clusters, kept for back-compat)
//   window.UMBRA_DATA        ({ cities:[...], entities:[...] })  <-- v1 contract
//   window.UMBRA_DATA_READY  = true

// ------------------------------------------------------------
// SINGLE AUTHORITY GUARD
// If data.v1 is installed, this legacy loader MUST NOT run.
// ------------------------------------------------------------
if (window.__UMBRA_DATA_V1_INSTALLED__) {
  console.warn("[leads_loader] disabled: data.v1 single authority active.");
} else {

(async function () {
  async function loadJSON(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    return await res.json();
  }

  function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function avg(nums) {
    const list = Array.isArray(nums) ? nums.filter((x) => Number.isFinite(Number(x))) : [];
    if (!list.length) return 0;
    let sum = 0;
    for (const x of list) sum += Number(x);
    return sum / list.length;
  }

  function hashStr(s) {
    let h = 2166136261;
    const str = String(s || "");
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return (h >>> 0).toString(16);
  }

  function normStr(s) { return String(s || "").trim(); }
  function normId(s) {
    const x = normStr(s);
    return x ? x : null;
  }

  // Single source city key (MUST match clusters + leads)
  function cityKeyParts(lead) {
    const city = normStr(lead?.location?.city || lead?.city || "Unknown");
    const region = normStr(lead?.location?.region || lead?.region || "");
    const state =
      normStr(
        lead?.location?.state ||
        lead?.state ||
        lead?.location?.province ||
        lead?.province ||
        ""
      );
    const country = normStr(lead?.location?.country || lead?.country || "");
    return { city, region, state, country };
  }

  function keyCityFromParts(parts) {
    return `${parts.city}|${parts.state}|${parts.region}|${parts.country}`.toLowerCase();
  }

  function keyCity(lead) { return keyCityFromParts(cityKeyParts(lead)); }

  function makeCityIdFromKey(k) {
    // deterministic + stable
    const kk = String(k || "").toLowerCase();
    const safe = kk.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    const h = hashStr(kk);
    return `city_${safe || "unknown"}_${h}`;
  }

  function inferEntityType(lead) {
    const t = String(lead?.entityType || lead?.leadType || lead?.type || "").toLowerCase();
    if (t.includes("business") || t.includes("company") || t.includes("llc") || t.includes("inc")) return "business";
    if (t.includes("asset") || t.includes("property") || t.includes("parcel")) return "asset";
    if (t.includes("person") || t.includes("owner") || t.includes("investor") || t.includes("exec")) return "person";
    // default v1 safe
    return "business";
  }

  function clampScore100(v, fallback = 50) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(100, n));
  }

  function makeCanonicalEntityId(providedEntityId, lead, city_id) {
    // Deterministic, never Math.random.
    // IMPORTANT: entity_id MUST be globally unique; namespace by city_id.
    const provided = normId(providedEntityId);

    if (provided) {
      // Use the provided ID as an INPUT, but still namespace by city_id deterministically.
      return `ent_${hashStr(provided)}_${hashStr(city_id)}`;
    }

    // fallback: stable fingerprint from name+coords+city
    const lat = lead?.location?.lat ?? lead?.location?.latitude ?? lead?.lat ?? lead?.latitude;
    const lon =
      lead?.location?.lon ??
      lead?.location?.lng ??
      lead?.location?.longitude ??
      lead?.lon ?? lead?.lng ?? lead?.longitude;

    const fp = `${normStr(lead?.name)}|${String(lat)}|${String(lon)}|${String(city_id)}`;
    return `ent_${hashStr(fp)}_${hashStr(city_id)}`;
  }

  try {
    let leads = [];
    let loadedFrom = "";

    try {
      leads = await loadJSON("./data/leads_master.json");
      loadedFrom = "./data/leads_master.json";
    } catch {
      leads = await loadJSON("./leads_master.json").catch(() => []);
      loadedFrom = "./leads_master.json";
      if (!Array.isArray(leads) || !leads.length) {
        leads = await loadJSON("./leads.json");
        loadedFrom = "./leads.json";
      }
    }

    const loadedAt = new Date().toISOString();

    // Track uniqueness (hard requirement)
    const seenEntityIds = new Set();

    const clean = (Array.isArray(leads) ? leads : [])
      .map((lead) => {
        const lat = toNum(lead?.location?.lat ?? lead?.location?.latitude ?? lead?.lat ?? lead?.latitude);
        const lon = toNum(
          lead?.location?.lon ??
          lead?.location?.lng ??
          lead?.location?.longitude ??
          lead?.lon ?? lead?.lng ?? lead?.longitude
        );
        if (lat === null || lon === null) return null;

        const parts = cityKeyParts(lead);
        const k = keyCityFromParts(parts);

        // ✅ STRUCTURAL PARENT CONTRACT:
        // city_id is derived ONLY from canonical city key so all members of the bucket
        // share the same city_id deterministically.
        const city_id = makeCityIdFromKey(k);

        // Keep any provided IDs ONLY as trace metadata (never as authority)
        const providedCityId = normId(lead?.city_id ?? lead?.cityId);
        const providedEntityId = normId(lead?.entity_id ?? lead?.entityId);

        let entity_id = makeCanonicalEntityId(providedEntityId, lead, city_id);

        // Enforce global uniqueness deterministically even if the dataset is messy.
        // If collision occurs, fold in an additional stable token.
        if (seenEntityIds.has(entity_id)) {
          const extra = `${entity_id}|${normStr(lead?.name)}|${lat}|${lon}|${normStr(lead?.id ?? lead?.uuid ?? "")}`;
          entity_id = `ent_${hashStr(extra)}_${hashStr(city_id)}`;
        }
        seenEntityIds.add(entity_id);

        const entity_type = inferEntityType(lead);

        const score = clampScore100(
          lead?.scores?.umbraScore ??
          lead?.scores?.founderScore ??
          lead?.umbraScore ??
          lead?.score ??
          50,
          50
        );

        return {
          id: lead?.id || null,

          // v1 contract keys (authoritative)
          entity_id,
          entity_type,
          city_id,

          // trace: what the source claimed (non-authoritative)
          _provided: {
            city_id: providedCityId,
            entity_id: providedEntityId,
          },

          name: lead?.name || "Unknown",

          lat,
          lon,

          location: {
            city: parts.city,
            region: parts.region,
            state: parts.state,
            country: parts.country,
            lat,
            lon,
          },

          scores: {
            umbraScore: score,
            founderScore: Number.isFinite(Number(lead?.scores?.founderScore)) ? Number(lead.scores.founderScore) : null,
          },

          vehicle: lead?.vehicle || null,
          pricing: lead?.pricing || null,
          intent: lead?.intent || null,
          activity: lead?.activity || null,
          wealth: lead?.wealth || null,
          influence: lead?.influence || null,
          behavior: lead?.behavior || null,

          tags: Array.isArray(lead?.tags) ? lead.tags : [],
          meta: lead?.meta || null,

          sources: Array.isArray(lead?.sources) ? lead.sources : [],

          _src: { loadedFrom, loadedAt, schema: "founder_v1" },
        };
      })
      .filter(Boolean);

    window.UMBRA_LEADS_RAW = clean;

    const byCity = new Map();
    for (const lead of clean) {
      const k = keyCity(lead);
      if (!byCity.has(k)) byCity.set(k, []);
      byCity.get(k).push(lead);
    }

    const cityKeys = Array.from(byCity.keys()).sort();

    const clusters = [];
    const cities = [];
    const entities = [];

    for (const k of cityKeys) {
      const list = byCity.get(k) || [];
      if (!list.length) continue;

      list.sort((a, b) => String(a.entity_id).localeCompare(String(b.entity_id)));

      const parts = cityKeyParts(list[0]);

      // HARD LINK: city_id is canonical from key, so all members share it
      const city_id = String(list[0].city_id);

      const lat = avg(list.map((x) => x.location?.lat));
      const lon = avg(list.map((x) => x.location?.lon));

      const scoreAvg = avg(list.map((x) => Number(x.scores?.umbraScore || 0)));
      const scoreNorm = Math.max(0, Math.min(1, scoreAvg / 100));

      clusters.push({
        id: city_id,
        name: `${parts.city} Cluster`,
        city: `${parts.city}${parts.region ? ", " + parts.region : ""}${parts.state ? ", " + parts.state : ""}`,
        lat,
        lon,
        nodes: list.length,
        vectors: `Leads · ${list.length}`,
        score: scoreNorm,
        status: scoreAvg >= 80 ? "hot" : scoreAvg >= 60 ? "warm" : "cold",
        leads: list,
        location: { ...parts, lat, lon },
      });

      const cityEntities = [];

      for (const l of list) {
        const ent = {
          entity_id: l.entity_id,
          entity_type: l.entity_type,
          city_id: l.city_id,

          name: l.name,

          lat: l.lat,
          lon: l.lon,
          location: l.location,

          scores: l.scores,

          vehicle: l.vehicle,
          pricing: l.pricing,
          intent: l.intent,
          activity: l.activity,
          wealth: l.wealth,
          influence: l.influence,
          behavior: l.behavior,

          tags: l.tags,
          meta: l.meta,

          sources: Array.isArray(l.sources) ? l.sources : [],
          _src: l._src,
          _provided: l._provided,
        };

        entities.push(ent);
        cityEntities.push(ent);
      }

      cities.push({
        city_id,
        name: parts.city || "Unknown",
        region: parts.region || parts.state || "",
        country: parts.country || "",
        lat,
        lon,
        entities: cityEntities, // convenience only
        _src: { loadedFrom, loadedAt, schema: "founder_v1" },
      });
    }

    window.UMBRA_LEADS = clusters;

    window.UMBRA_DATA = {
      cities,
      entities,
      _src: { loadedFrom, loadedAt, schema: "founder_v1" },
    };

    window.UMBRA_DATA_READY = true;

    console.log(
      `[leads_loader] Source: ${loadedFrom} | Leads: ${clean.length} | Cities: ${cities.length} | Entities: ${entities.length} | mode=${String(window.UMBRA_MODE || "demo").toLowerCase()}`
    );
    if (cities.length) console.log("[leads_loader] Sample city:", cities[0]);
    if (entities.length) console.log("[leads_loader] Sample entity:", entities[0]);

    if (!cities.length) console.warn("[leads_loader] No cities created. Check JSON has valid coords + city fields.");
  } catch (err) {
    console.error("[leads_loader] ERROR:", err);
    window.UMBRA_LEADS_RAW = [];
    window.UMBRA_LEADS = [];
    window.UMBRA_DATA = { cities: [], entities: [] };
    window.UMBRA_DATA_READY = true;
  }
})();

}
