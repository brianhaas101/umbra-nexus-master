'use strict';
const fs = require('fs');
const path = require('path');
const { resolveLawEnforcementSecurityEntity } = require('../resolve/resolve_law_enforcement_security_entity');
const { resolveLawEnforcementSecurityCity } = require('../resolve/resolve_law_enforcement_security_city');
const { scoreLawEnforcementSecurity } = require('../score/law_enforcement_scores');
const { buildLawEnforcementSecuritySnapshot } = require('../store/build_law_enforcement_security_snapshot');
const { buildLawEnforcementDossier } = require('../../public/globe/dossier_templates/law_enforcement_dossier');
const { validateLawEnforcementFact, validateCityIndex } = require('../utils/law_enforcement_validation');
const { savePipelineOutput } = require('../store/save_pipeline_output');
function loadJson(filePath) { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
function runLawEnforcementSecurityPipeline({ normalizedFacts = [], cityIndex = {}, outputDir = null }) {
  const factErrors = [];
  const validFacts = [];
  for (const fact of normalizedFacts) {
    const result = validateLawEnforcementFact(fact);
    if (result.ok) validFacts.push(result.fact);
    else factErrors.push({ fact, errors: result.errors });
  }
  const cityCheck = validateCityIndex(cityIndex);
  if (!cityCheck.ok) throw new Error(`Invalid city index: ${cityCheck.errors.join('; ')}`);
  const entities = resolveLawEnforcementSecurityEntity(validFacts);
  const resolved = entities.map((entity) => {
    const cityResolution = resolveLawEnforcementSecurityCity(entity, cityIndex);
    const scores = scoreLawEnforcementSecurity(entity, cityResolution);
    const snapshot = buildLawEnforcementSecuritySnapshot(entity, cityResolution, scores);
    const dossier = buildLawEnforcementDossier(entity, cityResolution, scores);
    return { entity, cityResolution, scores, snapshot, dossier };
  });
  const output = {
    generated_at: new Date().toISOString(),
    summary: {
      total_input_facts: normalizedFacts.length,
      valid_facts: validFacts.length,
      invalid_facts: factErrors.length,
      total_entities: entities.length,
      total_snapshots: resolved.map(r => r.snapshot).filter(Boolean).length,
      total_dossiers: resolved.length
    },
    factErrors,
    entities: resolved
  };
  if (outputDir) savePipelineOutput(outputDir, output);
  return output;
}
module.exports = { runLawEnforcementSecurityPipeline, loadJson };
if (require.main === module) {
  const [factsPath, cityIndexPath, outputDir] = process.argv.slice(2);
  const factsJson = loadJson(path.resolve(factsPath));
  const cityIndex = loadJson(path.resolve(cityIndexPath));
  const normalizedFacts = Array.isArray(factsJson.entities) ? factsJson.entities : factsJson;
  const output = runLawEnforcementSecurityPipeline({ normalizedFacts, cityIndex, outputDir: outputDir ? path.resolve(outputDir) : null });
  console.log(JSON.stringify(output.summary, null, 2));
}
