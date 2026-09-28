"use client";

import { useState, useSyncExternalStore } from "react";

import {
  Field,
  ToolCard,
  ToolFacts,
  ToolFields,
  ToolResult,
  inputClass,
} from "@/components/tools/ToolShell";
import { plural } from "@/lib/i18n/core";
import { useLocale } from "@/lib/locale-context";
import {
  daysBetween,
  dayOfWeek,
  isoWeek,
  parseDate,
  toInputValue,
} from "@/lib/tools/dates";
import {
  divisorsOf,
  gcd,
  isPrime,
  lcm,
  numberToWords,
  primeFactors,
  wordsToNumber,
} from "@/lib/tools/numbers";

/**
 * A one-second clock for the countdown. The snapshot is rounded to the whole
 * second so React sees a stable value between ticks rather than a new number
 * on every read.
 */
function subscribeToClock(onTick: () => void): () => void {
  const timer = setInterval(onTick, 1000);
  return () => clearInterval(timer);
}

function readClock(): number {
  return Math.floor(Date.now() / 1000) * 1000;
}

/** Today in UTC, which is the basis every date tool works in. */
function today(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

const WEEKDAY_KEYS = [
  "weekday.sunday",
  "weekday.monday",
  "weekday.tuesday",
  "weekday.wednesday",
  "weekday.thursday",
  "weekday.friday",
  "weekday.saturday",
];

export function DayOfWeekTool() {
  const { t, fmt } = useLocale();
  const [value, setValue] = useState(() => toInputValue(today()));

  const date = parseDate(value);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.date")}>
          {(id) => (
            <input
              id={id}
              type="date"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
      </ToolFields>

      {date ? (
        <>
          <ToolResult
            label={t("tool.result.dayOfWeek")}
            value={t(WEEKDAY_KEYS[dayOfWeek(date)])}
            tone="primary"
          />
          <ToolFacts
            items={[
              {
                label: t("tool.result.isoWeek"),
                value: `${fmt.number(isoWeek(date).week)} / ${isoWeek(date).year}`,
              },
              {
                label: t("tool.result.dayOfYear"),
                value: fmt.number(
                  daysBetween(
                    new Date(Date.UTC(date.getUTCFullYear(), 0, 1)),
                    date,
                  ) + 1,
                ),
              },
              {
                label: t("tool.result.isWeekend"),
                value:
                  dayOfWeek(date) === 0 || dayOfWeek(date) === 6
                    ? t("common.yes")
                    : t("common.no"),
              },
              {
                label: t("tool.result.fromToday"),
                value: plural(t, fmt.locale, "tool.result.days", Math.abs(daysBetween(today(), date)), {
                  display: fmt.number(Math.abs(daysBetween(today(), date))),
                }),
              },
            ]}
          />
        </>
      ) : (
        <ToolResult label={t("tool.result.dayOfWeek")} value="—" tone="warning" />
      )}
    </ToolCard>
  );
}

export function CountdownTool() {
  const { t, fmt } = useLocale();
  const [target, setTarget] = useState(() => {
    const next = today();
    next.setUTCDate(next.getUTCDate() + 30);
    return toInputValue(next);
  });
  // The wall clock is an external store: subscribing ticks it once a second,
  // and the server snapshot is null so the static HTML and the first client
  // render agree.
  const now = useSyncExternalStore(subscribeToClock, readClock, () => null);

  const date = parseDate(target);
  const remaining = date && now !== null ? date.getTime() - now : null;
  const past = remaining !== null && remaining <= 0;
  const absolute = remaining === null ? 0 : Math.abs(remaining);

  const days = Math.floor(absolute / 86_400_000);
  const hours = Math.floor((absolute % 86_400_000) / 3_600_000);
  const minutes = Math.floor((absolute % 3_600_000) / 60_000);
  const seconds = Math.floor((absolute % 60_000) / 1000);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.targetDate")} hint={t("tool.hint.countdownUtc")}>
          {(id) => (
            <input
              id={id}
              type="date"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
      </ToolFields>

      {date && remaining !== null ? (
        <>
          <ToolResult
            label={past ? t("tool.result.timeSince") : t("tool.result.timeUntil")}
            value={t("tool.result.countdownValue", {
              days: fmt.number(days),
              hours: String(hours).padStart(2, "0"),
              minutes: String(minutes).padStart(2, "0"),
              seconds: String(seconds).padStart(2, "0"),
            })}
            tone={past ? "warning" : "primary"}
          />
          <ToolFacts
            items={[
              { label: t("tool.result.totalDays"), value: fmt.number(days) },
              { label: t("tool.result.totalHours"), value: fmt.number(Math.floor(absolute / 3_600_000)) },
              { label: t("tool.result.totalMinutes"), value: fmt.number(Math.floor(absolute / 60_000)) },
              { label: t("tool.result.totalWeeks"), value: fmt.number(Math.floor(days / 7)) },
            ]}
          />
        </>
      ) : (
        // Nothing until the clock starts, so the markup the server sent and
        // the first client render match.
        <ToolResult label={t("tool.result.timeUntil")} value="—" tone="primary" />
      )}
    </ToolCard>
  );
}

export function WordsToNumberTool() {
  const { t, fmt } = useLocale();
  const [text, setText] = useState("one thousand two hundred and thirty-four");

  const value = wordsToNumber(text);

  return (
    <ToolCard>
      <div className="space-y-1.5">
        <label htmlFor="words-input" className="block text-sm font-medium">
          {t("tool.field.numberWords")}
        </label>
        <input
          id="words-input"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className={inputClass}
        />
        <p className="text-xs text-muted">{t("tool.hint.numberWords")}</p>
      </div>

      <ToolResult
        label={t("tool.result.number")}
        value={value === null ? "—" : fmt.number(value)}
        tone={value === null ? "warning" : "primary"}
        detail={
          value === null
            ? t("tool.result.wordsUnreadable")
            : t("tool.result.wordsRoundTrip", { words: numberToWords(value) })
        }
      />
    </ToolCard>
  );
}

export function FactorFinderTool() {
  const { t, fmt } = useLocale();
  const [value, setValue] = useState(360);
  const [other, setOther] = useState(48);

  const divisors = divisorsOf(value);
  const factors = primeFactors(value);

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
              onChange={(event) => setValue(Math.max(Math.floor(Number(event.target.value)) || 0, 0))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <Field label={t("tool.field.secondNumber")} hint={t("tool.hint.secondNumber")}>
          {(id) => (
            <input
              id={id}
              type="number"
              min={1}
              value={other}
              onChange={(event) => setOther(Math.max(Math.floor(Number(event.target.value)) || 0, 0))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
      </ToolFields>

      <ToolResult
        label={t("tool.result.divisorCount")}
        value={fmt.number(divisors.length)}
        tone="primary"
        detail={
          isPrime(value)
            ? t("tool.result.primeExplain", { value: fmt.number(value) })
            : t("tool.result.factorDetail", { factors: factors.join(" × ") || "—" })
        }
      />

      <ToolFacts
        items={[
          { label: t("tool.result.primeFactors"), value: factors.join(" × ") || "—" },
          {
            label: t("tool.result.divisors"),
            value:
              divisors.slice(0, 20).join(", ") +
              (divisors.length > 20 ? ` … (+${divisors.length - 20})` : "") || "—",
          },
          { label: t("tool.result.gcd"), value: fmt.number(gcd(value, other)) },
          { label: t("tool.result.lcm"), value: fmt.number(lcm(value, other)) },
        ]}
      />
    </ToolCard>
  );
}

export function NumberFormatterTool() {
  const { t, fmt } = useLocale();
  const [value, setValue] = useState(1234567.891);
  const [decimals, setDecimals] = useState(2);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.number")}>
          {(id) => (
            <input
              id={id}
              type="number"
              value={value}
              onChange={(event) => setValue(Number(event.target.value) || 0)}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <Field label={t("tool.field.decimals")}>
          {(id) => (
            <input
              id={id}
              type="number"
              min={0}
              max={10}
              value={decimals}
              onChange={(event) =>
                setDecimals(Math.min(Math.max(Math.floor(Number(event.target.value)) || 0, 0), 10))
              }
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
      </ToolFields>

      <ToolResult
        label={t("tool.result.formatted")}
        value={fmt.number(value, { decimals })}
        tone="primary"
        detail={t("tool.result.formattedIn", { locale: fmt.locale })}
      />

      <ToolFacts
        items={[
          { label: t("tool.result.currencyForm"), value: fmt.currency(value) },
          { label: t("tool.result.shortForm"), value: fmt.currencyShort(value) },
          { label: t("tool.result.inWords"), value: numberToWords(value) || "—" },
          {
            label: t("tool.result.scientific"),
            value: Number.isFinite(value) ? value.toExponential(Math.min(decimals, 6)) : "—",
          },
        ]}
      />
    </ToolCard>
  );
}

const CATEGORY_KEYS = ["budget.needs", "budget.wants", "budget.savings"] as const;

export function BudgetPlannerTool() {
  const { t, fmt } = useLocale();
  const [income, setIncome] = useState(3000);
  // The 50/30/20 rule, which is what people look this up for.
  const [split, setSplit] = useState<[number, number, number]>([50, 30, 20]);

  const total = split[0] + split[1] + split[2];

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.monthlyIncome")} hint={t("tool.hint.afterTax")}>
          {(id) => (
            <input
              id={id}
              type="number"
              min={0}
              value={income}
              onChange={(event) => setIncome(Math.max(Number(event.target.value) || 0, 0))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        {CATEGORY_KEYS.map((key, index) => (
          <Field key={key} label={`${t(key)} (%)`}>
            {(id) => (
              <input
                id={id}
                type="number"
                min={0}
                max={100}
                value={split[index]}
                onChange={(event) => {
                  const next = [...split] as [number, number, number];
                  next[index] = Math.min(Math.max(Number(event.target.value) || 0, 0), 100);
                  setSplit(next);
                }}
                className={`tabular ${inputClass}`}
              />
            )}
          </Field>
        ))}
      </ToolFields>

      <ToolResult
        label={t("tool.result.leftOver")}
        value={fmt.currency((income * (100 - total)) / 100)}
        tone={total > 100 ? "warning" : "primary"}
        detail={
          total === 100
            ? t("tool.result.budgetBalanced")
            : t("tool.result.budgetUnbalanced", { total: fmt.number(total) })
        }
      />

      <ToolFacts
        items={[
          ...CATEGORY_KEYS.map((key, index) => ({
            label: `${t(key)} — ${fmt.number(split[index])}%`,
            value: fmt.currency((income * split[index]) / 100),
          })),
          {
            label: t("tool.result.savingsPerYear"),
            value: fmt.currency(((income * split[2]) / 100) * 12),
          },
        ]}
      />
    </ToolCard>
  );
}
