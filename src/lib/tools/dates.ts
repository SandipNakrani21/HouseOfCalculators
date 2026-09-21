/**
 * Date arithmetic for the date and time tools.
 *
 * Everything works in UTC. Local time would make "days between" wrong across
 * a daylight-saving boundary - the two dates would be 23 or 25 hours apart and
 * the division would drop or gain a day.
 */

const MS_PER_DAY = 86_400_000;

/** Parses a `YYYY-MM-DD` value from a date input into a UTC date. */
export function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );
  // Rejects impossible dates such as 2025-02-30, which Date would roll over.
  return date.getUTCMonth() === Number(month) - 1 ? date : null;
}

export function toInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/**
 * Adds calendar months, clamping the day rather than rolling over: one month
 * after 31 January is 28 February, not 3 March.
 */
export function addMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, lastDay)));
}

/**
 * Calendar difference, expressed the way people say it.
 *
 * Counted by whole `addMonths` steps rather than by borrowing days from the
 * previous month. Borrowing looks simpler but breaks whenever the start day is
 * later than the borrowed month is long: 31 January to 1 March borrowed only
 * February's 28 days and reported "1 month and -2 days". Stepping instead
 * reuses the clamping rule already defined above, so the two agree by
 * construction - 31 January plus one month is 28 February, and the remainder
 * is counted from there.
 */
export function calendarDifference(
  from: Date,
  to: Date,
): { years: number; months: number; days: number } {
  const [start, end] = from <= to ? [from, to] : [to, from];

  let months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth());

  // The month count overshoots when the end day falls before the anniversary.
  if (addMonths(start, months) > end) months -= 1;

  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days: daysBetween(addMonths(start, months), end),
  };
}

/** Whole days excluding Saturdays and Sundays, counting both endpoints. */
export function workingDaysBetween(from: Date, to: Date): number {
  const [start, end] = from <= to ? [from, to] : [to, from];
  const total = daysBetween(start, end) + 1;

  const fullWeeks = Math.floor(total / 7);
  let count = fullWeeks * 5;

  // Walk the remaining days rather than trying to close-form the edge cases.
  const remainder = total % 7;
  for (let i = 0; i < remainder; i += 1) {
    const day = addDays(start, fullWeeks * 7 + i).getUTCDay();
    if (day !== 0 && day !== 6) count += 1;
  }
  return count;
}

/** ISO 8601 week number: weeks start on Monday and week 1 holds 4 January. */
export function isoWeek(date: Date): { week: number; year: number } {
  const target = new Date(date.getTime());
  // Shift to the Thursday of this week, which always sits in the ISO year.
  const dayOfWeek = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayOfWeek + 3);

  const isoYear = target.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  const firstDayOfWeek = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayOfWeek + 3);

  const week =
    1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * MS_PER_DAY));
  return { week, year: isoYear };
}

/** Day of the week as an index, 0 = Sunday, matching Intl's ordering. */
export function dayOfWeek(date: Date): number {
  return date.getUTCDay();
}

/** Age in whole years, plus the months and days past the last birthday. */
export function ageOn(
  birth: Date,
  on: Date,
): { years: number; months: number; days: number; totalDays: number } {
  return {
    ...calendarDifference(birth, on),
    totalDays: Math.max(daysBetween(birth, on), 0),
  };
}

/** The next anniversary of `birth` on or after `on`. */
export function nextBirthday(birth: Date, on: Date): Date {
  const candidate = new Date(
    Date.UTC(on.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate()),
  );
  return candidate >= on
    ? candidate
    : new Date(
        Date.UTC(on.getUTCFullYear() + 1, birth.getUTCMonth(), birth.getUTCDate()),
      );
}
