# PROJECT_STATE.md

> Source of truth for continuing this project in a new Claude session.
> Last updated: 2026-09-21. Working directory: `D:\Calculator`.

---

## 1. Project Overview

| | |
|---|---|
| **Name** | House of Calculators |
| **Positioning** | "Every Calculation. One Global Home." |
| **Purpose** | Global, multilingual, mobile-first platform for calculators, converters, tools, reference tables, guides and country-specific utilities |
| **Target users** | Anyone searching for a calculation ("mortgage payment", "meters to feet", "UK stamp duty"), across 16 locales and 22 countries |
| **Monetization** | Organic search traffic → Google AdSense (slots built in, no publisher id configured yet) |
| **Status** | Six product pillars implemented and building. 615 static pages generated. English complete; 7 other languages at ~29–33% coverage and therefore **gated off**. Statutory tax figures **unverified**. |

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
│   └── tools/               ToolRunner, ToolShell, DateTools, NumberTools, UtilityTools
├── config/
│   ├── locales.ts           16 locales
│   ├── languages.ts         14 languages
│   ├── countries.ts         22 countries
│   ├── categories.ts        sections + per-section category vocabularies
│   ├── calculators/         types.ts, scale.ts, index.ts (registry), definitions/*
│   ├── converters/          units.ts (engine), definitions.ts (13 converters)
│   ├── tools/definitions.ts 14 tools (metadata only)
│   ├── charts/definitions.ts 19 tables (each has a `build(ctx)` generator)
│   └── guides/definitions.ts 12 guides (structured, not free prose)
├── lib/
│   ├── i18n/                index.ts + dictionaries/*.json
│   ├── finance/             index.ts (pure maths), tax/{define,rules,slabs,index}.ts
│   ├── tools/               dates.ts, numbers.ts, planning.ts
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
| Calculators | 27 (19 country-specific, 8 generic) |
| Converters | 13 categories, 61 featured pair pages |
| Tools | 14 |
| Charts/tables | 19 |
| Guides | 12 |
| Locales | 16 (12 launch + 4 extra) |
| Countries | 22 |
| Static pages built | 615 |

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

**Most recent work: adding the test suite (spec §53, §67).**

Completed:
- `tests/finance.test.ts` — 25 tests: EMI known values, zero-rate, single-period, schedule reconciliation, compounding, SIP/step-up, SWP, CAGR edge cases.
- `tests/tax.test.ts` — per-country invariants (monotonic, never exceeds gross, parts sum to total, non-negative taxable income) plus known figures for IN/US/GB/AE/DE/AU.
- `tests/alias-hooks.mjs` + `tests/register-alias.mjs` — ESM loader resolving `@/` aliases, extensionless imports and JSON import attributes. **Working**; the directory-vs-file bug was fixed.
- `tests/package.json` with `{"type":"module"}` to scope the ESM warning.
- npm scripts `test` and `check`.

**Status: 172 tests, 172 passing, 0 failing.**

Still pending for this task (spec §53/§67 asks for more coverage):
- Converter tests (exact factor definitions, temperature offsets, fuel-economy reciprocal, round-trips).
- Tool tests (dates across DST-free UTC, month clamping, ISO week edges, Roman round-trip, primes, fractions).
- i18n integrity test — **high value**: assert every language's placeholders (`{count}`, `{country}`…) match English. Mismatched placeholders are a real, silent bug class.
- hreflang bidirectionality test (spec §22).
- Search scoring tests.
- Component/E2E tests (spec §67) — not started.

**Uncommitted work:** guides pillar, tests, `scripts/add-guide-keys.mjs`, modifications to `src/lib/content.ts`, `src/app/sitemap.ts`, `src/lib/i18n/dictionaries/en.json`, `package.json`.

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

---

## 8. Known Issues / Bugs

| # | Problem | Status | Tried / Next step |
|---|---|---|---|
| 1 | **7 languages gated off** (ar/de/es/fr/gu/hi/mr at 29–33%). Only `en-US` and `en-GB` currently build | Known, by design of the gate | English grew from 477 → 1256 keys across the re-architecture. Next step: translate the ~850 new keys per language. Order by market: de, fr, es, then hi/gu/mr/ar |
| 2 | **6 locales have no dictionary at all**: nl, ja, it, pt, pl, tr (+ new ru, zh) | Not started | Add file + import into `RAW` in `src/lib/i18n/index.ts`; the gate switches them on automatically |
| 3 | **All statutory tax figures unverified** | Documented, not fixed | `docs/tax-rules-to-verify.md` lists every number. Must be checked before launch |
| 4 | Known model gaps: CH (no cantonal tax), US/CA (no state/provincial), DE (contributions not deducted as Vorsorgeaufwendungen), FR (no quotient familial), BR (ICMS modelled as single VAT) | Each stated in the page's own note | Same doc |
| 5 | Legal pages (`/privacy`, `/terms`, `/cookies`, `/contact`, `/about`) **linked in the footer but do not exist → 404** | Not started | Spec §35 requires them before AdSense |
| 6 | No cookie-consent implementation | Not started | Required for EU traffic with ads (spec §35) |
| 7 | AdSense not configured | By design | Set `NEXT_PUBLIC_ADSENSE_CLIENT`; slots render nothing until then |
| 8 | Guide category page derived from the charts page via `sed` | Works, verified | Worth a read-through for leftover chart naming |
| 9 | No `favicon`/OG image beyond the scaffold default | Not started | |
| 10 | `MODULE_TYPELESS_PACKAGE_JSON` warnings when running tests | Cosmetic | Scoped `tests/package.json` already added; warnings come from `src/` files |
| 11 | No CI pipeline (spec §66) | Not started | `npm run check` exists as the local equivalent |
| 12 | **`npx tsc --noEmit` reports 3 errors — in the test files only** (`TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled`). Node's native runner *requires* those extensions. `src/` itself type-checks clean, and `npm run build` succeeds | Open, introduced with the test suite | Fix is one of: add `"allowImportingTsExtensions": true` to `tsconfig.json` (valid because `noEmit` is already set), or add `"tests"` to `exclude`. **Prefer the first** — excluding the tests means they stop being type-checked at all. Do this before the next `npm run check` |

---

## 9. Next Steps

### Immediate next task
1. **Commit the guides pillar + tests** (currently uncommitted).
2. **Finish the test suite**: converters, tools, i18n placeholder integrity, hreflang bidirectionality.

### Short term
3. **Legal pages** — privacy, terms, cookies, contact, about (unblocks the footer 404s and AdSense review).
4. **Translate the new keys for de, fr, es** (restores 3 locales).
5. Then hi, gu, mr, ar (restores India/UAE).
6. Cookie-consent component.

### Later
7. New locale dictionaries: nl, ja, it, pt, pl, tr, ru, zh.
8. Verify statutory tax figures against `docs/tax-rules-to-verify.md`.
9. Currency converter (spec §12 — needs a live rate source with timestamps; **never hard-code rates**).
10. Remaining calculator categories the spec lists but that aren't built: math, health, education, engineering, construction.
11. CI pipeline; GA4 + Search Console; performance budgets.

### Optional
12. Component/E2E tests; theme toggle; PostgreSQL + admin CMS (spec §47/§77) once content outgrows config files.

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

Open the new session in `D:\Calculator` and do this, in order:

1. **Orient** — skim `PROJECT_STATE.md` (this file), then `src/config/categories.ts`, `src/lib/routes.ts` and `src/lib/content.ts`. Those three explain the whole information architecture.
2. **Fix known issue #12 first** — one line in `tsconfig.json`:
   ```jsonc
   "allowImportingTsExtensions": true   // valid because noEmit is already set
   ```
   Without it `npm run check` fails on the test files, even though `src/` and the production build are clean.
3. **Then verify the build is green:**
   ```bash
   npm run check
   ```
   Expect after the fix: lint clean, tsc clean, 172 tests passing, "Every statically referenced key is defined in English." `npm run build` should produce 615 static pages.
4. **Commit the outstanding work** — the guides pillar and the test suite are implemented and passing but uncommitted. Check `git status` first.
5. **Then pick up the immediate next task**: finish the test suite (converters, tools, **i18n placeholder integrity**, hreflang bidirectionality). The i18n placeholder test is the highest-value one — mismatched `{placeholders}` between English and a translation are silent and user-visible.
6. **After that**, the legal pages, since the footer currently links to five 404s and AdSense review will require them.

**Before changing anything, read §7 (Decisions Already Made).** Several choices that look arbitrary — manual currency composition, the 75% readiness gate, the `isCountrySpecific` URL split — exist because the obvious alternative produced a real bug or a real SEO problem.

**Two things must not be quietly treated as done:** the statutory tax figures are unverified (`docs/tax-rules-to-verify.md`), and seven languages are gated off rather than broken. Neither is a bug; both are open work.
