require('./load-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { CALCULATORS } = require('../src/config/calculators/index.ts');
const { COUNTRIES } = require('../src/config/countries.ts');
const { LOCALES } = require('../src/config/locales.ts');
const { TOOLS } = require('../src/config/tools/definitions.ts');
const { toolExamples } = require('../src/config/tools/examples.ts');
const { WorkedExample } = require('../src/components/calculator/WorkedExample.tsx');
const { createFormatter } = require('../src/lib/format.ts');
const { translate } = require('../src/lib/i18n/core.ts');
const { ruleReview } = require('../src/config/calculators/provenance.ts');
const { isAdEligiblePath } = require('../src/config/ad-inventory.ts');
const en = require('../src/lib/i18n/dictionaries/en.json');
const t = (key, params) => translate(en, key, params);

test('Every calculator publishes valid worked inputs and finite results for every supported country', () => {
  let cases = 0;
  for (const calculator of CALCULATORS) for (const countryCode of calculator.countries) {
    const ctx = { t, countryCode, country: COUNTRIES[countryCode], fmt: createFormatter(countryCode, 'en', t) };
    const values = Object.fromEntries(calculator.fields(ctx).map(field => [field.id, field.default]));
    assert.equal(calculator.validate?.(values, ctx) ?? null, null, calculator.slug + ':' + countryCode);
    const result = calculator.compute(values, ctx);
    for (const row of [result.primary, ...result.rows]) if (typeof row.value === 'number') assert(Number.isFinite(row.value), calculator.slug + ':' + countryCode + ':' + row.labelKey);
    const html = renderToStaticMarkup(React.createElement(WorkedExample, { calculator, ctx }));
    assert(html.includes('data-worked-example='));
    assert(!/NaN|Infinity|quality\.|\{country\}|\{version\}/.test(html), calculator.slug + ':' + countryCode);
    cases++;
  }
  console.log('Verified calculator illustrations:', cases);
});

test('All tools have substantive deterministic teaching examples in all available locales', () => {
  let cases = 0;
  for (const locale of Object.values(LOCALES).filter(locale => locale.launch)) {
    const dictionary = require('../src/lib/i18n/dictionaries/' + locale.language + '.json');
    const tr = (key, params) => { assert(Object.hasOwn(dictionary, key), locale.path + ': ' + key); return translate(dictionary, key, params); };
    const fmt = createFormatter(locale.defaultCountry, locale.language, tr);
    for (const tool of TOOLS) {
      const examples = toolExamples(tool.slug, tr, fmt);
      assert(examples.length >= 1, tool.slug);
      assert.deepEqual(examples, toolExamples(tool.slug, tr, fmt));
      for (const example of examples) { assert(example.input.length && example.output.length); assert(!/NaN|Infinity|undefined/.test(example.output)); }
      assert(dictionary['quality.toolLimit.' + tool.category]);
      cases++;
    }
  }
  assert.equal(cases, 276);
});

test('Exact ad inventory excludes unknown routes and every country model without source-review coverage', () => {
  for (const calculator of CALCULATORS.filter(calc => calc.isCountrySpecific)) for (const country of calculator.countries) {
    assert.equal(isAdEligiblePath(`/en-us/countries/${country}/${calculator.slug}`), Boolean(ruleReview(calculator.slug, country)));
  }
  for (const path of ['/en-us', '/', '/xx-xx/calculators/finance/mortgage', '/hi-in/calculators/finance/mortgage', '/en-us/tools/utility/not-a-tool', '/en-us/guides/finance/not-a-guide', '/en-us/converters/temperature/not-a-pair']) assert.equal(isAdEligiblePath(path), false, path);
});

test('Teaching examples agree with leap-day, ISO week, arithmetic and zero-rate planning known answers', () => {
  const fmt = createFormatter('us', 'en', t);
  assert.equal(toolExamples('date-difference', t, fmt)[0].output, '2');
  assert.equal(toolExamples('week-number', t, fmt)[0].output, 'Week 53 of 2020');
  assert.equal(toolExamples('percentage', t, fmt)[0].output, '30');
  assert.equal(toolExamples('roman-numerals', t, fmt)[0].output, 'MCMXCIV');
  assert.equal(toolExamples('debt-payoff', t, fmt)[0].output, '12 × Mos');
  assert.equal(toolExamples('savings-goal', t, fmt)[0].output, '12 × Mos');
});
