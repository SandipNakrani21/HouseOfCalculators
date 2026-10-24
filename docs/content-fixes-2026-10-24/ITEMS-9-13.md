# Items 9–13: content improvements — 24 October 2026

## Status and scope

Local implementation of the five groups requested in the screenshot. Earlier
items 1–8 and the support mailbox changes are preserved. No commit, push,
deployment or AdSense review request was made. Completion is not a guarantee
of approval. Items 14–18 remain outside this batch.

The changes cover the 12 public locales: en-US, en-GB, de-DE, fr-FR, es-ES,
pt-BR, ru-RU, tr-TR, ja-JP, zh-CN, it-IT, nl-NL. Their eleven language
dictionaries contain the added copy. Hindi, Gujarati, Marathi and Arabic
remain nonpublic; Polish is not configured. Generated fallback client modules
for nonpublic locales do not indicate public readiness or review acceptance.

## 09 — Percentage

Route: `/{locale}/tools/number-math/percentage`.

- All four modes have labelled examples: of (15% of 200 = 30), share
  (30 / 200 = 15%), change (100 to 125 = 25%), apply (200 less 10% = 180).
- Describes the denominator for each mode and undefined zero denominators.
- Explains 10% to 15% = five percentage points but 50% relative increase.
- Shows why +10% followed by -10% gives 99 from 100, not the starting value.
- Computation and input validation are unchanged.

## 10 — Number ↔ Words

Routes: `/{locale}/tools/number-math/{number-to-words,words-to-number}`.

- English-only scope is visible and associated with both input controls.
- Documents English short scale, absolute maximum 999,999,999,999.99,
  two-decimal numeric input/internal spelling rounding and supported parsing.
- Examples include accepted `one hundred and one` and
  `minus twelve point zero five`, versus rejected `one two`, `seventy dogs`,
  `douze` and `one point zero zero five`.
- Replaced the cheque-like page description; explicitly excludes currency names
  and bank-specific cheque wording. Numeric example input is formatted to
  match the two-decimal entry limit.
- The parser/spelling algorithms and accepted range were not expanded.

## 11 — Password generator

Route: `/{locale}/tools/utility/password-generator`.

- Explains 8–64 characters, always-available lowercase, optional sets and
  independent selection. Enabling a character type does not guarantee its
  presence in a generated password.
- Displays the actual alphabets, extracted into a single shared configuration
  consumed by both the existing generator and the static explanation. The
  combined pool has 70 distinct characters. Generation algorithm is unchanged.
- Explains length × log2(pool size) as a uniform-independent-draw estimate,
  not a cracking-time prediction or safety guarantee.
- Adds site-rule, reuse, phishing, storage and compromised-device limitations.
  Published examples must never be used as passwords; no usable password was
  generated or published during this work.
- Replaces the absolute “nothing sent anywhere/nothing stored” statement with
  a scoped description of Generate and the system clipboard used by Copy.

Source: [Web Crypto getRandomValues specification](https://www.w3.org/TR/WebCryptoAPI/#Crypto-method-getRandomValues).

## 12 — Date tools

Routes: `/{locale}/tools/date-time/{working-days,age,countdown}`.

- Working days: Monday–Friday, inclusive endpoints, manual count of eligible
  weekday holidays only, no assumed country/employer calendar. Five weekdays
  (2026-10-05 to 2026-10-09), minus one holiday = four; exclude weekend holidays
  and duplicates. Describes the zero floor.
- Age: leap-day example 2000-02-29 to 2025-02-28 = 25 full years under the
  existing end-of-month clamp. Explains UTC, rejects future birth dates and
  distinguishes the arithmetic convention from legal eligibility.
- Countdown: start of selected date at 00:00 UTC, with UTC+05:30 and UTC−07:00
  examples demonstrating local date differences. Describes elapsed-time mode
  after the target, and fixed 24-hour durations versus local daylight-saving days.
- These seven tool pages now use their own interpretation/limitations in place
  of unrelated category-wide limitation paragraphs. Date arithmetic and clock
  code were not changed.

## 13 — Conversion reference tables

Routes: `/{locale}/charts/conversion/{length-conversion-table,
area-conversion-table,volume-conversion-table,pressure-conversion-table}`.

- Added first-row lookup examples from each table's actual generated data and
  named column units, preserving the existing scrollable reference table.
- Explains magnitude-dependent 0/2/4 decimal formatting and warns against
  chaining rounded cells or treating rounded tiny values as exact measurements.
- Volume: distinguishes US liquid gallon (3.785411784 L), Imperial gallon
  (4.54609 L) and the US cup column. The first row is one litre, not one gallon.
- Corrected the pressure page's blanket assertion that all entries are gauge
  pressure. Conversion retains reference: 1 bar = 100 kPa under either reference.
  With explicitly assumed ambient pressure of 1 bar, 2 bar gauge = 3 bar absolute.
- Added NIST source panel and page source metadata only for these four tables.
  Conversion factors, table rows and precision logic were not changed.

Source: [NIST SP 811 conversion factors](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors).

## Validation

- Project checks: PASS (metadata, client dictionaries, inventory, lint,
  TypeScript and translation coverage). Three pre-existing warnings in archived
  docs helpers; zero errors.
- All new context keys exist in the 12 public locale translators. Long static
  explanations remain excluded from client dictionaries; only required short
  labels/descriptions/privacy text ship to the interactive controls.
- Initial generated-page inspection: 168/180 passed; twelve locale versions
  of Number-to-Words still displayed a four-decimal teaching input. Corrected
  that example to the documented two-decimal input limit and rebuilt. The
  final build also puts the seven tools’ own limitations in the limits section
  instead of the generic category paragraph. Initial findings are retained in
  `items-9-13-generated-pages-initial.json`.
- Final production build: PASS, all 4,067 pages generated. Build ID:
  `y0p8JDKNJFtX2i50_PdvY`.
- Final generated HTML inspection: **180/180 passed, zero failed** across
  12 public locales: 132 target pages and 48 nearby pages. The 12 previously
  failing Number-to-Words examples now match the two-decimal entry limit.
  Checks confirm translated context, example inputs/outputs, actual password
  alphabets, conversion lookup rows/sources and replacement of generic limits.
- Final changed-source lint and `git diff --check`: PASS.
- No unit/component test files were added or run. Teaching rows use the same
  engines as the tools, not an independent whole-engine correctness assessment.
- No live browser visual/interactive or native-speaker acceptance claimed.
  This batch used source and production artifacts; browser access was previously
  reported disabled. These results do not complete responsive visual QA.

Evidence: `items-9-13-check.log`, `items-9-13-build.log`,
`items-9-13-build-final.log`, `items-9-13-final-lint.log`,
`items-9-13-source-evidence.json`, `items-9-13-generated-pages.json`.
