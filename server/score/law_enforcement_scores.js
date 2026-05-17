'use strict';
function hasAny(list, terms) {
  const hay = (list || []).map(v => String(v).toLowerCase());
  return terms.some(t => hay.some(v => v.includes(t)));
}
function scoreLawEnforcementSecurity(entity, cityResolution) {
  const facts = entity?.facts || [];
  const primary = facts[0] || {};
  const units = primary.units || [];
  const keywords = primary.keywords || [];
  const trainingSignals = primary.training_signals || [];
  const orgType = String(primary.organization_type || '').toLowerCase();
  const size = String(primary.agency_size_hint || '').toLowerCase();
  const specializedUnit =
    hasAny(units, ['gang', 'motorcycle', 'narcotics', 'organized crime']) ||
    hasAny(keywords, ['gang', 'motorcycle', 'organized crime', 'interdiction']);
  const trainingVisible = hasAny(trainingSignals, ['training', 'academy', 'staff development', 'special operations']);
  const lawEnforcement = orgType === 'law_enforcement';
  const securityLike = ['private_security', 'investigator', 'corporate_security', 'event_security'].includes(orgType);
  const relevance_score =
    lawEnforcement && specializedUnit ? 0.95 :
    lawEnforcement ? 0.8 :
    securityLike && trainingVisible ? 0.82 :
    securityLike ? 0.68 : 0.45;
  const agency_size_score = size === 'large' ? 0.9 : size === 'medium' ? 0.72 : size === 'small' ? 0.5 : 0.58;
  const training_likelihood_score = specializedUnit && trainingVisible ? 0.92 : specializedUnit ? 0.86 : trainingVisible ? 0.74 : 0.48;
  const accessibility_score = primary.contact?.email ? 0.88 : primary.contact?.phone && primary.contact?.website ? 0.78 : primary.contact?.website ? 0.62 : 0.35;
  const authority_score = lawEnforcement ? 0.9 : 0.7;
  const confidence_score = Math.max(...facts.map(f => Number(f.confidence || 0)), 0.45);
  const priority_score =
    relevance_score * 0.30 +
    training_likelihood_score * 0.28 +
    accessibility_score * 0.16 +
    authority_score * 0.10 +
    agency_size_score * 0.08 +
    confidence_score * 0.08;
  const umbra_score = Number((priority_score * 100).toFixed(2));
  return {
    relevance_score, agency_size_score, training_likelihood_score, accessibility_score,
    authority_score, confidence_score, priority_score, umbra_score,
    dossier_ready: Boolean(cityResolution?.city_id && cityResolution?.bounds_status === 'inside' && (primary.contact?.website || primary.contact?.phone))
  };
}
module.exports = { scoreLawEnforcementSecurity };
