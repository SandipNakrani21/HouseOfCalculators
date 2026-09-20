# Calcora

Financial calculators that follow the visitor's country. The site asks for a
country and a language on the first visit, stores the choice, and serves every
page under `/{country}/{lang}` — so the currency, the statutory rules and all
of the copy change together.

The UI takes its shape from Groww's calculator pages: a card of sliders on the
left, a donut split on the right, the result rows underneath, and a searchable
grid of every calculator on the home page.

```bash
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm run i18n       # dictionary coverage report
```

## Scope

**20 countries** — 🇮🇳 India · 🇺🇸 United States · 🇬🇧 United Kingdom ·
🇨🇦 Canada · 🇦🇺 Australia · 🇩🇪 Germany · 🇦🇹 Austria · 🇨🇭 Switzerland ·
🇫🇷 France · 🇧🇪 Belgium · 🇳🇱 Netherlands · 🇯🇵 Japan · 🇪🇸 Spain ·
🇲🇽 Mexico · 🇮🇹 Italy · 🇵🇹 Portugal · 🇧🇷 Brazil · 🇵🇱 Poland ·
🇹🇷 Türkiye · 🇦🇪 United Arab Emirates

**14 languages** — English, हिन्दी, ગુજરાતી, मराठी, Español, العربية (RTL),
Deutsch, Français, and registered-but-untranslated Nederlands, 日本語, Italiano,
Português, Polski, Türkçe.

**27 calculator definitions**, which produce a country-specific page each time
a country offers one. Multilingual countries get a page per language too:
Switzerland runs in German, French, Italian and English; Belgium in Dutch,
French and English; Canada in English and French.

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
- Every page is prerendered for every country and language pair it exists in.

### Languages switch themselves on

A missing key falls back to English at runtime, which is the right behaviour
but the wrong promise to make in the picker — choosing 日本語 and getting an
English page is worse than not being offered it. So `isLanguageReady` measures
each dictionary against English and a language only appears once it clears 75%.
Fill in `dictionaries/ja.json`, add it to `RAW` in `src/lib/i18n/index.ts`, and
Japanese appears in Japan's picker with no other change.

Run `npm run i18n` to see where each language stands.

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
3. Add its `title` and `desc` keys to `dictionaries/en.json`. Reuse the shared
   `field.*` and `result.*` vocabulary wherever you can — that is what keeps
   27 calculators from meaning 27× the translation work.

Nothing else needs touching: the home grid, search, the calculator page, the
chart, the breakdown table and the metadata are all driven by the definition.

Fields and results can differ per country from inside a single definition —
slider ranges come from `src/config/calculators/scale.ts`, and copy such as
`"{tax} Calculator"` resolves to GST, VAT, HST or Sales Tax through the
definition's `params`.

## Adding a country

Add an entry to `src/config/countries.ts` (currency, number grouping, the
languages it offers, its consumption tax and fiscal year), the rough currency
scale in `src/config/calculators/scale.ts`, a `country.<code>` key in every
dictionary, and list the code on each calculator that should appear there.
Income tax needs a rule set in `src/lib/finance/tax/rules.ts`.

## Adding a language

Add it to `src/config/languages.ts`, copy `dictionaries/en.json` and translate
it, then import it into `RAW` in `src/lib/i18n/index.ts` and list the code on
the countries that should offer it. Right-to-left is handled by the `dir`
field — Arabic is already wired end to end, and the layout uses logical
properties (`ps-*`, `text-start`) throughout.

## Country-specific logic

`src/lib/finance/` holds the pure maths, which is the same everywhere. The
country-specific parts live beside it:

- `tax/define.ts` — a declarative description of a personal income tax system:
  allowances, bands, credits that phase out, surtaxes on the tax itself,
  payroll contributions, or a closed-form formula where a country uses one
  instead of bands (Germany).
- `tax/rules.ts` — one rule set per country built on that.
- `config/countries.ts` — the consumption tax each country charges, at what
  rates, and under what name.

**Statutory rates have not been verified.** Every figure was written from
general knowledge, not from a primary source.
[`docs/tax-rules-to-verify.md`](docs/tax-rules-to-verify.md) lists every number
that needs confirming and every place the model is knowingly incomplete —
Swiss cantonal tax, US state tax, the French quotient familial and the rest.
Read it before launch.
