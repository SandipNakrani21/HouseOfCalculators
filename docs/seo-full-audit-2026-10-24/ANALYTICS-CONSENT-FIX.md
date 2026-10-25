# Analytics consent diagnosis and local fix

25 October 2026. Local source changes; not published or verified in GA Realtime.

The live `/en-us` HTML and its layout JavaScript were fetched read-only. The deployed ID is `G-LB0LPMFZXJ`, matching the supplied GA screenshot. The Analytics component is present. The live Content-Security-Policy permits the Google tag loader and GA collection hosts. These observations do not establish that a visitor event reached GA.

The source required either a TCF `gdprApplies` callback or an explicit Google Analytics purpose grant. A Google Consent Mode response with all purposes `NOT_APPLICABLE` left the local banner unavailable when the TCF callback never resolved. A subsequent Google callback could also overwrite a visitor's explicit outside-TCF choice with denial.

`ConsentBanner.tsx` now lets an all-`NOT_APPLICABLE` response resolve the local choice path, without granting consent automatically. Explicit local Accept/Reject owns the state outside TCF and is preserved across delayed Google callbacks. An authoritative transition into TCF immediately invalidates the local grant and waits for the CMP's purpose decision. Unknown and unconfigured statuses still cannot authorize tracking or determine geography.

Reference: [Google Privacy & Messaging API](https://developers.google.com/funding-choices/fc-api-docs), including `CONSENT_MODE_DATA_READY` and `ConsentModePurposeStatusEnum` values 0–4. This site deliberately retains its stricter opt-in policy rather than interpreting an unconfigured purpose as a grant.

`node scripts/check-analytics-consent.cjs` passed simulated React component checks for: initial blocking; all-not-applicable local choice; Accept loading the tag and producing one page view; no duplicate page view or revocation from a delayed callback; transition to TCF; explicit TCF grant and denial; cookie removal on withdrawal; unconfigured/unknown blocking; preserved rejection; sanitized page address. JSDOM executes no external scripts or network requests. These are component tests, not browser or GA receipt evidence.

The supported browser reports local browser use disabled in Work settings. Consequently the actual visitor CMP response, collection request and GA Realtime receipt remain unverified. AdSense Privacy & messaging must have a published applicable message and Analytics consent configured; if it returns `NOT_CONFIGURED`, that account configuration remains required. No account setting was changed and the screenshot alone does not establish the account state.

Contact Us was also read live at `/en-us/contact`. Its email link and `OPERATOR.email` both use **support@thecalculatorshouse.com**. No email was sent, and mailbox delivery was not tested. The address was retained.

Continuation validation: targeted ESLint and the full `npm run check` both exited successfully. The focused component regression suite was repeated successfully. The production build passed, including all 4,067 generated pages. Its first restricted attempt hit a Windows EPERM when creating a generated page directory; the permitted retry exited successfully. Log: `tmp/analytics-consent-build.log` (local evidence). Windsor.ai's connected-account discovery returned an empty list, so no GA account or event data was available through that connector. No account was connected or modified.
