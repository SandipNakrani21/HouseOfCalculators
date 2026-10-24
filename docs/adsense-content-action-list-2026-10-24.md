# AdSense content action list — 24 October 2026

**Implementation update:** items 01–03 have local fixes prepared at the owner's
request. See [implementation report](content-fixes-2026-10-24/REPORT.md) for the
changes, validation and deployment status. Items 04–08 now also have local
implementations: see [items 4–8 report](content-fixes-2026-10-24/ITEMS-4-8.md).
Items 09–13 also have local implementations: see the
[items 9–13 report](content-fixes-2026-10-24/ITEMS-9-13.md).
Items 14–18 now have local implementations: see the
[items 14–18 report](content-fixes-2026-10-24/ITEMS-14-18.md).
All 18 content work items are implemented locally and await deployment.
The separately recorded concrete rounding boundary was subsequently fixed
in the [policy/code recheck](adsense-policy-recheck-2026-10-24/REPORT.md).

Original review source: `4898de6`. The original review was editorial planning
only and did not change application code or account settings. The implementation
update above records subsequent authorized work; this is not a Google review.

## How to use this list

There are **18 proposed work items** below, grouping pages with related needs.
They are not 18 proven policy violations. The account screenshot identifies a
site-level **Low value content** rejection; Google did not identify the individual
URLs responsible. Priorities reflect the inspected content, not an inferred list
of Google-flagged URLs. No full live visual or native-language review was performed.

Example routes use `/en-us`. Shared changes should be adapted to the corresponding
existing published pages in the 12 public locales: en-US, en-GB, de-DE, fr-FR,
es-ES, pt-BR, ru-RU, tr-TR, ja-JP, zh-CN, it-IT and nl-NL. Do not create country
models or translations just to fill this list. Hindi, Gujarati, Marathi and Arabic
remain outside public scope; Polish is unconfigured.

**P1:** first editorial batch. **P2:** focused improvement after P1.
**C:** confirmed inconsistency. **E:** editorial improvement opportunity, not a
confirmed factual error or AdSense violation.

## P1 — factual clarity and substantive help

### 01 — About: update the verification claim [C]

**Page:** `/en-us/about` and corresponding public locale pages.

- **Present:** `legal.about.built.2` says automated checks cover known answers and
  boundary cases. The numerical/component test suite was removed in `4898de6` at
  the owner's request. Build, metadata, types and dictionary checks remain.
- **Change:** describe what is currently checked and distinguish historical test
  results from ongoing coverage. Do not imply the retired numerical suite still
  runs. State who maintains the site and how correction requests are handled,
  using verified details only.
- **Done when:** published verification wording matches the retained commands and
  review process; no invented expert or certification claims.
- **Source:** `src/lib/i18n/dictionaries/en.json`, key `legal.about.built.2`;
  `package.json`.

### 02 — Privacy/contact: qualify collection statements [C]

**Pages:** `/en-us/privacy`, `/en-us/contact`.

- **Present:** Privacy says no name or email exists/gets collected, while Contact
  invites email and error reports. The privacy page already describes Google
  advertising and hosting logs, so it should not be rewritten from scratch.
- **Change:** scope “no accounts/no web form” accurately; separately explain
  information voluntarily sent to the contact email and its actual use/retention.
  Qualify absolute third-party/data-sharing claims to match actual practices.
  Ask the operator for retention details rather than inventing a fixed period.
- **Done when:** privacy statements agree with the contact channel, Google
  processing disclosures and actual operator practice across public translations.
- **Source:** `legal.privacy.notCollected.*`, `legal.contact.reach.*`,
  `src/config/legal/definitions.ts`.

### 03 — Retirement: explain how to interpret the projection [E]

**Page:** `/en-us/calculators/finance/retirement`.

- **Present:** one explanatory paragraph plus engine-generated worked example;
  existing savings/contribution projection and inflation-adjusted result.
- **Add:** a short worked derivation separating existing balance growth from
  future contributions; explain deposit timing and nominal versus today's-money
  output. Compare one lower-return/higher-inflation scenario using the same model.
  Explain that the accumulated pot does not determine a safe retirement income,
  pension entitlement, future market return or personal retirement readiness.
- **Done when:** a reader can identify the assumptions and explain why the nominal
  and inflation-adjusted results differ. Preserve any existing limitations.
- **Source:** `src/config/calculators/definitions/retirement.ts`,
  `calc.retirement.explain` and `CalculatorPageBody.tsx`.

### 04 — Savings goal: teach the interest-bearing case [E]

**Page:** `/en-us/tools/planning/savings-goal`.

- **Present:** source link, fixed-rate explanation and two examples, both at **0%**.
- **Add:** a nonzero-rate case with current balance, monthly deposit, target and
  a month-by-month excerpt; compare the same inputs at 0%. Explain the last month,
  end/start-of-period convention actually implemented, and fees/inflation limits.
- **Done when:** manually cross-checked examples demonstrate the interest behavior,
  rather than only target divided by monthly deposit. Label examples as fixed.
- **Source:** `src/config/tools/examples.ts`, `src/lib/tools/planning.ts`.

### 05 — Debt payoff: show why a payment may not repay debt [E]

**Page:** `/en-us/tools/planning/debt-payoff`.

- **Present:** explanation mentions interest exceeding payment, but both teaching
  examples use **0%**.
- **Add:** one nonzero-rate worked month showing interest then principal reduction;
  compare two payment levels and show a non-amortizing case. Explain the last
  payment and why issuer daily-interest/fee calculations can differ.
- **Done when:** the examples cover both successful repayment and the existing
  “payment too small” guard without suggesting a credit-product recommendation.
- **Source:** `src/config/tools/examples.ts`, `tool.debt-payoff.explain`.

### 06 — Health: complete source and measurement context [E]

**Pages:** `/en-us/calculators/health/body-fat`,
`/en-us/calculators/health/bmr`, `/en-us/calculators/health/tdee`,
`/en-us/calculators/health/water-intake`.

- **Present:** shared worked examples/FAQs. BMR/TDEE/water already have source
  panels and population/model caveats. `healthReferences()` does not currently
  provide a body-fat source panel.
- **Change:** on body-fat, add a verified reference for the actual circumference
  equation and precise tape-measure protocol. Separate measured inputs from an
  estimated result and describe equation limitations. On BMR/TDEE/water add a
  brief guide to interpreting the existing assumptions; preserve their warnings.
  Do not present activity multipliers or fixed water allowances as measured needs.
- **Done when:** each added factual claim has an appropriate reference; no invented
  medical reviewer and no individualized prescription. Reuse existing references.
- **Source:** `src/config/calculators/provenance.ts:healthReferences`,
  `src/config/calculators/definitions/health.ts`.

### 07 — Country tax/salary: make the narrow scope easy to use [E]

**Representative pages:** `/en-us/countries/ca/income-tax`,
`/en-us/countries/fr/salary`, `/en-us/countries/de/payroll`,
`/en-us/countries/gb/stamp-duty`.

- **Present:** reviewed period, sources, detailed applicability restrictions and
  worked examples already exist. These should not be described as missing.
- **Change:** turn the dense scope paragraph into readable “Applies to / Does not
  include / How to read this result” points, preserving every material limit.
  Highlight Canada's federal-only scope, France's income/assessment-year
  distinction, payroll versus final liability, and England/Northern Ireland-only
  SDLT coverage on the respective pages. Show the relevant official next step.
- **Done when:** a reader can check applicability before input, and the output
  label cannot be mistaken for full national liability or an official assessment.
  Apply only the facts belonging to that country/model. Do not extend coverage.
- **Source:** `CalculatorPageBody.tsx`, `provenance.ts`, `reviewed/*` and
  `review.scope.*` translation keys.

### 08 — Financial guides: replace blanket advice with explained assumptions [E]

**Pages:** `/en-us/guides/practical/how-to-plan-monthly-savings`,
`/en-us/guides/what-is/what-is-compound-interest`,
`/en-us/guides/practical/how-to-compare-loan-offers`.

- **Present:** useful explanations, source links and existing notes. The savings
  guide says to assume no return for anything under about three years; this reads
  as a blanket recommendation rather than an explained conservative scenario.
- **Change:** label zero return as one planning assumption, distinguish cash
  savings from market investments, and explain uncertainty without personal
  advice. Qualify the compound-interest note's loose comparison of 10 versus 20
  years using an explicit same-rate/same-deposit numerical example. In loan
  comparison, clarify the jurisdiction/product dependence of APR and early-exit
  costs rather than treating one fee convention as universal.
- **Done when:** examples and sources support the exact claim made; dates change
  only after an actual review. No promises of returns or eligibility.
- **Source:** `guide.plan-savings.note.1`, `guide.what-compound.note.1`,
  `guide.what-compound.note.2`, `guide.compare-loans.note.1`, guide source registry.

## P2 — targeted page-specific teaching improvements

### 09 — Percentage: cover all four available modes [E]

**Page:** `/en-us/tools/number-math/percentage`.

- **Present:** four modes, while static examples show “of”, change, and applying a
  decrease; no corresponding static part/whole share example.
- **Add:** one clearly labelled formula/example for each mode; explain which value
  is the base and percentage points versus percentage change. Include undefined
  change from zero and the non-cancelling rise/fall example.
- **Done when:** each visible mode has matching teaching content and no duplicate
  generic definition padded around it.

### 10 — Number-to-words / Words-to-number: state language and cheque limits [E]

**Pages:** `/en-us/tools/number-math/number-to-words`,
`/en-us/tools/number-math/words-to-number` and their published locale variants.

- **Present:** English-only behavior is disclosed in a shared limits paragraph.
  Number-to-words description compares output with writing a cheque.
- **Change:** place English-only scope beside the input; explain supported scale,
  maximum magnitude and two-decimal behavior. Show accepted/rejected phrases and
  that generated number words do not implement each bank's currency/cheque format.
- **Done when:** localized interface does not suggest native-language spelling;
  actual supported input/output grammar is visible before use.
- **Source:** `NumberTools.tsx`, `MoreTools.tsx`, `src/lib/tools/numbers.ts`.

### 11 — Password generator: replace a generic utility limitation [E]

**Page:** `/en-us/tools/utility/password-generator`.

- **Present:** crypto-generator source, one teaching row and the shared random-tool
  limit. That limit explains independent draws, not password-specific use.
- **Add:** selected character-set behavior, length/character restrictions, a
  clearly illustrative example, and a brief explanation of why reuse/storage and
  phishing are outside this tool's protection. Verify any proposed entropy claim
  against the actual generation algorithm. Never publish a reusable “safe” password.
- **Done when:** page-specific constraints are clear without unsupported security
  guarantees. Local-generation/privacy claims match the actual code.

### 12 — Date tools: move operation-specific limits onto each page [E]

**Pages:** `/en-us/tools/date-time/working-days`,
`/en-us/tools/date-time/age`, `/en-us/tools/date-time/countdown`.

- **Present:** UTC/endpoints/holiday explanations and fixed examples already exist;
  a shared category limits paragraph repeats facts unrelated to some tools.
- **Add:** on working days, a weekday-holiday subtraction example and explanation
  of manual holiday input; on age, a leap-day case without implying a legal age
  determination; on countdown, show UTC midnight versus the user's local clock and
  what happens after the target. Do not add country holiday calendars by assumption.
- **Done when:** examples match implemented conventions and limitations are useful
  for that specific operation.

### 13 — Conversion reference tables: teach one lookup and cite definitions [E]

**Pages:** `/en-us/charts/conversion/length-conversion-table`,
`/en-us/charts/conversion/area-conversion-table`,
`/en-us/charts/conversion/volume-conversion-table`,
`/en-us/charts/conversion/pressure-conversion-table`.

- **Present:** generated table, short category explanation and related links. The
  chart template does not render a source panel. Example: pressure says the
  values are gauge pressures, although unit factors themselves are reference-
  independent and gauge/absolute depends on the supplied pressure's reference.
- **Change:** explain a row lookup and displayed precision, add an appropriate
  standards reference, show US/Imperial distinctions for volume, and clarify
  gauge/absolute pressure with a reference-consistent example. Preserve table
  usability; do not treat a short accurate lookup table as automatically low-value.
- **Done when:** reader can reproduce one conversion and understand its scope.
- **Source:** chart definitions, `chart.*.explain` and chart route template.

### 14 — Metric prefixes: complete decimal/binary context [E]

**Page:** `/en-us/charts/math/metric-prefixes`.

- **Present:** a brief decimal-prefix explanation noting binary prefixes.
- **Add:** a worked `kilo`/`kibi` comparison, case-sensitive symbols such as m/M,
  and a source for the exact prefix set shown. Check the table before promising
  that it includes every current SI prefix; do not silently broaden its title.
- **Done when:** decimal and binary units cannot be mistaken for interchangeable
  symbols and the documented scope agrees with rows.

### 15 — Converter pairs: write useful context for ambiguous units [E]

**Initial pages:** `/en-us/converters/volume/liters-to-us-gallons`,
`/en-us/converters/volume/us-gallons-to-liters`,
`/en-us/converters/data/gigabytes-to-megabytes`,
`/en-us/converters/data/megabytes-to-kilobytes`,
`/en-us/converters/fuel-economy/liters-per-100km-to-mpg-us`,
`/en-us/converters/fuel-economy/mpg-us-to-liters-per-100km`.
These are exact pair slugs from the current registry.

- **Present:** formulas, three examples, precision warning and NIST/BIPM links are
  already rendered. Some categories reuse the same magnitude examples and prose.
- **Change:** for volume, distinguish US/Imperial named units; for data distinguish
  bits/bytes and decimal/binary units; for fuel economy explain the reciprocal
  relation and US/UK gallon context with that pair's actual units. Select a
  practical interpretation per reviewed pair, not repeated keyword prose.
- **Done when:** the additional paragraph answers a genuine pair-specific question.
  Do not expand or rewrite all 61 pair pages automatically.
- **Source:** converter definitions, `src/config/converters/examples.ts`, pair page.

### 16 — Business metrics: interpret result boundaries [E]

**Pages:** `/en-us/calculators/business/roi`,
`/en-us/calculators/business/roas`, `/en-us/calculators/business/break-even`.

- **Present:** two explanatory paragraphs, FAQs and default worked examples.
- **Add:** ROI cashflows/timing limits; ROAS margin sensitivity including fees,
  returns and attribution assumptions; break-even fixed versus variable cost
  classification and a real-world scenario where the linear model no longer fits.
  Explain what to do with a negative/undefined result without recommending spend.
- **Done when:** one manually checked scenario per metric teaches interpretation
  beyond repeating the formula already shown.

### 17 — Construction estimates: qualify rule-of-thumb material quantities [E]

**Pages:** `/en-us/calculators/construction/concrete`,
`/en-us/calculators/construction/tile`,
`/en-us/calculators/construction/roof-area`.

- **Present:** concrete already says the 1.54 allowance is an ordering estimate,
  not a mix design; roof already excludes complex shapes; tile already describes
  rounding/waste. These are not missing disclaimers.
- **Change:** replace “standard”/“usual” universal-sounding allowances with
  appropriately sourced or explicitly illustrative assumptions. Show how to get
  actual supplier coverage/yield and distinguish measured area from purchase
  allowance. Explain the consequence of unit and geometry mistakes. Do not imply
  structural suitability or certify a concrete mix.
- **Done when:** model assumptions and the user's next measurement/supplier step
  are clear, without unsupported engineering guidance.

### 18 — Statistics/GPA: make the chosen convention explicit [E]

**Pages:** `/en-us/calculators/math/statistics`,
`/en-us/calculators/education/gpa`.

- **Present:** calculation explanations, FAQs and default worked examples.
- **Add:** statistics sample/population comparison using one same dataset and
  explicit finite-input/zero-variance limitations. GPA should show the actual
  grade-to-points table and explain that credits, repeats and pass/fail treatment
  can differ by institution; include one unequal-credit example.
- **Done when:** displayed convention is auditable from inputs to result. Do not
  describe the GPA result as universally valid for admissions or a transcript.

## Pages not proposed for a blanket rewrite

- Mortgage/personal/auto/student loan pages already publish worked examples and
  model-generated comparison tables; assess actual feedback before adding more.
- Math reference tables such as multiplication, primes and percentage-fraction
  already have substantive reading guidance and examples in the current dictionary.
- Converter pair formulas/examples/source links and tax-page source scopes already
  exist. Adding the same blocks again would create repetition, not useful value.
- The home/category/country directories are navigation pages; the manual ad
  allowlist excludes these. They need usable discovery, not forced long articles.
- Do not delete useful tools or create additional articles solely to increase an
  arbitrary page or word count. No universal minimum word count is used here.

## Suggested order and acceptance

1. Correct 01–02, then develop 03–08 with actual model/source review.
2. Review 09–18 in small batches; implement only additions that solve a specific
   user question. Have financial/health claims independently reviewed where needed;
   record real review provenance rather than invented names or fresh dates.
3. Adapt accepted changes to each affected public locale; verify terminology,
   country context and numeric examples. Translation completeness is not native
   semantic certification.
4. Check published pages, links and actual calculator behavior; retain an honest
   changelog. The retired unit tests do not count as current ongoing validation.
5. Consider an AdSense re-review only after the selected work is deployed and
   verified. Completion of this list does not guarantee approval.

Policy basis: [Google inventory-value policy](https://support.google.com/publisherpolicies/answer/11112688)
requires useful publisher content; [Google's helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
offers quality questions and explicitly rejects a preferred word-count approach.
The latter is Search guidance used as an editorial aid, not a separate AdSense
approval checklist.
