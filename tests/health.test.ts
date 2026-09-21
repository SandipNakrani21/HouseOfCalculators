import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import {
  ACTIVITY_FACTORS,
  bmi,
  bmiBand,
  bmr,
  bodyComposition,
  centimetresToFeetInches,
  feetInchesToCentimetres,
  formatDuration,
  healthyWeightRange,
  kilogramsToPounds,
  macros,
  navyBodyFat,
  pacePerKm,
  poundsToKilograms,
  speedKmh,
  splitDuration,
  tdee,
  waterIntake,
} from "../src/lib/health/index.ts";

function near(actual: number, expected: number, tolerance = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

describe("unit conversion", () => {
  test("uses the exact definitions", () => {
    near(poundsToKilograms(1), 0.45359237, 1e-12);
    near(feetInchesToCentimetres(1, 0), 30.48, 1e-12);
    near(feetInchesToCentimetres(0, 1), 2.54, 1e-12);
  });

  test("round-trips", () => {
    for (const pounds of [1, 154, 220.5]) {
      near(kilogramsToPounds(poundsToKilograms(pounds)), pounds, 1e-9);
    }
    for (const cm of [150, 170.18, 200]) {
      const { feet, inches } = centimetresToFeetInches(cm);
      near(feetInchesToCentimetres(feet, inches), cm, 1e-9);
    }
  });

  test("a known height converts as expected", () => {
    // 5'7" is 170.18 cm exactly.
    near(feetInchesToCentimetres(5, 7), 170.18, 1e-9);
    const { feet, inches } = centimetresToFeetInches(170.18);
    assert.equal(feet, 5);
    near(inches, 7, 1e-9);
  });
});

describe("bmi", () => {
  test("matches the textbook figure", () => {
    // 70 kg at 1.75 m is 22.86.
    near(bmi(70, 175), 22.86);
    near(bmi(100, 200), 25, 1e-9);
  });

  test("is the same whichever units were entered", () => {
    // The whole point of converting at the edge: 154 lb / 5'7" must give the
    // same index as the equivalent metric figures.
    const metric = bmi(poundsToKilograms(154), feetInchesToCentimetres(5, 7));
    near(metric, bmi(69.85, 170.18), 0.01);
  });

  test("a zero height does not divide by zero", () => {
    assert.equal(bmi(70, 0), 0);
  });

  test("the bands sit on the published boundaries", () => {
    assert.equal(bmiBand(18.49), "underweight");
    assert.equal(bmiBand(18.5), "healthy");
    assert.equal(bmiBand(24.9), "healthy");
    assert.equal(bmiBand(25), "overweight");
    assert.equal(bmiBand(29.9), "overweight");
    assert.equal(bmiBand(30), "obese");
  });

  test("the healthy range maps back into the healthy band", () => {
    for (const height of [150, 165, 180, 195]) {
      const { min, max } = healthyWeightRange(height);
      assert.equal(bmiBand(bmi(min, height)), "healthy");
      assert.equal(bmiBand(bmi(max, height)), "healthy");
      // A gram either side should leave it.
      assert.notEqual(bmiBand(bmi(min - 0.1, height)), "healthy");
      assert.notEqual(bmiBand(bmi(max + 0.5, height)), "healthy");
    }
  });
});

describe("bmr", () => {
  test("matches Mifflin-St Jeor by hand", () => {
    // Male, 70 kg, 175 cm, 30: 10(70) + 6.25(175) - 5(30) + 5 = 1648.75
    near(bmr(70, 175, 30, "male"), 1648.75, 0.01);
    // Female is the same less 161 rather than plus 5.
    near(bmr(70, 175, 30, "female"), 1482.75, 0.01);
  });

  test("the sexes differ by exactly 166", () => {
    near(bmr(80, 180, 40, "male") - bmr(80, 180, 40, "female"), 166, 1e-9);
  });

  test("falls as age rises and as weight falls", () => {
    assert.ok(bmr(70, 175, 40, "male") < bmr(70, 175, 30, "male"));
    assert.ok(bmr(60, 175, 30, "male") < bmr(70, 175, 30, "male"));
  });
});

describe("tdee", () => {
  test("scales bmr by the published factors", () => {
    const basal = 1600;
    near(tdee(basal, "sedentary"), 1600 * 1.2, 1e-9);
    near(tdee(basal, "athlete"), 1600 * 1.9, 1e-9);
  });

  test("the factors increase with activity and never fall below one", () => {
    const factors = Object.values(ACTIVITY_FACTORS);
    for (const [index, factor] of factors.entries()) {
      assert.ok(factor > 1, `${factor} would be below basal`);
      if (index > 0) assert.ok(factor > factors[index - 1], "factors not ascending");
    }
  });

  test("tdee always exceeds bmr", () => {
    const basal = bmr(70, 175, 30, "male");
    for (const level of Object.keys(ACTIVITY_FACTORS) as (keyof typeof ACTIVITY_FACTORS)[]) {
      assert.ok(tdee(basal, level) > basal);
    }
  });
});

describe("macros", () => {
  test("the grams add back up to the calories", () => {
    const calories = 2000;
    const split = macros(calories, { protein: 30, carbs: 40, fat: 30 });
    near(split.protein * 4 + split.carbs * 4 + split.fat * 9, calories, 0.01);
  });

  test("uses 4/4/9 calories per gram", () => {
    const split = macros(400, { protein: 100, carbs: 0, fat: 0 });
    near(split.protein, 100, 1e-9);
    const fatOnly = macros(900, { protein: 0, carbs: 0, fat: 100 });
    near(fatOnly.fat, 100, 1e-9);
  });
});

describe("body fat", () => {
  test("produces a plausible figure for a typical man", () => {
    const percent = navyBodyFat({ sex: "male", centimetres: 180, waist: 85, neck: 38 });
    assert.ok(percent > 10 && percent < 25, `implausible: ${percent}`);
  });

  test("a larger waist means a higher estimate", () => {
    const lean = navyBodyFat({ sex: "male", centimetres: 180, waist: 80, neck: 38 });
    const heavier = navyBodyFat({ sex: "male", centimetres: 180, waist: 100, neck: 38 });
    assert.ok(heavier > lean);
  });

  test("stays inside 0 and 75 however absurd the input", () => {
    const cases = [
      { sex: "male" as const, centimetres: 180, waist: 40, neck: 39 },
      { sex: "male" as const, centimetres: 180, waist: 300, neck: 30 },
      { sex: "female" as const, centimetres: 160, waist: 300, neck: 30, hip: 300 },
      { sex: "female" as const, centimetres: 160, waist: 50, neck: 49, hip: 1 },
    ];
    for (const input of cases) {
      const percent = navyBodyFat(input);
      assert.ok(percent >= 0 && percent <= 75, `${JSON.stringify(input)} gave ${percent}`);
      assert.ok(Number.isFinite(percent), "not finite");
    }
  });

  test("a zero height does not divide by zero", () => {
    assert.equal(navyBodyFat({ sex: "male", centimetres: 0, waist: 85, neck: 38 }), 0);
  });

  test("fat and lean mass add back to body weight", () => {
    const { fat, lean } = bodyComposition(80, 20);
    near(fat, 16, 1e-9);
    near(fat + lean, 80, 1e-9);
  });
});

describe("water intake", () => {
  test("is 35 ml per kilogram before exercise", () => {
    near(waterIntake(70, 0), 2450, 1e-9);
  });

  test("exercise adds 350 ml per half hour", () => {
    near(waterIntake(70, 30) - waterIntake(70, 0), 350, 1e-9);
    near(waterIntake(70, 60) - waterIntake(70, 0), 700, 1e-9);
  });
});

describe("pace", () => {
  test("a 50 minute 10K is five minutes a kilometre", () => {
    assert.equal(pacePerKm(10, 50 * 60), 300);
    assert.equal(formatDuration(300), "5:00");
  });

  test("speed and pace describe the same run", () => {
    const kmh = speedKmh(10, 50 * 60);
    near(kmh, 12, 1e-9);
    // Pace in seconds per km is 3600 divided by speed.
    near(3600 / kmh, pacePerKm(10, 50 * 60), 1e-9);
  });

  test("a zero distance or time does not divide by zero", () => {
    assert.equal(pacePerKm(0, 3600), 0);
    assert.equal(speedKmh(10, 0), 0);
  });

  test("durations format as minutes, and as hours when long enough", () => {
    assert.equal(formatDuration(59), "0:59");
    assert.equal(formatDuration(90), "1:30");
    assert.equal(formatDuration(3600), "1:00:00");
    assert.equal(formatDuration(3930), "1:05:30");
  });

  test("splitDuration reconstructs the total", () => {
    for (const seconds of [0, 59, 61, 3599, 3600, 12345]) {
      const { hours, minutes, seconds: rest } = splitDuration(seconds);
      assert.equal(hours * 3600 + minutes * 60 + rest, seconds);
      assert.ok(minutes < 60 && rest < 60, "components not normalised");
    }
  });

  test("a negative duration is clamped rather than rendered backwards", () => {
    assert.equal(formatDuration(-10), "0:00");
  });
});
