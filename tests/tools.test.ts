import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import {
  addDays,
  addMonths,
  ageOn,
  calendarDifference,
  dayOfWeek,
  daysBetween,
  isoWeek,
  nextBirthday,
  parseDate,
  toInputValue,
  workingDaysBetween,
} from "../src/lib/tools/dates.ts";
import {
  divisorsOf,
  fromRoman,
  gcd,
  isPrime,
  lcm,
  numberToWords,
  percentage,
  primeFactors,
  simplifyFraction,
  toRoman,
} from "../src/lib/tools/numbers.ts";
import {
  debtPayoff,
  depositForGoal,
  savingsGoal,
} from "../src/lib/tools/planning.ts";

/** `2025-09-21` as a UTC date, which is what every tool works in. */
function d(iso: string): Date {
  const date = parseDate(iso);
  assert.ok(date, `${iso} did not parse`);
  return date;
}

function near(actual: number, expected: number, tolerance = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

describe("parseDate", () => {
  test("accepts a well-formed date", () => {
    assert.equal(toInputValue(d("2025-09-21")), "2025-09-21");
  });

  test("rejects a day the month does not have rather than rolling over", () => {
    // `new Date` would silently turn 30 February into 2 March.
    assert.equal(parseDate("2025-02-30"), null);
    assert.equal(parseDate("2025-04-31"), null);
    assert.equal(parseDate("2025-13-01"), null);
  });

  test("handles the leap-year boundary", () => {
    assert.equal(toInputValue(d("2024-02-29")), "2024-02-29");
    assert.equal(parseDate("2025-02-29"), null);
    // 1900 was not a leap year; 2000 was.
    assert.equal(parseDate("1900-02-29"), null);
    assert.equal(toInputValue(d("2000-02-29")), "2000-02-29");
  });

  test("rejects anything that is not YYYY-MM-DD", () => {
    for (const value of ["", "2025-9-21", "21-09-2025", "2025/09/21", "today"]) {
      assert.equal(parseDate(value), null, `${value} should not parse`);
    }
  });

  test("round-trips through toInputValue", () => {
    for (const iso of ["1900-01-01", "2000-02-29", "2025-12-31", "2099-06-15"]) {
      assert.equal(toInputValue(d(iso)), iso);
    }
  });
});

describe("daysBetween", () => {
  test("counts whole days", () => {
    assert.equal(daysBetween(d("2025-01-01"), d("2025-01-31")), 30);
    assert.equal(daysBetween(d("2024-01-01"), d("2025-01-01")), 366);
    assert.equal(daysBetween(d("2025-01-01"), d("2026-01-01")), 365);
  });

  test("is signed and antisymmetric", () => {
    assert.equal(daysBetween(d("2025-03-10"), d("2025-03-01")), -9);
    assert.equal(daysBetween(d("2025-03-01"), d("2025-03-01")), 0);
  });

  test("is unaffected by a daylight-saving boundary", () => {
    // These weekends shift the clock in the US and the EU. In local time the
    // two dates would be 23 or 25 hours apart and the division would drop or
    // gain a day; working in UTC is what keeps this exact.
    assert.equal(daysBetween(d("2025-03-08"), d("2025-03-10")), 2);
    assert.equal(daysBetween(d("2025-11-01"), d("2025-11-03")), 2);
    assert.equal(daysBetween(d("2025-03-29"), d("2025-03-31")), 2);
    assert.equal(daysBetween(d("2025-10-25"), d("2025-10-27")), 2);
  });
});

describe("addDays", () => {
  test("moves forwards and backwards", () => {
    assert.equal(toInputValue(addDays(d("2025-09-21"), 10)), "2025-10-01");
    assert.equal(toInputValue(addDays(d("2025-09-21"), -21)), "2025-08-31");
  });

  test("crosses a year boundary", () => {
    assert.equal(toInputValue(addDays(d("2025-12-31"), 1)), "2026-01-01");
    assert.equal(toInputValue(addDays(d("2025-01-01"), -1)), "2024-12-31");
  });

  test("crosses a leap day", () => {
    assert.equal(toInputValue(addDays(d("2024-02-28"), 1)), "2024-02-29");
    assert.equal(toInputValue(addDays(d("2025-02-28"), 1)), "2025-03-01");
  });
});

describe("addMonths", () => {
  test("clamps the day rather than rolling into the next month", () => {
    assert.equal(toInputValue(addMonths(d("2025-01-31"), 1)), "2025-02-28");
    assert.equal(toInputValue(addMonths(d("2024-01-31"), 1)), "2024-02-29");
    assert.equal(toInputValue(addMonths(d("2025-03-31"), -1)), "2025-02-28");
    assert.equal(toInputValue(addMonths(d("2025-08-31"), 1)), "2025-09-30");
  });

  test("keeps the day when the target month is long enough", () => {
    assert.equal(toInputValue(addMonths(d("2025-01-15"), 1)), "2025-02-15");
    assert.equal(toInputValue(addMonths(d("2025-01-31"), 2)), "2025-03-31");
  });

  test("crosses year boundaries in both directions", () => {
    assert.equal(toInputValue(addMonths(d("2025-12-15"), 1)), "2026-01-15");
    assert.equal(toInputValue(addMonths(d("2025-01-15"), -1)), "2024-12-15");
    assert.equal(toInputValue(addMonths(d("2025-06-30"), 12)), "2026-06-30");
    assert.equal(toInputValue(addMonths(d("2025-06-30"), -18)), "2023-12-30");
  });

  test("clamping is not reversible, and should not pretend to be", () => {
    // 31 Jan -> 28 Feb -> 28 Jan. Anything that assumed a round trip here
    // would be wrong, so the behaviour is pinned rather than worked around.
    const clamped = addMonths(d("2025-01-31"), 1);
    assert.equal(toInputValue(addMonths(clamped, -1)), "2025-01-28");
  });
});

describe("calendarDifference", () => {
  test("splits a span into years, months and days", () => {
    assert.deepEqual(calendarDifference(d("1990-05-15"), d("2025-09-21")), {
      years: 35,
      months: 4,
      days: 6,
    });
    assert.deepEqual(calendarDifference(d("2025-01-01"), d("2025-01-01")), {
      years: 0,
      months: 0,
      days: 0,
    });
  });

  test("never reports negative days", () => {
    // Regression: borrowing February's 28 days when the start day was the
    // 31st left "1 month and -2 days" on the page.
    const spans: [string, string][] = [
      ["2025-01-31", "2025-03-01"],
      ["2025-01-30", "2025-03-01"],
      ["2024-01-31", "2024-03-01"],
      ["2025-08-31", "2025-10-01"],
      ["2025-05-31", "2025-07-01"],
    ];
    for (const [from, to] of spans) {
      const diff = calendarDifference(d(from), d(to));
      assert.ok(
        diff.days >= 0 && diff.months >= 0 && diff.years >= 0,
        `${from} to ${to} gave ${JSON.stringify(diff)}`,
      );
    }
  });

  test("agrees with the clamping rule addMonths uses", () => {
    // 31 Jan + 1 month is 28 Feb, so 31 Jan to 1 Mar is one month and a day.
    assert.deepEqual(calendarDifference(d("2025-01-31"), d("2025-03-01")), {
      years: 0,
      months: 1,
      days: 1,
    });
    assert.deepEqual(calendarDifference(d("2025-01-31"), d("2025-02-28")), {
      years: 0,
      months: 1,
      days: 0,
    });
    assert.deepEqual(calendarDifference(d("2025-08-31"), d("2025-10-01")), {
      years: 0,
      months: 1,
      days: 1,
    });
  });

  test("reconstructs the end date from its own parts", () => {
    const spans: [string, string][] = [
      ["1990-05-15", "2025-09-21"],
      ["2025-01-31", "2025-03-01"],
      ["2000-02-29", "2025-02-28"],
      ["2024-12-31", "2025-01-01"],
      ["1975-07-04", "2025-07-03"],
    ];
    for (const [from, to] of spans) {
      const { years, months, days } = calendarDifference(d(from), d(to));
      const rebuilt = addDays(addMonths(d(from), years * 12 + months), days);
      assert.equal(toInputValue(rebuilt), to, `${from} to ${to} did not reconstruct`);
    }
  });

  test("months stay inside a year", () => {
    const { months } = calendarDifference(d("2000-01-01"), d("2025-12-31"));
    assert.ok(months >= 0 && months < 12, `months out of range: ${months}`);
  });

  test("is symmetric - order of the arguments does not matter", () => {
    assert.deepEqual(
      calendarDifference(d("2025-09-21"), d("1990-05-15")),
      calendarDifference(d("1990-05-15"), d("2025-09-21")),
    );
  });
});

describe("workingDaysBetween", () => {
  test("counts both endpoints", () => {
    // Monday 2025-09-01 to Friday 2025-09-05 is a full working week.
    assert.equal(workingDaysBetween(d("2025-09-01"), d("2025-09-05")), 5);
  });

  test("excludes the weekend", () => {
    // Monday to the following Monday: two working weeks minus the 5 days off.
    assert.equal(workingDaysBetween(d("2025-09-01"), d("2025-09-08")), 6);
    assert.equal(workingDaysBetween(d("2025-09-06"), d("2025-09-07")), 0);
  });

  test("a single day counts itself, unless it is a weekend", () => {
    assert.equal(workingDaysBetween(d("2025-09-01"), d("2025-09-01")), 1);
    assert.equal(workingDaysBetween(d("2025-09-06"), d("2025-09-06")), 0);
  });

  test("a whole number of weeks is exactly five days each", () => {
    for (const weeks of [1, 2, 4, 10]) {
      const end = addDays(d("2025-09-01"), weeks * 7 - 1);
      assert.equal(workingDaysBetween(d("2025-09-01"), end), weeks * 5);
    }
  });

  test("order of the arguments does not matter", () => {
    assert.equal(
      workingDaysBetween(d("2025-09-05"), d("2025-09-01")),
      workingDaysBetween(d("2025-09-01"), d("2025-09-05")),
    );
  });

  test("agrees with counting the days one by one", () => {
    const start = d("2025-01-01");
    for (const length of [1, 9, 33, 100, 365]) {
      const end = addDays(start, length - 1);
      let counted = 0;
      for (let i = 0; i < length; i += 1) {
        const day = addDays(start, i).getUTCDay();
        if (day !== 0 && day !== 6) counted += 1;
      }
      assert.equal(
        workingDaysBetween(start, end),
        counted,
        `disagreed over a ${length}-day span`,
      );
    }
  });
});

describe("isoWeek", () => {
  test("week 1 is the week holding 4 January", () => {
    assert.deepEqual(isoWeek(d("2025-01-04")), { week: 1, year: 2025 });
  });

  test("early January can belong to the previous ISO year", () => {
    // 1 January 2021 was a Friday, so it fell in week 53 of 2020.
    assert.deepEqual(isoWeek(d("2021-01-01")), { week: 53, year: 2020 });
    assert.deepEqual(isoWeek(d("2022-01-01")), { week: 52, year: 2021 });
  });

  test("late December can belong to the next ISO year", () => {
    // 29 December 2025 is a Monday, starting week 1 of 2026.
    assert.deepEqual(isoWeek(d("2025-12-29")), { week: 1, year: 2026 });
  });

  test("a long ISO year has 53 weeks", () => {
    assert.deepEqual(isoWeek(d("2020-12-31")), { week: 53, year: 2020 });
    assert.deepEqual(isoWeek(d("2026-12-31")), { week: 53, year: 2026 });
  });

  test("the week number is stable across a week and steps at the Monday", () => {
    // 2025-09-15 is a Monday.
    const monday = d("2025-09-15");
    const first = isoWeek(monday);
    for (let i = 0; i < 7; i += 1) {
      assert.deepEqual(isoWeek(addDays(monday, i)), first, `day ${i} drifted`);
    }
    assert.equal(isoWeek(addDays(monday, 7)).week, first.week + 1);
    assert.equal(isoWeek(addDays(monday, -1)).week, first.week - 1);
  });

  test("every week number in a year is between 1 and 53", () => {
    let date = d("2020-01-01");
    for (let i = 0; i < 366 * 8; i += 1) {
      const { week } = isoWeek(date);
      assert.ok(week >= 1 && week <= 53, `${toInputValue(date)} gave week ${week}`);
      date = addDays(date, 1);
    }
  });
});

describe("dayOfWeek", () => {
  test("uses Intl's ordering, 0 = Sunday", () => {
    assert.equal(dayOfWeek(d("2025-09-21")), 0);
    assert.equal(dayOfWeek(d("2025-09-22")), 1);
    assert.equal(dayOfWeek(d("2025-09-27")), 6);
  });
});

describe("ageOn", () => {
  test("is the calendar difference plus a running total of days", () => {
    const age = ageOn(d("1990-05-15"), d("2025-09-21"));
    assert.equal(age.years, 35);
    assert.equal(age.months, 4);
    assert.equal(age.days, 6);
    assert.equal(age.totalDays, daysBetween(d("1990-05-15"), d("2025-09-21")));
  });

  test("the day before a birthday is still the previous age", () => {
    assert.equal(ageOn(d("1990-05-15"), d("2025-05-14")).years, 34);
    assert.equal(ageOn(d("1990-05-15"), d("2025-05-15")).years, 35);
  });

  test("a 29 February birthday ages on 28 February in a common year", () => {
    // The clamping rule puts the anniversary on the 28th rather than the 1st.
    assert.equal(ageOn(d("2000-02-29"), d("2025-02-28")).years, 25);
    assert.equal(ageOn(d("2000-02-29"), d("2024-02-29")).years, 24);
  });

  test("a future date does not produce negative total days", () => {
    assert.equal(ageOn(d("2030-01-01"), d("2025-01-01")).totalDays, 0);
  });
});

describe("nextBirthday", () => {
  test("is this year's when it has not passed", () => {
    assert.equal(toInputValue(nextBirthday(d("1990-12-25"), d("2025-09-21"))), "2025-12-25");
  });

  test("is next year's when it has", () => {
    assert.equal(toInputValue(nextBirthday(d("1990-05-15"), d("2025-09-21"))), "2026-05-15");
  });

  test("today's birthday is today, not a year away", () => {
    assert.equal(toInputValue(nextBirthday(d("1990-09-21"), d("2025-09-21"))), "2025-09-21");
  });
});

describe("numberToWords", () => {
  test("spells whole numbers", () => {
    assert.equal(numberToWords(0), "zero");
    assert.equal(numberToWords(7), "seven");
    assert.equal(numberToWords(19), "nineteen");
    assert.equal(numberToWords(42), "forty-two");
    assert.equal(numberToWords(100), "one hundred");
    assert.equal(numberToWords(101), "one hundred and one");
    assert.equal(numberToWords(1000), "one thousand");
    assert.equal(numberToWords(1005), "one thousand and five");
    assert.equal(numberToWords(1_000_000), "one million");
  });

  test("marks a negative number", () => {
    assert.equal(numberToWords(-42), "minus forty-two");
  });

  test("speaks the leading zero in the decimals", () => {
    // Regression: 12.05 and 12.5 must not read the same. The two decimal
    // places are read as written, so the zero has to be said.
    assert.equal(numberToWords(12.05), "twelve point zero five");
    assert.equal(numberToWords(12.5), "twelve point fifty");
    assert.notEqual(numberToWords(12.05), numberToWords(12.5));
    assert.equal(numberToWords(1000.01), "one thousand point zero one");
    assert.equal(numberToWords(0.07), "zero point zero seven");
  });

  test("no two different amounts spell the same", () => {
    const seen = new Map<string, number>();
    for (let cents = 0; cents < 100; cents += 1) {
      const value = 12 + cents / 100;
      const words = numberToWords(value);
      const clash = seen.get(words);
      assert.equal(clash, undefined, `${value} and ${clash} both spell "${words}"`);
      seen.set(words, value);
    }
  });

  test("returns nothing for a value that is not a number", () => {
    assert.equal(numberToWords(Number.NaN), "");
    assert.equal(numberToWords(Number.POSITIVE_INFINITY), "");
  });
});

describe("roman numerals", () => {
  test("known numerals", () => {
    assert.equal(toRoman(1), "I");
    assert.equal(toRoman(4), "IV");
    assert.equal(toRoman(9), "IX");
    assert.equal(toRoman(40), "XL");
    assert.equal(toRoman(1987), "MCMLXXXVII");
    assert.equal(toRoman(2025), "MMXXV");
    assert.equal(toRoman(3999), "MMMCMXCIX");
  });

  test("the standard form has no representation outside 1..3999", () => {
    assert.equal(toRoman(0), "");
    assert.equal(toRoman(-1), "");
    assert.equal(toRoman(4000), "");
  });

  test("every value in range round-trips", () => {
    for (let value = 1; value <= 3999; value += 1) {
      const numeral = toRoman(value);
      assert.equal(fromRoman(numeral), value, `${value} -> ${numeral} did not return`);
    }
  });

  test("rejects malformed numerals rather than guessing", () => {
    // IIII and IC both have an arithmetic reading, but neither is written.
    for (const input of ["IIII", "IC", "VV", "XM", "IL", "MMMM", "", "ABC", "X I"]) {
      assert.equal(fromRoman(input), null, `${input} should not parse`);
    }
  });

  test("accepts lowercase and surrounding space", () => {
    assert.equal(fromRoman(" mmxxv "), 2025);
    assert.equal(fromRoman("mcmlxxxvii"), 1987);
  });
});

describe("primes and factors", () => {
  test("isPrime knows the small cases", () => {
    assert.equal(isPrime(2), true);
    assert.equal(isPrime(3), true);
    assert.equal(isPrime(1), false);
    assert.equal(isPrime(0), false);
    assert.equal(isPrime(-7), false);
    assert.equal(isPrime(9), false);
    assert.equal(isPrime(2.5), false);
  });

  test("isPrime on a larger pair", () => {
    assert.equal(isPrime(7919), true);
    assert.equal(isPrime(7917), false);
    // A square of a prime is the case a naive loop misses.
    assert.equal(isPrime(9409), false);
  });

  test("the primes under 50 are exactly the known list", () => {
    const found = [];
    for (let n = 0; n <= 50; n += 1) if (isPrime(n)) found.push(n);
    assert.deepEqual(found, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);
  });

  test("primeFactors multiply back to the number", () => {
    for (const value of [12, 97, 360, 1024, 999_983, 123_456]) {
      const factors = primeFactors(value);
      assert.equal(
        factors.reduce((product, factor) => product * factor, 1),
        value,
        `factors of ${value} did not multiply back`,
      );
      for (const factor of factors) {
        assert.ok(isPrime(factor), `${factor} is not prime`);
      }
    }
  });

  test("primeFactors of the degenerate cases", () => {
    assert.deepEqual(primeFactors(0), []);
    assert.deepEqual(primeFactors(1), []);
    assert.deepEqual(primeFactors(-12), [2, 2, 3]);
  });

  test("divisorsOf is sorted, complete and free of duplicates", () => {
    assert.deepEqual(divisorsOf(36), [1, 2, 3, 4, 6, 9, 12, 18, 36]);
    assert.deepEqual(divisorsOf(1), [1]);
    assert.deepEqual(divisorsOf(0), []);
    // A perfect square must not list its root twice.
    assert.deepEqual(divisorsOf(49), [1, 7, 49]);

    for (const value of [1, 12, 49, 100, 360]) {
      const divisors = divisorsOf(value);
      assert.equal(new Set(divisors).size, divisors.length, "duplicate divisor");
      for (const divisor of divisors) assert.equal(value % divisor, 0);
      const brute = [];
      for (let i = 1; i <= value; i += 1) if (value % i === 0) brute.push(i);
      assert.deepEqual(divisors, brute, `divisors of ${value} disagree with brute force`);
    }
  });
});

describe("gcd and lcm", () => {
  test("known values", () => {
    assert.equal(gcd(12, 18), 6);
    assert.equal(gcd(17, 5), 1);
    assert.equal(lcm(4, 6), 12);
    assert.equal(lcm(21, 6), 42);
  });

  test("zero and negatives behave", () => {
    assert.equal(gcd(0, 5), 5);
    assert.equal(gcd(0, 0), 0);
    assert.equal(gcd(-12, 18), 6);
    assert.equal(lcm(0, 0), 0);
    assert.equal(lcm(0, 5), 0);
  });

  test("gcd times lcm is the product", () => {
    for (const [a, b] of [[12, 18], [7, 13], [100, 75], [9, 9]]) {
      assert.equal(gcd(a, b) * lcm(a, b), a * b, `failed for ${a}, ${b}`);
    }
  });
});

describe("simplifyFraction", () => {
  test("reduces to lowest terms", () => {
    assert.deepEqual(simplifyFraction(6, 8), { numerator: 3, denominator: 4, decimal: 0.75 });
    assert.deepEqual(simplifyFraction(5, 7), {
      numerator: 5,
      denominator: 7,
      decimal: 5 / 7,
    });
  });

  test("keeps the sign on the numerator", () => {
    assert.deepEqual(simplifyFraction(-1, -2), {
      numerator: 1,
      denominator: 2,
      decimal: 0.5,
    });
    assert.deepEqual(simplifyFraction(2, -4), {
      numerator: -1,
      denominator: 2,
      decimal: -0.5,
    });
  });

  test("a zero denominator has no answer", () => {
    assert.equal(simplifyFraction(1, 0), null);
  });

  test("the denominator is never negative", () => {
    for (const [n, dn] of [[1, -3], [-1, -3], [-4, -8], [4, -8]]) {
      const result = simplifyFraction(n, dn);
      assert.ok(result && result.denominator > 0, `${n}/${dn} kept a negative denominator`);
      near(result.numerator / result.denominator, n / dn, 1e-12);
    }
  });
});

describe("percentage", () => {
  test("answers the four questions", () => {
    near(percentage.of(15, 200), 30);
    near(percentage.share(30, 200), 15);
    near(percentage.change(200, 250), 25);
    near(percentage.change(200, 150), -25);
    near(percentage.apply(200, 10), 220);
    near(percentage.apply(200, -10), 180);
  });

  test("a zero base yields zero rather than infinity", () => {
    assert.equal(percentage.share(5, 0), 0);
    assert.equal(percentage.change(0, 5), 0);
  });

  test("applying a change reverses share", () => {
    near(percentage.of(percentage.share(30, 200), 200), 30);
  });
});

describe("savingsGoal", () => {
  test("a target already met needs no months", () => {
    const result = savingsGoal({ target: 1000, current: 1000, monthly: 100, annualRate: 5 });
    assert.equal(result.months, 0);
    assert.equal(result.reachable, true);
  });

  test("with no interest it is plain division", () => {
    const result = savingsGoal({ target: 1200, current: 0, monthly: 100, annualRate: 0 });
    assert.equal(result.months, 12);
    assert.equal(result.reachable, true);
    near(result.totalDeposited, 1200);
    near(result.interest, 0);
  });

  test("interest shortens the wait", () => {
    const plain = savingsGoal({ target: 50_000, current: 0, monthly: 500, annualRate: 0 });
    const earning = savingsGoal({ target: 50_000, current: 0, monthly: 500, annualRate: 8 });
    assert.ok(earning.months < plain.months, "interest should get there sooner");
    assert.ok(earning.interest > 0, "interest should be reported");
  });

  test("an unreachable target says so instead of returning a number", () => {
    const result = savingsGoal({ target: 1_000_000, current: 0, monthly: 0, annualRate: 0 });
    assert.equal(result.reachable, false);
  });

  test("stops at the 60-year limit rather than looping", () => {
    const result = savingsGoal({ target: 1e12, current: 0, monthly: 1, annualRate: 0 });
    assert.equal(result.reachable, false);
    assert.ok(result.months <= 720, `ran to ${result.months} months`);
  });
});

describe("depositForGoal", () => {
  test("with no interest it is the shortfall spread evenly", () => {
    near(depositForGoal({ target: 12_000, current: 0, months: 12, annualRate: 0 }), 1000);
    near(depositForGoal({ target: 12_000, current: 6000, months: 12, annualRate: 0 }), 500);
  });

  test("a target already covered needs nothing", () => {
    assert.equal(depositForGoal({ target: 1000, current: 2000, months: 12, annualRate: 5 }), 0);
  });

  test("the deposit it returns actually reaches the target", () => {
    // The reconciliation that matters: compounding the answer forward has to
    // land on the goal.
    for (const annualRate of [0, 3, 7.5, 12]) {
      const months = 60;
      const current = 5000;
      const target = 50_000;
      const monthly = depositForGoal({ target, current, months, annualRate });

      const rate = annualRate / 100 / 12;
      let balance = current;
      for (let i = 0; i < months; i += 1) balance = balance * (1 + rate) + monthly;

      near(balance, target, 0.01);
    }
  });

  test("no months left means paying the whole shortfall now", () => {
    assert.equal(depositForGoal({ target: 1000, current: 400, months: 0, annualRate: 5 }), 600);
  });
});

describe("debtPayoff", () => {
  test("a payment below the monthly interest never clears the debt", () => {
    // 20% on 10,000 is about 167 a month in interest alone.
    const result = debtPayoff({ balance: 10_000, annualRate: 20, payment: 150 });
    assert.equal(result.neverClears, true);
    assert.equal(result.schedule.length, 0);
  });

  test("a payment above it does clear the debt", () => {
    const result = debtPayoff({ balance: 10_000, annualRate: 20, payment: 300 });
    assert.equal(result.neverClears, false);
    assert.ok(result.months > 0 && result.months < 600);
    assert.equal(result.schedule.at(-1)?.balance, 0);
  });

  test("an interest-free debt is the balance divided by the payment", () => {
    const result = debtPayoff({ balance: 1200, annualRate: 0, payment: 100 });
    assert.equal(result.months, 12);
    near(result.totalInterest, 0);
    near(result.totalPaid, 1200);
  });

  test("the schedule reconciles with the totals", () => {
    const result = debtPayoff({ balance: 25_000, annualRate: 14.5, payment: 600 });
    const interest = result.schedule.reduce((sum, row) => sum + row.interest, 0);
    const principal = result.schedule.reduce((sum, row) => sum + row.principal, 0);
    const paid = result.schedule.reduce((sum, row) => sum + row.payment, 0);

    near(interest, result.totalInterest);
    near(principal, 25_000);
    near(paid, result.totalPaid);
    near(result.totalPaid, 25_000 + result.totalInterest);
    assert.equal(result.schedule.length, result.months);
  });

  test("the balance falls every month and the last payment is not an overpayment", () => {
    const result = debtPayoff({ balance: 25_000, annualRate: 14.5, payment: 600 });
    let previous = 25_000;
    for (const row of result.schedule) {
      assert.ok(row.balance < previous, `balance did not fall at month ${row.month}`);
      assert.ok(row.payment <= 600 + 1e-9, `month ${row.month} overpaid`);
      previous = row.balance;
    }
    assert.equal(previous, 0);
  });

  test("paying more clears it sooner and costs less", () => {
    const slow = debtPayoff({ balance: 25_000, annualRate: 14.5, payment: 400 });
    const fast = debtPayoff({ balance: 25_000, annualRate: 14.5, payment: 800 });
    assert.ok(fast.months < slow.months);
    assert.ok(fast.totalInterest < slow.totalInterest);
  });

  test("nothing owed needs no payments", () => {
    const result = debtPayoff({ balance: 0, annualRate: 20, payment: 0 });
    assert.equal(result.months, 0);
    assert.equal(result.neverClears, false);
  });
});
