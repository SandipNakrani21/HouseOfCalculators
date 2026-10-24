# SEO, GEO, AEO, LLMO and source cleanup — 24 October 2026

## Scope

Code review and local fixes for search crawling, canonical discovery, structured
data and machine-readable content. GEO means Generative Engine Optimization here;
AEO means Answer Engine Optimization, and LLMO means Large Language Model Optimization.
No ranking, indexing, rich-result eligibility or AI citation outcome is guaranteed.

## Changes

1. **Allow crawlers to read query URL canonicals.** Removed the blanket `/*?*`
   robots exclusion. Tracking and legacy share URLs now remain crawlable so their
   existing clean-page canonical can be read. The API exclusion remains. New share
   links already use fragments; sitemap URLs still contain no query parameters.
2. **Consolidate llms.txt destinations.** Filtered salary aliases whose canonical
   destination is income-tax and deduplicated default-country entries appearing
   in more than one catalogue section. Across the 12 public locales this removes
   **97 redundant/non-canonical link lines and 14,148 UTF-8 bytes**. Every remaining
   content destination matches a canonical sitemap entry. Search aliases and saved
   calculator URLs remain usable.
3. **Describe existing sources in JSON-LD.** Calculator applications now have a
   stable canonical `@id`, `mainEntityOfPage`, and deduplicated `citation` references
   to sources already displayed on their explanation. Guides likewise reference
   their visible further-reading sources. No ratings, authors, credentials, dates
   or source endorsements were invented. This improves explicit entity/source
   relationships; it does not prove a ranking benefit.
4. **Remove requested test code.** Deleted 12 unit/component test files
   (**101,347 bytes**) and retired two standalone QA harnesses (**13,041 bytes**).
   Removed `npm test`, its call from `npm run check`, and its ESLint override.
   Relocated the required TypeScript registry loader from `tests/` to `scripts/`
   and updated dependent generator/utility imports. No `tests/` directory remains.

Cleanup removes **114,388 bytes of development source**, excluding the relocated
helper. These files were already excluded from the production runtime package;
their deletion is not a website JavaScript or page-speed saving. Future automated
numerical/component regression coverage from that suite is intentionally removed
at the owner's request. Build, metadata, lint, type, dictionary and deployment
package checks remain available.

## Unused-code review

- TypeScript unused-local and unused-parameter checks passed.
- A source import graph found 212 reachable files out of 213. The remaining file,
  `src/instrumentation.ts`, is a Next.js convention entry point, so it was retained.
  No unused production module was confirmed. An exported-name reference scan did
  confirm `AD_INVENTORY_REVIEW` was unreferenced; that metadata-only export was
  removed while retaining the eligibility function and inventory provenance data.
  The final lint/type checks cover this deletion; it was already unused by the
  compiled application and no bundle saving is attributed to it.
- Build scripts, registry generators, framework exports and deployment utilities
  remain. `jsdom` remains a development dependency because the retained historical
  HTTP audit utilities still import it; it is not a production dependency.
- Existing reports, evidence and the unrelated pre-existing tracked change in
  `docs/policy-audit-2026-10-18/SIX-POINTS-STATUS.md` were preserved.

## Validation

- `npm run check`: **PASS** after removing the test-suite command. This includes
  generated metadata consistency, lint, TypeScript and i18n checks. Repository lint
  reports three existing warnings in archived QA helper files under `docs/`;
  zero errors. Changed source/build files also passed a separate lint invocation
  with zero warnings.
- `tsc --noEmit --noUnusedLocals --noUnusedParameters`: **PASS**.
- In-memory source checks: **12 public locale maps passed** unique/canonical
  destination checks against **3,654 sitemap entries**. JSON-LD citation
  deduplication, entity IDs and script-breakout escaping checks passed.
- Existing AEO content remains server-rendered: explanatory paragraphs, formulas,
  worked examples and FAQ answers in native `<details>` disclosures. Existing
  canonical/hreflang and public-locale publication gates were retained.
- Production build: **PASS**, 4,067 generated pages, build ID
  `h65gMF9u3u_9cxrbf4Dck`. The initial sandbox build made no progress and was
  stopped; the build with required filesystem/font access completed successfully.
- Generated output: **3,654 canonical sitemap pages passed** document language,
  one H1, canonical URL, hreflang agreement and indexability checks.
  **8,138 JSON-LD blocks** parsed successfully; **2,634 application entities**
  had their expected canonical identity. **4,632 citation references on 1,188
  pages** matched source links in the rendered HTML. All **12 emitted locale
  maps** exactly matched their generated source text; robots output passed.
- Final cleanup lint/types and removed-suite reference checks: **PASS**.
  No unit/component test suite was run or retained after the requested removal.

No new test-case files were added. Validation was performed using existing build
commands and one-time in-memory checks; evidence is stored as JSON/logs beside this
report. Browser use was disabled at the latest access check, so visual checks,
external Rich Results UI validation and live post-deployment acceptance are not
claimed. This report records local validation before the owner-requested GitHub main publication. No live post-deployment acceptance is claimed here.

## Guidance used

- [Google canonicalization guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls):
  use canonical signals and consistent internal URLs, rather than robots.txt as
  the canonicalization mechanism.
- [Google AI Search guidance](https://developers.google.com/search/docs/appearance/ai-features):
  ordinary SEO, crawlability, visible textual content and accurate structured
  data remain relevant; special AI markup or an AI text file is not required.
- [llms.txt proposal](https://llmstxt.org/): the retained Markdown maps are optional
  discovery aids, not a guaranteed crawler integration or ranking mechanism.
- Installed Next.js guides were read before edits: metadata, robots and JSON-LD.
  The existing JSON-LD `<` escaping and server-rendered content were retained.

Evidence: `before.json`, `after.json`, `cleanup.json`, `module-references.json`,
`check.log`, `changed-files-lint.log`, `unused-types.log`, `final-types.log`,
`production-artifacts.json`, `cleanup-verification.json`, `export-candidates.json`,
and build logs.
