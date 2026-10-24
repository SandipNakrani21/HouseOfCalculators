# AdSense policy / current-code recheck — 24 October 2026

## Conclusion and scope

Reviewed the current local working tree against Google's official policy pages,
including the earlier eighteen content improvements. Found and corrected an
accuracy overstatement on About and resolved the separately recorded concrete
whole-bag rounding defect. The latter is a functional finding, not a Google
policy notification. No new confirmed prohibited-content or deceptive-ad-code
finding was identified in the inspected source paths.

**This is not an AdSense compliance certificate, a Google review, or a claim
that the previous “Low value content” rejection has been cleared.** Inventory
value is a qualitative assessment; adding eighteen improvements cannot prove
that every translated page satisfies it. No arbitrary word-count threshold was
used. Account settings, actual creatives, traffic and live CMP behavior remain
outside what source inspection can establish.

All corrections remain local. No commit, push, deployment or review submission
was made. Existing unrelated edits were preserved.

## Current official references

Retrieved during this recheck:

1. [AdSense Program policies](https://support.google.com/adsense/answer/48182?hl=en)
2. [Inventory value / screens without publisher content](https://support.google.com/publisherpolicies/answer/11112688?hl=en)
3. [Ad placement](https://support.google.com/adsense/answer/1346295?hl=en)
4. [Required privacy disclosures](https://support.google.com/adsense/answer/1348695?hl=en)
5. [EU user consent policy](https://www.google.com/about/company/user-consent-policy/)
6. [Certified CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en)
7. [Web-search spam policy incorporated by Publisher Policies](https://support.google.com/publisherpolicies/answer/11035931?hl=en)
8. [Google Privacy & messaging API](https://developers.google.com/funding-choices/fc-api-docs)

## Findings fixed

### A — About overstates numerical accuracy

- Pages: `/{public-locale}/about`, all twelve public locales.
- Previous text said conversions were correct by definition and that tables
  could never drift. The code also uses rounded factors, floating-point
  arithmetic and display rounding; shared engines are not independent proof.
- Fixed `legal.about.numbers.1`: distinguishes exact definitions (inch/cm) from
  rounded factors, float arithmetic and rounded presentation; shared tables help
  consistency without guaranteeing accuracy. The English regional override was
  regenerated. Changed About date was already 2026-10-24.
- Also aligned the unused legacy `quality.editorialChecks` dictionary entry with
  the truthful current About check description. No rendered use of that legacy
  key was found; it is not counted as a second public-page violation.
- Policy connection: truthful claims and useful content. This is an editorial
  correction inferred from the code, not a URL identified by Google.

### B — Concrete whole-bag boundary

- Calculator: `/{public-locale}/calculators/construction/concrete`.
- Inputs in consistent length units: length 5, width 4, thickness 0.1,
  waste 10%, bag yield 0.011. Exact decimal volume/yield = 200 bags; binary
  arithmetic produces 200.00000000000003 and the prior ceiling displayed 201.
- Small source correction in the whole-bag output removes a relative machine
  epsilon before the ceiling. Formula, volume, waste, supplier yield and mix
  assumptions are unchanged. A real noninteger remainder still rounds upward.
- Direct function checks use each public locale's actual default-country
  formatting/context: twelve corrected results = 200; twelve positive-remainder
  cases remain rounded upward. No interaction with ads was required.
- This resolves the open numerical item in the earlier items 14–18 report. It
  is not an all-calculators arithmetic audit or a Google policy determination.

## Source review matrix

| Area | Evidence / current result | Limits |
|---|---|---|
| Manual-ad inventory | Exact allowlist has 257 content paths × 12 public locales; all 3,084 combinations resolve eligible. 209 sampled legal/navigation/error/unknown/nonpublic paths resolve ineligible. | Eligibility is a routing decision, not Google approval of the content. Does not constrain account-controlled Auto ads. |
| Publisher content | Shared DetailPage renders explanations/FAQs before the inline position; chart/converter pages use one manual position; country rule pages require source-review coverage. Prior content fixes retained. | No claim of human review of every language/page, independent expert certification or all-page low-value clearance. |
| Manual placement | Ad units are separate labelled as advertisements, fixed-height/width-bounded; rail scrolls with content rather than floating; hidden-width positions do not request a unit. No ad click handler or timer refreshing ads found in inspected ad code. | Actual creative fit, density, overlaps, accidental-click risk and Auto ads require visual/browser checks. |
| Consent defaults | Rendered ConsentScript evaluated locally: ad_storage, ad_user_data, ad_personalization and analytics_storage denied; ad requests paused initially. | Initial defaults do not prove a real regional CMP decision/revocation flow works. |
| Consent resolution | ConsentBanner uses Google's documented purpose fields and callback queue. Only explicit grants unlock purposes; missing CMP/geography remains pending; no timeout grants. Footer/Privacy/Cookies expose privacy choices. | Certified CMP publication, vendor list, all needed message languages and geography must be verified live/account-side. |
| Analytics | Loader requires explicit analytics consent; revocation disables events and clears GA cookies. Page address/referrer are stripped of query/hash. | Actual network behavior and account Enhanced Measurement settings were not inspected. |
| Privacy / contact | Disclosures cover Google/partners, prior-visit ad cookies, identifiers, opt-out links, hosting/preferences, optional email processing and support mailbox. Operator details configured. | Operator retention practice and account vendor selections must agree with the text. |
| Crawlability / authorized seller | robots source permits public crawling and only excludes /api. ads.txt generator uses the configured public publisher ID and Google seller line. | Does not prove the current live response, host access, account ownership, eligibility or approval. |
| Nonpublic locales | Gate excludes hi-in, gu-in, mr-in, ar-ae and pl-pl sample paths. Public review only covers en-US, en-GB, de-DE, fr-FR, es-ES, pt-BR, ru-RU, tr-TR, ja-JP, zh-CN, it-IT, nl-NL. | Generated fallback dictionaries are not evidence of public readiness. |
| Invalid traffic / restricted content | No incentivized ad-click behavior or auto-refresh added/found in inspected integration. | Actual traffic sources, own clicks, account sanctions/eligibility and all uploaded/external material cannot be certified from repository code. |

## Still needs live/account verification before re-review

1. Deploy the local changes and verify the deployed pages match them. Current
   local build success is not evidence of the live release.
2. Check the current AdSense site status / Policy Center. The supplied historical
   screenshot establishes “Low value content”, not eighteen flagged URLs or a
   new Google decision.
3. Check Auto ads state and exclusions for navigation/search/favourites/legal/
   error pages. Manual slot gating does **not** gate Auto ads; the global AdSense
   tag is deliberately available so Google's published consent message can load.
   Removing that tag from those routes without another CMP loader could break
   consent access, so no speculative tag change was made.
4. Verify accept, reject, manage/revoke and expiry behavior in EEA/UK/Switzerland,
   including actual TCF signals and network/storage state. Earlier screenshots
   show a published European message with seven selected languages and vendor
   settings, but do not prove current live delivery or all relevant coverage.
   No new account setting was changed or assumed correct.
5. Check region-appropriate US state opt-out settings where applicable. A missing
   message in an old screenshot is not by itself a proven violation for this
   publisher; applicability and serving configuration need actual review.
6. Visually check actual filled ads at desktop/tablet/mobile, including dropdowns,
   scrolling and short screens. No browser access setting was bypassed, no live
   ads were clicked or generated for this audit, and no browser QA completion
   is claimed.
7. Complete any needed native-language / financial / health editorial review.
   Dictionary completeness and same-engine examples are not such certification.

## Validation

- Project check: PASS (metadata, client dictionaries, inventory, lint, TypeScript
  and translation coverage). Three pre-existing warnings in archived docs helpers;
  zero errors. No unit/component test files were added or run.
- Function-level evidence: `source-evidence.json`; no browser or ad requests.
- Production build: PASS (exit 0), 4,067 pages generated. Build ID
  `DaNmblf3qU9hzeIZx3r3A`.
- Generated HTML: **96/96 pages passed**, zero failures: five legal pages and
  three construction pages per public locale. Checks include the corrected About
  copy, privacy/source/opt-out and support links, lack of manual slots on legal
  pages, consent-default script before the actual ad-loader tag, and preserved
  construction interpretation content. These are artifact checks, not live ads.
- Generated ads.txt seller line matches the configured publisher ID; generated
  robots.txt permits public crawling. Neither was fetched from the live host.
- Changed-file lint and `git diff --check`: PASS.
- No claim of live visual/interactive QA or all 2,880 responsive combinations.

Evidence: `check.log`, `build.log`, `source-evidence.json`,
`generated-page-evidence.json`.
