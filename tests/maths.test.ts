import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import {
  area2D,
  hypotenuse,
  logarithm,
  missingLeg,
  nthRoot,
  parseNumberList,
  power,
  quadraticVertex,
  rightTriangleAngles,
  simplifyRatio,
  solveProportion,
  solveQuadratic,
  statistics,
  volume3D,
} from "../src/lib/maths/index.ts";

function near(actual: number, expected: number, tolerance = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

describe("parseNumberList", () => {
  test("accepts commas, spaces and semicolons", () => {
    assert.deepEqual(parseNumberList("1, 2 3;4"), [1, 2, 3, 4]);
  });

  test("keeps negatives and decimals", () => {
    assert.deepEqual(parseNumberList("-1.5, 2.25"), [-1.5, 2.25]);
  });

  test("drops anything that is not a number rather than producing NaN", () => {
    assert.deepEqual(parseNumberList("1, apple, 3"), [1, 3]);
    assert.deepEqual(parseNumberList(""), []);
    assert.deepEqual(parseNumberList("   "), []);
  });
});

describe("statistics", () => {
  test("an empty set has no statistics", () => {
    assert.equal(statistics([]), null);
  });

  test("the central measures on a known set", () => {
    const stats = statistics([12, 15, 15, 18, 21, 24, 30]);
    assert.ok(stats);
    assert.equal(stats.count, 7);
    assert.equal(stats.sum, 135);
    near(stats.mean, 135 / 7);
    assert.equal(stats.median, 18);
    assert.deepEqual(stats.mode, [15]);
    assert.equal(stats.min, 12);
    assert.equal(stats.max, 30);
    assert.equal(stats.range, 18);
  });

  test("the median of an even set averages the middle two", () => {
    assert.equal(statistics([1, 2, 3, 4])?.median, 2.5);
  });

  test("the input is not reordered in place", () => {
    const values = [3, 1, 2];
    statistics(values);
    assert.deepEqual(values, [3, 1, 2], "sorting leaked back to the caller");
  });

  test("a set with no repeats has no mode", () => {
    assert.deepEqual(statistics([1, 2, 3])?.mode, []);
  });

  test("ties are all reported, in order", () => {
    assert.deepEqual(statistics([3, 1, 3, 1, 2])?.mode, [1, 3]);
  });

  test("standard deviation matches a worked example", () => {
    // 2, 4, 4, 4, 5, 5, 7, 9 is the textbook set: population sd is exactly 2.
    const stats = statistics([2, 4, 4, 4, 5, 5, 7, 9]);
    assert.ok(stats);
    near(stats.mean, 5);
    near(stats.populationStdDev, 2, 1e-12);
    near(stats.variance, 4, 1e-12);
    // The sample version divides by n-1, so it is a little larger.
    near(stats.sampleStdDev, Math.sqrt(32 / 7), 1e-12);
    assert.ok(stats.sampleStdDev > stats.populationStdDev);
  });

  test("a single value has zero spread and no sample deviation", () => {
    const stats = statistics([5]);
    assert.ok(stats);
    assert.equal(stats.populationStdDev, 0);
    assert.equal(stats.sampleStdDev, 0);
    assert.equal(stats.range, 0);
    assert.equal(stats.median, 5);
  });

  test("identical values have zero deviation", () => {
    const stats = statistics([7, 7, 7, 7]);
    assert.ok(stats);
    near(stats.populationStdDev, 0);
    near(stats.sampleStdDev, 0);
  });
});

describe("simplifyRatio", () => {
  test("reduces by the greatest common divisor", () => {
    assert.deepEqual(simplifyRatio(4, 6), { a: 2, b: 3 });
    assert.deepEqual(simplifyRatio(100, 75), { a: 4, b: 3 });
    assert.deepEqual(simplifyRatio(7, 13), { a: 7, b: 13 });
  });

  test("scales decimals to whole numbers first", () => {
    // The mistake this guards against is leaving 2.5 : 5 alone.
    assert.deepEqual(simplifyRatio(2.5, 5), { a: 1, b: 2 });
    assert.deepEqual(simplifyRatio(0.5, 0.25), { a: 2, b: 1 });
  });

  test("a zero term does not divide by zero", () => {
    assert.deepEqual(simplifyRatio(0, 5), { a: 0, b: 1 });
    assert.deepEqual(simplifyRatio(0, 0), { a: 0, b: 0 });
  });

  test("the simplified ratio is equivalent to the original", () => {
    for (const [a, b] of [[4, 6], [100, 75], [2.5, 5], [9, 3]]) {
      const simple = simplifyRatio(a, b);
      near(simple.a / simple.b, a / b, 1e-9);
    }
  });
});

describe("solveProportion", () => {
  test("solves a : b = c : x", () => {
    // 4 : 6 = 20 : 30
    near(solveProportion(4, 6, 20), 30);
  });

  test("a zero first term yields zero rather than infinity", () => {
    assert.equal(solveProportion(0, 6, 20), 0);
  });
});

describe("solveQuadratic", () => {
  test("two real roots", () => {
    const solution = solveQuadratic(1, -3, 2);
    assert.equal(solution.kind, "two");
    if (solution.kind !== "two") return;
    near(solution.x1, 2);
    near(solution.x2, 1);
    near(solution.discriminant, 1);
  });

  test("one repeated root when the discriminant is zero", () => {
    const solution = solveQuadratic(1, -2, 1);
    assert.equal(solution.kind, "one");
    if (solution.kind !== "one") return;
    near(solution.x1, 1);
    assert.equal(solution.discriminant, 0);
  });

  test("a complex pair is reported rather than called no solution", () => {
    const solution = solveQuadratic(1, 0, 1);
    assert.equal(solution.kind, "complex");
    if (solution.kind !== "complex") return;
    near(solution.real, 0);
    near(solution.imaginary, 1);
  });

  test("a = 0 is a straight line, not a quadratic", () => {
    assert.equal(solveQuadratic(0, 2, 1).kind, "not-quadratic");
  });

  test("the roots satisfy the equation they came from", () => {
    const cases: [number, number, number][] = [
      [1, -3, 2],
      [2, 5, -3],
      [-1, 4, 5],
      [0.5, -2, 1],
    ];
    for (const [a, b, c] of cases) {
      const solution = solveQuadratic(a, b, c);
      if (solution.kind === "two") {
        near(a * solution.x1 ** 2 + b * solution.x1 + c, 0, 1e-9);
        near(a * solution.x2 ** 2 + b * solution.x2 + c, 0, 1e-9);
      } else if (solution.kind === "one") {
        near(a * solution.x1 ** 2 + b * solution.x1 + c, 0, 1e-9);
      }
    }
  });

  test("the vertex sits midway between two real roots", () => {
    const solution = solveQuadratic(1, -3, 2);
    assert.equal(solution.kind, "two");
    if (solution.kind !== "two") return;
    const vertex = quadraticVertex(1, -3, 2);
    near(vertex.x, (solution.x1 + solution.x2) / 2);
  });
});

describe("right triangles", () => {
  test("the 3-4-5 triple", () => {
    near(hypotenuse(3, 4), 5);
    near(missingLeg(5, 3), 4);
    near(missingLeg(5, 4), 3);
  });

  test("a leg longer than the hypotenuse is impossible, not negative", () => {
    assert.equal(missingLeg(3, 5), 0);
    assert.equal(missingLeg(5, 5), 0);
  });

  test("the two acute angles add to 90", () => {
    for (const [a, b] of [[3, 4], [1, 1], [10, 1]]) {
      const { alpha, beta } = rightTriangleAngles(a, b);
      near(alpha + beta, 90, 1e-9);
      assert.ok(alpha > 0 && beta > 0, "an angle was not positive");
    }
  });

  test("equal legs give 45 degrees each", () => {
    const { alpha, beta } = rightTriangleAngles(1, 1);
    near(alpha, 45, 1e-9);
    near(beta, 45, 1e-9);
  });
});

describe("area2D", () => {
  test("known areas", () => {
    assert.deepEqual(area2D("rectangle", { a: 10, b: 6 }), { area: 60, perimeter: 32 });
    near(area2D("triangle", { a: 3, b: 4 }).area, 6);
    near(area2D("circle", { a: 1, b: 0 }).area, Math.PI);
    near(area2D("circle", { a: 1, b: 0 }).perimeter, 2 * Math.PI);
    near(area2D("trapezoid", { a: 4, b: 6, c: 2 }).area, 10);
    near(area2D("parallelogram", { a: 5, b: 3 }).area, 15);
  });

  test("a triangle with no third side assumes a right angle", () => {
    // 3 and 4 as base and height implies a hypotenuse of 5.
    near(area2D("triangle", { a: 3, b: 4 }).perimeter, 12);
  });

  test("area and perimeter are never negative for positive dimensions", () => {
    for (const shape of ["rectangle", "triangle", "circle", "trapezoid", "parallelogram"] as const) {
      const { area, perimeter } = area2D(shape, { a: 5, b: 3, c: 2 });
      assert.ok(area >= 0 && perimeter >= 0, `${shape} produced a negative`);
    }
  });
});

describe("volume3D", () => {
  test("known volumes", () => {
    assert.deepEqual(volume3D("box", { a: 2, b: 3, c: 4 }), { volume: 24, surface: 52 });
    near(volume3D("cylinder", { a: 1, b: 1 }).volume, Math.PI);
    near(volume3D("sphere", { a: 1 }).volume, (4 / 3) * Math.PI);
    near(volume3D("sphere", { a: 1 }).surface, 4 * Math.PI);
  });

  test("a cone is exactly a third of its cylinder", () => {
    const cylinder = volume3D("cylinder", { a: 3, b: 7 });
    const cone = volume3D("cone", { a: 3, b: 7 });
    near(cone.volume, cylinder.volume / 3, 1e-9);
  });

  test("a cubic metre is a thousand litres", () => {
    near(volume3D("box", { a: 1, b: 1, c: 1 }).volume * 1000, 1000);
  });
});

describe("powers, roots and logarithms", () => {
  test("known values", () => {
    assert.equal(power(2, 10), 1024);
    assert.equal(power(2, 0), 1);
    near(power(2, -1), 0.5);
    near(nthRoot(27, 3), 3, 1e-9);
    near(nthRoot(16, 2), 4, 1e-9);
  });

  test("a root undoes its power", () => {
    for (const [base, degree] of [[2, 3], [5, 2], [10, 4]]) {
      near(nthRoot(power(base, degree), degree), base, 1e-9);
    }
  });

  test("an odd root of a negative number is real; an even one is not", () => {
    near(nthRoot(-8, 3), -2, 1e-9);
    assert.ok(Number.isNaN(nthRoot(-8, 2)));
  });

  test("a zero degree has no root rather than dividing by zero", () => {
    assert.equal(nthRoot(8, 0), 0);
  });

  test("the logarithm inverts the power", () => {
    near(logarithm(1024, 2), 10, 1e-9);
    near(logarithm(100, 10), 2, 1e-9);
  });

  test("logarithms undefined in the reals return NaN rather than a number", () => {
    assert.ok(Number.isNaN(logarithm(0, 10)));
    assert.ok(Number.isNaN(logarithm(-5, 10)));
    assert.ok(Number.isNaN(logarithm(10, 1)));
    assert.ok(Number.isNaN(logarithm(10, 0)));
  });
});
