"use client";

import dynamic from "next/dynamic";
import { useState, type ComponentType } from "react";

import { ToolResetContext } from "@/components/tools/ToolShell";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

/**
 * Maps a tool slug to its component.
 *
 * Tools do not share an input/result shape the way calculators do, so each one
 * is its own component rather than a definition fed through a generic engine.
 * The registry stays in the definition file; this is only the wiring.
 *
 * Each group of tools is its own chunk, so a page downloads only the file its
 * tool lives in. The server still renders the tool into the HTML; the
 * skeleton only shows during a client-side navigation while the chunk loads.
 */

function ToolSkeleton() {
  return (
    <div aria-hidden className="card space-y-5 p-5 sm:p-8">
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-28 !rounded-lg" />
      <SkeletonText lines={2} />
    </div>
  );
}

type Loader = () => Promise<{ [name: string]: ComponentType }>;

function lazy(load: Loader, name: string): ComponentType {
  return dynamic(() => load().then((module) => module[name] as ComponentType), {
    loading: ToolSkeleton,
  });
}

const date = () => import("@/components/tools/DateTools") as unknown as ReturnType<Loader>;
const number = () => import("@/components/tools/NumberTools") as unknown as ReturnType<Loader>;
const more = () => import("@/components/tools/MoreTools") as unknown as ReturnType<Loader>;
const random = () => import("@/components/tools/RandomTools") as unknown as ReturnType<Loader>;
const utility = () => import("@/components/tools/UtilityTools") as unknown as ReturnType<Loader>;

const TOOLS: Record<string, ComponentType> = {
  "date-difference": lazy(date, "DateDifferenceTool"),
  "add-days": lazy(date, "AddDaysTool"),
  "working-days": lazy(date, "WorkingDaysTool"),
  age: lazy(date, "AgeTool"),
  "week-number": lazy(date, "WeekNumberTool"),
  percentage: lazy(number, "PercentageTool"),
  "number-to-words": lazy(number, "NumberToWordsTool"),
  "roman-numerals": lazy(number, "RomanNumeralsTool"),
  "prime-checker": lazy(number, "PrimeCheckerTool"),
  "fraction-simplifier": lazy(number, "FractionSimplifierTool"),
  "random-number": lazy(utility, "RandomNumberTool"),
  "password-generator": lazy(utility, "PasswordGeneratorTool"),
  "savings-goal": lazy(utility, "SavingsGoalTool"),
  "debt-payoff": lazy(utility, "DebtPayoffTool"),
  "day-of-week": lazy(more, "DayOfWeekTool"),
  countdown: lazy(more, "CountdownTool"),
  "words-to-number": lazy(more, "WordsToNumberTool"),
  "factor-finder": lazy(more, "FactorFinderTool"),
  "number-formatter": lazy(more, "NumberFormatterTool"),
  "budget-planner": lazy(more, "BudgetPlannerTool"),
  "dice-roller": lazy(random, "DiceRollerTool"),
  "coin-flip": lazy(random, "CoinFlipTool"),
  "random-picker": lazy(random, "RandomPickerTool"),
};

/** Reset remounts the tool, which puts every input back to its default. */
export function ToolRunner({ slug }: { slug: string }) {
  const [version, setVersion] = useState(0);
  const Tool = TOOLS[slug];
  if (!Tool) return null;
  return (
    <ToolResetContext.Provider value={() => setVersion((current) => current + 1)}>
      <Tool key={version} />
    </ToolResetContext.Provider>
  );
}
