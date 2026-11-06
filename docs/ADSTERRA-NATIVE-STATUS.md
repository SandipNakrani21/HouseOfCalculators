# Adsterra Native Banner — 6 November 2026

## Release status

Release candidate. Disabled unless `NEXT_PUBLIC_ADSTERRA_ENABLED=true` is set
when building. Set it to `false` and rebuild/redeploy to switch off. Production
HTTPS acceptance and publication evidence will be appended after deployment.

Approved website: 6180024. NativeBanner_1: 32124553.
Public placement key: `77c6f84cefe4773be0e3fd3546792638`.
The exact public script and container are included once in the consent-gated
`/api/adsterra-native` response. No extra ad formats or ads.txt changes.

## Behavior and disclosure

- One labelled placement after useful content, restricted by the existing exact
  ad inventory. No advertising on privacy, cookies, errors or unknown routes.
- Separate `hoc_adsterra_v1` vendor/version cookie, valid for 180 days. Unknown,
  denied, malformed, expired and Google-only choices cannot load vendor code.
- Equal allow/reject controls and disclosure cover all 12 launch locales (US/UK
  share English). Choices remain accessible on privacy/cookies pages. The copy
  describes cookies/storage, IP, browser/device data, page visits, selection,
  measurement, personalisation and limits of revocation. Translation coverage
  does not represent native-speaker or legal certification.
- The native document is dynamic, private/no-store, noindex, and only emits the
  snippet for an iframe request with current explicit vendor consent.
- Header and HTML CSP restrict scripts/connections to bauval.org and images to
  reviewed HTTPS origins. HTML omits header-only frame-ancestors. Nested frames,
  objects, base URLs and form submissions are blocked. Main pages add only
  same-origin frame permission when enabled.
- The sandbox prevents top-page navigation and permits advertised links to open
  separately. Scripts plus same-origin permission are required for the vendor's
  cookie access: this is lifecycle containment, not malicious-code isolation.
- Before detach/revocation, an owned function installs a deny-network policy and
  stops loading. Full-page pagehide also stops the document. A persisted pageshow
  replaces a stopped document. In-flight requests/data already sent cannot be
  recalled. Another open tab observes cookie changes within the one-second poll.
- Starting the document is deferred until the committed frame is attached and
  consent is rechecked; cleanup cancels pending starts. There is no ad refresh,
  retry loop or duplicate placement on a rerender. Frame height follows content;
  blocked/empty content keeps only the advertisement label.

## Browser and network checks

Connected Chrome extension access works in this continuation. Explicit user
permission was obtained for test requests to Adsterra and its partners. No live
ad links were clicked; account/category filters were not changed.

Temporary app diagnostics confirmed HTTP CSP img-src violations for the vendor's
protocol-relative creative URLs. Adding upgrade-insecure-requests to the native
policy produced HTTPS image requests and visible images, without HTTP origins or
wildcards. Observed script/XHR/metrics/fetch origin: https://bauval.org; observed
creative origin: https://cdn.storageimagedisplay.com. static.nresystems.com remains
a reviewed identifier-sync image origin. Other campaign origins remain blocked.
cdn.cloudvideosa.com was a click destination, not an allowed script/frame origin.

Real creative images rendered at phone, tablet and desktop widths. The phone
layout stacked cards; wider layouts used four columns without page overflow.
The length converter returned 32.8084 feet for 10 metres and reset correctly.
Fresh unknown and valid Google-only choices produced no native frame; an explicit
grant produced one and revocation removed it. Privacy navigation removed it.

Controlled local fixtures (not shipped) exercised blocked scripts, no-fill and
15-second delayed fill. Inputs/reset remained usable, empty/blocked frames had
zero content height, and delayed content resized the frame. A controlled unload
probe reached the local server before shutdown; the same pagehide beacon did not
reach it after revocation installed the deny-network policy. sendBeacon returned
true in both cases: its return value alone is not delivery evidence. This proves
the controlled request was suppressed, not an exhaustive audit of every future
vendor version. Temporary diagnostics, local-only policy allowances, fixtures,
raw vendor metrics/identifiers and private account evidence are excluded from Git.

Local HTTP first-load/frame observations were inconsistent during navigation and
browser background operation. A committed-frame start corrected an observed
initialisation race; production HTTPS first load, Back and effective host policy
still require live acceptance. Do not equate script installation with acceptance.

## Validation

- `node scripts/check-adsterra.cjs`: passed, including valid Google-only consent,
  malformed/expired records, exact snippet, no-store, inventory, Strict Mode,
  committed document start, navigation, revoke, pagehide and persisted pageshow.
- Full `npm run check`: passed, 0 errors / 1,539 existing warnings, including
  unrelated untracked audit/download material. No unrelated files are staged.
- Enabled production build `jHmexispi4JWnix2wtGhF`: passed all 4,067 pages.
- Focused lint and scoped whitespace checks passed before publication.

Public Hostinger headers currently preserve the app CSP and add a separate
upgrade-insecure-requests policy. The new endpoint's no-store, SAMEORIGIN and
narrow effective policies must be checked after its deployment. The code stays
disabled by default; Hostinger's build-time activation variable is the intended
production control. No earnings, approval or Google traffic-recovery claim.
