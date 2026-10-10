require('./load-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { COUNTRIES } = require('../src/config/countries.ts');
const { CALCULATORS } = require('../src/config/calculators/index.ts');
const { MONEY_SCALE } = require('../src/config/calculators/scale.ts');
const { CONVERTERS } = require('../src/config/converters/definitions.ts');
const { convert } = require('../src/config/converters/units.ts');
const { createFormatter } = require('../src/lib/format.ts');
const { translate } = require('../src/lib/i18n/core.ts');
const v = require('../src/lib/validation.ts');
const n = require('../src/lib/tools/numbers.ts');
const d = require('../src/lib/tools/dates.ts');
const r = require('../src/lib/tools/random.ts');
const p = require('../src/lib/tools/planning.ts');
const { emi } = require('../src/lib/finance/index.ts');
const { readShareQuery, buildShareUrl } = require('../src/lib/share-link.ts');
const en = require('../src/lib/i18n/dictionaries/en.json');
const t = (key, params) => translate(en, key, params);
const context = country => ({ countryCode: country, country: COUNTRIES[country], t, fmt: createFormatter(country, 'en', t) });
function calculate(slug, overrides) {
  const calc = CALCULATORS.find(c => c.slug === slug), ctx = context('us');
  return calc.compute({ ...Object.fromEntries(calc.fields(ctx).map(f => [f.id, f.default])), ...overrides }, ctx);
}
test('All calculator defaults validate in every supported country', () => {
  for (const calc of CALCULATORS) for (const country of calc.countries) {
    for (const field of calc.fields(context(country))) assert.equal(v.calculatorFieldError(field, field.default, country), null, `${calc.slug}/${country}/${field.id}=${field.default}`);
  }
});
test('All calculator country and field boundaries produce finite or explicitly unavailable results', () => {
  function inspect(value, label) {
    if (typeof value === 'number') assert(Number.isFinite(value), label);
    else if (typeof value === 'string') assert(!/^(NaN|Infinity)(?:×|$)|undefined hundred/.test(value), label);
    else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) inspect(child, `${label}.${key}`);
  }
  for (const calc of CALCULATORS) for (const country of calc.countries) {
    const ctx = context(country), fields = calc.fields(ctx), defaults = Object.fromEntries(fields.map(f => [f.id, f.default]));
    inspect(calc.compute(defaults, ctx), `${calc.slug}/${country}/defaults`);
    for (const field of fields) {
      const options = field.kind === 'select' ? field.options.map(o => o.value) : field.kind === 'toggle' ? [!field.default] : typeof field.default === 'number' ? [field.min, field.max].filter(x => x !== undefined) : [];
      for (const value of options) inspect(calc.compute({ ...defaults, [field.id]: value }, ctx), `${calc.slug}/${country}/${field.id}=${value}`);
    }
  }
});
test('Blank, exponent, excess digits, fractional counts and precision are rejected', () => {
  const rules = { min: 0, max: 100000, decimals: 2 };
  assert.equal(v.numberError('', rules), 'required');
  assert.equal(v.numberError('1e5', rules), 'number');
  assert.equal(v.numberError('0000001', rules), 'digits');
  assert.equal(v.numberError('1.001', rules), 'decimals');
  assert.equal(v.numberError('1.5', { ...rules, integer: true }), 'integer');
  assert.equal(v.numberError('100001', rules), 'max');
  assert.equal(v.numberError('-1', rules), 'min');
  assert.equal(v.numberError('100.25', rules), null);
  assert.equal(v.numberError('999999999999.123456', { min: 0, max: 1e12, decimals: 6 }), 'precision');
});
test('Currency precision and ranges follow all 22 countries', () => {
  for (const country of Object.keys(COUNTRIES)) {
    const rules = v.toolRules('balance', country);
    assert.equal(rules.max, MONEY_SCALE[country].lumpMax);
    assert.equal(v.numberError(String(rules.max), rules), null);
    assert.equal(v.numberError(String(rules.max + 1), rules), 'max');
    assert.equal(v.numberError('-1', rules), 'min');
  }
  assert.equal(v.currencyDecimals('jp'), 0);
  assert.equal(v.currencyDecimals('us'), 2);
  assert.equal(v.numberError('10.5', v.toolRules('balance', 'jp')), 'decimals');
  assert.equal(v.numberError('10.50', v.toolRules('balance', 'us')), null);
  assert.notEqual(v.toolRules('balance', 'in').max, v.toolRules('balance', 'us').max);
});
test('Localized decimal input supports commas without accepting mixed separators', () => {
  assert.equal(v.normalizeNumericInput('12,50', 'de-DE'), '12.50');
  assert.equal(v.normalizeNumericInput('12.50', 'de-DE'), '12.50');
  assert.equal(v.numberError(v.normalizeNumericInput('1.000,50', 'de-DE'), { min: 0, max: 1e6, decimals: 2 }), 'number');
});
test('Number lists validate all tokens and enforce the item limit', () => {
  assert.equal(v.numberListError('10, abc, 20'), 'list');
  assert.equal(v.numberListError(''), 'required');
  assert.equal(v.numberListError(Array(101).fill('1').join(',')), 'list');
  assert.equal(v.numberListError(Array(100).fill('1').join(',')), null);
  const result = calculate('statistics', { values: '10, abc, 20' });
  assert.equal(result.primary.value, '—');
  assert.equal(calculate('statistics', { values: '10,20,30' }).primary.value, 20);
});
test('Unsupported random ranges fail promptly and valid draws stay in range', () => {
  assert.throws(() => r.randomInt(0, 5000000000), RangeError);
  assert.throws(() => r.randomInt(10, 1), RangeError);
  assert.throws(() => r.randomInt(1.5, 2), RangeError);
  for (let i = 0; i < 1000; i++) { const draw = r.randomInt(-10, 10); assert(Number.isInteger(draw) && draw >= -10 && draw <= 10); }
  assert.equal(r.randomInt(4, 4), 4);
  assert(Number.isInteger(r.randomInt(0, 0xffffffff)));
});
test('Large factor inputs cannot enter the expensive loops', () => {
  assert.deepEqual(n.divisorsOf(1e30), []);
  assert.deepEqual(n.primeFactors(Infinity), []);
  assert.equal(n.isPrime(1e30), false);
  assert.deepEqual(n.primeFactors(360), [2, 2, 2, 3, 3, 5]);
  assert.equal(n.gcd(360, 48), 24);
  assert.equal(n.lcm(1000000000, 999999937), 999999937000000000n);
  assert.equal(context('us').fmt.number(n.lcm(1000000000, 999999937)), '999,999,937,000,000,000');
});
test('Number spelling carries rounding and rejects unsupported scales', () => {
  assert.equal(n.numberToWords(1.999), 'two');
  assert.equal(n.numberToWords(-1.999), 'minus two');
  assert.equal(n.numberToWords(12.05), 'twelve point zero five');
  assert.equal(n.numberToWords(2e15), '');
  assert(!n.numberToWords(v.MAX_WORD_NUMBER).includes('undefined'));
});
test('Dates preserve early years, reject impossible dates and bound formatting', () => {
  assert.equal(d.parseDate('0099-01-01').getUTCFullYear(), 99);
  assert.equal(d.daysBetween(d.startOfYear(d.parseDate('0099-01-01')), d.parseDate('0099-01-01')), 0);
  assert.equal(d.parseDate('0001-01-01').getUTCFullYear(), 1);
  assert.equal(d.parseDate('0000-01-01'), null);
  assert.equal(d.parseDate('2025-02-30'), null);
  assert.equal(d.toInputValue(d.addMonths(d.parseDate('2026-01-31'), 1)), '2026-02-28');
  const invalid = d.addDays(d.parseDate('2026-01-01'), 1e9);
  assert.equal(d.isSupportedDate(invalid), false);
  assert.equal(d.toInputValue(invalid), '');
  assert.equal(d.ageOn(d.parseDate('2030-01-01'), d.parseDate('2026-01-01')).years, 0);
  assert.equal(d.ageOn(d.parseDate('1990-01-01'), d.parseDate('2026-01-01')).years, 36);
  assert.deepEqual(d.isoWeek(d.parseDate('2021-01-01')), { week: 53, year: 2020 });
});
test('Truncated debt schedules report an outstanding balance', () => {
  const result = p.debtPayoff({ balance: 5000, payment: 5, annualRate: 0 });
  assert.equal(result.limitReached, true);
  assert.equal(result.remainingBalance, 2000);
  const cleared = p.debtPayoff({ balance: 1000, payment: 100, annualRate: 0 });
  assert.equal(cleared.limitReached, false);
  assert.equal(cleared.months, 10);
  assert.equal(cleared.totalPaid, 1000);
});
test('Undefined ratios and powers are explicit, while known answers still work', () => {
  assert(Number.isNaN(n.percentage.share(5, 0)));
  assert(Number.isNaN(n.percentage.change(0, 100)));
  assert.equal(n.percentage.of(15, 200), 30);
  for (const [slug, input] of [['profit-margin', { revenue: 0, cost: 100 }], ['roi', { cost: 0, gain: 100 }], ['roas', { spend: 0, revenue: 100 }], ['exponent', { base: -4, exponent: .5, root: 2 }]]) {
    const result = calculate(slug, input);
    assert.equal(result.primary.value, '—', slug);
    assert(result.notes.some(n => n.key === 'validation.undefined'));
  }
  assert.equal(emi(12000, 0, 12), 1000);
  assert(Math.abs(emi(300000, 6, 360) - 1798.65157545827) < 1e-7);
  assert.equal(calculate('profit-margin', { revenue: 100, cost: 60 }).primary.value, 40);
});
test('Converters reject undefined reciprocals; non-finite values never format as zero', () => {
  const fuel = CONVERTERS.find(c => c.slug === 'fuel-economy');
  assert(Number.isNaN(convert(fuel, 0, 'km-per-liter', 'liters-per-100km')));
  assert.equal(convert(fuel, 20, 'km-per-liter', 'liters-per-100km'), 5);
  assert.equal(convert(fuel, 0, 'liters-per-100km', 'liters-per-100km'), 0);
  const fmt = context('us').fmt;
  assert.equal(fmt.number(Infinity), '—');
  assert.equal(fmt.currency(NaN), '—');
  assert.equal(fmt.currencyShort(Infinity), '—');
  for (const converter of CONVERTERS) for (const from of converter.units) for (const to of converter.units) {
    const value = convert(converter, 10, from.id, to.id);
    assert(Math.abs(convert(converter, value, to.id, from.id) - 10) < 1e-7);
  }
});
test('Share URLs preserve valid defaults and reject invalid inputs instead of clamping', () => {
  for (const calc of CALCULATORS) {
    const country = calc.countries.includes('us') ? 'us' : calc.countries[0], fields = calc.fields(context(country));
    const values = Object.fromEntries(fields.map(f => [f.id, f.default]));
    const restored = readShareQuery(new URL(buildShareUrl('https://example.com', values, country)).hash, fields);
    assert.deepEqual(restored.values, values, calc.slug);
  }
  const fields = CALCULATORS.find(c => c.slug === 'mortgage').fields(context('us'));
  const field = fields.find(f => f.kind === 'currency');
  assert.equal(readShareQuery(`?${field.id}=1e300`, fields), null);
});
test('All available non-English languages contain shared validation and action messages', () => {
  const oldKeys = ['calc.validation.required', 'calc.validation.min', 'calc.validation.max', 'calc.validation.incomplete', 'calc.countryPreserveHint', 'calc.countryResetHint', 'actions.copyToolLink', 'actions.shareTool', 'notice.readFull', 'calc.taxYear', 'calc.taxCoverage', 'calc.taxDataset'];
  for (const lang of ['de', 'fr', 'es', 'pt', 'it', 'nl', 'ru', 'tr', 'ja', 'zh']) {
    const dict = require(`../src/lib/i18n/dictionaries/${lang}.json`);
    for (const key of [...oldKeys, ...Object.keys(en).filter(k => k.startsWith('validation.'))]) {
      assert(dict[key], `${lang}/${key}`);
      assert.deepEqual([...dict[key].matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort(), [...en[key].matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort(), `${lang}/${key} placeholders`);
    }
  }
});
