/**
 * Pure money maths. Nothing here knows about countries, currencies or copy -
 * country rules live in the calculator definitions that call these.
 * Rates are always passed as percentages (12 means 12%), never fractions.
 */

const pct = (rate: number) => rate / 100;

/**
 * Future value of a monthly SIP, treated as an annuity due:
 * each instalment goes in at the start of the month, so it earns
 * one extra period of growth.
 */
export function sipFutureValue(
  monthly: number,
  annualRate: number,
  years: number,
): number {
  const n = Math.round(years * 12);
  if (n <= 0) return 0;
  const i = pct(annualRate) / 12;
  if (i === 0) return monthly * n;
  return monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
}

/** SIP where the instalment rises by a fixed percentage every year. */
export function stepUpSipFutureValue(
  monthly: number,
  annualRate: number,
  years: number,
  stepUpRate: number,
): number {
  const i = pct(annualRate) / 12;
  const totalMonths = Math.round(years * 12);
  let balance = 0;
  let instalment = monthly;

  for (let month = 1; month <= totalMonths; month += 1) {
    balance = (balance + instalment) * (1 + i);
    if (month % 12 === 0) instalment *= 1 + pct(stepUpRate);
  }
  return balance;
}

/** Total actually paid into a step-up SIP, needed to split invested vs returns. */
export function stepUpSipInvested(
  monthly: number,
  years: number,
  stepUpRate: number,
): number {
  const totalMonths = Math.round(years * 12);
  let invested = 0;
  let instalment = monthly;

  for (let month = 1; month <= totalMonths; month += 1) {
    invested += instalment;
    if (month % 12 === 0) instalment *= 1 + pct(stepUpRate);
  }
  return invested;
}

/** One-off investment compounded annually. */
export function lumpsumFutureValue(
  principal: number,
  annualRate: number,
  years: number,
): number {
  return principal * Math.pow(1 + pct(annualRate), years);
}

/** Compound interest with an explicit compounding frequency per year. */
export function compoundFutureValue(
  principal: number,
  annualRate: number,
  years: number,
  compoundsPerYear: number,
): number {
  if (compoundsPerYear <= 0) return principal;
  const i = pct(annualRate) / compoundsPerYear;
  return principal * Math.pow(1 + i, compoundsPerYear * years);
}

export function simpleInterest(
  principal: number,
  annualRate: number,
  years: number,
): number {
  return principal * pct(annualRate) * years;
}

/** Equated monthly instalment for a level-payment loan. */
export function emi(
  principal: number,
  annualRate: number,
  months: number,
): number {
  if (months <= 0) return 0;
  const i = pct(annualRate) / 12;
  if (i === 0) return principal / months;
  const growth = Math.pow(1 + i, months);
  return (principal * i * growth) / (growth - 1);
}

export type AmortisationYear = {
  year: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  balance: number;
};

/** Year-by-year amortisation, used for the loan breakdown table. */
export function amortisationSchedule(
  principal: number,
  annualRate: number,
  months: number,
): AmortisationYear[] {
  const payment = emi(principal, annualRate, months);
  const i = pct(annualRate) / 12;
  const schedule: AmortisationYear[] = [];

  let balance = principal;
  let year = 0;
  let principalPaid = 0;
  let interestPaid = 0;

  for (let month = 1; month <= months; month += 1) {
    const interest = balance * i;
    const towardsPrincipal = Math.min(payment - interest, balance);
    balance = Math.max(balance - towardsPrincipal, 0);
    principalPaid += towardsPrincipal;
    interestPaid += interest;

    if (month % 12 === 0 || month === months) {
      year += 1;
      schedule.push({
        year,
        principalPaid,
        interestPaid,
        totalPaid: principalPaid + interestPaid,
        balance,
      });
      principalPaid = 0;
      interestPaid = 0;
    }
  }
  return schedule;
}

/** Compound annual growth rate as a percentage. */
export function cagr(
  initial: number,
  final: number,
  years: number,
): number {
  if (initial <= 0 || years <= 0) return 0;
  return (Math.pow(final / initial, 1 / years) - 1) * 100;
}

/**
 * Recurring deposit maturity. Each instalment is deposited at the start of a
 * month and compounds at the deposit's frequency for the months it stays in.
 */
export function recurringDepositMaturity(
  monthly: number,
  annualRate: number,
  months: number,
  compoundsPerYear = 4,
): number {
  const i = pct(annualRate) / compoundsPerYear;
  const monthsPerPeriod = 12 / compoundsPerYear;
  let maturity = 0;

  for (let k = 1; k <= months; k += 1) {
    const monthsInvested = months - k + 1;
    maturity += monthly * Math.pow(1 + i, monthsInvested / monthsPerPeriod);
  }
  return maturity;
}

/** Systematic withdrawal: balance left after withdrawing a fixed amount monthly. */
export function swpFinalValue(
  principal: number,
  monthlyWithdrawal: number,
  annualRate: number,
  years: number,
): { finalValue: number; totalWithdrawn: number; monthsLasted: number } {
  const i = pct(annualRate) / 12;
  const totalMonths = Math.round(years * 12);
  let balance = principal;
  let totalWithdrawn = 0;
  let monthsLasted = 0;

  for (let month = 1; month <= totalMonths; month += 1) {
    if (balance <= 0) break;
    const withdrawal = Math.min(monthlyWithdrawal, balance);
    balance -= withdrawal;
    totalWithdrawn += withdrawal;
    balance *= 1 + i;
    monthsLasted = month;
  }
  return { finalValue: Math.max(balance, 0), totalWithdrawn, monthsLasted };
}

/** Value of `amount` after `years` of inflation, and what it buys in today's money. */
export function inflationAdjusted(
  amount: number,
  inflationRate: number,
  years: number,
): { futureCost: number; presentValue: number } {
  const factor = Math.pow(1 + pct(inflationRate), years);
  return { futureCost: amount * factor, presentValue: amount / factor };
}

/** Rounds to whole minor units so display and totals never disagree. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export type AmortisationMonth = {
  period: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
};

/** Month-by-month amortisation, for the monthly breakdown view. */
export function amortisationMonths(
  principal: number,
  annualRate: number,
  months: number,
): AmortisationMonth[] {
  const payment = emi(principal, annualRate, months);
  const i = pct(annualRate) / 12;
  const schedule: AmortisationMonth[] = [];

  let balance = principal;
  for (let month = 1; month <= months; month += 1) {
    const interest = balance * i;
    const towardsPrincipal = Math.min(payment - interest, balance);
    balance = Math.max(balance - towardsPrincipal, 0);
    schedule.push({
      period: month,
      payment,
      principalPaid: towardsPrincipal,
      interestPaid: interest,
      balance,
    });
  }
  return schedule;
}
