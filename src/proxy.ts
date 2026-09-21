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
  const { pathname } = request.nextUrl;
  const [first, ...rest] = pathname.split("/").filter(Boolean);

  if (first && isLocalePath(first)) {
    const locale = localeFromPath(first)!;
    // A locale that is not translated far enough to ship falls back rather
    // than serving a page that would be mostly English.
    if (isLocaleReady(locale.code)) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = `/${LOCALES[DEFAULT_LOCALE].path}/${rest.join("/")}`;
    return NextResponse.redirect(url);
  }

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${LOCALES[locale].path}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

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

