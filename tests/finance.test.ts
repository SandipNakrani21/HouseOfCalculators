import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import {
  amortisationMonths,
  amortisationSchedule,
  cagr,
  compoundFutureValue,
  emi,
  inflationAdjusted,
  lumpsumFutureValue,
  recurringDepositMaturity,
  simpleInterest,
  sipFutureValue,
  stepUpSipFutureValue,
  stepUpSipInvested,
  swpFinalValue,
} from "../src/lib/finance/index.ts";

/** Compares to the nearest minor unit, which is the precision we display. */
function near(actual: number, expected: number, tolerance = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

describe("emi", () => {
  test("matches a known amortisation", () => {
    // 200,000 at 6% over 25 years is a textbook figure.
    near(emi(200_000, 6, 300), 1288.6);
  });

  test("a zero-rate loan is just the principal spread evenly", () => {
    assert.equal(emi(12_000, 0, 12), 1000);
  });

  test("a single period repays principal plus one month of interest", () => {
    near(emi(1000, 12, 1), 1010);
  });

  test("a term of zero has no payment rather than dividing by zero", () => {
    assert.equal(emi(1000, 5, 0), 0);
  });

  test("a very high rate stays finite", () => {
    assert.ok(Number.isFinite(emi(10_000, 200, 60)));
  });
});

describe("amortisation", () => {
  const principal = 200_000;
  const rate = 6;
  const months = 300;

  test("the schedule ends at a zero balance", () => {
    const schedule = amortisationSchedule(principal, rate, months);
    near(schedule[schedule.length - 1].balance, 0, 0.5);
  });

  test("principal repaid over the term equals the amount borrowed", () => {
    const total = amortisationSchedule(principal, rate, months).reduce(
      (sum, year) => sum + year.principalPaid,
      0,
    );
    near(total, principal, 0.5);
  });

  test("monthly and yearly views reconcile", () => {
    const monthly = amortisationMonths(principal, rate, months);
    const yearly = amortisationSchedule(principal, rate, months);

    const monthlyInterest = monthly.reduce((sum, row) => sum + row.interestPaid, 0);
    const yearlyInterest = yearly.reduce((sum, row) => sum + row.interestPaid, 0);
    near(monthlyInterest, yearlyInterest, 0.01);
  });

  test("the yearly view has one row per year", () => {
    assert.equal(amortisationSchedule(principal, rate, months).length, 25);
  });

  test("interest falls monotonically as the balance falls", () => {
    const monthly = amortisationMonths(principal, rate, months);
    for (let i = 1; i < monthly.length; i += 1) {
      assert.ok(monthly[i].interestPaid <= monthly[i - 1].interestPaid);
    }
  });
});

describe("compounding", () => {
  test("monthly compounding beats annual at the same rate", () => {
    const monthly = compoundFutureValue(10_000, 6, 10, 12);
    const annual = compoundFutureValue(10_000, 6, 10, 1);
    near(monthly, 18_193.97);
    near(annual, 17_908.48);
    assert.ok(monthly > annual);
  });

  test("a zero rate returns the principal", () => {
    assert.equal(compoundFutureValue(5000, 0, 10, 12), 5000);
  });

  test("lumpsum growth matches annual compounding", () => {
    near(lumpsumFutureValue(10_000, 6, 10), compoundFutureValue(10_000, 6, 10, 1));
  });

  test("simple interest is linear in time", () => {
    assert.equal(simpleInterest(1000, 5, 2), 2 * simpleInterest(1000, 5, 1));
  });
});

describe("regular contributions", () => {
  test("future value of a 20-year monthly plan", () => {
    near(sipFutureValue(500, 7, 20), 261_982.7, 1);
  });

  test("a zero rate returns exactly what was paid in", () => {
    assert.equal(sipFutureValue(500, 0, 10), 500 * 120);
  });

  test("a step-up of zero matches the flat plan", () => {
    const flat = sipFutureValue(1000, 10, 15);
    const stepped = stepUpSipFutureValue(1000, 10, 15, 0);
    // The step-up walk compounds month by month, so it differs by rounding
    // rather than by method; a tenth of a unit is well inside that.
    near(stepped, flat, 0.1);
  });

  test("a step-up pays in more than a flat plan", () => {
    assert.ok(stepUpSipInvested(1000, 10, 10) > 1000 * 120);
  });

  test("recurring deposits exceed the sum deposited", () => {
    const maturity = recurringDepositMaturity(1000, 7, 24);
    assert.ok(maturity > 24_000);
  });
});

describe("withdrawals and inflation", () => {
  test("a sustainable withdrawal leaves a balance", () => {
    const result = swpFinalValue(1_000_000, 4000, 8, 10);
    assert.ok(result.finalValue > 0);
    assert.equal(result.monthsLasted, 120);
  });

  test("an unsustainable withdrawal empties the pot early", () => {
    const result = swpFinalValue(100_000, 10_000, 5, 10);
    assert.ok(result.monthsLasted < 120);
    assert.equal(result.finalValue, 0);
  });

  test("inflation adjustment is symmetric", () => {
    const { futureCost } = inflationAdjusted(100, 5, 10);
    const { presentValue } = inflationAdjusted(futureCost, 5, 10);
    near(presentValue, 100);
  });
});

describe("cagr", () => {
  test("doubling over ten years is about 7.18%", () => {
    near(cagr(1000, 2000, 10), 7.177, 0.01);
  });

  test("no growth gives a zero rate", () => {
    near(cagr(1000, 1000, 5), 0);
  });

  test("a zero starting value returns zero rather than infinity", () => {
    assert.equal(cagr(0, 1000, 5), 0);
  });
});
