import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import { TOOLS } from "../src/config/tools/definitions.ts";
import { TOOL_CATEGORIES } from "../src/config/categories.ts";
import { numberToWords, wordsToNumber } from "../src/lib/tools/numbers.ts";
import {
  flipCoins,
  parseEntries,
  pick,
  randomInt,
  rollDice,
  shuffle,
  splitTeams,
} from "../src/lib/tools/random.ts";

const EN = JSON.parse(
  readFileSync(join(process.cwd(), "src", "lib", "i18n", "dictionaries", "en.json"), "utf8"),
) as Record<string, string>;

describe("wordsToNumber", () => {
  test("reads the common shapes", () => {
    assert.equal(wordsToNumber("forty-two"), 42);
    assert.equal(wordsToNumber("one hundred and one"), 101);
    assert.equal(wordsToNumber("one hundred one"), 101);
    assert.equal(wordsToNumber("one thousand and five"), 1005);
    assert.equal(wordsToNumber("two million three hundred thousand"), 2_300_000);
    assert.equal(wordsToNumber("minus seven"), -7);
    assert.equal(wordsToNumber("Zero"), 0);
  });

  test("a bare scale word means one of it", () => {
    assert.equal(wordsToNumber("hundred"), 100);
    assert.equal(wordsToNumber("thousand"), 1000);
  });

  test("refuses anything that is not a number in words, rather than guessing", () => {
    for (const input of ["", "   ", "seventy dogs", "apple", "and", "minus"]) {
      assert.equal(wordsToNumber(input), null, `${JSON.stringify(input)} should not parse`);
    }
  });

  test("inverts numberToWords for whole numbers", () => {
    // The two tools are a pair, so each must undo the other.
    const samples = [
      0, 1, 7, 13, 19, 20, 21, 99, 100, 101, 110, 999, 1000, 1001, 1010, 12_345,
      100_000, 999_999, 1_000_000, 1_000_100, 7_654_321, 2_000_000_000,
    ];
    for (const value of samples) {
      assert.equal(
        wordsToNumber(numberToWords(value)),
        value,
        `${value} -> "${numberToWords(value)}" did not come back`,
      );
      assert.equal(wordsToNumber(numberToWords(-value)), value === 0 ? 0 : -value);
    }
  });
});

describe("randomInt", () => {
  test("stays inside the range, inclusive at both ends", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i += 1) {
      const value = randomInt(1, 6);
      assert.ok(Number.isInteger(value) && value >= 1 && value <= 6, `${value} out of range`);
      seen.add(value);
    }
    assert.equal(seen.size, 6, "some faces never came up in 2,000 rolls");
  });

  test("an empty or inverted range returns the minimum rather than looping", () => {
    assert.equal(randomInt(5, 5), 5);
    assert.equal(randomInt(5, 4), 5);
  });

  test("is roughly uniform", () => {
    // A loose chi-squared check: with 6,000 draws over 6 faces a fair
    // generator scores well under 30 essentially always (p < 1e-5 above it),
    // while a modulo-biased one over a small span would not be caught here -
    // this guards against gross mistakes such as an off-by-one face.
    const counts = new Array(6).fill(0);
    const draws = 6000;
    for (let i = 0; i < draws; i += 1) counts[randomInt(0, 5)] += 1;
    const expected = draws / 6;
    const chi = counts.reduce((sum, count) => sum + (count - expected) ** 2 / expected, 0);
    assert.ok(chi < 30, `distribution looks skewed: ${counts.join(", ")} (chi² ${chi.toFixed(1)})`);
  });
});

describe("shuffle", () => {
  test("returns a permutation and leaves the input alone", () => {
    const input = ["a", "b", "c", "d", "e"];
    const copy = [...input];
    const result = shuffle(input);
    assert.deepEqual(input, copy, "the caller's array was reordered in place");
    assert.deepEqual([...result].sort(), [...input].sort());
  });

  test("every ordering of three items turns up", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 600; i += 1) seen.add(shuffle([1, 2, 3]).join(""));
    assert.equal(seen.size, 6, `only saw ${[...seen].join(", ")}`);
  });

  test("the first position is fair", () => {
    const counts: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
    const draws = 4000;
    for (let i = 0; i < draws; i += 1) counts[shuffle(["a", "b", "c", "d"])[0]] += 1;
    const expected = draws / 4;
    const chi = Object.values(counts).reduce((s, c) => s + (c - expected) ** 2 / expected, 0);
    assert.ok(chi < 25, `first position skewed: ${JSON.stringify(counts)}`);
  });

  test("handles empty and single lists", () => {
    assert.deepEqual(shuffle([]), []);
    assert.deepEqual(shuffle(["only"]), ["only"]);
  });
});

describe("pick", () => {
  test("returns distinct items from the list", () => {
    const list = ["a", "b", "c", "d", "e", "f"];
    const chosen = pick(list, 4);
    assert.equal(chosen.length, 4);
    assert.equal(new Set(chosen).size, 4, "picked the same item twice");
    for (const item of chosen) assert.ok(list.includes(item));
  });

  test("asking for more than exist returns them all", () => {
    assert.equal(pick(["a", "b"], 5).length, 2);
  });

  test("zero or an empty list returns nothing", () => {
    assert.deepEqual(pick(["a"], 0), []);
    assert.deepEqual(pick([], 3), []);
  });
});

describe("splitTeams", () => {
  test("spreads the remainder rather than piling it on the last team", () => {
    const people = Array.from({ length: 11 }, (_, i) => `p${i}`);
    const teams = splitTeams(people, 3);
    assert.deepEqual(teams.map((team) => team.length).sort(), [3, 4, 4]);
  });

  test("everyone lands in exactly one team", () => {
    const people = Array.from({ length: 17 }, (_, i) => `p${i}`);
    const flat = splitTeams(people, 4).flat();
    assert.equal(flat.length, people.length);
    assert.deepEqual([...flat].sort(), [...people].sort());
  });

  test("team sizes never differ by more than one", () => {
    for (const [size, count] of [[10, 3], [7, 2], [20, 6], [5, 5], [3, 5]]) {
      const lengths = splitTeams(Array.from({ length: size }, (_, i) => i), count).map((t) => t.length);
      assert.ok(Math.max(...lengths) - Math.min(...lengths) <= 1, `${size} into ${count}: ${lengths}`);
    }
  });

  test("a nonsensical team count becomes one team", () => {
    assert.equal(splitTeams(["a", "b"], 0).length, 1);
  });
});

describe("parseEntries", () => {
  test("splits on lines and commas and drops blanks", () => {
    assert.deepEqual(parseEntries("Ana\nBen, Chloe\n\n , Diego "), ["Ana", "Ben", "Chloe", "Diego"]);
  });
});

describe("dice and coins", () => {
  test("every roll is a face of the die", () => {
    for (const sides of [4, 6, 20, 100]) {
      const rolls = rollDice(50, sides);
      assert.equal(rolls.length, 50);
      for (const roll of rolls) assert.ok(roll >= 1 && roll <= sides, `d${sides} rolled ${roll}`);
    }
  });

  test("a die needs at least two sides and one roll", () => {
    assert.deepEqual(rollDice(3, 1), []);
    assert.deepEqual(rollDice(0, 6), []);
  });

  test("the roll count is capped", () => {
    assert.equal(rollDice(10_000, 6).length, 100);
  });

  test("flip counts add up", () => {
    const result = flipCoins(500);
    assert.equal(result.flips.length, 500);
    assert.equal(result.heads + result.tails, 500);
    // 500 fair flips landing outside 150..350 heads has odds far below 1e-15.
    assert.ok(result.heads > 150 && result.heads < 350, `${result.heads} heads looks biased`);
  });

  test("at least one flip, at most a thousand", () => {
    assert.equal(flipCoins(0).flips.length, 1);
    assert.equal(flipCoins(1_000_000).flips.length, 1000);
  });
});

describe("tool registry", () => {
  const runner = readFileSync(join(process.cwd(), "src", "components", "tools", "ToolRunner.tsx"), "utf8");

  test("slugs are unique and clean", () => {
    const slugs = TOOLS.map((tool) => tool.slug);
    assert.equal(new Set(slugs).size, slugs.length, "two tools share a slug");
    for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  test("every tool is wired to a component", () => {
    // A registered tool with no component renders an empty card on a page
    // that is in the sitemap - a thin page, which is exactly what to avoid.
    for (const tool of TOOLS) {
      const key = tool.slug.includes("-") ? `"${tool.slug}":` : `${tool.slug}:`;
      assert.ok(
        runner.includes(key) || runner.includes(`"${tool.slug}":`),
        `${tool.slug} has no component in ToolRunner`,
      );
    }
  });

  test("every tool has its copy in English", () => {
    for (const tool of TOOLS) {
      for (const key of [tool.titleKey, tool.descKey, tool.explainerKey]) {
        assert.ok(key in EN, `${tool.slug}: ${key} is not defined`);
      }
    }
  });

  test("every tool category is populated", () => {
    const used = new Set(TOOLS.map((tool) => tool.category));
    for (const category of TOOL_CATEGORIES) {
      assert.ok(used.has(category), `tool category ${category} is empty`);
    }
  });
});
