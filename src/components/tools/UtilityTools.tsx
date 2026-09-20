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
import { debtPayoff, depositForGoal, savingsGoal } from "@/lib/tools/planning";

/** Uniform integer in [min, max], drawn from the platform CSPRNG. */
function randomInt(min: number, max: number): number {
  const span = max - min + 1;
  if (span <= 0) return min;

  // Rejection sampling: taking a modulus of a 32-bit draw would make the
  // lowest values very slightly more likely.
  const limit = Math.floor(0xffffffff / span) * span;
  const buffer = new Uint32Array(1);
  let draw = limit;
  while (draw >= limit) {
    crypto.getRandomValues(buffer);
    draw = buffer[0];
  }
  return min + (draw % span);
}

export function RandomNumberTool() {
  const { t, fmt } = useLocale();
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(false);
  const [results, setResults] = useState<number[]>([]);

  const span = max - min + 1;
  const impossible = unique && count > span;

  const draw = () => {
    if (impossible) return;
    if (unique) {
      const pool = new Set<number>();
      while (pool.size < count) pool.add(randomInt(min, max));
      setResults([...pool]);
    } else {
      setResults(Array.from({ length: count }, () => randomInt(min, max)));
    }
  };

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.min")}>
          {(id) => (
            <input
              id={id}
              type="number"
              value={min}
              onChange={(event) => setMin(Math.floor(Number(event.target.value)))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <Field label={t("tool.field.max")}>
          {(id) => (
            <input
              id={id}
              type="number"
              value={max}
              onChange={(event) => setMax(Math.floor(Number(event.target.value)))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <Field label={t("tool.field.howMany")}>
          {(id) => (
            <input
              id={id}
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(event) =>
                setCount(Math.min(Math.max(Number(event.target.value), 1), 100))
              }
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={unique}
              onChange={(event) => setUnique(event.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            {t("tool.field.unique")}
          </label>
        </div>
      </ToolFields>

      <button
        type="button"
        onClick={draw}
        disabled={impossible}
        className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover disabled:opacity-50 sm:w-auto"
      >
        {t("tool.action.generate")}
      </button>

      <ToolResult
        label={t("tool.result.random")}
        value={
          impossible
            ? t("tool.result.notEnoughNumbers")
            : results.length
              ? results.map((value) => fmt.number(value)).join(", ")
              : "—"
        }
        tone={impossible ? "warning" : "primary"}
      />
    </ToolCard>
  );
}

const SETS = {
  lower: "abcdefghijkmnopqrstuvwxyz",
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  digits: "23456789",
  symbols: "!@#$%^&*-_=+?",
};

export function PasswordGeneratorTool() {
  const { t } = useLocale();
  const [length, setLength] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const alphabet =
    SETS.lower +
    (useUpper ? SETS.upper : "") +
    (useDigits ? SETS.digits : "") +
    (useSymbols ? SETS.symbols : "");

  const generate = () => {
    const chars = Array.from({ length }, () =>
      alphabet[randomInt(0, alphabet.length - 1)],
    );
    setPassword(chars.join(""));
    setCopied(false);
  };

  const copy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the password stays on screen.
    }
  };

  // Entropy of a uniform draw: length × log2(alphabet size).
  const bits = Math.round(length * Math.log2(alphabet.length || 1));

  const toggle = (
    label: string,
    checked: boolean,
    onChange: (next: boolean) => void,
  ) => (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--primary)]"
      />
      {label}
    </label>
  );

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.length")}>
          {(id) => (
            <input
              id={id}
              type="number"
              min={8}
              max={64}
              value={length}
              onChange={(event) =>
                setLength(Math.min(Math.max(Number(event.target.value), 8), 64))
              }
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <div className="flex flex-col justify-end gap-2">
          {toggle(t("tool.field.uppercase"), useUpper, setUseUpper)}
          {toggle(t("tool.field.digits"), useDigits, setUseDigits)}
          {toggle(t("tool.field.symbols"), useSymbols, setUseSymbols)}
        </div>
      </ToolFields>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generate}
          className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover"
        >
          {t("tool.action.generate")}
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={!password}
          className="rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-surface-muted disabled:opacity-40"
        >
          {copied ? t("common.copied") : t("common.copyLink")}
        </button>
      </div>

      <ToolResult
        label={t("tool.result.password")}
        value={password || "—"}
        detail={t("tool.result.entropy", { bits })}
      />

      <p className="mt-3 text-xs text-muted">{t("tool.note.passwordPrivacy")}</p>
    </ToolCard>
  );
}

export function SavingsGoalTool() {
  const { t, fmt } = useLocale();
  const [target, setTarget] = useState(20000);
  const [current, setCurrent] = useState(2000);
  const [monthly, setMonthly] = useState(400);
  const [rate, setRate] = useState(4);
  const [byMonths, setByMonths] = useState(36);

  const result = savingsGoal({ target, current, monthly, annualRate: rate });
  const needed = depositForGoal({
    target,
    current,
    months: byMonths,
    annualRate: rate,
  });

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.target")}>
          {(id) => (
            <input id={id} type="number" min={0} value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className={`tabular ${inputClass}`} />
          )}
        </Field>
        <Field label={t("tool.field.currentSavings")}>
          {(id) => (
            <input id={id} type="number" min={0} value={current}
              onChange={(e) => setCurrent(Number(e.target.value))}
              className={`tabular ${inputClass}`} />
          )}
        </Field>
        <Field label={t("tool.field.monthlyDeposit")}>
          {(id) => (
            <input id={id} type="number" min={0} value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              className={`tabular ${inputClass}`} />
          )}
        </Field>
        <Field label={t("tool.field.interestRate")}>
          {(id) => (
            <input id={id} type="number" min={0} step={0.1} value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className={`tabular ${inputClass}`} />
          )}
        </Field>
        <Field label={t("tool.field.byMonths")} hint={t("tool.hint.byMonths")}>
          {(id) => (
            <input id={id} type="number" min={1} value={byMonths}
              onChange={(e) => setByMonths(Math.max(Number(e.target.value), 1))}
              className={`tabular ${inputClass}`} />
          )}
        </Field>
      </ToolFields>

      <ToolResult
        label={t("tool.result.timeToGoal")}
        value={
          result.reachable
            ? t("tool.result.monthsValue", {
                months: result.months,
                years: fmt.number(result.months / 12, { decimals: 1 }),
              })
            : t("tool.result.notReachable")
        }
        tone={result.reachable ? "primary" : "warning"}
      />

      <ToolFacts
        items={[
          { label: t("tool.result.totalDeposited"), value: fmt.currency(result.totalDeposited) },
          { label: t("tool.result.interestEarned"), value: fmt.currency(result.interest) },
          {
            label: t("tool.result.depositNeeded", { months: byMonths }),
            value: fmt.currency(needed),
          },
        ]}
      />
    </ToolCard>
  );
}

export function DebtPayoffTool() {
  const { t, fmt } = useLocale();
  const [balance, setBalance] = useState(5000);
  const [rate, setRate] = useState(19.9);
  const [payment, setPayment] = useState(200);

  const result = debtPayoff({ balance, annualRate: rate, payment });

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.balance")}>
          {(id) => (
            <input id={id} type="number" min={0} value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className={`tabular ${inputClass}`} />
          )}
        </Field>
        <Field label={t("tool.field.interestRate")}>
          {(id) => (
            <input id={id} type="number" min={0} step={0.1} value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className={`tabular ${inputClass}`} />
          )}
        </Field>
        <Field label={t("tool.field.monthlyPayment")}>
          {(id) => (
            <input id={id} type="number" min={0} value={payment}
              onChange={(e) => setPayment(Number(e.target.value))}
              className={`tabular ${inputClass}`} />
          )}
        </Field>
      </ToolFields>

      <ToolResult
        label={t("tool.result.timeToClear")}
        value={
          result.neverClears
            ? t("tool.result.neverClears")
            : t("tool.result.monthsValue", {
                months: result.months,
                years: fmt.number(result.months / 12, { decimals: 1 }),
              })
        }
        tone={result.neverClears ? "warning" : "primary"}
        detail={result.neverClears ? t("tool.result.neverClearsDetail") : undefined}
      />

      {result.neverClears ? null : (
        <ToolFacts
          items={[
            { label: t("tool.result.totalInterest"), value: fmt.currency(result.totalInterest) },
            { label: t("tool.result.totalPaid"), value: fmt.currency(result.totalPaid) },
            {
              label: t("tool.result.interestShare"),
              value: fmt.percent(
                result.totalPaid ? (result.totalInterest / result.totalPaid) * 100 : 0,
                { decimals: 1 },
              ),
            },
          ]}
        />
      )}
    </ToolCard>
  );
}
