/**
 * The information architecture. Sections are the six product pillars, and each
 * one has its own set of categories that appear in the URL:
 *
 *   /{locale}/{section}/{category}/{slug}
 *
 * Categories exist to give a page a home and a breadcrumb, so they are a fixed
 * vocabulary rather than free-form tags.
 */

export const SECTIONS = [
  "calculators",
  "converters",
  "tools",
  "charts",
  "guides",
  "countries",
] as const;

export type Section = (typeof SECTIONS)[number];

export type CalculatorCategory =
  | "finance"
  | "math"
  | "health"
  | "business"
  | "education"
  | "engineering"
  | "construction"
  | "everyday";

export type ConverterCategory =
  | "currency"
  | "length"
  | "weight"
  | "temperature"
  | "area"
  | "volume"
  | "speed"
  | "data"
  | "energy"
  | "pressure"
  | "power"
  | "time"
  | "angle"
  | "fuel-economy";

export type ToolCategory = "date-time" | "number-math" | "utility" | "planning";

export type ChartCategory = "conversion" | "math" | "finance" | "everyday";

export type GuideCategory =
  | "how-to-calculate"
  | "what-is"
  | "formulas"
  | "practical";

export const CALCULATOR_CATEGORIES: CalculatorCategory[] = [
  "finance",
  "math",
  "health",
  "business",
  "education",
  "engineering",
  "construction",
  "everyday",
];

export const TOOL_CATEGORIES: ToolCategory[] = [
  "date-time",
  "number-math",
  "utility",
  "planning",
];

export const CHART_CATEGORIES: ChartCategory[] = [
  "conversion",
  "math",
  "finance",
  "everyday",
];

export const GUIDE_CATEGORIES: GuideCategory[] = [
  "how-to-calculate",
  "what-is",
  "formulas",
  "practical",
];

/** Dictionary key for a category label, namespaced so two sections can reuse a word. */
export function categoryKey(section: Section, category: string): string {
  return `category.${section}.${category}`;
}

export function sectionKey(section: Section): string {
  return `section.${section}`;
}
