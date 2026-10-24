# Pending checks — continuation results, 24 October 2026

This report supersedes the measurement blockers and fresh-layout counts in `PENDING-QA-INVESTIGATION-2026-10-24.md`. Evidence is in `final-pending-2026-10-24/`. The user subsequently authorized verified fixes to be pushed to GitHub main. No deployment command, private account access, ad click or artificial ad fill was performed. Compact evidence is versioned; large raw ledgers and screenshots remain local.

## 1. Actual speed measurements

The public PageSpeed **web interface worked**, although the earlier direct API was quota-blocked and local Lighthouse received 403. Eighteen independent public analyses produced 36 lab reports: three per route per device. Report links, visible report text and exact metric values from PageSpeed's score-calculator links are retained in `pagespeed-results.json`; medians and ranges are in `speed-summary.json`.

| English-US page | Mobile score median | Mobile LCP median | Mobile TBT median | Desktop score median | Desktop LCP median | Desktop TBT median |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 65 | 7.109 s | 280 ms | 76 | 1.648 s | 303 ms |
| Loan | 72 | 6.982 s | 107 ms | 64 | 2.037 s | 537 ms |
| Metric-prefix chart | 69 | 6.023 s | 273 ms | 89 | 1.607 s | 142 ms |
| Meters-to-feet converter | 64 | 7.131 s | 387 ms | 82 | 1.496 s | 265 ms |
| US income tax | 63 | 7.581 s | 355 ms | 84 | 1.603 s | 180 ms |
| Compound-interest guide | 71 | 6.029 s | 217 ms | 93 | 0.979 s | 103 ms |

Mobile CLS median was 0 for each page; desktop CLS median was 0.01. TBT is a lab blocking-time metric, **not INP**. Every sampled URL report showed field **No Data**: no field-CWV or field-INP pass/fail is established.

Conditions: Lighthouse 13.5.0, Google's remote HeadlessChromium 153.0.8010.36, initial-page-load/single-page sessions. Mobile reports specify Moto G Power emulation and Slow 4G; desktop reports retain their own emulation/throttling descriptions in the raw visible text. The service's exact physical region and CDN cache state are not disclosed. Report generation/capture times are retained; report UI displays IST. No custom device settings or consent grants were injected. These are matched service presets, not measurements of identical hardware or an isolated origin. TBT varied substantially: loan desktop 290–1,404 ms; tax mobile 315–1,324 ms. Medians do not hide those ranges.

### PERF-01 — Medium: repeated slow mobile lab LCP

Reproduction: analyze each of the six recorded live URLs using PageSpeed's standard mobile preset, three times. Actual LCP medians are 6.023–7.581 seconds; the expectation is a prompt initial render on the mobile preset. This is a measured performance finding, not a functional calculation defect or a field-CWV verdict.

`home-mobile-diagnostics.txt` records a late consent-notice paragraph as the home LCP element, 3,320 ms element-render delay and 400 ms TTFB in one diagnostic run. The same report records Google/Doubleclick assets at 279 KiB / 227 ms main-thread time and Funding Choices at 106 KiB / 61 ms. It also estimates 1,230 ms render-blocking savings and 44 KiB image-delivery savings. These estimates are opportunities, not measured savings after a fix. The diagnostic breakdown and simulated headline LCP are different views; do not add the subpart durations to reinterpret the headline score.

Root cause is only partially isolated: late consent UI and third-party execution contribute in the observed home run; this does not prove they explain every route's entire delay. Required CMP/AdSense scripts cannot simply be removed or delayed past consent initialization. No speculative optimization was made, no feature/content removed, and **no before/after speed improvement is claimed**. Earlier per-page compressed/decoded HTTP asset and HTML measurements remain in `pending-qa-profile-2026-10-24.json`; they are not rendering times or complete browser transfers.

## 2. Responsive and interaction ledger

**2,880/2,880 fresh local default-state geometry checks completed; zero candidates.** All 12 configured public locales × 60 requested calculator routes × four sizes were checked in the current production build. Sizes: 1920×1080, 1366×768, 768×1024, 390×844. Route aliases remain separate configured journeys, not claims of separate implementations. Each locale's configured home country was selected; fixed-country route contexts come from the retained manifest. Unsupported public languages and Polish were excluded.

Each row validates requested route/alias, language, viewport, ready form and selected country context, then checks page overflow, element/text bounds, button-label bounds, action-bar notice position and intentional internal scrollers. Geometry is not a full interactive pass or manual inspection of 2,880 screenshots. Raw records: `geometry.jsonl`; deduplicated ledger: `coverage.csv`; current counts: `summary.json`.

The detailed form-control profile completed 816/2,880 combinations, all passing with zero candidates. The remaining 2,064 are blocked because browser use was disabled in Work settings when continuation was attempted. This is partial interactive coverage. It reaches visible text/date fields; checks first-input blank/malformed/upper-bound layouts and recovery; operates checkboxes and radio choices; opens and keyboard-scrolls/closes form dropdowns; switches breakdown tabs; and focuses chart legends. Shared header/menu/search checks run on loan in every locale and size. Individual records enumerate exactly which controls were exercised. Native printing/sharing, exhaustive numeric inputs, every chart point and every validation permutation are not certified by that profile. Current progress and incomplete attempts are recorded in `interaction-cursor.json` and `summary.json`; no incomplete attempt is counted as passing.

Screenshots are samples. The inherited helper writes JPEG bytes under `.png` names, and desktop captures can be smaller than the requested CSS viewport. A 1920×1080 DOM/visual viewport was verified with scale 1 while a capture contained only 1905×1001 pixels. Treat this as a capture limitation; do not infer a website overflow defect from a clipped capture. DOM geometry and requested viewport records are retained separately. The saved US loan desktop/mobile captures were inspected; further reviewed samples are listed in the final completion note.

## 3. Consent and ads

Six actual-source React/jsdom simulations passed (`consent-simulation-results.json`): unknown CMP stays denied with reject/reopen controls; outside-TCF accept then revoke/reject; stored acceptance ignored while context is unknown; stored acceptance restored only with verified outside-TCF context; granular analytics-only consent; ad-storage-only consent with analytics denied, followed by unknown-state denial. Cookie clearing, GA disable state and AdSense request pausing/release were asserted. These use fresh simulated DOMs and a controlled fake CMP; they are **not** real-region Google CMP tests or proof of network/legal compliance.

Google's [documented preview parameters](https://developers.google.com/funding-choices/fc-api-docs#testing_and_debugging_on_your_site) were tried on the live home page: `?fc=alwaysshow&fctype=gdpr`. After loading and reopening Privacy choices, this browser still displayed the CMP-unavailable fallback, with Reject and Close and no Accept. DOM evidence and a screenshot are retained (`google-cmp-preview-dom.txt`, `cmp-preview-desktop.png`). Cause is not established: this does not prove that the account lacks a published message, that regional visitors see the same state, or that a Google policy violation exists.

**Blocked:** genuine EEA/UK/Switzerland egress testing; actual Google Accept/Manage/granular/revoke flows in those regions; guaranteed clean browser contexts (available browser capabilities expose viewport/visibility only). No VPN, networking change or private account control was used. Debug preview ignores region and cannot establish regional targeting.

**Filled ads remain unverified.** No verified live acceptance path was available in the observed browser. Consent was not bypassed and fake creatives/traffic were not used to manufacture a pass. Empty ad wrappers and reserved-size source behavior do not prove filled-creative layout safety.

Google's [publisher CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en) remain the policy reference; Consent Mode or these simulations alone establish neither legal compliance nor AdSense approval.

## 4. CSP

The local production report-only event-handler restriction was verified on actual home/loan HTTP responses in the preceding continuation. Current browser checks use that built policy. Enforced `script-src`/styles retain inline permissions; no added hosts, unsafe-eval in production, fixed nonce or dynamic-rendering conversion was introduced. Next.js 16.4.2's installed CSP guide was read before the configuration change.

Nonce rendering/caching implications and inline-hash/SRI limitations remain as documented in the preceding report. Strict enforcement of a new script policy is **not certified**: actual regional CMP and filled ads are unavailable, and live hosting may replace application headers. The report-only trial is local, no live hardening deployment is claimed, and no injection vulnerability was demonstrated. Hosting must preserve any future trial header before production diagnostics would be meaningful.

## 5. Project checks and source changes

The two existing `require()` lint errors in `docs/live-qa-2026-10-24/collect-http.cjs` were fixed using dynamic imports initialized before its existing async audit. Its existing output files were not regenerated or overwritten. The full project check then passed. A final check after completing the new evidence tools is recorded in the completion note.

The prior production build passed with 4,067 static pages after the sandbox EPERM retry; three unrelated application files and a new calculator-search-copy module were subsequently changed outside this work. Those changes are excluded from this commit and from the earlier preview evidence. QA-only scripts do not establish a deployed fix. The source collector import change is a tooling fix, not a website performance improvement.

## Completion note

Available final coverage: 2,880/2,880 geometry checks, 816/2,880 detailed interactions, zero candidates in completed checks; six controlled consent simulations passed. Only US loan desktop/mobile screenshot samples were visually reviewed. Browser continuation is blocked by Work settings. Genuine regional consent, filled ads, strict CSP enforcement and field Core Web Vitals remain unverified. Mobile lab LCP remains an open finding. The full project check passed (exit 0): metadata, dictionaries, ad inventory, ESLint, TypeScript and translations. Three existing lint warnings remain. Log: final-pending-check-verified-2026-10-24.log. Targeted lint of both changed code files also passed. Prepared changes: report-only CSP trial, collector lint fix and compact QA evidence. No performance improvement or complete interactive QA pass is claimed.
