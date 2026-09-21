import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_CODES,
  type LocaleCode,
} from "../src/config/locales.ts";
import sitemap from "../src/app/sitemap.ts";
import { absoluteUrl, localeHome, siteUrl, swapLocale } from "../src/lib/routes.ts";
import { buildMetadata, isLocaleReady, readyLocales } from "../src/lib/seo.ts";

const READY = readyLocales();

/** The alternates `buildMetadata` emitted, as a plain map. */
function alternatesFor(locale: LocaleCode, path: string, availableIn?: LocaleCode[]) {
  const meta = buildMetadata({
    locale,
    path,
    title: "Title",
    description: "Description",
    availableIn,
  });
  return (meta.alternates?.languages ?? {}) as Record<string, string>;
}

function canonicalFor(locale: LocaleCode, path: string): string {
  const meta = buildMetadata({ locale, path, title: "T", description: "D" });
  return String(meta.alternates?.canonical ?? "");
}

/** Representative paths, one per route shape. */
const PATHS = [
  "",
  "/calculators",
  "/calculators/finance",
  "/calculators/finance/sip",
  "/converters/length/meters-to-feet",
  "/tools/date/age-calculator",
  "/charts/finance/emi-table",
  "/guides/finance/how-emi-works",
  "/countries/gb",
  "/countries/gb/stamp-duty",
];

function pathsFor(locale: LocaleCode): string[] {
  return PATHS.map((suffix) => `${localeHome(locale)}${suffix}`);
}

describe("readiness gating", () => {
  test("at least the default locale is ready", () => {
    assert.ok(READY.length > 0, "no locale is ready to ship");
    assert.ok(READY.includes(DEFAULT_LOCALE), "the default locale must be ready");
  });

  test("no locale below the threshold reaches hreflang", () => {
    // The gate exists so search engines are never pointed at a page that
    // silently falls back to English.
    const alternates = alternatesFor(DEFAULT_LOCALE, localeHome(DEFAULT_LOCALE));
    for (const code of Object.keys(alternates)) {
      if (code === "x-default") continue;
      assert.ok(
        isLocaleReady(code as LocaleCode),
        `${code} is not ready but appears in hreflang`,
      );
    }
  });

  test("an unready locale requested explicitly is still filtered out", () => {
    const unready = LOCALE_CODES.filter((code) => !isLocaleReady(code));
    if (unready.length === 0) return;
    const alternates = alternatesFor(DEFAULT_LOCALE, localeHome(DEFAULT_LOCALE), [
      DEFAULT_LOCALE,
      ...unready,
    ]);
    for (const code of unready) {
      assert.ok(!(code in alternates), `${code} was not filtered out of hreflang`);
    }
  });
});

describe("hreflang self-reference", () => {
  test("every page lists itself among its alternates", () => {
    // Google ignores an hreflang cluster whose members do not include
    // themselves, so this silently disables the whole annotation.
    for (const locale of READY) {
      for (const path of pathsFor(locale)) {
        const alternates = alternatesFor(locale, path);
        assert.equal(
          alternates[locale],
          absoluteUrl(path),
          `${path} does not point its own locale at itself`,
        );
      }
    }
  });

  test("the self-reference matches the canonical exactly", () => {
    // A canonical and a self-hreflang that disagree are a contradiction, and
    // search engines resolve it by trusting neither.
    for (const locale of READY) {
      for (const path of pathsFor(locale)) {
        assert.equal(alternatesFor(locale, path)[locale], canonicalFor(locale, path));
      }
    }
  });
});

describe("hreflang bidirectionality", () => {
  test("if A points at B then B points back at A", () => {
    for (const path of PATHS) {
      for (const from of READY) {
        const fromPath = `${localeHome(from)}${path}`;
        const alternates = alternatesFor(from, fromPath);

        for (const [code, url] of Object.entries(alternates)) {
          if (code === "x-default") continue;
          const to = code as LocaleCode;

          // The URL A claims for B must be the URL B actually serves.
          const toPath = `${localeHome(to)}${path}`;
          assert.equal(url, absoluteUrl(toPath), `${from} pointed ${to} at the wrong URL`);

          // And B must point back.
          const back = alternatesFor(to, toPath);
          assert.equal(
            back[from],
            absoluteUrl(fromPath),
            `${to} does not return ${from}'s reference for ${path}`,
          );
        }
      }
    }
  });

  test("every ready locale is in every cluster", () => {
    for (const path of PATHS) {
      for (const locale of READY) {
        const alternates = alternatesFor(locale, `${localeHome(locale)}${path}`);
        for (const other of READY) {
          assert.ok(other in alternates, `${other} is missing from ${locale}'s ${path}`);
        }
      }
    }
  });

  test("a page limited to some locales keeps the cluster symmetric", () => {
    const subset = READY.slice(0, 2);
    if (subset.length < 2) return;

    for (const locale of subset) {
      const alternates = alternatesFor(locale, `${localeHome(locale)}/countries/gb`, subset);
      assert.deepEqual(
        Object.keys(alternates).filter((code) => code !== "x-default").sort(),
        [...subset].sort(),
        "a restricted cluster leaked or dropped a locale",
      );
    }
  });
});

describe("x-default", () => {
  test("points at the default locale", () => {
    for (const locale of READY) {
      for (const path of PATHS) {
        const alternates = alternatesFor(locale, `${localeHome(locale)}${path}`);
        assert.equal(
          alternates["x-default"],
          absoluteUrl(`${localeHome(DEFAULT_LOCALE)}${path}`),
          `x-default is wrong on ${locale}${path}`,
        );
      }
    }
  });

  test("is omitted when the default locale is not in the cluster", () => {
    const other = READY.find((code) => code !== DEFAULT_LOCALE);
    if (!other) return;
    const alternates = alternatesFor(other, localeHome(other), [other]);
    assert.ok(
      !("x-default" in alternates),
      "x-default named a locale the page is not available in",
    );
  });
});

describe("swapLocale", () => {
  test("replaces only the locale segment", () => {
    assert.equal(swapLocale("/en-us/calculators/finance/sip", "en-GB"), "/en-gb/calculators/finance/sip");
    assert.equal(swapLocale("/en-us", "en-GB"), "/en-gb");
    assert.equal(swapLocale("/en-us/countries/gb/stamp-duty", "en-GB"), "/en-gb/countries/gb/stamp-duty");
  });

  test("leaves a country segment that looks like a locale alone", () => {
    // `/en-us/countries/gb` must not have `gb` rewritten too.
    const swapped = swapLocale("/en-us/countries/gb", "en-GB");
    assert.ok(swapped.endsWith("/countries/gb"), `country segment was rewritten: ${swapped}`);
  });

  test("is reversible", () => {
    for (const locale of LOCALE_CODES) {
      const path = "/en-us/tools/date/age-calculator";
      assert.equal(swapLocale(swapLocale(path, locale), "en-US"), path);
    }
  });

  test("swapping to the same locale changes nothing", () => {
    for (const locale of LOCALE_CODES) {
      const path = `${localeHome(locale)}/converters/length`;
      assert.equal(swapLocale(path, locale), path);
    }
  });
});

describe("url shape", () => {
  test("absoluteUrl produces one origin and no doubled slash", () => {
    const url = absoluteUrl("/en-us/calculators");
    assert.equal(url, `${siteUrl()}/en-us/calculators`);
    assert.ok(!url.slice("https://".length).includes("//"), `doubled slash in ${url}`);
  });

  test("absoluteUrl tolerates a missing leading slash", () => {
    assert.equal(absoluteUrl("en-us"), `${siteUrl()}/en-us`);
  });

  test("siteUrl never ends in a slash", () => {
    assert.ok(!siteUrl().endsWith("/"), "a trailing slash would double up in every URL");
  });

  test("locale paths are lowercase and URL-safe", () => {
    for (const locale of LOCALE_CODES) {
      const { path } = LOCALES[locale];
      assert.equal(path, locale.toLowerCase(), `${locale} path does not match its code`);
      assert.match(path, /^[a-z]{2}-[a-z]{2}$/, `${path} is not a clean locale segment`);
    }
  });
});

describe("sitemap", () => {
  const entries = sitemap();
  const urls = new Set(entries.map((entry) => entry.url));

  test("is not empty and has no duplicate URLs", () => {
    assert.ok(entries.length > 0, "the sitemap is empty");
    assert.equal(
      urls.size,
      entries.length,
      `${entries.length - urls.size} duplicate URL(s) in the sitemap`,
    );
  });

  test("covers every ready locale and nothing else", () => {
    const prefixes = new Set(
      entries.map((entry) => entry.url.slice(siteUrl().length + 1).split("/")[0]),
    );
    const expected = new Set(READY.map((locale) => LOCALES[locale].path));
    assert.deepEqual([...prefixes].sort(), [...expected].sort());
  });

  test("every alternate is itself a page in the sitemap", () => {
    // A dangling alternate is the commonest hreflang error: it points at a URL
    // that is not served, and the cluster is discarded.
    const dangling = new Set<string>();
    for (const entry of entries) {
      for (const url of Object.values(entry.alternates?.languages ?? {})) {
        if (typeof url === "string" && !urls.has(url)) dangling.add(url);
      }
    }
    assert.deepEqual(
      [...dangling],
      [],
      `${dangling.size} alternate URL(s) are not in the sitemap`,
    );
  });

  test("every entry lists itself among its alternates", () => {
    for (const entry of entries) {
      const languages = Object.values(entry.alternates?.languages ?? {});
      assert.ok(
        languages.includes(entry.url),
        `${entry.url} does not reference itself`,
      );
    }
  });

  test("alternates are symmetric across the whole sitemap", () => {
    const byUrl = new Map(
      entries.map((entry) => [
        entry.url,
        Object.values(entry.alternates?.languages ?? {}).filter(
          (url): url is string => typeof url === "string",
        ),
      ]),
    );

    for (const [url, languages] of byUrl) {
      for (const other of languages) {
        const back = byUrl.get(other);
        assert.ok(back, `${other} is referenced but not listed`);
        assert.ok(back.includes(url), `${other} does not reference ${url} back`);
      }
    }
  });

  test("alternates use the locale code, not the URL segment", () => {
    const codes = new Set(READY);
    for (const entry of entries.slice(0, 50)) {
      for (const code of Object.keys(entry.alternates?.languages ?? {})) {
        assert.ok(codes.has(code as LocaleCode), `${code} is not a ready locale code`);
      }
    }
  });

  test("priorities and URLs are well formed", () => {
    for (const entry of entries) {
      assert.ok(
        entry.priority !== undefined && entry.priority > 0 && entry.priority <= 1,
        `${entry.url} has priority ${entry.priority}`,
      );
      assert.ok(entry.url.startsWith(`${siteUrl()}/`), `${entry.url} is not absolute`);
      assert.ok(!entry.url.endsWith("/"), `${entry.url} has a trailing slash`);
      assert.equal(entry.url, entry.url.toLowerCase(), `${entry.url} is not lowercase`);
      assert.ok(!entry.url.includes(" "), `${entry.url} contains a space`);
    }
  });

  test("each locale carries the same set of pages", () => {
    // Otherwise a locale would advertise alternates for pages it does not have.
    const byLocale = new Map<string, Set<string>>();
    for (const entry of entries) {
      const rest = entry.url.slice(siteUrl().length + 1);
      const slash = rest.indexOf("/");
      const prefix = slash === -1 ? rest : rest.slice(0, slash);
      const suffix = slash === -1 ? "" : rest.slice(slash);
      if (!byLocale.has(prefix)) byLocale.set(prefix, new Set());
      byLocale.get(prefix)!.add(suffix);
    }

    const [first, ...others] = [...byLocale.values()];
    for (const other of others) {
      assert.equal(other.size, first.size, "locales carry different page counts");
      for (const suffix of first) {
        assert.ok(other.has(suffix), `a locale is missing ${suffix}`);
      }
    }
  });
});
