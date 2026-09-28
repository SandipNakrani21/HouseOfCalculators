/**
 * Health and fitness formulas.
 *
 * Everything here works in metric internally - kilograms, centimetres,
 * kilometres - and the UI converts at the edge. Mixing units inside a formula
 * is how a body-fat estimate silently comes out in the wrong scale.
 *
 * These are population-level estimates published for general guidance. They
 * are not diagnostic, and every page that uses one says so.
 */

export const KG_PER_POUND = 0.45359237;
export const CM_PER_INCH = 2.54;

export function poundsToKilograms(pounds: number): number {
  return pounds * KG_PER_POUND;
}

export function kilogramsToPounds(kilograms: number): number {
  return kilograms / KG_PER_POUND;
}

export function inchesToCentimetres(inches: number): number {
  return inches * CM_PER_INCH;
}

/** Feet and inches to centimetres, the way a height is actually entered. */
export function feetInchesToCentimetres(feet: number, inches: number): number {
  return inchesToCentimetres(feet * 12 + inches);
}

/** Body mass index: weight in kilograms over height in metres squared. */
export function bmi(kilograms: number, centimetres: number): number {
  if (centimetres <= 0) return 0;
  const metres = centimetres / 100;
  return kilograms / (metres * metres);
}

export type BmiBand = "underweight" | "healthy" | "overweight" | "obese";

/**
 * The WHO bands. They are a screening tool for populations, not a diagnosis:
 * the index cannot tell muscle from fat, which is why a very muscular person
 * can read as "overweight" while being nothing of the kind.
 */
export function bmiBand(value: number): BmiBand {
  if (value < 18.5) return "underweight";
  if (value < 25) return "healthy";
  if (value < 30) return "overweight";
  return "obese";
}

/** The weight range that would put this height in the healthy band. */
export function healthyWeightRange(centimetres: number): { min: number; max: number } {
  const metres = centimetres / 100;
  const area = metres * metres;
  return { min: 18.5 * area, max: 24.9 * area };
}

export type Sex = "male" | "female";

/**
 * Basal metabolic rate, Mifflin-St Jeor. Chosen over Harris-Benedict because
 * it is the more accurate of the two against modern measured data.
 */
export function bmr(kilograms: number, centimetres: number, age: number, sex: Sex): number {
  const base = 10 * kilograms + 6.25 * centimetres - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/** Activity multipliers as published with the equation. */
export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_FACTORS;

/** Total daily energy expenditure: BMR scaled by how much the person moves. */
export function tdee(basal: number, level: ActivityLevel): number {
  return basal * ACTIVITY_FACTORS[level];
}

/**
 * Body fat percentage, US Navy circumference method. Needs a waist and neck
 * measurement, plus hips for women, and is an estimate with a stated error of
 * a few percentage points either way.
 */
export function navyBodyFat({
  sex,
  centimetres,
  waist,
  neck,
  hip = 0,
}: {
  sex: Sex;
  centimetres: number;
  waist: number;
  neck: number;
  hip?: number;
}): number {
  if (centimetres <= 0) return 0;

  const value =
    sex === "male"
      ? 495 /
          (1.0324 -
            0.19077 * Math.log10(Math.max(waist - neck, 1)) +
            0.15456 * Math.log10(centimetres)) -
        450
      : 495 /
          (1.29579 -
            0.35004 * Math.log10(Math.max(waist + hip - neck, 1)) +
            0.221 * Math.log10(centimetres)) -
        450;

  // The equation is unbounded and goes nonsensical outside plausible inputs.
  return Math.min(Math.max(value, 0), 75);
}

/** Fat mass and lean mass implied by a body-fat percentage. */
export function bodyComposition(kilograms: number, fatPercent: number) {
  const fat = (kilograms * fatPercent) / 100;
  return { fat, lean: kilograms - fat };
}

/**
 * Daily water, as a simple 35 ml per kilogram baseline plus an allowance for
 * exercise. Guidance varies and a lot of intake comes from food, so this is a
 * starting point rather than a target.
 */
export function waterIntake(kilograms: number, exerciseMinutes: number): number {
  const base = kilograms * 35;
  // Roughly 350 ml per half hour of exercise.
  return base + (exerciseMinutes / 30) * 350;
}

/** Macronutrient split of a calorie target, in grams. */
export function macros(
  calories: number,
  split: { protein: number; carbs: number; fat: number },
): { protein: number; carbs: number; fat: number } {
  // 4 kcal per gram of protein and carbohydrate, 9 per gram of fat.
  return {
    protein: (calories * split.protein) / 100 / 4,
    carbs: (calories * split.carbs) / 100 / 4,
    fat: (calories * split.fat) / 100 / 9,
  };
}

/** Seconds per kilometre from a distance and a finishing time. */
export function pacePerKm(kilometres: number, totalSeconds: number): number {
  return kilometres <= 0 ? 0 : totalSeconds / kilometres;
}

/** Average speed in km/h. */
export function speedKmh(kilometres: number, totalSeconds: number): number {
  return totalSeconds <= 0 ? 0 : (kilometres / totalSeconds) * 3600;
}

/** Splits a duration in seconds into hours, minutes and whole seconds. */
export function splitDuration(totalSeconds: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const whole = Math.max(Math.round(totalSeconds), 0);
  return {
    hours: Math.floor(whole / 3600),
    minutes: Math.floor((whole % 3600) / 60),
    seconds: whole % 60,
  };
}

/** `7:30` style pace, or `1:05:30` when it runs past an hour. */
export function formatDuration(totalSeconds: number): string {
  const { hours, minutes, seconds } = splitDuration(totalSeconds);
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}
