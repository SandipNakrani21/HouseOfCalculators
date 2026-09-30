# The Calculators House

*Every Calculation. One Global Home.*

A global, multilingual, mobile-first site of calculators, converters, tools,
reference tables, guides and country-specific utilities. Every page is
statically generated; every calculation runs in the browser, with no round
trip between moving a slider and seeing the answer. Revenue comes from
organic search and Google AdSense.

```bash
npm run dev        # http://localhost:3000 (the only environment)
npm run check      # lint + types + i18n coverage
npm run build      # static build, ~713 pages
```

Project status, decisions and the pending list live in
[`PROJECT_STATE.md`](PROJECT_STATE.md). The UI rules live in
[`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md); the working rules in
[`CLAUDE.md`](CLAUDE.md).

## What is in it

| Section | Contents |
|---|---|
| Calculators | 60, across finance, business, health, education, maths and construction (19 of them country-specific tax and payroll tools) |
| Converters | 13 unit categories and 61 "metres to feet" style pair pages |
| Tools | 23 date, number, planning and random tools |
| Charts | 19 reference tables, each generated from code |
| Guides | 12 formula guides: formula, variables, steps, worked example, calculator, FAQ |
| Countries | 22 countries, each with its own tax, currency and formatting |

## Stack

- **Next.js 16** (App Router, Turbopack, `proxy.ts` rather than middleware),
  **React 19.2**, **TypeScript** strict.
- **Tailwind CSS v4**. Design tokens in `src/styles/tokens.css`, components in
  `src/components/ui`. One light theme on a white page.
- **Custom i18n**: flat JSON dictionaries, English fallback, readiness gate.
- **lucide-react** icons plus the brand icon pack in `public/landing`; charts
  are hand-written SVG.
- No backend and no database: content is configuration.

## URLs

```
/{locale}                                   /en-us
/{locale}/{section}/{category}/{slug}       /en-us/calculators/finance/mortgage
/{locale}/countries/{country}/{slug}        /en-us/countries/gb/stamp-duty
```

**Locale ≠ country.** The locale (language + market) is in the URL. The country
is a separate setting, kept in a cookie, that drives currency, number
formatting and statutory rules: you can read in English while calculating for
Germany. A calculator whose rules differ by country lives under
`/countries/{country}/`; one where the country only sets the currency has a
single URL under `/calculators/`.

## Languages switch themselves on

A missing key falls back to English, which is right at runtime but the wrong
promise in a language picker. `isLanguageReady` measures each dictionary
against English and a language is offered only past 75% coverage. Today only
English (US and UK) is live; German, French, Spanish, Hindi, Gujarati, Marathi
and Arabic are 16-19% translated. `npm run i18n` shows where each stands.

`src/lib/i18n/index.ts` holds every dictionary and is **server-only**. Client
components import `src/lib/i18n/core.ts` and receive the active dictionary
from `LocaleProvider`, so a page ships one language, not all of them.

Counted phrases use `plural()` from `core.ts` with CLDR keys (`key.one`,
`key.other`, and `few`/`many`/... where a language has them).

### One language, several markets

A locale is a language *and* a market, and each is optimised for its own
readers and search engines. `dictionaries/regional/<locale>.json` rewords
only the keys that differ for that market, on top of the language:

- `en.json` is written in **British English**; `regional/en-GB.json` adds
  the few words the base spells the American way ("Maths").
- `regional/en-US.json` is **generated** (`npm run i18n:en-us`, rules in
  `scripts/en-us-spelling.mjs`): meters, liters, amortization, installment,
  wrench, metric ton. `npm run i18n` fails if English copy changed and the
  file was not regenerated, so rerun it after editing `en.json`.

Titles, descriptions, headings, FAQs, structured data (`inLanguage`, offer
currency, one `WebSite` per locale linked as translations), Open Graph
locales, hreflang (per locale, plus a language-only `en` and `x-default`),
dates and `/{locale}/llms.txt` all follow the page's locale. Site search
folds British and American spellings together, so "metres" finds "Meters".
A future language with several markets (pt-BR / pt-PT, es-ES / es-MX) gets
its own regional files the same way; call `createTranslator(language, locale)`
from pages so the market's wording applies.

## Adding a calculator

1. Pure logic in `src/lib/<area>/`.
2. A definition in `src/config/calculators/definitions/`: fields, `compute`,
   and an honest `countryRelevance`.
3. Register it in `src/config/calculators/index.ts`.
4. English copy in `src/lib/i18n/dictionaries/en.json`; reuse the shared
   `field.*` and `result.*` keys.

Search, grids, the sitemap, the page, its structured data and share links all
follow from the definition. A guide that lists the calculator in its `related`
links shows up on the calculator page automatically.

## Before launch

- **Statutory tax figures are unverified.** Every number is listed in
  [`docs/tax-rules-to-verify.md`](docs/tax-rules-to-verify.md).
- **Operator details are unset** (`OPERATOR` in
  `src/config/legal/definitions.ts`); legal pages show a "not ready" notice
  until they are filled in.
- Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_ADSENSE_CLIENT`.
