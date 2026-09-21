import { COUNTRY_CODES } from "@/config/countries";
import { num, str, type CalculatorDef } from "@/config/calculators/types";
import {
  area2D,
  hypotenuse,
  logarithm,
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
  type Shape2D,
  type Shape3D,
} from "@/lib/maths";

/**
 * Mathematics calculators.
 *
 * None of these are country-specific - a hypotenuse is a hypotenuse - so they
 * live under /calculators/math and the country only affects number formatting.
 *
 * Deliberately not duplicated here: percentages, prime checking, fractions and
 * Roman numerals already exist as tools. Giving each of them a second home
 * under calculators would be two URLs competing for one query, which is the
 * thing the IA is built to avoid.
 */

const EVERYWHERE = COUNTRY_CODES;

export const statisticsCalculator: CalculatorDef = {
  slug: "statistics",
  icon: "📊",
  version: 1,
  category: "math",
  titleKey: "calc.statistics.title",
  descKey: "calc.statistics.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["ratio", "exponent"],
  fields: () => [
    {
      id: "values",
      labelKey: "field.numberList",
      hintKey: "calc.statistics.listHint",
      // A set of values, so a text box rather than a slider.
      kind: "text",
      default: "12, 15, 15, 18, 21, 24, 30",
    },
  ],
  compute: (values) => {
    const list = parseNumberList(str(values, "values"));
    const stats = statistics(list);

    if (!stats) {
      return {
        primary: { labelKey: "result.mean", value: 0, kind: "number", emphasis: true },
        rows: [],
        notes: [{ key: "calc.statistics.empty" }],
      };
    }

    return {
      primary: {
        labelKey: "result.mean",
        value: stats.mean,
        kind: "number",
        decimals: 2,
        emphasis: true,
      },
      rows: [
        { labelKey: "result.median", value: stats.median, kind: "number", decimals: 2, tone: "principal" },
        {
          labelKey: "result.mode",
          value: stats.mode.length ? stats.mode.join(", ") : "—",
          kind: "text",
          tone: "returns",
        },
        { labelKey: "result.count", value: stats.count, kind: "number", tone: "neutral" },
        { labelKey: "result.sum", value: stats.sum, kind: "number", decimals: 2, tone: "neutral" },
        { labelKey: "result.min", value: stats.min, kind: "number", decimals: 2, tone: "neutral" },
        { labelKey: "result.max", value: stats.max, kind: "number", decimals: 2, tone: "neutral" },
        { labelKey: "result.range", value: stats.range, kind: "number", decimals: 2, tone: "neutral" },
        {
          labelKey: "result.sampleStdDev",
          value: stats.sampleStdDev,
          kind: "number",
          decimals: 4,
          tone: "tax",
          hintKey: "calc.statistics.sampleHint",
        },
        {
          labelKey: "result.populationStdDev",
          value: stats.populationStdDev,
          kind: "number",
          decimals: 4,
          tone: "tax",
        },
        { labelKey: "result.variance", value: stats.variance, kind: "number", decimals: 4, tone: "tax" },
      ],
    };
  },
  explainerKeys: ["calc.statistics.explain.1", "calc.statistics.explain.2"],
  faqKeys: ["calc.statistics.faq.1", "calc.statistics.faq.2"],
};

export const ratioCalculator: CalculatorDef = {
  slug: "ratio",
  icon: "⚖️",
  version: 1,
  category: "math",
  titleKey: "calc.ratio.title",
  descKey: "calc.ratio.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["statistics", "triangle"],
  fields: () => [
    { id: "a", labelKey: "field.ratioA", kind: "number", min: 0, max: 1000, step: 1, slider: false, default: 4 },
    { id: "b", labelKey: "field.ratioB", kind: "number", min: 0, max: 1000, step: 1, slider: false, default: 6 },
    {
      id: "scaleTo",
      labelKey: "field.scaleTo",
      hintKey: "calc.ratio.scaleHint",
      kind: "number",
      min: 0,
      max: 10_000,
      step: 1,
      slider: false,
      default: 20,
    },
  ],
  compute: (values) => {
    const a = num(values, "a");
    const b = num(values, "b");
    const simplified = simplifyRatio(a, b);
    const scaleTo = num(values, "scaleTo");

    return {
      primary: {
        labelKey: "result.simplifiedRatio",
        value: `${simplified.a} : ${simplified.b}`,
        kind: "text",
        emphasis: true,
      },
      rows: [
        {
          labelKey: "result.decimalRatio",
          value: b === 0 ? 0 : a / b,
          kind: "number",
          decimals: 4,
          tone: "principal",
        },
        {
          labelKey: "result.percentOfTotal",
          value: a + b === 0 ? 0 : (a / (a + b)) * 100,
          kind: "percent",
          decimals: 2,
          tone: "returns",
        },
        // a : b = scaleTo : x
        {
          labelKey: "result.scaledPartner",
          value: solveProportion(a, b, scaleTo),
          kind: "number",
          decimals: 2,
          tone: "neutral",
          hintKey: "calc.ratio.scaledHint",
        },
      ],
      chart: [
        { labelKey: "result.ratioA", value: Math.abs(a), tone: "principal" },
        { labelKey: "result.ratioB", value: Math.abs(b), tone: "returns" },
      ],
    };
  },
  explainerKeys: ["calc.ratio.explain.1", "calc.ratio.explain.2"],
  faqKeys: ["calc.ratio.faq.1", "calc.ratio.faq.2"],
};

export const exponentCalculator: CalculatorDef = {
  slug: "exponent",
  icon: "🔢",
  version: 1,
  category: "math",
  titleKey: "calc.exponent.title",
  descKey: "calc.exponent.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["statistics", "quadratic-equation"],
  fields: () => [
    { id: "base", labelKey: "field.base", kind: "number", min: -100, max: 100, step: 0.5, slider: false, default: 2 },
    { id: "exponent", labelKey: "field.exponent", kind: "number", min: -20, max: 20, step: 0.5, slider: false, default: 10 },
    { id: "root", labelKey: "field.rootDegree", kind: "number", min: 2, max: 20, step: 1, slider: false, default: 2 },
  ],
  compute: (values) => {
    const base = num(values, "base");
    const exponent = num(values, "exponent");
    const degree = num(values, "root", 2);

    const result = power(base, exponent);
    const root = nthRoot(base, degree);
    const log = logarithm(Math.abs(result), Math.abs(base));

    const finite = (value: number) => (Number.isFinite(value) ? value : 0);

    return {
      primary: {
        labelKey: "result.power",
        value: finite(result),
        kind: "number",
        decimals: Number.isInteger(result) ? 0 : 6,
        emphasis: true,
      },
      rows: [
        {
          labelKey: "result.nthRoot",
          value: Number.isFinite(root) ? root : "—",
          kind: Number.isFinite(root) ? "number" : "text",
          decimals: 6,
          tone: "principal",
          hintKey: "calc.exponent.rootHint",
        },
        { labelKey: "result.squareRoot", value: base < 0 ? "—" : Math.sqrt(base), kind: base < 0 ? "text" : "number", decimals: 6, tone: "returns" },
        { labelKey: "result.logarithm", value: finite(log), kind: "number", decimals: 6, tone: "neutral" },
      ],
      notes: base < 0 ? [{ key: "calc.exponent.negativeNote" }] : undefined,
    };
  },
  explainerKeys: ["calc.exponent.explain.1", "calc.exponent.explain.2"],
  faqKeys: ["calc.exponent.faq.1", "calc.exponent.faq.2"],
};

export const quadraticCalculator: CalculatorDef = {
  slug: "quadratic-equation",
  icon: "📐",
  version: 1,
  category: "math",
  titleKey: "calc.quadratic.title",
  descKey: "calc.quadratic.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["exponent", "triangle"],
  fields: () => [
    { id: "a", labelKey: "field.coefficientA", kind: "number", min: -50, max: 50, step: 0.5, slider: false, default: 1 },
    { id: "b", labelKey: "field.coefficientB", kind: "number", min: -50, max: 50, step: 0.5, slider: false, default: -3 },
    { id: "c", labelKey: "field.coefficientC", kind: "number", min: -50, max: 50, step: 0.5, slider: false, default: 2 },
  ],
  compute: (values) => {
    const a = num(values, "a");
    const b = num(values, "b");
    const c = num(values, "c");
    const solution = solveQuadratic(a, b, c);
    const vertex = quadraticVertex(a, b, c);

    if (solution.kind === "not-quadratic") {
      return {
        primary: { labelKey: "result.roots", value: "—", kind: "text", emphasis: true },
        rows: [],
        notes: [{ key: "calc.quadratic.notQuadratic" }],
      };
    }

    const roots =
      solution.kind === "two"
        ? `${round(solution.x1)}, ${round(solution.x2)}`
        : solution.kind === "one"
          ? String(round(solution.x1))
          : // A negative discriminant still has roots; saying "no solution"
            // would be wrong for anyone who needs them.
            `${round(solution.real)} ± ${round(solution.imaginary)}i`;

    return {
      primary: { labelKey: "result.roots", value: roots, kind: "text", emphasis: true },
      rows: [
        { labelKey: "result.discriminant", value: solution.discriminant, kind: "number", decimals: 4, tone: "principal" },
        { labelKey: "result.rootType", value: `quadratic.${solution.kind}`, kind: "label", tone: "returns" },
        { labelKey: "result.vertexX", value: vertex.x, kind: "number", decimals: 4, tone: "neutral" },
        { labelKey: "result.vertexY", value: vertex.y, kind: "number", decimals: 4, tone: "neutral" },
      ],
    };
  },
  explainerKeys: ["calc.quadratic.explain.1", "calc.quadratic.explain.2"],
  faqKeys: ["calc.quadratic.faq.1", "calc.quadratic.faq.2"],
};

function round(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

export const triangleCalculator: CalculatorDef = {
  slug: "triangle",
  icon: "📐",
  version: 1,
  category: "math",
  titleKey: "calc.triangle.title",
  descKey: "calc.triangle.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["area", "quadratic-equation"],
  fields: () => [
    { id: "a", labelKey: "field.sideA", kind: "number", min: 0.1, max: 1000, step: 0.1, slider: false, default: 3 },
    { id: "b", labelKey: "field.sideB", kind: "number", min: 0.1, max: 1000, step: 0.1, slider: false, default: 4 },
  ],
  compute: (values) => {
    const a = num(values, "a");
    const b = num(values, "b");
    const c = hypotenuse(a, b);
    const { alpha, beta } = rightTriangleAngles(a, b);

    return {
      primary: {
        labelKey: "result.hypotenuse",
        value: c,
        kind: "number",
        decimals: 4,
        emphasis: true,
      },
      rows: [
        { labelKey: "result.area", value: (a * b) / 2, kind: "number", decimals: 4, tone: "principal" },
        { labelKey: "result.perimeter", value: a + b + c, kind: "number", decimals: 4, tone: "returns" },
        { labelKey: "result.angleA", value: alpha, kind: "number", decimals: 2, tone: "neutral", hintKey: "units.degrees" },
        { labelKey: "result.angleB", value: beta, kind: "number", decimals: 2, tone: "neutral", hintKey: "units.degrees" },
      ],
    };
  },
  explainerKeys: ["calc.triangle.explain.1", "calc.triangle.explain.2"],
  faqKeys: ["calc.triangle.faq.1", "calc.triangle.faq.2"],
};

const SHAPES_2D: Shape2D[] = ["rectangle", "triangle", "circle", "trapezoid", "parallelogram"];
const SHAPES_3D: Shape3D[] = ["box", "cylinder", "sphere", "cone"];

export const areaCalculator: CalculatorDef = {
  slug: "area",
  icon: "🟦",
  version: 1,
  category: "math",
  titleKey: "calc.area.title",
  descKey: "calc.area.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["volume", "triangle"],
  fields: () => [
    {
      id: "shape",
      labelKey: "field.shape",
      kind: "select",
      default: "rectangle",
      options: SHAPES_2D.map((shape) => ({ value: shape, labelKey: `shape.${shape}` })),
    },
    { id: "a", labelKey: "field.dimensionA", kind: "number", min: 0.1, max: 1000, step: 0.1, slider: false, default: 10 },
    {
      id: "b",
      labelKey: "field.dimensionB",
      kind: "number",
      min: 0.1,
      max: 1000,
      step: 0.1,
      slider: false,
      default: 6,
      // A circle is defined by its radius alone.
      visibleWhen: (values) => str(values, "shape", "rectangle") !== "circle",
    },
    {
      id: "c",
      labelKey: "field.dimensionC",
      kind: "number",
      min: 0.1,
      max: 1000,
      step: 0.1,
      slider: false,
      default: 5,
      visibleWhen: (values) => {
        const shape = str(values, "shape", "rectangle");
        return shape === "trapezoid" || shape === "parallelogram" || shape === "triangle";
      },
    },
  ],
  compute: (values) => {
    const shape = str(values, "shape", "rectangle") as Shape2D;
    const { area, perimeter } = area2D(shape, {
      a: num(values, "a"),
      b: num(values, "b"),
      c: num(values, "c"),
    });

    return {
      primary: { labelKey: "result.area", value: area, kind: "number", decimals: 4, emphasis: true, hintKey: "units.squared" },
      rows: [
        { labelKey: "result.perimeter", value: perimeter, kind: "number", decimals: 4, tone: "principal" },
        { labelKey: "result.shape", value: `shape.${shape}`, kind: "label", tone: "neutral" },
      ],
      notes: [{ key: "calc.area.note" }],
    };
  },
  explainerKeys: ["calc.area.explain.1", "calc.area.explain.2"],
  faqKeys: ["calc.area.faq.1", "calc.area.faq.2"],
};

export const volumeCalculator: CalculatorDef = {
  slug: "volume",
  icon: "🧊",
  version: 1,
  category: "math",
  titleKey: "calc.volume.title",
  descKey: "calc.volume.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["area", "triangle"],
  fields: () => [
    {
      id: "shape",
      labelKey: "field.shape",
      kind: "select",
      default: "box",
      options: SHAPES_3D.map((shape) => ({ value: shape, labelKey: `shape.${shape}` })),
    },
    { id: "a", labelKey: "field.dimensionA", kind: "number", min: 0.1, max: 1000, step: 0.1, slider: false, default: 10 },
    {
      id: "b",
      labelKey: "field.dimensionB",
      kind: "number",
      min: 0.1,
      max: 1000,
      step: 0.1,
      slider: false,
      default: 6,
      // A sphere is defined by its radius alone.
      visibleWhen: (values) => str(values, "shape", "box") !== "sphere",
    },
    {
      id: "c",
      labelKey: "field.dimensionC",
      kind: "number",
      min: 0.1,
      max: 1000,
      step: 0.1,
      slider: false,
      default: 4,
      visibleWhen: (values) => str(values, "shape", "box") === "box",
    },
  ],
  compute: (values) => {
    const shape = str(values, "shape", "box") as Shape3D;
    const { volume, surface } = volume3D(shape, {
      a: num(values, "a"),
      b: num(values, "b"),
      c: num(values, "c"),
    });

    return {
      primary: { labelKey: "result.volume", value: volume, kind: "number", decimals: 4, emphasis: true, hintKey: "units.cubed" },
      rows: [
        { labelKey: "result.surfaceArea", value: surface, kind: "number", decimals: 4, tone: "principal", hintKey: "units.squared" },
        { labelKey: "result.shape", value: `shape.${shape}`, kind: "label", tone: "neutral" },
        // Handy because a cubic metre is exactly a thousand litres.
        { labelKey: "result.litresIfMetres", value: volume * 1000, kind: "number", decimals: 2, tone: "returns" },
      ],
      notes: [{ key: "calc.volume.note" }],
    };
  },
  explainerKeys: ["calc.volume.explain.1", "calc.volume.explain.2"],
  faqKeys: ["calc.volume.faq.1", "calc.volume.faq.2"],
};

export const MATH_CALCULATORS = [
  statisticsCalculator,
  ratioCalculator,
  exponentCalculator,
  quadraticCalculator,
  triangleCalculator,
  areaCalculator,
  volumeCalculator,
];
