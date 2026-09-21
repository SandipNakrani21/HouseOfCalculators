import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import {
  applyDiscount,
  breakEven,
  discountPercent,
  electricityCost,
  fuelCost,
  gpa,
  growthRate,
  marginToMarkup,
  markup,
  markupToMargin,
  priceForMargin,
  priceForMarkup,
  profitMargin,
  recipeScale,
  roas,
  roi,
  scoreNeeded,
  weightedGrade,
} from "../src/lib/business/index.ts";
import {
  concrete,
  force,
  GRAVITY,
  ohmsLaw,
  paint,
  roofArea,
  tiles,
  torque,
  withWaste,
} from "../src/lib/construction/index.ts";

function near(actual: number, expected: number, tolerance = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

describe("margin and markup", () => {
  test("are different questions about the same profit", () => {
    // Buy at 100, sell at 150: 50 profit is a third of the price and a half
    // of the cost. Confusing the two is the classic pricing error.
    near(profitMargin(150, 100), 100 / 3);
    near(markup(150, 100), 50);
  });

  test("convert into each other", () => {
    near(markupToMargin(50), 100 / 3);
    near(marginToMarkup(100 / 3), 50, 1e-9);
    // A 50% margin needs a 100% markup: you have to double the cost.
    near(marginToMarkup(50), 100);
    near(markupToMargin(100), 50);
  });

  test("the conversion round-trips", () => {
    for (const value of [10, 25, 50, 75, 200]) {
      near(marginToMarkup(markupToMargin(value)), value, 1e-9);
    }
  });

  test("pricing for a target hits that target", () => {
    const cost = 60;
    const price = priceForMargin(cost, 40);
    near(profitMargin(price, cost), 40, 1e-9);

    const marked = priceForMarkup(cost, 40);
    near(markup(marked, cost), 40, 1e-9);
  });

  test("a 100% margin is impossible rather than infinite", () => {
    assert.equal(priceForMargin(60, 100), 0);
    assert.equal(marginToMarkup(100), 0);
  });

  test("zero denominators do not produce Infinity", () => {
    assert.equal(profitMargin(0, 50), 0);
    assert.equal(markup(50, 0), 0);
  });

  test("selling below cost is a negative margin, not an error", () => {
    assert.ok(profitMargin(80, 100) < 0);
    assert.ok(markup(80, 100) < 0);
  });
});

describe("breakEven", () => {
  test("covers the fixed costs at the computed volume", () => {
    const result = breakEven({ fixedCosts: 10_000, pricePerUnit: 50, variableCostPerUnit: 30 });
    assert.equal(result.neverBreaksEven, false);
    near(result.contributionPerUnit, 20);
    near(result.units, 500);
    near(result.revenue, 25_000);
    // At break-even, revenue less total variable cost equals the fixed costs.
    near(result.revenue - result.units * 30, 10_000, 1e-9);
  });

  test("contribution margin is the contribution as a share of price", () => {
    const result = breakEven({ fixedCosts: 1000, pricePerUnit: 50, variableCostPerUnit: 30 });
    near(result.contributionMargin, 40);
  });

  test("a price at or below variable cost never breaks even", () => {
    for (const price of [30, 25]) {
      const result = breakEven({ fixedCosts: 10_000, pricePerUnit: price, variableCostPerUnit: 30 });
      assert.equal(result.neverBreaksEven, true, `price ${price} claimed to break even`);
      assert.equal(result.units, 0);
    }
  });

  test("a price rise cuts the units needed", () => {
    const before = breakEven({ fixedCosts: 10_000, pricePerUnit: 50, variableCostPerUnit: 30 });
    const after = breakEven({ fixedCosts: 10_000, pricePerUnit: 55, variableCostPerUnit: 30 });
    assert.ok(after.units < before.units);
  });
});

describe("roi and roas", () => {
  test("roi is profit over cost", () => {
    near(roi(1400, 1000), 40);
    near(roi(800, 1000), -20);
    assert.equal(roi(1000, 0), 0);
  });

  test("roas is revenue over spend", () => {
    near(roas(4000, 1000), 4);
    assert.equal(roas(4000, 0), 0);
  });

  test("break-even roas is the reciprocal of the margin", () => {
    // On a 40% margin you need 2.5x just to stand still.
    const marginPercent = 40;
    const breakEvenRoas = 100 / marginPercent;
    near(breakEvenRoas, 2.5);
    // At exactly that ROAS, gross profit equals the ad spend.
    const spend = 1000;
    const revenue = spend * breakEvenRoas;
    near((revenue * marginPercent) / 100 - spend, 0, 1e-9);
  });
});

describe("growthRate", () => {
  test("is the change over where you started", () => {
    near(growthRate(100, 180), 80);
    near(growthRate(100, 50), -50);
    assert.equal(growthRate(0, 50), 0);
  });

  test("the compound rate is below the simple average when it compounds", () => {
    // Doubling over five years: 100% total, 20% simple, 14.87% compound.
    const total = growthRate(100, 200);
    const simple = total / 5;
    const compound = ((200 / 100) ** (1 / 5) - 1) * 100;
    near(total, 100);
    near(simple, 20);
    assert.ok(compound < simple);
    near(compound, 14.8698, 0.001);
  });
});

describe("discounts", () => {
  test("a single discount", () => {
    const { final, saved } = applyDiscount(200, 25);
    near(final, 150);
    near(saved, 50);
  });

  test("stacked discounts multiply rather than add", () => {
    // 20% then 20% is 36% off, not 40%.
    const first = applyDiscount(100, 20);
    const second = applyDiscount(first.final, 20);
    near(second.final, 64);
    near(discountPercent(100, second.final), 36);
  });

  test("50 then 20 is 60 off, not 70", () => {
    const first = applyDiscount(100, 50);
    const second = applyDiscount(first.final, 20);
    near(discountPercent(100, second.final), 60);
  });

  test("discountPercent inverts applyDiscount", () => {
    for (const percent of [5, 25, 60, 90]) {
      const { final } = applyDiscount(250, percent);
      near(discountPercent(250, final), percent, 1e-9);
    }
  });

  test("a zero original price does not divide by zero", () => {
    assert.equal(discountPercent(0, 0), 0);
  });
});

describe("fuelCost", () => {
  test("distance per unit divides", () => {
    // 300 km at 15 km/L is 20 litres.
    const { fuel, cost } = fuelCost({ distance: 300, economy: 15, pricePerUnit: 2 });
    near(fuel, 20);
    near(cost, 40);
  });

  test("consumption per 100 multiplies instead", () => {
    // 300 km at 7 L/100km is 21 litres - the ratio is the other way up.
    const { fuel } = fuelCost({
      distance: 300,
      economy: 7,
      pricePerUnit: 2,
      consumptionStyle: true,
    });
    near(fuel, 21);
  });

  test("the two styles agree when they describe the same car", () => {
    // 20 km/L is 5 L/100 km.
    const perLitre = fuelCost({ distance: 400, economy: 20, pricePerUnit: 1 });
    const per100 = fuelCost({
      distance: 400,
      economy: 5,
      pricePerUnit: 1,
      consumptionStyle: true,
    });
    near(perLitre.fuel, per100.fuel, 1e-9);
  });

  test("a zero economy does not divide by zero", () => {
    assert.deepEqual(fuelCost({ distance: 300, economy: 0, pricePerUnit: 2 }), {
      fuel: 0,
      cost: 0,
      costPerDistance: 0,
    });
  });

  test("a zero distance costs nothing", () => {
    const result = fuelCost({ distance: 0, economy: 15, pricePerUnit: 2 });
    assert.equal(result.cost, 0);
    assert.equal(result.costPerDistance, 0);
  });
});

describe("electricityCost", () => {
  test("a kilowatt for an hour is a kilowatt-hour", () => {
    const result = electricityCost({ watts: 1000, hoursPerDay: 1, pricePerKwh: 0.3, days: 1 });
    near(result.kwhPerDay, 1);
    near(result.costPerDay, 0.3);
    near(result.costTotal, 0.3);
  });

  test("scales with days", () => {
    const result = electricityCost({ watts: 2000, hoursPerDay: 3, pricePerKwh: 0.25, days: 30 });
    near(result.kwhPerDay, 6);
    near(result.kwhTotal, 180);
    near(result.costTotal, 45);
  });

  test("a small always-on device costs little per day and more per year", () => {
    const standby = electricityCost({ watts: 5, hoursPerDay: 24, pricePerKwh: 0.3, days: 365 });
    assert.ok(standby.costPerDay < 0.05);
    assert.ok(standby.costTotal > 10);
  });
});

describe("recipeScale", () => {
  test("is the ratio of servings", () => {
    near(recipeScale(4, 6), 1.5);
    near(recipeScale(4, 2), 0.5);
    near(recipeScale(4, 4), 1);
  });

  test("a zero original serving count does not divide by zero", () => {
    assert.equal(recipeScale(0, 6), 0);
  });
});

describe("gpa", () => {
  test("credits act as weights", () => {
    // 4 credits at 4.0 and 2 credits at 3.0 -> (16 + 6) / 6 = 3.667
    near(gpa([
      { credits: 4, points: 4 },
      { credits: 2, points: 3 },
    ]), 22 / 6);
  });

  test("equal credits give a plain average", () => {
    near(gpa([
      { credits: 3, points: 4 },
      { credits: 3, points: 2 },
    ]), 3);
  });

  test("no credits gives zero rather than NaN", () => {
    assert.equal(gpa([]), 0);
    assert.equal(gpa([{ credits: 0, points: 4 }]), 0);
  });
});

describe("weightedGrade", () => {
  test("weights the scores", () => {
    const { score, weightUsed } = weightedGrade([
      { weight: 20, score: 90 },
      { weight: 30, score: 80 },
      { weight: 50, score: 70 },
    ]);
    near(score, (20 * 90 + 30 * 80 + 50 * 70) / 100);
    assert.equal(weightUsed, 100);
  });

  test("partial weights give the average so far, not a final grade", () => {
    // Half the course done at 80 is an 80 average, not a 40.
    const { score, weightUsed } = weightedGrade([{ weight: 50, score: 80 }]);
    near(score, 80);
    assert.equal(weightUsed, 50);
  });

  test("no weight gives zero rather than NaN", () => {
    assert.deepEqual(weightedGrade([]), { score: 0, weightUsed: 0 });
  });
});

describe("scoreNeeded", () => {
  test("works out the mark the final assessment needs", () => {
    // 72 over 70% of the course, targeting 80 overall.
    const result = scoreNeeded({ currentScore: 72, completedWeight: 70, targetScore: 80 });
    assert.equal(result.remainingWeight, 30);
    // Banked 50.4; needs 29.6 more from 30% of the course.
    near(result.needed, (80 - 50.4) / 30 * 100, 1e-9);
    assert.equal(result.possible, true);
  });

  test("the answer reconstructs the target", () => {
    const current = 65;
    const completed = 80;
    const target = 75;
    const { needed } = scoreNeeded({ currentScore: current, completedWeight: completed, targetScore: target });
    const final = (current * completed) / 100 + (needed * (100 - completed)) / 100;
    near(final, target, 1e-9);
  });

  test("an unreachable target is reported rather than capped at 100", () => {
    const result = scoreNeeded({ currentScore: 40, completedWeight: 90, targetScore: 80 });
    assert.ok(result.needed > 100, `needed ${result.needed}`);
    assert.equal(result.possible, false);
  });

  test("a finished course cannot be changed", () => {
    const met = scoreNeeded({ currentScore: 85, completedWeight: 100, targetScore: 80 });
    assert.equal(met.remainingWeight, 0);
    assert.equal(met.possible, true);

    const missed = scoreNeeded({ currentScore: 70, completedWeight: 100, targetScore: 80 });
    assert.equal(missed.possible, false);
  });
});

describe("withWaste", () => {
  test("adds the allowance", () => {
    near(withWaste(100, 10), 110);
    near(withWaste(100, 0), 100);
  });
});

describe("concrete", () => {
  test("volume is the three dimensions multiplied", () => {
    const result = concrete({
      length: 5,
      width: 4,
      thickness: 0.1,
      wastePercent: 0,
      bagYield: 0.011,
    });
    near(result.volume, 2);
    near(result.volumeWithWaste, 2);
    near(result.bags, 2 / 0.011);
  });

  test("waste is added on top", () => {
    const result = concrete({ length: 5, width: 4, thickness: 0.1, wastePercent: 10, bagYield: 0.011 });
    near(result.volumeWithWaste, 2.2);
  });

  test("the mix parts split in the given ratio", () => {
    const result = concrete({
      length: 1,
      width: 1,
      thickness: 1,
      wastePercent: 0,
      bagYield: 1,
      mix: [1, 2, 4],
    });
    // Parts are in ratio 1:2:4 and together make the dry volume.
    near(result.sand / result.cement, 2, 1e-9);
    near(result.aggregate / result.cement, 4, 1e-9);
    near(result.cement + result.sand + result.aggregate, 1.54, 1e-9);
  });

  test("a zero bag yield does not divide by zero", () => {
    assert.equal(
      concrete({ length: 5, width: 4, thickness: 0.1, bagYield: 0 }).bags,
      0,
    );
  });
});

describe("paint", () => {
  test("subtracts the openings and multiplies by coats", () => {
    const result = paint({ perimeter: 18, height: 2.4, coats: 2, coveragePerLitre: 12, openings: 5 });
    near(result.totalArea, 43.2);
    near(result.paintableArea, 38.2);
    near(result.litresPerCoat, 38.2 / 12);
    near(result.litres, (38.2 / 12) * 2);
  });

  test("openings larger than the walls do not go negative", () => {
    const result = paint({ perimeter: 4, height: 2, coats: 1, coveragePerLitre: 10, openings: 100 });
    assert.equal(result.paintableArea, 0);
    assert.equal(result.litres, 0);
  });

  test("a zero coverage does not divide by zero", () => {
    assert.equal(paint({ perimeter: 18, height: 2.4, coveragePerLitre: 0 }).litres, 0);
  });

  test("fewer than one coat is still one", () => {
    const one = paint({ perimeter: 10, height: 2, coats: 1, coveragePerLitre: 10 });
    const zero = paint({ perimeter: 10, height: 2, coats: 0, coveragePerLitre: 10 });
    near(zero.litres, one.litres);
  });
});

describe("tiles", () => {
  test("counts tiles and rounds up", () => {
    // 12 m² of 0.6 x 0.6 tiles is 33.3 tiles; with 10% waste, 37.
    const result = tiles({ areaLength: 4, areaWidth: 3, tileLength: 0.6, tileWidth: 0.6, wastePercent: 10 });
    near(result.area, 12);
    near(result.tileArea, 0.36, 1e-9);
    near(result.tilesExact, 12 / 0.36, 1e-9);
    assert.equal(result.tiles, Math.ceil((12 / 0.36) * 1.1));
    assert.ok(Number.isInteger(result.tiles), "tiles must be whole");
  });

  test("boxes round up too", () => {
    const result = tiles({ areaLength: 4, areaWidth: 3, tileLength: 0.6, tileWidth: 0.6, perBox: 6 });
    assert.equal(result.boxes, Math.ceil(result.tiles / 6));
    assert.ok(result.boxes * 6 >= result.tiles, "boxes do not cover the tiles");
  });

  test("more waste never means fewer tiles", () => {
    const low = tiles({ areaLength: 4, areaWidth: 3, tileLength: 0.6, tileWidth: 0.6, wastePercent: 5 });
    const high = tiles({ areaLength: 4, areaWidth: 3, tileLength: 0.6, tileWidth: 0.6, wastePercent: 20 });
    assert.ok(high.tiles >= low.tiles);
  });

  test("a zero-sized tile does not divide by zero", () => {
    const result = tiles({ areaLength: 4, areaWidth: 3, tileLength: 0, tileWidth: 0.6 });
    assert.equal(result.tiles, 0);
    assert.equal(result.boxes, 0);
  });
});

describe("roofArea", () => {
  test("a flat roof is its own footprint", () => {
    const result = roofArea({ footprintLength: 10, footprintWidth: 8, rise: 0 });
    near(result.factor, 1);
    near(result.area, 80);
    near(result.pitchDegrees, 0);
  });

  test("a 6:12 roof is about 12% larger than its footprint", () => {
    const result = roofArea({ footprintLength: 12, footprintWidth: 8, rise: 6 });
    near(result.factor, Math.sqrt(1 + 0.25), 1e-9);
    near(result.factor, 1.1180, 0.0001);
    near(result.area, 96 * result.factor, 1e-9);
  });

  test("a 12:12 roof is at 45 degrees", () => {
    const result = roofArea({ footprintLength: 10, footprintWidth: 10, rise: 12 });
    near(result.pitchDegrees, 45, 1e-9);
    near(result.factor, Math.SQRT2, 1e-9);
  });

  test("a steeper pitch always means more area", () => {
    let previous = 0;
    for (const rise of [0, 3, 6, 9, 12]) {
      const { area } = roofArea({ footprintLength: 10, footprintWidth: 8, rise });
      assert.ok(area > previous || rise === 0, "area did not increase with pitch");
      previous = area;
    }
  });
});

describe("ohmsLaw", () => {
  test("solves from voltage and resistance", () => {
    const result = ohmsLaw("vr", 12, 100);
    near(result.volts, 12);
    near(result.ohms, 100);
    near(result.amps, 0.12);
    near(result.watts, 1.44);
  });

  test("every known pair agrees on the same circuit", () => {
    // 12 V across 100 ohms: 0.12 A, 1.44 W.
    const expected = { volts: 12, amps: 0.12, ohms: 100, watts: 1.44 };
    const pairs: [Parameters<typeof ohmsLaw>[0], number, number][] = [
      ["vr", 12, 100],
      ["vi", 12, 0.12],
      ["ir", 0.12, 100],
      ["pv", 1.44, 12],
      ["pi", 1.44, 0.12],
      ["pr", 1.44, 100],
    ];
    for (const [known, a, b] of pairs) {
      const result = ohmsLaw(known, a, b);
      near(result.volts, expected.volts, 1e-9);
      near(result.amps, expected.amps, 1e-9);
      near(result.ohms, expected.ohms, 1e-9);
      near(result.watts, expected.watts, 1e-9);
    }
  });

  test("zero inputs do not produce Infinity or NaN", () => {
    const knowns: Parameters<typeof ohmsLaw>[0][] = ["vi", "vr", "ir", "pv", "pi", "pr"];
    for (const known of knowns) {
      const result = ohmsLaw(known, 0, 0);
      for (const [field, value] of Object.entries(result)) {
        assert.ok(Number.isFinite(value), `${known}: ${field} is ${value}`);
      }
    }
  });
});

describe("force and torque", () => {
  test("F = ma", () => {
    near(force(80, 2).force, 160);
    near(force(1, 1).force, 1);
  });

  test("weight uses standard gravity", () => {
    near(force(80, 0).weight, 80 * GRAVITY);
    near(force(80, GRAVITY).force, force(80, 0).weight, 1e-9);
  });

  test("torque is force times distance at a right angle", () => {
    const result = torque(200, 0.3, 90);
    near(result.torque, 60, 1e-9);
    near(result.effectiveForce, 200, 1e-9);
  });

  test("an off-axis pull delivers less", () => {
    const square = torque(200, 0.3, 90);
    const angled = torque(200, 0.3, 45);
    near(angled.torque, square.torque * Math.SQRT1_2, 1e-9);
    assert.ok(angled.torque < square.torque);
  });

  test("pulling along the lever turns nothing", () => {
    near(torque(200, 0.3, 0).torque, 0, 1e-9);
    near(torque(200, 0.3, 180).torque, 0, 1e-9);
  });

  test("doubling the lever doubles the torque", () => {
    near(torque(200, 0.6).torque, torque(200, 0.3).torque * 2, 1e-9);
  });
});
