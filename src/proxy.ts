import { NextResponse, type NextRequest } from "next/server";

import { isCountryCode } from "@/config/countries";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_CODES,
  isLocalePath,
  localeFromPath,
  matchAcceptLanguage,
  type LocaleCode,
} from "@/config/locales";
import { SITE_ORIGIN } from "@/config/site";
import { LOCALE_COOKIE } from "@/lib/preferences";
import { isLocaleReady } from "@/lib/seo";

/**
 * Every page lives under /{locale}. A request without one is redirected to the
 * best guess: the visitor's stored choice first, then their browser languages,
 * then the CDN's country hint, then the default locale.
 *
 * Redirects are never used to *hide* other locales - each one stays reachable
 * at its own URL so search engines can crawl all of them.
 */
export function proxy(request: NextRequest) {
  // The address the visitor typed. Behind a host's reverse proxy the server
  // itself listens on an internal address, so the public one comes from the
  // forwarded headers.
  const publicHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const host = publicHost.split(":")[0].toLowerCase();
  const scheme = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  /** The same request on the public address, at another path. */
  const at = (pathname: string) => {
    const url = new URL(`${scheme}://${publicHost}${pathname}`);
    url.search = request.nextUrl.search;
    return url;
  };

  // HTTPS only. Hosts terminate TLS in front of the app and pass the original
  // scheme in `x-forwarded-proto`; a plain-http page request is sent to https
  // before anything else, and HSTS (next.config.ts) keeps the browser there.
  // The local dev server is plain http and exempt.
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") === "http" &&
    !LOCAL_HOSTS.has(host)
  ) {
    const secure = request.nextUrl.clone();
    secure.protocol = "https:";
    secure.host = host;
    secure.port = "";
    return NextResponse.redirect(secure, 308);
  }

  // One public address, so the site is not indexed twice: www and any
  // *.vercel.app alias send visitors and crawlers to the same page on the
  // custom domain, permanently. The host's temporary preview address is left
  // alone so a new server can be tested before the domain moves to it, and so
  // are Vercel preview deployments.
  const canonical = new URL(SITE_ORIGIN);
  if (
    process.env.NODE_ENV === "production" &&
    host !== canonical.hostname &&
    (host === `www.${canonical.hostname}` ||
      (host.endsWith(".vercel.app") && process.env.VERCEL_ENV !== "preview"))
  ) {
    const moved = request.nextUrl.clone();
    moved.protocol = canonical.protocol;
    moved.host = canonical.host;
    moved.port = "";
    return NextResponse.redirect(moved, 308);
  }

  // Every page is static and read-only: nothing here accepts a submission
  // (no forms post to this origin, no server actions, no API). Anything but a
  // read is refused before it reaches rendering.
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new NextResponse(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  const { pathname } = request.nextUrl;
  const [first, ...rest] = pathname.split("/").filter(Boolean);

  if (first && isLocalePath(first)) {
    const locale = localeFromPath(first)!;
    // One URL per page: /EN-US/... is the same page as /en-us/..., so it
    // redirects permanently rather than serving a duplicate.
    if (first !== locale.path) {
      return NextResponse.redirect(at(`/${locale.path}${rest.length ? `/${rest.join("/")}` : ""}`), 308);
    }
    // A locale that is not translated far enough to ship falls back rather
    // than serving a page that would be mostly English.
    if (isLocaleReady(locale.code)) return NextResponse.next();

    return NextResponse.redirect(at(`/${LOCALES[DEFAULT_LOCALE].path}/${rest.join("/")}`));
  }

  const locale = pickLocale(request);

  // The bare domain shows the default locale's home page in place when that
  // is the best guess, instead of redirecting. Crawlers (which send no
  // language) then find the home page, with its AdSense verification tag, at
  // the address they asked for; its canonical link still names /en-us, so it
  // is not indexed twice. Anyone else is still sent to their own language.
  if (pathname === "/" && locale === DEFAULT_LOCALE) {
    const home = request.nextUrl.clone();
    home.pathname = `/${LOCALES[DEFAULT_LOCALE].path}`;
    return NextResponse.rewrite(home);
  }

  return NextResponse.redirect(at(`/${LOCALES[locale].path}${pathname === "/" ? "" : pathname}`));
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function pickLocale(request: NextRequest): LocaleCode {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && (LOCALE_CODES as string[]).includes(saved) && isLocaleReady(saved as LocaleCode)) {
    return saved as LocaleCode;
  }

  const fromHeader = matchAcceptLanguage(request.headers.get("accept-language"));
  if (fromHeader && isLocaleReady(fromHeader)) return fromHeader;

  // Vercel and Cloudflare both expose the visitor country in a header. It is a
  // weaker signal than an explicit language preference, so it comes last.
  const geo = (
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    ""
  ).toLowerCase();
  if (isCountryCode(geo)) {
    const match = LOCALE_CODES.find(
      (code) => LOCALES[code].defaultCountry === geo && isLocaleReady(code),
    );
    if (match) return match;
  }

  return DEFAULT_LOCALE;
}

export const config = {
  // Skip Next internals, the API surface and anything that looks like a file.
  //
  // The generated metadata routes have to be named too. They carry no file
  // extension, so without this the locale redirect swallows /opengraph-image
  // and every shared link loses its preview image.
  //
  // Next statically analyses this, so it has to stay a literal - it cannot be
  // built from a constant. `tests/hreflang.test.ts` reads the literal back out
  // of this file rather than keeping a second copy that could drift.
  matcher: [
    "/((?!_next|api|(?:opengraph-image|twitter-image|apple-icon|icon|manifest)(?:/|$)|.*\\.[\\w]+$).*)",
  ],
};

