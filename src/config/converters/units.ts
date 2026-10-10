import type { ConverterCategory } from "@/config/categories";

/**
 * Centralised unit library. Every unit declares how it relates to its
 * category's base unit, so any pair converts through the base rather than
 * needing an N×N table.
 *
 * Most units are a simple factor. The few that are not - temperature, fuel
 * economy - provide explicit conversions instead.
 */
export type UnitDefinition = {
  id: string;
  /** Dictionary key for the unit's name, e.g. `unit.length.meter`. */
  labelKey: string;
  /** Written symbol, which is not translated, e.g. `km`. */
  symbol: string;
  /**
   * Plural, URL-safe name used in pair slugs. Defaults to the id when the
   * plural adds nothing, as with `celsius` or `horsepower`.
   */
  urlName?: string;
  /** How many base units one of this unit is worth. */
  factor?: number;
  /** Non-linear units define both directions explicitly. */
  toBase?: (value: number) => number;
  fromBase?: (value: number) => number;
  /** Larger units need more decimals to stay useful. */
  decimals?: number;
};

export type ConverterDefinition = {
  id: string;
  category: ConverterCategory;
  slug: string;
  titleKey: string;
  descKey: string;
  icon: string;
  baseUnit: string;
  units: UnitDefinition[];
  /**
   * Pairs that get their own indexed page. Deliberately a short list of the
   * conversions people actually search for: generating every permutation would
   * produce hundreds of near-identical pages with nothing to say.
   */
  featuredPairs: [string, string][];
  /** Default pair shown on the category page. */
  defaultPair: [string, string];
  /** Dictionary key for the explanation shown under the converter. */
  explainerKey: string;
};

export function convert(
  definition: ConverterDefinition,
  value: number,
  fromId: string,
  toId: string,
): number {
  const from = definition.units.find((unit) => unit.id === fromId);
  const to = definition.units.find((unit) => unit.id === toId);
  if (!from || !to || !Number.isFinite(value)) return NaN;
  if (fromId === toId) return value;

  const base = from.toBase ? from.toBase(value) : value * (from.factor ?? 1);
  return to.fromBase ? to.fromBase(base) : base / (to.factor ?? 1);
}

/** Conversion factor between two units, for the "1 x = y" line and tables. */
export function unitRatio(
  definition: ConverterDefinition,
  fromId: string,
  toId: string,
): number {
  return convert(definition, 1, fromId, toId);
}

export function findUnit(
  definition: ConverterDefinition,
  id: string,
): UnitDefinition | undefined {
  return definition.units.find((unit) => unit.id === id);
}

/** Steps used to build the quick-reference table on every converter page. */
export function conversionFormula(definition: ConverterDefinition, from: string, to: string): string {
  const fromUnit = findUnit(definition, from)!;
  const toUnit = findUnit(definition, to)!;
  const number = (n: number) => Number(n.toPrecision(12)).toString();
  if (definition.category === "fuel-economy" && (from === "liters-per-100km" || to === "liters-per-100km") && from !== to) {
    return `${toUnit.symbol} = ${number(convert(definition, 1, from, to))} / ${fromUnit.symbol} (${fromUnit.symbol} > 0)`;
  }
  const offset = convert(definition, 0, from, to);
  const scale = convert(definition, 1, from, to) - offset;
  return `${toUnit.symbol} = ${fromUnit.symbol} × ${number(scale)}${offset ? ` ${offset >= 0 ? "+" : "−"} ${number(Math.abs(offset))}` : ""}`;
}
export const TABLE_STEPS = [1, 2, 5, 10, 20, 50, 100, 250, 500, 1000];
