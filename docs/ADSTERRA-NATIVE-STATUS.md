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

## Pilot publication follow-up

Explicit production activation was authorised by the user. Commit
`af5f796e8342d005acbe86a6289f3c5cfff5769a` was pushed and remote verified;
Hostinger published the enabled choices and policies. GitHub run 42235581205
passed project checks and production build, but its package step rejected the
two newly traced public disclosure JSON files. The package allowlist now permits
only those two exact additional runtime dictionaries. Local corrected package
and standalone verification passed (48 routes, 18 scripts).

Live unknown/revoke checks remove the native frame. The live first grant/remount
has so far remained collapsed; images are not yet accepted on production.
Non-sensitive native-document state attributes and an on-load size fallback
distinguish an empty server consent response from a blocked document/vendor.
No browser blocking or access controls were disabled. Final CI/deployment and
live delivery acceptance remain pending; this is not completed ad delivery.

The package correction passed CI (run 42237554531). The early-startup diagnostic
release `1a1ff6e5973ea3fe7ce03fe13c11d147b999eebf` passed CI (run 42239114108)
and its response marker is live on Hostinger. All 24 public privacy and cookie
pages across the 12 launch locales passed disclosure checks. The production
converter passed input, swap and reset checks in connected Chrome.

An HTTP-only production check exercised missing consent, denial, grant,
top-level navigation with a grant, and missing consent again after the grant.
All five responses were private/no-store. Only the granted iframe request
contained the vendor script. This check did not execute the vendor script.

The live browser frame still showed zero height and no startup marker in the
last connected Chrome observation. The next diagnostic is the iframe's Network
entry in a fresh connected Chrome tab after granting consent and bringing the
placement into view. Record the request status or browser block and whether
the response starts the frame before testing live creative images and Back.
The extension again reports local browser use is disabled in Work settings,
so those browser acceptance checks are still open. The pilot remains enabled
with its independent consent gate.

## Connected Chrome continuation

Chrome extension access worked in a fresh tab on the public length converter.
The profile had a saved grant, so the test revoked it before selecting Allow
Adsterra ads again. The denied state had no native iframe. With the placement
in view, the first grant produced a 1px iframe whose URL attribute pointed to
`/api/adsterra-native`, but the frame document was `about:blank` and all three
delivery markers were absent. The browser's resource inventory later listed
the endpoint on a repeated grant, without exposing its HTTP status.

A full page reload with the explicit grant saved rendered four visible creative
images. The frame was 272px tall with `data-adsterra-state="ready"`,
`data-adsterra-cards="4"` and no `data-adsterra-policy` marker. Opening Privacy
Policy removed the frame. Back restored a collapsed frame with all three
markers absent. Revoking removed the iframe immediately, and a fresh visit
showed the denied choice and no native iframe. No live ad was clicked.

The candidate fix mounts the consented iframe with its endpoint URL in the
initial commit. The previous implementation mounted a blank iframe and assigned
its URL in a timer. The server's explicit vendor-cookie and iframe checks,
visibility gate, CSP and frame shutdown remain in place. The focused consent
and lifecycle check, scoped ESLint and TypeScript check passed. First-grant
and Back creative rendering still need verification after deployment. The
workspace denied creation of `.git/index.lock`, and Git could not resolve
GitHub from the shell at that point.

## Production verification for `78fe856e`

The owner committed and pushed the three reviewed files to `main` from Windows
PowerShell. GitHub Actions Project checks run 42246806666 completed successfully.
Connected Chrome verified the public length converter after the push. With the
denied choice set, there was no iframe. Selecting Allow Adsterra ads displayed
four creative images without reloading. The frame was 272px tall, with state
`ready`, four cards, and no policy violation marker. Chrome listed the frame
endpoint as a resource, but its HTTP status was not exposed by the extension.

Privacy Policy navigation removed the iframe. Browser Back returned to the
converter, where bringing the placement into view restored a 272px frame with
state `ready`, four cards and visible creative imagery. Revocation immediately
removed the frame and persisted across reload. No live ad was clicked.

## Three-card layout and broader content coverage

Adsterra placement `32124553` was changed from `4:1` to `3:1` in the
publisher dashboard. The generated snippet stayed the same. Live Chrome QA
confirmed three visible creatives after explicit consent on the length
converter and immediate removal on revocation. The Adult ads control on the
existing unit was off and read-only. The test still received dating and casino
creatives, so the switch alone did not establish family-safe inventory.

The local coverage change adds one native widget to the homepage, populated
content listings, guides and tool detail pages. The homepage starts loading
after hydration with saved consent, including on reload. Other content
placements wait until visible where the browser supports intersection
observation. Privacy, cookies, other legal pages and error routes retain no
native placement. The change does not modify Google's placements or consent.
The rollout is pending confirmation of the relevant publisher category filters.

## AdSense removal and calculator sidebar

The local migration removes the AdSense loader, units, seller declaration and
advertising domains from the page policy. Calculator pages with a rail now
mount one Adsterra widget in that rail. The same widget appears after the main
content on narrow screens. The sidebar loads on page visit with saved explicit
Adsterra consent. Privacy choices in the footer contains the Adsterra and
optional Google Analytics controls. Analytics has its own saved choice and
never grants Adsterra consent. The existing publisher-side `3:1` layout is
retained. The new sidebar still requires live creative verification after a
GitHub deployment.

## Display banner placements requested

The publisher dashboard shows three additional active display units for
thecalculatorshouse.com. Adult ads was off when the units were created.

| Publisher unit | Size | Intended placement |
| --- | --- | --- |
| `32130507` | 160 × 600 | Right sidebar on calculator pages |
| `32130508` | 728 × 90 | Dismissible bottom anchor on desktop |
| `32130509` | 320 × 50 | Dismissible bottom anchor on mobile |

The snippets are available in the publisher dashboard. Website integration
is pending confirmation of the requested category exclusions and of a
supported consent-gated embedding method for the fixed bottom anchor.
