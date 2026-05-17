// public/globe/city_loader.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) return console.error("[city_loader] UmbraGlobe missing.");

  function str(v) {
    const s = String(v ?? "").trim();
    return s || "";
  }

  function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  async function fetchJsonStrict(url) {
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }

    const cleaned = String(text || "").replace(/^\uFEFF/, "").trimStart();
    const head = cleaned.slice(0, 120);

    if (
      head.startsWith("<") ||
      head.startsWith("//") ||
      head.startsWith("/*") ||
      head.startsWith("(function")
    ) {
      throw new Error(`NOT_JSON for ${url}: head="${head.replace(/\s+/g, " ").slice(0, 80)}"`);
    }

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      throw new Error(`JSON_PARSE_FAIL for ${url}: ${String(e?.message || e)}`);
    }
  }

  async function loadImageTexture(url) {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        const tex = new THREE.Texture(img);
        tex.needsUpdate = true;
        tex.userData = tex.userData || {};
        tex.userData.__umbraOwned = true;

        if (tex.colorSpace !== undefined && window.THREE?.SRGBColorSpace) {
          tex.colorSpace = THREE.SRGBColorSpace;
        } else if (tex.encoding !== undefined && window.THREE?.sRGBEncoding !== undefined) {
          tex.encoding = THREE.sRGBEncoding;
        }

        resolve(tex);
      };
      img.onerror = () => reject(new Error(`image failed to load: ${url}`));
      img.src = url;
    });
  }

  function validateMeta(meta, expectedCityId) {
    const cid = str(meta?.city_id);
    if (!cid || cid !== str(expectedCityId)) {
      throw new Error(`meta city_id mismatch: expected ${str(expectedCityId)}, got ${cid || "empty"}`);
    }

    if (!meta.bounds || typeof meta.bounds !== "object") {
      throw new Error("invalid meta: missing bounds");
    }

    const north = num(meta?.bounds?.north);
    const south = num(meta?.bounds?.south);
    const east = num(meta?.bounds?.east);
    const west = num(meta?.bounds?.west);

    if (north === null || south === null || east === null || west === null) {
      throw new Error("invalid meta: incomplete bounds");
    }
    if (!(north > south)) throw new Error("invalid meta: north <= south");
    if (!(east > west)) throw new Error("invalid meta: east <= west");

    const widthM = num(meta?.width_m);
    const heightM = num(meta?.height_m);
    if (widthM === null || heightM === null || widthM <= 0 || heightM <= 0) {
      throw new Error("invalid meta: width_m/height_m");
    }

    return true;
  }

  function resolveImagePath(basePath, meta) {
    const explicit = str(meta?.image);
    if (explicit) return explicit;
    return `${basePath}base.png`;
  }

  G.loadCityAsset = async function loadCityAsset(city_id) {
    const st = G.state || {};
    const cid = str(city_id);
    if (!cid) return null;

    const basePath = `/assets/cities/${cid}/`;

    try {
      const meta = await fetchJsonStrict(basePath + "meta.json");
      validateMeta(meta, cid);

      let tex = null;
      let tileInfo = null;

      const hasTiles =
        !!meta?.tiles &&
        typeof meta.tiles === "object" &&
        !!str(meta.tiles.url);

      if (hasTiles) {
        if (typeof G.buildCityTextureFromTiles !== "function") {
          throw new Error("city tile builder not loaded");
        }

        const built = await G.buildCityTextureFromTiles(meta);
        if (!built || !built.texture) {
          throw new Error("tile builder returned empty texture");
        }

        tex = built.texture;
        tex.userData = tex.userData || {};
        tex.userData.__umbraOwned = true;

        tileInfo = {
          zoom: built.zoom,
          metersPerPixel: built.metersPerPixel,
          pixelWidth: built.pixelWidth,
          pixelHeight: built.pixelHeight
        };
      } else {
        const imagePath = resolveImagePath(basePath, meta);
        tex = await loadImageTexture(imagePath);
      }

      st.activeCityMeta = meta;
      st.activeCityTexture = tex;
      st.activeCityTileInfo = tileInfo;

      console.log("[city_loader] LOADED", {
        city_id: cid,
        mode: hasTiles ? "tiles" : "image",
        image: hasTiles ? null : resolveImagePath(basePath, meta),
        tileInfo
      });

      return {
        meta,
        tex,
        tileInfo
      };
    } catch (e) {
      console.error("[city_loader] FAILED", e);
      return null;
    }
  };
})();