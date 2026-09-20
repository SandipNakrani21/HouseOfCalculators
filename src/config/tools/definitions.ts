import type { ToolCategory } from "@/config/categories";

/**
 * Tools are the utilities that are not really calculations: date arithmetic,
 * number formatting, random draws, simple planners.
 *
 * Unlike calculators they do not share one input/result shape, so a definition
 * carries only its metadata and the runner maps the slug to a component. The
 * set is deliberately small - a few dozen genuinely useful tools rather than
 * thousands of pages that differ by one word.
 */
export type ToolDefinition = {
  slug: string;
  category: ToolCategory;
  icon: string;
  titleKey: string;
  descKey: string;
  explainerKey: string;
  keywords: string;
};

export const TOOLS: ToolDefinition[] = [
  /* Date and time */
  {
    slug: "date-difference",
    category: "date-time",
    icon: "📅",
    titleKey: "tool.date-difference.title",
    descKey: "tool.date-difference.desc",
    explainerKey: "tool.date-difference.explain",
    keywords: "days between dates duration",
  },
  {
    slug: "add-days",
    category: "date-time",
    icon: "➕",
    titleKey: "tool.add-days.title",
    descKey: "tool.add-days.desc",
    explainerKey: "tool.add-days.explain",
    keywords: "add subtract days weeks months date",
  },
  {
    slug: "working-days",
    category: "date-time",
    icon: "💼",
    titleKey: "tool.working-days.title",
    descKey: "tool.working-days.desc",
    explainerKey: "tool.working-days.explain",
    keywords: "business days weekdays",
  },
  {
    slug: "age",
    category: "date-time",
    icon: "🎂",
    titleKey: "tool.age.title",
    descKey: "tool.age.desc",
    explainerKey: "tool.age.explain",
    keywords: "age birthday how old",
  },
  {
    slug: "week-number",
    category: "date-time",
    icon: "🗓️",
    titleKey: "tool.week-number.title",
    descKey: "tool.week-number.desc",
    explainerKey: "tool.week-number.explain",
    keywords: "iso week number day of week",
  },

  /* Numbers and maths */
  {
    slug: "percentage",
    category: "number-math",
    icon: "％",
    titleKey: "tool.percentage.title",
    descKey: "tool.percentage.desc",
    explainerKey: "tool.percentage.explain",
    keywords: "percent increase decrease of change",
  },
  {
    slug: "number-to-words",
    category: "number-math",
    icon: "🔤",
    titleKey: "tool.number-to-words.title",
    descKey: "tool.number-to-words.desc",
    explainerKey: "tool.number-to-words.explain",
    keywords: "spell number words cheque amount",
  },
  {
    slug: "roman-numerals",
    category: "number-math",
    icon: "🏛️",
    titleKey: "tool.roman-numerals.title",
    descKey: "tool.roman-numerals.desc",
    explainerKey: "tool.roman-numerals.explain",
    keywords: "roman numeral converter mcmxc",
  },
  {
    slug: "prime-checker",
    category: "number-math",
    icon: "🔢",
    titleKey: "tool.prime-checker.title",
    descKey: "tool.prime-checker.desc",
    explainerKey: "tool.prime-checker.explain",
    keywords: "prime factors divisors",
  },
  {
    slug: "fraction-simplifier",
    category: "number-math",
    icon: "➗",
    titleKey: "tool.fraction-simplifier.title",
    descKey: "tool.fraction-simplifier.desc",
    explainerKey: "tool.fraction-simplifier.explain",
    keywords: "fraction simplify reduce gcd lcm decimal",
  },

  /* Utility */
  {
    slug: "random-number",
    category: "utility",
    icon: "🎲",
    titleKey: "tool.random-number.title",
    descKey: "tool.random-number.desc",
    explainerKey: "tool.random-number.explain",
    keywords: "random number generator dice draw",
  },
  {
    slug: "password-generator",
    category: "utility",
    icon: "🔐",
    titleKey: "tool.password-generator.title",
    descKey: "tool.password-generator.desc",
    explainerKey: "tool.password-generator.explain",
    keywords: "password generator secure random",
  },

  /* Planning */
  {
    slug: "savings-goal",
    category: "planning",
    icon: "🎯",
    titleKey: "tool.savings-goal.title",
    descKey: "tool.savings-goal.desc",
    explainerKey: "tool.savings-goal.explain",
    keywords: "savings goal target monthly deposit",
  },
  {
    slug: "debt-payoff",
    category: "planning",
    icon: "📉",
    titleKey: "tool.debt-payoff.title",
    descKey: "tool.debt-payoff.desc",
    explainerKey: "tool.debt-payoff.explain",
    keywords: "debt payoff snowball credit card",
  },
];

export function getTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export function toolsIn(category: ToolCategory): ToolDefinition[] {
  return TOOLS.filter((tool) => tool.category === category);
}
