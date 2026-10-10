"use client";
import { CalculatorRunner } from "./CalculatorRunner";
import type { CalculatorDef } from "@/config/calculators/types";
import type { CountryCode } from "@/config/countries";
import { prepareCalculator } from "@/lib/validation";
export type EngineProps = { slug: string; lockedCountry?: CountryCode; allowedCountries?: CountryCode[] };
export function makeEngineRunner(definitions: Record<string, unknown>) {
  const candidates = Object.values(definitions).flat().filter((value): value is CalculatorDef =>
    !!value && typeof value === "object" && "slug" in value && "compute" in value);
  const calculators = new Map(candidates.map(calculator => [calculator.slug, prepareCalculator(calculator)]));
  return function EngineRunner(props: EngineProps) {
    const calculator = calculators.get(props.slug);
    return calculator ? <CalculatorRunner {...props} calculator={calculator} /> : null;
  };
}
