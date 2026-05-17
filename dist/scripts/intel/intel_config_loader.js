// intel_config_loader.js
// Loads intel_weights.json and intel_sources.json so other modules can use them.

let cachedWeights = null;
let cachedSources = null;

async function fetchJson(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) {
      console.warn(`Failed to load config: ${path}`, res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Error loading config: ${path}`, err);
    return null;
  }
}

export async function loadIntelWeights() {
  if (cachedWeights) return cachedWeights;
  const data = await fetch("/config/intel_weights.json");
  const json = await data.json().catch(() => null);
  cachedWeights = json?.components || null;
  return cachedWeights;
}

export async function loadIntelSources() {
  if (cachedSources) return cachedSources;
  const data = await fetch("/config/intel_sources.json");
  const json = await data.json().catch(() => null);
  cachedSources = json?.sources || null;
  return cachedSources;
}