import { describe, expect, it } from 'vitest';

import { daysBetween, isCalendarDate, logLengthDays } from './dates';

describe('daysBetween', () => {
  it('is 0 on the same day', () => {
    expect(daysBetween('2026-09-23', '2026-09-23')).toBe(0);
  });

  it('counts across a DST change and month boundary', () => {
    expect(daysBetween('2026-10-30', '2026-11-02')).toBe(3);
  });

  it('counts across a leap day', () => {
    expect(daysBetween('2028-02-28', '2028-03-01')).toBe(2);
  });
});

describe('logLengthDays', () => {
  it('measures an open log to today', () => {
    expect(logLengthDays({ startDate: '2026-09-01', endDate: null }, '2026-09-23')).toBe(22);
  });

  it('measures a closed log to its end date', () => {
    expect(logLengthDays({ startDate: '2026-09-01', endDate: '2026-09-05' }, '2026-09-23')).toBe(4);
  });

  it('never goes negative for a future start date', () => {
    expect(logLengthDays({ startDate: '2026-10-01', endDate: null }, '2026-09-23')).toBe(0);
  });
});

describe('isCalendarDate', () => {
  it('rejects impossible dates', () => {
    expect(isCalendarDate('2026-02-30')).toBe(false);
    expect(isCalendarDate('2026-9-1')).toBe(false);
    expect(isCalendarDate('2026-09-01')).toBe(true);
  });
});
