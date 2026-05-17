'use strict';
async function loadJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load ${url}: HTTP ${res.status}`);
  return res.json();
}
async function bootLawEnforcementCityMapIntegration() {
  const G = window.UmbraGlobe;
  if (!G) throw new Error('UmbraGlobe missing');
  const [snapshots, dossiers] = await Promise.all([
    loadJson('/pipeline_outputs/law_enforcement/snapshots.json'),
    loadJson('/pipeline_outputs/law_enforcement/dossiers.json')
  ]);
  G.attachLawEnforcementAdapter();
  G.setLawEnforcementResolvedData({ snapshots, dossiers });
  return { snapshots: Array.isArray(snapshots) ? snapshots.length : 0, dossiers: Array.isArray(dossiers) ? dossiers.length : 0 };
}
window.bootLawEnforcementCityMapIntegration = bootLawEnforcementCityMapIntegration;
