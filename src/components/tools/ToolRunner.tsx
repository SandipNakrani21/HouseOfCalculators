"use client";

import {
  AddDaysTool,
  AgeTool,
  DateDifferenceTool,
  WeekNumberTool,
  WorkingDaysTool,
} from "@/components/tools/DateTools";
import {
  FractionSimplifierTool,
  NumberToWordsTool,
  PercentageTool,
  PrimeCheckerTool,
  RomanNumeralsTool,
} from "@/components/tools/NumberTools";
import {
  BudgetPlannerTool,
  CountdownTool,
  DayOfWeekTool,
  FactorFinderTool,
  NumberFormatterTool,
  WordsToNumberTool,
} from "@/components/tools/MoreTools";
import {
  CoinFlipTool,
  DiceRollerTool,
  RandomPickerTool,
} from "@/components/tools/RandomTools";
import {
  DebtPayoffTool,
  PasswordGeneratorTool,
  RandomNumberTool,
  SavingsGoalTool,
} from "@/components/tools/UtilityTools";

/**
 * Maps a tool slug to its component.
 *
 * Tools do not share an input/result shape the way calculators do, so each one
 * is its own component rather than a definition fed through a generic engine.
 * The registry stays in the definition file; this is only the wiring.
 */
const TOOLS: Record<string, () => React.JSX.Element> = {
  "date-difference": DateDifferenceTool,
  "add-days": AddDaysTool,
  "working-days": WorkingDaysTool,
  age: AgeTool,
  "week-number": WeekNumberTool,
  percentage: PercentageTool,
  "number-to-words": NumberToWordsTool,
  "roman-numerals": RomanNumeralsTool,
  "prime-checker": PrimeCheckerTool,
  "fraction-simplifier": FractionSimplifierTool,
  "random-number": RandomNumberTool,
  "password-generator": PasswordGeneratorTool,
  "savings-goal": SavingsGoalTool,
  "debt-payoff": DebtPayoffTool,
  "day-of-week": DayOfWeekTool,
  countdown: CountdownTool,
  "words-to-number": WordsToNumberTool,
  "factor-finder": FactorFinderTool,
  "number-formatter": NumberFormatterTool,
  "dice-roller": DiceRollerTool,
  "coin-flip": CoinFlipTool,
  "random-picker": RandomPickerTool,
  "budget-planner": BudgetPlannerTool,
};

export function ToolRunner({ slug }: { slug: string }) {
  const Tool = TOOLS[slug];
  return Tool ? <Tool /> : null;
}

/** Slugs that actually have an implementation, for route generation. */
export const IMPLEMENTED_TOOLS = Object.keys(TOOLS);
