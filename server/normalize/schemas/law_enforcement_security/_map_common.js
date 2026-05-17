'use strict';
function baseFact() {
  return {
    entity_name: '', organization_type: '', jurisdiction: '', agency_size_hint: '',
    address: { street: '', city: '', state: '', postal_code: '', country: 'US' },
    geo: { lat: null, lon: null, precision: 'city' },
    contact: { phone: '', email: '', website: '' },
    units: [], keywords: [], training_signals: [],
    observed_at: new Date().toISOString(), effective_at: new Date().toISOString(), ingested_at: new Date().toISOString(),
    confidence: 0.0, usage_class: 'public', trace: {}
  };
}
module.exports = { baseFact };
