import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { CALCULATORS } from "../src/config/calculators/index.ts";
import {
  CALCULATOR_CATEGORIES,
  SECTIONS,
} from "../src/config/categories.ts";
import { COUNTRIES, COUNTRY_CODES } from "../src/config/countries.ts";
import { LEGAL_SLUGS } from "../src/config/legal/definitions.ts";
import { allContent } from "../src/lib/content.ts";
import { calculatorCopy } from "../src/lib/calculator-copy.ts";
import { createFormatter } from "../src/lib/format.ts";
import { createTranslator } from "../src/lib/i18n/index.ts";
import {
  ICON_NAMES,
  TONES,
  categoryVisual,
  itemVisual,
  legalVisual,
  sectionVisual,
} from "../src/lib/visuals.ts";

const t = createTranslator("en");
const PLACEHOLDER = /\{\w+\}/;

function contentFor(country: (typeof COUNTRY_CODES)[number]) {
  return allContent({
    locale: "en-US",
    country,
    t,
    calcContext: {
      countryCode: country,
      country: COUNTRIES[country],
      t,
      fmt: createFormatter(country, "en"),
    },
  });
}

describe("content index", () => {
  for (const country of COUNTRY_CODES) {
    test(`no title or description leaks a placeholder for a ${country} visitor`, () => {
      // Regression: the consumption-tax calculator's copy is worded per
      // country through params, and listing it without them put a literal
      // "{tax} Calculator" on country pages, in search and in the footer.
      const leaks = contentFor(country)
        .filter((item) => PLACEHOLDER.test(item.title) || PLACEHOLDER.test(item.description))
        .map((item) => `${item.id}: "${item.title}"`);
      assert.deepEqual(leaks, [], `unfilled placeholders:\n  ${leaks.join("\n  ")}`);
    });
  }

  test("ids are unique", () => {
    const ids = contentFor("us").map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length, "two content items share an id");
  });

  test("every item carries a valid visual", () => {
    for (const item of contentFor("in")) {
      assert.ok(ICON_NAMES.includes(item.visual.icon), `${item.id}: unknown icon ${item.visual.icon}`);
      assert.ok(TONES.includes(item.visual.tone), `${item.id}: unknown tone ${item.visual.tone}`);
    }
  });
});

describe("calculatorCopy", () => {
  test("fills the consumption-tax name per country", () => {
    const vat = CALCULATORS.find((calc) => calc.slug === "vat");
    assert.ok(vat, "the consumption-tax calculator is missing");
    for (const country of vat.countries) {
      const { title, description } = calculatorCopy(vat, t, country, "en");
      assert.ok(!PLACEHOLDER.test(title), `${country}: ${title}`);
      assert.ok(!PLACEHOLDER.test(description), `${country}: ${description}`);
    }
  });

  test("every calculator resolves cleanly in every country it offers", () => {
    for (const calc of CALCULATORS) {
      for (const country of calc.countries) {
        const { title } = calculatorCopy(calc, t, country, "en");
        assert.ok(!PLACEHOLDER.test(title), `${calc.slug}/${country}: ${title}`);
      }
    }
  });
});

describe("visual identity", () => {
  test("every section has its own visual", () => {
    for (const section of SECTIONS) {
      const visual = sectionVisual(section);
      assert.ok(ICON_NAMES.includes(visual.icon));
      assert.ok(TONES.includes(visual.tone));
    }
  });

  test("every calculator category has a distinct colour", () => {
    // The landing page's category grid relies on each category reading as
    // its own family.
    const tones = CALCULATOR_CATEGORIES.map((category) => categoryVisual("calculators", category).tone);
    assert.equal(new Set(tones).size, tones.length, `repeated tones: ${tones.join(", ")}`);
  });

  test("an item keeps its category's colour", () => {
    for (const calc of CALCULATORS) {
      assert.equal(
        itemVisual("calculators", calc.category, calc.slug).tone,
        categoryVisual("calculators", calc.category).tone,
        `${calc.slug} broke from its category colour`,
      );
    }
  });

  test("legal pages have icons", () => {
    for (const slug of LEGAL_SLUGS) {
      assert.ok(ICON_NAMES.includes(legalVisual(slug).icon), `${slug} has no icon`);
    }
  });

  test("an unknown category falls back to its section rather than failing", () => {
    assert.deepEqual(categoryVisual("calculators", "nope"), sectionVisual("calculators"));
  });
});
