/* eslint-disable @typescript-eslint/no-require-imports -- Generates the small client-safe inventory manifest. */
require('./load-typescript.cjs');
const fs = require('node:fs');
const path = require('node:path');
const { CALCULATORS } = require('../src/config/calculators/index.ts');
const { CONVERTERS, pairSlug } = require('../src/config/converters/definitions.ts');
const { TOOLS } = require('../src/config/tools/definitions.ts');
const { CHARTS } = require('../src/config/charts/definitions.ts');
const { GUIDES } = require('../src/config/guides/definitions.ts');
const { ruleReview } = require('../src/config/calculators/provenance.ts');
const { LOCALES } = require('../src/config/locales.ts');
const data = {
  revision: 2,
  // This is an engineering inventory decision, not a claim of Google approval or expert review.
  reviewed: '2026-10-10',
  locales: Object.values(LOCALES).filter(locale => locale.launch).map(locale => locale.path),
  paths: [
    ...CALCULATORS.filter(calc => !calc.isCountrySpecific).map(calc => `/calculators/${calc.category}/${calc.slug}`),
    ...CALCULATORS.filter(calc => calc.isCountrySpecific).flatMap(calc => calc.countries.filter(country => ruleReview(calc.slug, country)).map(country => `/countries/${country}/${calc.slug}`)),
    ...CONVERTERS.flatMap(converter => [`/converters/${converter.category}`, ...converter.featuredPairs.map(([from, to]) => `/converters/${converter.category}/${pairSlug(converter, from, to)}`)]),
    ...TOOLS.map(tool => `/tools/${tool.category}/${tool.slug}`),
    ...CHARTS.map(chart => `/charts/${chart.category}/${chart.slug}`),
    ...GUIDES.map(guide => `/guides/${guide.category}/${guide.slug}`),
  ].sort(),
};
const filename = path.join(__dirname, '../src/config/ad-inventory.json');
const content = JSON.stringify(data, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (!fs.existsSync(filename) || fs.readFileSync(filename, 'utf8') !== content) { console.error('Ad inventory is stale; run node scripts/ad-inventory.cjs.'); process.exitCode = 1; }
} else fs.writeFileSync(filename, content);
console.log(`Ad inventory: ${data.paths.length} known content paths; ${data.locales.length} locales.`);
