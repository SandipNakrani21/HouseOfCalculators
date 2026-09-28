/**
 * General mathematics used by the maths calculators.
 *
 * Kept separate from `lib/tools/numbers`, which holds the single-purpose
 * number utilities (Roman numerals, primes, fractions). This module is about
 * working with a set of values, a shape, or an equation.
 */

/** Parses the free-text list a statistics calculator is given. */
export function parseNumberList(input: string): number[] {
  return input
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite);
}

export type Statistics = {
  count: number;
  sum: number;
  mean: number;
  median: number;
  /** Every value tied for most frequent; empty when nothing repeats. */
  mode: number[];
  range: number;
  min: number;
  max: number;
  /** Population standard deviation, and the sample one beside it. */
  populationStdDev: number;
  sampleStdDev: number;
  variance: number;
};

export function statistics(values: number[]): Statistics | null {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const count = values.length;
  const sum = values.reduce((total, value) => total + value, 0);
  const mean = sum / count;

  const middle = Math.floor(count / 2);
  const median =
    count % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];

  const frequency = new Map<number, number>();
  for (const value of values) frequency.set(value, (frequency.get(value) ?? 0) + 1);
  const highest = Math.max(...frequency.values());
  // A set where nothing repeats has no mode; saying "every value" would be
  // technically arguable and useless on the page.
  const mode =
    highest === 1
      ? []
      : [...frequency.entries()]
          .filter(([, times]) => times === highest)
          .map(([value]) => value)
          .sort((a, b) => a - b);

  const squaredError = values.reduce(
    (total, value) => total + (value - mean) ** 2,
    0,
  );
  const variance = squaredError / count;

  return {
    count,
    sum,
    mean,
    median,
    mode,
    range: sorted[count - 1] - sorted[0],
    min: sorted[0],
    max: sorted[count - 1],
    variance,
    populationStdDev: Math.sqrt(variance),
    // Bessel's correction; undefined for a single observation, reported as 0.
    sampleStdDev: count > 1 ? Math.sqrt(squaredError / (count - 1)) : 0,
  };
}

/** Greatest common divisor, for reducing a ratio. */
function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

/** Reduces `a:b` to its simplest whole-number form. */
export function simplifyRatio(a: number, b: number): { a: number; b: number } {
  // Ratios are often entered with decimals; scale to integers first so
  // 2.5 : 5 reduces to 1 : 2 rather than being left alone.
  const decimals = Math.max(decimalPlaces(a), decimalPlaces(b));
  const factor = 10 ** decimals;
  const left = Math.round(a * factor);
  const right = Math.round(b * factor);

  const divisor = gcd(left, right) || 1;
  return { a: left / divisor, b: right / divisor };
}

function decimalPlaces(value: number): number {
  if (Number.isInteger(value)) return 0;
  const text = String(value);
  const point = text.indexOf(".");
  return point === -1 ? 0 : Math.min(text.length - point - 1, 8);
}

/** Solves `a : b = c : x` for the missing fourth term. */
export function solveProportion(a: number, b: number, c: number): number {
  return a === 0 ? 0 : (b * c) / a;
}

export type QuadraticSolution =
  | { kind: "two"; x1: number; x2: number; discriminant: number }
  | { kind: "one"; x1: number; discriminant: number }
  | { kind: "complex"; real: number; imaginary: number; discriminant: number }
  | { kind: "not-quadratic" };

/**
 * Roots of `ax² + bx + c = 0`.
 *
 * A negative discriminant is reported as a complex pair rather than as "no
 * solution", because the roots exist and a student looking this up needs them.
 */
export function solveQuadratic(a: number, b: number, c: number): QuadraticSolution {
  if (a === 0) return { kind: "not-quadratic" };

  const discriminant = b * b - 4 * a * c;

  if (discriminant > 0) {
    const root = Math.sqrt(discriminant);
    return {
      kind: "two",
      x1: (-b + root) / (2 * a),
      x2: (-b - root) / (2 * a),
      discriminant,
    };
  }

  if (discriminant === 0) {
    return { kind: "one", x1: -b / (2 * a), discriminant };
  }

  return {
    kind: "complex",
    real: -b / (2 * a),
    imaginary: Math.sqrt(-discriminant) / (2 * a),
    discriminant,
  };
}

/** Vertex of the parabola, which is where the turning point is. */
export function quadraticVertex(a: number, b: number, c: number): { x: number; y: number } {
  const x = a === 0 ? 0 : -b / (2 * a);
  return { x, y: a * x * x + b * x + c };
}

/** The third side of a right triangle, given the other two. */
export function hypotenuse(a: number, b: number): number {
  return Math.hypot(a, b);
}

/** Angles of a right triangle in degrees, from the two legs. */
export function rightTriangleAngles(a: number, b: number): { alpha: number; beta: number } {
  const alpha = (Math.atan2(a, b) * 180) / Math.PI;
  return { alpha, beta: 90 - alpha };
}

export type Shape2D = "rectangle" | "triangle" | "circle" | "trapezoid" | "parallelogram";

/** Area and perimeter of a 2D shape from its defining dimensions. */
export function area2D(
  shape: Shape2D,
  dimensions: { a: number; b: number; c?: number },
): { area: number; perimeter: number } {
  const { a, b, c = 0 } = dimensions;

  switch (shape) {
    case "rectangle":
      return { area: a * b, perimeter: 2 * (a + b) };
    case "triangle":
      // a and b are base and height; c is the third side for the perimeter.
      return {
        area: (a * b) / 2,
        perimeter: a + b + (c || hypotenuse(a, b)),
      };
    case "circle":
      // a is the radius.
      return { area: Math.PI * a * a, perimeter: 2 * Math.PI * a };
    case "trapezoid":
      // a and b are the parallel sides, c the height.
      return { area: ((a + b) / 2) * c, perimeter: a + b + 2 * c };
    case "parallelogram":
      return { area: a * b, perimeter: 2 * (a + (c || b)) };
  }
}

export type Shape3D = "box" | "cylinder" | "sphere" | "cone";

/** Volume and surface area of a solid. */
export function volume3D(
  shape: Shape3D,
  dimensions: { a: number; b?: number; c?: number },
): { volume: number; surface: number } {
  const { a, b = 0, c = 0 } = dimensions;

  switch (shape) {
    case "box":
      return { volume: a * b * c, surface: 2 * (a * b + b * c + a * c) };
    case "cylinder":
      // a is the radius, b the height.
      return {
        volume: Math.PI * a * a * b,
        surface: 2 * Math.PI * a * (a + b),
      };
    case "sphere":
      return { volume: (4 / 3) * Math.PI * a ** 3, surface: 4 * Math.PI * a * a };
    case "cone":
      return {
        volume: (Math.PI * a * a * b) / 3,
        surface: Math.PI * a * (a + Math.hypot(a, b)),
      };
  }
}

/** `base^exponent`, with the root that undoes it. */
export function power(base: number, exponent: number): number {
  return base ** exponent;
}

export function nthRoot(value: number, degree: number): number {
  if (degree === 0) return 0;
  // A negative base has a real root only for an odd degree.
  if (value < 0) {
    return degree % 2 === 1 ? -(Math.abs(value) ** (1 / degree)) : Number.NaN;
  }
  return value ** (1 / degree);
}

/** Logarithm to any base, for the exponent calculator's inverse view. */
export function logarithm(value: number, base: number): number {
  if (value <= 0 || base <= 0 || base === 1) return Number.NaN;
  return Math.log(value) / Math.log(base);
}
