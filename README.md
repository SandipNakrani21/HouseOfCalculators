# Calcora

Financial calculators that follow the visitor's country. The site asks for a
country and a language on the first visit, stores the choice, and serves every
page under `/{country}/{lang}` — so the currency, the statutory rules and all
of the copy change together.

The UI takes its shape from Groww's calculator pages: a card of sliders on the
left, a donut split on the right, the result rows underneath, and a searchable
grid of every calculator on the home page.

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## How the locale works

- `src/proxy.ts` puts every request under a valid `/{country}/{lang}` prefix,
  choosing from the saved cookie, then the CDN geo header, then
  `Accept-Language`. A language a country does not offer redirects to one it
  does, so a shared link always lands somewhere.
- `src/app/[country]/[lang]/layout.tsx` is the root layout. It sets
  `html[lang]` and `html[dir]` and hands the dictionary to `LocaleProvider`.
- `LocaleGate` opens the country → language picker when no choice has been
  stored. It reads the cookie through `useSyncExternalStore`, so pages stay
  statically rendered.
- Every page is prerendered for every country and language pair.

## Adding a calculator

1. Write a definition in `src/config/calculators/definitions/`. A definition
   declares which countries offer it, what fields to show, and how to compute
   the result:

   ```ts
   export const fdCalculator: CalculatorDef = {
     slug: "fd",
     icon: "🏛️",
     category: "savings",
     titleKey: "calc.fd.title",
     descKey: "calc.fd.desc",
     countries: ["in", "ae"],
     fields: ({ countryCode }) => [...],
     compute: (values, { country, fmt, t }) => ({ primary, rows, chart }),
   };
   ```

2. Register it in `src/config/calculators/index.ts`.
3. Add its dictionary keys to every file in `src/lib/i18n/dictionaries/`.

Nothing else needs touching: the home grid, search, the calculator page, the
chart, the breakdown table and the metadata are all driven by the definition.

Fields and results can differ per country from inside a single definition —
slider ranges come from `src/config/calculators/scale.ts`, and copy such as
`"{tax} Calculator"` resolves to GST, VAT or Sales Tax through the
definition's `params`.

## Adding a country

Add an entry to `src/config/countries.ts` (currency, number grouping, the
languages it offers, its consumption tax and fiscal year), a money scale in
`src/config/calculators/scale.ts`, a `country.<code>` key in every dictionary,
and list the code on each calculator that should appear there. Income tax needs
a rule set in `src/lib/finance/tax/income-tax.ts`.

## Adding a language

Add it to `src/config/languages.ts`, copy `dictionaries/en.json` and translate
it, then list the code on the countries that should offer it. Missing keys fall
back to English rather than rendering blank. Right-to-left is handled by the
`dir` field — Arabic is already wired end to end, and the layout uses logical
properties (`ps-*`, `text-start`) throughout.

## Country-specific logic

`src/lib/finance/` holds the pure maths, which is the same everywhere. The
country-specific parts live beside it:

- `tax/income-tax.ts` — slabs, allowances, rebates and payroll add-ons per
  country: India's old and new regimes with the 87A rebate and cess, US federal
  brackets with FICA, UK bands with the tapered personal allowance and National
  Insurance, and the UAE's absence of personal income tax.
- `config/countries.ts` — the consumption tax each country charges and at what
  rates.

**Statutory rates need checking before launch.** Each rule set carries a
`verifiedFor` field naming the tax year it was written against (FY 2025-26 for
India, 2025 for the US, 2025/26 for the UK). They are the numbers to re-confirm
against the tax authority each year, and they are all data in one file so an
update is an edit rather than a rewrite.
