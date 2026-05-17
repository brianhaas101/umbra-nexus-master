'use strict';
const { runLawEnforcementSecurityPipeline } = require('../pipelines/run_law_enforcement_security_pipeline');
const sampleFacts = [{
  entity_name: 'Metro City Police Department',
  organization_type: 'law_enforcement',
  jurisdiction: 'Metro City',
  agency_size_hint: 'large',
  address: { street: '100 Civic Plaza', city: 'Metro City', state: 'AZ', postal_code: '85001', country: 'US' },
  geo: { lat: 33.4484, lon: -112.0740, precision: 'street' },
  contact: { phone: '(555) 010-1000', email: 'training@metrocitypd.gov', website: 'https://example.gov/police' },
  units: ['gang unit', 'motorcycle unit', 'narcotics'],
  keywords: ['organized crime', 'motorcycle enforcement', 'interdiction'],
  training_signals: ['training division', 'special operations'],
  observed_at: '2026-04-15T00:00:00Z',
  effective_at: '2026-04-15T00:00:00Z',
  ingested_at: '2026-04-15T00:00:00Z',
  confidence: 0.92,
  usage_class: 'public',
  trace: { source_id: 'local_gov_directory' }
}];
const cityIndex = { 'metro city|az': { city_id: 'city_test_001', bounds: { north: 33.60, south: 33.30, east: -111.90, west: -112.20 } } };
const output = runLawEnforcementSecurityPipeline({ normalizedFacts: sampleFacts, cityIndex });
if (output.summary.total_entities !== 1) throw new Error('Expected 1 entity');
if (output.summary.total_snapshots !== 1) throw new Error('Expected 1 snapshot');
if (output.entities[0].scores.umbra_score <= 0) throw new Error('Expected positive score');
console.log('PASS law_enforcement_security pipeline smoke test');
