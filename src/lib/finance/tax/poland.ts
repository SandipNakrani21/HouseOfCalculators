/** Ordinary 2026 full-year employment, twelve near-equal monthly wage payments. */
export function polishEmployeeContributions(annual: number) {
  const cents = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
  const totalCents = Math.round(Math.max(annual, 0) * 100);
  const monthlyCents = Math.floor(totalCents / 12);
  let remainingPensionBase = 282_600;
  let pension = 0, disability = 0, sickness = 0, health = 0;
  for (let month = 0; month < 12; month++) {
    // Allocate at most one extra grosz to the first remainder months.
    const wage = (monthlyCents + (month < totalCents % 12 ? 1 : 0)) / 100;
    const capped = Math.min(wage, remainingPensionBase);
    remainingPensionBase = cents(Math.max(remainingPensionBase - capped, 0));
    const p = cents(capped * 0.0976);
    const d = cents(capped * 0.015);
    const s = cents(wage * 0.0245);
    pension += p;
    disability += d;
    sickness += s;
    health += cents((wage - p - d - s) * 0.09);
  }
  const social = cents(pension + disability + sickness);
  return { social, health: cents(health), pension: cents(pension), disability: cents(disability), sickness: cents(sickness) };
}

/** Local marginal percentage before monthly/annual monetary rounding steps. */
export function polishEmploymentMarginalRate(gross: number) {
  const socialRate = gross < 282_600 ? 0.1371 : 0.0245;
  const taxable = gross - polishEmployeeContributions(gross).social - 3_000;
  const pitRate = taxable >= 120_000 ? 0.32 : taxable > 30_000 ? 0.12 : 0;
  return 100 * (socialRate + (0.09 + pitRate) * (1 - socialRate));
}
