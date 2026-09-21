import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import {
  CONSENT_COOKIE,
  COOKIE_MAX_AGE,
  COUNTRY_COOKIE,
  LOCALE_COOKIE,
} from "../src/lib/preferences.ts";

/**
 * The consent machinery is a browser script and a client component, so it is
 * checked by reading the source rather than by executing it. These are the
 * properties that are silently wrong when they break: a default that grants
 * instead of denies, an ads script that loads first, or a reject button that
 * is quietly harder to press than accept.
 */
function read(...segments: string[]): string {
  return readFileSync(join(process.cwd(), ...segments), "utf8");
}

const SCRIPT = read("src", "components", "consent", "ConsentScript.tsx");
const BANNER = read("src", "components", "consent", "ConsentBanner.tsx");
const LAYOUT = read("src", "app", "[locale]", "layout.tsx");
const PREFERENCES = read("src", "lib", "preferences.ts");

describe("cookies", () => {
  test("the three cookie names are distinct and prefixed", () => {
    const names = [LOCALE_COOKIE, COUNTRY_COOKIE, CONSENT_COOKIE];
    assert.equal(new Set(names).size, names.length, "two cookies share a name");
    for (const name of names) {
      assert.match(name, /^hoc_[a-z]+$/, `${name} is not a namespaced cookie name`);
    }
  });

  test("they expire rather than lasting forever", () => {
    assert.ok(COOKIE_MAX_AGE > 0, "cookies would be session-only");
    // A year. Longer would outlive any reasonable memory of having chosen.
    assert.equal(COOKIE_MAX_AGE, 60 * 60 * 24 * 365);
  });

  test("cookies are written with SameSite and a path", () => {
    assert.match(PREFERENCES, /samesite=lax/i, "no SameSite attribute");
    assert.match(PREFERENCES, /path=\//, "no path attribute");
  });

  test("reading or writing a cookie never throws", () => {
    // Cookies can be blocked outright; the site has to keep working.
    const guarded = PREFERENCES.match(/try\s*\{/g) ?? [];
    assert.ok(guarded.length >= 2, "cookie access is not guarded against being blocked");
  });
});

describe("consent defaults", () => {
  test("every consent signal defaults to denied", () => {
    // Defaulting the other way would make the banner decorative.
    for (const signal of [
      "ad_storage",
      "ad_user_data",
      "ad_personalization",
      "analytics_storage",
    ]) {
      const declared = new RegExp(`${signal}:\\s*'denied'`).test(SCRIPT);
      assert.ok(declared, `${signal} does not default to denied`);
    }
  });

  test("the default is set before anything is read", () => {
    const defaultAt = SCRIPT.indexOf("'default'");
    const readAt = SCRIPT.indexOf("document.cookie");
    assert.ok(defaultAt !== -1 && readAt !== -1, "script shape changed");
    assert.ok(defaultAt < readAt, "the stored choice is read before the default is set");
  });

  test("consent is only granted for an exact match", () => {
    assert.match(SCRIPT, /=== 'granted'/, "grants on something other than an exact match");
  });

  test("a blocked cookie leaves the denied default standing", () => {
    assert.match(SCRIPT, /catch\s*\(/, "cookie read is not guarded");
  });

  test("nothing renders without a publisher id", () => {
    // No advertising means no advertising cookies, so there is nothing to
    // ask about and a banner would be a lie.
    for (const [name, source] of [
      ["ConsentScript", SCRIPT],
      ["ConsentBanner", BANNER],
    ] as const) {
      assert.match(source, /CLIENT_ID/, `${name} does not check for a publisher id`);
      // Missing id has to short-circuit the render, whatever else the guard
      // has been combined with.
      assert.match(
        source,
        /if \(!CLIENT_ID[\s\S]{0,60}?\) return null;/,
        `${name} does not bail out without one`,
      );
    }
  });
});

describe("script order", () => {
  test("the consent defaults are emitted before the ads script", () => {
    const consentAt = LAYOUT.indexOf("<ConsentScript />");
    const adsAt = LAYOUT.indexOf("<AdScript />");
    assert.ok(consentAt !== -1, "ConsentScript is not in the layout");
    assert.ok(adsAt !== -1, "AdScript is not in the layout");
    assert.ok(
      consentAt < adsAt,
      // The ads script is async in the same document. If it starts first it
      // can store a cookie the visitor never agreed to.
      "the ads script is emitted before the consent defaults",
    );
  });

  test("the banner is in the layout, so it appears on every page", () => {
    assert.match(LAYOUT, /<ConsentBanner \/>/);
  });
});

describe("banner", () => {
  test("offers a reject as well as an accept", () => {
    assert.match(BANNER, /consent\.reject/);
    assert.match(BANNER, /consent\.accept/);
  });

  test("rejecting is not made harder than accepting", () => {
    // Both are real buttons of the same size. A banner where refusing takes
    // an extra click, or is styled as a link, is a dark pattern.
    const buttons = BANNER.match(/px-4 py-2\.5 text-sm font-medium/g) ?? [];
    assert.ok(buttons.length >= 2, "the two choices are not styled alike");
    assert.ok(
      BANNER.indexOf('choose("denied")') < BANNER.indexOf('choose("granted")'),
      "accept is presented ahead of reject",
    );
  });

  test("records the choice and tells the consent API about it", () => {
    assert.match(BANNER, /storeConsent\(choice\)/, "the choice is not persisted");
    assert.match(BANNER, /"consent", "update"/, "consent mode is not updated");
  });

  test("links to the page that explains the cookies", () => {
    assert.match(BANNER, /\/cookies/);
  });

  test("is labelled for assistive technology", () => {
    assert.match(BANNER, /role="dialog"/);
    assert.match(BANNER, /aria-labelledby="consent-title"/);
  });
});
