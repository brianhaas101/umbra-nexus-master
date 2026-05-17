'use strict';
function buildLawEnforcementDossier(entity, cityResolution, scores) {
  const facts = entity?.facts || [];
  const primary = facts[0] || {};
  const orgType = primary.organization_type || 'unknown';
  let fitReason = 'General organizational fit.';
  if ((primary.units || []).some(v => /gang|motorcycle|narcotics/i.test(String(v)))) fitReason = 'Specialized units suggest direct relevance for motorcycle-club interaction training.';
  else if ((primary.training_signals || []).length) fitReason = 'Visible training infrastructure suggests openness to outside instruction.';
  else if (/private_security|investigator/.test(orgType)) fitReason = 'Security and investigative fieldwork can benefit from structured MC communication and risk handling instruction.';
  return {
    entity_id: entity.entity_id, industry_id: 'law_enforcement_security',
    identity: {
      name: entity.aliases?.[0] || primary.entity_name || 'Unknown organization',
      organization_type: orgType, jurisdiction: primary.jurisdiction || '',
      city_id: cityResolution?.city_id || null, city_name: cityResolution?.city_name || null, state: cityResolution?.state || null
    },
    contact_path: { phone: primary.contact?.phone || '', email: primary.contact?.email || '', website: primary.contact?.website || '' },
    operational_context: { units: primary.units || [], keywords: primary.keywords || [], training_signals: primary.training_signals || [], agency_size_hint: primary.agency_size_hint || '' },
    opportunity: {
      why_it_fits: fitReason,
      recommended_action: scores.umbra_score >= 75 ? 'High-priority outreach target. Start with training division, command staff, or operations leadership.' : 'Promising target. Review website, identify training or command contact, then outreach.'
    },
    scores, confidence: scores.confidence_score,
    trace: facts.map(f => ({ source_id: f.trace?.source_id || 'unknown', observed_at: f.observed_at, effective_at: f.effective_at }))
  };
}
module.exports = { buildLawEnforcementDossier };
