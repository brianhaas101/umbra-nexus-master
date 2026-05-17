/* public/globe/umbra_data.v1.js
   SINGLE AUTHORITY (Single-Data-File mode):
   - loads existing /data/leads_master.json
   - deterministically converts -> window.UMBRA_DATA = { cities:[], entities:[] }
   - NO rendering here. Data-only. Traceable.
*/
(function () {
  "use strict";

  // HARD LOCK: disable legacy loader path everywhere
  window.__UMBRA_DATA_V1_INSTALLED__ = true;

  console.log(
    "[SIGNATURE] globe/umbra_data.v1.js LOADED",
    new Date().toISOString(),
    String(document?.currentScript?.src || "")
  );

  function hash32(str) {
    let h = 0x811c9dc5;
    const s = String(str || "");
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
  }

  function num(x) {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }

  function str(x) {
    const s = String(x ?? "").trim();
    return s.length ? s : "";
  }

  function clampLon180(lon) {
    const v = num(lon);
    if (v === null) return null;
    let x = ((v + 180) % 360 + 360) % 360 - 180;
    if (x === 180) x = -180;
    return x;
  }

  function validLat(lat) {
    const v = num(lat);
    return v !== null && v >= -90 && v <= 90;
  }

  function validLon(lon) {
    const v = num(lon);
    return v !== null && v >= -180 && v <= 180;
  }

  function hasOwn(obj, k) {
    return !!obj && Object.prototype.hasOwnProperty.call(obj, k);
  }

  function pickNonEmpty(obj, keys) {
    for (const k of keys) {
      if (!hasOwn(obj, k)) continue;
      const v = obj[k];
      if (v == null) continue;
      if (typeof v === "string" && v.trim() === "") continue;
      return v;
    }
    return undefined;
  }

  function extractLeads(raw) {
  if (Array.isArray(raw)) return raw;

  if (raw && typeof raw === "object") {
    const a =
      raw.targets ||
      raw.leads ||
      raw.items ||
      raw.rows ||
      raw.data ||
      raw.records ||
      raw.results;

    if (Array.isArray(a)) return a;
  }

  return [];
}

  function makeCityId(cityName, region) {
    const key = `${str(cityName).toUpperCase()}|${str(region).toUpperCase()}`;
    return "city_" + hash32(key);
  }

  function makeEntityId(row, fallbackIndex) {
    const explicit = pickNonEmpty(row, [
      "entity_id",
      "entityId",
      "lead_id",
      "leadId",
      "id",
      "_id",
      "uuid",
    ]);
    if (explicit != null && String(explicit).trim()) return String(explicit).trim();

    const loc = row && typeof row.location === "object" ? row.location : null;

    const key = JSON.stringify({
      name: str(pickNonEmpty(row, ["name", "business", "company", "title", "label"])),
      city: str(
        pickNonEmpty(loc, ["city", "city_name", "City", "town", "locality"]) ??
          pickNonEmpty(row, ["city", "city_name", "City", "town", "locality"])
      ),
      region: str(
        pickNonEmpty(loc, ["region", "state", "st", "province", "Region", "State"]) ??
          pickNonEmpty(row, ["region", "state", "st", "province", "Region", "State"])
      ),
      lat: num(
        pickNonEmpty(loc, ["lat", "latitude", "Lat", "Latitude"]) ??
          pickNonEmpty(row, ["lat", "latitude", "Lat", "Latitude"])
      ),
      lon: num(
        pickNonEmpty(loc, ["lon", "lng", "longitude", "Lon", "Lng", "Longitude"]) ??
          pickNonEmpty(row, ["lon", "lng", "longitude", "Lon", "Lng", "Longitude"])
      ),
      i: fallbackIndex,
    });

    return "ent_" + hash32(key);
  }

  function inferEntityType(row) {
    const loc = row && typeof row.location === "object" ? row.location : null;
   const explicitEntityType = str(row?.entity_type || row?.entityType || "");
if (explicitEntityType) return explicitEntityType;

const raw = String(
  pickNonEmpty(row, ["entityType", "leadType", "type"]) ??
  pickNonEmpty(loc, ["entityType", "leadType", "type"]) ??
  ""
).toLowerCase();

    if (raw.includes("business") || raw.includes("company") || raw.includes("llc") || raw.includes("inc")) return "business";
    if (raw.includes("asset") || raw.includes("property") || raw.includes("parcel")) return "asset";
    if (raw.includes("person") || raw.includes("owner") || raw.includes("investor") || raw.includes("exec")) return "person";
    return "entity";
  }

  function clampScore100(v, fallback = 50) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(100, n));
  }

  function applyCityMapPrecisionCorrection(cityName, region, lat, lon) {
    return { lat, lon };
  }

  function cityCoordsFor(city, region) {
  const key = `${str(city).toUpperCase()}|${str(region).toUpperCase()}`;

  const coords = {
    "PHOENIX|AZ": { lat: 33.4484, lon: -112.0740 },
    "TUCSON|AZ": { lat: 32.2226, lon: -110.9747 },
    "MESA|AZ": { lat: 33.4152, lon: -111.8315 },
    "GLENDALE|AZ": { lat: 33.5387, lon: -112.1860 },
    "SCOTTSDALE|AZ": { lat: 33.4942, lon: -111.9261 },
    "CHANDLER|AZ": { lat: 33.3062, lon: -111.8413 },
    "TEMPE|AZ": { lat: 33.4255, lon: -111.9400 },
    "PEORIA|AZ": { lat: 33.5806, lon: -112.2374 },
    "SURPRISE|AZ": { lat: 33.6292, lon: -112.3679 },
    "YUMA|AZ": { lat: 32.6927, lon: -114.6277 },
    "FLAGSTAFF|AZ": { lat: 35.1983, lon: -111.6513 },
    "PRESCOTT|AZ": { lat: 34.5400, lon: -112.4685 },
    "KINGMAN|AZ": { lat: 35.1894, lon: -114.0530 },
    "CASA GRANDE|AZ": { lat: 32.8795, lon: -111.7574 },
    "SIERRA VISTA|AZ": { lat: 31.5455, lon: -110.2773 },
    "NOGALES|AZ": { lat: 31.3404, lon: -110.9343 },
    "SAFFORD|AZ": { lat: 32.8339, lon: -109.7076 },
    "GLOBE|AZ": { lat: 33.3942, lon: -110.7865 },
    "PARKER|AZ": { lat: 34.1500, lon: -114.2891 },
    "HOLBROOK|AZ": { lat: 34.9022, lon: -110.1582 },
    "BISBEE|AZ": { lat: 31.4482, lon: -109.9284 },
    "AVONDALE|AZ": { lat: 33.4356, lon: -112.3496 },
    "GOODYEAR|AZ": { lat: 33.4353, lon: -112.3577 },
    "BUCKEYE|AZ": { lat: 33.3703, lon: -112.5838 },
    "GILBERT|AZ": { lat: 33.3528, lon: -111.7890 },
    "MARICOPA|AZ": { lat: 33.0581, lon: -112.0476 },
    "APACHE JUNCTION|AZ": { lat: 33.4151, lon: -111.5496 },
    "BULLHEAD CITY|AZ": { lat: 35.1359, lon: -114.5286 },
    "BENSON|AZ": { lat: 31.9679, lon: -110.2945 },
    "COOLIDGE|AZ": { lat: 32.9778, lon: -111.5176 },
    "COTTONWOOD|AZ": { lat: 34.7392, lon: -112.0099 },
    "DOUGLAS|AZ": { lat: 31.3445, lon: -109.5453 },
    "ELOY|AZ": { lat: 32.7559, lon: -111.5548 },
    "FLORENCE|AZ": { lat: 33.0315, lon: -111.3873 },
    "SEDONA|AZ": { lat: 34.8697, lon: -111.7610 },
    "SHOW LOW|AZ": { lat: 34.2542, lon: -110.0298 },
    "WILLCOX|AZ": { lat: 32.2529, lon: -109.8320 }
  };

  return coords[key] || null;
}

  function convertLeadsToUmbra(leads) {
    const cityMap = new Map();
    const entityIdSet = new Set();
    const entities = [];

    let skippedInvalidCoords = 0;
    let skippedMissingLocation = 0;
    let skippedMissingRequired = 0;
    let skippedDuplicateEntity = 0;
    let cityCoordDriftCount = 0;

    for (let i = 0; i < leads.length; i++) {
      const r = leads[i] || {};
      const loc = r && typeof r.location === "object" ? r.location : null;

      const cityName = str(
        pickNonEmpty(loc, ["city", "city_name", "City", "town", "locality"]) ??
          pickNonEmpty(r, ["city", "city_name", "City", "town", "locality"])
      );

      let region = str(
      pickNonEmpty(loc, ["region", "state", "st", "province", "Region", "State"]) ??
      pickNonEmpty(r, ["region", "state", "st", "province", "Region", "State"])
      );

      // HARD FALLBACK FOR BLACK DRAGON DATA
      if (!region && r?.state) {
      region = str(r.state);
      }

      const country = str(
      pickNonEmpty(loc, ["country", "Country"]) ??
      pickNonEmpty(r, ["country", "Country"]) ??
      "US"
      );

      const entityName =
      str(
      pickNonEmpty(r, ["name", "business", "company", "title", "label", "agency_name"])
      );

      const fallbackCoords = cityCoordsFor(cityName, region);

      let lat = num(
      pickNonEmpty(loc, ["lat", "latitude", "Lat", "Latitude"]) ??
      pickNonEmpty(r, ["lat", "latitude", "Lat", "Latitude"]) ??
      fallbackCoords?.lat
      );

const lonRaw = num(
  pickNonEmpty(loc, ["lon", "lng", "longitude", "Lon", "Lng", "Longitude"]) ??
    pickNonEmpty(r, ["lon", "lng", "longitude", "Lon", "Lng", "Longitude"]) ??
    fallbackCoords?.lon
);

let lon = lonRaw === null ? null : clampLon180(lonRaw);

      if (!cityName || !region || lat === null || lon === null) {
        skippedMissingLocation++;
        continue;
      }

      if (!country || !entityName) {
        skippedMissingRequired++;
        continue;
      }

      if (!validLat(lat) || !validLon(lon)) {
        skippedInvalidCoords++;
        continue;
      }

      const corrected = applyCityMapPrecisionCorrection(cityName, region, lat, lon);
      lat = corrected.lat;
      lon = corrected.lon;

      if (!validLat(lat) || !validLon(lon)) {
        skippedInvalidCoords++;
        continue;
      }

      const city_id = makeCityId(cityName, region);

      if (!cityMap.has(city_id)) {
        cityMap.set(city_id, {
          city_id,
          name: cityName,
          region,
          country,
          lat,
          lon,
          location: {
            city: cityName,
            region,
            country,
            lat,
            lon
          }
        });
      } else {
        const existing = cityMap.get(city_id);
        const drifted =
          Math.abs(Number(existing.lat) - lat) > 0.01 ||
          Math.abs(Number(existing.lon) - lon) > 0.01;

        if (drifted) {
          cityCoordDriftCount++;

          if (!existing._coordLockLogged) {
            existing._coordLockLogged = true;
            console.warn("[umbra_data.v1] CITY COORD LOCKED", {
              city_id,
              locked: { lat: existing.lat, lon: existing.lon },
              ignoredIncoming: { lat, lon },
              rowIndex: i
            });
          }

          // FIRST-LOCK policy:
          // keep the first deterministic city coordinate forever
          // ignore all later row-level variations
        }
      }

      const entity_id = makeEntityId(r, i);
      if (entityIdSet.has(entity_id)) {
        skippedDuplicateEntity++;
        console.warn("[umbra_data.v1] DUPLICATE ENTITY ID SKIPPED", {
          entity_id,
          rowIndex: i
        });
        continue;
      }
      entityIdSet.add(entity_id);

      const entity_type = inferEntityType(r);
      const score = clampScore100(
        pickNonEmpty(r, ["umbraScore", "score"]) ??
        r?.scores?.umbraScore ??
        r?.scores?.founderScore ??
        50,
        50
      );

      entities.push({
  entity_id,
  entity_type,
  city_id,
  name: entityName,
  lat,
  lon,

  _live_account_source: r?._live_account_source || "",
  _pass3: r?._pass3 || null,

  location: {
    city: cityName,
    region,
    country,
    lat,
    lon
  },
        scores: {
          umbraScore: score,
          founderScore: Number.isFinite(Number(r?.scores?.founderScore))
            ? Number(r.scores.founderScore)
            : null,
          confidence: Number.isFinite(Number(r?.scores?.confidence))
            ? Number(r.scores.confidence)
            : null
        },

        rationale: Array.isArray(r?.rationale) ? r.rationale : (r?.rationale ?? null),
        attributes: r?.attributes || null,
        vehicle: r?.vehicle || null,
        pricing: r?.pricing || null,
        intent: r?.intent || null,
        activity: r?.activity || null,
        wealth: r?.wealth || null,
        influence: r?.influence || null,
        behavior: r?.behavior || null,
        tags: Array.isArray(r?.tags) ? r.tags : [],
        meta: r?.meta || null,

        black_dragon_dossier: r?.black_dragon_dossier || null,
        black_dragon_rank: r?.black_dragon_rank || null,
        black_dragon_outreach: r?.black_dragon_outreach || null,
        _live_account_source: r?._live_account_source || "",
        _pass3: r?._pass3 || null,

        sources: Array.isArray(r?.sources) ? r.sources : [],
        _src: {
          ...(r?._src || {}),
          rowIndex: i,
          leadId: str(pickNonEmpty(r, ["id", "lead_id", "leadId"])),
          leadType: str(pickNonEmpty(r, ["leadType", "type"])),
        },
      });
    }

    const cities = Array.from(cityMap.values())
      .map((c) => {
        const clean = { ...c };
        delete clean._coordLockLogged;
        return clean;
      })
      .sort((a, b) => String(a.city_id).localeCompare(String(b.city_id)));

    entities.sort((a, b) =>
      String(a.entity_id).localeCompare(String(b.entity_id))
    );

    const cityIds = new Set(cities.map((c) => c.city_id));
    for (const e of entities) {
      if (!cityIds.has(e.city_id)) {
        throw new Error(`ENTITY_WITH_INVALID_CITY:${e.entity_id}`);
      }
    }

    return {
      cities,
      entities,
      report: {
        leads_in: Array.isArray(leads) ? leads.length : 0,
        cities_out: cities.length,
        entities_out: entities.length,
        skipped_invalid_coords: skippedInvalidCoords,
        skipped_missing_location: skippedMissingLocation,
        skipped_missing_required: skippedMissingRequired,
        skipped_duplicate_entity: skippedDuplicateEntity,
        city_coord_drift: cityCoordDriftCount,
        city_coord_policy: "FIRST_LOCK"
      }
    };
  }

  async function fetchJsonStrict(url) {
    const r = await fetch(url, { cache: "no-store" });
    const ct = String(r.headers.get("content-type") || "");
    const txt = await r.text();

    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);

    const head = String(txt || "").trimStart().slice(0, 120);
    if (
      head.startsWith("<") ||
      head.startsWith("//") ||
      head.startsWith("/*") ||
      head.startsWith("(function")
    ) {
      throw new Error(
        `NOT_JSON from ${url}. content-type=${ct || "unknown"}. head="${head
          .replace(/\s+/g, " ")
          .slice(0, 100)}"`
      );
    }

    const cleaned = txt.replace(/^\uFEFF/, "");
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      throw new Error(`JSON_PARSE_FAIL for ${url}: ${String(e?.message || e)}`);
    }
  }

  (async function boot() {
    const startedAt = new Date().toISOString();
    const clientKey = window.UMBRA_CLIENT_KEY || "default";

    const sourceUrl =
  clientKey === "black_dragon"
    ? "/data/clients/black_dragon/black_dragon_pass4_outreach_enabled.json"
    : "./data/leads_master.json";

    try {
      const raw = await fetchJsonStrict(sourceUrl);
      const leads = extractLeads(raw);

      const built = convertLeadsToUmbra(leads);

      if (!built.cities.length || !built.entities.length) {
        throw new Error("EMPTY_DATASET_AFTER_BUILD");
      }

      const sig = hash32(
        JSON.stringify({
          cities: built.cities,
          entities: built.entities
        })
      );

      const src = {
        loadedFrom: sourceUrl,
        loadedAt: startedAt,
        datasetHash: sig,
        mode: "SINGLE_DATA_FILE_V1",
        note:
       clientKey === "black_dragon"
       ? "Derived deterministically from Black Dragon clean live account dataset"
        : "Derived deterministically from leads_master.json",
        buildReport: built.report
      };

      for (const c of built.cities) c._src = src;
      for (const e of built.entities) {
        e._src = { ...(e._src || {}), ...src };
      }

      window.UMBRA_DATA = {
        cities: built.cities,
        entities: built.entities,
        _src: src,
      };

      window.UMBRA_DATA_READY = true;

      console.log("[umbra_data.v1] READY", {
        cities: built.cities.length,
        entities: built.entities.length,
        from: sourceUrl,
        report: built.report,
        sampleCity: built.cities[0] || null,
        sampleEntity: built.entities[0] || null,
      });
    } catch (e) {
      window.UMBRA_DATA = {
        cities: [],
        entities: [],
        _src: { error: String(e?.message || e), loadedAt: startedAt },
      };
      window.UMBRA_DATA_READY = false;
      console.error("[umbra_data.v1] FAIL", window.UMBRA_DATA._src);
    }
  })();
})();
