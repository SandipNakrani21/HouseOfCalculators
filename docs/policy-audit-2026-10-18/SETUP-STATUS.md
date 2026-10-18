# AdSense setup and website safeguards

**19 October account evidence:** Site ownership passed; approval is **Needs attention — Low value content**, while ads.txt is Authorized. Advertising and analytics Consent Mode settings are now confirmed enabled/saved by the operator's screenshots. See [approval finding and content-quality follow-up](APPROVAL-FINDING-2026-10-19.md). Earlier account/settings gaps below are the historical checklist; actual regional delivery and other account checks remain open.

Updated 18 October 2026. Work is local; no production deployment or account setting change has been made.

**Latest follow-up:** [website fixes and policy re-audit](RE-AUDIT.md). This adds live-tab consent expiry, failure handling, accurate error copy, keyboard/tall-section reveal fixes and a non-sticky rail. Final tests: **61 passed**. Fresh production build and 4,236-page safeguard/link scans passed; 4,284 destinations and 414,448 internal references checked with zero link errors. The validation section below preserves the earlier pass's evidence.

## Implemented

- Analytics loads only after an explicit analytics-storage grant; page views stop on withdrawal. Accessible first-party GA cookies are cleared on withdrawal. Google Signals and advertising-personalization signals are disabled in the site's GA configuration. Query strings/fragments are removed from page addresses and referrers sent by the site.
- Google Privacy & messaging callbacks connect explicit purpose choices to the site's consent state. Unknown/unconfigured purposes do not become grants. Revocation uses Google's callback queue. A blocked/missing consent manager cannot silently become an opt-in.
- Manual ads initialize only on a visible document with a usable slot width, use fixed-height expandable-width units, do not initialize twice on resize, and use fresh nodes on page navigation. Unfilled inventory retains its space instead of shifting calculator controls. Filled ads are not cropped by the slot container.
- Source-review scope is displayed in all 12 launch locales. Narrow checks do not imply that all payroll contributions were reviewed.
- The 122 country/model combinations without source-review records remain usable but receive noindex and are excluded from the sitemap and manual ad inventory. This is an editorial readiness decision, not a claim Google universally requires citations for every calculator.
- BMI, resting-energy and water pages link primary contextual references with explicit applicability/limitations. Activity multipliers and the water model are labeled as assumptions, not medical measurements or a personalized prescription.
- Advertising/privacy disclosures and funding copy are updated across launch languages. The site no longer promises that ads can never shift layout or disclaim all responsibility for the selected advertising integration.

## Screenshots supplied by the operator

- European regulations: **TCH Europe consent** is Published for thecalculatorshouse.com; enabled; English plus six additional languages; last modified 1 October 2026. This resolves the question of whether a message has been published, not its actual regional delivery or Consent Mode configuration.
- Three display units match source: Sidebar 3191134454; Rectangle 4695787813; Leaderboard 7947802965.
- Global mobile ad-size optimization switch appears off.
- Ads → By site table is empty in the supplied image. No site row or Auto ads toggle is shown. Auto ads status and exclusions cannot be inferred from this.

## Still requires account or operator evidence

1. European regulations → Settings: Consent Mode support, purposes enabled and message configuration. Validate actual delivery and accept/reject/revoke from EEA, UK and Switzerland after deployment.
2. Sites: domain approval/readiness and any policy-center notices. A published consent message or created ad units do not prove site approval.
3. Auto ads: keep disabled for the initial manually controlled setup, or mirror the inventory exclusions and test filled placements. Do not assume the code allowlist blocks Auto ads.
4. GA4: verify enhanced measurement/history events, Google Signals/audiences, retention and data-sharing settings. Source flags do not audit account-level configuration.
5. Ownership/license records for logo, landing icons and hero video/poster. Flag-license record already exists. Do not invent ownership evidence.
6. Independent authority-based review of the remaining statutory models and relevant health assumptions before promoting those pages as verified.

## Validation

Final `npm run check` completed successfully: metadata freshness, manual ad inventory freshness, lint, TypeScript, translation coverage and all **58 tests passed**. Seven targeted consent/analytics/ad lifecycle checks also passed. Local HTTP checks confirmed the Canada salary page returns 200 and renders review scope, and the unreviewed US income-tax page renders noindex.

Final production build completed successfully. Offline inspection checked **4,236 localized HTML pages**, including **1,548 country-model pages**: all **1,464 unreviewed localized country pages** carry noindex and **84 reviewed localized pages** contain their source references. The checks found **zero structural/safeguard issues**. See `fix-build.log` and `generated-page-check.json`. Generated-page checks inspect structure and safeguards, not the truth of every sentence or every statutory computation. Updated browser visual inspection could not run because browser use is disabled in Work settings. Build emitted a metadataBase warning on special metadata output; this is not represented as a clean visual/SEO certification.

`auto-ads-exclusions.csv` is an operator worksheet of 1,620 suggested exact URL exclusions, not a supported bulk-import format or a complete account configuration. Manually placed ads with Auto ads disabled avoids needing a large exclusion list for the initial setup. Category/other dynamic states must still be considered if Auto ads is enabled later.

No claim of Google approval, guaranteed revenue or absolute compliance is made. The work reduces identifiable risks while retaining the site's calculator and advertising architecture.
