import { COUNTRY_CODES } from "@/config/countries";
import { num, str, type CalculatorDef } from "@/config/calculators/types";
import {
  concrete,
  force,
  ohmsLaw,
  paint,
  roofArea,
  tiles,
  torque,
} from "@/lib/construction";

/**
 * Construction and engineering calculators.
 *
 * The construction ones work in whatever units they are given rather than
 * converting: a trade calculator that silently turned feet into metres would
 * be worse than useless. The country therefore sets the defaults, and the
 * page says the units are yours.
 */

const EVERYWHERE = COUNTRY_CODES;

export const concreteCalculator: CalculatorDef = {
  slug: "concrete",
  icon: "🧱",
  version: 1,
  category: "construction",
  titleKey: "calc.concrete.title",
  descKey: "calc.concrete.desc",
  countries: EVERYWHERE,
  countryRelevance: "units",
  relatedCalculators: ["tile", "paint", "roof-area"],
  fields: ({ country }) => {
    const metric = country.measurementSystem !== "us-customary";
    return [
      { id: "length", labelKey: "field.slabLength", kind: "number", min: 0.1, max: 200, step: 0.1, slider: false, default: metric ? 5 : 16 },
      { id: "width", labelKey: "field.slabWidth", kind: "number", min: 0.1, max: 200, step: 0.1, slider: false, default: metric ? 4 : 13 },
      {
        id: "thickness",
        labelKey: "field.slabThickness",
        hintKey: "calc.concrete.thicknessHint",
        kind: "number",
        min: 0.01,
        max: 2,
        step: 0.01,
        slider: false,
        default: metric ? 0.1 : 0.33,
      },
      { id: "waste", labelKey: "field.wasteAllowance", kind: "percent", min: 0, max: 30, step: 1, default: 10 },
      {
        id: "mix",
        labelKey: "field.concreteMix",
        kind: "select",
        default: "1-2-4",
        options: [
          { value: "1-2-4", labelKey: "mix.general" },
          { value: "1-1.5-3", labelKey: "mix.structural" },
          { value: "1-3-6", labelKey: "mix.foundation" },
        ],
      },
      {
        id: "bagYield",
        labelKey: "field.bagYield",
        hintKey: "calc.concrete.bagHint",
        kind: "number",
        min: 0.001,
        max: 1,
        step: 0.001,
        slider: false,
        default: metric ? 0.011 : 0.375,
      },
    ];
  },
  compute: (values) => {
    const mix = str(values, "mix", "1-2-4").split("-").map(Number) as [number, number, number];
    const result = concrete({
      length: num(values, "length"),
      width: num(values, "width"),
      thickness: num(values, "thickness"),
      wastePercent: num(values, "waste"),
      bagYield: num(values, "bagYield"),
      mix,
    });

    return {
      primary: {
        labelKey: "result.concreteVolume",
        value: result.volumeWithWaste,
        kind: "number",
        decimals: 3,
        emphasis: true,
        hintKey: "units.cubed",
      },
      rows: [
        { labelKey: "result.bagsNeeded", value: Math.ceil(result.bags), kind: "number", tone: "returns" },
        { labelKey: "result.volumeBeforeWaste", value: result.volume, kind: "number", decimals: 3, tone: "neutral" },
        { labelKey: "result.cementPart", value: result.cement, kind: "number", decimals: 3, tone: "principal" },
        { labelKey: "result.sandPart", value: result.sand, kind: "number", decimals: 3, tone: "principal" },
        { labelKey: "result.aggregatePart", value: result.aggregate, kind: "number", decimals: 3, tone: "principal" },
      ],
      chart: [
        { labelKey: "result.cementPart", value: Math.max(result.cement, 0), tone: "principal" },
        { labelKey: "result.sandPart", value: Math.max(result.sand, 0), tone: "returns" },
        { labelKey: "result.aggregatePart", value: Math.max(result.aggregate, 0), tone: "neutral" },
      ],
      notes: [{ key: "calc.concrete.note" }],
    };
  },
  explainerKeys: ["calc.concrete.explain.1", "calc.concrete.explain.2"],
  faqKeys: ["calc.concrete.faq.1", "calc.concrete.faq.2"],
};

export const paintCalculator: CalculatorDef = {
  slug: "paint",
  icon: "🎨",
  version: 1,
  category: "construction",
  titleKey: "calc.paint.title",
  descKey: "calc.paint.desc",
  countries: EVERYWHERE,
  countryRelevance: "units",
  relatedCalculators: ["tile", "concrete", "roof-area"],
  fields: ({ country }) => {
    const metric = country.measurementSystem !== "us-customary";
    return [
      { id: "perimeter", labelKey: "field.roomPerimeter", hintKey: "calc.paint.perimeterHint", kind: "number", min: 1, max: 200, step: 0.5, slider: false, default: metric ? 18 : 60 },
      { id: "height", labelKey: "field.wallHeight", kind: "number", min: 1, max: 10, step: 0.1, slider: false, default: metric ? 2.4 : 8 },
      { id: "openings", labelKey: "field.openingsArea", hintKey: "calc.paint.openingsHint", kind: "number", min: 0, max: 100, step: 0.5, slider: false, default: metric ? 5 : 54 },
      { id: "coats", labelKey: "field.coats", kind: "number", min: 1, max: 5, step: 1, default: 2 },
      {
        id: "coverage",
        labelKey: "field.coveragePerLitre",
        hintKey: "calc.paint.coverageHint",
        kind: "number",
        min: 1,
        max: 500,
        step: 1,
        slider: false,
        default: metric ? 12 : 350,
      },
    ];
  },
  compute: (values) => {
    const result = paint({
      perimeter: num(values, "perimeter"),
      height: num(values, "height"),
      coats: num(values, "coats", 2),
      coveragePerLitre: num(values, "coverage"),
      openings: num(values, "openings"),
    });

    return {
      primary: {
        labelKey: "result.paintNeeded",
        value: result.litres,
        kind: "number",
        decimals: 2,
        emphasis: true,
      },
      rows: [
        { labelKey: "result.paintableArea", value: result.paintableArea, kind: "number", decimals: 2, tone: "principal", hintKey: "units.squared" },
        { labelKey: "result.perCoat", value: result.litresPerCoat, kind: "number", decimals: 2, tone: "returns" },
        { labelKey: "result.wallAreaTotal", value: result.totalArea, kind: "number", decimals: 2, tone: "neutral" },
      ],
      notes: [{ key: "calc.paint.note" }],
    };
  },
  explainerKeys: ["calc.paint.explain.1", "calc.paint.explain.2"],
  faqKeys: ["calc.paint.faq.1", "calc.paint.faq.2"],
};

export const tileCalculator: CalculatorDef = {
  slug: "tile",
  icon: "🔲",
  version: 1,
  category: "construction",
  titleKey: "calc.tile.title",
  descKey: "calc.tile.desc",
  countries: EVERYWHERE,
  countryRelevance: "units",
  relatedCalculators: ["paint", "concrete", "roof-area"],
  fields: ({ country }) => {
    const metric = country.measurementSystem !== "us-customary";
    return [
      { id: "areaLength", labelKey: "field.areaLength", kind: "number", min: 0.1, max: 100, step: 0.1, slider: false, default: metric ? 4 : 13 },
      { id: "areaWidth", labelKey: "field.areaWidth", kind: "number", min: 0.1, max: 100, step: 0.1, slider: false, default: metric ? 3 : 10 },
      { id: "tileLength", labelKey: "field.tileLength", hintKey: "calc.tile.tileHint", kind: "number", min: 0.01, max: 5, step: 0.01, slider: false, default: metric ? 0.6 : 2 },
      { id: "tileWidth", labelKey: "field.tileWidth", kind: "number", min: 0.01, max: 5, step: 0.01, slider: false, default: metric ? 0.6 : 2 },
      { id: "waste", labelKey: "field.wasteAllowance", hintKey: "calc.tile.wasteHint", kind: "percent", min: 0, max: 30, step: 1, default: 10 },
      { id: "perBox", labelKey: "field.tilesPerBox", kind: "number", min: 0, max: 100, step: 1, default: 6 },
    ];
  },
  compute: (values) => {
    const result = tiles({
      areaLength: num(values, "areaLength"),
      areaWidth: num(values, "areaWidth"),
      tileLength: num(values, "tileLength"),
      tileWidth: num(values, "tileWidth"),
      wastePercent: num(values, "waste"),
      perBox: num(values, "perBox"),
    });

    return {
      primary: {
        labelKey: "result.tilesNeeded",
        value: result.tiles,
        kind: "number",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.boxesNeeded", value: result.boxes, kind: "number", tone: "returns" },
        { labelKey: "result.areaToCover", value: result.area, kind: "number", decimals: 2, tone: "principal", hintKey: "units.squared" },
        { labelKey: "result.tilesBeforeWaste", value: Math.ceil(result.tilesExact), kind: "number", tone: "neutral" },
      ],
      notes: [{ key: "calc.tile.note" }],
    };
  },
  explainerKeys: ["calc.tile.explain.1", "calc.tile.explain.2"],
  faqKeys: ["calc.tile.faq.1", "calc.tile.faq.2"],
};

export const roofAreaCalculator: CalculatorDef = {
  slug: "roof-area",
  icon: "🏠",
  version: 1,
  category: "construction",
  titleKey: "calc.roof.title",
  descKey: "calc.roof.desc",
  countries: EVERYWHERE,
  countryRelevance: "units",
  relatedCalculators: ["tile", "concrete", "paint"],
  fields: ({ country }) => {
    const metric = country.measurementSystem !== "us-customary";
    return [
      { id: "length", labelKey: "field.buildingLength", kind: "number", min: 1, max: 200, step: 0.5, slider: false, default: metric ? 12 : 40 },
      { id: "width", labelKey: "field.buildingWidth", kind: "number", min: 1, max: 200, step: 0.5, slider: false, default: metric ? 8 : 26 },
      { id: "rise", labelKey: "field.roofRise", hintKey: "calc.roof.pitchHint", kind: "number", min: 0, max: 24, step: 0.5, default: 6 },
      { id: "overhang", labelKey: "field.roofOverhang", kind: "number", min: 0, max: 3, step: 0.05, slider: false, default: metric ? 0.3 : 1 },
    ];
  },
  compute: (values) => {
    const overhang = num(values, "overhang");
    const result = roofArea({
      // The overhang runs all the way round, so it adds twice to each side.
      footprintLength: num(values, "length") + overhang * 2,
      footprintWidth: num(values, "width") + overhang * 2,
      rise: num(values, "rise"),
      run: 12,
    });

    return {
      primary: {
        labelKey: "result.roofArea",
        value: result.area,
        kind: "number",
        decimals: 2,
        emphasis: true,
        hintKey: "units.squared",
      },
      rows: [
        { labelKey: "result.footprint", value: result.footprint, kind: "number", decimals: 2, tone: "principal" },
        { labelKey: "result.pitchFactor", value: result.factor, kind: "number", decimals: 4, tone: "returns" },
        { labelKey: "result.pitchDegrees", value: result.pitchDegrees, kind: "number", decimals: 1, tone: "neutral", hintKey: "units.degrees" },
        // Roofing is ordered in squares in some markets: 100 sq ft each.
        { labelKey: "result.roofingSquares", value: result.area / 100, kind: "number", decimals: 2, tone: "neutral", hintKey: "calc.roof.squaresHint" },
      ],
      notes: [{ key: "calc.roof.note" }],
    };
  },
  explainerKeys: ["calc.roof.explain.1", "calc.roof.explain.2"],
  faqKeys: ["calc.roof.faq.1", "calc.roof.faq.2"],
};

/* ---------------------------------------------------------- engineering */

export const ohmsLawCalculator: CalculatorDef = {
  slug: "ohms-law",
  icon: "⚡",
  version: 1,
  category: "engineering",
  titleKey: "calc.ohms.title",
  descKey: "calc.ohms.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["force", "torque"],
  fields: () => [
    {
      id: "known",
      labelKey: "field.knownPair",
      kind: "select",
      default: "vr",
      options: [
        { value: "vr", labelKey: "ohms.vr" },
        { value: "vi", labelKey: "ohms.vi" },
        { value: "ir", labelKey: "ohms.ir" },
        { value: "pv", labelKey: "ohms.pv" },
        { value: "pi", labelKey: "ohms.pi" },
        { value: "pr", labelKey: "ohms.pr" },
      ],
    },
    { id: "a", labelKey: "field.firstValue", kind: "number", min: 0, max: 10_000, step: 0.1, slider: false, default: 12 },
    { id: "b", labelKey: "field.secondValue", kind: "number", min: 0.0001, max: 10_000, step: 0.1, slider: false, default: 100 },
  ],
  compute: (values) => {
    const result = ohmsLaw(
      str(values, "known", "vr") as "vi" | "vr" | "ir" | "pv" | "pi" | "pr",
      num(values, "a"),
      num(values, "b"),
    );

    const finite = (value: number) => (Number.isFinite(value) ? value : 0);

    return {
      primary: {
        labelKey: "result.power",
        value: finite(result.watts),
        kind: "number",
        decimals: 4,
        emphasis: true,
        hintKey: "units.watts",
      },
      rows: [
        { labelKey: "result.voltage", value: finite(result.volts), kind: "number", decimals: 4, tone: "principal", hintKey: "units.volts" },
        { labelKey: "result.current", value: finite(result.amps), kind: "number", decimals: 4, tone: "returns", hintKey: "units.amps" },
        { labelKey: "result.resistance", value: finite(result.ohms), kind: "number", decimals: 4, tone: "neutral", hintKey: "units.ohms" },
      ],
      notes: [{ key: "calc.ohms.note" }],
    };
  },
  explainerKeys: ["calc.ohms.explain.1", "calc.ohms.explain.2"],
  faqKeys: ["calc.ohms.faq.1", "calc.ohms.faq.2"],
};

export const forceCalculator: CalculatorDef = {
  slug: "force",
  icon: "🏋️",
  version: 1,
  category: "engineering",
  titleKey: "calc.force.title",
  descKey: "calc.force.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["torque", "ohms-law"],
  fields: () => [
    { id: "mass", labelKey: "field.mass", hintKey: "calc.force.massHint", kind: "number", min: 0, max: 10_000, step: 0.5, slider: false, default: 80 },
    { id: "acceleration", labelKey: "field.acceleration", hintKey: "calc.force.accelHint", kind: "number", min: 0, max: 100, step: 0.1, slider: false, default: 9.80665 },
  ],
  compute: (values) => {
    const mass = num(values, "mass");
    const result = force(mass, num(values, "acceleration"));

    return {
      primary: {
        labelKey: "result.force",
        value: result.force,
        kind: "number",
        decimals: 3,
        emphasis: true,
        hintKey: "units.newtons",
      },
      rows: [
        { labelKey: "result.weightOnEarth", value: result.weight, kind: "number", decimals: 3, tone: "principal", hintKey: "units.newtons" },
        { labelKey: "result.mass", value: mass, kind: "number", decimals: 2, tone: "neutral", hintKey: "units.kilograms" },
        // Kilogram-force is still how a lot of equipment is labelled.
        { labelKey: "result.kilogramForce", value: result.force / 9.80665, kind: "number", decimals: 3, tone: "returns" },
      ],
      notes: [{ key: "calc.force.note" }],
    };
  },
  explainerKeys: ["calc.force.explain.1", "calc.force.explain.2"],
  faqKeys: ["calc.force.faq.1", "calc.force.faq.2"],
};

export const torqueCalculator: CalculatorDef = {
  slug: "torque",
  icon: "🔧",
  version: 1,
  category: "engineering",
  titleKey: "calc.torque.title",
  descKey: "calc.torque.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["force", "ohms-law"],
  fields: () => [
    { id: "force", labelKey: "field.appliedForce", kind: "number", min: 0, max: 10_000, step: 1, slider: false, default: 200 },
    { id: "radius", labelKey: "field.leverLength", kind: "number", min: 0, max: 10, step: 0.01, slider: false, default: 0.3 },
    { id: "angle", labelKey: "field.forceAngle", hintKey: "calc.torque.angleHint", kind: "number", min: 0, max: 180, step: 5, default: 90 },
  ],
  compute: (values) => {
    const result = torque(
      num(values, "force"),
      num(values, "radius"),
      num(values, "angle", 90),
    );

    return {
      primary: {
        labelKey: "result.torque",
        value: result.torque,
        kind: "number",
        decimals: 3,
        emphasis: true,
        hintKey: "units.newtonMetres",
      },
      rows: [
        { labelKey: "result.effectiveForce", value: result.effectiveForce, kind: "number", decimals: 3, tone: "principal", hintKey: "units.newtons" },
        // 1 N·m is 0.7376 lb·ft; torque wrenches are sold in both.
        { labelKey: "result.poundFeet", value: result.torque * 0.737562149, kind: "number", decimals: 3, tone: "returns" },
      ],
      notes: [{ key: "calc.torque.note" }],
    };
  },
  explainerKeys: ["calc.torque.explain.1", "calc.torque.explain.2"],
  faqKeys: ["calc.torque.faq.1", "calc.torque.faq.2"],
};

export const CONSTRUCTION_CALCULATORS = [
  concreteCalculator,
  paintCalculator,
  tileCalculator,
  roofAreaCalculator,
];

export const ENGINEERING_CALCULATORS = [
  ohmsLawCalculator,
  forceCalculator,
  torqueCalculator,
];
