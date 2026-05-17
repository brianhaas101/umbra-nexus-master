'use strict';
function resolveLawEnforcementSecurityCity(entity, cityIndex = {}) {
  const fact = entity?.facts?.find(Boolean);
  const city = fact?.address?.city || '';
  const state = fact?.address?.state || '';
  const lat = fact?.geo?.lat ?? null;
  const lon = fact?.geo?.lon ?? null;
  const precision = fact?.geo?.precision || 'city';
  const cityKey = `${String(city).trim().toLowerCase()}|${String(state).trim().toLowerCase()}`;
  const cityMeta = cityIndex[cityKey] || null;
  let bounds_status = 'unresolved';
  if (cityMeta && typeof lat === 'number' && typeof lon === 'number') {
    const b = cityMeta.bounds || {};
    const inside = lat <= b.north && lat >= b.south && lon <= b.east && lon >= b.west;
    bounds_status = inside ? 'inside' : 'outside';
  }
  return { entity_id: entity.entity_id, city_id: cityMeta?.city_id || null, city_name: city || null, state: state || null, lat, lon, precision, bounds_status };
}
module.exports = { resolveLawEnforcementSecurityCity };
