# Google Publisher Policy audit — The Calculators House

Audit date: 18 October 2026 (Asia/Calcutta). Scope: current D:\Calculator source, local development site, and selected responses and browser behavior on https://thecalculatorshouse.com.

**Follow-up:** Code safeguards have since been implemented locally. See [current setup/fix status](SETUP-STATUS.md). The operator's screenshot confirms the regional consent message is Published; the original unavailable-message observation is a delivery/configuration issue to investigate, not evidence that no message was published. The findings below retain the original audit baseline.

**Verdict: the site has substantial working content and useful safeguards, but unconditional policy clearance is not supported. The most urgent outstanding check is production consent-manager delivery. Source-review coverage and the distinction between narrow checks and full verification also need attention.** These are independent audit findings, not a Google enforcement decision or an approval prediction.

## What was actually checked

- Full calculator, tool, converter, chart, guide, locale and manual-ad registries; shared page templates, English policy/disclaimer text, legal configuration, advertising code, consent behavior, analytics configuration, sharing, crawling, and security headers.
- 60 calculators, 23 tools, 13 converter categories, 61 featured conversion pairs, 19 charts and 12 guides. Calculator defaults/worked examples cover 980 supported calculator/country combinations in the existing tests.
- 129 country-specific calculator/country models; 7 have a record in `ruleReview`, 122 do not. This count measures the presence of this specific record, not the truth of every formula. Models can have limitations/data-year text without having a review record.
- Manual ad inventory: 176 content paths across 12 locales. The allowlist excludes home, index/category, legal, unknown and unreviewed country-model paths. An allowlist entry is an engineering decision, not Google approval.
- Existing test suite: **54 passed, 0 failed**, including consent interactions, examples, boundaries and known-answer regression fixtures. Passing tests do not independently validate every tax rate, medical formula or translated claim.
- HTTP evidence: **55 completed, 0 server/network errors: 53 HTTP 200 and 2 expected HTTP 404** (the deliberately invalid route and local ads.txt while local advertising is disabled). See `evidence.json` and `http-check.log`. Coverage includes 49 local paths and 6 public URLs: page families, all five English legal pages, 10 non-English privacy pages, reviewed/unreviewed country models, robots, ads.txt and sitemap.
- Browser observations: local homepage and mortgage calculator; public mortgage calculator, welcome preferences, and Privacy choices. Observed viewport layouts were approximately 786px local and 1264px public. This is not a full mobile/device/ad-format test.
- Important legal, consent, quality and review keys are present in every launch-language dictionary. Presence is not linguistic or legal translation certification.

The scope is comprehensive across the policy categories and shared implementations. It is **not** a claim that every generated URL was manually read, every translation was independently reviewed, or every advertising auction was inspected. No AdSense/Analytics account, traffic logs, asset purchase receipts or regional test infrastructure was available. Historical audit reports were not treated as current proof.

## Findings and required follow-up

### 1. High priority — production Privacy choices cannot reach a working CMP in the observed session

**Observed:** On the public mortgage calculator, after continuing through the language/country dialog, clicking the footer's Privacy choices opened this message:

> The consent manager is not available yet. Optional storage stays denied until a verified choice is available.

Only Reject cookies and Close were offered. No consent acceptance was performed. The page remained usable. This establishes an unavailable consent-management path in this session; it does not prove the CMP is absent everywhere or that unauthorized cookies were set.

**Source:** `src/components/consent/ConsentBanner.tsx` waits for `__tcfapi` and a boolean `gdprApplies`. The source contains consent defaults and a global AdSense loader, but publication of Google's regional message and Consent Mode integration are external settings. The local banner correctly refuses to infer geography from a timeout and does not restore an outside-region grant in a TCF region.

**Action:** Check the domain's published Google-certified CMP message, delivery/CSP/network errors, TCF responses and Google Consent Mode integration. Verify fresh-session accept, reject and revoke flows from the EEA, UK and Switzerland, as well as an outside-region session. Capture actual network/storage behavior before and after each choice. A custom fallback banner or denied defaults alone do not establish a working certified CMP integration.

**Policy:** [Certified CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en) apply to personalized advertising in those regions; [EU user consent policy](https://www.google.com/about/company/user-consent-policy/) also requires the applicable disclosures, valid consent, records and revocation instructions. No blanket claim that every cookieless signal is forbidden is made here.

### 2. High priority verification gap — most country-rule models lack a published source-review record

**Confirmed:** Only 7 of 129 country-model combinations have `ruleReview` coverage. The others are still generated and included in the sitemap. They carry a simplified/unreviewed warning, tax-year/data-scope text where implemented, and are excluded from manually requested ads. Those mitigations are meaningful.

**Source:** `src/config/calculators/provenance.ts`, `src/components/calculator/CalculatorPageBody.tsx`, `src/lib/sitemap.ts`, `src/lib/finance/tax/rules.ts` and the `countryModels` evidence list.

**Implication:** This is an editorial accuracy and readiness gap, not proof that all 122 models are wrong or a rule requiring every site to cite every arithmetic formula. A warning does not verify a statutory model. Automated examples generated by the same engine can reproduce the same underlying mistake.

**Action:** Review each exposed model against its authority and exact tax period, with independent fixtures and explicit exclusions. Prioritize tax/payroll/benefits before expanding monetization. Keep manual ad exclusions until review is complete; decide whether particularly incomplete pages should remain publicly promoted/indexable. Review records must distinguish dated historical estimates from current-year calculations.

**Policy connection:** [Misleading representation](https://support.google.com/publisherpolicies/answer/11185754) and [deceptive practices](https://support.google.com/publisherpolicies/answer/11185755) become relevant if claims overstate the actual capability or verification. Missing citations alone are not declared a violation.

### 3. Medium — the detailed source-review scope is stored but not rendered

**Confirmed:** `RuleReview` contains `scope`, but the sources panel renders only revision, period, check date and source links. For example, the shared Canada review record is explicitly limited to federal slabs/basic personal credit and excludes provincial tax and other credits. That detailed review scope is not printed in the source-review panel. Separate tax-dataset limitations elsewhere partly mitigate this.

**Source:** `src/config/calculators/provenance.ts`; `src/components/calculator/CalculatorPageBody.tsx` around the Sources panel; `calc.ruleReview` in the dictionaries. About/editorial text says pages show the source-review scope.

**Action:** Show the exact `review.scope` beside the checked date. For salary/payroll models, distinguish reviewed income-tax components from other deductions/contributions. A checked date must not imply every component was independently validated.

**Acceptance:** Every reviewed page exposes its review scope and exclusions in the active language, without relying on a reader opening a reference and inferring them.

### 4. High priority external check — Auto ads can operate outside the manual allowlist

**Confirmed architecture:** `AdSlot` applies `isAdEligiblePath`, but `AdScript` loads globally in production, including legal and unreviewed pages. Its comment explicitly says exclusions must also be configured in Auto ads. The global loader was present in public legal-page HTML.

**Not established:** Whether Auto ads are enabled, what exclusions exist, whether ads actually appeared on an excluded page, and the live mobile ad density. Loader presence alone is not an illegal ad impression.

**Action:** In AdSense, verify Auto ads is disabled or mirrors the exclusions, including unreviewed country tools, low-content navigation/error states and internal demonstration pages. Check anchor/vignette/sticky behavior and consent overlays in actual filled inventory. Route changes must not carry an unwanted ad overlay into excluded content.

**Policy:** [Inventory value](https://support.google.com/publisherpolicies/answer/11112688), [interfering ads](https://support.google.com/publisherpolicies/answer/11035030), [Better Ads Standards](https://www.betterads.org/standards/). Excluding all legal/index pages is the site's conservative inventory choice, not a claim Google universally forbids every such page.

### 5. Medium — ad layout stability claims are stronger than the implementation guarantees

**Confirmed source behavior:** Ad containers reserve a minimum height, not a maximum/fixed filled height. An unfilled ad hides the entire wrapper; an unfilled rail can collapse its column and widen the main content. About copy says reserved space means the page never jumps.

**Risk:** Responsive filling and unfilled collapse can change layout after initial paint. Near interactive controls, actual movement could increase accidental-click risk. No filled-ad collision or measured layout-shift violation was demonstrated in this audit.

**Action:** Measure filled/unfilled transitions at desktop and small mobile widths; keep controls safely separated and revise the absolute "never jumps" wording. Ensure consent banners, menus and sticky rails do not cover ads or content. Do not treat the 150px Flash-game recommendation as a universal calculator spacing rule.

**Source:** `src/styles/components.css` ad rules; `src/components/layout/DetailPage.tsx`; `src/components/ui/AdSlot.tsx`; `legal.about.funding.1`.

### 6. Medium verification gap — health guidance and media need provenance evidence

**Observed:** Health pages explain population-level limitations; BMI text excludes children/pregnancy and notes ethnicity differences. Health/fitness engines and guides do not have a general, structured citation/reviewer system comparable to the narrow statutory review records. Water guidance uses a 35ml/kg baseline plus exercise estimates. This audit has not established that this guidance is harmful or contradicts authoritative consensus.

**Action:** Add primary references and formula-specific applicability/exclusions where health guidance is presented as a target. Independently review such guidance. Maintain a media provenance/license inventory for branding, landing icons, videos and posters. `public/flags/LICENSE.txt` documents one flag collection; absence of receipts for other assets is not proof of infringement, and original assets may need no third-party license.

**Policies:** [Unreliable/harmful claims](https://support.google.com/publisherpolicies/answer/11188580), [intellectual property](https://support.google.com/publisherpolicies/answer/10402772).

### 7. Medium external check — sensitive audience use and real privacy behavior remain unverified

**Confirmed safeguards:** No explicit custom audience creation or calculator-input targeting was found in source. Calculations run locally. New calculator share links use fragments; analytics page-location values omit query and fragment. Legacy query links remain accepted. Default storage/personalization consent is denied, and local grant choices require an authoritative outside-TCF response.

**Limits:** A fragment is hidden from HTTP requests but remains readable to scripts on the page. Cleaning analytics `page_location` does not independently prove that AdSense requests, referrers, enhanced measurement, Google Signals or audience settings cannot expose/use sensitive information. Health or financial subject matter alone does not automatically prohibit contextual ads.

**Action:** Inspect production request payloads/storage and GA4/AdSense settings. Do not create sensitive health/negative-financial-status audiences from calculator use/inputs. Check legacy URLs, automatic events, referrers, newsletter enablement and data retention against the disclosures. Validate withdrawal as well as first acceptance. The visible policy should accurately describe actual Google/partner processing.

**Policies:** [Personalized advertising](https://support.google.com/publisherpolicies/answer/15101728), [identifying users](https://support.google.com/publisherpolicies/answer/10436913), [privacy disclosures](https://support.google.com/publisherpolicies/answer/10437794).

## Policy-by-policy coverage

Status meanings: **No issue found** = no contrary evidence in the inspected implementation/content; **Gap/Risk** = finding above; **External** = account/rights/traffic/regional evidence needed; **Not applicable observed** = the relevant feature/content was not found. None means Google-approved.

| Topic/subtopic | Result and evidence |
|---|---|
| Illegal content | No issue found in the calculator/reference purpose and inspected content; no illicit transaction feature found. |
| Intellectual property abuse | External asset-rights evidence remains needed; flag license is recorded. No copied-source infringement was established. |
| Dangerous/derogatory content | No issue found in inspected English content and tool definitions; no hate, harassment, extortion or violence promotion found. |
| Animal cruelty | Not applicable observed. |
| Misleading representation | Operator name/contact/jurisdiction populated; estimates and limitations disclosed. Review-scope and absolute layout claims need improvement (3/5). |
| Unreliable/harmful claims | No authoritative-consensus contradiction established. Independent health/statutory validation remains incomplete (2/6). |
| Deceptive practices | Working tools and results; no fake download/earnings flow found. Do not overstate source review (2/3). |
| Manipulated media | No political/public-concern deceptive-media purpose found; media provenance not fully established. |
| Enabling dishonest behavior | Password/random tools are general utilities; no unauthorized access, fake-document or surveillance feature found. |
| Sexually explicit content | Not applicable observed. |
| Compensated sexual acts | Not applicable observed. |
| Mail order brides | Not applicable observed. |
| Adult themes in family content | Not applicable observed. |
| Child sexual abuse/exploitation | No such content/feature found. |
| Dishonest declarations | Source and public ads.txt agree on publisher ID. Account identity, ownership, payment/traffic declarations are External. |
| Ads interfering with content/interactions | Manual placements separated/labeled; no ads animated by reveal observer. Filled inventory/Auto ads/overlays External (4/5). |
| Ads without publisher-content/low-value/unfinished | Manual allowlist excludes navigation/error/legal/demo pages; substantive examples exist. Auto ads External. No arbitrary minimum word count imposed. |
| Out-of-context ads | No pop-under, idle-tab ad timer or extension injection found. Live background/request behavior not fully captured. |
| Replicated content | Own compute engines/examples provide utility. Originality cannot be certified by source-only inspection or short known-answer tests; no plagiarism determination made. |
| More advertising than publisher-content | Manual positions limited; cannot certify actual density without filled units and Auto ads. Navigation/whitespace are not counted as substantive publisher-content. |
| Unsupported languages | Twelve launch locales use supported primary languages. Important translation keys exist; full translated prose review is pending. |
| Personalized advertising | No input-based custom targeting found; sensitive audiences/account settings External (7). |
| Privacy disclosures | Privacy/cookies pages and contact available; analytics disclosure production-dependent. Align with real payloads/retention/vendors (7). |
| Cookies on Google domains | No code setting, modifying or intercepting Google-domain cookies found. |
| Identifying users | No account/PII input field identified in calculators; share/query/referrer payload verification remains needed (7). |
| Device/precise location | No GPS collection found; geolocation permission disabled. Selected country is a preference, not precise GPS location. |
| COPPA | General-purpose site; math/education categories alone do not prove child-directed status. Actual audience/child-directed treatment External if the audience changes. |
| Search spam policies | Real tools, browseable hierarchy, clean canonicals, translation gates, server-rendered explanations. Similar templates alone are not doorway abuse. Unreviewed country expansion needs editorial review (2). |
| Abusive experiences | No forced download, fake close/navigation action, pop-under or back-button trap found. Welcome preferences are dismissible by Continue. |
| Malware/unwanted software | No executable download/install or malicious code purpose found. Not a malware certification or penetration test. |
| Better Ads Standards | Source layout is conservative; filled mobile/desktop and account format settings External (4/5). |
| Authorized inventory | Public `/ads.txt` returned 200 with matching Google DIRECT seller and certification ID. Account ownership/approval External. |
| Sanctions compliance | Operator configuration says Gujarat, India. Identity/beneficial ownership/business relationships not independently verified. |

Related AdSense Program checks: no encouragement to click ads, click compensation, click-exchange, automated ad refresh or custom ad-click handlers were found. Ad labels say Advertisement; utilities do not require clicking an ad to calculate. Actual invalid traffic, self-click history, paid acquisition quality, policy-center status and monetization approval require account/traffic evidence. The audit did not click any ads.

Related Publisher Restrictions: no adult merchandise, weapons, tobacco/drug sales, gambling transactions, online prescription sales or comparable restricted commercial content was identified. Probability/random utilities are not themselves proof of a gambling service. Ad/content occlusion and video-inventory restrictions need reassessment if those ad formats are enabled; the decorative hero video is not evidence of monetized video inventory.

## Good controls already present

- Calculations produce actual results, examples, breakdowns and limitations; tools remain usable without accepting optional storage.
- Unknown and unreviewed country models cannot receive manually requested ads through the current allowlist.
- Ad slots have labels and spacing; reveal/parallax selectors do not target ad slots.
- Privacy/terms/cookies/about/contact pages are discoverable from the footer; operator details are populated (README's older "unset" statement is stale).
- Consent grants are versioned, expire logically after 180 days and are not restored in a known TCF region. Unknown CMP state does not become an automatic grant.
- New shared inputs are excluded from HTTP query strings; invalid shared values are validated. Analytics page addresses are cleaned in source.
- Public ads.txt matches the configured publisher. HTTPS/security headers, canonical metadata and crawler configuration are implemented.

## Completion criteria, in priority order

1. Resolve/explain the production unavailable-CMP observation; prove region-appropriate accept/reject/revoke behavior and real storage/network outcomes.
2. Verify Auto ads exclusions and actual filled-ad layout/density at small mobile and desktop sizes.
3. Publish exact source-review scope; expand independent authority-based review of statutory and health guidance.
4. Verify real tracking/audience settings and reconcile disclosures with retention, vendors and any enabled forms.
5. Complete media-rights records, translated-prose review and account/traffic checks.

No application features, ad account settings, legal copy or monetization settings were changed by this audit. The pre-existing scroll-animation edits were preserved. A generated development-cache failure encountered during HTTP collection is documented separately; it is not treated as a proven public-site policy violation.

## Primary references

- [Google Publisher Policies](https://support.google.com/adsense/answer/10502938?hl=en)
- [AdSense Program policies](https://support.google.com/adsense/answer/48182?hl=en)
- [Publisher Restrictions](https://support.google.com/adsense/answer/10437795?hl=en)
- [Ad placement policies](https://support.google.com/adsense/answer/1346295?hl=en)
- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Better Ads Standards](https://www.betterads.org/standards/)
- [Google consent-manager requirements](https://support.google.com/adsense/answer/13554116?hl=en)
- [EU user consent policy](https://www.google.com/about/company/user-consent-policy/)

Evidence files are local audit materials and were not published to the website.
