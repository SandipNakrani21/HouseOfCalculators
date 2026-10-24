# Focused content review and coverage ledger

**Continuation update:** see `CONTENT-CONTINUATION.md` for the later corrections and current coverage. The 331/2675 table below is the earlier checkpoint, not the current ledger. Full project check now passes; the earlier lint failures below are historical.

25 October 2026 (Asia/Calcutta). **Partially complete. This is not a completed all-page/all-locale content audit.**

The existing 3654-URL inventory was reused without a new crawl. The local Loan/Poland changes in the two route files, CalculatorPageBody and calculator-search-copy.ts were preserved. No calculator arithmetic, national tax rule, URL, locale availability or publication gate was changed. No publication date or ranking gain is claimed.

## Coverage: precisely what was read

1. Loan and Poland first: prior page-filtered GSC findings, prepared metadata/intro overrides, Loan definition/formula/FAQ/schedule, Poland 2026 provenance/scope and shared page rendering. Only Loan and Poland have proven page-query joins in the supplied data. The generic query exports were not assigned to other pages.
2. Remaining priority sources: English multiplication-table definition (1–12, example 6×8=48, no unsupported print/download promise); weight converter supported units and mass clarification; Italian US salary and Italy income-tax scope; Italian words-to-number English-only short-scale limit; Brazil salary alias scope; second-batch US/Canada/Russia salary scope, Italian Netherlands salary scope and Italian length converter wording; English Date Difference inputs and endpoint conventions.
3. Shared English source pass: all 23 tool base title/intro/explanation strings and their explicit context strings; all 13 converter base title/intro/explanation strings and unit labels; all 19 chart base title/intro/explanation strings; all 12 guide base prose, FAQ, displayed formulas/variables and fixed worked examples. These are substantive source reads, not automated missing-field checks. They do **not** certify every localized page, pair-specific text, generated result, external claim or table cell.
4. Italian review was limited to the priority wording listed above and the income-tax deductions FAQ. No claim is made that the full Italian dictionary or other translations passed. English regional generation was refreshed and its changed overrides inspected.

The country scope review checked that existing wording corresponds to the selected source model and its stated period/exclusions. It was not a new national-tax-rules audit and did not renew those models' source-review dates. Older source links or inactive generic notes are not silently treated as current-law verification.

## Confirmed corrections

| Source/content group | Issue and correction | Affected public wording |
|---|---|---|
| Loan | Shared base intro still promised “any loan”; narrow to equal-monthly-payment fixed-rate loans without fees. Preserve the more specific existing en-US override. | en-us/en-gb Loan routes and shared listings |
| Loan FAQ / loan-payment guide | Overpayments described as automatically going straight to principal. Make allocation conditional, advise checking repayment charges, and state scheduled-payment-only model. | English Loan FAQ and English loan-payment guide; guide source links shared by all public locales |
| Income-tax FAQ | Universal exclusion of credits/local taxes contradicts country scopes that include them. Refer to the actual selected country's enumerated scope. | English and Italian income-tax pages; exact inventory routes in CONTENT-COVERAGE.json |
| Date Difference | Explain UTC elapsed days versus inclusive Monday–Friday count and lack of holiday subtraction. Same Monday = 0 elapsed days, 1 weekday. | en-us/en-gb Date Difference |
| Savings Goal | State month-end deposit timing, constant entered rate and fee/tax/inflation exclusions. | en-us/en-gb Savings Goal |
| Length conversion table | False “last decimal shown” agreement with converter removed; table and converter use different displayed precision. | en-us/en-gb length conversion table |
| Pressure converter | Make clear unit conversion retains gauge/absolute reference and does not add atmospheric pressure. | English category and pressure-pair routes |
| Marginal-rate guide | Remove “one unit more never leaves you worse off” absolute and distinguish ordinary bands from benefit/credit/allowance changes. | English guide |
| Comparing loan offers | Qualify shorter-term interest comparison by same principal/positive fixed rate; prevent adding financed fees twice; distinguish variable/balloon/settlement cases. | English guide |
| Amortisation guide | Early payments are not necessarily majority interest; depends on rate/term. Remove unspecific “24 years of interest” saving claim. | English guide |
| Reading schedules | Interest column is scheduled interest rather than all borrowing costs. Replace unverified “typical rates” with an explicit independently checked 200000/6%/25-year example. | English guide |
| Compound-interest overview | Remove unsupported fixed monthly credit-card billing generalization; qualify compound/simple comparison by equivalent positive rate and term. | English guide |
| VAT guide | Replace worldwide goods/seller generalization with jurisdiction-specific scope and supported UK reduced/zero/exempt examples. | English guide |
| Future-value guide | State beginning-period deposits, constant rate, exclusions, hypothetical result, and zero-rate C×n case. | English guide |

No formula engine or national tax rules were rewritten. Existing useful examples, formulas and sources were retained. Shared review dates were not advanced for English-only edits to content that also serves unreviewed translations.

## Evidence and source verification

- [OCC payment allocation](https://www.helpwithmybank.gov/help-topics/mortgages-home-equity/payments-late-payments/mortgage-payment-principal.html): borrowers should check the agreement/bank process for additional principal payments. [CFPB prepayment penalties](https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/): charges depend on agreement/circumstances. Added these references to the loan-payment guide beside the existing amortisation reference; no worldwide legal entitlement was inferred.
- [CFPB amortisation](https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-771/): fixed scheduled payment and changing interest/principal split. [IRS brackets](https://www.irs.gov/filing/federal-income-tax-rates-and-brackets): higher rates apply to the next income layer. These support conditional explanations, not a promise about every benefit system.
- [GOV.UK VAT rates](https://www.gov.uk/vat-rates): confirms UK reduced, zero and exempt supplies. The guide links this source; no new national rate table was created.
- [Investor.gov compound interest](https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator): existing reference for principal/contribution/rate/frequency scenarios. Mathematical examples below were independently recomputed rather than attributed to a current market return.
- [NIST conversion reference](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors): existing conversion-table reference inspected. The pressure correction follows the implemented scale-only conversion and does not introduce a pressure-reference formula. [MDN Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) checked for UTC/date semantics; endpoint and holiday details come from the actual DateTools/dates implementation.
- Local source proof: length table 1 m→ft displays 3.28 whereas the converter has available 3.2808 display at that magnitude; the previous blanket display-agreement claim was false. No conversion factor was changed.

Independent checks of content examples: loan principal 200000, 6%/12, 300 months gives payment 1288.602802971, total 386580.840891 and growth factor 4.464969812; remaining principal after 144 payments is 139350.073881. Compound example 10000 at 6% nominal monthly/10 years gives 18193.967340; annual compounding gives 17908.476965. Beginning-month deposits 500 at 7% nominal monthly/20 years give 261982.699337. The displayed examples round correctly. Inflation loss at constant 3% is 25.5906% over 10 years and 44.6324% over 20 years. This verifies those specific editorial examples, not all arithmetic on the site.

## Exact open coverage

`CONTENT-COVERAGE.json` contains a row for every existing inventory URL, with reviewed facets, affected corrections, and unfinished work. It also separately records the prioritized Brazil salary alias, which is intentionally outside the sitemap and consolidates to its income-tax identity. No missing-page defect was inferred from that omission.

| Public locale | Content routes | Partial source review | No content review | Full page completion claimed |
|---|---:|---:|---:|---:|
| en-us | 253 | 154 | 99 | 0 |
| en-gb | 253 | 151 | 102 | 0 |
| it-it | 250 | 26 | 224 | 0 |
| de-de, fr-fr, es-es, pt-br, ru-ru, tr-tr, ja-jp, zh-cn, nl-nl (each) | 250 | 0 | 250 | 0 |
| **Total** | **3006** | **331** | **2675** | **0** |

The other 648 inventory URLs are index/category/country landing or policy pages, excluded from the detailed-content count. The source passes do not close full page review: **all 3006 full page reviews remain open**, of which 331 have the precise partial work recorded above. This distinction avoids calling an entire page complete after reading one shared FAQ. The additional prioritized Brazil alias is also only partially reviewed.

Remaining work: the ledger's 2675 untouched routes; unresolved facets for the 331 partially reviewed routes; pair-specific converter wording and source/precision checks; independent verification of remaining financial/health/regulatory claims and fixed examples; page-specific utility beyond template text; and actual locale wording in the nine untouched public locales plus the unreviewed English/Italian text. Repeated English guide overclaims may still exist in other languages; no translation pass or English replacement was performed there. Public Hindi/Gujarati/Marathi/Arabic or Polish-language readiness was not claimed.

## Validation

- Changed-file lint: `pending-tasks-targeted-lint.log`.
- Full `npm run check` attempted; fails on four pre-existing no-require-imports errors in this directory's analyze.cjs/crawl.cjs and reports three unrelated script warnings. These unrelated files were preserved.
- Generated dictionaries and regional US spelling were refreshed; final language coverage: `pending-tasks-i18n.log`. Language-key coverage is not translation quality review.
- Production build: `pending-tasks-final-build.log`; local content/schema/image checks: `pending-rendered-checks.json`. Browser regression notes and final status are appended after actual verification below.
- `git diff --check` passed after source edits. Existing Loan/Poland overrides remain present. No commit, push or deployment.

### Final observed results

Final production build passed; targeted ESLint and TypeScript passed; generated dictionary/metadata and language-key/regional-copy checks passed. The full-check failure remains the four existing unrelated audit-script lint errors, not a successful full-check run.

`pending-rendered-checks.json` records **29 successful local production responses** covering the priorities and changed guide/converter/tool/chart outputs, parseable JSON-LD and visible application-name/description agreement. The unchanged prior Loan/Poland overrides render correctly. All assertions passed, including the Italian FAQ, English overpayment scope, added source links, pressure-reference explanation and precision correction. This bounded regression set is not a replacement 3654-URL crawl or completion of content review.

Browser checks: mobile and desktop home layouts; mobile menu open/close; Loan input update (principal 100000 at the retained demo rate/term) and Yearly schedule tab; consent unavailable-state privacy disclosure; Date Difference 2026-10-05→2026-10-05 returned 0 elapsed days and 1 working day; Italian income-tax scope and corrected FAQ present. Date fields required native keyboard changes to commit in this browser automation interface; simple fill alone changed the displayed input without committing the React state. No source arithmetic was changed in response to that automation limitation.

Screenshots are local-production previews, not proof that content is live. The guide and base-copy source reviews remain **partial** under the coverage table even where a rendered output passed these focused assertions. Local browser country preferences and local CMP behavior were not used to infer a clean consent state or regional certification.

Exact changed inventory routes are also listed in `CONTENT-AFFECTED-ROUTES.json` (110 routes with copy or source-link corrections). Shared listing snippets can also display the corrected Loan base description; index pages were not reclassified as full content reviews.
