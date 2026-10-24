# Items 4–8: content improvements — 24 October 2026

## Scope and release status

Local implementation of the five groups requested in the screenshot. This
continues the separately documented items 1–3 and preserves the support mailbox
change. No arithmetic engine, eligibility rule, country publication gate or
calculator coverage was expanded. No commit, push, deployment or AdSense review
request was made. These changes do not guarantee AdSense approval.

Public locales: en-US, en-GB, de-DE, fr-FR, es-ES, pt-BR, ru-RU, tr-TR, ja-JP,
zh-CN, it-IT, nl-NL. Copy exists in their eleven language dictionaries; English
regional spelling and generated client dictionaries were refreshed. Configured
nonpublic Hindi/Gujarati/Marathi/Arabic and unconfigured Polish are not claimed
as reviewed or passing. Shared generated fallback modules are build outputs,
not evidence of public readiness.

## Changes

### 04 — Savings goal

Route pattern: `/{locale}/tools/planning/savings-goal`.

- Same target 6,000, current balance 1,000 and end-of-month deposit 200 at 0%
  and 6% annually, with annual rate / 12 compounding.
- Shows duration, deposited amount, earned interest and ending balance, plus
  the first two monthly steps at 6%: 1,205 and 1,411.025 before display rounding.
- Clarifies that the final deposit remains a full deposit and may overshoot;
  excludes fees, taxes and inflation; return is assumed, not guaranteed.
- At 0%: 25 months / 5,000 deposited / 0 interest. At 6%: 24 months / 4,800
  deposited / approximately 413.55 interest / 6,213.55 ending balance.

### 05 — Debt payoff

Route pattern: `/{locale}/tools/planning/debt-payoff`.

- Retains a zero-rate baseline and adds 12% annual interest at payments 100
  and 200, with total interest and total paid.
- Static excerpt for 1,200 debt / 100 payment: month one = 12 interest + 88
  principal, balance 1,112; month two = 11.12 + 88.88, balance 1,023.12.
  The final smaller payment is generated from the same schedule.
- 100 payment: 13 months / about 84.78 interest. 200 payment: seven months /
  about 43.86 interest. Assumes monthly interest, no fees or additional borrowing;
  this is not a replication of an issuer's daily-interest statement.
- Explains equal-to-interest payment (12) leaves principal unchanged, while
  payment 10 increases the first balance by 2. Corrected the interactive
  explanation to include equality, without hard-coding example amounts there.

### 06 — Body-fat / BMR / TDEE / Water

Route pattern: `/{locale}/calculators/health/{body-fat,bmr,tdee,water-intake}`.

- Body-fat now displays the actual centimetre density equations and
  `495 / density - 450` conversion, with defined measurement symbols.
- Added source panel and tape protocol: measurement sites, centimetres even
  with imperial height, relaxed posture, normal exhalation, tape placement and
  repeatable positions. Removed the guaranteed-sounding individual 3–4 point
  accuracy and trend assertions. No medical reviewer was invented.
- Coefficients were compared with Zhang et al. (2001), Table 1, a primary
  modelling paper hosted by UC Berkeley, and historical military context.
  Original 1984 DTIC report URLs could not be retrieved in this environment;
  this report does not claim a direct re-reading of those original reports.
  The National Academies table uses rounded coefficients and contains a
  different female neck sign; it was not used to replace the implemented
  equation. The exact coefficients and minus-neck expression are reproduced
  in the UC Berkeley paper. Arithmetic code was unchanged.
- BMR explains resting expenditure is not a food-intake target. TDEE no longer
  presents maintenance intake as measured/certain or recommends automatically
  picking a lower activity level. Water's displayed amount is an illustrative
  rule, not a personal drinking quota. Existing adult/pregnancy/medical scope,
  fixed-calorie-change guards and water-exercise assumptions remain.

References checked:

- [Zhang et al., Table 1](https://escholarship.org/uc/item/9451r851)
- [National Academies military equations and measurement definitions](https://www.nationalacademies.org/read/6104/chapter/12)
- [USMC measurement-site reference](https://dacowits.defense.gov/Portals/48/Documents/Reports/2015/Documents/USMC%20W3.pdf)

### 07 — Country tax / salary scope readability

All reviewed rule pages using CalculatorPageBody now render their full,
translated applicability scope as sentence/semicolon bullets beside the inputs
and in the source panel. The latter has an explicit limitations heading.
No exclusions were summarized away or automatically reclassified as coverage.
Tax periods, official source links, result labels and supported-country gates
remain intact. This is a shared presentation improvement, not a new statutory
review or a rewrite of every country's rules.

Representative paths for artifact inspection in each public locale:

- `/countries/ca/income-tax`: federal-only and outside-Quebec scope.
- `/countries/fr/salary`: income year versus assessment year; annualized result.
- `/countries/de/payroll`: model-specific payroll limits and exclusions.
- `/countries/gb/stamp-duty`: England/Northern Ireland and declared eligibility.

### 08 — Financial guides

Three routes in every public locale:

- `/guides/what-is/what-is-compound-interest`: 1,000 at constant 6%, yearly
  compounding, no further deposits/costs/taxes gives about 1,790.85 at ten years
  and 3,207.14 at twenty; corrected the loose doubling assertion. Real-return
  example uses `(1.06 / 1.03 - 1) * 100`, approximately 2.91%.
- `/guides/practical/how-to-compare-loan-offers`: APR fee conventions depend on
  product/jurisdiction; compare like amount/term and separate early-exit costs.
- `/guides/practical/how-to-plan-monthly-savings`: zero return is a scenario,
  not universal advice; explicit 6,000 / 500 monthly / 12-month example,
  uncertainty, liquidity, costs and volatile-asset risk. Added Investor.gov's
  time-horizon/risk source.

Only these three guide review dates changed to 2026-10-24. Their original
2026-09-21 publication dates are preserved.

References:

- [Investor.gov compound-interest calculator](https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator)
- [Investor.gov risk and time horizon](https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/gauge-your-risk-tolerance)
- [CFPB interest rate versus APR](https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/)

## Validation

- Project checks: PASS (metadata, generated client dictionaries, inventory,
  lint, TypeScript and translation coverage). Three pre-existing warnings in
  archived docs helper files; zero errors.
- Newly referenced copy keys: present in all 12 public locale translators.
- Production build: PASS, all 4,067 pages generated. Build ID:
  `SzEi1bCybKrt5H-rkXZDH`.
- Generated HTML: **1,080 inspected / 1,080 passed / 0 failed** across the
  12 public locales: 108 tool/health/guide pages plus 972 published canonical
  country-rule pages. Confirms updated visible copy, body-fat formula/source,
  guide review/publication dates, readable scope markup, official links and
  complete preservation of translated scope text in both panels.
- Changed-source lint: PASS with no warnings. `git diff --check`: PASS.
- No unit/component test files were added or run. Fixed examples use the same
  engines as the tools; this is not independent whole-engine certification.
- No live browser visual/interactive check or native-speaker acceptance claimed.
  Browser access was previously reported disabled; this content task used source
  and production artifacts only.

Evidence: `items-4-8-check.log`, `items-4-8-build.log`,
`items-4-8-source-evidence.json` and `items-4-8-generated-pages.json`.
