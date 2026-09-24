import { toCalendarDate, type CalendarDate } from '@streak-stats/shared';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** The local calendar date, refreshed when the app returns to the foreground (e.g. the next morning). */
export function useToday(): CalendarDate {
  const [today, setToday] = useState(toCalendarDate);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(toCalendarDate());
    });
    return () => sub.remove();
  }, []);

  return today;
}
