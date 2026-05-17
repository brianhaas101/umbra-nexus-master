'use strict';
const { baseFact } = require('./_map_common');
function mapItem(raw, ctx = {}) {
  const fact = baseFact();
  fact.entity_name = ctx.entity_name || '';
  fact.organization_type = ctx.organization_type || 'private_security';
  fact.jurisdiction = ctx.city || ctx.state || '';
  fact.address.street = ctx.street || '';
  fact.address.city = ctx.city || '';
  fact.address.state = ctx.state || '';
  fact.contact.website = ctx.website || '';
  fact.contact.phone = ctx.phone || '';
  fact.contact.email = ctx.email || '';
  fact.units = ctx.units || [];
  fact.keywords = ctx.keywords || [];
  fact.training_signals = ctx.training_signals || [];
  fact.confidence = 0.8;
  fact.trace = { source_id: 'commercial_site' };
  return [fact];
}
module.exports = { mapItem };
