# PROJECT_STATE.md

> Source of truth for continuing this project in a new Claude session.
> Last updated: 2026-09-24 (end of session 5, commit `2c08073`). Working directory: `D:\Calculator`.
>
> **State at hand-off:** clean working tree, clean production build (710/710 pages), lint + tsc clean, 912/912 tests, no console errors or server warnings.
>
> **Done vs pending against the spec, section by section: see [§14 Spec Compliance Tracker](#14-spec-compliance-tracker).**

---

## 1. Project Overview

| | |
|---|---|
| **Name** | House of Calculators |
| **Positioning** | "Every Calculation. One Global Home." |
| **Purpose** | Global, multilingual, mobile-first platform for calculators, converters, tools, reference tables, guides and country-specific utilities |
| **Target users** | Anyone searching for a calculation ("mortgage payment", "meters to feet", "UK stamp duty"), across 16 locales and 22 countries |
| **Monetization** | Organic search traffic → Google AdSense (slots built in, no publisher id configured yet) |
| **Status** | Six product pillars, legal pages, cookie consent and CI implemented and building. Every calculator and tool category in the spec has content. 710 static pages. 912 tests passing. **Whole site redesigned after the user's landing-page comp** (see §6), with scroll animations, light and dark themes, and a phone layout checked at 390px. English complete; 7 other languages at 17–19% coverage and therefore **gated off**. Statutory tax figures **unverified**. Operator details (entity, email, jurisdiction) **unset**. |

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
| Fonts | **Plus Jakarta Sans** (next/font, self-hosted, Latin only) + Caveat for one hero line | Other scripts fall back to the system stack. Replaced "no webfont" at the user's direction for the redesign |
| Icons | **lucide-react** | Rendered in pastel tiles via `components/shared/Icon.tsx`; names mapped in `lib/visuals.ts` |
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
│   ├── globals.css          design tokens, @layer base/components, animations, reveal CSS
│   ├── icon.svg             favicon/link-icon (logo mark)
│   ├── opengraph-image.tsx  generated 1200x630 share card
│   ├── sitemap.ts           one sitemap, per-entry hreflang alternates
│   └── robots.ts
├── components/
│   ├── ads/                 AdSlot, AdScript
│   ├── calculator/          CalculatorRunner, CalculatorPageBody, FieldControl,
│   │                        BreakdownPanel, ResultActions, CalculatorGrid
│   ├── charts/              DonutChart, ReferenceTable
│   ├── converter/           ConverterRunner
│   ├── home/                HeroArt, DeviceMockup, GuideArt (drawn in markup, no images)
│   ├── layout/              SiteHeader, SiteFooter, Breadcrumbs, Logo
│   ├── motion/              RevealObserver (scroll reveals), CountUp
│   ├── navigation/          LocaleSelector, CountrySelector, WelcomeDialog
│   ├── search/              SearchBox
│   ├── shared/              ContentCard, CardGrid, SectionHeading, ViewAllLink, PageHeader,
│   │                        Icon + IconTile, CountryBadge (round flags), Dropdown
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
│   ├── visuals.ts           icon + colour for every section/category/item
│   ├── calculator-copy.ts   calculator title/description with country params filled
│   ├── ads.ts               ADS_ENABLED flag for server layouts
│   ├── format.ts            currency/number formatting per country+language
│   ├── locale-context.tsx   client LocaleProvider + useLocale
│   ├── preferences.ts       cookie read/write
│   ├── routes.ts            every URL builder
│   ├── seo.ts               buildMetadata, JSON-LD helpers, readiness gate
│   ├── content.ts           unified content index (search + grids + sitemap)
│   └── search.ts            typo-tolerant scoring
├── proxy.ts                 locale routing (NOT middleware.ts)
public/                      favicon.ico (must stay here, see §7), flags/*.svg (22, MIT)
scripts/                     i18n-coverage.mjs + add-*-keys.mjs dictionary-seeding scripts
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

### Session part 3 — remaining pillars (commits `464cc0e`, `1c6c967`, `0c4953a`)
- **Tools pillar**: 14 tools; UTC date arithmetic; month-clamping; ISO weeks; Roman numeral round-trip validation; CSPRNG with rejection sampling; debt planner that reports non-clearing payments.
- **Charts pillar**: 19 reference tables generated from live data, server-rendered, bidirectional links to tools.
- **Guides pillar**: 12 structured guides with formula → variables → steps → worked example → calculator → FAQ; `Article` JSON-LD; honest `reviewed` dates. Worked-example figures verified against the shipped implementations.
- **Tests**: 172 passing across finance and tax.

### Session 4 — tests, bugs, legal (commits `0c4953a` → `c5b429e`)
- Test suite finished: converters, tools, i18n integrity, hreflang (172 → 487, then 509 with the legal pages). Five real bugs found and fixed.
- Legal pages (privacy, terms, cookies, contact, about) written from the site's real behaviour.
- Brand set to "House of Calculators" in every language.

### Session 5 — spec completion, redesign, rebuild (commits `38ae10f` → `2c08073`)
- Spec audit → 33 new calculators (all 8 categories populated), 9 new tools, cookie consent, CI, icon + share card.
- Spec compliance tracker (§14) written against the spec.
- **Full-site redesign** after the user's landing-page comp: new design system, animations, every page.
- Clean rebuild and re-run: real `favicon.ico`, route-change scrolling fixed.
- Tests 509 → 912. Details of all of it in §6.

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
| `src/app/globals.css` | The design system: tokens, tone families, `.card`, buttons, animations, reveal rules. Base/components are **layered** |
| `src/lib/visuals.ts` | Icon name + tone for every section, category and item |
| `src/components/shared/PageHeader.tsx` | Heading used by all 18 inner pages |
| `src/components/motion/RevealObserver.tsx` | The one observer behind every `data-reveal` |
| `src/lib/calculator-copy.ts` | Always use this to list a calculator's title — it fills country params |

### Routes (all implemented)
All 23 route files listed in §3. Every page defines its own `generateMetadata` (important: without it a page would inherit the locale home's canonical).

### Configuration worth knowing
- `READINESS_THRESHOLD = 0.75` in `src/lib/i18n/index.ts`.
- `RAW` in the same file maps language → dictionary. **A language without an entry there is simply not translated yet** — no stub file needed.
- Digits pinned to Latin everywhere via `-u-nu-latn` in `intlLocale()`.
- Currency is composed manually (symbol + locale-grouped number) rather than `style:"currency"`, to preserve Indian lakh grouping.

---

## 6. Current Task

**Session 4: the test suite was finished (spec §53, §67) at 487 tests. It is now 912 — see the session 5 blocks below.**

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

### Then: the full-site redesign (session 5, commit `c5fed9d`)

The user supplied a landing-page comp and asked for the whole site to follow it, with modern, professional animation and scroll-triggered fade-ins. Done:

| Area | What changed |
|---|---|
| Tokens (`globals.css`) | Comp palette, ten pastel `tone-*` families, `.card`, `.card-link`, `.btn-primary`, `.btn-secondary`, `.page-wash` (blue wash + dot grid behind every page top). Dark mode retained with a navy variant |
| Motion | `data-reveal` (up/left/right/scale/fade/stagger) driven by `components/motion/RevealObserver.tsx`; `CountUp`; floating hero art; card lifts; FAQ accordions; value flash. All off under reduced motion |
| Header / footer | Navy strip, SVG logo (`layout/Logo.tsx`), underline nav, search dialog (`/`, Ctrl+K, arrow keys); navy five-column footer |
| Homepage | Rebuilt after the comp: hero + art, stats, categories, popular, more ways, why choose + device mockup, countries with flags, guides, CTA. `components/home/*` |
| Inner pages | All 18 use `shared/PageHeader.tsx`; cards take `visual`; calculator/converter/tool/guide/breakdown restyled |
| Tests | `tests/content.test.ts` (31) |

**Adapted from the comp, deliberately:** no fabricated figures (counts computed), no newsletter form, no social icons, no stock photos (illustrated thumbnails), no placeholder ad boxes (`AdSlot` still renders nothing without a publisher id), "Blog" → the existing Guides section, "Used Worldwide" → "Built for Every Country" (the site is not launched).

**Bugs fixed during the redesign:** unlayered CSS overriding utilities (footer headings invisible); "{tax} Calculator" leaking into country pages, search and the footer (now `lib/calculator-copy.ts`); mobile horizontal overflow; language pill wrapping on phones.

**Screenshot tool** used for review, reusable: a CDP script that sets cookies, forces light/dark, scrolls to fire reveals, and captures viewport slices with local Chrome. Kept in the session scratchpad only; recreate if needed (Node 24 has WebSocket built in, so nothing to install).

### Then: clean rebuild and re-run (session 5, commit `2c08073`)

The user asked for a rebuild and re-run. Done from scratch (`.next` deleted, dev server restarted); every route smoke-tested (pages 200, unknown page 404, favicon, icon, share card, sitemap, robots). Two issues surfaced and were fixed:

| Issue | Fix |
|---|---|
| `/favicon.ico` 404 on every page load (redesign had removed the scaffold favicon; browsers still request it) | Real ICO (16/32/48 px, PNG-encoded) rendered from the logo, in **`public/favicon.ico`** |
| Next 16 warning: `scroll-behavior: smooth` on `<html>` — every route change glided up from where you were | `data-scroll-behavior="smooth"` on `<html>` in the locale layout |

**Gotcha found while fixing the first:** with `favicon.ico` in `src/app/`, this project's Turbopack production build fails with a misleading *"next/font/google queries have exactly one entry"* error. Proven by bisecting a clean build with and without the file. It stays in `public/` (recorded in §7).

**How to do a clean rebuild:** stop the dev server → `rm -rf .next` → `npm run build` → `preview_start calculator-dev`. Stale "WebSocket …/_next/hmr failed" console errors after a restart come from the old server session; check in a fresh tab.

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
| `CountryBadge` renders **round flag SVGs** from `public/flags` (flag-icons, MIT), never flag emoji | Windows has no regional-indicator glyphs; emoji rendered as bare letters | |
| **Design follows the user's landing-page comp** for every page | User's direction (session 5) | Colours, type, cards, icons and motion come from it; content must stay truthful (see below) |
| Comp claims are replaced with real, computed figures | The comp said "1,000+ calculators", "10+ languages", "millions of users" — none true. Counts are computed from the registries | Never hard-code marketing numbers |
| No newsletter field, no social icons in the footer | The privacy policy says there are no forms; there are no social accounts | Adding either means updating the privacy page first |
| Base CSS in `@layer base`, component classes in `@layer components` | Unlayered CSS beats Tailwind utilities; `text-white` on headings was being ignored | Never add unlayered element rules |
| Scroll reveal via `data-reveal` attributes + one `RevealObserver` | Pages stay server components; content hidden only after an inline script sets `html.js` | The LCP heading uses `animate-rise` (no fade) |
| **`favicon.ico` lives in `public/`, not `src/app/`** | In `src/app/` it breaks the Turbopack production build of this project with a misleading `next/font/google queries have exactly one entry` error. Found by bisecting | Don't move it back; `<link rel=icon>` comes from `src/app/icon.svg` |
| Every icon/colour comes from `lib/visuals.ts`; items keep their category colour | One family per category, as in the comp | Add new slugs to `ITEM_ICONS` |
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
| `<html data-scroll-behavior="smooth">` stays with the smooth-scroll CSS | Without it Next 16 animates every route change's scroll-to-top | Remove both together or neither |
| Client state from cookies/clock via `useSyncExternalStore`, not `setState` in an effect | Keeps pages static and satisfies the React compiler lint rule `react-hooks/set-state-in-effect` | |

---

## 8. Known Issues / Bugs

| # | Problem | Status | Tried / Next step |
|---|---|---|---|
| 1 | **7 languages gated off** (ar/de/es/fr/gu/hi/mr now at 17–19%). Only `en-US` and `en-GB` currently build | Known, by design of the gate | English is now **2,205 keys** (was 1,256 before session 5). ~1,780 keys to translate per language to reach the 75% gate. Order by market: de, fr, es, then hi/gu/mr/ar |
| 2 | **6 locales have no dictionary at all**: nl, ja, it, pt, pl, tr (+ new ru, zh) | Not started | Add file + import into `RAW` in `src/lib/i18n/index.ts`; the gate switches them on automatically |
| 3 | **All statutory tax figures unverified** | Documented, not fixed | `docs/tax-rules-to-verify.md` lists every number. Must be checked before launch |
| 4 | Known model gaps: CH (no cantonal tax), US/CA (no state/provincial), DE (contributions not deducted as Vorsorgeaufwendungen), FR (no quotient familial), BR (ICMS modelled as single VAT) | Each stated in the page's own note | Same doc |
| 5 | ~~Legal pages linked in the footer but do not exist → 404~~ | **Fixed** (`94c5488`) | All five built and in the sitemap. See issue 15 for the one thing left on them |
| 6 | ~~No cookie-consent implementation~~ | **Fixed** (`5b28c42`) | Consent Mode v2 + banner, active only when a publisher id is set. Re-check Google's current CMP requirements for EEA/UK before launch — Google may require a certified CMP rather than a custom banner for personalised ads there |
| 7 | AdSense not configured | By design | Set `NEXT_PUBLIC_ADSENSE_CLIENT`; slots render nothing until then |
| 8 | Guide category page derived from the charts page via `sed` | Works, verified | Worth a read-through for leftover chart naming |
| 9 | ~~No favicon/OG image beyond the scaffold default~~ | **Fixed** (`5b28c42`, `2c08073`) | `src/app/icon.svg`, generated `src/app/opengraph-image.tsx`, and `public/favicon.ico`. No `apple-icon` PNG yet |
| 10 | `MODULE_TYPELESS_PACKAGE_JSON` warnings when running tests | Cosmetic | Scoped `tests/package.json` already added; warnings come from `src/` files |
| 11 | ~~No CI pipeline~~ | **Fixed** (`5b28c42`) | `.github/workflows/ci.yml`: lint, types, tests, i18n, build as separate jobs on Node 24. **Not yet run on GitHub** — no remote push has happened this session |
| 12 | ~~`npx tsc --noEmit` failed on the test files (`TS5097`)~~ | **Fixed** (`0c4953a`) | `"allowImportingTsExtensions": true` added to `tsconfig.json`, valid because `noEmit` is already set. The tests stay type-checked |
| 13 | ~~`app.name` was still the pre-rebrand brand in all 7 translated dictionaries~~ | **Fixed** (`94c5488`) | Set to `House of Calculators` in every language. Decided: one brand in Latin script everywhere, so it stays searchable and matches the domain |
| 15 | **`OPERATOR` details are unset** — entity, contact email and governing-law jurisdiction are all `null` in `src/config/legal/definitions.ts` | Open, **blocks launch and AdSense review** | Every legal page shows a "not ready to publish" notice until they are filled in. This is a one-object edit; the notice disappears on its own |
| 16 | Health pages carry disclaimers in notes/explainers but no dedicated medical-disclaimer block | Open, low | Spec §2.1 asks for "appropriate disclaimers"; current wording is careful but worth a review before launch |
| 17 | **Every page ships all 8 language dictionaries to the browser** — one client chunk of ~383 KB (~109 KB gzipped) containing de/fr/es/hi/gu/mr/ar alongside English, referenced by every built page including the home page. Violates spec §29 and §64 | Open, **highest-value performance fix** | Cause: client modules import `@/lib/i18n` (`locale-context.tsx` imports `translate`; `format.ts` imports `getDictionary`), and that module statically imports every JSON file. Fix: keep dictionary loading server-side and pass only the active dictionary (already done via `LocaleProvider`'s `dictionary` prop), and make the client-reachable helpers dictionary-free — e.g. split `translate` and the formatter's unit lookup into a module with no JSON imports |
| 18 | **Share links do not restore inputs** — "Copy link" in `ResultActions.tsx` writes every input into the query string, but `CalculatorRunner` never reads `searchParams`, so the recipient sees the defaults | Open, user-visible bug (spec §55) | Read the query on mount (client-only, pages stay static), validate each value against the field's kind and range, and ignore unknown keys. Keep these URLs out of the index — canonical already points to the clean URL |
| 19 | `src/components/calculator/CalculatorGrid.tsx` is not imported anywhere | Open, low | Dead code from an earlier layout; not restyled in the redesign. Delete it or put it back into use |
| 20 | `README.md` still describes the pre-rebrand "Calcora" project | Open, low | Rewrite from §1–§3 of this file |
| 14 | **No pluralisation**: the date tools render "0 years, 1 months and 1 days" | Open, cosmetic but visible on every date result | Needs plural-aware keys. English alone would be a patch; doing it per language is the real fix, since plural rules differ (Arabic has six forms). Consider `Intl.PluralRules` keyed as `key.one` / `key.other` with the existing English fallback |

---

## 9. Next Steps

### Blocking launch — needs the user
1. **Fill in `OPERATOR`** (issue 15) in `src/config/legal/definitions.ts` — entity, contact email, governing-law jurisdiction. Every legal page shows a "not ready to publish" notice until then.
2. **Push to GitHub** so the CI workflow actually runs once (issue 11).
3. **Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_ADSENSE_CLIENT`** in the deployment environment; choose hosting (spec §9).
4. **Verify statutory tax figures** against `docs/tax-rules-to-verify.md` (issue 3).

### Short term — code
4a. **Fix issue 17** — stop shipping every dictionary to the browser.
4b. **Fix issue 18** — make shared links restore their inputs.
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
- ~~No webfont~~ — reversed in session 5 at the user's request: Plus Jakarta Sans for Latin via next/font, system faces for other scripts.

**Technical constraints discovered the hard way**
- Bash heredocs in this environment mangle backticks and `${}` — use the `Write` tool or Node scripts for anything with template literals.
- Next 16: `params` are Promises; `middleware.ts` is deprecated in favour of `proxy.ts`; the root layout can live at `app/[locale]/layout.tsx` with no `app/layout.tsx`.
- Passing a calculator definition from a server component to a client one fails — definitions contain functions. Pass the slug and look it up client-side.
- Reading cookies via `cookies()` in a layout makes every page dynamic; `useSyncExternalStore` keeps them static.
- Tailwind v4 utilities live in `@layer utilities`; any **unlayered** CSS beats them regardless of specificity. Put element rules in `@layer base`.
- `favicon.ico` in `src/app/` breaks the Turbopack build with a misleading Google-fonts error; keep it in `public/`.
- `proxy.ts` `config.matcher` must be an inline string literal (statically analysed).
- Headless Chrome's `captureBeyondViewport` drops some composited layers; for screenshots, scroll and capture one viewport at a time.
- The React compiler lint rule `react-hooks/set-state-in-effect` rejects synchronous `setState` inside effects — read external state (cookies, scroll, clock) with `useSyncExternalStore`.

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
| `tests/{converters,tools,i18n,hreflang,legal}.test.ts` | Session 4 tests. Session 5 added `{health,maths,business,calculators,consent,random-tools,content}.test.ts` — **912 tests total** |
| `src/lib/{health,maths,business,construction}/index.ts` | Pure logic for the 33 generic calculators (session 5) |
| `src/config/calculators/definitions/{health,maths,business,education,construction}.ts` | Their definitions |
| `src/components/{home,motion}/*`, `shared/{Icon,PageHeader}.tsx`, `layout/Logo.tsx`, `consent/*` | Redesign and consent components (session 5) |
| `src/lib/{visuals,ads,calculator-copy}.ts`, `src/lib/tools/random.ts` | Visual map, ads flag, calculator copy, shared CSPRNG (session 5) |
| `public/favicon.ico`, `public/flags/*` | Favicon and 22 round flags (session 5) |
| `.github/workflows/ci.yml` | CI (session 5, never run yet) |
| `docs/tax-rules-to-verify.md` | Every statutory figure needing verification |
| `.gitattributes` | LF normalisation |

### Modified
| Path | Change |
|---|---|
| `src/app/globals.css` | Rewritten again in session 5 to the landing-page comp's design system |
| `src/config/{countries,languages}.ts` | 22 countries, 14 languages; readiness filtering |
| `src/config/calculators/**` | Spec categories, `version`, `isCountrySpecific` |
| `src/lib/i18n/index.ts` | Partial `RAW`, readiness gate, `countryParams`, `unitName`, `hasOwnKey` |
| `src/lib/format.ts` | Manual currency composition; Latin digits |
| `src/lib/locale-context.tsx` | Rewritten for locale/country split |
| `src/lib/i18n/dictionaries/*.json` | English **2,205** keys; 7 others migrated to shared vocabulary (17–19% coverage) |
| `README.md` | Rewritten (describes the pre-rebrand "Calcora" scope — **stale, needs updating**) |
| `package.json` | Renamed; added `i18n`, `test`, `check` scripts |

### Deleted / renamed
- `src/app/[country]/[lang]/**` → replaced by `src/app/[locale]/**`
- `src/middleware.ts` → `src/proxy.ts`
- `src/components/{LocaleDialog,LocaleGate,SiteHeader,SiteFooter}.tsx` → replaced under `layout/` and `navigation/`
- `src/components/ui/*` → moved to `calculator/`, `charts/`, `shared/`
- `src/lib/finance/tax/income-tax.ts` → split into `define.ts` + `rules.ts`
- `src/config/calculators/definitions/{emi,consumption-tax,income-tax}.ts` → merged into `loans.ts`, `tax.ts`
- `src/app/favicon.ico` (Next scaffold) and `public/{file,globe,next,vercel,window}.svg` → removed; new favicon lives in `public/`

---

## 12. Commands / Setup

```bash
npm run dev      # dev server on :3000
npm run build    # production build (710 static pages)
npm run lint     # eslint, must be clean
npm run test     # node --test with the alias loader (912 tests)
npm run i18n     # dictionary coverage report
npm run check    # lint + tsc + test + i18n
npx tsc --noEmit # type-check

# clean rebuild (stop the dev server first)
rm -rf .next && npm run build
```

**Environment variables (names only):** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADSENSE_CLIENT`.

**No database, no migrations, no deployment pipeline yet.**

**Browser preview:** `.claude/launch.json` defines `calculator-dev`; use `preview_start` with that name.

---

## 13. How To Continue

Open the new session in `D:\Calculator` and:

1. **Orient** — this file, then `src/config/categories.ts`, `src/lib/routes.ts`, `src/lib/content.ts`. For calculators: `src/config/calculators/types.ts` (note `countryRelevance`, `decimals`, the `text` field kind).
2. **Verify green:** `npm run check` then `npm run build`. Expect lint clean, tsc clean, **912 tests**, "Every statically referenced key is defined in English", **710 static pages**. Working tree should be clean at `2c08073` or later. For any UI work, read §6's redesign block and the design rows in §7 first.
3. **Ask the user** for the `OPERATOR` details and whether to push to GitHub — both are theirs to provide.
4. **Then** pick up §9 "Short term": pluralisation first, then translation.

**Adding a calculator** is: pure logic in `src/lib/<area>/` with a test, a definition in `src/config/calculators/definitions/`, set `countryRelevance` honestly, register in `index.ts`, add English copy via a `scripts/add-*-keys.mjs` script. `tests/calculators.test.ts` will then run it in every country across its select/toggle answers and fail on any missing key, NaN, negative chart slice or out-of-range default.

**Shell gotcha:** Bash heredocs and `node -e` in this environment mangle backticks and `${}`. Use the Write/Edit tools or a script file in the scratchpad for anything containing template literals.

**Before changing anything, read §7 (Decisions Already Made).** Several choices that look arbitrary — manual currency composition, the 75% readiness gate, the `isCountrySpecific` URL split — exist because the obvious alternative produced a real bug or a real SEO problem.

**Two things must not be quietly treated as done:** the statutory tax figures are unverified (`docs/tax-rules-to-verify.md`), and seven languages are gated off rather than broken. Neither is a bug; both are open work.

---

## 14. Spec Compliance Tracker

> Every section of `HouseOfCalculators_Project_Specification.md` (85 sections), checked against the actual code on **2026-09-24**; first written at `e325164`, re-checked after the redesign at `2c08073`. Statuses were verified by reading code, running the build and checking the running app — not copied from earlier notes.

**Legend:** ✅ Done · 🟡 Partial · ❌ Pending · ⏸ Deliberately deferred (reason given) · 👤 Needs the user · ↔ Deliberate deviation from spec (see §7)

### 14.1 Summary

| Area | Status | Headline |
|---|---|---|
| Product pillars (§1) | ✅ | All six pillars live |
| Calculators (§2.1) | 🟡 | 60 built, every category populated. ~14 listed items missing (compound/simple interest, scientific, probability, commission, brick…) |
| Converters (§3) | 🟡 | 13 of 16 categories. Currency, time zone, frequency missing |
| Tools (§4) | 🟡 | 23 built. World clock, meeting planner, study planner, even/odd missing |
| Charts & tables (§5) | 🟡 | 19 built. Shoe/clothing sizes, time-zone and calendar references missing |
| Guides (§6) | 🟡 | 12 built. CAGR, BMI, profit-margin, EMI "what is", time-zone guides missing |
| Country tools (§7) | ✅ | 22 countries, covering all 12 spec markets |
| Locales (§8) | 🟡 | 16 locales defined; **only en-US and en-GB ship**. 7 languages at 17–19%, 8 not started |
| Engines (§11–13) | ✅ | Calculator, converter, country config all configuration-driven |
| SEO (§19–28) | ✅ | Metadata, canonical, hreflang, sitemap, JSON-LD all tested. Validation in Google tools needs a deployment |
| Performance (§29, §64) | ❌ | **Not measured, and every page ships all 8 dictionaries** (issue 17) |
| Ads (§31–34) | 🟡 | Slots built and compliant; no publisher id (👤) |
| Legal & consent (§35) | 🟡 | All pages + consent built; operator details unset (👤) |
| Analytics (§36–37) | ❌ | Not started |
| Search (§38) | ✅ | Grouped, typo-tolerant, keyboard navigable, opens with / or Ctrl+K |
| Design, responsive, motion (§16–18, §59–61) | ✅ | Redesigned after the user's comp; scroll reveals; reduced-motion honoured; checked at 1440/390px, light and dark |
| Accessibility (§42) | 🟡 | Built in; no formal audit |
| Security (§43) | ❌ | No security headers or CSP configured |
| Testing (§53, §67) | 🟡 | 912 unit tests; no component or E2E tests |
| CI/CD (§66) | 🟡 | Workflow written, never run; no preview deploys |
| Database / CMS (§47, §77) | ⏸ | Config files are sufficient at current scale |
| Launch checklist (§68) | 🟡 | See 14.9 |

### 14.2 Product scope — calculators (§2.1)

Where a spec item is covered by a tool or a broader calculator, that is noted rather than built twice (spec §40 — one URL per intent).

| Spec item | Status | Where / notes |
|---|---|---|
| **Finance** | | |
| EMI Calculator | ✅ | `loan` (EMI + amortisation, monthly/yearly/full-term breakdown) |
| Loan Calculator | ✅ | `loan`, `auto-loan`, `student-loan` |
| Mortgage Calculator | ✅ | `mortgage` |
| SIP Calculator | ✅ | `sip` (with step-up) |
| Compound Interest Calculator | ❌ | Logic exists (`compoundFutureValue` in `lib/finance`); guide + chart exist; **no calculator page** |
| Simple Interest Calculator | ❌ | Logic exists (`simpleInterest`); **no calculator page** |
| CAGR Calculator | 🟡 | Inside `growth-rate` (business). No standalone finance page |
| ROI Calculator | ✅ | `roi` (with annualised return) |
| Profit Margin / Markup / Break-Even | ✅ | `profit-margin`, `markup`, `break-even` |
| Savings Goal / Debt Payoff | ✅ | Tools `savings-goal`, `debt-payoff` |
| Retirement Calculator | ✅ | `retirement`, `pension`, `401k`, `superannuation` |
| Inflation Calculator | ✅ | `inflation` |
| Tip / Discount | ✅ | `tip`, `discount` |
| Salary / Take-home | ✅ | `salary`, `income-tax`, `payroll` + country tools |
| **Math** | | |
| Percentage | ✅ | Tool `percentage` |
| Fraction Calculator | 🟡 | Tool `fraction-simplifier` simplifies only; **no fraction arithmetic** (+ − × ÷) |
| Average / Statistics | ✅ | `statistics` (mean, median, mode, SD, variance) |
| Ratio / Proportion | ✅ | `ratio` (simplify + scale a:b = c:x) |
| Scientific Calculator | ❌ | Not built |
| Exponent / Square Root | ✅ | `exponent` (power, nth root, square root, log) |
| GCD / HCF / LCM | ✅ | Tool `factor-finder` |
| Probability Calculator | ❌ | Not built |
| Pythagorean | ✅ | `triangle` |
| Quadratic Equation | ✅ | `quadratic-equation` (incl. complex roots, vertex) |
| Area / Perimeter / Volume | ✅ | `area`, `volume` |
| **Health & Fitness** | | |
| BMI / BMR / TDEE / Calorie needs | ✅ | `bmi`, `bmr`, `tdee` (TDEE includes goal calories) |
| Macro Calculator | 🟡 | Macro split shown inside `tdee`; no adjustable standalone page |
| Body Fat / Water Intake | ✅ | `body-fat` (US Navy), `water-intake` |
| Pace — running | ✅ | `running-pace` (with race-time table) |
| Pace — cycling | ❌ | Not built |
| Age utility | ✅ | Tool `age` |
| Pregnancy due date | ❌ | Not built — needs careful medical wording |
| Health disclaimers | 🟡 | In every health page's notes/explainer; no dedicated disclaimer block (issue 16) |
| **Business** | | |
| Revenue Calculator | ❌ | Not built |
| Profit / Margin / ROI / ROAS / Growth / CAGR / Break-even | ✅ | `profit-margin`, `roi`, `roas`, `growth-rate`, `break-even` |
| Commission Calculator | ❌ | Not built |
| Business days | ✅ | Tool `working-days` |
| **Education** | | |
| Grade / Weighted Grade | ✅ | `weighted-grade` |
| GPA / CGPA | 🟡 | `gpa` (4.0 scale). CGPA (cumulative across terms, 10-point scale used in India) not built |
| Exam Score Calculator | 🟡 | Covered by tool `percentage`; no dedicated page |
| Final Score Needed | ✅ | `final-grade` |
| **Engineering / Construction** | | |
| Concrete / Tile / Paint / Roof Area | ✅ | `concrete`, `tile`, `paint`, `roof-area` |
| Brick Calculator | ❌ | Not built |
| Flooring | 🟡 | `tile` covers area-based flooring; no pack/plank-based page |
| Electrical / Ohm's Law | ✅ | `ohms-law`, `electricity-cost` |
| Force / Torque | ✅ | `force`, `torque` |
| Pressure / Energy | ✅ | As converters |
| **Everyday** | | |
| Fuel / Electricity cost | ✅ | `fuel-cost`, `electricity-cost` |
| Split Bill | ✅ | `tip` splits per person |
| Recipe scaling | ✅ | `recipe-scaler` |
| Time and date | ✅ | Date tools |

**Total: 60 calculators** — finance 25, math 7, health 6, business 7, everyday 5, education 3, construction 4, engineering 3.

### 14.3 Converters (§3, §12)

| Spec item | Status | Notes |
|---|---|---|
| Length, Weight, Temperature, Area, Volume, Speed, Data, Energy, Pressure, Power, Angle, Fuel Economy, Time | ✅ | 13 categories, 61 featured pair pages, one shared unit engine, 134 tests |
| Currency | ⏸ | Needs a live, timestamped rate source. Spec forbids hard-coded rates |
| Time Zone | ⏸ | Needs a zone database; group with world clock and meeting planner |
| Frequency | ❌ | Not built — trivial with the existing engine |
| Per-type UI (rate+timestamp, formula for temperature) | 🟡 | Explainer per converter; currency variant not applicable yet |
| `externalDataSource` | ❌ | Not built — needed for currency |

### 14.4 Tools (§4)

| Spec item | Status | Where |
|---|---|---|
| Date Difference, Working/Business Days, Add/Subtract Days, Week Number, Age | ✅ | `date-difference`, `working-days`, `add-days` (negative subtracts), `week-number`, `age` |
| Day of Week | ✅ | `day-of-week` |
| Countdown / Event Countdown | ✅ | `countdown` |
| World Clock | ⏸ | Needs zone database |
| Time Zone Meeting Planner | ⏸ | Needs zone database |
| Number ↔ Words | ✅ | `number-to-words`, `words-to-number` (round-trip tested) |
| Roman Numerals, Prime Checker, Fraction Simplifier | ✅ | Existing tools |
| Even/Odd Checker | 🟡 | Not explicit; `factor-finder` shows divisors. A one-line addition to factor-finder would close it |
| Factor Finder, Number Formatter | ✅ | `factor-finder`, `number-formatter` |
| Random Number, Password Generator | ✅ | Existing tools |
| Random Name Picker / Team Generator | ✅ | `random-picker` (pick, shuffle, teams) |
| Dice Roller, Coin Flip | ✅ | `dice-roller`, `coin-flip` (CSPRNG, fairness-tested) |
| Budget / Savings Goal / Debt Payoff Planner | ✅ | `budget-planner`, `savings-goal`, `debt-payoff` |
| Retirement Planner | ✅ | Calculator `retirement` |
| Study Planner | ❌ | Not built |

**Total: 23 tools** — date-time 7, number-math 8, utility 5, planning 3.

### 14.5 Charts & tables (§5)

| Spec item | Status | Where |
|---|---|---|
| Length, weight, temperature, area, volume, speed, pressure tables | ✅ | `*-conversion-table` (7) |
| Multiplication, squares, cubes, primes, Roman numerals, metric prefixes | ✅ | `multiplication-table`, `squares-and-cubes`, `prime-numbers`, `roman-numeral-chart`, `metric-prefixes` |
| Fraction reference / Percentage tables | ✅ | `percentage-fraction-table` |
| Amortization, compound growth, investment growth, inflation | ✅ | `amortisation-example`, `compound-growth-table`, `inflation-reference` |
| Cooking measurements, paper sizes, screen sizes | ✅ | `cooking-measurements`, `paper-sizes`, `screen-resolutions` |
| Shoe-size / Clothing-size references | ❌ | Not built |
| Time zone reference | ❌ | Not built |
| Calendar reference | ❌ | Not built |
| Tables ↔ tools linked both ways | ✅ | Built into the chart pages |

**Total: 19 tables**, all generated from the same code as the tools (cannot drift).

### 14.6 Guides (§6)

| Spec item | Status | Where |
|---|---|---|
| How to calculate EMI | ✅ | `how-to-calculate-loan-payment` |
| How to calculate percentage / compound interest | ✅ | `how-to-calculate-percentage`, `how-to-calculate-compound-interest` |
| How to calculate CAGR / BMI / profit margin | ❌ | Not written — the calculators now exist, so these are unblocked |
| What is EMI | 🟡 | `what-is-amortisation` covers it; no page titled for EMI |
| What is CAGR / BMI | ❌ | Not written |
| What is compound interest / inflation | ✅ | `what-is-compound-interest`, `what-is-inflation` |
| Formula pages (formula → variables → steps → example → calculator → FAQ) | ✅ | `future-value-formula`; every guide follows this structure |
| Compare loans / read amortization / plan savings | ✅ | `how-to-compare-loan-offers`, `how-to-read-an-amortisation-schedule`, `how-to-plan-monthly-savings` |
| Convert time zones for meetings | ⏸ | Waits for the time-zone tools |
| Extra (not in spec) | ✅ | `how-to-calculate-vat`, `what-is-a-marginal-tax-rate` |

### 14.7 Platform, SEO and UX (§7–§65)

| § | Requirement | Status | Notes |
|---|---|---|---|
| 7 | Country tools only where rules genuinely differ | ✅ | `isCountrySpecific` + `countryRelevance` |
| 8 | 12 spec locales | 🟡 | All 12 defined (+4 extra). Only en-US/en-GB pass the 75% gate |
| 8 | Language ≠ Country ≠ Currency ≠ Rules | ✅ | Core architecture |
| 8 | Switch language, stay on the same page | ✅ | `swapLocale` |
| 8 | **Preserve calculator inputs across language switch** | ❌ | Inputs reset on switch |
| 8 | Translations not all shipped in one bundle | ❌ | **Violated — issue 17** |
| 8 | Server-rendered localized content + metadata + hreflang | ✅ | Tested (29 hreflang tests) |
| 8 | RTL support | ✅ | `dir` from locale; Arabic ready when translated |
| 9 | next-intl | ↔ | Custom i18n with a readiness gate (§7) |
| 9 | PostgreSQL | ⏸ | Not needed while content is config-driven |
| 9 | Hosting / CDN | 👤 | Not chosen |
| 11 | Configuration-driven calculator engine, versioned | ✅ | `CalculatorDef` with `version`; shared breakdown UI |
| 11 | `formulaId` | ↔ | Each definition carries `compute`; formulas live in `lib/*` with tests |
| 11 | Export formats PDF / XLSX | ❌ | CSV and print only |
| 12 | Centralised unit system | ✅ | `config/converters/units.ts` |
| 13 | Country config: currency, number format, measurement system | ✅ | `measurementSystem` added session 5 |
| 13 | Explicit `dateFormat` per country | 🟡 | Handled by `Intl` per locale; not a config field |
| 14 | Header, hero, search, popular calculators & converters, categories, country tools, why-us, CTA, footer | ✅ | Homepage |
| 14 | Featured guides section on homepage | ✅ | "Guides & Tips" (redesign) |
| 14 | Charts & tables on homepage | 🟡 | Linked from the "More Ways to Calculate" cards; no table preview section |
| 15 | Calculator page: breadcrumb → country → inputs → reset → result → summary → chart → breakdown → export/share → how it works → related → FAQ → ad | ✅ | `CalculatorPageBody` |
| 15 | Formula + worked example on calculator pages | 🟡 | Formula in the explainer; worked examples live in guides |
| 15 | **Guide links from calculator pages** | ❌ | Calculator pages link only to other calculators |
| 16 | Responsive: mobile/tablet/desktop, stacked inputs, table → cards on mobile | ✅ | Breakdown has a mobile card layout |
| 17 | 150–250ms transitions, count-up, reveals, `prefers-reduced-motion` | ✅ | `globals.css`, `components/motion/*` |
| 18 | Spec palette | ✅ | Comp palette (same blue/navy/teal/sky/yellow family) |
| 19–21 | Unique titles, descriptions, one H1, canonical, OG, Twitter, favicon | ✅ | `buildMetadata`; `icon.svg`, `public/favicon.ico`, generated OG image |
| 22 | hreflang bidirectional + x-default | ✅ | Tested |
| 23 | Automated sitemap | ✅ | One sitemap with alternates |
| 23 | Split sitemaps per section/locale | ⏸ | Unnecessary at 710 URLs |
| 24 | Self-referencing canonical | ✅ | Tested against hreflang |
| 25 | Internal linking | 🟡 | Calculator ↔ calculator, chart ↔ tool, guide → calculator. Missing calculator → guide (see §15 above) |
| 27 | JSON-LD: Organization, WebSite, BreadcrumbList, Article | ✅ | |
| 27 | Validated in Rich Results Test | 👤 | Needs a public URL |
| 28 | No filler, no doorway pages | ✅ | Every page hand-written; featured pairs only |
| 29 | CWV targets (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1) | ❌ | Never measured |
| 30 | Static generation; client-side calculation | ✅ | 710 static pages; no server round-trips |
| 31–32 | Ad slots planned, separated from controls, no click encouragement | ✅ | `AdSlot` labelled and spaced |
| 34 | Reserved ad height (CLS) | ✅ | Per-placement `min-h` |
| 34 | Lazy-load below-the-fold ads | ❌ | Not implemented |
| 35 | Privacy, Terms, Cookies, Contact, About | ✅ | Built from real site behaviour |
| 35 | Consent management | ✅ | Consent Mode v2, reject-first banner |
| 35 | Operator details on legal pages | 👤 | Issue 15 |
| 36 | GA4, Search Console, event tracking | ❌ | Not started. Update privacy/cookies pages **first** |
| 37 | SEO analytics dashboard | ❌ | Not started |
| 38 | Global search, grouped by type, typo-tolerant | ✅ | |
| 39 | Slug rules | ✅ | Tested |
| 40 | Programmatic pages only with distinct value | ✅ | Featured converter pairs only |
| 42 | Keyboard, labels, focus, live regions, reduced motion, skip link | ✅ | Built in |
| 42 | Formal screen-reader / contrast audit | ❌ | Not done |
| 43 | Security headers, CSP | ❌ | `next.config.ts` is empty |
| 43 | No secrets in client, safe rendering | ✅ | No secrets exist; `dangerouslySetInnerHTML` only for JSON-LD (escaped) and the consent script |
| 44 | Third-party scripts: AdSense only, async, consent-gated | ✅ | |
| 45 | Image-light, SVG icons | ✅ | No raster images |
| 47 | Database tables | ⏸ | |
| 48 | Content relationship model | 🟡 | `relatedCalculators` + automatic related; no cross-type relationships in data |
| 49 | Visible breadcrumbs + BreadcrumbList | ✅ | Generated from one list |
| 50 | Robots / noindex rules | ✅ | `robots.ts`; `noindex` supported in `buildMetadata` |
| 52 | Localized error / empty states | 🟡 | Inputs clamp on blur, results carry notes; no inline validation messages ("Please enter a value greater than 0") |
| 53 | Unit, boundary, rounding, country-rule, known-value tests | ✅ | 912 tests |
| 53 | Formula versioning | ✅ | `version` on every calculator; `verifiedFor` on tax rules |
| 54 | Data freshness classification + source/retrieval time for dynamic data | ⏸ | No dynamic data yet |
| 55 | Print, CSV | ✅ | |
| 55 | **Share a results URL** | ❌ | **Bug — issue 18.** "Copy link" writes inputs to the URL but the page never reads them back |
| 56 | Copy link, native Web Share | ✅ | |
| 56 | WhatsApp / email share | ❌ | Not built |
| 57 | Footer: sections, popular, languages, legal | 🟡 | Popular calculators only; no popular converters/guides lists |
| 58 | Separate language and country selectors | ✅ | |
| 59 | No horizontal overflow, numeric keyboards | ✅ | `inputMode="decimal"` |
| 59 | Searchable country selector / bottom sheets | ❌ | 22-item list, not searchable |
| 62–63 | Folder structure and component library | ↔ | Same shape; dictionaries per language rather than per locale |
| 64 | Performance budget | ❌ | None set; see issue 17 |
| 66 | CI: lint, types, tests, build | 🟡 | Workflow written, never run (👤 push) |
| 66 | CI: SEO checks, accessibility checks, preview deploy | ❌ | Not built |
| 67 | Component tests / E2E flows / device & network tests | ❌ | Not started |
| 76 | Scales by configuration | ✅ | Adding a calculator = definition + keys + registry line |
| 78 | Versioning with effective dates and sources | 🟡 | Version numbers yes; per-rule effective date/source only partly (`verifiedFor`) |
| 79 | No fake "updated" dates | ✅ | Guides and legal pages carry real dates |

### 14.8 Development phases (§69)

| Phase | Status |
|---|---|
| 1 — Foundation (Next.js, TS, Tailwind, design system, routing, locales, SEO) | ✅ except **analytics foundation** ❌ |
| 2 — Core engines (calculator, converter, country, formatting, breakdown) | ✅ |
| 3 — First content set (finance, math, date, length, weight, temperature, health, business) | ✅ except **currency** ⏸ |
| 4 — SEO expansion (guides, tables, country tools, internal linking, schema, search) | ✅ except **localized versions** 🟡 (translation) |
| 5 — Monetization (AdSense, responsive ads, placement tests, viewability, revenue analytics) | 🟡 components done; account, testing, analytics 👤/❌ |
| 6 — Scale | ❌ not started |

### 14.9 Launch readiness checklist (§68)

| Item | Status |
|---|---|
| **Product** | |
| Core calculators complete | ✅ 60 |
| Core converters complete | 🟡 currency missing |
| Search works | ✅ |
| Country selector works | ✅ |
| Language selector works | ✅ (only English locales live) |
| Breakdown works | ✅ |
| Export works where planned | 🟡 CSV/print yes; share-link restore broken (issue 18) |
| **SEO** | |
| Unique titles, metadata, canonical, hreflang, sitemap, robots, breadcrumbs, internal links | ✅ |
| Structured data validated | 👤 needs deployment |
| No accidental noindex | ✅ |
| Search Console configured | 👤 |
| **Performance** | |
| LCP / INP / CLS targets | ❌ not measured |
| Mobile test | 🟡 spot-checked, not systematic |
| Third-party scripts audited | ✅ AdSense only |
| Ads tested for CLS | ❌ needs a live publisher id |
| **Ads** | |
| AdSense account / compliance review | 👤 |
| Ads distinct from controls, responsive, no click encouragement, reserve space, not dominant | ✅ |
| **Accessibility** | |
| Keyboard, labels, focus, reduced motion | ✅ |
| Contrast / screen-reader checks | ❌ no formal audit |
| **Legal / Privacy** | |
| Privacy, Terms, Contact | ✅ built — 👤 operator details |
| Consent implementation | ✅ |
| Advertising disclosures | ✅ privacy + cookies + about pages |

### 14.10 Prioritised pending list

**👤 Needs you (blocks launch)**
1. Operator details — entity, email, jurisdiction (issue 15).
2. Push to GitHub so CI runs (issue 11).
3. Choose hosting; set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADSENSE_CLIENT`.
4. Get the tax figures verified (issue 3, `docs/tax-rules-to-verify.md`).
5. After deploy: Search Console, Rich Results validation, AdSense review.

**❌ Code — highest value first**
1. **Ship only the active language's dictionary** (issue 17) — ~109 KB gzipped wasted on every page today.
2. **Fix share links** so they restore inputs (issue 18).
3. Security headers + CSP (§43).
4. Measure Core Web Vitals; set a performance budget (§29, §64).
5. Calculator → guide links (§15, §25). *(Homepage guides section done in the redesign.)*
6. Pluralisation (issue 14), then translate de/fr/es, then hi/gu/mr/ar.
7. Missing calculators: compound interest, simple interest (logic already written), commission, revenue, brick, probability, scientific, fraction arithmetic, CGPA, cycling pace.
8. Missing guides: CAGR, BMI, profit margin, what is EMI/CAGR/BMI.
9. Missing tables: shoe/clothing sizes, calendar. Frequency converter. Study planner. Even/odd in factor-finder.
10. Inline validation messages (§52); lazy-load below-fold ads (§34); searchable country selector (§59); WhatsApp/email share (§56); PDF/XLSX export (§55).
11. Component and E2E tests (§67); SEO/accessibility checks in CI (§66).
12. GA4 + events — **update privacy and cookies pages first** (§36).

**⏸ Deferred by design**
Currency converter, time-zone converter, world clock, meeting planner (need live data); PostgreSQL + admin CMS (§47, §77); split sitemaps (§23).
