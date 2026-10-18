# Website fixes and Google policy re-audit

Date: 18 October 2026. Workspace: D:\Calculator. These changes are local; production has not been deployed. AdSense account settings were deferred at the operator's request.

## Result

The identified website implementation findings have fixes and regression coverage. The current evidence supports a more controlled advertising implementation, not a declaration that Google has approved the website or that every content claim has been independently verified. The original topic-by-topic coverage remains in [REPORT.md](REPORT.md); its findings describe the original baseline. [SETUP-STATUS.md](SETUP-STATUS.md) records the earlier fixes and account screenshots.

## Additional fixes in this pass

1. **Consent expiry while a page remains open.** Local consent cookies now expire after 180 days, matching their logical lifetime. The banner rechecks expiry on a timer, window focus and visibility changes, withdraws optional consent and requests a new decision. Long timeouts are capped to avoid browser integer overflow.
2. **Consent API failure after a grant.** A missing/throwing purpose-value response withdraws the site's optional grant instead of retaining the previous analytics permission. Unknown purpose values remain denied. This is application behavior; it does not replace Google's regional CMP or account configuration.
3. **Incorrect privacy assurance on errors.** Removed the blanket statement that nothing entered could have left the device from both global and localized error messages. Calculator computations remain local, but shared URLs, legacy query links, hosting and third-party services make an absolute transmission promise unjustified. All launch-language error messages were updated.
4. **Rail behavior on short screens.** Removed custom sticky positioning from the 300 × 600 sidebar. The entire ad can scroll with the document, avoiding an extra constraint on short viewports. This is a conservative placement choice, not a claim that Google prohibits every sticky ad; Google permits them under specific conditions.
5. **Hidden keyboard targets.** Focus immediately reveals all animated ancestors, and the observer does not hide a section containing keyboard focus. Normal scroll timing is retained.
6. **Very tall animated sections.** A section taller than the viewport can reveal when it intersects, even when it cannot reach the normal 8% intersection threshold.
7. **Documentation consistency.** Cookie/about revision dates match this update. The README now reflects populated operator details, twelve launch locales and explicit statutory-review coverage.

## Re-audit against current Google rules

This is an engineering/content-scope assessment, not an enforcement finding. “No issue found” refers to inspected source, registries, representative content and automated output. It does not imply manual reading of every sentence in every generated translation.

| Policy area | Current result |
|---|---|
| Prohibited/restricted content | No new prohibited-content issue found in the calculator, conversion, utility, guide or chart implementation. Original category-by-category findings remain in REPORT.md. No user-generated publishing or restricted-product sales feature was found. |
| Misleading representation and harmful claims | Error-page overclaim corrected; advertising funding disclosures and narrow source-review scope remain explicit. Health reference applicability and assumptions are shown. Remaining statutory/translation/health review is not certified by passing tests. |
| Publisher-content and inventory value | Manual inventory remains an explicit allowlist of substantive tool/reference paths. Navigation, legal, error, unknown and unreviewed country-model pages cannot request manual slots. An allowlist is not a Google quality approval. |
| Ads interfering with interaction / accidental clicks | Labels, spacing and fixed reserved heights retained. Slots are outside scroll-reveal wrappers. Custom sticky behavior removed. No ad-click handlers, click prompts, artificial refresh or click-to-unlock flows found. Filled production creatives and Auto ads need later validation. |
| Out-of-context/background inventory | Site slot requests wait for a visible document and usable position width. No idle refresh or pop-under code found. This does not audit behavior introduced by account-level formats or Google's subsequently loaded script. |
| Advertising versus content density | Manual templates retain substantive formula, worked-example, explanation and FAQ sections where configured. Actual filled-unit density and account formats remain outside this source-only conclusion; there is no invented word-count rule. |
| Privacy disclosures / identifying users | Advertising disclosures name Google/partner processing. The site's analytics locations/referrers omit query and fragment; personalized-ad signals and Google Signals are disabled in its GA configuration. No calculator-input custom targeting found. Legacy links, third-party payloads and account settings require live verification. |
| EU consent and withdrawal | Default optional purposes denied; analytics loader requires an explicit analytics purpose grant. Unknown/failed purpose data cannot retain a grant. Expiry and withdrawal covered by interactions tests. Published regional-message screenshot is recorded, but regional delivery/Consent Mode settings remain deferred. |
| Authorized inventory / declarations | Publisher and unit IDs match supplied screenshots; earlier public ads.txt evidence matches source. Account ownership, readiness and policy-center notices remain deferred. |
| Intellectual property | Flag collection has a recorded license. Logo/icons/video ownership evidence remains an operator task. No infringement conclusion can be inferred merely from missing receipts. |
| Search spam / site navigation | Existing canonical/hreflang hierarchy retained. All generated localized pages and their local destinations scanned. Unreviewed country pages remain noindex and absent from the sitemap/manual inventory. Noindex is not a substitute for correcting a false statement or for Auto ads exclusions. |
| Security / malware / abusive experiences | Production dependency audit reports zero known vulnerabilities. No malicious-download, forced-install, ad-click trap or deceptive-navigation feature found in inspected implementation. This is not a penetration test. |
| COPPA, personalized audiences, sanctions and invalid traffic | No child-targeting declaration or sensitive audience feature added. Actual audience, account declarations, traffic sources and self-click history require operator/account evidence. |

## Validation evidence

- `npm run check`: metadata freshness, ad-inventory freshness, lint, TypeScript, translation coverage and 60 tests passed before the additional reveal regression was added. Final `npm test`: **61 passed, 0 failed**; targeted lint including the new test also passed.
- Production dependency audit: **0 reported vulnerabilities** (`dependency-audit.json`).
- Fresh production build: **passed**. Final full-build link scan: **4,236 localized pages**, **4,284 unique internal destinations**, **414,448 internal link/asset references**, **0 unresolved destinations or same-page anchor errors**. External websites and JavaScript-generated destinations are outside this scan.
- Final generated-page checks: **0 issues** across 4,236 localized pages, including 1,464 unreviewed country pages carrying noindex and 84 reviewed pages containing references. Canonicals/public metadata were checked; the intentionally noindex developer showcase is checked for noindex instead of requiring a self-canonical.
- Evidence: `recheck-build.log`, `generated-page-check.json`, `link-check.json` and `final-tests.log`.
- Browser automation is disabled in the current app settings, so this pass does not claim a new visual device/filled-ad inspection. Local HTTP checks and generated output are separate evidence.

## Remaining work, explicitly not claimed complete

Account/region checks remain deferred: site approval and Policy Center, Auto ads and exclusions, CMP delivery/Consent Mode, GA4 automatic collection/retention/audiences, and filled placements on representative mobile/desktop viewports. Asset rights and independent review of the remaining statutory models and translations also require evidence. The build's special-route metadataBase warning is documented in the build log; localized page metadata uses the configured public origin. Do not represent a passing automated audit as approval, a complete manual content review or a revenue guarantee.

## Primary references rechecked

- [Google Publisher Policies](https://support.google.com/adsense/answer/10502938?hl=en)
- [AdSense Program policies](https://support.google.com/adsense/answer/48182?hl=en)
- [Ad placement policies](https://support.google.com/adsense/answer/1346295?hl=en)
- [Ad formats FAQ, including sticky requirements](https://support.google.com/adsense/answer/10734935?hl=en)
- [Google Privacy & messaging JavaScript API](https://developers.google.com/funding-choices/fc-api-docs?hl=en)

The original report links the individual Publisher Policy subtopics used in the broader assessment.
