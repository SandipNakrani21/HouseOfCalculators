require('./load-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { LocaleProvider } = require('../src/lib/locale-context.tsx');
const { LOCALES } = require('../src/config/locales.ts');
const { ToolValidationProvider, NumberInput } = require('../src/components/tools/ValidatedInput.tsx');
const groups = ['DateTools', 'NumberTools', 'MoreTools', 'RandomTools', 'UtilityTools'];
const allTools = groups.flatMap(group => Object.entries(require(`../src/components/tools/${group}.tsx`)).filter(([name]) => name.endsWith('Tool')));
const en = require('../src/lib/i18n/dictionaries/en.json');
const { CalculatorRunner } = require('../src/components/calculator/CalculatorRunner.tsx');
const { CALCULATORS } = require('../src/config/calculators/index.ts');
function render(Component, props = {}, locale = 'en-US', country = 'us') {
  const dict = { ...en, ...require(`../src/lib/i18n/dictionaries/${LOCALES[locale].language}.json`) };
  return renderToStaticMarkup(React.createElement(LocaleProvider, { localeCode: locale, dictionary: dict, forcedCountry: country },
    React.createElement(ToolValidationProvider, null, React.createElement(Component, props))));
}
test('Health donut labels use quantity units, and invalid cross-field combinations have an explanation',()=>{
 const calculator=CALCULATORS.find(c=>c.slug==='body-fat');
 for(const locale of Object.values(LOCALES).filter(l=>l.launch)){
  const html=render(CalculatorRunner,{slug:calculator.slug,calculator},locale.code,'us');
  assert(!/aria-label="[^"]*\$/.test(html));
  const pounds = require(`../src/lib/i18n/dictionaries/${locale.language}.json`)['units.pounds'];
  assert(html.includes(`(${pounds})`), `${locale.code}: chart must use the translated quantity unit`);
  assert(!html.includes('units.pounds'));
 }
 const retirement=CALCULATORS.find(c=>c.slug==='retirement');
 assert(retirement.validate({age:70,retireAge:45}));
});
test('Every registered tool renders defaults in every available language without missing keys or invalid numeric fields', () => {
  assert.equal(allTools.length, 23);
  for (const locale of Object.values(LOCALES).filter(l => l.launch)) for (const [name, Component] of allTools) {
    const html = render(Component, {}, locale.code, locale.defaultCountry);
    assert(!html.includes('aria-invalid="true"'), `${locale.code}/${name} default field invalid`);
    assert(!/\bNaN\b|\bInfinity\b|undefined hundred/.test(html), `${locale.code}/${name} invalid output`);
    assert(!/>validation\.[a-zA-Z]+</.test(html), `${locale.code}/${name} missing translation`);
  }
});
test('Numeric field markup preserves blank input and exposes its error and range', () => {
  const html = render(NumberInput, { id: 'balance', rule: 'balance', value: '', onValueChange: () => {} });
  assert(html.includes('value=""'));
  assert(html.includes('aria-invalid="true"'));
  assert(html.includes('Enter a value.'));
  assert(html.includes('Range:'));
  assert(/aria-describedby="[^"]+-bounds [^"]+-error"/.test(html));
  const domainError = render(NumberInput, { rule: 'amount', value: 1, 'aria-invalid': true, 'aria-describedby': 'date-error', onValueChange: () => {} });
  assert(domainError.includes('aria-invalid="true"'));
  assert(domainError.includes('aria-describedby="date-error '));
});
test('Currency fields render the correct precision and reject excessive digits', () => {
  const yen = render(NumberInput, { rule: 'balance', value: 10.5, onValueChange: () => {} }, 'ja-JP', 'jp');
  assert(yen.includes('aria-invalid="true"'));
  const dollar = render(NumberInput, { rule: 'balance', value: 10.5, onValueChange: () => {} });
  assert(dollar.includes('aria-invalid="false"'));
  const excessive = render(NumberInput, { rule: 'factor', value: '10000000000', onValueChange: () => {} });
  assert(excessive.includes('aria-invalid="true"'));
});
test('Percentage modes use the shared radio pattern and English-word help is associated', () => {
  const Percentage = allTools.find(([name]) => name === 'PercentageTool')[1];
  const Words = allTools.find(([name]) => name === 'WordsToNumberTool')[1];
  const html = render(Percentage);
  assert(html.includes('role="radiogroup"'));
  assert(!html.includes('role="tablist"'));
  assert.equal((html.match(/role="radio"/g) || []).length, 4);
  const words = render(Words);
  assert(words.includes('aria-describedby="words-hint"'));
  assert(words.includes('id="words-hint"'));
});
