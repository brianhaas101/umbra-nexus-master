#!/usr/bin/env node
/**
 * scripts/download_city_tiles.mjs
 *
 * Offline tile downloader for Umbra Nexus city maps.
 *
 * Purpose:
 * - Read one city meta.json
 * - Compute required XYZ tile range from bounds at one locked zoom
 * - Download tiles into:
 *     public/assets/city_tiles/<city_id>/<z>/<x>/<y>.jpg
 *
 * Usage:
 *   node scripts/download_city_tiles.mjs public/assets/cities/city_53389926/meta.json
 *
 * Optional flags:
 *   --zoom=15
 *   --format=jpg
 *   --overwrite=true
 *
 * Notes:
 * - Requires Node 18+ (native fetch)
 * - This is an offline preparation tool, not runtime code
 * - Keeps Nexus deterministic by converting remote tile dependency into local assets
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const EARTH_MAX_LAT = 85.05112878;
const DEFAULT_TILE_SIZE = 256;
const DEFAULT_FORMAT = "jpg";
const DEFAULT_OVERWRITE = false;

function parseArgs(argv) {
  const out = {
    metaPath: "",
    zoom: null,
    format: DEFAULT_FORMAT,
    overwrite: DEFAULT_OVERWRITE,
  };

  for (const arg of argv) {
    if (!arg.startsWith("--") && !out.metaPath) {
      out.metaPath = arg;
      continue;
    }

    if (arg.startsWith("--zoom=")) {
      out.zoom = Number(arg.slice("--zoom=".length));
      continue;
    }

    if (arg.startsWith("--format=")) {
      out.format = String(arg.slice("--format=".length)).trim().toLowerCase() || DEFAULT_FORMAT;
      continue;
    }

    if (arg.startsWith("--overwrite=")) {
      const raw = String(arg.slice("--overwrite=".length)).trim().toLowerCase();
      out.overwrite = raw === "true" || raw === "1" || raw === "yes";
      continue;
    }
  }

  return out;
}

function clamp(n, a, b) {
  const x = Number(n);
  if (!Number.isFinite(x)) return a;
  return Math.max(a, Math.min(b, x));
}

function str(v) {
  const s = String(v ?? "").trim();
  return s || "";
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function degToRad(deg) {
  return Number(deg) * Math.PI / 180;
}

function lonToTileX(lonDeg, z) {
  const lon = clamp(Number(lonDeg), -180, 180);
  const n = 2 ** z;
  return ((lon + 180) / 360) * n;
}

function latToTileY(latDeg, z) {
  const lat = clamp(Number(latDeg), -EARTH_MAX_LAT, EARTH_MAX_LAT);
  const latRad = degToRad(lat);
  const n = 2 ** z;
  return (
    (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2
  ) * n;
}

function validateMeta(meta) {
  const cityId = str(meta?.city_id);
  if (!cityId) throw new Error("meta missing city_id");

  const north = num(meta?.bounds?.north);
  const south = num(meta?.bounds?.south);
  const east = num(meta?.bounds?.east);
  const west = num(meta?.bounds?.west);

  if (north === null || south === null || east === null || west === null) {
    throw new Error("meta missing bounds");
  }
  if (!(north > south)) throw new Error("invalid bounds: north <= south");
  if (!(east > west)) throw new Error("invalid bounds: east <= west");

  const widthM = num(meta?.width_m);
  const heightM = num(meta?.height_m);
  if (widthM === null || heightM === null || widthM <= 0 || heightM <= 0) {
    throw new Error("meta missing valid width_m/height_m");
  }

  const tiles = meta?.tiles;
  if (!tiles || typeof tiles !== "object") {
    throw new Error("meta missing tiles object");
  }

  const tileUrl = str(tiles.url);
  if (!tileUrl) throw new Error("meta.tiles.url missing");

  const zoom = Number.isFinite(Number(tiles.zoom)) ? Number(tiles.zoom) : null;
  if (zoom === null) throw new Error("meta.tiles.zoom missing");

  return {
    cityId,
    bounds: { north, south, east, west },
    widthM,
    heightM,
    tileUrl,
    tileSize: Number.isFinite(Number(tiles.tileSize)) ? Number(tiles.tileSize) : DEFAULT_TILE_SIZE,
    zoom,
  };
}

function replaceTileTemplate(url, z, x, y) {
  return String(url)
    .replace("{z}", String(z))
    .replace("{x}", String(x))
    .replace("{y}", String(y));
}

function inferTileExtension(contentType, fallbackExt) {
  const ct = String(contentType || "").toLowerCase();
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("jpeg")) return "jpg";
  if (ct.includes("jpg")) return "jpg";
  return fallbackExt;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadBinary(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Umbra-Nexus-Tile-Downloader/1.0",
      "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  const contentType = res.headers.get("content-type") || "";
  const arr = new Uint8Array(await res.arrayBuffer());
  return { bytes: arr, contentType };
}

function computeTileRange(bounds, z) {
  const xWest = lonToTileX(bounds.west, z);
  const xEast = lonToTileX(bounds.east, z);

  const yNorth = latToTileY(bounds.north, z);
  const ySouth = latToTileY(bounds.south, z);

  const minX = Math.floor(Math.min(xWest, xEast));
  const maxX = Math.floor(Math.max(xWest, xEast));

  const minY = Math.floor(Math.min(yNorth, ySouth));
  const maxY = Math.floor(Math.max(yNorth, ySouth));

  return { minX, maxX, minY, maxY };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.metaPath) {
    console.error("Usage: node scripts/download_city_tiles.mjs <meta.json> [--zoom=15] [--format=jpg] [--overwrite=true]");
    process.exit(1);
  }

  const metaPath = path.resolve(args.metaPath);
  const meta = await readJson(metaPath);
  const validated = validateMeta(meta);

  const cityId = validated.cityId;
  const zoom = Number.isFinite(args.zoom) ? args.zoom : validated.zoom;
  const tileUrl = validated.tileUrl;
  const extFallback = str(args.format) || DEFAULT_FORMAT;

  const range = computeTileRange(validated.bounds, zoom);

  const publicRoot = path.resolve("public");
  const outRoot = path.join(publicRoot, "assets", "city_tiles", cityId, String(zoom));

  console.log("[tile_downloader] START", {
    cityId,
    zoom,
    metaPath,
    outRoot,
    range,
  });

  let attempted = 0;
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let x = range.minX; x <= range.maxX; x++) {
    const xDir = path.join(outRoot, String(x));
    await ensureDir(xDir);

    for (let y = range.minY; y <= range.maxY; y++) {
      attempted++;

      const initialPath = path.join(xDir, `${y}.${extFallback}`);
      const existing = await fileExists(initialPath);

      if (existing && !args.overwrite) {
        skipped++;
        continue;
      }

      const remoteUrl = replaceTileTemplate(tileUrl, zoom, x, y);

      try {
        const { bytes, contentType } = await downloadBinary(remoteUrl);
        const ext = inferTileExtension(contentType, extFallback);
        const finalPath = path.join(xDir, `${y}.${ext}`);

        if (finalPath !== initialPath) {
          try { await fs.unlink(initialPath); } catch {}
        }

        await fs.writeFile(finalPath, bytes);
        downloaded++;

        if (downloaded % 25 === 0) {
          console.log("[tile_downloader] PROGRESS", {
            cityId,
            zoom,
            attempted,
            downloaded,
            skipped,
            failed,
          });
        }
      } catch (err) {
        failed++;
        console.error("[tile_downloader] TILE FAIL", {
          cityId,
          zoom,
          x,
          y,
          url: remoteUrl,
          error: String(err?.message || err),
        });
      }
    }
  }

  console.log("[tile_downloader] DONE", {
    cityId,
    zoom,
    attempted,
    downloaded,
    skipped,
    failed,
    outRoot,
  });

  if (failed > 0) {
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error("[tile_downloader] FATAL", err);
  process.exit(1);
});