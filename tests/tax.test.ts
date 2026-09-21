import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { COUNTRY_CODES } from "../src/config/countries.ts";
import { INCOME_TAX_RULES } from "../src/lib/finance/tax/rules.ts";
import { applySlabs, marginalRate } from "../src/lib/finance/tax/slabs.ts";

function near(actual: number, expected: number, tolerance = 1) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

describe("slab engine", () => {
  const slabs = [
    { from: 0, rate: 0 },
    { from: 10_000, rate: 10 },
    { from: 50_000, rate: 20 },
  ];

  test("income below the first threshold is untaxed", () => {
    assert.equal(applySlabs(9_999, slabs).tax, 0);
  });

  test("only the slice inside each band is taxed at that rate", () => {
    // 60,000: nothing on the first 10k, 10% on 40k, 20% on 10k.
    assert.equal(applySlabs(60_000, slabs).tax, 4000 + 2000);
  });

  test("exactly on a threshold uses the lower band", () => {
    assert.equal(applySlabs(10_000, slabs).tax, 0);
    assert.equal(applySlabs(50_000, slabs).tax, 4000);
  });

  test("portions sum to the total", () => {
    const { tax, portions } = applySlabs(75_000, slabs);
    const summed = portions.reduce((total, portion) => total + portion.tax, 0);
    near(summed, tax, 0.0001);
  });

  test("marginal rate reports the band the income sits in", () => {
    assert.equal(marginalRate(5_000, slabs), 0);
    assert.equal(marginalRate(20_000, slabs), 10);
    assert.equal(marginalRate(60_000, slabs), 20);
  });
});

describe("every country's rules are coherent", () => {
  for (const country of COUNTRY_CODES) {
    const rules = INCOME_TAX_RULES[country];

    test(`${country}: zero income produces zero tax`, () => {
      const result = rules.compute({ grossIncome: 0 });
      assert.equal(result.totalTax, 0);
      assert.equal(result.netIncome, 0);
    });

    test(`${country}: tax never exceeds gross income`, () => {
      for (const income of [10_000, 100_000, 1_000_000, 10_000_000]) {
        const result = rules.compute({ grossIncome: income });
        assert.ok(
          result.totalTax <= income,
          `${country} charged ${result.totalTax} on ${income}`,
        );
        assert.ok(result.netIncome >= 0);
      }
    });

    test(`${country}: tax never falls as income rises`, () => {
      let previous = -1;
      for (let income = 0; income <= 500_000; income += 25_000) {
        const { totalTax } = rules.compute({ grossIncome: income });
        assert.ok(
          totalTax >= previous - 0.01,
          `${country} tax fell from ${previous} to ${totalTax} at ${income}`,
        );
        previous = totalTax;
      }
    });

    test(`${country}: the parts add up to the total`, () => {
      const result = rules.compute({ grossIncome: 120_000 });
      const surtaxes = result.surtaxes.reduce((sum, levy) => sum + levy.amount, 0);
      const social = result.social.reduce((sum, levy) => sum + levy.amount, 0);
      near(
        result.baseTax - result.credit + surtaxes + social,
        result.totalTax,
        0.01,
      );
      near(result.grossIncome - result.totalTax, result.netIncome, 0.01);
    });

    test(`${country}: declares the year it was written for`, () => {
      assert.ok(rules.verifiedFor.length > 0);
      assert.ok(rules.taxYear.length > 0);
    });

    test(`${country}: the default regime is one it offers`, () => {
      if (rules.regimes.length) {
        assert.ok(
          rules.regimes.some((regime) => regime.value === rules.defaultRegime),
        );
      }
    });
  }
});

describe("known figures", () => {
  test("India: 12 lakh under the new regime is fully rebated", () => {
    const result = INCOME_TAX_RULES.in.compute({
      grossIncome: 1_200_000,
      regime: "new",
    });
    // 75,000 standard deduction leaves 11.25 lakh, inside the 87A ceiling.
    assert.equal(result.taxableIncome, 1_125_000);
    assert.equal(result.totalTax, 0);
  });

  test("India: the rebate stops applying above the ceiling", () => {
    const result = INCOME_TAX_RULES.in.compute({
      grossIncome: 2_000_000,
      regime: "new",
    });
    assert.ok(result.totalTax > 0);
    assert.equal(result.credit, 0);
  });

  test("US: a single filer on 85,000", () => {
    const result = INCOME_TAX_RULES.us.compute({
      grossIncome: 85_000,
      regime: "single",
    });
    assert.equal(result.taxableIncome, 85_000 - 15_750);
    near(result.baseTax, 10_149, 1);
  });

  test("US: Social Security stops at the wage base", () => {
    const below = INCOME_TAX_RULES.us.compute({ grossIncome: 176_100 });
    const above = INCOME_TAX_RULES.us.compute({ grossIncome: 400_000 });
    const ss = (result: typeof below) =>
      result.social.find((levy) => levy.labelKey === "levy.socialSecurity")!.amount;
    near(ss(below), ss(above), 0.01);
  });

  test("UK: the personal allowance tapers away by 125,140", () => {
    assert.equal(
      INCOME_TAX_RULES.gb.compute({ grossIncome: 125_140 }).standardDeduction,
      0,
    );
    near(
      INCOME_TAX_RULES.gb.compute({ grossIncome: 50_000 }).standardDeduction,
      12_570,
    );
  });

  test("UAE charges nothing on salary", () => {
    const result = INCOME_TAX_RULES.ae.compute({ grossIncome: 500_000 });
    assert.equal(result.totalTax, 0);
    assert.equal(result.netIncome, 500_000);
  });

  test("Germany: below the Grundfreibetrag there is no tax", () => {
    const result = INCOME_TAX_RULES.de.compute({ grossIncome: 12_000 });
    assert.equal(result.baseTax, 0);
  });

  test("Australia: the tax-free threshold is respected", () => {
    assert.equal(INCOME_TAX_RULES.au.compute({ grossIncome: 18_200 }).baseTax, 0);
    assert.ok(INCOME_TAX_RULES.au.compute({ grossIncome: 20_000 }).baseTax > 0);
  });
});

describe("deductions", () => {
  test("claiming a deduction never increases the tax", () => {
    for (const country of COUNTRY_CODES) {
      const rules = INCOME_TAX_RULES[country];
      if (!rules.allowsDeductions(rules.defaultRegime)) continue;

      const without = rules.compute({ grossIncome: 100_000, deductions: 0 });
      const with10k = rules.compute({ grossIncome: 100_000, deductions: 10_000 });
      assert.ok(
        with10k.totalTax <= without.totalTax + 0.01,
        `${country}: deduction raised the tax`,
      );
    }
  });

  test("a deduction larger than income cannot create negative taxable income", () => {
    for (const country of COUNTRY_CODES) {
      const result = INCOME_TAX_RULES[country].compute({
        grossIncome: 20_000,
        deductions: 500_000,
      });
      assert.ok(result.taxableIncome >= 0, `${country} went negative`);
    }
  });
});
