"use client";

import { useState } from "react";

import {
  Field,
  NumberInput,
  ToolCard,
  ToolFacts,
  ToolFields,
  ToolResult,
  inputClass,
} from "@/components/tools/ToolShell";
import { useLocale } from "@/lib/locale-context";
import { SegmentedControl } from "@/components/ui/Form";
import {
  divisorsOf,
  fromRoman,
  gcd,
  isPrime,
  lcm,
  numberToWords,
  percentage,
  primeFactors,
  simplifyFraction,
  toRoman,
} from "@/lib/tools/numbers";

type PercentMode = "of" | "share" | "change" | "apply";

export function PercentageTool() {
  const { t, fmt } = useLocale();
  const [mode, setMode] = useState<PercentMode>("of");
  const [a, setA] = useState(15);
  const [b, setB] = useState(200);

  const labels: Record<PercentMode, { a: string; b: string; result: string }> = {
    of: { a: t("tool.pct.percent"), b: t("tool.pct.value"), result: t("tool.pct.result.of") },
    share: { a: t("tool.pct.part"), b: t("tool.pct.whole"), result: t("tool.pct.result.share") },
    change: { a: t("tool.pct.from"), b: t("tool.pct.to"), result: t("tool.pct.result.change") },
    apply: { a: t("tool.pct.value"), b: t("tool.pct.percent"), result: t("tool.pct.result.apply") },
  };

  const answer =
    mode === "of"
      ? percentage.of(a, b)
      : mode === "share"
        ? percentage.share(a, b)
        : mode === "change"
          ? percentage.change(a, b)
          : percentage.apply(a, b);

  const isPercentAnswer = mode === "share" || mode === "change";

  return (
    <ToolCard>
      <div className="mb-5"><SegmentedControl label={t("tool.pct.mode")} value={mode} onChange={setMode}
        options={(["of", "share", "change", "apply"] as const).map(value => ({ value, label: t(`tool.pct.mode.${value}`) }))} /></div>

      <ToolFields>
        <Field label={labels[mode].a}>
          {(id) => (
            <NumberInput rule={mode === "of" ? "percentage" : "number"}
              id={id}
              type="number"
              value={a}
              errorKey={mode === "change" && a === 0 ? "validation.zeroDenominator" : undefined}
              onValueChange={(next) => setA(next)}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <Field label={labels[mode].b}>
          {(id) => (
            <NumberInput rule={mode === "apply" ? "percentage" : "number"}
              id={id}
              type="number"
              value={b}
              errorKey={mode === "share" && b === 0 ? "validation.zeroDenominator" : undefined}
              onValueChange={(next) => setB(next)}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
      </ToolFields>

      <ToolResult
        label={labels[mode].result}
        value={
          !Number.isFinite(answer) ? "—" : isPercentAnswer
            ? fmt.percent(answer, { decimals: 2 })
            : fmt.number(answer, { decimals: 2 })
        }
        detail={!Number.isFinite(answer) ? t("validation.zeroDenominator") : undefined}
        tone={Number.isFinite(answer) ? "primary" : "warning"}
      />
    </ToolCard>
  );
}

export function NumberToWordsTool() {
  const { t, fmt } = useLocale();
  const [value, setValue] = useState(1234.56);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.number")}>
          {(id) => (
            <NumberInput rule="words"
              id={id}
              type="number"
              value={value}
              onValueChange={(next) => setValue(next)}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
      </ToolFields>

      <ToolResult
        label={t("tool.result.inWords")}
        value={numberToWords(value)}
        detail={t("tool.note.englishOnly")}
      />

      <ToolFacts
        items={[
          { label: t("tool.result.formatted"), value: fmt.number(value, { decimals: 2 }) },
        ]}
      />
    </ToolCard>
  );
}

export function RomanNumeralsTool() {
  const { t } = useLocale();
  const [arabic, setArabic] = useState(2025);
  const [roman, setRoman] = useState("MMXXV");

  const fromArabic = toRoman(arabic);
  const parsed = fromRoman(roman);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.number")} hint={t("tool.hint.romanRange")}>
          {(id) => (
            <NumberInput rule="roman"
              id={id}
              type="number"
              min={1}
              max={3999}
              value={arabic}
              onValueChange={(next) => setArabic(next)}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <Field label={t("tool.field.romanNumeral")} error={parsed === null ? t("tool.result.invalidNumeral") : undefined}>
          {(id) => (
            <input
              id={id}
              type="text"
              maxLength={15}
              value={roman}
              onChange={(event) => setRoman(event.target.value.toUpperCase())}
              className={`tabular uppercase ${inputClass}`}
            />
          )}
        </Field>
      </ToolFields>

      <ToolResult
        label={t("tool.result.asRoman")}
        value={fromArabic || t("tool.result.outOfRange")}
        tone={fromArabic ? "primary" : "warning"}
      />

      <ToolFacts
        items={[
          {
            label: t("tool.result.asNumber"),
            value: parsed === null ? t("tool.result.invalidNumeral") : String(parsed),
          },
        ]}
      />
    </ToolCard>
  );
}

export function PrimeCheckerTool() {
  const { t, fmt } = useLocale();
  const [value, setValue] = useState(97);

  const prime = isPrime(value);
  const factors = primeFactors(value);
  const divisors = divisorsOf(value);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.number")}>
          {(id) => (
            <NumberInput rule="factor"
              id={id}
              type="number"
              min={1}
              value={value}
              onValueChange={(next) => setValue(Math.floor(next))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
      </ToolFields>

      <ToolResult
        label={t("tool.result.isPrime")}
        value={prime ? t("common.yes") : t("common.no")}
        tone={prime ? "primary" : "warning"}
        detail={
          prime
            ? t("tool.result.primeExplain", { value: fmt.number(value) })
            : t("tool.result.notPrimeExplain", { factors: factors.join(" × ") })
        }
      />

      <ToolFacts
        items={[
          { label: t("tool.result.primeFactors"), value: factors.join(" × ") || "—" },
          { label: t("tool.result.divisorCount"), value: fmt.number(divisors.length) },
          {
            label: t("tool.result.divisors"),
            // A highly composite number has a lot of divisors; showing the
            // first dozen is enough to be useful without flooding the card.
            value:
              divisors.slice(0, 12).join(", ") +
              (divisors.length > 12 ? ` …` : ""),
          },
        ]}
      />
    </ToolCard>
  );
}

export function FractionSimplifierTool() {
  const { t, fmt } = useLocale();
  const [numerator, setNumerator] = useState(144);
  const [denominator, setDenominator] = useState(60);

  const simplified = simplifyFraction(numerator, denominator);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.numerator")}>
          {(id) => (
            <NumberInput rule="numerator"
              id={id}
              type="number"
              value={numerator}
              onValueChange={(next) => setNumerator(Math.floor(next))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <Field label={t("tool.field.denominator")}>
          {(id) => (
            <NumberInput rule="denominator"
              errorKey={denominator === 0 ? "tool.result.divideByZero" : undefined}
              id={id}
              type="number"
              value={denominator}
              onValueChange={(next) => setDenominator(Math.floor(next))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
      </ToolFields>

      <ToolResult
        label={t("tool.result.simplified")}
        value={
          simplified
            ? `${simplified.numerator} / ${simplified.denominator}`
            : t("tool.result.divideByZero")
        }
        tone={simplified ? "primary" : "warning"}
      />

      {simplified ? (
        <ToolFacts
          items={[
            { label: t("tool.result.asDecimal"), value: fmt.number(simplified.decimal, { decimals: 6 }) },
            { label: t("tool.result.asPercent"), value: fmt.percent(simplified.decimal * 100, { decimals: 2 }) },
            { label: t("tool.result.gcd"), value: fmt.number(gcd(numerator, denominator)) },
            { label: t("tool.result.lcm"), value: fmt.number(lcm(numerator, denominator)) },
          ]}
        />
      ) : null}
    </ToolCard>
  );
}
