'use strict';
function normalizeText(v) { return String(v || '').trim().toLowerCase().replace(/\s+/g, ' '); }
function buildEntityId(candidate) {
  const seed = [
    normalizeText(candidate?.entity_name),
    normalizeText(candidate?.organization_type),
    normalizeText(candidate?.address?.city),
    normalizeText(candidate?.address?.state),
    normalizeText(candidate?.contact?.website)
  ].filter(Boolean).join('|');
  return `ent_les_${Buffer.from(seed).toString('hex').slice(0, 24)}`;
}
function resolveLawEnforcementSecurityEntity(candidates = []) {
  const groups = new Map();
  for (const candidate of candidates) {
    const key = [
      normalizeText(candidate?.entity_name),
      normalizeText(candidate?.organization_type),
      normalizeText(candidate?.address?.city),
      normalizeText(candidate?.address?.state),
      normalizeText(candidate?.contact?.website)
    ].join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(candidate);
  }
  return Array.from(groups.values()).map((group) => {
    const base = group[0];
    return {
      entity_id: buildEntityId(base),
      industry_id: 'law_enforcement_security',
      merge_confidence: base?.contact?.website ? 0.92 : 0.8,
      aliases: [...new Set(group.map(x => x.entity_name).filter(Boolean))],
      source_ids: Object.fromEntries(group.map(x => [x.trace?.source_id || 'unknown', true])),
      facts: group
    };
  });
}
module.exports = { resolveLawEnforcementSecurityEntity };
