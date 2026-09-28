"use client";

import { useState } from "react";

import {
  Field,
  ToolCard,
  ToolFacts,
  ToolFields,
  ToolResult,
  inputClass,
  selectClass,
} from "@/components/tools/ToolShell";
import type { Formatter } from "@/lib/format";
import { plural, type TranslateFn } from "@/lib/i18n/core";
import { useLocale } from "@/lib/locale-context";
import {
  addDays,
  addMonths,
  ageOn,
  calendarDifference,
  daysBetween,
  isoWeek,
  nextBirthday,
  parseDate,
  toInputValue,
  workingDaysBetween,
} from "@/lib/tools/dates";

/** Today in UTC, so the tools agree with their own arithmetic. */
function today(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
}

function useDateFormatter() {
  const { fmt } = useLocale();
  return (date: Date) =>
    new Intl.DateTimeFormat(fmt.locale, {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(date);
}

export function DateDifferenceTool() {
  const { t, fmt } = useLocale();
  const formatDate = useDateFormatter();

  const [from, setFrom] = useState(toInputValue(today()));
  const [to, setTo] = useState(toInputValue(addDays(today(), 30)));

  const start = parseDate(from);
  const end = parseDate(to);
  if (!start || !end) return <ToolCard>{t("tool.invalidDate")}</ToolCard>;

  const days = Math.abs(daysBetween(start, end));
  const calendar = calendarDifference(start, end);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.startDate")}>
          {(id) => (
            <input
              id={id}
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={t("tool.field.endDate")}>
          {(id) => (
            <input
              id={id}
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
      </ToolFields>

      <ToolResult
        label={t("tool.result.daysBetween")}
        value={plural(t, fmt.locale, "tool.result.days", days, { display: fmt.number(days) })}
        detail={t("tool.result.calendarSpan", spanParams(t, fmt, calendar))}
      />

      <ToolFacts
        items={[
          { label: t("tool.result.weeks"), value: fmt.number(days / 7, { decimals: 1 }) },
          { label: t("tool.result.workingDays"), value: fmt.number(workingDaysBetween(start, end)) },
          { label: t("tool.field.startDate"), value: formatDate(start) },
          { label: t("tool.field.endDate"), value: formatDate(end) },
        ]}
      />
    </ToolCard>
  );
}

export function AddDaysTool() {
  const { t } = useLocale();
  const formatDate = useDateFormatter();

  const [start, setStart] = useState(toInputValue(today()));
  const [amount, setAmount] = useState(30);
  const [unit, setUnit] = useState<"days" | "weeks" | "months">("days");
  const [direction, setDirection] = useState<1 | -1>(1);

  const date = parseDate(start);
  if (!date) return <ToolCard>{t("tool.invalidDate")}</ToolCard>;

  const offset = amount * direction;
  const result =
    unit === "months"
      ? addMonths(date, offset)
      : addDays(date, unit === "weeks" ? offset * 7 : offset);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.startDate")}>
          {(id) => (
            <input
              id={id}
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={t("tool.field.amount")}>
          {(id) => (
            <input
              id={id}
              type="number"
              min={0}
              value={amount}
              onChange={(event) => setAmount(Math.max(Number(event.target.value), 0))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <Field label={t("tool.field.unit")}>
          {(id) => (
            <select
              id={id}
              value={unit}
              onChange={(event) => setUnit(event.target.value as typeof unit)}
              className={selectClass}
            >
              <option value="days">{t("units.days")}</option>
              <option value="weeks">{t("units.weeks")}</option>
              <option value="months">{t("units.monthsLong")}</option>
            </select>
          )}
        </Field>
        <Field label={t("tool.field.direction")}>
          {(id) => (
            <select
              id={id}
              value={direction}
              onChange={(event) => setDirection(Number(event.target.value) as 1 | -1)}
              className={selectClass}
            >
              <option value={1}>{t("tool.option.add")}</option>
              <option value={-1}>{t("tool.option.subtract")}</option>
            </select>
          )}
        </Field>
      </ToolFields>

      <ToolResult label={t("tool.result.resultingDate")} value={formatDate(result)} />

      <ToolFacts
        items={[
          {
            label: t("tool.result.dayOfWeek"),
            value: new Intl.DateTimeFormat(undefined, {
              weekday: "long",
              timeZone: "UTC",
            }).format(result),
          },
          { label: t("tool.result.isoDate"), value: toInputValue(result) },
        ]}
      />
    </ToolCard>
  );
}

export function WorkingDaysTool() {
  const { t, fmt } = useLocale();

  const [from, setFrom] = useState(toInputValue(today()));
  const [to, setTo] = useState(toInputValue(addDays(today(), 30)));
  const [holidays, setHolidays] = useState(0);

  const start = parseDate(from);
  const end = parseDate(to);
  if (!start || !end) return <ToolCard>{t("tool.invalidDate")}</ToolCard>;

  const working = Math.max(workingDaysBetween(start, end) - holidays, 0);
  const total = Math.abs(daysBetween(start, end)) + 1;

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.startDate")}>
          {(id) => (
            <input
              id={id}
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={t("tool.field.endDate")}>
          {(id) => (
            <input
              id={id}
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={t("tool.field.holidays")} hint={t("tool.hint.holidays")}>
          {(id) => (
            <input
              id={id}
              type="number"
              min={0}
              value={holidays}
              onChange={(event) => setHolidays(Math.max(Number(event.target.value), 0))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
      </ToolFields>

      <ToolResult
        label={t("tool.result.workingDays")}
        value={fmt.number(working)}
      />

      <ToolFacts
        items={[
          { label: t("tool.result.totalDays"), value: fmt.number(total) },
          { label: t("tool.result.weekendDays"), value: fmt.number(total - workingDaysBetween(start, end)) },
        ]}
      />
    </ToolCard>
  );
}

export function AgeTool() {
  const { t, fmt } = useLocale();
  const formatDate = useDateFormatter();

  const [birth, setBirth] = useState("1990-01-01");
  const [on, setOn] = useState(toInputValue(today()));

  const born = parseDate(birth);
  const at = parseDate(on);
  if (!born || !at) return <ToolCard>{t("tool.invalidDate")}</ToolCard>;

  const age = ageOn(born, at);
  const next = nextBirthday(born, at);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.birthDate")}>
          {(id) => (
            <input
              id={id}
              type="date"
              value={birth}
              onChange={(event) => setBirth(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={t("tool.field.onDate")}>
          {(id) => (
            <input
              id={id}
              type="date"
              value={on}
              onChange={(event) => setOn(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
      </ToolFields>

      <ToolResult
        label={t("tool.result.age")}
        value={t("tool.result.ageValue", spanParams(t, fmt, age))}
      />

      <ToolFacts
        items={[
          { label: t("tool.result.totalDays"), value: fmt.number(age.totalDays) },
          { label: t("tool.result.totalWeeks"), value: fmt.number(Math.floor(age.totalDays / 7)) },
          { label: t("tool.result.nextBirthday"), value: formatDate(next) },
          {
            label: t("tool.result.daysToBirthday"),
            value: fmt.number(daysBetween(at, next)),
          },
        ]}
      />
    </ToolCard>
  );
}

export function WeekNumberTool() {
  const { t, fmt } = useLocale();
  const formatDate = useDateFormatter();
  const [value, setValue] = useState(toInputValue(today()));

  const date = parseDate(value);
  if (!date) return <ToolCard>{t("tool.invalidDate")}</ToolCard>;

  const { week, year } = isoWeek(date);
  const dayOfYear =
    daysBetween(new Date(Date.UTC(date.getUTCFullYear(), 0, 1)), date) + 1;

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

      <ToolResult
        label={t("tool.result.weekNumber")}
        value={t("tool.result.weekValue", { week, year })}
      />

      <ToolFacts
        items={[
          {
            label: t("tool.result.dayOfWeek"),
            value: new Intl.DateTimeFormat(undefined, {
              weekday: "long",
              timeZone: "UTC",
            }).format(date),
          },
          { label: t("tool.result.dayOfYear"), value: fmt.number(dayOfYear) },
          { label: t("tool.field.date"), value: formatDate(date) },
        ]}
      />
    </ToolCard>
  );
}

/** "2 years", "1 month", "0 days": each part of a span in its plural form. */
function spanParams(
  t: TranslateFn,
  fmt: Formatter,
  span: { years: number; months: number; days: number },
): Record<string, string> {
  const part = (unit: "years" | "months" | "days") =>
    plural(t, fmt.locale, `tool.duration.${unit}`, span[unit], { display: fmt.number(span[unit]) });
  return { years: part("years"), months: part("months"), days: part("days") };
}
