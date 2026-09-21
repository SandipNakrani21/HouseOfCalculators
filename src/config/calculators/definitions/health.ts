import { COUNTRY_CODES } from "@/config/countries";
import {
  bool,
  num,
  str,
  type CalcContext,
  type CalculatorDef,
  type CalculatorField,
} from "@/config/calculators/types";
import {
  ACTIVITY_FACTORS,
  type ActivityLevel,
  type Sex,
  bmi,
  bmiBand,
  bmr,
  bodyComposition,
  feetInchesToCentimetres,
  formatDuration,
  healthyWeightRange,
  kilogramsToPounds,
  macros,
  navyBodyFat,
  pacePerKm,
  poundsToKilograms,
  speedKmh,
  tdee,
  waterIntake,
} from "@/lib/health";

/**
 * Health and fitness calculators.
 *
 * Two things shape every definition here.
 *
 * First, units are a real country difference rather than a cosmetic one, so
 * the unit toggle defaults from the country's `measurementSystem` and the
 * inputs change with it. Someone in the US is asked for pounds and feet;
 * someone in India is asked for kilograms and centimetres. Nothing is silently
 * converted behind them.
 *
 * Second, these are population-level estimates, not diagnoses. Every page
 * carries that in its explainer, and none of them name a condition.
 */

const EVERYWHERE = COUNTRY_CODES;

/** Imperial by default only where people actually use it. */
function defaultUnits({ country }: CalcContext): string {
  return country.measurementSystem === "us-customary" ? "imperial" : "metric";
}

const unitsField = (ctx: CalcContext): CalculatorField => ({
  id: "units",
  labelKey: "field.units",
  kind: "select",
  default: defaultUnits(ctx),
  options: [
    { value: "metric", labelKey: "option.metric" },
    { value: "imperial", labelKey: "option.imperial" },
  ],
});

const isImperial = (values: Record<string, number | string | boolean>) =>
  str(values, "units", "metric") === "imperial";

/** Weight and height inputs in whichever system is selected. */
function bodyFields(ctx: CalcContext): CalculatorField[] {
  return [
    unitsField(ctx),
    {
      id: "weightKg",
      labelKey: "field.weightKg",
      kind: "number",
      min: 20,
      max: 250,
      step: 0.5,
      default: 70,
      visibleWhen: (values) => !isImperial(values),
    },
    {
      id: "heightCm",
      labelKey: "field.heightCm",
      kind: "number",
      min: 100,
      max: 230,
      step: 1,
      default: 170,
      visibleWhen: (values) => !isImperial(values),
    },
    {
      id: "weightLb",
      labelKey: "field.weightLb",
      kind: "number",
      min: 44,
      max: 550,
      step: 1,
      default: 154,
      visibleWhen: isImperial,
    },
    {
      id: "heightFt",
      labelKey: "field.heightFt",
      kind: "number",
      min: 3,
      max: 7,
      step: 1,
      default: 5,
      visibleWhen: isImperial,
    },
    {
      id: "heightIn",
      labelKey: "field.heightIn",
      kind: "number",
      min: 0,
      max: 11,
      step: 1,
      default: 7,
      visibleWhen: isImperial,
    },
  ];
}

/** Reads the body inputs back out in metric, whichever way they were entered. */
function metricBody(values: Record<string, number | string | boolean>): {
  kilograms: number;
  centimetres: number;
} {
  if (isImperial(values)) {
    return {
      kilograms: poundsToKilograms(num(values, "weightLb")),
      centimetres: feetInchesToCentimetres(
        num(values, "heightFt"),
        num(values, "heightIn"),
      ),
    };
  }
  return {
    kilograms: num(values, "weightKg"),
    centimetres: num(values, "heightCm"),
  };
}

export const bmiCalculator: CalculatorDef = {
  slug: "bmi",
  icon: "⚖️",
  version: 1,
  category: "health",
  titleKey: "calc.bmi.title",
  descKey: "calc.bmi.desc",
  countries: EVERYWHERE,
  countryRelevance: "units",
  relatedCalculators: ["body-fat", "bmr", "tdee"],
  fields: bodyFields,
  compute: (values) => {
    const { kilograms, centimetres } = metricBody(values);
    const index = bmi(kilograms, centimetres);
    const band = bmiBand(index);
    const range = healthyWeightRange(centimetres);
    const imperial = isImperial(values);

    const asEntered = (kg: number) => (imperial ? kilogramsToPounds(kg) : kg);
    const weightUnit = imperial ? "units.pounds" : "units.kilograms";

    return {
      primary: {
        labelKey: "result.bmi",
        value: index,
        kind: "number",
        decimals: 1,
        emphasis: true,
      },
      rows: [
        { labelKey: "result.bmiBand", value: `bmi.band.${band}`, kind: "label" },
        {
          labelKey: "result.healthyRangeLow",
          value: asEntered(range.min),
          kind: "number",
          decimals: 1,
          tone: "principal",
          hintKey: weightUnit,
        },
        {
          labelKey: "result.healthyRangeHigh",
          value: asEntered(range.max),
          kind: "number",
          decimals: 1,
          tone: "principal",
          hintKey: weightUnit,
        },
      ],
      notes: [{ key: "calc.bmi.note" }],
    };
  },
  explainerKeys: ["calc.bmi.explain.1", "calc.bmi.explain.2"],
  faqKeys: ["calc.bmi.faq.1", "calc.bmi.faq.2"],
};

const ageSexFields = (ctx: CalcContext): CalculatorField[] => [
  ...bodyFields(ctx),
  {
    id: "age",
    labelKey: "field.age",
    kind: "number",
    min: 15,
    max: 100,
    step: 1,
    default: 30,
  },
  {
    id: "sex",
    labelKey: "field.sex",
    kind: "select",
    default: "male",
    options: [
      { value: "male", labelKey: "option.male" },
      { value: "female", labelKey: "option.female" },
    ],
  },
];

export const bmrCalculator: CalculatorDef = {
  slug: "bmr",
  icon: "🔥",
  version: 1,
  category: "health",
  titleKey: "calc.bmr.title",
  descKey: "calc.bmr.desc",
  countries: EVERYWHERE,
  countryRelevance: "units",
  relatedCalculators: ["tdee", "bmi"],
  fields: ageSexFields,
  compute: (values) => {
    const { kilograms, centimetres } = metricBody(values);
    const basal = bmr(kilograms, centimetres, num(values, "age"), str(values, "sex", "male") as Sex);

    return {
      primary: {
        labelKey: "result.bmr",
        value: Math.max(basal, 0),
        kind: "number",
        emphasis: true,
        hintKey: "units.kcalPerDay",
      },
      rows: (Object.keys(ACTIVITY_FACTORS) as ActivityLevel[]).map((level) => ({
        labelKey: `activity.${level}`,
        value: Math.max(tdee(basal, level), 0),
        kind: "number" as const,
        tone: "neutral" as const,
      })),
      notes: [{ key: "calc.bmr.note" }],
    };
  },
  explainerKeys: ["calc.bmr.explain.1", "calc.bmr.explain.2"],
  faqKeys: ["calc.bmr.faq.1", "calc.bmr.faq.2"],
};

export const tdeeCalculator: CalculatorDef = {
  slug: "tdee",
  icon: "🍽️",
  version: 1,
  category: "health",
  titleKey: "calc.tdee.title",
  descKey: "calc.tdee.desc",
  countries: EVERYWHERE,
  countryRelevance: "units",
  relatedCalculators: ["bmr", "bmi"],
  fields: (ctx) => [
    ...ageSexFields(ctx),
    {
      id: "activity",
      labelKey: "field.activityLevel",
      kind: "select",
      default: "moderate",
      options: (Object.keys(ACTIVITY_FACTORS) as ActivityLevel[]).map((level) => ({
        value: level,
        labelKey: `activity.${level}`,
      })),
    },
    {
      id: "goal",
      labelKey: "field.goal",
      kind: "select",
      default: "maintain",
      options: [
        { value: "lose", labelKey: "option.goalLose" },
        { value: "maintain", labelKey: "option.goalMaintain" },
        { value: "gain", labelKey: "option.goalGain" },
      ],
    },
  ],
  compute: (values) => {
    const { kilograms, centimetres } = metricBody(values);
    const basal = bmr(kilograms, centimetres, num(values, "age"), str(values, "sex", "male") as Sex);
    const maintenance = Math.max(
      tdee(basal, str(values, "activity", "moderate") as ActivityLevel),
      0,
    );

    // A 500 kcal daily shift is the usual starting point for about half a
    // kilogram a week either way.
    const goal = str(values, "goal", "maintain");
    const target =
      goal === "lose" ? maintenance - 500 : goal === "gain" ? maintenance + 500 : maintenance;
    const split = macros(Math.max(target, 0), { protein: 30, carbs: 40, fat: 30 });

    return {
      primary: {
        labelKey: "result.dailyCalories",
        value: Math.max(target, 0),
        kind: "number",
        emphasis: true,
        hintKey: "units.kcalPerDay",
      },
      rows: [
        { labelKey: "result.maintenance", value: maintenance, kind: "number", tone: "neutral" },
        { labelKey: "result.bmr", value: Math.max(basal, 0), kind: "number", tone: "neutral" },
        { labelKey: "result.protein", value: split.protein, kind: "number", tone: "principal", hintKey: "units.grams" },
        { labelKey: "result.carbs", value: split.carbs, kind: "number", tone: "returns", hintKey: "units.grams" },
        { labelKey: "result.fat", value: split.fat, kind: "number", tone: "tax", hintKey: "units.grams" },
      ],
      chart: [
        { labelKey: "result.protein", value: split.protein * 4, tone: "principal" },
        { labelKey: "result.carbs", value: split.carbs * 4, tone: "returns" },
        { labelKey: "result.fat", value: split.fat * 9, tone: "tax" },
      ],
      notes: [{ key: "calc.tdee.note" }],
    };
  },
  explainerKeys: ["calc.tdee.explain.1", "calc.tdee.explain.2"],
  faqKeys: ["calc.tdee.faq.1", "calc.tdee.faq.2"],
};

export const bodyFatCalculator: CalculatorDef = {
  slug: "body-fat",
  icon: "📏",
  version: 1,
  category: "health",
  titleKey: "calc.bodyFat.title",
  descKey: "calc.bodyFat.desc",
  countries: EVERYWHERE,
  countryRelevance: "units",
  relatedCalculators: ["bmi", "bmr"],
  fields: (ctx) => [
    ...bodyFields(ctx),
    {
      id: "sex",
      labelKey: "field.sex",
      kind: "select",
      default: "male",
      options: [
        { value: "male", labelKey: "option.male" },
        { value: "female", labelKey: "option.female" },
      ],
    },
    {
      id: "neck",
      labelKey: "field.neck",
      hintKey: "calc.bodyFat.measureHint",
      kind: "number",
      min: 20,
      max: 70,
      step: 0.5,
      default: 38,
    },
    {
      id: "waist",
      labelKey: "field.waist",
      hintKey: "calc.bodyFat.measureHint",
      kind: "number",
      min: 50,
      max: 200,
      step: 0.5,
      default: 85,
    },
    {
      id: "hip",
      labelKey: "field.hip",
      hintKey: "calc.bodyFat.measureHint",
      kind: "number",
      min: 60,
      max: 200,
      step: 0.5,
      default: 95,
      visibleWhen: (values) => str(values, "sex", "male") === "female",
    },
  ],
  compute: (values) => {
    const { kilograms, centimetres } = metricBody(values);
    const sex = str(values, "sex", "male") as Sex;
    const percent = navyBodyFat({
      sex,
      centimetres,
      waist: num(values, "waist"),
      neck: num(values, "neck"),
      hip: num(values, "hip"),
    });
    const { fat, lean } = bodyComposition(kilograms, percent);
    const imperial = isImperial(values);
    const show = (kg: number) => (imperial ? kilogramsToPounds(kg) : kg);

    return {
      primary: {
        labelKey: "result.bodyFat",
        value: percent,
        kind: "percent",
        decimals: 1,
        emphasis: true,
      },
      rows: [
        { labelKey: "result.fatMass", value: show(fat), kind: "number", decimals: 1, tone: "tax" },
        { labelKey: "result.leanMass", value: show(lean), kind: "number", decimals: 1, tone: "principal" },
      ],
      chart: [
        { labelKey: "result.fatMass", value: fat, tone: "tax" },
        { labelKey: "result.leanMass", value: lean, tone: "principal" },
      ],
      notes: [{ key: "calc.bodyFat.note" }],
    };
  },
  explainerKeys: ["calc.bodyFat.explain.1", "calc.bodyFat.explain.2"],
  faqKeys: ["calc.bodyFat.faq.1", "calc.bodyFat.faq.2"],
};

export const waterIntakeCalculator: CalculatorDef = {
  slug: "water-intake",
  icon: "💧",
  version: 1,
  category: "health",
  titleKey: "calc.water.title",
  descKey: "calc.water.desc",
  countries: EVERYWHERE,
  countryRelevance: "units",
  relatedCalculators: ["bmr", "tdee"],
  fields: (ctx) => [
    unitsField(ctx),
    {
      id: "weightKg",
      labelKey: "field.weightKg",
      kind: "number",
      min: 20,
      max: 250,
      step: 0.5,
      default: 70,
      visibleWhen: (values) => !isImperial(values),
    },
    {
      id: "weightLb",
      labelKey: "field.weightLb",
      kind: "number",
      min: 44,
      max: 550,
      step: 1,
      default: 154,
      visibleWhen: isImperial,
    },
    {
      id: "exercise",
      labelKey: "field.exerciseMinutes",
      kind: "number",
      min: 0,
      max: 240,
      step: 15,
      default: 30,
    },
  ],
  compute: (values) => {
    const kilograms = isImperial(values)
      ? poundsToKilograms(num(values, "weightLb"))
      : num(values, "weightKg");
    const millilitres = waterIntake(kilograms, num(values, "exercise"));

    return {
      primary: {
        labelKey: "result.dailyWater",
        value: millilitres / 1000,
        kind: "number",
        decimals: 2,
        emphasis: true,
        hintKey: "units.litres",
      },
      rows: [
        // A US cup is 237 ml; glasses are how people actually count this.
        { labelKey: "result.glasses", value: millilitres / 250, kind: "number", tone: "principal" },
        { labelKey: "result.millilitres", value: millilitres, kind: "number", tone: "neutral" },
      ],
      notes: [{ key: "calc.water.note" }],
    };
  },
  explainerKeys: ["calc.water.explain.1", "calc.water.explain.2"],
  faqKeys: ["calc.water.faq.1", "calc.water.faq.2"],
};

/** Common race distances, in kilometres. */
const RACES: { key: string; km: number }[] = [
  { key: "race.5k", km: 5 },
  { key: "race.10k", km: 10 },
  { key: "race.halfMarathon", km: 21.0975 },
  { key: "race.marathon", km: 42.195 },
];

export const paceCalculator: CalculatorDef = {
  slug: "running-pace",
  icon: "🏃",
  version: 1,
  category: "health",
  titleKey: "calc.pace.title",
  descKey: "calc.pace.desc",
  countries: EVERYWHERE,
  countryRelevance: "units",
  relatedCalculators: ["tdee", "bmi"],
  fields: ({ country }) => [
    {
      id: "miles",
      labelKey: "field.useMiles",
      kind: "toggle",
      default: country.measurementSystem !== "metric",
    },
    {
      id: "distance",
      labelKey: "field.distance",
      kind: "number",
      min: 0.5,
      max: 200,
      step: 0.5,
      default: 10,
    },
    {
      id: "hours",
      labelKey: "field.hours",
      kind: "number",
      min: 0,
      max: 12,
      step: 1,
      default: 0,
    },
    {
      id: "minutes",
      labelKey: "field.minutes",
      kind: "number",
      min: 0,
      max: 59,
      step: 1,
      default: 50,
    },
    {
      id: "seconds",
      labelKey: "field.seconds",
      kind: "number",
      min: 0,
      max: 59,
      step: 5,
      default: 0,
    },
  ],
  compute: (values) => {
    const KM_PER_MILE = 1.609344;
    const miles = bool(values, "miles");
    const entered = num(values, "distance");
    const kilometres = miles ? entered * KM_PER_MILE : entered;

    const totalSeconds =
      num(values, "hours") * 3600 + num(values, "minutes") * 60 + num(values, "seconds");

    const perKm = pacePerKm(kilometres, totalSeconds);
    const perUnit = miles ? perKm * KM_PER_MILE : perKm;
    const kmh = speedKmh(kilometres, totalSeconds);

    return {
      primary: {
        labelKey: miles ? "result.pacePerMile" : "result.pacePerKm",
        value: formatDuration(perUnit),
        kind: "text",
        emphasis: true,
      },
      rows: [
        {
          labelKey: "result.speed",
          value: miles ? kmh / KM_PER_MILE : kmh,
          kind: "number",
          decimals: 2,
          tone: "returns",
          hintKey: miles ? "units.mph" : "units.kmh",
        },
        {
          labelKey: "result.totalTime",
          value: formatDuration(totalSeconds),
          kind: "text",
          tone: "neutral",
        },
      ],
      // What that pace would mean over the distances people actually enter.
      table: {
        columns: [
          { key: "race", labelKey: "column.race", kind: "label" },
          { key: "time", labelKey: "column.finishTime", kind: "text" },
        ],
        rows: RACES.map((race) => ({
          race: race.key,
          time: formatDuration(race.km * perKm),
        })),
      },
      notes: [{ key: "calc.pace.note" }],
    };
  },
  explainerKeys: ["calc.pace.explain.1", "calc.pace.explain.2"],
  faqKeys: ["calc.pace.faq.1", "calc.pace.faq.2"],
};

export const HEALTH_CALCULATORS = [
  bmiCalculator,
  bmrCalculator,
  tdeeCalculator,
  bodyFatCalculator,
  waterIntakeCalculator,
  paceCalculator,
];
