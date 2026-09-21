import { COUNTRY_CODES } from "@/config/countries";
import { num, str, type CalculatorDef } from "@/config/calculators/types";
import { gpa, scoreNeeded, weightedGrade } from "@/lib/business";

/**
 * Education calculators.
 *
 * Grading scales genuinely differ by country - a 4.0 GPA, a UK classification
 * and a German 1.0 are not the same scale - so rather than pretend one system
 * is universal, the GPA calculator asks which scale you are on and the grade
 * calculators work in percentages, which travel.
 */

const EVERYWHERE = COUNTRY_CODES;

/** Rows are entered as a fixed set of slots rather than a dynamic list. */
const COURSE_SLOTS = [1, 2, 3, 4, 5, 6];

/** Points per letter on the common 4.0 scale. */
const FOUR_POINT: { value: string; points: number; labelKey: string }[] = [
  { value: "a-plus", points: 4.0, labelKey: "grade.aPlus" },
  { value: "a", points: 4.0, labelKey: "grade.a" },
  { value: "a-minus", points: 3.7, labelKey: "grade.aMinus" },
  { value: "b-plus", points: 3.3, labelKey: "grade.bPlus" },
  { value: "b", points: 3.0, labelKey: "grade.b" },
  { value: "b-minus", points: 2.7, labelKey: "grade.bMinus" },
  { value: "c-plus", points: 2.3, labelKey: "grade.cPlus" },
  { value: "c", points: 2.0, labelKey: "grade.c" },
  { value: "c-minus", points: 1.7, labelKey: "grade.cMinus" },
  { value: "d", points: 1.0, labelKey: "grade.d" },
  { value: "f", points: 0, labelKey: "grade.f" },
];

const POINTS_BY_VALUE = new Map(FOUR_POINT.map((entry) => [entry.value, entry.points]));

export const gpaCalculator: CalculatorDef = {
  slug: "gpa",
  icon: "🎓",
  version: 1,
  category: "education",
  titleKey: "calc.gpa.title",
  descKey: "calc.gpa.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["weighted-grade", "final-grade"],
  fields: () =>
    COURSE_SLOTS.flatMap((slot) => [
      {
        id: `grade${slot}`,
        labelKey: `field.courseGrade${slot}`,
        kind: "select" as const,
        default: "a",
        options: FOUR_POINT.map((entry) => ({
          value: entry.value,
          labelKey: entry.labelKey,
        })),
      },
      {
        id: `credits${slot}`,
        labelKey: `field.courseCredits${slot}`,
        kind: "number" as const,
        min: 0,
        max: 12,
        step: 1,
        // Slots beyond the third start empty, so a three-course term needs no
        // clearing out before it gives the right answer.
        default: slot <= 3 ? 3 : 0,
      },
    ]),
  compute: (values) => {
    const entries = COURSE_SLOTS.map((slot) => ({
      credits: num(values, `credits${slot}`),
      points: POINTS_BY_VALUE.get(str(values, `grade${slot}`, "a")) ?? 0,
    })).filter((entry) => entry.credits > 0);

    const average = gpa(entries);
    const credits = entries.reduce((total, entry) => total + entry.credits, 0);

    return {
      primary: {
        labelKey: "result.gpa",
        value: average,
        kind: "number",
        decimals: 2,
        emphasis: true,
      },
      rows: [
        { labelKey: "result.totalCredits", value: credits, kind: "number", tone: "principal" },
        { labelKey: "result.coursesCounted", value: entries.length, kind: "number", tone: "neutral" },
        {
          labelKey: "result.qualityPoints",
          value: entries.reduce((total, entry) => total + entry.credits * entry.points, 0),
          kind: "number",
          decimals: 2,
          tone: "returns",
        },
      ],
      notes: [{ key: "calc.gpa.note" }],
    };
  },
  explainerKeys: ["calc.gpa.explain.1", "calc.gpa.explain.2"],
  faqKeys: ["calc.gpa.faq.1", "calc.gpa.faq.2"],
};

const ASSESSMENT_SLOTS = [1, 2, 3, 4, 5];

export const weightedGradeCalculator: CalculatorDef = {
  slug: "weighted-grade",
  icon: "📝",
  version: 1,
  category: "education",
  titleKey: "calc.weightedGrade.title",
  descKey: "calc.weightedGrade.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["final-grade", "gpa"],
  fields: () =>
    ASSESSMENT_SLOTS.flatMap((slot) => [
      {
        id: `score${slot}`,
        labelKey: `field.assessmentScore${slot}`,
        kind: "percent" as const,
        min: 0,
        max: 100,
        step: 1,
        default: 75,
      },
      {
        id: `weight${slot}`,
        labelKey: `field.assessmentWeight${slot}`,
        kind: "percent" as const,
        min: 0,
        max: 100,
        step: 5,
        default: slot <= 3 ? [20, 30, 50][slot - 1] : 0,
      },
    ]),
  compute: (values) => {
    const entries = ASSESSMENT_SLOTS.map((slot) => ({
      weight: num(values, `weight${slot}`),
      score: num(values, `score${slot}`),
    })).filter((entry) => entry.weight > 0);

    const { score, weightUsed } = weightedGrade(entries);

    return {
      primary: {
        labelKey: "result.weightedScore",
        value: score,
        kind: "percent",
        decimals: 2,
        emphasis: true,
      },
      rows: [
        { labelKey: "result.weightUsed", value: weightUsed, kind: "percent", decimals: 0, tone: "principal" },
        { labelKey: "result.assessmentsCounted", value: entries.length, kind: "number", tone: "neutral" },
      ],
      // The weights not adding to 100 is the commonest mistake here, and it
      // silently changes the answer, so it is called out rather than absorbed.
      notes:
        weightUsed > 0 && Math.abs(weightUsed - 100) > 0.001
          ? [{ key: "calc.weightedGrade.partialNote", params: { weight: Math.round(weightUsed) } }]
          : [{ key: "calc.weightedGrade.note" }],
    };
  },
  explainerKeys: ["calc.weightedGrade.explain.1", "calc.weightedGrade.explain.2"],
  faqKeys: ["calc.weightedGrade.faq.1", "calc.weightedGrade.faq.2"],
};

export const finalGradeCalculator: CalculatorDef = {
  slug: "final-grade",
  icon: "🎯",
  version: 1,
  category: "education",
  titleKey: "calc.finalGrade.title",
  descKey: "calc.finalGrade.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["weighted-grade", "gpa"],
  fields: () => [
    { id: "current", labelKey: "field.currentGrade", kind: "percent", min: 0, max: 100, step: 1, default: 72 },
    { id: "completed", labelKey: "field.completedWeight", hintKey: "calc.finalGrade.completedHint", kind: "percent", min: 0, max: 99, step: 5, default: 70 },
    { id: "target", labelKey: "field.targetGrade", kind: "percent", min: 0, max: 100, step: 1, default: 80 },
  ],
  compute: (values) => {
    const result = scoreNeeded({
      currentScore: num(values, "current"),
      completedWeight: num(values, "completed"),
      targetScore: num(values, "target"),
    });

    return {
      primary: {
        labelKey: "result.scoreNeeded",
        value: result.needed,
        kind: "percent",
        decimals: 1,
        emphasis: true,
      },
      rows: [
        { labelKey: "result.remainingWeight", value: result.remainingWeight, kind: "percent", decimals: 0, tone: "principal" },
        { labelKey: "result.alreadyEarned", value: (num(values, "current") * num(values, "completed")) / 100, kind: "percent", decimals: 2, tone: "returns" },
      ],
      // An honest "you need 112%" beats a clamped 100% that implies it is
      // still reachable.
      notes: result.possible
        ? [{ key: "calc.finalGrade.note" }]
        : [{ key: "calc.finalGrade.impossibleNote" }],
    };
  },
  explainerKeys: ["calc.finalGrade.explain.1", "calc.finalGrade.explain.2"],
  faqKeys: ["calc.finalGrade.faq.1", "calc.finalGrade.faq.2"],
};

export const EDUCATION_CALCULATORS = [
  gpaCalculator,
  weightedGradeCalculator,
  finalGradeCalculator,
];
