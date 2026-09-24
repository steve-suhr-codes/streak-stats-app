const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-09-23" -> "Sep 23, 2026". Formatted by hand so it doesn't depend on Intl support in the JS engine. */
export function formatCalendarDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d}, ${y}`;
}
