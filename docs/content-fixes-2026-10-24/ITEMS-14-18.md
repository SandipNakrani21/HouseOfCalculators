# Items 14–18: content improvements — 24 October 2026

## Scope / release status

Local implementation of the final five requested content groups, preserving
items 1–13 and existing support mailbox changes. No commit, push, deployment
or AdSense review request was made. This editorial work does not guarantee
AdSense approval or complete live browser QA.

Added copy covers the twelve public locales: en-US, en-GB, de-DE, fr-FR,
es-ES, pt-BR, ru-RU, tr-TR, ja-JP, zh-CN, it-IT, nl-NL. No claims of public
readiness/testing for Hindi, Gujarati, Marathi or Arabic; Polish is unconfigured.
English regional spelling and generated dictionaries were refreshed. Long
explanations remain server-only; short changed result notes update the client
copy. Arithmetic engines and accepted inputs are unchanged.

## 14 — Metric prefixes

`/{locale}/charts/math/metric-prefixes`

- Clarifies that the existing table is a selection from tera to pico, not all
  current SI prefixes. No table expansion or unsupported title promise.
- SI stays decimal even for data. Compares 1 kB = 1,000 B with 1 KiB = 1,024 B;
  explains distinct binary prefixes and case-sensitive m/M/k symbols.
- Corrected the old “data storage exception” explanation. Added official source
  panel and page source metadata.
- [NIST SI prefixes](https://www.nist.gov/pml/owm/metric-si-prefixes) and
  [NIST binary prefixes](https://pml.nist.gov/cuu/Units/binary.html).

## 15 — Six selected converter pairs

Added contextual copy only on the following pair routes, preserving existing
formulas, examples, precision notices and NIST/BIPM references:

- `/converters/volume/liters-to-us-gallons`
- `/converters/volume/us-gallons-to-liters`
- `/converters/data/gigabytes-to-megabytes`
- `/converters/data/megabytes-to-kilobytes`
- `/converters/fuel-economy/liters-per-100km-to-mpg-us`
- `/converters/fuel-economy/mpg-us-to-liters-per-100km`

Every route has its normal public-locale prefix. Volume distinguishes US liquid,
Imperial and dry gallons, with 10 L and two-US-gallon examples. Data distinguishes
bits/bytes and decimal/binary capacities, not transfer time. Fuel economy explains
positive-domain reciprocal conversion and US/UK gallon context: 5 L/100 km is
about 47.04 US mpg; 10 is about 23.52. Underlying factors were preserved.

## 16 — Business metrics

`/{locale}/calculators/business/{roi,roas,break-even}`

- ROI: 1,000 to 1,200 over two years, no interim flows = 20% total and about
  9.54% annualised; 800 returned = −20%. Explains undefined zero investment,
  timing assumptions and costs not automatically deducted.
- ROAS: 4,000 revenue / 1,000 spend = 4×, but after-ad contribution changes from
  +600 at 40% margin to −200 at 20%. Explains attribution, refunds, omitted costs,
  zero denominators and why this is not a spending recommendation.
- Break-even: 1,000 fixed / (20 price − 12 variable) = 125 units. Explains matched
  periods, cost classification, nonpositive contribution and stepped capacity /
  discount assumptions. Retains existing model-generated worked examples.
- New interpretation replaces the short existing explainer paragraphs for these
  pages, avoiding contradictory certainty about fees or campaign profitability.
  Corrected ROI/ROAS result notes too.
- Context sources: [SBA break-even](https://legacy.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs/break-even-point),
  [Investor.gov fees](https://www.investor.gov/introduction-investing/getting-started/understanding-fees).

## 17 — Construction estimates

`/{locale}/calculators/construction/{concrete,tile,roof-area}`

- Concrete: explicitly metric illustration 5 × 4 × 0.1 = 2 m³ measured, assumed
  10% allowance = 2.2 m³ ordered. Assumed supplier yield 0.02 m³/bag = 110 bags.
  Explains thickness conversion and fixed 1.54 model assumption, supplier yield,
  project-specific allowance and lack of structural/mix certification.
- Tile: 12 m² / 0.09 m², assumed 10%, rounded up = 147 tiles; eight per box gives
  19 boxes. Separates measured area, waste-adjusted count and packaging. Check
  joints, cuts, layout and actual coverage; no universal waste rate claimed.
- Roof: 10 × 8, no overhang, 6:12 pitch gives about 89.44 square units. Explains
  twice-overhang additions before slope, then separate product overlaps/cuts /
  complex geometry and purchase allowances. No structural safety claim.
- Removed rendered universal-sounding “standard/usual” and fixed waste advice
  from these pages by replacing their legacy explanatory prose with the explicit
  illustrations. Concrete/tile result notes now match. The 1.54 engine comment
  also calls it an illustrative assumption; no arithmetic changes.
- Metric examples are explicitly labelled as such even on US locale pages;
  interactive defaults still follow the configured country.

## 18 — Statistics / GPA

`/{locale}/calculators/math/statistics`

- Same dataset 2, 4, 6: mean 4; sum squared deviations 8. Population variance
  8/3 and deviation about 1.6330; sample variance 4 and deviation 2.
- Explicitly identifies the displayed variance row as population variance.
  Covers finite-input limits, single-observation sample deviation and zero
  variance for 5, 5, 5; no certainty about a larger population is inferred.
- [NIST sample-deviation definition](https://www.itl.nist.gov/div898/handbook/prc/section2/prc23.htm).

`/{locale}/calculators/education/gpa`

- Visible eleven-row grade/points table uses the same FOUR_POINT mapping as
  input options and computation; no duplicate hand-maintained scale.
- A/4.0 with four credits and B/3.0 with two gives 22/6 ≈ 3.67. Unused slots
  use zero credits. Explains repeats, pass/fail and institution weighting.
- Correctly states a fixed scale, not a country-scale selector, official
  transcript or admissions conversion. Retains model-generated worked examples.

## Separate existing numerical finding

While choosing a concrete teaching example, the existing engine returned
`2.2 / 0.011 = 200.00000000000003`; its whole-bag display then rounds up to
201 instead of the exact-ratio 200. This floating-point boundary was not
changed in this content-only batch. The published illustration uses yield
0.02 and a verified 110-bag result. This is a recorded, unresolved numerical
issue, not evidence that all construction arithmetic has passed.

**Follow-up:** the 24 October policy/code recheck subsequently fixed this
rounding boundary. See `../adsense-policy-recheck-2026-10-24/REPORT.md` for
current status and direct function evidence. The text above records the
historical state of the content-only batch.

## Validation

- First check caught a missing export for the shared grade mapping; fixed before
  final verification. Initial log is retained as diagnostic evidence.
- Final project checks: PASS (metadata, client dictionaries, ad inventory, lint,
  TypeScript and translation coverage). Only the three pre-existing warnings
  from archived docs helpers remain; zero errors. Changed-source lint: PASS.
- Production build: PASS (exit 0), all 4,067 pages generated.
  Build ID `6p3j94UkVg7oYrTFjGN-d`.
- Generated HTML inspection: **240/240 passed, zero failed**, comprising
  180 target pages and 60 nearby/regression pages across all 12 public locales.
  Checks include visible translated copy, source links, selected pair scope,
  removal of replaced legacy paragraphs, actual eleven-row GPA mapping and
  preserved earlier Retirement, Percentage, Body-fat and table improvements.
- `git diff --check`: PASS.
- Source evidence: all added keys present for 12 public locales, long explanatory
  keys excluded from client dictionaries, 11 grade entries and numerical examples
  compared with the actual engines. This is not an independent full-engine audit.
- No unit/component test files were added or run. Source/build inspection does
  not claim live browser interaction, responsive completion or native-speaker review.

Evidence: `items-14-18-check.log`, `items-14-18-check-final.log`,
`items-14-18-build.log`, `items-14-18-source-evidence.json`,
`items-14-18-generated-pages.json`.
