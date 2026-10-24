# Six-point implementation and release status

19 October 2026, Asia/Calcutta. Release marker: `publisher-readiness-2026-10-19-1`.

## 1. Content quality

Four loan tools now publish engine-calculated comparisons: mortgage, personal
loan, auto loan and student loan. Each comparison changes one input from the
worked-example defaults; rate, shorter term and down-payment effects can be
compared where applicable. Static examples explicitly do not follow calculator
edits. Fixed-rate, payment timing, APR, upfront-cost and local-law limitations
are disclosed. Mortgage publishes its down-payment/payment formula. Copy is
provided in all twelve launch locales. An independent fixed-payment benchmark
and scenario-tradeoff regression checks pass. These improvements do not prove
Google's broad low-value-content finding is cleared.

## 2. Country-model readiness

122 unreviewed country/model combinations have been temporarily withdrawn:
public tool routes return 404, static generation omits them, discovery/search,
related links and footer choices omit them. The compute engines remain for
review and later restoration. Seven combinations with explicit narrow review
records remain published. Empty country directories are withdrawn and omitted
from navigation and sitemaps; unverified consumption-tax rates were removed from directory
headers. The manifest is `withdrawn-models.json`. This is withdrawal rather
than an assertion that the 122 models were independently verified.

## 3. Deployment

Operator confirms Hostinger deploys this repository's `main` branch. Local
`master` tracks `origin/main`; their pre-release commit is a7a711e. Release
commit **ea1bfd8** was successfully pushed to GitHub **main**. After the
operator confirmed Hostinger's build was running, public verification passed
on 19 October 2026 (Asia/Calcutta): release marker 200 with expected value,
mortgage comparison present, consent defaults before the AdSense loader,
withdrawn US income tax and empty UK directory 404, reviewed India model,
privacy and ads.txt 200. All seven checks passed. Hostinger deployment is
confirmed by public output, not assumed from the push.
The new public read-only
`/.well-known/release.json` marker allows checking what the CDN actually serves.

## 4. Consent

Advertising and analytics Consent Mode were enabled/saved in the operator's
screenshots. Local interaction tests cover missing CMP, explicit grants,
reject/revoke, unknown purpose values, expiry, tag gating and API failures.
Public browser inspection reached the Privacy choices fallback; Google's
debug-preview query also did not show the actual Google consent message in
this session. Thus a complete regional live accept/reject/revoke test has not
passed. No optional-consent grant was forced to conceal that result.

## 5. Account settings and media

Authenticated account inspection completed: Policy Center says **No current
issues**. This is separate from the Sites approval rejection. Ads → By site
has no site rows or editable Auto ads toggle, so Auto ads cannot be asserted
OFF or changed through that view. European settings directly confirm both
Consent Mode purposes enabled, 198 ad partners and message coverage enabled.
The published message maps to the correct domain and to
`https://thecalculatorshouse.com/en-us/privacy`. No account setting needed
changing during this inspection.
Logo/icons have operator-supplied AI-generation provenance recorded in
`docs/MEDIA-PROVENANCE.md`. Hero video/poster rights were unconfirmed, so those
files were preserved outside the public folder and their homepage references
were removed. Flag-license records remain. No ownership certificate was invented.

## 6. Review request

Not submitted yet. The operator authorized the six-point work, but a truthful
confirmation that all issues are fixed requires the deployed release and the
remaining live/account checks first. The site's screenshot continues to show
Needs attention — Low value content. Do not represent a code change, saved
Consent Mode setting or passing build as Google approval.

## Validation

Initial full check: 63 tests passed, lint/TypeScript/translation and inventory
checks passed. Final test run: **64 passed** including a new React-script-order
regression. React's async-script hoisting previously placed AdSense before the
inline consent defaults; opting out of hoisting preserves safe document order.
Final production build passed. Generated output: **2,556 localized pages**,
**84 reviewed country pages**, no withdrawn models published, and zero
structural/consent-script-order issues. Final link scan: **2,593 unique internal
destinations**, **218,978 references**, **zero issues**. Special-route metadataBase
warnings remain in the log; localized metadata checks passed. Local visual
inspection was blocked by browser security policy. Later browser use became
disabled in Work settings, preventing further AdSense actions or live UI tests.
No review request has been submitted.

Continuation validation: complete `npm run check` passed with **64/64 tests**,
lint, TypeScript, translation coverage and registry freshness. The post-push
seven-URL release check now passes; `release-check.json` contains the response
statuses. This is a passing release smoke test, not certification of all live
consent flows, filled ads, translated content or Google's approval criteria.
