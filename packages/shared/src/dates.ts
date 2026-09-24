/**
 * Streak dates are calendar dates ("YYYY-MM-DD"), not timestamps. "Today" is
 * always the user's local date, so the client supplies it rather than the
 * server guessing a timezone.
 */
export type CalendarDate = string;

const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

export function isCalendarDate(value: string): value is CalendarDate {
  if (!CALENDAR_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

/** The local calendar date for a JS Date (defaults to now). */
export function toCalendarDate(date: Date = new Date()): CalendarDate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Whole days from `start` to `end`. Same day = 0. */
export function daysBetween(start: CalendarDate, end: CalendarDate): number {
  const a = Date.parse(`${start}T00:00:00Z`);
  const b = Date.parse(`${end}T00:00:00Z`);
  return Math.round((b - a) / MS_PER_DAY);
}

/** Length of one streak log. An open log (no end date) is measured to `today`. */
export function logLengthDays(
  log: { startDate: CalendarDate; endDate: CalendarDate | null },
  today: CalendarDate,
): number {
  return Math.max(0, daysBetween(log.startDate, log.endDate ?? today));
}
