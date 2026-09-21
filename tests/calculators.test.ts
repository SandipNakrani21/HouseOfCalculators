import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import { CALCULATORS, getCalculator } from "../src/config/calculators/index.ts";
import {
  countryRelevanceOf,
  type CalcContext,
  type CalculatorDef,
  type CalculatorField,
  type FieldValues,
} from "../src/config/calculators/types.ts";
import { CALCULATOR_CATEGORIES } from "../src/config/categories.ts";
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from "../src/config/countries.ts";
import { createFormatter } from "../src/lib/format.ts";
import { createTranslator } from "../src/lib/i18n/index.ts";

const EN = JSON.parse(
  readFileSync(
    join(process.cwd(), "src", "lib", "i18n", "dictionaries", "en.json"),
    "utf8",
  ),
) as Record<string, string>;

function contextFor(country: CountryCode): CalcContext {
  return {
    countryCode: country,
    country: COUNTRIES[country],
    t: createTranslator("en"),
    fmt: createFormatter(country, "en"),
  };
}

/**
 * Every combination of the select and toggle answers.
 *
 * A calculator's conditional fields and branch-specific results only appear
 * for particular answers, so testing the defaults alone would leave most of
 * the surface unreached - including, on the health calculators, the entire
 * imperial branch.
 */
function answerCombinations(fields: CalculatorField[]): FieldValues[] {
  const base: FieldValues = {};
  for (const field of fields) base[field.id] = field.default;

  const choices = fields
    .filter((field) => field.kind === "select" || field.kind === "toggle")
    .map((field) =>
      field.kind === "toggle"
        ? [true, false].map((value) => [field.id, value] as const)
        : (field.options ?? []).map((option) => [field.id, option.value] as const),
    )
    .filter((options) => options.length > 0);

  return choices.reduce<FieldValues[]>(
    (combos, options) =>
      combos.flatMap((combo) =>
        options.map(([id, value]) => ({ ...combo, [id]: value })),
      ),
    [base],
  );
}

/** Keys a calculator reaches for one set of answers. */
function keysReached(calculator: CalculatorDef, ctx: CalcContext, values: FieldValues) {
  const keys: string[] = [];
  const add = (key: string | undefined) => {
    if (key) keys.push(key);
  };

  add(calculator.titleKey);
  add(calculator.descKey);
  for (const key of calculator.explainerKeys ?? []) add(key);
  for (const key of calculator.faqKeys ?? []) {
    add(`${key}.q`);
    add(`${key}.a`);
  }

  for (const field of calculator.fields(ctx)) {
    add(field.labelKey);
    add(field.hintKey);
    // An option carrying a literal label is data (a tax rate), not copy.
    for (const option of field.options ?? []) if (!option.label) add(option.labelKey);
  }

  const result = calculator.compute(values, ctx);
  for (const row of [result.primary, ...result.rows]) {
    add(row.labelKey);
    add(row.hintKey);
    if (row.kind === "label") add(String(row.value));
  }
  for (const slice of result.chart ?? []) add(slice.labelKey);
  for (const note of result.notes ?? []) add(note.key);
  for (const column of result.table?.columns ?? []) add(column.labelKey);
  for (const row of result.table?.rows ?? []) {
    for (const column of result.table?.columns ?? []) {
      if (column.kind === "label") add(String(row[column.key]));
    }
  }
  for (const view of result.breakdown ?? []) {
    add(view.labelKey);
    for (const column of view.columns) add(column.labelKey);
  }

  return keys;
}

describe("registry", () => {
  test("slugs are unique", () => {
    const slugs = CALCULATORS.map((calc) => calc.slug);
    assert.equal(new Set(slugs).size, slugs.length, "two calculators share a slug");
  });

  test("slugs are clean URL segments", () => {
    for (const calc of CALCULATORS) {
      assert.match(calc.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${calc.slug} is not a clean slug`);
    }
  });

  test("every calculator is reachable by its slug", () => {
    for (const calc of CALCULATORS) {
      assert.equal(getCalculator(calc.slug), calc);
    }
    assert.equal(getCalculator("nope"), undefined);
  });

  test("categories are from the fixed vocabulary", () => {
    for (const calc of CALCULATORS) {
      assert.ok(
        CALCULATOR_CATEGORIES.includes(calc.category),
        `${calc.slug} has category ${calc.category}`,
      );
    }
  });

  test("every calculator offers at least one country, and they all exist", () => {
    for (const calc of CALCULATORS) {
      assert.ok(calc.countries.length > 0, `${calc.slug} is offered nowhere`);
      for (const country of calc.countries) {
        assert.ok(COUNTRY_CODES.includes(country), `${calc.slug} names country ${country}`);
      }
      assert.equal(
        new Set(calc.countries).size,
        calc.countries.length,
        `${calc.slug} lists a country twice`,
      );
    }
  });

  test("version is a positive integer, so a formula change is never silent", () => {
    for (const calc of CALCULATORS) {
      assert.ok(
        Number.isInteger(calc.version) && calc.version > 0,
        `${calc.slug} has version ${calc.version}`,
      );
    }
  });

  test("relatedCalculators name calculators that exist", () => {
    for (const calc of CALCULATORS) {
      for (const slug of calc.relatedCalculators ?? []) {
        assert.ok(getCalculator(slug), `${calc.slug} relates to missing ${slug}`);
        assert.notEqual(slug, calc.slug, `${calc.slug} relates to itself`);
      }
    }
  });

  test("a country-specific calculator says its country changes the rules", () => {
    // Otherwise it would claim a country tool is merely a currency switch.
    for (const calc of CALCULATORS) {
      if (!calc.isCountrySpecific) continue;
      assert.equal(
        countryRelevanceOf(calc),
        "rules",
        `${calc.slug} is country-specific but claims ${countryRelevanceOf(calc)}`,
      );
    }
  });

  test("every category the IA declares either has calculators or is empty on purpose", () => {
    // Currently business, education, engineering and construction are declared
    // but unbuilt. This test records which, so adding one is a visible change.
    const populated = new Set(CALCULATORS.map((calc) => calc.category));
    const empty = CALCULATOR_CATEGORIES.filter((category) => !populated.has(category));
    assert.deepEqual(
      empty.sort(),
      ["construction", "education", "engineering"].sort(),
      `empty categories changed: ${empty.join(", ")}`,
    );
  });
});

describe("every calculator computes", () => {
  for (const calc of CALCULATORS) {
    test(`${calc.slug} produces finite results in every country it offers`, () => {
      for (const country of calc.countries) {
        const ctx = contextFor(country);
        const fields = calc.fields(ctx);

        for (const values of answerCombinations(fields)) {
          let result;
          try {
            result = calc.compute(values, ctx);
          } catch (error) {
            assert.fail(
              `${calc.slug} threw in ${country}: ${(error as Error).message}`,
            );
          }

          const rows = [result.primary, ...result.rows];
          for (const row of rows) {
            if (typeof row.value !== "number") continue;
            assert.ok(
              Number.isFinite(row.value),
              `${calc.slug}/${country}: ${row.labelKey} is ${row.value}`,
            );
          }

          for (const slice of result.chart ?? []) {
            assert.ok(
              Number.isFinite(slice.value) && slice.value >= 0,
              // A negative slice would render as a nonsense donut.
              `${calc.slug}/${country}: chart slice ${slice.labelKey} is ${slice.value}`,
            );
          }

          for (const view of result.breakdown ?? []) {
            for (const row of view.rows) {
              for (const column of view.columns) {
                const value = row[column.key];
                if (typeof value !== "number") continue;
                assert.ok(
                  Number.isFinite(value),
                  `${calc.slug}/${country}: ${view.id}.${column.key} is ${value}`,
                );
              }
            }
          }
        }
      }
    });

    test(`${calc.slug} references only keys English defines`, () => {
      const missing = new Set<string>();
      for (const country of calc.countries) {
        const ctx = contextFor(country);
        for (const values of answerCombinations(calc.fields(ctx))) {
          for (const key of keysReached(calc, ctx, values)) {
            if (!(key in EN)) missing.add(key);
          }
        }
      }
      assert.deepEqual(
        [...missing],
        [],
        `${calc.slug} reaches undefined keys: ${[...missing].join(", ")}`,
      );
    });

    test(`${calc.slug} has fields that are internally consistent`, () => {
      for (const country of calc.countries) {
        const fields = calc.fields(contextFor(country));
        assert.ok(fields.length > 0, `${calc.slug} has no fields in ${country}`);

        const ids = fields.map((field) => field.id);
        assert.equal(
          new Set(ids).size,
          ids.length,
          `${calc.slug}/${country} repeats a field id`,
        );

        for (const field of fields) {
          if (field.kind === "select") {
            assert.ok(
              (field.options ?? []).length > 0,
              // An empty select renders nothing at all, so the input vanishes.
              `${calc.slug}/${country}: select ${field.id} has no options`,
            );
            assert.ok(
              field.options?.some((option) => option.value === String(field.default)),
              `${calc.slug}/${country}: ${field.id} defaults to an option it does not offer`,
            );
          }

          if (field.kind === "toggle" || field.kind === "select" || field.kind === "text") {
            continue;
          }

          const min = field.min ?? 0;
          const max = field.max ?? 100;
          assert.ok(max > min, `${calc.slug}/${country}: ${field.id} has max <= min`);
          const value = Number(field.default);
          assert.ok(
            Number.isFinite(value) && value >= min && value <= max,
            `${calc.slug}/${country}: ${field.id} defaults to ${value}, outside ${min}..${max}`,
          );
        }
      }
    });
  }
});
