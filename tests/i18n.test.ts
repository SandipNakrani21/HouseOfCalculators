import { strict as assert } from "node:assert";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import { LANGUAGE_CODES, type LanguageCode } from "../src/config/languages.ts";
import {
  LANGUAGE_COVERAGE,
  READINESS_THRESHOLD,
  countryParams,
  createTranslator,
  getDictionary,
  hasOwnKey,
  isLanguageReady,
  translate,
  unitName,
} from "../src/lib/i18n/index.ts";

const DICTIONARY_DIR = join(process.cwd(), "src", "lib", "i18n", "dictionaries");

/**
 * The dictionaries are read from disk rather than through `getDictionary`
 * because that merges each language over English. The merge is the right
 * runtime behaviour - a missing key should fall back - but it would hide
 * exactly what these tests are looking for: a key a language *does* define,
 * translated with the wrong placeholders in it.
 */
function readDictionary(language: string): Record<string, string> {
  return JSON.parse(
    readFileSync(join(DICTIONARY_DIR, `${language}.json`), "utf8"),
  ) as Record<string, string>;
}

const LANGUAGE_FILES = readdirSync(DICTIONARY_DIR)
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.replace(/\.json$/, ""));

const TRANSLATED = LANGUAGE_FILES.filter((language) => language !== "en");
const EN = readDictionary("en");

/** The `{name}` slots in a template, as a set - order and repetition are a translator's choice. */
function placeholders(template: string): Set<string> {
  return new Set(
    [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1]),
  );
}

function sorted(values: Set<string>): string {
  return [...values].sort().join(", ") || "(none)";
}

/**
 * Keys a language may define that English does not. Both are deliberate:
 * `.obl` is an oblique/inflected country name for languages that attach
 * postpositions to the noun, and `.plural` is a unit's plural form where the
 * language has one. Anything else is a typo in a key name, which falls back
 * to English silently and so would never be noticed at runtime.
 */
const LANGUAGE_ONLY_SUFFIXES = [".obl", ".plural"];

/**
 * Placeholders a call site supplies together, so a translation may use either.
 * `countryParams` always returns both the plain and the oblique country name:
 * Marathi and Gujarati attach postpositions to the noun and need the inflected
 * form, English needs the plain one, and both are passed to every template.
 */
const INTERCHANGEABLE: Record<string, string[]> = {
  country: ["country", "countryObl"],
};

/**
 * Placeholders a translation is allowed to leave out. Dropping a slot is safe
 * at render time - nothing broken reaches the page - and several languages
 * inflect so awkwardly around a country name that the natural sentence is
 * "calculators for this country" (see commit 5183aaf). Every other slot
 * carries information the sentence would lose.
 */
const OPTIONAL = new Set(["country"]);

function supplied(english: string): Set<string> {
  const names = new Set<string>();
  for (const name of placeholders(english)) {
    for (const alias of INTERCHANGEABLE[name] ?? [name]) names.add(alias);
  }
  return names;
}

describe("dictionary placeholders", () => {
  for (const language of TRANSLATED) {
    const dict = readDictionary(language);

    /**
     * The failure this catches: a translation using a slot the call site does
     * not fill renders the braces verbatim to the user - `{tax} दर` on the
     * page. It is invisible in English and in review, and only shows up in the
     * one language nobody on the team reads.
     */
    test(`${language} uses no placeholder the call site will not fill`, () => {
      const unfilled: string[] = [];

      for (const [key, value] of Object.entries(dict)) {
        const english = EN[key];
        if (english === undefined) continue;

        const available = supplied(english);
        for (const name of placeholders(value)) {
          if (!available.has(name)) {
            unfilled.push(`${key}: {${name}} - English supplies {${sorted(available)}}`);
          }
        }
      }

      assert.deepEqual(
        unfilled,
        [],
        `${language} would render ${unfilled.length} literal placeholder(s):\n  ${unfilled.join("\n  ")}`,
      );
    });

    test(`${language} does not drop a placeholder that carries meaning`, () => {
      const dropped: string[] = [];

      for (const [key, value] of Object.entries(dict)) {
        const english = EN[key];
        if (english === undefined) continue;

        const actual = placeholders(value);
        for (const name of placeholders(english)) {
          if (OPTIONAL.has(name)) continue;
          const satisfied = (INTERCHANGEABLE[name] ?? [name]).some((alias) =>
            actual.has(alias),
          );
          if (!satisfied) dropped.push(`${key}: lost {${name}}`);
        }
      }

      assert.deepEqual(
        dropped,
        [],
        `${language} drops ${dropped.length} placeholder(s):\n  ${dropped.join("\n  ")}`,
      );
    });
  }
});

describe("dictionary structure", () => {
  for (const language of LANGUAGE_FILES) {
    const dict = readDictionary(language);

    test(`${language} has no empty or non-string values`, () => {
      const bad = Object.entries(dict)
        .filter(([, value]) => typeof value !== "string" || value.trim() === "")
        .map(([key]) => key);
      assert.deepEqual(bad, [], `${language}: empty values at ${bad.join(", ")}`);
    });

    test(`${language} has no malformed placeholder braces`, () => {
      const bad: string[] = [];

      for (const [key, value] of Object.entries(dict)) {
        const opens = (value.match(/\{/g) ?? []).length;
        const closes = (value.match(/\}/g) ?? []).length;
        const wellFormed = (value.match(/\{(\w+)\}/g) ?? []).length;

        // Every brace has to belong to a `{name}` slot. An unbalanced or
        // non-word brace means `translate` leaves it on the page verbatim.
        if (opens !== closes || opens !== wellFormed) {
          bad.push(`${key}: ${value}`);
        }
      }

      assert.deepEqual(bad, [], `${language}: malformed braces in\n  ${bad.join("\n  ")}`);
    });

    if (language !== "en") {
      test(`${language} defines no keys outside English beyond the allowed variants`, () => {
        const unexpected = Object.keys(dict).filter((key) => {
          if (key in EN) return false;
          const suffix = LANGUAGE_ONLY_SUFFIXES.find((candidate) =>
            key.endsWith(candidate),
          );
          // A variant is only legitimate if the key it varies exists.
          return !suffix || !(key.slice(0, -suffix.length) in EN);
        });

        assert.deepEqual(
          unexpected,
          [],
          `${language}: ${unexpected.length} key(s) English does not define: ${unexpected.join(", ")}`,
        );
      });
    }
  }
});

describe("translate", () => {
  const dict = { greeting: "Hello {name}", plain: "No slots", twice: "{x} and {x}" };

  test("an unknown key returns the key, so a gap is visible on the page", () => {
    assert.equal(translate(dict, "missing.key"), "missing.key");
  });

  test("fills a placeholder from params", () => {
    assert.equal(translate(dict, "greeting", { name: "Ada" }), "Hello Ada");
  });

  test("fills every occurrence of a repeated placeholder", () => {
    assert.equal(translate(dict, "twice", { x: 1 }), "1 and 1");
  });

  test("leaves a placeholder alone when params do not supply it", () => {
    assert.equal(translate(dict, "greeting", { other: "x" }), "Hello {name}");
  });

  test("returns the template untouched when no params are passed", () => {
    assert.equal(translate(dict, "greeting"), "Hello {name}");
  });

  test("numbers are stringified", () => {
    assert.equal(translate(dict, "greeting", { name: 42 }), "Hello 42");
  });
});

describe("fallback", () => {
  for (const language of LANGUAGE_CODES) {
    test(`${language} resolves every English key`, () => {
      const dict = getDictionary(language);
      const missing = Object.keys(EN).filter((key) => !(key in dict));
      assert.deepEqual(missing, [], `${language} cannot resolve ${missing.length} key(s)`);
    });
  }

  test("an unregistered language falls back to English rather than throwing", () => {
    const dict = getDictionary("zz" as LanguageCode);
    assert.equal(dict["app.name"], EN["app.name"]);
  });
});

describe("readiness gate", () => {
  test("English is always ready", () => {
    assert.equal(isLanguageReady("en"), true);
    assert.equal(LANGUAGE_COVERAGE.en, 1);
  });

  test("coverage is a fraction for every registered language", () => {
    for (const language of LANGUAGE_CODES) {
      const coverage = LANGUAGE_COVERAGE[language];
      assert.ok(
        coverage >= 0 && coverage <= 1,
        `${language} coverage ${coverage} is outside 0..1`,
      );
    }
  });

  test("readiness agrees with coverage against the threshold", () => {
    for (const language of LANGUAGE_CODES) {
      if (language === "en") continue;
      assert.equal(
        isLanguageReady(language),
        LANGUAGE_COVERAGE[language] >= READINESS_THRESHOLD,
        `${language} readiness disagrees with its coverage`,
      );
    }
  });

  test("a language with no dictionary file scores zero and is not offered", () => {
    const withoutFile = LANGUAGE_CODES.filter(
      (language) => !LANGUAGE_FILES.includes(language),
    );
    for (const language of withoutFile) {
      assert.equal(LANGUAGE_COVERAGE[language], 0);
      assert.equal(isLanguageReady(language), false);
    }
  });
});

describe("hasOwnKey", () => {
  test("is true only for a key the language itself defines", () => {
    assert.equal(hasOwnKey("mr", "country.in.obl"), true);
    assert.equal(hasOwnKey("de", "country.in.obl"), false);
  });

  test("ignores the English fallback", () => {
    // German inherits the English plural through the merge but does not
    // define it, which is exactly the distinction `unitName` depends on.
    assert.equal("unit.length.meter.plural" in getDictionary("de"), true);
    assert.equal(hasOwnKey("de", "unit.length.meter.plural"), false);
  });
});

describe("unitName", () => {
  test("uses the language's own plural when it has one", () => {
    const t = createTranslator("en");
    assert.equal(unitName("en", t, "unit.length.meter", true), EN["unit.length.meter.plural"]);
  });

  test("uses the singular rather than an English plural in another language", () => {
    const t = createTranslator("de");
    const german = readDictionary("de");
    if (!("unit.length.meter" in german)) return; // not translated yet
    assert.equal(unitName("de", t, "unit.length.meter", true), german["unit.length.meter"]);
  });

  test("returns the singular when plural is not requested", () => {
    const t = createTranslator("en");
    assert.equal(unitName("en", t, "unit.length.meter"), EN["unit.length.meter"]);
  });
});

describe("countryParams", () => {
  test("supplies the oblique form where the language defines one", () => {
    const marathi = readDictionary("mr");
    const params = countryParams(createTranslator("mr"), "in");
    assert.equal(params.country, marathi["country.in"]);
    assert.equal(params.countryObl, marathi["country.in.obl"]);
  });

  test("falls back to the plain name where it does not", () => {
    const params = countryParams(createTranslator("de"), "in");
    assert.equal(params.countryObl, params.country);
  });

  test("never leaks the raw key when a country is unknown", () => {
    const params = countryParams(createTranslator("en"), "in");
    assert.ok(!params.countryObl.endsWith(".obl"), "oblique fallback leaked the key");
  });
});
