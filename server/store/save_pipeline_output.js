'use strict';
const fs = require('fs');
const path = require('path');
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function savePipelineOutput(outputDir, output) {
  ensureDir(outputDir);
  fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(output.summary, null, 2));
  fs.writeFileSync(path.join(outputDir, 'snapshots.json'), JSON.stringify(output.entities.map(x => x.snapshot).filter(Boolean), null, 2));
  fs.writeFileSync(path.join(outputDir, 'dossiers.json'), JSON.stringify(output.entities.map(x => x.dossier), null, 2));
  fs.writeFileSync(path.join(outputDir, 'fact_errors.json'), JSON.stringify(output.factErrors || [], null, 2));
}
module.exports = { savePipelineOutput };
