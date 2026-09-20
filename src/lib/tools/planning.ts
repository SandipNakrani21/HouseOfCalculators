/** Planning tools: reaching a savings target, and clearing a debt. */

/**
 * How long a target takes at a given monthly deposit, and what deposit would
 * reach it by a chosen date. Interest compounds monthly.
 */
export function savingsGoal({
  target,
  current,
  monthly,
  annualRate,
}: {
  target: number;
  current: number;
  monthly: number;
  annualRate: number;
}): { months: number; reachable: boolean; totalDeposited: number; interest: number } {
  const rate = annualRate / 100 / 12;
  let balance = current;
  let deposited = 0;
  let months = 0;

  // 60 years is well past the point where the answer is useful; beyond it the
  // honest answer is "not at this rate" rather than a number.
  const LIMIT = 720;

  while (balance < target && months < LIMIT) {
    balance = balance * (1 + rate) + monthly;
    deposited += monthly;
    months += 1;
    if (monthly <= 0 && rate <= 0) break;
  }

  const reachable = balance >= target;
  return {
    months,
    reachable,
    totalDeposited: deposited,
    interest: Math.max(balance - current - deposited, 0),
  };
}

/** Monthly deposit needed to hit a target in a fixed number of months. */
export function depositForGoal({
  target,
  current,
  months,
  annualRate,
}: {
  target: number;
  current: number;
  months: number;
  annualRate: number;
}): number {
  if (months <= 0) return Math.max(target - current, 0);

  const rate = annualRate / 100 / 12;
  const grown = current * Math.pow(1 + rate, months);
  const shortfall = target - grown;
  if (shortfall <= 0) return 0;

  if (rate === 0) return shortfall / months;
  // Future value of an ordinary annuity, rearranged for the payment.
  return (shortfall * rate) / (Math.pow(1 + rate, months) - 1);
}

export type PayoffResult = {
  months: number;
  totalInterest: number;
  totalPaid: number;
  /** True when the payment does not even cover the monthly interest. */
  neverClears: boolean;
  schedule: {
    month: number;
    payment: number;
    interest: number;
    principal: number;
    balance: number;
  }[];
};

/**
 * Pays a fixed amount against a balance each month.
 *
 * A payment below the monthly interest never clears the debt, and saying so is
 * more useful than returning a number that quietly assumes it does.
 */
export function debtPayoff({
  balance,
  annualRate,
  payment,
}: {
  balance: number;
  annualRate: number;
  payment: number;
}): PayoffResult {
  const rate = annualRate / 100 / 12;
  const firstInterest = balance * rate;

  if (payment <= firstInterest && balance > 0) {
    return {
      months: 0,
      totalInterest: 0,
      totalPaid: 0,
      neverClears: true,
      schedule: [],
    };
  }

  const schedule: PayoffResult["schedule"] = [];
  let remaining = balance;
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  while (remaining > 0 && month < 600) {
    month += 1;
    const interest = remaining * rate;
    const due = Math.min(payment, remaining + interest);
    const principal = due - interest;
    remaining = Math.max(remaining - principal, 0);
    totalInterest += interest;
    totalPaid += due;
    schedule.push({ month, payment: due, interest, principal, balance: remaining });
  }

  return {
    months: month,
    totalInterest,
    totalPaid,
    neverClears: false,
    schedule,
  };
}
