import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_COUNTRY,
  defaultLanguageFor,
  isCountryCode,
  resolveLanguage,
  type CountryCode,
} from "@/config/countries";
import { isLanguageCode } from "@/config/languages";
import { LOCALE_COOKIE } from "@/lib/locale-cookie";

/**
 * Every page lives under /{country}/{lang}. This redirects any URL that is
 * missing or has a bad prefix onto a valid one, picking the country from the
 * saved cookie first, then the CDN geo hint, then Accept-Language.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const [maybeCountry, maybeLang] = segments;

  if (
    maybeCountry &&
    maybeLang &&
    isCountryCode(maybeCountry) &&
    isLanguageCode(maybeLang)
  ) {
    const resolved = resolveLanguage(maybeCountry, maybeLang);
    // A language the country does not offer, e.g. /us/hi, falls back instead
    // of 404ing so a shared link still lands somewhere useful.
    if (resolved === maybeLang) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = `/${maybeCountry}/${resolved}/${segments.slice(2).join("/")}`;
    return NextResponse.redirect(url);
  }

  const country = pickCountry(request);
  const lang = pickLanguage(request, country);

  const url = request.nextUrl.clone();
  url.pathname = `/${country}/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

function pickCountry(request: NextRequest): CountryCode {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value?.split(":")[0];
  if (saved && isCountryCode(saved)) return saved;

  // Vercel and Cloudflare both expose the visitor country in a header.
  const geo = (
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    ""
  ).toLowerCase();
  if (isCountryCode(geo)) return geo;

  return DEFAULT_COUNTRY;
}

function pickLanguage(request: NextRequest, country: CountryCode) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value?.split(":")[1];
  if (saved && isLanguageCode(saved)) return resolveLanguage(country, saved);

  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().split("-")[0]?.toLowerCase();
    if (tag && isLanguageCode(tag)) {
      const resolved = resolveLanguage(country, tag);
      if (resolved === tag) return resolved;
    }
  }
  return defaultLanguageFor(country);
}

export const config = {
  // Skip Next internals, the API surface and anything that looks like a file.
  matcher: ["/((?!_next|api|.*\\.[\\w]+$).*)"],
};
