# PROJECT_STATE.md

> Source of truth for continuing this project in a new Claude session.
> Last updated: 2026-09-24 (session 5). Working directory: `D:\Calculator`.

---

## 1. Project Overview

| | |
|---|---|
| **Name** | House of Calculators |
| **Positioning** | "Every Calculation. One Global Home." |
| **Purpose** | Global, multilingual, mobile-first platform for calculators, converters, tools, reference tables, guides and country-specific utilities |
| **Target users** | Anyone searching for a calculation ("mortgage payment", "meters to feet", "UK stamp duty"), across 16 locales and 22 countries |
| **Monetization** | Organic search traffic → Google AdSense (slots built in, no publisher id configured yet) |
| **Status** | Six product pillars, legal pages, cookie consent and CI implemented and building. Every calculator and tool category in the spec has content. 710 static pages. 881 tests passing. English complete; 7 other languages at 17–19% coverage and therefore **gated off**. Statutory tax figures **unverified**. Operator details (entity, email, jurisdiction) **unset**. |

**Governing spec:** `C:\Users\sandi\Downloads\HouseOfCalculators_Project_Specification.md` (85 sections). The build follows it; deviations are documented in §7 below.

---

## 2. Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.3.5**, App Router | Turbopack build. `proxy.ts` convention (NOT `middleware.ts` — deprecated in 16) |
| Language | TypeScript 5, strict | |
| UI | React 19.2, **Tailwind CSS v4** | Tokens as CSS variables in `src/app/globals.css`, exposed via `@theme inline` |
| i18n | **Custom** (no next-intl) | Flat JSON dictionaries + English fallback + readiness gate |
| Backend | None yet | All calculation is deterministic and client-side |
| Database | None yet | Spec suggests PostgreSQL later; not needed while content is config-driven |
| Tests | **Node's built-in test runner** running `.ts` natively | Vitest install failed on peer deps; native runner works via a custom ESM loader |
| Fonts | System stack only | No webfont; covers Latin/Cyrillic/CJK/Devanagari/Gujarati/Arabic |
| Charts | Hand-written inline SVG | No chart library |
| Deployment | Not configured | |

**Key config files:** `next.config.ts` (default), `tsconfig.json` (`@/*` → `./src/*`), `eslint.config.mjs`, `postcss.config.mjs`, `.gitattributes` (LF normalisation), `.claude/launch.json` (dev server for the browser pane).

**Env vars (names only, none set):**
- `NEXT_PUBLIC_SITE_URL` — canonical origin. Falls back to `https://houseofcalculators.com`.
- `NEXT_PUBLIC_ADSENSE_CLIENT` — when absent, `AdSlot` renders nothing at all.

---

## 3. Architecture

### URL structure
```
/{locale}                                   e.g. /en-us
/{locale}/{section}                         /en-us/calculators
/{locale}/{section}/{category}              /en-us/calculators/finance
/{locale}/{section}/{category}/{slug}       /en-us/calculators/finance/mortgage
/{locale}/countries/{country}               /en-us/countries/gb
/{locale}/countries/{country}/{slug}        /en-us/countries/gb/stamp-duty
```
Sections: `calculators`, `converters`, `tools`, `charts`, `guides`, `countries`.

### The central architectural idea
**Locale ≠ Country.** The locale (language + market) is in the URL. The country is a separate, overridable setting stored in a cookie that drives currency, number formatting and statutory rules. A visitor can read in English (US) while calculating for Germany.

A calculator's `isCountrySpecific` flag decides which URL it gets:
- `false` → `/calculators/{category}/{slug}` (one stable URL, country only affects currency)
- `true` → `/countries/{country}/{slug}` (rules differ per country; country selector is hidden and locked)

This prevents the same calculation having two competing URLs (spec §7, §40).

### Folder structure
```
src/
├── app/
│   ├── [locale]/            root layout (owns <html>), landing page, 6 section trees
│   ├── globals.css          design tokens + component-level CSS
│   ├── sitemap.ts           one sitemap, per-entry hreflang alternates
│   └── robots.ts
├── components/
│   ├── ads/                 AdSlot, AdScript
│   ├── calculator/          CalculatorRunner, CalculatorPageBody, FieldControl,
│   │                        BreakdownPanel, ResultActions, CalculatorGrid
│   ├── charts/              DonutChart, ReferenceTable
│   ├── converter/           ConverterRunner
│   ├── layout/              SiteHeader, SiteFooter, Breadcrumbs
│   ├── navigation/          LocaleSelector, CountrySelector, WelcomeDialog
│   ├── search/              SearchBox
│   ├── shared/              ContentCard, CardGrid, SectionHeading, CountryBadge, Dropdown
│   ├── consent/             ConsentScript (Consent Mode v2 defaults), ConsentBanner
│   └── tools/               ToolRunner, ToolShell, DateTools, NumberTools, UtilityTools,
│                            MoreTools, RandomTools
├── config/
│   ├── locales.ts           16 locales
│   ├── languages.ts         14 languages
│   ├── countries.ts         22 countries
│   ├── categories.ts        sections + per-section category vocabularies
│   ├── calculators/         types.ts, scale.ts, index.ts (registry), definitions/*
│   ├── converters/          units.ts (engine), definitions.ts (13 converters)
│   ├── tools/definitions.ts 23 tools (metadata only)
│   ├── charts/definitions.ts 19 tables (each has a `build(ctx)` generator)
│   ├── guides/definitions.ts 12 guides (structured, not free prose)
│   ├── calculators/definitions/{health,maths,business,education,construction}.ts  33 generic calculators
│   └── legal/definitions.ts  5 legal pages + OPERATOR details
├── lib/
│   ├── i18n/                index.ts + dictionaries/*.json
│   ├── finance/             index.ts (pure maths), tax/{define,rules,slabs,index}.ts
│   ├── tools/               dates.ts, numbers.ts, planning.ts, random.ts (shared CSPRNG)
│   ├── health/ maths/ business/ construction/   pure logic for the generic calculators
│   ├── format.ts            currency/number formatting per country+language
│   ├── locale-context.tsx   client LocaleProvider + useLocale
│   ├── preferences.ts       cookie read/write
│   ├── routes.ts            every URL builder
│   ├── seo.ts               buildMetadata, JSON-LD helpers, readiness gate
│   ├── content.ts           unified content index (search + grids + sitemap)
│   └── search.ts            typo-tolerant scoring
├── proxy.ts                 locale routing (NOT middleware.ts)
scripts/                     i18n-coverage.mjs + 4 dictionary-seeding scripts
tests/                       node test runner + custom ESM loader
docs/tax-rules-to-verify.md  every statutory number that needs checking
```

### Content registry counts (verified)
| Registry | Count |
|---|---|
| Calculators | 60 across all 8 spec categories (19 country-specific, 41 generic) |
| Converters | 13 categories, 61 featured pair pages |
| Tools | 23 across all 4 tool categories |
| Charts/tables | 19 |
| Guides | 12 |
| Legal pages | 5 (privacy, terms, cookies, contact, about) |
| Locales | 16 (12 launch + 4 extra) |
| Countries | 22 |
| Static pages built | 710 |

### Key relationships
- `lib/content.ts` aggregates every registry into `ContentItem[]` — **the one place** search, grids and the sitemap read from, so a page can't exist in one and be missing from another.
- `config/charts` imports from `config/converters` and `lib/finance` — tables are *generated* from the same data the tools use, so they cannot drift.
- `config/countries.ts` imports `isLanguageReady` from `lib/i18n` (readiness gate).
- `lib/seo.ts` `readyLocales()` gates `generateStaticParams`, hreflang and the sitemap.

---

## 4. Completed Work

### Session part 1 — original "Calcora" build (commits `d9fecfe`, `6532a11`, `5183aaf`)
- Next.js scaffold, Tailwind v4, design tokens, dark mode.
- Groww-inspired calculator UX: slider + editable input, donut chart, result rows.
- Country/language routing at `/{country}/{lang}`, cookie persistence, first-visit picker.
- 20 countries, 14 languages; income-tax rule sets per country.
- Declarative income-tax engine (`tax/define.ts`) covering allowances, bands, phasing credits, surtaxes, payroll contributions and closed-form formulas (Germany §32a).
- 27 calculators.
- Language readiness gate at 75% coverage.
- i18n coverage script; grammar fixes for Marathi/Gujarati oblique forms and German/French/Spanish preposition handling.
- **Bug fixes:** Marathi rendering Devanagari digits; `style:"currency"` dropping Indian lakh grouping in `mr-IN`; `{tax}` placeholders unresolved in field/result labels; flag emoji not rendering on Windows (replaced with `CountryBadge`); locked-country formatter leaking the visitor's currency.

### Session part 2 — re-architecture to spec (commit `9c012f4`)
- Rebranded to House of Calculators; spec §18 palette.
- **Locale model rewritten**: 16 locales, locale ≠ country, `proxy.ts` resolution order = cookie → `Accept-Language` → geo header → default.
- **URL/IA restructure** to `/{locale}/{section}/{category}/{slug}` + country tools.
- **SEO layer**: canonical, bidirectional hreflang with `x-default`, OG/Twitter, Organization + WebSite + BreadcrumbList JSON-LD, sitemap with per-entry language alternates, robots.txt.
- **Converter engine**: 13 categories through one unit library; pair pages only for searched conversions; plural URL slugs (`meters-to-feet`).
- **Breakdown tabs** (monthly / yearly / full term) with pagination, mobile card layout, CSV export, print, share.
- **Global search**: typo-tolerant (capped Levenshtein), grouped by section.
- **AdSlot**: reserves height, labelled, renders nothing without a publisher id.
- Header with 6-section nav + mobile menu; footer; breadcrumbs; welcome dialog with *separate* language and country questions.
- Russia and China added as countries + languages.

### Session part 3 — remaining pillars (commits `464cc0e`, `1c6c967`, and uncommitted)
- **Tools pillar** (committed): 14 tools; UTC date arithmetic; month-clamping; ISO weeks; Roman numeral round-trip validation; CSPRNG with rejection sampling; debt planner that reports non-clearing payments.
- **Charts pillar** (committed): 19 reference tables generated from live data, server-rendered, bidirectional links to tools.
- **Guides pillar** (uncommitted): 12 structured guides with formula → variables → steps → worked example → calculator → FAQ; `Article` JSON-LD; honest `reviewed` dates. Worked-example figures verified against the shipped implementations.
- **Tests** (uncommitted): 172 passing across finance and tax.

---

## 5. Current Implementation

### Important files
| File | Role |
|---|---|
| `src/proxy.ts` | Locale routing. Redirects unprefixed URLs; falls back when a locale isn't ready |
| `src/app/[locale]/layout.tsx` | Root layout — owns `<html lang dir>`, LocaleProvider, header/footer, JSON-LD |
| `src/lib/locale-context.tsx` | `useLocale()` → `{ locale, t, fmt, country, setCountry, base, dir }`. Country read via `useSyncExternalStore` so pages stay static |
| `src/lib/seo.ts` | `buildMetadata()`, `isLocaleReady()`, `readyLocales()`, JSON-LD builders |
| `src/lib/routes.ts` | Every URL builder + `swapLocale()` + `siteUrl()` |
| `src/lib/content.ts` | Unified `ContentItem[]` index |
| `src/lib/finance/tax/define.ts` | `defineRules(spec)` — the declarative tax engine |
| `src/lib/finance/tax/rules.ts` | 22 country rule sets, each with `verifiedFor` |
| `src/components/calculator/CalculatorRunner.tsx` | Generic engine: looks up the definition by slug client-side (definitions hold functions, which can't cross the server boundary) |
| `src/lib/i18n/index.ts` | Dictionaries, `translate`, `countryParams`, `isLanguageReady`, `unitName` |

### Routes (all implemented)
All 23 route files listed in §3. Every page defines its own `generateMetadata` (important: without it a page would inherit the locale home's canonical).

### Configuration worth knowing
- `READINESS_THRESHOLD = 0.75` in `src/lib/i18n/index.ts`.
- `RAW` in the same file maps language → dictionary. **A language without an entry there is simply not translated yet** — no stub file needed.
- Digits pinned to Latin everywhere via `-u-nu-latn` in `intlLocale()`.
- Currency is composed manually (symbol + locale-grouped number) rather than `style:"currency"`, to preserve Indian lakh grouping.

---

## 6. Current Task

**The test suite is finished (spec §53, §67). 487 tests, 487 passing.**

| File | Tests | Covers |
|---|---|---|
| `tests/finance.test.ts` | 25 | EMI known values, zero-rate, single-period, schedule reconciliation, compounding, SIP/step-up, SWP, CAGR |
| `tests/tax.test.ts` | 147 | Per-country invariants (monotonic, never exceeds gross, parts sum to total, non-negative taxable income) plus known figures for IN/US/GB/AE/DE/AU |
| `tests/converters.test.ts` | 134 | Exact defined factors, temperature offsets, fuel-economy reciprocal + the 235.2 constant, round-trips across every unit pair of all 13 converters, definition integrity, pair-slug uniqueness |
| `tests/tools.test.ts` | 83 | UTC date arithmetic across DST weekends, month clamping, ISO week edges over 8 years, Roman round-trip across all of 1..3999, primes, fractions, planner reconciliation |
| `tests/i18n.test.ts` | 72 | Placeholder integrity both directions, brace well-formedness, no keys English does not define, fallback completeness, readiness gate, `countryObl`/plural variant rules |
| `tests/hreflang.test.ts` | 26 | Self-reference, canonical agreement, bidirectionality, `x-default`, and the same checks over every sitemap entry |

`tests/alias-hooks.mjs` + `tests/register-alias.mjs` are the ESM loader resolving `@/` aliases, extensionless imports and JSON import attributes. `tests/package.json` scopes the ESM warning.

**The suite found five real bugs, all fixed in commit `b1b5b77`:**

| # | Bug | Why it was invisible |
|---|---|---|
| 1 | `calendarDifference` returned **negative days** — 31 Jan → 1 Mar read "1 month and -2 days" on the date-difference and age tools | Borrowing the previous month's length is not enough when the start day exceeds that month's length. Now counted in whole `addMonths` steps, so it agrees with the clamping rule in the same file by construction |
| 2 | `numberToWords` dropped the leading zero: 12.05 and 12.5 both spelled "twelve point five" | On a tool whose stated purpose is writing an amount on a cheque |
| 3 | `field.taxRate` / `result.taxAmount` carried a `{tax}` slot in ar/es/gu/hi/mr | Those keys render through `labelKey`, which every call site translates **with no params** → a literal `{tax} दर` on the page. English had been fixed for this before; the translations had not |
| 4 | `gate.language.subtitle` carried `{app}` in all 7 translations | The welcome dialog passes no params → a literal `{app}` in the first dialog a non-English visitor sees |
| 5 | `footer.disclaimer` spelled the **pre-rebrand name** into the sentence in all 7 languages instead of using the `{app}` slot | The rename to House of Calculators never reached the translations |

Both the date and the number fix were verified in the running app, not only in tests.

**Still open from this task:** search scoring tests, and component/E2E tests (spec §67) — neither started.

### Then: the legal pages (commit `94c5488`)

Five pages the footer had been linking to 404s: privacy, terms, cookies, contact, about. Structure in `src/config/legal/definitions.ts`, prose in `en.json` via `scripts/add-legal-keys.mjs`, one route at `src/app/[locale]/[legal]/page.tsx`, 22 tests in `tests/legal.test.ts`.

The copy describes **what this site actually does**, not a template:
- Calculation runs in the browser, so a visitor's numbers never leave their device. That is a real property of the architecture (spec §30) and it leads the policy.
- No accounts and no contact form, so there is nothing stored to have rights over. Contact is an email address for that reason.
- The two preference cookies are named from `LOCALE_COOKIE` / `COUNTRY_COOKIE` in `lib/preferences`, so the policy cannot describe a cookie the site does not set.
- The terms lead with what the results are *not*, and state that statutory figures carry the year they were written for and are not warranted current.

**⚠️ Before launch:** `OPERATOR` in `src/config/legal/definitions.ts` holds `entity`, `email` and `jurisdiction`, all still `null`. While any is unset **every legal page renders a visible "not ready to publish" notice**. Fill them in and the notice disappears — that is the whole remaining work on these pages.

`app.name` is now `House of Calculators` in all seven translated dictionaries (was the pre-rebrand name). Decision: **one brand in Latin script across every locale**, so it stays searchable and matches the domain.

### Then: the spec completion pass (session 5, commits `38ae10f` → `a19a94b`)

The user asked to read the governing spec and complete pending work. Audit result: the engine was complete, content and launch plumbing were not. Done, in order:

| Commit | What |
|---|---|
| `38ae10f` | **Health** (bmi, bmr, tdee, body-fat, water-intake, running-pace) and **Maths** (statistics, ratio, exponent, quadratic-equation, triangle, area, volume) |
| `34c23f4` | **Business** (profit-margin, markup, break-even, roi, roas, growth-rate), **Everyday** (discount, fuel-cost, electricity-cost, recipe-scaler), **Education** (gpa, weighted-grade, final-grade), **Construction** (concrete, paint, tile, roof-area), **Engineering** (ohms-law, force, torque). 27 → 60 calculators; no category empty |
| `5b28c42` | Brand **icon.svg** + generated **opengraph-image**, scaffold assets removed, **cookie consent** (Consent Mode v2), **CI** (`.github/workflows/ci.yml`) |
| `a19a94b` | Nine **tools**: day-of-week, countdown, words-to-number, factor-finder, number-formatter, dice-roller, coin-flip, random-picker, budget-planner. 14 → 23 |

**Engine additions** made along the way (all backward-compatible):
- `Country.measurementSystem` (`metric` / `us-customary` / `mixed`) — spec §13, never previously built. Health/construction/fuel calculators default their units from it.
- `CalculatorDef.countryRelevance` (`rules` / `currency` / `units` / `none`) — drives the badge under the H1 and the country-selector hint, and hides the selector entirely for `none`. Helper `countryRelevanceOf()` applies the default (`rules` if country-specific, else `currency`).
- `ResultRow.decimals` / `BreakdownColumn.decimals` — the formatter defaults to 0 decimals, which rendered a BMI of 24.3 as "24".
- Field kind `text` — for list inputs (statistics). An empty `select` renders nothing.
- `lib/tools/random.ts` — the CSPRNG helper that was private to UtilityTools, now shared: `randomInt` (rejection sampling), `shuffle` (Fisher-Yates), `pick`, `splitTeams`, `rollDice`, `flipCoins`.

**Bugs found and fixed in this pass:**

| Bug | How it surfaced |
|---|---|
| **Brazil's slider floor sat above its own default** (R$100,000 floor vs R$60,000 default) on income-tax, salary, pension and social-security. `nice()` rounded minimums *up*. Now `niceFloor()` for minimums, and each range is widened to contain its default | New registry test asserting every field defaults inside its range |
| Page claimed "Figures follow United States rules for 2025" on BMI and quadratic pages | Browser check → `countryRelevance` |
| Donut centre formatted every primary as currency — a 40% margin read "$40" | Browser check |
| Locale proxy swallowed `/opengraph-image` (no file extension), so shared links had no preview | curl returned 307 |
| `buildMetadata` set `openGraph` without `images`, which replaces the file convention wholesale — no `og:image` emitted | Checked the emitted HTML |

**Consent design** (see §7): banner only when `NEXT_PUBLIC_ADSENSE_CLIENT` is set; asks about advertising cookies only; defaults all four Consent Mode signals to denied in an inline script emitted *before* the ads script; reject shown first with identical styling. Verified end to end in the browser with a temporary publisher id.

**Still open from the spec audit** (not done, deliberately):
- **Time-zone converter, world clock, meeting planner** (§3, §4) — need a zone database; group with the currency work.
- **Currency converter** (§12) — needs a live, timestamped rate source. Never hard-code rates.
- **Search scoring tests, component/E2E tests** (§67).
- Charts: shoe/clothing size and time-zone reference tables (§5).
- Sitemap split into per-section files (§23) — one sitemap is fine at 710 URLs.
- PDF/XLSX export (§55) — CSV and print exist.
- GA4 / Search Console (§36) — see the privacy-page note in §9.

---

## 7. Decisions Already Made

| Decision | Reason | Don't change without discussing |
|---|---|---|
| **Locale ≠ country**, country in a cookie not the URL | Spec §8/§58 is explicit. Reading in English while calculating for the UK is a supported combination | Merging them would break the whole IA |
| `isCountrySpecific` decides a calculator's URL | Prevents duplicate URLs for one calculation (spec §7, §40) | Changing it changes every country-tool URL |
| **Readiness gate at 75%** | A locale that falls back to English is worse than not being offered. Gates picker, hreflang, sitemap and static params together | Lowering it ships half-English pages to search engines |
| Custom i18n instead of next-intl | Flat keys + English fallback + the readiness gate; next-intl has no equivalent gate | Migrating means rebuilding the gate |
| **Shared dictionary vocabulary** (`field.loanAmount`, `result.totalInterest`) rather than per-calculator keys | Without it, 27 calculators × 14 languages is unmanageable. A new calculator now needs ~2 new strings per language | Reverting multiplies translation volume ~10× |
| Currency composed manually, not `style:"currency"` | `mr-IN` silently drops Indian lakh grouping inside the currency pattern (₹30,00,000 → ₹3,000,000) | Reverting reintroduces a wrong money format |
| Latin digits forced everywhere | Marathi/Arabic would render ५०० / ٥٠٠ beside Latin-digit inputs | |
| Calculation runs **client-side** | Deterministic; spec §30 explicitly forbids a server round-trip per keystroke | |
| Charts generated from live data, not transcribed | A table can't drift from the tool beside it | |
| Featured converter pairs only | Spec §40 — every permutation would be thin duplicate pages | |
| `CountryBadge` instead of flag emoji | Windows has no regional-indicator glyphs; it silently rendered bare letters | |
| `proxy.ts` not `middleware.ts` | Next 16 deprecated the middleware convention (`AGENTS.md` warns about this) | |
| Tests use Node's native runner | Vitest install fails on peer deps here; Node 24 runs `.ts` natively | |
| Kept hi/gu/mr/ar beyond the spec's 12 locales | Already translated; wasteful to discard | |
| Brand name in a dictionary key (`app.name`) | Renaming is a one-line change | |
| **Brand stays "House of Calculators" in Latin script in every language** | User's decision (session 4). Keeps it searchable and matching the domain | Don't transliterate or translate it |
| `countryRelevance` on every calculator; `none` hides the country badge and selector | Claiming a BMI follows a country's tax-year rules was simply untrue | New calculators must set it honestly |
| Construction/fuel calculators work in the units given, never convert silently | A trade calculator that turned feet into metres behind the user's back would be worse than useless | |
| Maths calculators do **not** duplicate percentage / primes / fractions / Roman numerals | Those exist as tools; a second URL would compete for the same query (spec §40) | |
| Consent banner only when a publisher id is set, and only about **advertising** cookies | With no ads there is nothing to consent to; the locale/country cookies are strictly functional | Don't gate the preference cookies |
| Consent Mode defaults set in an **inline script before `<AdScript />`** | The ads script is async; if it runs first it can set a cookie nobody agreed to. A test pins the order | |
| Reject button first and styled identically to accept | Anything else is a dark pattern; a test pins it | |
| `proxy.ts` `config.matcher` is an **inline literal** | Next statically analyses it and rejects an imported constant. `tests/hreflang.test.ts` parses the literal out of the file | Don't extract it to a module |
| All randomness through `lib/tools/random.ts` (CSPRNG) | People settle things with these tools; `Math.random` / sort-by-random is not fair | |
| Client state from cookies/clock via `useSyncExternalStore`, not `setState` in an effect | Keeps pages static and satisfies the React compiler lint rule `react-hooks/set-state-in-effect` | |

---

## 8. Known Issues / Bugs

| # | Problem | Status | Tried / Next step |
|---|---|---|---|
| 1 | **7 languages gated off** (ar/de/es/fr/gu/hi/mr now at 17–19%). Only `en-US` and `en-GB` currently build | Known, by design of the gate | English is now **2,139 keys** (was 1,256 before session 5's calculators, tools and legal copy). ~1,730 keys to translate per language to reach the 75% gate. Order by market: de, fr, es, then hi/gu/mr/ar |
| 2 | **6 locales have no dictionary at all**: nl, ja, it, pt, pl, tr (+ new ru, zh) | Not started | Add file + import into `RAW` in `src/lib/i18n/index.ts`; the gate switches them on automatically |
| 3 | **All statutory tax figures unverified** | Documented, not fixed | `docs/tax-rules-to-verify.md` lists every number. Must be checked before launch |
| 4 | Known model gaps: CH (no cantonal tax), US/CA (no state/provincial), DE (contributions not deducted as Vorsorgeaufwendungen), FR (no quotient familial), BR (ICMS modelled as single VAT) | Each stated in the page's own note | Same doc |
| 5 | ~~Legal pages linked in the footer but do not exist → 404~~ | **Fixed** (`94c5488`) | All five built and in the sitemap. See issue 15 for the one thing left on them |
| 6 | ~~No cookie-consent implementation~~ | **Fixed** (`5b28c42`) | Consent Mode v2 + banner, active only when a publisher id is set. Re-check Google's current CMP requirements for EEA/UK before launch — Google may require a certified CMP rather than a custom banner for personalised ads there |
| 7 | AdSense not configured | By design | Set `NEXT_PUBLIC_ADSENSE_CLIENT`; slots render nothing until then |
| 8 | Guide category page derived from the charts page via `sed` | Works, verified | Worth a read-through for leftover chart naming |
| 9 | ~~No favicon/OG image beyond the scaffold default~~ | **Fixed** (`5b28c42`) | `src/app/icon.svg` + generated `src/app/opengraph-image.tsx`. No `apple-icon` PNG yet |
| 10 | `MODULE_TYPELESS_PACKAGE_JSON` warnings when running tests | Cosmetic | Scoped `tests/package.json` already added; warnings come from `src/` files |
| 11 | ~~No CI pipeline~~ | **Fixed** (`5b28c42`) | `.github/workflows/ci.yml`: lint, types, tests, i18n, build as separate jobs on Node 24. **Not yet run on GitHub** — no remote push has happened this session |
| 12 | ~~`npx tsc --noEmit` failed on the test files (`TS5097`)~~ | **Fixed** (`0c4953a`) | `"allowImportingTsExtensions": true` added to `tsconfig.json`, valid because `noEmit` is already set. The tests stay type-checked |
| 13 | ~~`app.name` was still the pre-rebrand brand in all 7 translated dictionaries~~ | **Fixed** (`94c5488`) | Set to `House of Calculators` in every language. Decided: one brand in Latin script everywhere, so it stays searchable and matches the domain |
| 15 | **`OPERATOR` details are unset** — entity, contact email and governing-law jurisdiction are all `null` in `src/config/legal/definitions.ts` | Open, **blocks launch and AdSense review** | Every legal page shows a "not ready to publish" notice until they are filled in. This is a one-object edit; the notice disappears on its own |
| 16 | Health pages carry disclaimers in notes/explainers but no dedicated medical-disclaimer block | Open, low | Spec §2.1 asks for "appropriate disclaimers"; current wording is careful but worth a review before launch |
| 14 | **No pluralisation**: the date tools render "0 years, 1 months and 1 days" | Open, cosmetic but visible on every date result | Needs plural-aware keys. English alone would be a patch; doing it per language is the real fix, since plural rules differ (Arabic has six forms). Consider `Intl.PluralRules` keyed as `key.one` / `key.other` with the existing English fallback |

---

## 9. Next Steps

### Blocking launch — needs the user
1. **Fill in `OPERATOR`** (issue 15) in `src/config/legal/definitions.ts` — entity, contact email, governing-law jurisdiction. Every legal page shows a "not ready to publish" notice until then.
2. **Push to GitHub** so the CI workflow actually runs once (issue 11).
3. **Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_ADSENSE_CLIENT`** in the deployment environment; choose hosting (spec §9).
4. **Verify statutory tax figures** against `docs/tax-rules-to-verify.md` (issue 3).

### Short term — code
5. **Translate de, fr, es** (restores 3 locales). ~1,730 keys each now. Keep `npm run test` green — `tests/i18n.test.ts` fails on a mismatched placeholder, which is its point. Leave `app.name` alone.
6. **Pluralisation** (issue 14) — better done *before* bulk translation, since it changes key shapes.
7. Then hi, gu, mr, ar.

### Later
8. Currency converter + time-zone converter/world clock/meeting planner (need live data sources; **never hard-code rates**).
9. New locale dictionaries: nl, ja, it, pt, pl, tr, ru, zh.
10. GA4 + Search Console. **Update the privacy and cookies pages first** — both state no analytics are used.
11. Remaining charts (shoe/clothing sizes, time-zone reference), `apple-icon`, PDF/XLSX export.
12. Search scoring tests; component/E2E tests (spec §67).

### Optional
13. Theme toggle; PostgreSQL + admin CMS (spec §47/§77) once content outgrows config files.

---

## 10. Important Context From This Session

**Requirements the user stated directly**
- Groww's calculator pages (`groww.in/calculators`) are the UI/UX reference — slider + donut + summary rows layout came from there.
- The site must offer a **language choice when opened**, and all content must change with it. This became the `WelcomeDialog`, which now asks language and country as two separate questions.
- Calculators must apply **country-specific rules and logic**, not just currency.
- The user supplied an explicit ~100-item calculator list by language/country, then later the full spec document which superseded the IA.

**User preferences observed**
- Wants scope delivered, not narrowed. When given a large list, build the architecture that makes it tractable.
- Chose Next.js + TS + Tailwind, country-first selection, and "I will give you list" for calculators.
- Expressed no country preference — 20 (now 22) were chosen to cover the supplied list.

**Explicitly decided NOT to do**
- No per-permutation converter pages.
- No fabricated "verified" tax data — every rule set carries the year it was written for, and gaps are stated on the page.
- No fake freshness dates on guides (`reviewed` is a real review date).
- No ad patterns that could be mistaken for controls; no ads at all without a publisher id.
- No `Math.random` for anything a user might treat as fair.
- No webfont (system stack covers all six scripts).

**Technical constraints discovered the hard way**
- Bash heredocs in this environment mangle backticks and `${}` — use the `Write` tool or Node scripts for anything with template literals.
- Next 16: `params` are Promises; `middleware.ts` is deprecated in favour of `proxy.ts`; the root layout can live at `app/[locale]/layout.tsx` with no `app/layout.tsx`.
- Passing a calculator definition from a server component to a client one fails — definitions contain functions. Pass the slug and look it up client-side.
- Reading cookies via `cookies()` in a layout makes every page dynamic; `useSyncExternalStore` keeps them static.

---

## 11. Files Changed

### Created (this session, selected — the tree is largely new)
| Path | What it is |
|---|---|
| `src/config/locales.ts` | 16-locale registry |
| `src/config/categories.ts` | Sections + per-section category vocabularies |
| `src/config/converters/{units,definitions}.ts` | Converter engine + 13 converters |
| `src/config/tools/definitions.ts` | 14 tool definitions |
| `src/config/charts/definitions.ts` | 19 generated reference tables |
| `src/config/guides/definitions.ts` | 12 structured guides |
| `src/lib/{routes,seo,content,search,preferences}.ts` | URL builders, SEO, content index, search, cookies |
| `src/lib/finance/tax/{define,rules}.ts` | Declarative tax engine + 22 rule sets |
| `src/lib/tools/{dates,numbers,planning}.ts` | Pure tool logic |
| `src/app/[locale]/**` | 21 route files |
| `src/app/{sitemap,robots}.ts` | |
| `src/components/**` | ~20 components in spec-shaped folders |
| `tests/{finance,tax}.test.ts`, `tests/alias-hooks.mjs`, `tests/register-alias.mjs`, `tests/package.json` | Test suite + ESM loader |
| `scripts/{i18n-coverage,add-en-keys,add-tool-keys,add-chart-keys,add-guide-keys}.mjs` | Dictionary tooling |
| `src/config/legal/definitions.ts` | 5 legal pages + the `OPERATOR` details that must be filled before launch |
| `src/app/[locale]/[legal]/page.tsx` | One route serving all five legal pages |
| `tests/{converters,tools,i18n,hreflang,legal}.test.ts` | The rest of the suite — 509 tests total |
| `docs/tax-rules-to-verify.md` | Every statutory figure needing verification |
| `.gitattributes` | LF normalisation |

### Modified
| Path | Change |
|---|---|
| `src/app/globals.css` | Rewritten to the spec palette |
| `src/config/{countries,languages}.ts` | 22 countries, 14 languages; readiness filtering |
| `src/config/calculators/**` | Spec categories, `version`, `isCountrySpecific` |
| `src/lib/i18n/index.ts` | Partial `RAW`, readiness gate, `countryParams`, `unitName`, `hasOwnKey` |
| `src/lib/format.ts` | Manual currency composition; Latin digits |
| `src/lib/locale-context.tsx` | Rewritten for locale/country split |
| `src/lib/i18n/dictionaries/*.json` | English 1256 keys; 7 others migrated to shared vocabulary |
| `README.md` | Rewritten (describes the pre-rebrand "Calcora" scope — **stale, needs updating**) |
| `package.json` | Renamed; added `i18n`, `test`, `check` scripts |

### Deleted / renamed
- `src/app/[country]/[lang]/**` → replaced by `src/app/[locale]/**`
- `src/middleware.ts` → `src/proxy.ts`
- `src/components/{LocaleDialog,LocaleGate,SiteHeader,SiteFooter}.tsx` → replaced under `layout/` and `navigation/`
- `src/components/ui/*` → moved to `calculator/`, `charts/`, `shared/`
- `src/lib/finance/tax/income-tax.ts` → split into `define.ts` + `rules.ts`
- `src/config/calculators/definitions/{emi,consumption-tax,income-tax}.ts` → merged into `loans.ts`, `tax.ts`

---

## 12. Commands / Setup

```bash
npm run dev      # dev server on :3000
npm run build    # production build (615 static pages)
npm run lint     # eslint, must be clean
npm run test     # node --test with the alias loader (172 tests)
npm run i18n     # dictionary coverage report
npm run check    # lint + tsc + test + i18n
npx tsc --noEmit # type-check
```

**Environment variables (names only):** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADSENSE_CLIENT`.

**No database, no migrations, no deployment pipeline yet.**

**Browser preview:** `.claude/launch.json` defines `calculator-dev`; use `preview_start` with that name.

---

## 13. How To Continue

Open the new session in `D:\Calculator` and:

1. **Orient** — this file, then `src/config/categories.ts`, `src/lib/routes.ts`, `src/lib/content.ts`. For calculators: `src/config/calculators/types.ts` (note `countryRelevance`, `decimals`, the `text` field kind).
2. **Verify green:** `npm run check` then `npm run build`. Expect lint clean, tsc clean, **881 tests**, "Every statically referenced key is defined in English", **710 static pages**. Working tree should be clean at `a19a94b` or later.
3. **Ask the user** for the `OPERATOR` details and whether to push to GitHub — both are theirs to provide.
4. **Then** pick up §9 "Short term": pluralisation first, then translation.

**Adding a calculator** is: pure logic in `src/lib/<area>/` with a test, a definition in `src/config/calculators/definitions/`, set `countryRelevance` honestly, register in `index.ts`, add English copy via a `scripts/add-*-keys.mjs` script. `tests/calculators.test.ts` will then run it in every country across its select/toggle answers and fail on any missing key, NaN, negative chart slice or out-of-range default.

**Shell gotcha:** Bash heredocs and `node -e` in this environment mangle backticks and `${}`. Use the Write/Edit tools or a script file in the scratchpad for anything containing template literals.

**Before changing anything, read §7 (Decisions Already Made).** Several choices that look arbitrary — manual currency composition, the 75% readiness gate, the `isCountrySpecific` URL split — exist because the obvious alternative produced a real bug or a real SEO problem.

**Two things must not be quietly treated as done:** the statutory tax figures are unverified (`docs/tax-rules-to-verify.md`), and seven languages are gated off rather than broken. Neither is a bug; both are open work.
