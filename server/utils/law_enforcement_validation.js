'use strict';
function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0; }
function isNumber(v) { return typeof v === 'number' && Number.isFinite(v); }
function validateLawEnforcementFact(fact) {
  const errors = [];
  const cloned = JSON.parse(JSON.stringify(fact || {}));
  if (!isNonEmptyString(cloned.entity_name)) errors.push('entity_name missing');
  if (!isNonEmptyString(cloned.organization_type)) errors.push('organization_type missing');
  if (!cloned.address) errors.push('address missing');
  if (!cloned.geo) errors.push('geo missing');
  if (!cloned.contact) errors.push('contact missing');
  if (cloned.address && !isNonEmptyString(cloned.address.city)) errors.push('address.city missing');
  if (cloned.address && !isNonEmptyString(cloned.address.state)) errors.push('address.state missing');
  if (cloned.geo && !isNumber(cloned.geo.lat)) errors.push('geo.lat missing');
  if (cloned.geo && !isNumber(cloned.geo.lon)) errors.push('geo.lon missing');
  const hasWebsite = isNonEmptyString(cloned.contact?.website);
  const hasPhone = isNonEmptyString(cloned.contact?.phone);
  if (!hasWebsite && !hasPhone) errors.push('contact.website_or_phone missing');
  return { ok: errors.length === 0, errors, fact: cloned };
}
function validateCityIndex(cityIndex) {
  const errors = [];
  if (!cityIndex || typeof cityIndex !== 'object') return { ok: false, errors: ['cityIndex must be an object'] };
  for (const [key, value] of Object.entries(cityIndex)) {
    if (!value.city_id) errors.push(`missing city_id for ${key}`);
    if (!value.bounds) errors.push(`missing bounds for ${key}`);
  }
  return { ok: errors.length === 0, errors };
}
module.exports = { validateLawEnforcementFact, validateCityIndex };
