// public/globe/city_loader.js
(function () {
  const G = window.UmbraGlobe;
  if (!G || !window.THREE) {
    console.error("[city_loader] missing UmbraGlobe or THREE");
    return;
  }

  const st = G.state;

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
      throw new Error(`NOT_JSON for ${url}`);
    }

    return JSON.parse(cleaned);
  }

  function validateMeta(meta, expectedCityId) {
    const cid = str(meta?.city_id);
    if (!cid || cid !== str(expectedCityId)) {
      throw new Error("meta city_id mismatch");
    }

    const north = num(meta?.bounds?.north);
    const south = num(meta?.bounds?.south);
    const east = num(meta?.bounds?.east);
    const west = num(meta?.bounds?.west);

    if (
      north === null ||
      south === null ||
      east === null ||
      west === null ||
      !(north > south) ||
      !(east > west)
    ) {
      throw new Error("invalid bounds");
    }

    const widthM = num(meta?.width_m);
    const heightM = num(meta?.height_m);

    if (!widthM || !heightM || widthM <= 0 || heightM <= 0) {
      throw new Error("invalid dimensions");
    }
  }

  async function loadImageTexture(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";

      img.onload = () => {
        const tex = new THREE.Texture(img);
        tex.needsUpdate = true;
        tex.userData = tex.userData || {};
        tex.userData.__umbraOwned = true;

        if (tex.colorSpace !== undefined && THREE.SRGBColorSpace) {
          tex.colorSpace = THREE.SRGBColorSpace;
        } else if (tex.encoding !== undefined && THREE.sRGBEncoding !== undefined) {
          tex.encoding = THREE.sRGBEncoding;
        }

        resolve(tex);
      };

      img.onerror = () => reject(new Error(`image failed: ${url}`));
      img.src = url;
    });
  }

  function resolveImagePath(basePath, meta) {
    const explicit = str(meta?.image);
    if (explicit) return explicit;
    return `${basePath}base.png`;
  }

  G.loadCityAsset = async function loadCityAsset(city_id) {
    const cid = str(city_id);
    if (!cid) return null;

    const basePath = `/assets/cities/${cid}/`;

    try {
      const meta = await fetchJsonStrict(basePath + "meta.json");
      validateMeta(meta, cid);

      let tex = null;
      let tileInfo = null;

      const hasTiles =
        meta?.tiles &&
        typeof meta.tiles === "object" &&
        str(meta.tiles.url);

      // ============================
      // TILE MODE (PRIMARY PATH)
      // ============================
      if (hasTiles) {
        if (typeof G.buildCityTextureFromTiles !== "function") {
          throw new Error("tile builder missing");
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
          pixelHeight: built.pixelHeight,
          tileCountX: built.tileCountX,
          tileCountY: built.tileCountY,
          canvasWidth: built.canvasWidth,
          canvasHeight: built.canvasHeight,
          cropX: built.cropX,
          cropY: built.cropY,
          cropWidth: built.cropWidth,
          cropHeight: built.cropHeight,
          bounds: built.bounds || null
        };

        console.log("[city_loader] TILE MODE", {
          city_id: cid,
          zoom: tileInfo.zoom
        });
      }

      // ============================
      // IMAGE FALLBACK (SAFE)
      // ============================
      else {
        const imagePath = resolveImagePath(basePath, meta);
        tex = await loadImageTexture(imagePath);

        console.log("[city_loader] IMAGE MODE", {
          city_id: cid,
          image: imagePath
        });
      }

      // ============================
      // STATE COMMIT (LOCKED)
      // ============================
      st.activeCityMeta = meta;
      st.activeCityTexture = tex;
      st.activeCityTileInfo = tileInfo || null;

      return {
        meta,
        tex,
        tileInfo
      };
    } catch (err) {
      console.error("[city_loader] FAILED", err);
      return null;
    }
  };
})();