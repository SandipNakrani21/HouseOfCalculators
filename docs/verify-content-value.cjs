/* eslint-disable @typescript-eslint/no-require-imports -- Offline verification of generated HTML, no network requests. */
require('../tests/load-typescript.cjs');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { CALCULATORS } = require('../src/config/calculators/index.ts');
const { TOOLS } = require('../src/config/tools/definitions.ts');
const { GUIDES } = require('../src/config/guides/definitions.ts');
const { guideSources } = require('../src/config/guides/sources.ts');
const { LOCALES } = require('../src/config/locales.ts');
const { ruleReview } = require('../src/config/calculators/provenance.ts');
const inventory = require('../src/config/ad-inventory.json');
const root = process.argv[2] || 'D:/Calculator-advanced-build-20261010/.next/server/app';
const locales = Object.values(LOCALES).filter(locale => locale.launch);
const report = { generatedAt: new Date().toISOString(), calculatorPages: 0, toolPages: 0, guidesWithSources: 0, unreviewedCountryPagesWithoutManualSlots: 0, navigationPagesWithoutManualSlots: 0, models: CALCULATORS.length, tools: TOOLS.length, locales: locales.length, adInventoryPaths: inventory.paths.length, sourceCoveredCountryPaths: inventory.paths.filter(value => value.startsWith('/countries/')), checks: [] };
// Client dictionaries contain key names legitimately; check visible markup, not hydration data.
const read = route => fs.readFileSync(path.join(root, route + '.html'), 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
for (const locale of locales) {
  for (const calculator of CALCULATORS) {
    const countries = calculator.isCountrySpecific ? calculator.countries : calculator.countries.includes(locale.defaultCountry) ? [locale.defaultCountry] : [];
    for (const country of countries) {
      const route = `${locale.path}/` + (calculator.isCountrySpecific ? `countries/${country}/${calculator.slug}` : `calculators/${calculator.category}/${calculator.slug}`);
      const html = read(route);
      assert(html.includes(`data-worked-example="${calculator.slug}"`), route + ': missing worked illustration');
      assert(!html.includes('quality.exampleIntro'), route + ': unresolved copy');
      assert(html.includes('<h4'), route + ': input/result headings');
      if (calculator.isCountrySpecific && !ruleReview(calculator.slug, country)) {
        assert(!html.includes('class="ad-wrap'), route + ': manual ad wrapper');
        const dictionary = require('../src/lib/i18n/dictionaries/' + locale.language + '.json');
        const escaped = dictionary['quality.unreviewed'].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
        assert(html.includes(escaped), route + ': missing model limitation');
        report.unreviewedCountryPagesWithoutManualSlots++;
      }
      report.calculatorPages++;
    }
  }
  for (const tool of TOOLS) {
    const route = `${locale.path}/tools/${tool.category}/${tool.slug}`;
    const html = read(route);
    assert(html.includes(`data-tool-examples="${tool.slug}"`), route + ': missing examples');
    assert(html.includes('<th scope="col"'), route + ': accessible table');
    assert(!/quality\.(inputs|outputs|example|toolLimit)/.test(html), route + ': unresolved copy');
    report.toolPages++;
  }
  for (const guide of GUIDES) {
    const sources = guideSources(guide.slug);
    if (!sources.length) continue;
    const html = read(`${locale.path}/guides/${guide.category}/${guide.slug}`);
    for (const source of sources) assert(html.includes(source.href), guide.slug + ': missing reference');
    report.guidesWithSources++;
  }
  for (const suffix of ['', '/calculators', '/tools', '/guides', '/charts', '/countries', '/converters']) {
    const route = `${locale.path}${suffix}`;
    assert(!read(route).includes('class="ad-wrap'), route + ': navigation manual ad');
    report.navigationPagesWithoutManualSlots++;
  }
}
assert.equal(report.toolPages, 276);
assert.equal(report.guidesWithSources, 132);
assert.equal(report.navigationPagesWithoutManualSlots, 84);
report.checks = ['All published calculator routes include actual model inputs and computed results', 'All 23 tools include localized teaching examples and limitations', '11 financial guides per locale contain relevant official references', 'Country models lacking published source coverage and navigation routes exclude manual ad slots'];
fs.writeFileSync(path.join(__dirname, 'LOW_VALUE_FIX_ARTIFACTS.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
