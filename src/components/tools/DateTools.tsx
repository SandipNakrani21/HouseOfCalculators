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
  isSupportedDate,
  nextBirthday,
  parseDate,
  startOfYear,
  toInputValue,
  workingDaysBetween,
} from "@/lib/tools/dates";

/** Today in UTC, so the tools agree with their own arithmetic. */
function today(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function useDateFormatter() {
  const { fmt } = useLocale();
  return (date: Date) =>
    isSupportedDate(date) ? new Intl.DateTimeFormat(fmt.locale, {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(date) : "—";
}

export function DateDifferenceTool() {
  const { t, fmt } = useLocale();
  const formatDate = useDateFormatter();

  const [from, setFrom] = useState(toInputValue(today()));
  const [to, setTo] = useState(toInputValue(addDays(today(), 30)));

  const valid = !!parseDate(from) && !!parseDate(to);
  const start = parseDate(from) ?? today();
  const end = parseDate(to) ?? today();

  const days = Math.abs(daysBetween(start, end));
  const calendar = calendarDifference(start, end);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.startDate")} error={!parseDate(from) ? t("tool.invalidDate") : undefined}>
          {(id) => (
            <input
              id={id}
              type="date"
              min="0001-01-01" max="9999-12-31"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={t("tool.field.endDate")} error={!parseDate(to) ? t("tool.invalidDate") : undefined}>
          {(id) => (
            <input
              id={id}
              type="date"
              min="0001-01-01" max="9999-12-31"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
      </ToolFields>

      {valid ? (
        <>
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
        </>
      ) : (
        <p role="status" className="mt-6 rounded-md bg-bg-soft p-4 text-alert">{t("tool.invalidDate")}</p>
      )}
    </ToolCard>
  );
}

export function AddDaysTool() {
  const { t, fmt } = useLocale();
  const formatDate = useDateFormatter();

  const [start, setStart] = useState(toInputValue(today()));
  const [amount, setAmount] = useState(30);
  const [unit, setUnit] = useState<"days" | "weeks" | "months">("days");
  const [direction, setDirection] = useState<1 | -1>(1);

  const validStart = !!parseDate(start);
  const date = parseDate(start) ?? today();

  const offset = amount * direction;
  const result =
    unit === "months"
      ? addMonths(date, offset)
      : addDays(date, unit === "weeks" ? offset * 7 : offset);
  const valid = validStart && isSupportedDate(result);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.startDate")} error={!parseDate(start) ? t("tool.invalidDate") : undefined}>
          {(id) => (
            <input
              id={id}
              type="date"
              min="0001-01-01" max="9999-12-31"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={t("tool.field.amount")} error={validStart && !isSupportedDate(result) ? t("validation.dateRange") : undefined}>
          {(id) => (
            <NumberInput rule="amount"
              id={id}
              type="number"
              min={0}
              value={amount}
              onValueChange={(next) => setAmount(Math.max(next, 0))}
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

      {valid ? (
        <>
          <ToolResult label={t("tool.result.resultingDate")} value={formatDate(result)} />

          <ToolFacts
            items={[
              {
                label: t("tool.result.dayOfWeek"),
                value: new Intl.DateTimeFormat(fmt.locale, {
                  weekday: "long",
                  timeZone: "UTC",
                }).format(result),
              },
              { label: t("tool.result.isoDate"), value: toInputValue(result) },
            ]}
          />
        </>
      ) : (
        <p role="status" className="mt-6 rounded-md bg-bg-soft p-4 text-alert">{t(validStart ? "validation.dateRange" : "tool.invalidDate")}</p>
      )}
    </ToolCard>
  );
}

export function WorkingDaysTool() {
  const { t, fmt } = useLocale();

  const [from, setFrom] = useState(toInputValue(today()));
  const [to, setTo] = useState(toInputValue(addDays(today(), 30)));
  const [holidays, setHolidays] = useState(0);

  const valid = !!parseDate(from) && !!parseDate(to);
  const start = parseDate(from) ?? today();
  const end = parseDate(to) ?? today();

  const working = Math.max(workingDaysBetween(start, end) - holidays, 0);
  const total = Math.abs(daysBetween(start, end)) + 1;

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.startDate")} error={!parseDate(from) ? t("tool.invalidDate") : undefined}>
          {(id) => (
            <input
              id={id}
              type="date"
              min="0001-01-01" max="9999-12-31"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={t("tool.field.endDate")} error={!parseDate(to) ? t("tool.invalidDate") : undefined}>
          {(id) => (
            <input
              id={id}
              type="date"
              min="0001-01-01" max="9999-12-31"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={t("tool.field.holidays")} hint={t("tool.hint.holidays")}>
          {(id) => (
            <NumberInput rule="holidays"
              id={id}
              type="number"
              min={0}
              max={workingDaysBetween(start, end)}
              value={holidays}
              onValueChange={(next) => setHolidays(Math.max(next, 0))}
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
      </ToolFields>

      {valid ? (
        <>
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
        </>
      ) : (
        <p role="status" className="mt-6 rounded-md bg-bg-soft p-4 text-alert">{t("tool.invalidDate")}</p>
      )}
    </ToolCard>
  );
}

export function AgeTool() {
  const { t, fmt } = useLocale();
  const formatDate = useDateFormatter();

  const [birth, setBirth] = useState("1990-01-01");
  const [on, setOn] = useState(toInputValue(today()));

  const future = !!parseDate(birth) && !!parseDate(on) && parseDate(birth)! > parseDate(on)!;
  const valid = !!parseDate(birth) && !!parseDate(on) && !future;
  const born = parseDate(birth) ?? today();
  const at = parseDate(on) ?? today();

  const age = ageOn(born, at);
  const next = nextBirthday(born, at);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.birthDate")} error={future ? t("validation.futureBirth") : !parseDate(birth) ? t("tool.invalidDate") : undefined}>
          {(id) => (
            <input
              id={id}
              type="date"
              min="0001-01-01" max="9999-12-31"
              value={birth}
              onChange={(event) => setBirth(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={t("tool.field.onDate")} error={!parseDate(on) ? t("tool.invalidDate") : undefined}>
          {(id) => (
            <input
              id={id}
              type="date"
              min="0001-01-01" max="9999-12-31"
              value={on}
              onChange={(event) => setOn(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
      </ToolFields>

      {valid ? (
        <>
          <ToolResult
            label={t("tool.result.age")}
            value={t("tool.result.ageValue", spanParams(t, fmt, age))}
          />

          <ToolFacts
            items={[
              { label: t("tool.result.totalDays"), value: fmt.number(age.totalDays) },
              { label: t("tool.result.totalWeeks"), value: fmt.number(Math.floor(age.totalDays / 7)) },
              { label: t("tool.result.nextBirthday"), value: isSupportedDate(next) ? formatDate(next) : t("tool.nextBirthdayOutOfRange") },
              {
                label: t("tool.result.daysToBirthday"),
                value: isSupportedDate(next) ? fmt.number(daysBetween(at, next)) : "—",
              },
            ]}
          />
        </>
      ) : (
        <p role="status" className="mt-6 rounded-md bg-bg-soft p-4 text-alert">{t(future ? "validation.futureBirth" : "tool.invalidDate")}</p>
      )}
    </ToolCard>
  );
}

export function WeekNumberTool() {
  const { t, fmt } = useLocale();
  const formatDate = useDateFormatter();
  const [value, setValue] = useState(toInputValue(today()));

  const valid = !!parseDate(value);
  const date = parseDate(value) ?? today();

  const { week, year } = isoWeek(date);
  const dayOfYear =
    daysBetween(startOfYear(date), date) + 1;

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.date")} error={!parseDate(value) ? t("tool.invalidDate") : undefined}>
          {(id) => (
            <input
              id={id}
              type="date"
              min="0001-01-01" max="9999-12-31"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
      </ToolFields>

      {valid ? (
        <>
          <ToolResult
            label={t("tool.result.weekNumber")}
            value={t("tool.result.weekValue", { week, year })}
          />

          <ToolFacts
            items={[
              {
                label: t("tool.result.dayOfWeek"),
                value: new Intl.DateTimeFormat(fmt.locale, {
                  weekday: "long",
                  timeZone: "UTC",
                }).format(date),
              },
              { label: t("tool.result.dayOfYear"), value: fmt.number(dayOfYear) },
              { label: t("tool.field.date"), value: formatDate(date) },
            ]}
          />
        </>
      ) : (
        <p role="status" className="mt-6 rounded-md bg-bg-soft p-4 text-alert">{t("tool.invalidDate")}</p>
      )}
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
