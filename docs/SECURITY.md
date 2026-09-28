# Security

No website can honestly be called unhackable. What this one has is a small
attack surface, kept small on purpose, with defence in depth over what is
left. This file is the checklist: what is in place, where it lives, and what
does not apply to a site of this shape (and why).

## The attack surface

House of Calculators is a **static, read-only site**.

- Every page is prerendered at build time. Every calculation runs in the
  visitor's browser; their figures are never sent to the server.
- There are **no accounts, no logins, no database, no API routes, no server
  actions, no file uploads** and no forms that post to this origin.
- The only server code that runs per request is the proxy (`src/proxy.ts`):
  HTTPS and method checks, then a locale redirect.
- The only data the site stores is cookies: language and country, plus the
  advertising-consent choice once ads are switched on. None is sensitive.

That shape removes whole classes of attack before any control is needed. Keep
it that way: adding any of the things in the second list means revisiting this
file first.

## In place

| Control | Where | Notes |
|---|---|---|
| HTTPS enforcement | `src/proxy.ts` | Plain-http page requests (via `x-forwarded-proto`) get a 308 to https in production |
| HSTS | `next.config.ts` | 2 years, `includeSubDomains; preload`. Submit to hstspreload.org once the domain is final |
| Content Security Policy | `next.config.ts` | `default-src 'self'`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`; `script-src-attr 'none'`; `upgrade-insecure-requests`. Google's ad hosts are added only when AdSense is configured |
| Clickjacking | `next.config.ts` | `frame-ancestors 'none'` + `X-Frame-Options: DENY` |
| MIME sniffing | `next.config.ts` | `X-Content-Type-Options: nosniff` |
| Referrer leakage | `next.config.ts` | `Referrer-Policy: strict-origin-when-cross-origin` |
| Browser features | `next.config.ts` | `Permissions-Policy` denies camera, microphone, geolocation, payment, USB, sensors, topics and more |
| Cross-origin isolation | `next.config.ts` | `Cross-Origin-Opener-Policy: same-origin`; `Cross-Origin-Resource-Policy: same-origin` except the share card and icons, which link previews embed |
| Framework fingerprint | `next.config.ts` | `poweredByHeader: false` |
| Method restriction | `src/proxy.ts` | Anything but GET/HEAD is refused with 405 |
| Output encoding / XSS | React + `src/lib/seo.ts` | React escapes all rendered text. The only raw HTML is JSON-LD, and `jsonLd()` escapes `<` so data cannot close the script tag. No `eval`, no `innerHTML` from input |
| Input validation | `src/lib/share-link.ts`, `FieldControl`, `src/proxy.ts` | Share-link queries are untrusted: unknown keys dropped, numbers clamped to the field's range, selects must be a listed option, text capped at 500 characters. Inputs clamp on blur. Cookie and `Accept-Language` values are matched against allow-lists before use |
| Open redirects | `src/proxy.ts` | Redirects only ever rewrite the path on the same origin. Checked with `//evil.com`, `/%2F%2Fevil.com`, `/.//evil.com` |
| Secure cookies | `src/lib/preferences.ts` | `SameSite=Lax`, `Secure` on https, `Path=/`, one-year expiry, no sensitive content |
| Secrets | `.gitignore`, `src/config/site.ts` | `.env*` is never committed. The only environment values are `NEXT_PUBLIC_*` ones that are public by design (site URL, AdSense publisher id, newsletter URL). No API keys exist in the code or the bundle |
| Third-party forms | `src/config/site.ts` | The optional newsletter form may only post to an https URL; CSP `form-action` names that one origin |
| Error handling | `src/app/[locale]/error.tsx`, `src/app/global-error.tsx` | Visitors see a generic message and an opaque reference (`digest`), never an error message or stack trace |
| Logging | `src/instrumentation.ts` | Every server error as one JSON line on stderr: time, digest, message, first stack frames, method, path. No headers, cookies or query strings |
| Dependencies | `npm audit` | 0 known vulnerabilities (2026-09-25). Four runtime dependencies: next, react, react-dom, lucide-react |
| Randomness | `src/lib/tools/random.ts` | CSPRNG with rejection sampling, for tools people use to settle things |
| Vulnerability reports | `src/app/.well-known/security.txt` | RFC 9116. Answers 404 until `OPERATOR.email` is set in `src/config/legal/definitions.ts` |

## Not applicable, and why

| Item | Why it does not apply | Revisit when |
|---|---|---|
| Authentication, sessions, authorisation | No accounts or logins | Any sign-in is added |
| CSRF protection | Nothing on this origin accepts a state-changing request; the proxy refuses non-GET methods | A form, API route or server action is added |
| SQL injection, database security | No database; content is configuration in the repository | A database is added (use parameterised queries only, least-privilege credentials, encrypted at rest) |
| API design, CORS | No API. No `Access-Control-Allow-Origin` header is sent, so browsers block cross-origin reads | An API route is added (allow-list origins; never `*` with credentials) |
| Rate limiting, brute force | No endpoint takes input or does costly work; every page is a static file. Volume attacks are the host's job | An API, form or login is added |
| File-upload validation | No uploads | Uploads are added |
| Backups of user data | No user data is stored | A database or uploads are added |

## At deployment (needs the owner)

1. **Host behind a CDN/WAF** (Vercel, Cloudflare or similar). Turn on its DDoS
   protection and a basic rate limit per IP. This is the real rate limiting
   for a static site.
2. **Force https at the edge too**, so files outside the proxy's matcher (the
   sitemap, robots.txt, images) redirect as well.
3. **Collect the server logs** (stderr) and alert on `"level":"error"` lines.
4. **Fill in `OPERATOR`** (`src/config/legal/definitions.ts`). This also turns
   on security.txt and the Organization contact details.
5. **Backups and recovery.** The repository is the whole site: keep it pushed
   to a remote with branch protection. Recovery is a redeploy of the last good
   commit.
6. **Secrets.** Set environment values in the host's settings, never in files.
   Anything prefixed `NEXT_PUBLIC_` is shipped to browsers, so real secrets must
   never use that prefix.
7. **Re-run `npm audit`** before each release and update Next.js promptly on
   security advisories.
8. **Before enabling AdSense**, re-test the CSP with ads live: the policy adds
   Google's hosts automatically, but check the browser console for blocked
   requests.
