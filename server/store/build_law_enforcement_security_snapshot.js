'use strict';
function buildLawEnforcementSecuritySnapshot(entity, cityResolution, scores) {
  if (!cityResolution?.city_id) return null;
  if (!cityResolution?.bounds_status || cityResolution.bounds_status !== 'inside') return null;
  const primary = entity?.facts?.[0] || {};
  return {
    entity_id: entity.entity_id, city_id: cityResolution.city_id,
    industry_id: 'law_enforcement_security', organization_type: primary.organization_type || '',
    lat: cityResolution.lat, lon: cityResolution.lon, precision: cityResolution.precision,
    umbra_score: scores.umbra_score, dossier_ready: scores.dossier_ready,
    node_label: entity.aliases?.[0] || entity.entity_id, node_priority: scores.priority_score
  };
}
module.exports = { buildLawEnforcementSecuritySnapshot };
