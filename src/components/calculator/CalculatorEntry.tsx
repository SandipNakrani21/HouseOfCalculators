"use client";
import dynamic from "next/dynamic";
import { CALCULATOR_METADATA } from "@/config/calculators/metadata";
import type { EngineProps } from "./EngineGroup";
const engines = {
  business: dynamic(() => import("./engines/business")),
  construction: dynamic(() => import("./engines/construction")),
  education: dynamic(() => import("./engines/education")),
  health: dynamic(() => import("./engines/health")),
  income: dynamic(() => import("./engines/income")),
  loans: dynamic(() => import("./engines/loans")),
  maths: dynamic(() => import("./engines/maths")),
  retirement: dynamic(() => import("./engines/retirement")),
  sip: dynamic(() => import("./engines/sip")),
  tax: dynamic(() => import("./engines/tax")),
};
export function CalculatorEntry(props: EngineProps) {
  const group = CALCULATOR_METADATA.find(calculator => calculator.slug === props.slug)?.engineGroup;
  const Engine = group ? engines[group as keyof typeof engines] : undefined;
  return Engine ? <Engine key={`${props.slug}:${props.lockedCountry ?? "preferred"}`} {...props} /> : null;
}
