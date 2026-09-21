/**
 * Business, pricing and everyday-cost formulas.
 *
 * All of these are ratios of money to money, so they are currency-agnostic:
 * the country changes the symbol and the grouping, never the arithmetic.
 */

/** Profit as a share of the selling price. */
export function profitMargin(revenue: number, cost: number): number {
  return revenue === 0 ? 0 : ((revenue - cost) / revenue) * 100;
}

/** Profit as a share of what it cost you. */
export function markup(revenue: number, cost: number): number {
  return cost === 0 ? 0 : ((revenue - cost) / cost) * 100;
}

/**
 * The two are different questions about the same profit, which is why a 50%
 * markup is only a 33.3% margin. Confusing them is the classic pricing error.
 */
export function markupToMargin(markupPercent: number): number {
  const ratio = markupPercent / 100;
  return ratio === -1 ? 0 : (ratio / (1 + ratio)) * 100;
}

export function marginToMarkup(marginPercent: number): number {
  const ratio = marginPercent / 100;
  return ratio === 1 ? 0 : (ratio / (1 - ratio)) * 100;
}

/** Selling price that achieves a target margin on a given cost. */
export function priceForMargin(cost: number, marginPercent: number): number {
  const ratio = marginPercent / 100;
  return ratio >= 1 ? 0 : cost / (1 - ratio);
}

/** Selling price that achieves a target markup on a given cost. */
export function priceForMarkup(cost: number, markupPercent: number): number {
  return cost * (1 + markupPercent / 100);
}

export type BreakEven = {
  /** Units that must sell to cover the fixed costs. */
  units: number;
  /** Revenue at that point. */
  revenue: number;
  /** What each unit contributes towards the fixed costs. */
  contributionPerUnit: number;
  contributionMargin: number;
  /** True when each sale loses money, so no volume ever breaks even. */
  neverBreaksEven: boolean;
};

/**
 * Break-even point.
 *
 * When the variable cost meets or exceeds the price, every extra sale widens
 * the loss. Saying so is more useful than returning a huge or negative number
 * that looks like an answer.
 */
export function breakEven({
  fixedCosts,
  pricePerUnit,
  variableCostPerUnit,
}: {
  fixedCosts: number;
  pricePerUnit: number;
  variableCostPerUnit: number;
}): BreakEven {
  const contributionPerUnit = pricePerUnit - variableCostPerUnit;
  const contributionMargin =
    pricePerUnit === 0 ? 0 : (contributionPerUnit / pricePerUnit) * 100;

  if (contributionPerUnit <= 0) {
    return {
      units: 0,
      revenue: 0,
      contributionPerUnit,
      contributionMargin,
      neverBreaksEven: true,
    };
  }

  const units = fixedCosts / contributionPerUnit;
  return {
    units,
    revenue: units * pricePerUnit,
    contributionPerUnit,
    contributionMargin,
    neverBreaksEven: false,
  };
}

/** Return on investment as a percentage of what was put in. */
export function roi(gain: number, cost: number): number {
  return cost === 0 ? 0 : ((gain - cost) / cost) * 100;
}

/** Revenue produced per unit of advertising spend. */
export function roas(revenue: number, adSpend: number): number {
  return adSpend === 0 ? 0 : revenue / adSpend;
}

/** Simple percentage growth between two figures. */
export function growthRate(from: number, to: number): number {
  return from === 0 ? 0 : ((to - from) / from) * 100;
}

/** Price after a discount, and what it saves. */
export function applyDiscount(
  price: number,
  percent: number,
): { final: number; saved: number } {
  const saved = (price * percent) / 100;
  return { final: price - saved, saved };
}

/** The discount implied by an original and a sale price. */
export function discountPercent(original: number, sale: number): number {
  return original === 0 ? 0 : ((original - sale) / original) * 100;
}

/** Fuel needed and what it costs, in whichever units are supplied. */
export function fuelCost({
  distance,
  economy,
  pricePerUnit,
  /** True when economy is consumption per 100 distance rather than distance per unit. */
  consumptionStyle = false,
}: {
  distance: number;
  economy: number;
  pricePerUnit: number;
  consumptionStyle?: boolean;
}): { fuel: number; cost: number; costPerDistance: number } {
  if (economy <= 0) return { fuel: 0, cost: 0, costPerDistance: 0 };

  // L/100 km counts the other way round from km/L, so it multiplies where the
  // other divides.
  const fuel = consumptionStyle ? (distance * economy) / 100 : distance / economy;
  const cost = fuel * pricePerUnit;
  return { fuel, cost, costPerDistance: distance === 0 ? 0 : cost / distance };
}

/** Energy used by an appliance and what the electricity costs. */
export function electricityCost({
  watts,
  hoursPerDay,
  pricePerKwh,
  days = 30,
}: {
  watts: number;
  hoursPerDay: number;
  pricePerKwh: number;
  days?: number;
}): { kwhPerDay: number; kwhTotal: number; costPerDay: number; costTotal: number } {
  const kwhPerDay = (watts * hoursPerDay) / 1000;
  const kwhTotal = kwhPerDay * days;
  return {
    kwhPerDay,
    kwhTotal,
    costPerDay: kwhPerDay * pricePerKwh,
    costTotal: kwhTotal * pricePerKwh,
  };
}

/** Scales every ingredient by the same factor. */
export function recipeScale(
  originalServings: number,
  desiredServings: number,
): number {
  return originalServings <= 0 ? 0 : desiredServings / originalServings;
}

/* -------------------------------------------------------------- education */

export type GradePoint = { credits: number; points: number };

/**
 * Grade point average: credits act as weights, so a four-credit module moves
 * the average twice as far as a two-credit one.
 */
export function gpa(entries: GradePoint[]): number {
  const credits = entries.reduce((total, entry) => total + entry.credits, 0);
  if (credits === 0) return 0;
  const weighted = entries.reduce(
    (total, entry) => total + entry.credits * entry.points,
    0,
  );
  return weighted / credits;
}

/** A weighted average of scores, where the weights are percentages of the total. */
export function weightedGrade(
  entries: { weight: number; score: number }[],
): { score: number; weightUsed: number } {
  const weightUsed = entries.reduce((total, entry) => total + entry.weight, 0);
  if (weightUsed === 0) return { score: 0, weightUsed: 0 };
  const weighted = entries.reduce(
    (total, entry) => total + entry.weight * entry.score,
    0,
  );
  return { score: weighted / weightUsed, weightUsed };
}

/**
 * The mark needed on what is left to reach a target overall.
 *
 * Can legitimately come out above 100 or below 0; the caller says so rather
 * than clamping, because "you need 112%" is the honest answer.
 */
export function scoreNeeded({
  currentScore,
  completedWeight,
  targetScore,
}: {
  currentScore: number;
  completedWeight: number;
  targetScore: number;
}): { needed: number; remainingWeight: number; possible: boolean } {
  const remainingWeight = 100 - completedWeight;
  if (remainingWeight <= 0) {
    return { needed: 0, remainingWeight: 0, possible: currentScore >= targetScore };
  }

  const earned = (currentScore * completedWeight) / 100;
  const needed = ((targetScore - earned) / remainingWeight) * 100;
  return { needed, remainingWeight, possible: needed <= 100 };
}
