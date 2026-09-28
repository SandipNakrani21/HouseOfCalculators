"use client";

import { useState } from "react";

import {
  Field,
  ToolCard,
  ToolFacts,
  ToolFields,
  ToolResult,
  inputClass,
} from "@/components/tools/ToolShell";
import { useLocale } from "@/lib/locale-context";
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
      <div role="tablist" aria-label={t("tool.pct.mode")} className="mb-5 flex flex-wrap gap-2">
        {(["of", "share", "change", "apply"] as const).map((option) => (
          <button
            key={option}
            role="tab"
            type="button"
            aria-selected={mode === option}
            onClick={() => setMode(option)}
            className={`rounded-sm border px-3 py-2 text-sm transition-colors ${
              mode === option
                ? "border-primary bg-primary-soft font-medium text-primary"
                : "border-border text-muted hover:border-border-strong"
            }`}
          >
            {t(`tool.pct.mode.${option}`)}
          </button>
        ))}
      </div>

      <ToolFields>
        <Field label={labels[mode].a}>
          {(id) => (
            <input
              id={id}
              type="number"
              value={a}
              onChange={(event) => setA(Number(event.target.value))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <Field label={labels[mode].b}>
          {(id) => (
            <input
              id={id}
              type="number"
              value={b}
              onChange={(event) => setB(Number(event.target.value))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
      </ToolFields>

      <ToolResult
        label={labels[mode].result}
        value={
          isPercentAnswer
            ? fmt.percent(answer, { decimals: 2 })
            : fmt.number(answer, { decimals: 2 })
        }
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
            <input
              id={id}
              type="number"
              value={value}
              onChange={(event) => setValue(Number(event.target.value))}
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
            <input
              id={id}
              type="number"
              min={1}
              max={3999}
              value={arabic}
              onChange={(event) => setArabic(Number(event.target.value))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <Field label={t("tool.field.romanNumeral")}>
          {(id) => (
            <input
              id={id}
              type="text"
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
            <input
              id={id}
              type="number"
              min={1}
              value={value}
              onChange={(event) => setValue(Math.floor(Number(event.target.value)))}
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
            <input
              id={id}
              type="number"
              value={numerator}
              onChange={(event) => setNumerator(Math.floor(Number(event.target.value)))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <Field label={t("tool.field.denominator")}>
          {(id) => (
            <input
              id={id}
              type="number"
              value={denominator}
              onChange={(event) => setDenominator(Math.floor(Number(event.target.value)))}
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
