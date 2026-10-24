# Mobile speed: investigation, local optimization and retest limits

**Continuation update:** an isolated original-logo production baseline has been prepared with synchronized current source (`local-speed-comparison-design.json`). On attempting to resume the supported browser, it reported **“Local browser use is disabled in Work settings.”** No alternative browser route was used. Consequently no new browser/LCP measurements or screenshots were taken in this continuation. See `CONTENT-CONTINUATION.md` for current build/check results; the old full-check lint failures below have since been resolved.

25 October 2026 (Asia/Calcutta). **Partially complete. No LCP improvement verified or live fix claimed.**

## Fresh production baseline

Target: https://thecalculatorshouse.com/en-us. Supported in-app browser access was available. PageSpeed's browser interface was used; the quota-limited API was not retried. Three independent mobile lab captures were obtained. Immediate Analyze requests sometimes returned cached results; those repetitions were excluded rather than counted as independent runs.

| Capture (IST) | Report ID | Score | FCP (ms) | LCP (ms) | TBT (ms) | CLS displayed | Speed index (ms) |
|---|---|---:|---:|---:|---:|---:|---:|
| 00:15 | 2q19bgyky0 | 68 | 1358 | 6158 | 251 | 0 | 5432 |
| 00:18 | cnwpgusfcq | 72 | 1367 | 7069 | 124 | 0.001 | 5005 |
| 00:25 | 61ih6dwxv2 | 69 | 1354 | 7266 | 196 | 0 | 5105 |
| **Median** | | **69** | **1358** | **7069** | **196** | **0** | **5105** |

Precise integer times are from the visible report's score-calculator link; rounded metric cards show 1.4 s FCP, 6.2/7.1/7.3 s LCP and 250/120/200 ms TBT. The earlier 64-score run is historical and excluded from this median. The cached second request had report ID yy95siapmm but retained the first run's captured metric set; it is excluded.

Reports: [run 1](https://pagespeed.web.dev/analysis/https-thecalculatorshouse-com-en-us/2q19bgyky0?form_factor=mobile), [run 2](https://pagespeed.web.dev/analysis/https-thecalculatorshouse-com-en-us/cnwpgusfcq?form_factor=mobile), [run 3](https://pagespeed.web.dev/analysis/https-thecalculatorshouse-com-en-us/61ih6dwxv2?form_factor=mobile).

Conditions: emulated Moto G Power, Slow 4G, Lighthouse 13.5.0, HeadlessChromium 153.0.8010.36 with lr, single-page session, initial page load. No consent action was taken in the runner. The consent paragraph and welcome dialog appear in diagnostics; this is the initial undecided-consent path, not an accepted-consent run. PageSpeed's cache/session reset details and test geography are not exposed by this interface; these were not independently controlled. Report-result caching is separate from browser resource caching. No field CWV claim is made.

## Reproduction and attribution

The LCP element is the consent paragraph: `div.fixed > div.mx-auto > div > p.mt-1`. Run 1 reports 410 ms TTFB and 2260 ms element-render delay; run 3 reports 390 ms TTFB and 2710 ms render delay. These diagnostic timings are distinct from simulated aggregate LCP and must not be summed to reproduce it.

Source inspection confirms `ConsentBanner` waits for the authoritative Google TCF applicability result, then reads local consent and renders the non-TCF choice banner if applicable. The initial paragraph therefore depends on hydration and external CMP readiness. This confirms the dependency, but does not isolate every millisecond of render delay or justify replacing the CMP's decision with a guessed location. No consent UI, explicit gating, required advertising script or CMP behavior was changed.

Run 3's dependency tree: initial document 1048 ms / 56.38 KiB; CSS chains end at 1556 ms (3.04 KiB stylesheet) and 1342 ms (28.16 KiB stylesheet). Render-blocking estimated saving: 1280 ms. The estimate is not an achieved improvement. No wholesale CSS removal was attempted without unused-rule evidence.

Run 3's mobile attribution (not hidden desktop tables):

- Google/DoubleClick: 236 KiB, 122 ms main-thread time; Funding Choices: 106 KiB, 52 ms.
- Estimated unused JS: Google ads 170.2 KiB; Funding Choices 36.4 KiB; first-party React/shared chunks 62.2 KiB across 174.7 KiB transferred in that diagnostic.
- CPU diagnostic: first party 1768 ms total / 733 ms script evaluation, Funding Choices 186/155 ms, Google ads 178/86 ms. These use a different timing basis from the third-party insight.

These figures do not prove the SDK bytes can be removed. Different Google-loaded subsidiary scripts between runs are not proof of duplicate application loaders.

## Smallest supported change

The logo is a separate confirmed first-party delivery issue: an 836×240, approximately 49.4 KiB WebP is sent to every device, with no responsive candidates. Lighthouse flags approximately 44.3 KiB image-delivery opportunity. This is **not** the measured LCP element and optimizing it is not proof the consent LCP improved.

`src/components/layout/Logo.tsx` now uses installed Next Image support with responsive size hints expressed in rem for the existing CSS sizes. A mobile regression check exposed the site's 112.5% root font size, so pixel-only hints were replaced with relative hints. An explicit 836:240 aspect ratio prevents integer-rounded resized candidates from changing layout dimensions. Intrinsic dimensions, artwork, alt text, CSS heights, eager/high-priority header loading and lazy footer loading are preserved. No bitmap artwork was regenerated. Installed image guide and API documentation were read before editing.

## Local validation and remaining measurement work

See `pending-tasks-final-build.log`, `pending-tasks-targeted-lint.log`, `pending-tasks-types.log`, `pending-tasks-i18n.log`, `pending-rendered-checks.json` and the final validation notes in `CONTENT-REVIEW.md` for exact results. Initial build hit Windows EPERM creating generated folders; the build was rerun with normal filesystem access. Full `npm run check` hits four existing lint errors in unrelated crawl/analyze scripts, separately recorded.

The supported browser exposes viewport and visibility controls, but no Lighthouse execution, network/CPU throttling or browser-cache reset capability. Public PageSpeed cannot reach localhost. An equivalent Slow-4G local before/after median therefore remains **blocked by measurement-tool capability**, not by disabled browser access. No alternative browser automation or public tunnel was used. Local image-response size and visual/control checks can verify the delivery change, but cannot substitute for LCP measurements.

Remaining: obtain matched, controlled local before/after production-build lab runs using an authorized performance-capable runner, verify whether this change improves LCP, and continue only if evidence supports a further safe optimization. There are no local LCP “after” figures, no measured field improvement and no deployment.

## Final local regression results

- Final production build passed (4067 generated outputs, including framework/internal/nonpublic paths; this is not a new public crawl).
- Targeted ESLint, TypeScript, generated calculator/client dictionary checks, language-key/regional-copy checks and diff whitespace checks passed. Full check remains blocked by the four unrelated existing lint errors already described.
- All 29 selected local production pages passed HTTP/rendered-copy/JSON-LD consistency checks. Five local image responses returned valid WebP data.
- Raw light logo: **50582 bytes**. Optimized candidates: 256w **7066 bytes**, 384w **12836 bytes**, 640w **27226 bytes**. Dark 384w: **13190 bytes**. The 256w candidate selected in this browser is 86.0% smaller than the raw image; 384w is 74.6% smaller. These are image-body byte comparisons, not navigation/LCP benchmarks.
- At 390×844 the header logo loaded and measured approximately 188.09×54 CSS px. At 1280×900 it measured 266.47×76.5 CSS px. Mobile menu opened/closed. Desktop and mobile screenshots were visually inspected. Light and dark artwork loaded; the menu retains its own logo placement.
- Loan controls hydrated, changing principal updated the result, and the Yearly tab changed the schedule. Date Difference's same-Monday example returned zero elapsed days and one weekday through native date input changes. Italian tax copy rendered in Italian.
- Privacy choices opened the unavailable-CMP fallback, explaining that optional storage stays denied; Reject and Close were available and no accept control was exposed in the unknown-applicability state. This is a local fallback check, not regional CMP certification. No consent was granted.
- Local preview inherited a previously stored Brazil country selection after hydration. It was not a clean-profile lab run and is not comparable to the initial production PageSpeed measurements.
- Evidence images: `pending-home-mobile.jpg`, `pending-home-desktop.jpg`, `pending-consent-mobile.jpg`, `pending-loan-mobile.jpg`. Supported browser tools alone were used for visual/interaction checks. A local socket fetch initially hit sandbox EACCES; it succeeded with ordinary local-network permissions. No browser restriction was bypassed.
