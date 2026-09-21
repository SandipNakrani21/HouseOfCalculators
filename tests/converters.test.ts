import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import {
  CONVERTERS,
  getConverter,
  getConverterByCategory,
  pairSlug,
  parsePairSlug,
} from "../src/config/converters/definitions.ts";
import {
  TABLE_STEPS,
  convert,
  findUnit,
  unitRatio,
} from "../src/config/converters/units.ts";

const EN = JSON.parse(
  readFileSync(
    join(process.cwd(), "src", "lib", "i18n", "dictionaries", "en.json"),
    "utf8",
  ),
) as Record<string, string>;

/** Relative comparison, because these span 1e-6 to 1e6. */
function close(actual: number, expected: number, relative = 1e-9) {
  const tolerance = Math.max(Math.abs(expected) * relative, 1e-12);
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

function converter(id: string) {
  const found = CONVERTERS.find((candidate) => candidate.id === id);
  assert.ok(found, `no converter with id ${id}`);
  return found;
}

describe("known conversions", () => {
  // Each figure here is an exact definition rather than a measurement, so it
  // is safe to assert to full precision. A drifting factor is otherwise
  // invisible: the page still renders a plausible number.
  test("length", () => {
    close(unitRatio(converter("length"), "meter", "foot"), 1 / 0.3048);
    close(unitRatio(converter("length"), "inch", "centimeter"), 2.54);
    close(unitRatio(converter("length"), "mile", "meter"), 1609.344);
    close(unitRatio(converter("length"), "nautical-mile", "meter"), 1852);
    close(convert(converter("length"), 5, "kilometer", "mile"), 5 / 1.609344);
  });

  test("weight", () => {
    close(unitRatio(converter("weight"), "pound", "kilogram"), 0.45359237);
    close(unitRatio(converter("weight"), "kilogram", "pound"), 1 / 0.45359237);
    close(unitRatio(converter("weight"), "stone", "pound"), 14, 1e-9);
    close(unitRatio(converter("weight"), "ounce", "gram"), 28.349523125);
    close(unitRatio(converter("weight"), "us-ton", "pound"), 2000, 1e-9);
  });

  test("area", () => {
    close(unitRatio(converter("area"), "hectare", "square-meter"), 10_000);
    close(unitRatio(converter("area"), "acre", "square-foot"), 43_560, 1e-9);
    close(unitRatio(converter("area"), "square-mile", "acre"), 640, 1e-9);
  });

  test("volume", () => {
    close(unitRatio(converter("volume"), "us-gallon", "liter"), 3.785411784);
    close(unitRatio(converter("volume"), "us-gallon", "us-fluid-ounce"), 128, 1e-9);
    close(unitRatio(converter("volume"), "cubic-meter", "liter"), 1000);
  });

  test("speed", () => {
    close(unitRatio(converter("speed"), "kilometer-per-hour", "meter-per-second"), 1 / 3.6);
    close(unitRatio(converter("speed"), "mile-per-hour", "kilometer-per-hour"), 1.609344, 1e-9);
  });

  test("data", () => {
    close(unitRatio(converter("data"), "byte", "bit"), 8, 1e-9);
    close(unitRatio(converter("data"), "gigabyte", "megabyte"), 1000, 1e-9);
    // The binary units are the reason this converter exists: a GiB is not a GB.
    close(unitRatio(converter("data"), "gibibyte", "byte"), 1_073_741_824, 1e-9);
    close(unitRatio(converter("data"), "kibibyte", "byte"), 1024, 1e-9);
  });

  test("time", () => {
    close(unitRatio(converter("time"), "minute", "second"), 60, 1e-9);
    close(unitRatio(converter("time"), "hour", "second"), 3600, 1e-9);
    close(unitRatio(converter("time"), "day", "hour"), 24, 1e-9);
  });

  test("energy", () => {
    close(unitRatio(converter("energy"), "kilocalorie", "kilojoule"), 4.184, 1e-9);
    close(unitRatio(converter("energy"), "kilowatt-hour", "joule"), 3_600_000);
    close(unitRatio(converter("energy"), "watt-hour", "joule"), 3600);
  });

  test("pressure", () => {
    close(unitRatio(converter("pressure"), "atmosphere", "pascal"), 101_325);
    close(unitRatio(converter("pressure"), "bar", "pascal"), 100_000);
    close(unitRatio(converter("pressure"), "bar", "psi"), 100_000 / 6894.757293168);
  });

  test("power", () => {
    close(unitRatio(converter("power"), "kilowatt", "watt"), 1000);
    close(unitRatio(converter("power"), "horsepower", "watt"), 745.699871582);
    close(unitRatio(converter("power"), "metric-horsepower", "watt"), 735.49875);
  });

  test("angle", () => {
    close(convert(converter("angle"), Math.PI, "radian", "degree"), 180, 1e-12);
    close(convert(converter("angle"), 90, "degree", "gradian"), 100, 1e-12);
    close(unitRatio(converter("angle"), "degree", "arcminute"), 60, 1e-9);
  });
});

describe("temperature", () => {
  const temp = converter("temperature");

  test("the freezing and boiling points of water", () => {
    close(convert(temp, 0, "celsius", "fahrenheit"), 32, 1e-12);
    close(convert(temp, 100, "celsius", "fahrenheit"), 212, 1e-12);
    close(convert(temp, 32, "fahrenheit", "celsius"), 0, 1e-12);
  });

  test("the scales meet at -40", () => {
    close(convert(temp, -40, "celsius", "fahrenheit"), -40, 1e-12);
    close(convert(temp, -40, "fahrenheit", "celsius"), -40, 1e-12);
  });

  test("absolute zero", () => {
    close(convert(temp, 0, "kelvin", "celsius"), -273.15, 1e-12);
    close(convert(temp, -273.15, "celsius", "kelvin"), 0, 1e-12);
    close(convert(temp, 0, "kelvin", "fahrenheit"), -459.67, 1e-9);
  });

  test("an offset scale is not a factor - 2x the degrees is not 2x the reading", () => {
    // The mistake this guards against is modelling Fahrenheit as a factor:
    // that would make 20°C convert to 36°F rather than 68°F.
    close(convert(temp, 20, "celsius", "fahrenheit"), 68, 1e-12);
    assert.notEqual(
      convert(temp, 40, "celsius", "fahrenheit"),
      2 * convert(temp, 20, "celsius", "fahrenheit"),
    );
  });
});

describe("fuel economy", () => {
  const fuel = converter("fuel-economy");

  test("consumption is the reciprocal of economy, not a factor", () => {
    close(convert(fuel, 100, "liters-per-100km", "km-per-liter"), 1, 1e-12);
    close(convert(fuel, 10, "liters-per-100km", "km-per-liter"), 10, 1e-12);
    close(convert(fuel, 5, "km-per-liter", "liters-per-100km"), 20, 1e-12);
  });

  test("matches the 235.2 constant drivers know", () => {
    // L/100 km = 235.215 / mpg (US) is the standard published conversion.
    close(convert(fuel, 1, "mpg-us", "liters-per-100km"), 235.2145833, 1e-7);
    close(convert(fuel, 30, "mpg-us", "liters-per-100km"), 235.2145833 / 30, 1e-7);
  });

  test("more litres per 100 km is worse economy", () => {
    const thirsty = convert(fuel, 12, "liters-per-100km", "mpg-us");
    const frugal = convert(fuel, 5, "liters-per-100km", "mpg-us");
    assert.ok(frugal > thirsty, "5 L/100km should be better economy than 12");
  });

  test("an imperial gallon is larger, so imperial mpg reads higher", () => {
    const us = convert(fuel, 10, "km-per-liter", "mpg-us");
    const imperial = convert(fuel, 10, "km-per-liter", "mpg-imperial");
    assert.ok(imperial > us, "imperial mpg should exceed US mpg for one economy");
  });
});

describe("round trips", () => {
  for (const definition of CONVERTERS) {
    test(`${definition.id} converts back to where it started`, () => {
      for (const from of definition.units) {
        for (const to of definition.units) {
          for (const value of [1, 7.5, 1234.5]) {
            const there = convert(definition, value, from.id, to.id);
            const back = convert(definition, there, to.id, from.id);
            close(back, value, 1e-9);
          }
        }
      }
    });

    test(`${definition.id} converts a unit to itself unchanged`, () => {
      for (const unit of definition.units) {
        close(convert(definition, 42.5, unit.id, unit.id), 42.5, 1e-12);
      }
    });
  }
});

describe("convert guards", () => {
  const length = converter("length");

  test("an unknown unit yields 0 rather than NaN", () => {
    assert.equal(convert(length, 1, "meter", "furlong"), 0);
    assert.equal(convert(length, 1, "furlong", "meter"), 0);
  });

  test("a non-finite value yields 0", () => {
    assert.equal(convert(length, Number.NaN, "meter", "foot"), 0);
    assert.equal(convert(length, Number.POSITIVE_INFINITY, "meter", "foot"), 0);
  });

  test("unitRatio is the conversion of one unit", () => {
    assert.equal(unitRatio(length, "meter", "foot"), convert(length, 1, "meter", "foot"));
  });

  test("findUnit resolves by id and returns undefined otherwise", () => {
    assert.equal(findUnit(length, "meter")?.symbol, "m");
    assert.equal(findUnit(length, "furlong"), undefined);
  });

  test("negative values convert as ordinary values", () => {
    close(convert(length, -3, "meter", "centimeter"), -300, 1e-9);
  });
});

describe("definition integrity", () => {
  test("every converter has a unique id, slug and category", () => {
    for (const field of ["id", "slug", "category"] as const) {
      const values = CONVERTERS.map((definition) => definition[field]);
      assert.equal(
        new Set(values).size,
        values.length,
        `duplicate ${field} among converters`,
      );
    }
  });

  for (const definition of CONVERTERS) {
    test(`${definition.id} is internally consistent`, () => {
      const ids = definition.units.map((unit) => unit.id);
      assert.equal(new Set(ids).size, ids.length, "duplicate unit ids");

      const base = findUnit(definition, definition.baseUnit);
      assert.ok(base, `baseUnit ${definition.baseUnit} is not among the units`);
      assert.equal(base.factor, 1, "the base unit must be worth one base unit");

      for (const unit of definition.units) {
        const linear = typeof unit.factor === "number";
        const explicit = Boolean(unit.toBase && unit.fromBase);
        assert.ok(
          linear || explicit,
          `${unit.id} has neither a factor nor both conversion functions`,
        );
        if (linear) {
          assert.ok(
            Number.isFinite(unit.factor) && unit.factor! > 0,
            `${unit.id} has a non-positive factor`,
          );
        }
        assert.ok(unit.symbol.length > 0, `${unit.id} has no symbol`);
      }
    });

    test(`${definition.id} unit labels exist in English`, () => {
      const missing = definition.units
        .map((unit) => unit.labelKey)
        .filter((key) => !(key in EN));
      assert.deepEqual(missing, [], `undefined label keys: ${missing.join(", ")}`);
    });

    test(`${definition.id} page copy keys exist in English`, () => {
      for (const key of [definition.titleKey, definition.descKey, definition.explainerKey]) {
        assert.ok(key in EN, `${key} is not defined in English`);
      }
    });

    test(`${definition.id} pairs reference real units`, () => {
      const ids = new Set(definition.units.map((unit) => unit.id));
      for (const [from, to] of [...definition.featuredPairs, definition.defaultPair]) {
        assert.ok(ids.has(from), `${from} is not a unit of ${definition.id}`);
        assert.ok(ids.has(to), `${to} is not a unit of ${definition.id}`);
        assert.notEqual(from, to, "a pair converting a unit to itself has nothing to show");
      }
    });
  }
});

describe("pair slugs", () => {
  for (const definition of CONVERTERS) {
    test(`${definition.id} slugs parse back to their pair`, () => {
      for (const [from, to] of definition.featuredPairs) {
        const slug = pairSlug(definition, from, to);
        assert.deepEqual(
          parsePairSlug(definition, slug),
          [from, to],
          `${slug} did not parse back to ${from}/${to}`,
        );
      }
    });

    test(`${definition.id} slugs are unique and URL-safe`, () => {
      const slugs = definition.featuredPairs.map(([from, to]) =>
        pairSlug(definition, from, to),
      );
      assert.equal(
        new Set(slugs).size,
        slugs.length,
        // Two pairs sharing a slug means two pages claiming one URL.
        `duplicate pair slugs in ${definition.id}: ${slugs.join(", ")}`,
      );
      for (const slug of slugs) {
        assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${slug} is not a clean slug`);
        assert.ok(slug.includes("-to-"), `${slug} does not read as a conversion`);
      }
    });
  }

  test("an unknown slug parses to null rather than throwing", () => {
    assert.equal(parsePairSlug(converter("length"), "meters-to-furlongs"), null);
  });

  test("a pair that is not featured is not routable", () => {
    // Only searched-for conversions get a page; the rest stay on the category
    // page. A slug for an unfeatured pair must not resolve.
    const length = converter("length");
    const unfeatured = pairSlug(length, "nautical-mile", "yard");
    assert.equal(parsePairSlug(length, unfeatured), null);
  });
});

describe("lookups", () => {
  test("getConverter finds by slug", () => {
    assert.equal(getConverter("length")?.id, "length");
    assert.equal(getConverter("nope"), undefined);
  });

  test("getConverterByCategory finds by category", () => {
    assert.equal(getConverterByCategory("fuel-economy")?.id, "fuel-economy");
    assert.equal(getConverterByCategory("nope"), undefined);
  });
});

describe("reference table steps", () => {
  test("are positive and strictly ascending", () => {
    for (const [index, step] of TABLE_STEPS.entries()) {
      assert.ok(step > 0, `step ${step} is not positive`);
      if (index > 0) {
        assert.ok(step > TABLE_STEPS[index - 1], "steps are not ascending");
      }
    }
  });
});
