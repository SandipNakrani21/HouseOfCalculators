import type { Formatter } from "@/lib/format";
import type { TranslateFn } from "@/lib/i18n/core";
import { addDays, addMonths, ageOn, daysBetween, isoWeek, parseDate, toInputValue, workingDaysBetween } from "@/lib/tools/dates";
import { divisorsOf, fromRoman, gcd, isPrime, lcm, numberToWords, percentage, primeFactors, simplifyFraction, toRoman, wordsToNumber } from "@/lib/tools/numbers";
import { debtPayoff, savingsGoal } from "@/lib/tools/planning";

export type ToolExample = { input: string; output: string };
/** Fixed teaching examples. Random examples describe possible outcomes, not a promised draw. */
export function toolExamples(slug: string, t: TranslateFn, fmt: Formatter): ToolExample[] {
  const n = (value: number | bigint) => fmt.number(value, { decimals: typeof value === "bigint" || Number.isInteger(value) ? 0 : 4 });
  const date = (value: string) => parseDate(value)!;
  const row = (input: string, output: string | number): ToolExample => ({ input, output: typeof output === "number" ? n(output) : output });
  switch (slug) {
    case "date-difference": return [row("2024-02-28 → 2024-03-01", daysBetween(date("2024-02-28"), date("2024-03-01"))), row("2025-02-28 → 2025-03-01", daysBetween(date("2025-02-28"), date("2025-03-01")))];
    case "add-days": return [row("2025-01-31 + 1 × " + t("units.months"), toInputValue(addMonths(date("2025-01-31"), 1))), row("2024-02-28 + 2 × " + t("tool.result.totalDays"), toInputValue(addDays(date("2024-02-28"), 2)))];
    case "working-days": return [row("2026-10-05 → 2026-10-09; " + t("tool.field.holidays") + " = 1", Math.max(workingDaysBetween(date("2026-10-05"), date("2026-10-09")) - 1, 0)), row("2026-10-05 → 2026-10-09; " + t("tool.field.holidays") + " = 0", workingDaysBetween(date("2026-10-05"), date("2026-10-09"))), row("2026-10-10 → 2026-10-11", workingDaysBetween(date("2026-10-10"), date("2026-10-11")))];
    case "age": return [row("2000-02-29 → 2025-02-28", n(ageOn(date("2000-02-29"), date("2025-02-28")).years) + " × " + t("units.years")), row("2000-06-15 → 2026-06-14", n(ageOn(date("2000-06-15"), date("2026-06-14")).years) + " × " + t("units.years")), row("2000-06-15 → 2026-06-15", n(ageOn(date("2000-06-15"), date("2026-06-15")).years) + " × " + t("units.years"))];
    case "week-number": return ["2021-01-01", "2021-01-04"].map(value => { const answer = isoWeek(date(value)); return row(value, t("tool.result.weekValue", answer)); });
    case "day-of-week": return ["2026-10-10", "2026-10-12"].map(value => row(value, new Intl.DateTimeFormat(fmt.locale, { weekday: "long", timeZone: "UTC" }).format(date(value))));
    case "countdown": return [row("2026-10-09T12:00:00Z → 2026-10-10T00:00:00Z", "12 × " + t("unit.time.hour.plural")), row("2026-10-10T00:00:00Z → 2026-10-10T00:00:00Z", "0")];
    case "percentage": return [row(`${t("tool.pct.mode.of")}: 15% × 200`, percentage.of(15, 200)), row(`${t("tool.pct.mode.share")}: 30 / 200 × 100`, fmt.percent(percentage.share(30, 200))), row(`${t("tool.pct.mode.change")}: (125 − 100) / 100 × 100`, fmt.percent(percentage.change(100, 125))), row(`${t("tool.pct.mode.apply")}: 200 × (1 − 10 / 100)`, percentage.apply(200, -10)), row("0 → 100; 30 / 0", t("validation.zeroDenominator")), row("100 × 1.10 × 0.90", percentage.apply(percentage.apply(100, 10), -10))];
    case "number-to-words": return [12.05, 101].map(value => row(fmt.number(value, { decimals: Number.isInteger(value) ? 0 : 2 }), numberToWords(value)));
    case "words-to-number": return ["one hundred and one", "minus twelve point zero five", "one two", "seventy dogs", "douze", "one point zero zero five"].map(value => { const answer = wordsToNumber(value); return row(value, answer === null ? t("tool.result.wordsUnreadable") : answer); });
    case "roman-numerals": return [row("1994", toRoman(1994)), row("IX", fromRoman("IX")!), row("IC", t("tool.result.invalidNumeral"))];
    case "prime-checker": return [row("97", t(isPrime(97) ? "common.yes" : "common.no")), row("84", primeFactors(84).map(n).join(" × "))];
    case "fraction-simplifier": return [[18, 24], [-6, -8]].map(([a, b]) => { const answer = simplifyFraction(a, b)!; return row(`${a}/${b}`, `${answer.numerator}/${answer.denominator} = ${n(answer.decimal)}`); });
    case "factor-finder": return [row("36", divisorsOf(36).map(n).join(", ")), row("18, 24", `${t("tool.result.gcd")} = ${n(gcd(18, 24))}; ${t("tool.result.lcm")} = ${n(lcm(18, 24))}`)];
    case "number-formatter": return [1234567.89, -1200.5].map(value => row(String(value), n(value)));
    case "savings-goal": return [0, 6].map(annualRate => { const answer = savingsGoal({ target: 6000, current: 1000, monthly: 200, annualRate }); return row(`${t("tool.field.target")} = ${fmt.currency(6000)}; ${t("tool.field.currentSavings")} = ${fmt.currency(1000)}; ${t("tool.field.monthlyDeposit")} = ${fmt.currency(200)}; ${t("tool.field.interestRate")} = ${fmt.percent(annualRate)}`, `${n(answer.months)} × ${t("units.months")}; ${t("tool.result.totalDeposited")} = ${fmt.currency(answer.totalDeposited)}; ${t("tool.result.interestEarned")} = ${fmt.currency(answer.interest)}; ${t("table.balance")} = ${fmt.currency(1000 + answer.totalDeposited + answer.interest)}`); });
    case "debt-payoff": return [[0, 100], [12, 100], [12, 200]].map(([annualRate, payment]) => { const answer = debtPayoff({ balance: 1200, annualRate, payment }); return row(`${t("tool.field.balance")} = ${fmt.currency(1200)}; ${t("tool.field.monthlyPayment")} = ${fmt.currency(payment)}; ${t("tool.field.interestRate")} = ${fmt.percent(annualRate)}`, `${n(answer.months)} × ${t("units.months")}; ${t("tool.result.totalInterest")} = ${fmt.currency(answer.totalInterest)}; ${t("tool.result.totalPaid")} = ${fmt.currency(answer.totalPaid)}`); });
    case "budget-planner": return [row(`${fmt.currency(3000)} × 50% / 30% / 20%`, [1500, 900, 600].map(value => fmt.currency(value)).join(" / ")), row(`${fmt.currency(3000)} × 60% / 20% / 20%`, [1800, 600, 600].map(value => fmt.currency(value)).join(" / "))];
    case "random-number": return [row("1 … 6", "{1, 2, 3, 4, 5, 6}; P = 1/6"), row("10 … 10", "10; P = 1")];
    case "password-generator": return [row(`${t("tool.field.length")} = 16; ${t("tool.field.digits")}`, t("quality.passwordExample"))];
    case "dice-roller": return [row("1 × d6", "1 … 6; P(6) = 1/6"), row("2 × d6", "2 … 12; P(7) = 6/36; P(12) = 1/36")];
    case "coin-flip": return [row("1", "P = 1/2"), row("2", "P = 1/4, 1/2, 1/4")];
    case "random-picker": return [row("A, B, C → 1", "{A, B, C}; P = 1/3"), row("11 → 3", "4 / 4 / 3")];
    default: throw new Error(`Missing teaching examples: ${slug}`);
  }
}

export function toolSources(category: string, slug: string): { name: string; href: string }[] {
  if (category === "date-time") return [{ name: "MDN — Date / UTC", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date" }];
  if (category === "utility") return [{ name: "MDN — Crypto.getRandomValues", href: "https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues" }];
  if (slug === "number-formatter") return [{ name: "MDN — Intl.NumberFormat", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat" }];
  if (slug === "savings-goal") return [{ name: "Investor.gov — Compound interest", href: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" }];
  if (slug === "debt-payoff") return [{ name: "CFPB — Amortization", href: "https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-771/" }];
  return [];
}
