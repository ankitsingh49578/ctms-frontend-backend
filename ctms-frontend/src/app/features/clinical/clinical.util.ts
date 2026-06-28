/**
 * Convert a Material datepicker `Date` to the backend's LocalDate wire format
 * (`YYYY-MM-DD`). Uses local calendar parts deliberately: `toISOString()` would
 * convert to UTC and can roll the date back a day for users behind UTC.
 */
export function toIsoDate(d: Date | null | undefined): string | undefined {
  if (!d) return undefined;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
