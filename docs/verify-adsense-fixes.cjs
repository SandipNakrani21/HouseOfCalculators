/* eslint-disable @typescript-eslint/no-require-imports -- Offline Node artifact verification. */
require('../tests/load-typescript.cjs');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { CONVERTERS, pairSlug } = require('../src/config/converters/definitions.ts');
const { LOCALES } = require('../src/config/locales.ts');
const root = process.argv[2] || 'D:/Calculator-advanced-build-20261010/.next/server/app';
const locales = Object.values(LOCALES).filter(locale => locale.launch);
const report = { generatedAt: new Date().toISOString(), pairPages: 0, legalPages: 0, homePages: 0, locales: locales.map(locale => locale.path), checks: [] };
const read = route => fs.readFileSync(path.join(root, route + '.html'), 'utf8');
const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
for (const locale of locales) {
  const dictionary = require('../src/lib/i18n/dictionaries/' + locale.language + '.json');
  for (const converter of CONVERTERS) for (const [from, to] of converter.featuredPairs) {
    const route = `${locale.path}/converters/${converter.category}/${pairSlug(converter, from, to)}`;
    const html = read(route);
    assert(html.includes(escape(dictionary['conv.pair.examples'])), route + ': localized examples');
    assert(html.includes(escape(dictionary['conv.pair.precision'])), route + ': precision');
    assert(html.includes('https://www.nist.gov/pml/special-publication-811'), route + ': NIST');
    assert(html.includes('https://www.bipm.org/en/publications/si-brochure'), route + ': BIPM');
    assert(html.includes('<th scope="col"'), route + ': accessible example table');
    report.pairPages++;
  }
  for (const slug of ['privacy', 'cookies', 'contact', 'about', 'terms']) {
    const route = `${locale.path}/${slug}`;
    const html = read(route);
    const dom = new JSDOM(html, { url: 'https://audit.invalid/' });
    const document = dom.window.document;
    const footer = document.querySelector('footer');
    assert(footer, route + ': footer');
    for (const support of ['privacy', 'cookies', 'contact', 'about', 'terms']) {
      assert(footer.querySelector(`a[href="/${locale.path}/${support}"]`), route + ': support link ' + support);
    }
    assert(footer.textContent.includes(dictionary['consent.manage']), route + ': privacy choices');
    assert(!document.querySelector('.ad-slot'), route + ': manual ad slot excluded');
    if (slug === 'privacy' || slug === 'cookies') assert(document.querySelector('main').textContent.includes(dictionary['consent.manage']), route + ': page privacy choices');
    dom.window.close();
    report.legalPages++;
  }
  const home = read(locale.path);
  assert(home.includes(escape(dictionary['home.cta.body'])), locale.path + ': corrected sharing disclosure');
  report.homePages++;
}
assert.equal(report.pairPages, 732);
assert.equal(report.legalPages, 60);
assert.equal(report.homePages, 12);
report.checks = ['732 localized pair pages include worked examples, accessible tables, precision notes and source links', '60 legal pages include direct support links and privacy choices, without manual ad-slot wrappers', '12 home pages include the corrected sharing disclosure'];
fs.writeFileSync(path.join(__dirname, 'ADSENSE_FIX_ARTIFACTS.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
