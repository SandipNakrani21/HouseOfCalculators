# Adsterra Native Banner — 6 November 2026

## Release status

Production pilot release candidate. Development is off unless explicitly enabled;
production is enabled in the reviewed repository configuration, following the
existing provider pattern. `NEXT_PUBLIC_ADSTERRA_ENABLED=false` overrides it at
build time; rebuild/redeploy to switch off. Live HTTPS acceptance is appended below.

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
  does not represent native-speaker or legal certification. Enabled privacy and
  cookie pages replace exclusive Google-only/no-local-storage claims, identify
  the separate cookie and update their policy date. Google sections are retained.
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

Local HTTP first-load/frame observations were inconsistent during navigation,
background operation and concurrent development/production filesystem updates.
Document start now waits for a committed frame and can be cancelled during ref
replay. Production HTTPS first load and Back still require live acceptance.
Do not equate script installation with acceptance.

## Validation

- `node scripts/check-adsterra.cjs`: passed, including valid Google-only consent,
  malformed/expired records, exact snippet, no-store, inventory, Strict Mode,
  committed document start, navigation, revoke, pagehide and persisted pageshow.
- Full `npm run check`: passed, 0 errors / 1,539 existing warnings, including
  unrelated untracked audit/download material. No unrelated files are staged.
- Production pilot build `cJxPPYxEUANOKuZbM4paP`: passed all 4,067 pages.
  Rendered privacy/cookie disclosure checks passed all 24 launch-locale pages.
  The final CI build additionally covers the last cookie-introduction correction.
- Standalone package `jHmexispi4JWnix2wtGhF`: 48 locale/route smoke checks and
  18 script assets passed with normal local networking. The initial restricted
  run could not contact its own server; it was not an application-start failure.
- Focused lint and scoped whitespace checks passed before publication.

The disabled first-stage commit `2bef1cc57d4ebb276362263dd3d54d92b4004251`
was pushed and remote verified. GitHub run 42233155952 passed checks, build,
packaging and Linux runtime verification. The live endpoint returned 200/empty,
private/no-store, SAMEORIGIN and the intended narrow CSP plus Hostinger's separate
HTTPS-upgrade policy. No Hostinger environment variables were added. Final pilot
activation uses the repository production setting and explicit false override.
No earnings, approval or Google traffic-recovery claim.
