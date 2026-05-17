// public/globe/city_tiles.js
(function () {
  const G = window.UmbraGlobe;
  if (!G || !window.THREE) {
    console.error("[city_tiles] missing UmbraGlobe or THREE");
    return;
  }

  const EARTH_RADIUS_M = 6378137;
  const DEFAULT_TILE_SIZE = 256;
  const DEFAULT_PADDING_TILES = 1;

  function clamp(n, a, b) {
    const x = Number(n);
    if (!Number.isFinite(x)) return a;
    return Math.max(a, Math.min(b, x));
  }

  function degToRad(deg) {
    return Number(deg) * Math.PI / 180;
  }

  function latLonToTileFraction(latDeg, lonDeg, z) {
    const lat = clamp(Number(latDeg), -85.05112878, 85.05112878);
    const lon = clamp(Number(lonDeg), -180, 180);
    const n = Math.pow(2, z);

    const x = ((lon + 180) / 360) * n;

    const latRad = degToRad(lat);
    const y = (
      (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2
    ) * n;

    return { x, y };
  }

  function tileFractionToLatLon(x, y, z) {
    const n = Math.pow(2, z);
    const lon = (Number(x) / n) * 360 - 180;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * Number(y) / n)));
    const lat = latRad * 180 / Math.PI;
    return { lat, lon };
  }

  function metersPerPixel(latDeg, z, tileSize) {
    const latRad = degToRad(clamp(latDeg, -85.05112878, 85.05112878));
    const worldMeters = 2 * Math.PI * EARTH_RADIUS_M;
    const pixels = tileSize * Math.pow(2, z);
    return Math.cos(latRad) * worldMeters / pixels;
  }

  function replaceTileTemplate(url, z, x, y) {
    return String(url)
      .replace("{z}", String(z))
      .replace("{x}", String(x))
      .replace("{y}", String(y));
  }

  async function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`tile failed: ${url}`));
      img.src = url;
    });
  }

  G.buildCityTextureFromTiles = async function buildCityTextureFromTiles(meta) {
    if (!meta || !meta.tiles || !meta.tiles.url) {
      throw new Error("[city_tiles] missing tiles config in meta");
    }

    const tileUrl = String(meta.tiles.url);
    const tileSize = Number(meta.tiles.tileSize || DEFAULT_TILE_SIZE);
    const z = clamp(
      Number(meta.tiles.zoom ?? meta.tiles.maxZoom ?? 18),
      Number(meta.tiles.minZoom ?? 0),
      Number(meta.tiles.maxZoom ?? 23)
    );

    const north = Number(meta?.bounds?.north);
    const south = Number(meta?.bounds?.south);
    const east = Number(meta?.bounds?.east);
    const west = Number(meta?.bounds?.west);

    if (
      !Number.isFinite(north) ||
      !Number.isFinite(south) ||
      !Number.isFinite(east) ||
      !Number.isFinite(west) ||
      !(north > south) ||
      !(east > west)
    ) {
      throw new Error("[city_tiles] invalid bounds");
    }

    const centerLat = Number.isFinite(Number(meta.center_lat))
      ? Number(meta.center_lat)
      : ((north + south) * 0.5);

    const nw = latLonToTileFraction(north, west, z);
    const se = latLonToTileFraction(south, east, z);

    const usableLeftPxWorld = nw.x * tileSize;
    const usableTopPxWorld = nw.y * tileSize;
    const usableRightPxWorld = se.x * tileSize;
    const usableBottomPxWorld = se.y * tileSize;

    const pixelWidth = usableRightPxWorld - usableLeftPxWorld;
    const pixelHeight = usableBottomPxWorld - usableTopPxWorld;

    const padding = 0;

    const minX = Math.floor(usableLeftPxWorld / tileSize) - padding;
    const maxX = Math.floor((usableRightPxWorld - 1) / tileSize) + padding;
    const minY = Math.floor(usableTopPxWorld / tileSize) - padding;
    const maxY = Math.floor((usableBottomPxWorld - 1) / tileSize) + padding;

    const tileCountX = maxX - minX + 1;
    const tileCountY = maxY - minY + 1;

    const canvasWidth = tileCountX * tileSize;
    const canvasHeight = tileCountY * tileSize;

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("[city_tiles] could not get canvas context");

    const requests = [];
    for (let ty = minY; ty <= maxY; ty++) {
      for (let tx = minX; tx <= maxX; tx++) {
        const url = replaceTileTemplate(tileUrl, z, tx, ty);
        requests.push(
          loadImage(url).then((img) => ({
            img,
            tx,
            ty
          }))
        );
      }
    }

    const loaded = await Promise.all(requests);

    for (const item of loaded) {
      const dx = (item.tx - minX) * tileSize;
      const dy = (item.ty - minY) * tileSize;
      ctx.drawImage(item.img, dx, dy, tileSize, tileSize);
    }

    const originPixelX = minX * tileSize;
    const originPixelY = minY * tileSize;

    const cropX = usableLeftPxWorld - originPixelX;
    const cropY = usableTopPxWorld - originPixelY;

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = pixelWidth;
    cropCanvas.height = pixelHeight;

    const cropCtx = cropCanvas.getContext("2d", { alpha: false });
    if (!cropCtx) throw new Error("[city_tiles] could not get crop canvas context");

    cropCtx.drawImage(
      canvas,
      cropX, cropY, pixelWidth, pixelHeight,
      0, 0, pixelWidth, pixelHeight
    );

    const glTexture = new THREE.CanvasTexture(cropCanvas);
    glTexture.needsUpdate = true;
    glTexture.wrapS = THREE.ClampToEdgeWrapping;
    glTexture.wrapT = THREE.ClampToEdgeWrapping;
    glTexture.minFilter = THREE.LinearFilter;
    glTexture.magFilter = THREE.LinearFilter;
    if (glTexture.colorSpace !== undefined && THREE.SRGBColorSpace) {
      glTexture.colorSpace = THREE.SRGBColorSpace;
    } else if (glTexture.encoding !== undefined && THREE.sRGBEncoding !== undefined) {
      glTexture.encoding = THREE.sRGBEncoding;
    }

    const topLeftTileFrac = {
      x: usableLeftPxWorld / tileSize,
      y: usableTopPxWorld / tileSize
    };

    const bottomRightTileFrac = {
      x: usableRightPxWorld / tileSize,
      y: usableBottomPxWorld / tileSize
    };

    const rasterNW = tileFractionToLatLon(topLeftTileFrac.x, topLeftTileFrac.y, z);
    const rasterSE = tileFractionToLatLon(bottomRightTileFrac.x, bottomRightTileFrac.y, z);

    const rasterBounds = {
      north: Number(rasterNW.lat),
      south: Number(rasterSE.lat),
      east: Number(rasterSE.lon),
      west: Number(rasterNW.lon)
    };

    glTexture.userData = glTexture.userData || {};
    glTexture.userData.rasterBounds = rasterBounds;
    glTexture.userData.bounds = rasterBounds;
    glTexture.userData.geoBounds = rasterBounds;

    cropCanvas.userData = cropCanvas.userData || {};
    cropCanvas.userData.rasterBounds = rasterBounds;
    cropCanvas.userData.bounds = rasterBounds;

    const mpp = metersPerPixel(centerLat, z, tileSize);

    console.log("[city_tiles] BUILT", {
      city_id: meta.city_id,
      z,
      mpp: Number(mpp.toFixed(6)),
      pixelWidth,
      pixelHeight,
      tileCountX,
      tileCountY,
      rasterBounds
    });

    return {
      texture: glTexture,
      zoom: z,
      metersPerPixel: mpp,
      pixelWidth,
      pixelHeight,
      tileCountX,
      tileCountY,
      canvasWidth,
      canvasHeight,
      cropX,
      cropY,
      cropWidth: pixelWidth,
      cropHeight: pixelHeight,
      bounds: {
        north,
        south,
        east,
        west
      },
      rasterBounds
    };
  };
})();