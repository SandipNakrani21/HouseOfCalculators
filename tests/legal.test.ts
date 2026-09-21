import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import {
  LEGAL_PAGES,
  LEGAL_SLUGS,
  getLegalPage,
  legalParams,
  missingOperatorDetails,
} from "../src/config/legal/definitions.ts";
import { COUNTRY_COOKIE, LOCALE_COOKIE } from "../src/lib/preferences.ts";

const EN = JSON.parse(
  readFileSync(
    join(process.cwd(), "src", "lib", "i18n", "dictionaries", "en.json"),
    "utf8",
  ),
) as Record<string, string>;

/** Every dictionary key the registry references, page by page. */
function keysOf(page: (typeof LEGAL_PAGES)[number]): string[] {
  return [
    page.titleKey,
    page.descKey,
    page.introKey,
    ...page.sections.flatMap((section) => [
      section.titleKey,
      ...section.body,
      ...(section.bullets ?? []),
      ...(section.links ?? []).map((link) => link.labelKey),
    ]),
  ];
}

describe("legal registry", () => {
  test("has a page for every slug, and no extras", () => {
    assert.deepEqual(
      LEGAL_PAGES.map((page) => page.slug).sort(),
      [...LEGAL_SLUGS].sort(),
    );
  });

  test("every page is reachable by its slug", () => {
    for (const slug of LEGAL_SLUGS) {
      assert.equal(getLegalPage(slug)?.slug, slug);
    }
    assert.equal(getLegalPage("nonsense"), undefined);
  });

  test("every page has sections and every section has a body", () => {
    for (const page of LEGAL_PAGES) {
      assert.ok(page.sections.length > 0, `${page.slug} has no sections`);
      for (const section of page.sections) {
        assert.ok(
          section.body.length > 0,
          `${page.slug}/${section.titleKey} has no body`,
        );
      }
    }
  });

  test("section headings are unique within a page", () => {
    // They are used as React keys and as the page's own outline.
    for (const page of LEGAL_PAGES) {
      const titles = page.sections.map((section) => section.titleKey);
      assert.equal(new Set(titles).size, titles.length, `${page.slug} repeats a heading`);
    }
  });

  test("the updated date is a real ISO date, not a freshness badge", () => {
    for (const page of LEGAL_PAGES) {
      assert.match(page.updated, /^\d{4}-\d{2}-\d{2}$/, `${page.slug}: ${page.updated}`);
      assert.ok(
        !Number.isNaN(Date.parse(page.updated)),
        `${page.slug} has an unparseable date`,
      );
    }
  });
});

describe("legal copy", () => {
  for (const page of LEGAL_PAGES) {
    test(`${page.slug} references only keys English defines`, () => {
      const missing = keysOf(page).filter((key) => !(key in EN));
      assert.deepEqual(missing, [], `undefined keys: ${missing.join(", ")}`);
    });

    test(`${page.slug} has no empty copy`, () => {
      for (const key of keysOf(page)) {
        assert.ok(EN[key]?.trim().length > 0, `${key} is empty`);
      }
    });
  }

  test("every placeholder used in the copy is one legalParams supplies", () => {
    // An unfilled slot would put a literal `{entity}` into a published legal
    // document, which is exactly the failure this page set has to avoid.
    const available = new Set([...Object.keys(legalParams()), "app", "date"]);

    for (const page of LEGAL_PAGES) {
      for (const key of keysOf(page)) {
        for (const match of EN[key].matchAll(/\{(\w+)\}/g)) {
          assert.ok(
            available.has(match[1]),
            `${key} uses {${match[1]}}, which nothing supplies`,
          );
        }
      }
    }
  });

  test("the notice keys for each operator field exist", () => {
    for (const field of ["entity", "email", "jurisdiction"]) {
      assert.ok(
        `legal.unconfigured.${field}` in EN,
        `no notice copy for a missing ${field}`,
      );
    }
  });
});

describe("operator details", () => {
  test("cookie names in the copy come from the code that sets them", () => {
    // Otherwise the privacy page could describe a cookie the site does not use.
    const params = legalParams();
    assert.equal(params.localeCookie, LOCALE_COOKIE);
    assert.equal(params.countryCookie, COUNTRY_COOKIE);
  });

  test("an unset detail is reported rather than quietly substituted", () => {
    const missing = missingOperatorDetails();
    const params = legalParams();
    for (const field of missing) {
      // The fallback is deliberately shouty so it cannot pass for real text.
      assert.match(
        params[field],
        /^\[[A-Z ]+\]$/,
        `${field} falls back to something that reads like real content`,
      );
    }
  });

  test("the cookies the policy documents are the ones preferences.ts sets", () => {
    const cookies = getLegalPage("cookies");
    assert.ok(cookies);
    const copy = keysOf(cookies)
      .map((key) => EN[key])
      .join(" ");
    assert.ok(copy.includes("{localeCookie}"), "the locale cookie is not documented");
    assert.ok(copy.includes("{countryCookie}"), "the country cookie is not documented");
  });
});

describe("outbound links", () => {
  test("are absolute https URLs", () => {
    for (const page of LEGAL_PAGES) {
      for (const section of page.sections) {
        for (const link of section.links ?? []) {
          assert.match(link.href, /^https:\/\//, `${link.href} is not https`);
        }
      }
    }
  });

  test("are not duplicated within a section", () => {
    for (const page of LEGAL_PAGES) {
      for (const section of page.sections) {
        const hrefs = (section.links ?? []).map((link) => link.href);
        assert.equal(
          new Set(hrefs).size,
          hrefs.length,
          `${page.slug}/${section.titleKey} repeats a link`,
        );
      }
    }
  });
});
